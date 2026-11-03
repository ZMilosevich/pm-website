# PaceMatcher legal pages implementation report

## Status

**BLOCKED** on production delivery through the existing Cloudways workflow.

The feature is implemented and verified in the build, static `dist` server, and Vite
preview. The checked-in deployment workflow cannot upload either nested HTML entry,
so production will retain the existing hosted legal routes until that workflow is
expanded under separately authorized scope.

## Task and workspace

- Task ID: `/root/pacematcher_legal_pages`
- Workspace: `/Users/zmilosevich/Desktop/Work/pm-web-v2`
- Baseline: `6da0ee4944c4ac950df6af91ec01d4c271685826`
- Coordinator-owned `PLAN.md` and `CHECKPOINT.md` were preserved without edits.

## Implemented behavior

- Added real static entry points for `/privacy-policy/` and `/terms-of-service/`.
  Vite emits nested `index.html` files and records both in
  `.pacematcher-managed-paths`.
- Added a shared, responsive legal layout with a sticky home control, clear
  "Back to home" action, skip link, semantic article headings, lists, and a
  keyboard-visible focus treatment.
- Added the complete Privacy Policy source copy: the August 11, 2026 date, 13
  numbered sections, all subheadings and lists, `privacy@pacematcher.com`, and
  the source's verification-data retention statements.
- Added the complete Terms of Service source copy: the May 4, 2026 date, 17
  numbered sections, all paragraphs and prohibited-conduct items,
  `support@pacematcher.com`, and the source platform links.
- Changed the footer Privacy and Terms destinations, plus the Safety section's
  privacy link, to local trailing-slash paths. The footer logo now reaches `/`
  from legal pages.
- The Terms Privacy Policy reference keeps its published visible URL while
  linking to `/privacy-policy/`.
- Removed the `serve --single` rewrite from `npm start`, because it always
  returned the home entry for nested route requests. Vite preview and the static
  server now resolve the emitted legal entries directly.
- Updated the existing home browser QA destinations to expect the local legal
  paths. Unrelated home-page visual values were left at their baseline.

## Changed paths

- `package.json`
- `vite.config.ts`
- `privacy-policy/index.html`
- `terms-of-service/index.html`
- `src/config.ts`
- `src/components/Footer.tsx`
- `src/components/LegalPage.tsx`
- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/TermsOfServicePage.tsx`
- `src/privacy-main.tsx`
- `src/terms-main.tsx`
- `src/styles/global.css`
- `scripts/browser-qa.cjs`
- `docs/agent-work/pacematcher-legal-pages/legal-pages-browser-qa.cjs`
- `docs/agent-work/pacematcher-legal-pages/qa/**`
- `docs/agent-work/pacematcher-legal-pages/IMPLEMENTATION_REPORT.md`

No workflow, hosting, credential, production, commit, push, or deployment state
was changed.

## Source fidelity

The source was retrieved from both public pages on November 3, 2026. A block
comparison against the rendered 1440px document checked:

- Privacy Policy: 191 source paragraph, heading, and list-item blocks; 0 missing.
- Terms of Service: 51 source paragraph, heading, and list-item blocks; 0 missing
  after normalizing the source's markdown heading/link notation and its
  dash-delimited prohibited-conduct list into semantic HTML.

Details are in `qa/source-copy-comparison.txt`.

## Verification

| Command | Exit | Result |
| --- | --- | --- |
| `npm run typecheck` | 0 | TypeScript passed. |
| `npm run build` | 0 | Built home plus both nested legal entries; managed manifest contains `privacy-policy/index.html` and `terms-of-service/index.html`. |
| `npm run test:deployment` | 0 | Existing mocked Cloudways preflight tests passed. |
| `node --check scripts/browser-qa.cjs` | 0 | Home QA syntax passed. |
| `node --check docs/agent-work/pacematcher-legal-pages/legal-pages-browser-qa.cjs` | 0 | Legal QA syntax passed. |
| `git diff --check` | 0 | No whitespace errors. |
| Focused legal route QA against `serve dist` after restoring the home baselines | 0 | Both direct URLs and refreshes returned 200 at 320px and 1440px; no overflow, clipping, console errors, or page errors. Footer and Terms privacy navigation passed. |
| Legal route QA against `vite preview` | 0 | Same route, refresh, content, responsive, focus, and navigation checks passed. |
| Existing home regression QA | Not rerun | The earlier full run exposed two pre-existing home baseline failures: hero micro-label contrast at 1440px and the three-phone composite width at 1024px. Those unrelated visual fixes were intentionally reverted from this legal-page task. |

## QA artifacts

- `qa/dist-serve/browser-qa.json` and `browser-qa.log`
- `qa/dist-serve-correction/browser-qa.json` and `browser-qa.log` (focused 320px/1440px run after restoring home baselines)
- `qa/vite-preview/browser-qa.json` and `browser-qa.log`
- `qa/home-regression/` (historical run only; not current acceptance evidence)
- `qa/dist-serve/*-320-top.png`, `*-768-top.png`, `*-1440-top.png`
- `qa/dist-serve/*-320-full.png`, `*-768-full.png`, `*-1440-full.png`
- `qa/dist-serve-correction/*-320-top.png`, `*-1440-top.png`
- `qa/dist-serve-correction/*-320-full.png`, `*-1440-full.png`
- Equivalent route screenshots under `qa/vite-preview/`

The corrected 1440px and 320px top screenshots were visually inspected. Both legal
pages render without overlap, truncation, or horizontal scrolling.

## Route metadata available at runtime

There is no application-level routing metadata object. Each emitted entry has
static document metadata in its own HTML head:

| Route | Title | Canonical | Open Graph |
| --- | --- | --- | --- |
| `/privacy-policy/` | `Privacy Policy - PaceMatcher` | `https://pacematcher.com/privacy-policy/` | type `article`, matching URL, title, and source description |
| `/terms-of-service/` | `Terms of Service - PaceMatcher` | `https://pacematcher.com/terms-of-service/` | type `article`, matching URL, title, and source description |

## Deployment blocker

The existing workflow uploads only `assets/**`, `images/**`, `fonts/**`,
`favicon.svg`, and root `index.html`
(`.github/workflows/deploy.yml:155-170`). The new legal entries are nested
`index.html` files and are therefore created by Vite and listed in the manifest,
but are not copied to Cloudways.

The preflight also rejects an existing destination that was absent from the
previous managed manifest (`scripts/cloudways-preflight.sh:133-135`). The
repository documentation explicitly says the current legal routes are maintained
by hosting/Nginx and preserved outside this release (`README.md:136-140`).

Changing those upload includes or the existing route ownership is a deployment
workflow/hosting decision outside this worker's scope. Until Astra authorizes
that follow-up, the local implementation is reviewable, but production direct
navigation cannot be claimed as delivered.

## Next checkpoint

Authorize one deployment-only correction: upload the two managed nested entries
in dependency-safe order and establish explicit ownership/replacement handling
for the existing `/privacy-policy` and `/terms-of-service` routes. Then update the
stale README statements that the build does not implement those policies.
