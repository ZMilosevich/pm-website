# PaceMatcher

Responsive single-page marketing site for PaceMatcher, built with React 19,
TypeScript, Vite, Tailwind CSS v4, and Lucide icons. The production artifact is a
fully static `dist/` directory.

## Local development

Use Node.js 22 for parity with the deployment workflow.

```bash
npm ci
npm run dev
```

The Vite development server listens on `http://127.0.0.1:5173` by default.

```bash
npm run typecheck
npm run build
npm run preview
```

`npm run build` writes the deployable site to `dist/`. The development server and
preview server bind to loopback only. The build also generates
`dist/.pacematcher-managed-paths`, a sorted inventory used by Cloudways
preflight.

## Project structure

```text
src/
  components/       Reusable page sections and interaction components
  styles/           Global design tokens, layout, responsive rules, and motion
  App.tsx           Page composition
  config.ts         Contact and official footer destinations
  main.tsx          React entry point
public/
  fonts/            Locally bundled Inter variable font and license
  images/           Optimized supplied photography and app composite
  favicon.svg       Brand favicon
.github/workflows/  Production deployment workflow
```

The hero photography, three-phone app composite, and social preview image come
from supplied source assets. They were resized and encoded locally without AI
alteration. Responsive WebP variants are selected through `srcset`. Inter is
served locally from a bundled variable-font file rather than a CDN.

The site pairs the app showcase with policy-grounded verification, location
permission, reporting, and blocking guidance. It does not present verification
as an identity or safety guarantee, and it does not claim public exposure of
precise location is impossible.

Official app-store and footer destinations are centralized in `src/config.ts`:

- App Store: `https://apps.apple.com/us/app/pacematcher/id6752578460`
- Google Play: `https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en`
- App smart link: `https://pacematcher.com/get`
- Privacy: `https://pacematcher.com/privacy-policy`
- Terms: `https://pacematcher.com/terms-of-service`
- LinkedIn: `https://www.linkedin.com/company/pacematcher`
- Instagram: `https://www.instagram.com/pacematcher/`

The navigation CTA and download links use locally served official platform
marketing artwork:

- Apple App Store badge:
  `https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg`
- Google Play badge:
  `https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png`

Both assets were retrieved from the respective platform marketing resources on
2026-11-02 and are stored under `public/images/`. Their trademark and brand
guidelines remain with Apple and Google respectively.

The smart-link QR is a local SVG asset, not a remotely hosted image. Regenerate
it with `python3 scripts/generate-smart-link-qr.py` if the QR destination changes;
the script uses the local OpenCV Python module and does not run during builds.

## Cloudways deployment

The `Deploy PaceMatcher` workflow runs on every push to `main`. It uses Node.js
22, installs with `npm ci`, runs the TypeScript check, builds `dist/`, verifies
the destination and SSH host, and uploads over SSH with `rsync`.

### Required GitHub secrets

Create these under the repository's **Settings → Secrets and variables →
Actions**:

- `CLOUDWAYS_HOST`: Cloudways application hostname or IPv4 address.
- `CLOUDWAYS_USER`: SSH user for the Cloudways application.
- `CLOUDWAYS_SSH_KEY`: private deploy key in OpenSSH format. Store the public key
  on the Cloudways account and never commit either key.
- `CLOUDWAYS_DEPLOY_PATH`: absolute document-root path ending in `public_html`;
  for example `/home/master/applications/application-id/public_html`.
- `CLOUDWAYS_KNOWN_HOSTS`: the reviewed known-hosts line for `CLOUDWAYS_HOST`.
  Obtain it from the Cloudways console or another trusted provisioning channel.
  The workflow checks this value and never discovers or trusts a host key during
  deployment.

Use a production environment in GitHub with required reviewers if releases
should be gated.

### Safe first deployment

