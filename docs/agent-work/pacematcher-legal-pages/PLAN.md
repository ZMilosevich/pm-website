# PaceMatcher legal pages

## Objective

Add first-party Privacy Policy and Terms of Service pages to the PaceMatcher site, using the current public policy copy as the source. Visitors should reach the pages from the site footer and by loading their URLs directly.

## Scope

- Add `/privacy-policy/` with the complete current Privacy Policy copy (last updated August 11, 2026; 13 numbered sections).
- Add `/terms-of-service/` with the complete current Terms of Service copy (last updated May 4, 2026; 17 numbered sections).
- Use the existing dark/pink site styling, responsive shell, and footer. Provide a clear way back to the home page.
- Change the existing footer Privacy and Terms destinations to local page URLs. Preserve social destinations.
- Preserve the source's meaning and all sections; normalize only typography and HTML formatting. Link the Privacy Policy from the Terms page locally. Keep the source contact addresses and the Terms page's platform links.
- Ensure both pretty URLs work on direct navigation and refresh in the current static build/deployment setup. Make no changes to deployment scripts or hosting configuration unless repository evidence proves an in-scope path cannot work without them; report such a blocker instead.

## Out of scope

- Rewriting, summarizing, or adding legal terms.
- Changing app behavior, legal positions, source dates, contact details, or unrelated marketing copy.
- Publishing or deploying the site.

## Source pages

- Privacy Policy: https://pacematcher.com/privacy-policy/ (retrieved November 3, 2026; source says last updated August 11, 2026).
- Terms of Service: https://pacematcher.com/terms-of-service/ (retrieved November 3, 2026; source says last updated May 4, 2026).

## Repository evidence

- React 19 + Vite static site; `src/App.tsx` currently renders the home page unconditionally.
- `src/components/Footer.tsx` renders `footerDestinations` from `src/config.ts`; the current legal destinations point to the live domain.
- `index.html` currently contains home-page SEO metadata.
- `npm run build` also generates `.pacematcher-managed-paths`; direct route handling must remain compatible with the static build and Cloudways managed-path deployment.
- Baseline at dispatch preparation: commit `6da0ee4`, clean working tree.

## Acceptance criteria

1. Both local legal URLs render the correct title, source last-updated date, every source section, lists, contact details, and legal links.
2. Footer Privacy and Terms links resolve to the local pages; Terms links to the local Privacy Policy.
3. Direct load, refresh, and browser navigation work at both routes without breaking the home page or deployment manifest behavior.
4. Layout is readable and usable at 320px and desktop widths, uses semantic headings/lists/links, and supports keyboard focus.
5. `npm run typecheck` and `npm run build` pass. Browser QA verifies both direct URLs, footer links, key content, responsive layout, and home-page regression.

## Execution plan

One vertical implementation phase: inspect existing Vite/deployment route behavior; implement legal-page rendering, complete source content, local footer links, and route-safe document metadata; run typecheck/build and browser QA; record results and screenshots in `IMPLEMENTATION_REPORT.md` under this feature directory.

## Execution note

On November 3, 2026, the user explicitly directed continuation with the current Luna root after the doctor reported `gpt-6-luna` / `xhigh`. Continue with this root and the configured `astra_flash_builder` implementation worker. The worker binding is statically configured as `openrouter/deepseek-v4.1-flash` (OpenRouter, high); runtime inference routing remains unverified until host/router metadata is available.
