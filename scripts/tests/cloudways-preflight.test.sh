#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
preflight="$repo_root/scripts/cloudways-preflight.sh"
workflow="$repo_root/.github/workflows/deploy.yml"
test_root="$(mktemp -d "${TMPDIR:-/tmp}/pacematcher-preflight.XXXXXX")"
test_root="$(cd "$test_root" && pwd -P)"
marker_text="PaceMatcher Cloudways deployment marker. Keep this file in the deployed document root."

cleanup() {
  rm -rf "$test_root"
}
trap cleanup EXIT

encode_manifest() {
  base64 < "$1" | tr -d '\n'
}

write_artifact() {
  local artifact="$1"
  local label="$2"
  mkdir -p "$artifact/assets" "$artifact/images"
  printf '<h1>%s</h1>\n' "$label" > "$artifact/index.html"
  printf 'console.log("%s")\n' "$label" > "$artifact/assets/app.js"
  printf 'image-%s\n' "$label" > "$artifact/images/runner.webp"
  printf '%s\n' "$marker_text" > "$artifact/.pacematcher-deploy"
  printf '%s\n' \
    '.pacematcher-deploy' \
    '.pacematcher-managed-paths' \
    'assets/app.js' \
    'images/runner.webp' \
    'index.html' | LC_ALL=C sort > "$artifact/.pacematcher-managed-paths"
}

preflight_line="$(grep -n 'scripts/cloudways-preflight.sh' "$workflow" | cut -d: -f1)"
assets_line="$(grep -n "include='/assets/" "$workflow" | cut -d: -f1)"
index_line="$(grep -n "include='/index.html'" "$workflow" | cut -d: -f1)"
manifest_finalize_line="$(grep -n 'mv .*managed-paths.stage' "$workflow" | cut -d: -f1)"
if [[ -z "$preflight_line" || -z "$assets_line" || -z "$index_line" || -z "$manifest_finalize_line" ]]; then
  printf 'FAIL: workflow ordering markers are missing\n' >&2
  exit 1
fi
[[ "$preflight_line" -lt "$assets_line" ]] || { printf 'FAIL: assets must follow preflight\n' >&2; exit 1; }
[[ "$assets_line" -lt "$index_line" ]] || { printf 'FAIL: index must follow assets\n' >&2; exit 1; }
[[ "$index_line" -lt "$manifest_finalize_line" ]] || { printf 'FAIL: manifest must finalize after index\n' >&2; exit 1; }
printf 'PASS: workflow orders preflight, assets, index, then manifest finalization\n'

run_preflight() {
  local artifact="$1"
  local target="$2"
  local encoded
  encoded="$(encode_manifest "$artifact/.pacematcher-managed-paths")"
  bash "$preflight" "$target" "$encoded"
}

simulate_transfer() {
  local artifact="$1"
  local target="$2"
  mkdir -p "$target/assets" "$target/images"
  cp "$artifact/assets/app.js" "$target/assets/app.js"
  cp "$artifact/images/runner.webp" "$target/images/runner.webp"
  cp "$artifact/index.html" "$target/index.html"
  mv "$target/.pacematcher-managed-paths.stage" "$target/.pacematcher-managed-paths"
}

expect_failure() {
  local label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    printf 'FAIL: %s unexpectedly succeeded\n' "$label" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$label"
}

artifact_one="$test_root/artifact-one"
artifact_two="$test_root/artifact-two"
target_repeat="$test_root/repeat/public_html"
write_artifact "$artifact_one" "release-one"
write_artifact "$artifact_two" "release-two"

run_preflight "$artifact_one" "$target_repeat" >/dev/null
simulate_transfer "$artifact_one" "$target_repeat"
run_preflight "$artifact_two" "$target_repeat" >/dev/null
simulate_transfer "$artifact_two" "$target_repeat"
[[ "$(cat "$target_repeat/index.html")" == "<h1>release-two</h1>" ]]
grep -Fqx "assets/app.js" "$target_repeat/.pacematcher-managed-paths"
printf 'PASS: initial empty root and repeated release\n'

target_bootstrap="$test_root/bootstrap/public_html"
mkdir -p "$target_bootstrap/legal"
printf '%s\n' "$marker_text" > "$target_bootstrap/.pacematcher-deploy"
printf 'existing policy\n' > "$target_bootstrap/legal/privacy.html"
run_preflight "$artifact_one" "$target_bootstrap" >/dev/null
simulate_transfer "$artifact_one" "$target_bootstrap"
[[ "$(cat "$target_bootstrap/legal/privacy.html")" == "existing policy" ]]
printf 'PASS: owner-marked first release preserves existing legal files\n'

target_collision="$test_root/collision/public_html"
mkdir -p "$target_collision"
printf '%s\n' "$marker_text" > "$target_collision/.pacematcher-deploy"
printf 'owner-approved-before-migration\n' > "$target_collision/index.html"
collision_before="$(shasum -a 256 "$target_collision/index.html" | awk '{print $1}')"
expect_failure "initial unmanaged collision rejection" run_preflight "$artifact_one" "$target_collision"
collision_after="$(shasum -a 256 "$target_collision/index.html" | awk '{print $1}')"
[[ "$collision_before" == "$collision_after" ]]
printf 'PASS: colliding file was not changed\n'

target_symlink="$test_root/symlink/public_html"
mkdir -p "$target_symlink/assets"
printf '%s\n' "$marker_text" > "$target_symlink/.pacematcher-deploy"
printf '%s\n' '.pacematcher-deploy' '.pacematcher-managed-paths' 'assets/app.js' 'images/runner.webp' 'index.html' > "$target_symlink/.pacematcher-managed-paths"
ln -s "$test_root/external-assets" "$target_symlink/assets-link"
printf '%s\n' '.pacematcher-deploy' '.pacematcher-managed-paths' 'assets-link/app.js' 'index.html' > "$artifact_one/.pacematcher-managed-paths"
expect_failure "destination parent symlink rejection" run_preflight "$artifact_one" "$target_symlink"
write_artifact "$artifact_one" "release-one"

target_preserve="$test_root/preserve/public_html"
mkdir -p "$target_preserve/assets" "$target_preserve/images" "$target_preserve/legal"
printf '%s\n' "$marker_text" > "$target_preserve/.pacematcher-deploy"
printf 'old-site\n' > "$target_preserve/index.html"
printf 'old-asset\n' > "$target_preserve/assets/app.js"
printf 'old-image\n' > "$target_preserve/images/runner.webp"
printf 'unrelated legal page\n' > "$target_preserve/legal/privacy.html"
cp "$artifact_one/.pacematcher-managed-paths" "$target_preserve/.pacematcher-managed-paths"
legal_before="$(shasum -a 256 "$target_preserve/legal/privacy.html" | awk '{print $1}')"
run_preflight "$artifact_two" "$target_preserve" >/dev/null
simulate_transfer "$artifact_two" "$target_preserve"
legal_after="$(shasum -a 256 "$target_preserve/legal/privacy.html" | awk '{print $1}')"
[[ "$legal_before" == "$legal_after" ]]
[[ "$(cat "$target_preserve/index.html")" == "<h1>release-two</h1>" ]]
printf 'PASS: unrelated legal file preservation\n'

printf 'All Cloudways preflight filesystem tests passed.\n'
