# PaceMatcher implementation contract

## Baseline and objective
Workspace `/Users/zmilosevich/Desktop/Work/pm-web-v2` was empty, with no Git repository or existing configuration. Build the complete static landing site described in the user brief at `/Users/zmilosevich/.codex/attachments/f52e6c9d-9f63-489c-960b-e5850c139292/Pasted text.txt`. The supplied design screenshot is the visual authority; preserve the supplied written content (including available iOS/Android FAQ wording).

## Architecture and scope
React 19 + Vite + TypeScript + Tailwind v4 + Lucide React, minimal dependencies, reusable section components and CSS tokens. One page with anchors, no router/backend/accounts. Output `dist/`. Use the three original supplied images, optimize locally without AI alteration, and preserve the five-phone composite as an actual product image. Match screenshot typography, proportions, spacing and photographic crops; pink `people.` follows the reference. Responsive at 320, 375, 768, 1024 and 1440 px.

Header sticky, accessible animated mobile menu, anchor scrolling; FAQ initially opens first item, keyboard accessible with animated panels. IntersectionObserver entry animation and reduced-motion support. Metadata, favicon, semantic structure, keyboard focus and lazy below-fold images required. Do not invent social accounts or legal policies: keep destination config explicit; if URLs remain unavailable, honestly labeled mailto requests are acceptable temporary fallbacks and must be documented.

## Deployment contract
Create main-push GitHub Actions workflow on Node 22 with `npm ci`, typecheck, build, SSH-based dist upload. Secrets HOST/USER/SSH_KEY/DEPLOY_PATH use the exact CLOUDWAYS_ names from the brief. Require separately pinned known-host data (additional documented secret `CLOUDWAYS_KNOWN_HOSTS`); do not disable SSH host verification or trust unverified keyscan output. Validate destination is an absolute application public_html path, avoid shell injection and credential logging, deploy only dist files, no remote deletion, no unrelated-file overwrite. Document that an exclusive site directory and backup are prerequisites and static assets retain old hashes. Nginx SPA fallback instructions only if routes are added; no .htaccess assumption. No actual production access, commit, push or deployment.

## One implementation phase
One Flash worker owns repository discovery, all application/configuration/assets/README/workflow files, install, build, testing, debugging and browser QA. Root owns this plan and acceptance checkpoint. Worker may write its report and QA artifacts in this folder. Do not delegate further or load orchestration skill. Preserve others' changes.

## Acceptance
All brief sections and copy implemented using the supplied assets. No horizontal overflow at required widths. Navigation, mobile menu, FAQ and mailto verified; visual screenshots at desktop and mobile inspected. TypeScript and production build pass, output is deployable static files. Review actual source and deployment safety together once; report remaining limits accurately. No fabricated Lighthouse score. Unknown production URLs and deployment credentials are documented rather than invented.

## Routing
Doctor observed root gpt-6-astra/high and static-ready native astra_flash_builder route openrouter/deepseek-v4.1-flash via OpenRouter. Static setup is verified; inference routing requires host/provider metadata and must not be inferred from self-report.
