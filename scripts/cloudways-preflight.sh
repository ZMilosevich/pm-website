#!/usr/bin/env bash
set -euo pipefail

marker_text="PaceMatcher Cloudways deployment marker. Keep this file in the deployed document root."
deploy_path="${1:-}"
encoded_manifest="${2:-}"

fail() {
  printf 'PaceMatcher preflight rejected the target: %s\n' "$1" >&2
  exit 1
}

decode_base64() {
  if printf 'AA==' | base64 --decode >/dev/null 2>&1; then
    base64 --decode
  else
    base64 -D
  fi
}

validate_relative_path() {
  local candidate="$1"
  [[ -n "$candidate" ]] || fail "managed manifest contains an empty path"
  [[ "$candidate" != /* ]] || fail "managed manifest contains an absolute path: $candidate"
  [[ "/$candidate/" != *"/../"* && "/$candidate/" != *"/./"* ]] ||
    fail "managed manifest contains a relative segment: $candidate"
  [[ "$candidate" =~ ^[A-Za-z0-9._/-]+$ ]] ||
    fail "managed manifest contains unsupported characters: $candidate"
}

[[ "$deploy_path" =~ ^/[A-Za-z0-9._/-]+/public_html$ ]] ||
  fail "deploy path must be absolute and end in public_html"
[[ "/$deploy_path/" != *"/../"* && "/$deploy_path/" != *"/./"* ]] ||
  fail "deploy path contains a relative segment"
[[ "$encoded_manifest" =~ ^[A-Za-z0-9+/=]+$ ]] ||
  fail "desired managed-path manifest is missing or invalid"

relative_deploy_path="${deploy_path#/}"
current_path=""
IFS='/' read -r -a deploy_parts <<< "$relative_deploy_path"
for part in "${deploy_parts[@]}"; do
  [[ -n "$part" ]] || continue
  current_path="$current_path/$part"
  [[ ! -L "$current_path" ]] || fail "deploy path or parent is a symbolic link: $current_path"
done

if [[ -e "$deploy_path" && ! -d "$deploy_path" ]]; then
  fail "deploy path exists and is not a directory"
fi

mkdir -p "$deploy_path"
marker_path="$deploy_path/.pacematcher-deploy"
managed_manifest="$deploy_path/.pacematcher-managed-paths"
staged_manifest="$deploy_path/.pacematcher-managed-paths.stage"

if [[ -L "$marker_path" || -L "$managed_manifest" || -L "$staged_manifest" ]]; then
  fail "a manifest or ownership marker is a symbolic link"
fi

if [[ -f "$marker_path" ]]; then
  [[ "$(cat "$marker_path")" == "$marker_text" ]] ||
    fail "remote ownership marker does not match PaceMatcher"
elif [[ -n "$(find "$deploy_path" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  fail "non-empty target has no PaceMatcher ownership marker"
else
  printf '%s\n' "$marker_text" > "$marker_path"
fi

temporary_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$temporary_dir"
}
trap cleanup EXIT

desired_manifest="$temporary_dir/desired-manifest"
printf '%s' "$encoded_manifest" | decode_base64 > "$desired_manifest"
[[ -s "$desired_manifest" ]] || fail "desired managed-path manifest is empty"

previous_managed_paths="$temporary_dir/previous-managed-paths"
authorized_paths="$temporary_dir/authorized-paths"
: > "$previous_managed_paths"
: > "$authorized_paths"

# The exact marker was validated (or created) above. Authorize only this
# control file for bootstrap; it never grants ownership of application files.
printf '%s\n' '.pacematcher-deploy' >> "$previous_managed_paths"
printf '%s\n' '.pacematcher-deploy' >> "$authorized_paths"

load_managed_paths() {
  local manifest_file="$1"
  local candidate
  [[ -e "$manifest_file" ]] || return 0
  [[ -f "$manifest_file" && ! -L "$manifest_file" ]] ||
    fail "managed-path manifest is not a regular file"
  while IFS= read -r candidate || [[ -n "$candidate" ]]; do
    validate_relative_path "$candidate"
    printf '%s\n' "$candidate" >> "$previous_managed_paths"
    printf '%s\n' "$candidate" >> "$authorized_paths"
  done < "$manifest_file"
}

load_managed_paths "$managed_manifest"
load_managed_paths "$staged_manifest"

while IFS= read -r candidate || [[ -n "$candidate" ]]; do
  validate_relative_path "$candidate"
  printf '%s\n' "$candidate" >> "$authorized_paths"
done < "$desired_manifest"

LC_ALL=C sort -u "$previous_managed_paths" -o "$previous_managed_paths"
LC_ALL=C sort -u "$authorized_paths" -o "$authorized_paths"

while IFS= read -r relative_destination; do
  validate_relative_path "$relative_destination"
  destination="$deploy_path/$relative_destination"

  parent_relative="$(dirname "$relative_destination")"
  if [[ "$parent_relative" != "." ]]; then
    current_path="$deploy_path"
    IFS='/' read -r -a parent_parts <<< "$parent_relative"
    for part in "${parent_parts[@]}"; do
      current_path="$current_path/$part"
      [[ ! -L "$current_path" ]] ||
        fail "destination parent is a symbolic link: $relative_destination"
      [[ ! -e "$current_path" || -d "$current_path" ]] ||
        fail "destination parent is not a directory: $relative_destination"
    done
  fi

  [[ ! -L "$destination" ]] ||
    fail "destination is a symbolic link: $relative_destination"

  if [[ -e "$destination" ]] && ! grep -Fqx -- "$relative_destination" "$previous_managed_paths"; then
    fail "pre-existing destination is not in a previously managed manifest: $relative_destination"
  fi
done < "$desired_manifest"

cp "$authorized_paths" "$staged_manifest"

printf 'PaceMatcher preflight passed for %s managed destinations.\n' "$(wc -l < "$desired_manifest" | tr -d ' ')"
