# PaceMatcher conversion, trust and readability refinement

## Baseline
Existing React 19/Vite static site in `/Users/zmilosevich/Desktop/Work/pm-web-v2`, no Git metadata. Baseline captured in `/private/tmp/pm-web-v2-before-refinement.tar.gz`; preserve existing work, Cloudways safeguards and official footer destinations. Root owns this PLAN and CHECKPOINT; worker owns app/assets/QA/report/README within this brief.

## One coherent implementation phase
1. Reusable App Store / Google Play badges with clear download actions in hero and app section; header CTA `Get the app` links to download area. Actual listing URLs are pending user input. Centralize destinations, no guessed listings or store-search links. If unresolved, clearly indicate missing availability without fake clickable downloads and report the limitation. User can steer release-status copy.
2. Replace five-phone composite with supplied `/Users/zmilosevich/Desktop/Output/pm_app_three_screens_web.png`, optimized WebP variants. Display substantially larger, uncropped, with discover/chat/track captioning. The supplied composite's center screen is chat; do not fabricate/repaint screens or claim find is centered. Use sufficient visual real estate; optional accessible lightbox with Escape/focus restoration for closer inspection if it helps mobile readability.
3. Replace BetterMiles promotional photo section with a dedicated `#safety` section covering verification, location privacy, and report/block tools, prominently linked in navigation or hero. Use supported product claims only, clear modest copy, and a privacy-policy link. Update location FAQ to nuanced wording consistent with policy.
4. Social proof: only approved real quotes/stats from user or verified primary sources. None supplied at dispatch. Do not invent testimonials/user totals/ratings, decorative fake quote cards or placeholder social proof. A truthful community invitation/mission can provide connective copy, but must not masquerade as proof.
5. Remove floating hero caption or integrate its text into readable main copy. Keep cinematic photo, stronger stable scrim with runner faces visible and clear copy area. Removing the second photo solves repetition/readability there.
6. Brighten body text and enlarge micro labels, with WCAG AA text contrast calculations. Normal text >=4.5:1, large text >=3:1. Check pink text/button labels too; use a darker pink fill or alternate accessible text color where needed while keeping brand pink accents. Include photographic background worst-case scrim evaluation for hero. Do not claim comprehensive WCAG certification from color checks.
7. Enrich Our story with a short product mission grounded in the existing purpose and names/roles, possibly role-based contributions. No invented founding anecdotes/personal hobbies/headshots. Wait for user-supplied personal story if provided.

## Sources / safe product contract
Root browsed `https://pacematcher.com/privacy-policy/`: selfie comparison verifies a correspondence with profile photo, retains verification status; it is not an identity/background/safety guarantee. Location may be approximate or precise; device permissions govern access; policy intends to limit public exposure of precise location. Reporting and blocking tools are supported. Use a total of <180 words paraphrased from this source across site/source notes. Terms `https://pacematcher.com/terms-of-service/` supports public meeting places and telling someone plans, no safety guarantee. Avoid blanket 'exact location is never shared'. Source links should be visitor-friendly, not implementation citations.
Contrast standard: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html .

## Execution / acceptance
One native Flash worker owns internal discovery, implementation, routine debugging and browser QA. No recursive delegation, no orchestration skill, no commit/push/deploy. No deployment refactor needed. Use existing local preview 4173, refresh production dist and preview after changes. Assets are supplied: no image generation required, preserve authenticity. Keep dark/pink brand, balanced section rhythm; old exact page-height tests are obsolete and should be replaced with meaningful updated UI checks, not disabled wholesale.
Typecheck/build must pass. At 320/375/768/1024/1440: no overflow or clipped text/phones, image loads, functioning anchors/menu/FAQ/store controls, keyboard and reduced motion behavior. Inspect screenshots desktop/mobile and record contrast ratios. Return concise implementation report and QA artifacts in this folder. Root reviews changed source against archive and screenshots in one pass, with one correction cycle if necessary.

## Routing
Doctor confirms static-ready Astra root and `astra_flash_builder` OpenRouter DeepSeek V4.1 Flash binding. Runtime inference metadata remains unavailable. User data-sharing authorization is the existing managed workflow.

## User clarification received before dispatch
Use exact App Store URL `https://apps.apple.com/ci/app/pacematcher/id6752578460` and Google Play URL `https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en`. User asks to add founder/team story; write product-purpose narrative with known roles, no invented biography/history. No real customer quotes or statistics supplied, so do not add fabricated social proof.

## User steering during acceptance correction
Remove the View app screens button and Discover/Chat/Track captions below the three-phone artwork. Remove the unused dialog/lightbox. User's requested `.product-shot` base declarations: `position: relative; display: flex; min-width: 0; min-height: 34rem; align-items: center; align-self: stretch; overflow: hidden; margin: 0; background: #0f0f11;`. This supersedes the optional lightbox/caption direction above. Continue responsive contrast, safety/story accuracy and badge refinements already under correction.