The workflow fails closed when a non-empty remote document root has no
PaceMatcher ownership marker. Before the first release, confirm the target is
the intended dedicated PaceMatcher document root, take a complete Cloudways
backup, and verify that the existing legal pages and other unrelated files are
in place. The marker authorizes the directory; it does not authorize existing
files that would collide with this release. A pre-existing `index.html`,
`get.php`, `assets/` path, `images/` path, `fonts/` path, or favicon must be
reviewed, backed up, and moved by the owner before the first automated upload.

Only after that migration review, create the marker once from an authenticated
SSH session:

```bash
printf '%s\n' 'PaceMatcher Cloudways deployment marker. Keep this file in the deployed document root.' > /absolute/path/to/public_html/.pacematcher-deploy
```

The marker is also part of `dist/`, so later releases retain it. If an empty
document root is selected, preflight creates the directory and writes the
marker on the first deployment.

The build generates `.pacematcher-managed-paths`, containing every release
destination. Remote preflight rejects the deployment before any upload if a
destination already exists but is absent from the previously managed manifest.
It also rejects the document root, any parent, or any destination/parent inside
the root when it is a symbolic link. Legal-route files are outside this release
manifest and remain untouched.

Preflight writes a staged union of the previous and new managed paths. The
workflow uploads content-hashed assets, images, fonts, and the favicon first;
`index.html` is transferred only after those dependencies exist; the managed
manifest is finalized last. Interrupted retries continue to recognize paths
authorized by the staged union.

The upload runs without `--delete` and transfers only files present in `dist/`.
It therefore preserves unrelated files such as existing privacy-policy and
terms routes. Keep the current `/privacy-policy` and `/terms-of-service` hosting
or Nginx routes in place because this single-page build does not implement
those policies. The workflow does not log credentials or disable host
verification.

### App smart link

The QR code points to `https://pacematcher.com/get?src=qr`. The built `get.php`
endpoint sends iPhone/iPad/iPod visitors to the App Store, Android visitors to
Google Play, and other devices to the app section on the landing page. It uses a
302 response and disables caching so store destinations can be changed in
`public/get.php` without regenerating the QR asset. Keep the direct badge URLs in
`src/config.ts` in sync when changing a store destination. The mobile navigation
CTA uses the same endpoint with `src=nav`.

On a Cloudways Lightning Stack, which does not process `.htaccess`, follow the
[Cloudways Web Rules guide](https://support.cloudways.com/en/articles/12597858-how-to-create-and-manage-web-rules-in-cloudways)
to add a **Rewrite Rule** with action **Rewrite**, source `/get`, destination
`/get.php`, and **Keep Original Query String** enabled. This internally routes
`/get?src=qr` to the PHP endpoint while keeping the short URL in the browser. On
a Hybrid Stack, add this Apache rule to the existing `.htaccess` file:

```apache
RewriteEngine On
RewriteRule ^get/?$ get.php [L,QSA]
```

The PHP endpoint is included in the deployment artifact; the Cloudways Web Rule
is an application setting and must be configured once in the Cloudways panel.

Run the local mocked filesystem tests without contacting Cloudways:

```bash
npm run test:deployment
```

The tests cover an initial empty root, repeated release, initial collision
rejection, symbolic-link rejection, and preservation of an unrelated legal
file.

Vite emits content-hashed files under `assets/`. Older hashed assets remain on
the server after an upload so cached pages do not break mid-release. After a
verified release and a fresh backup, remove stale hashed assets manually during
a maintenance window.

### SPA routing

This landing page uses anchors and has no client-side router, so a catch-all
route is not needed. If React Router is added later, configure the Cloudways
Lightning Stack Nginx application with an appropriate `try_files` fallback such
as:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Do not assume Apache `.htaccess` behavior on the Lightning Stack. Cloudways
documents its Web Rules as the route for rewrite behavior on that stack.

## Accessibility and interaction

The navigation is sticky and keyboard accessible, the mobile menu closes with
Escape, and FAQ buttons support Enter, Space, arrow keys, Home, and End. Section
reveals use `IntersectionObserver` and switch off under
`prefers-reduced-motion`. The hero image is eager-loaded; the complete
three-phone showcase remains lazy and is loaded during the scroll QA pass.
