# Shree Krishna Nasta House — React migration

Local-only, one-to-one migration of `../website/index.html` using React, strict TypeScript, Vite and Tailwind CSS. The original `website/`, `maintenance-page/`, `brand/`, `extras/`, README and setup guide remain unchanged. No Vercel, production or domain configuration is included or changed.

## Run locally

From this directory, with Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Use the local URL printed by Vite. To compare the original, run this in a second terminal from the repository root:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory website
```

Open `http://127.0.0.1:8000/`. Serve `website/` as the root so the original root-relative favicon URLs work.

## Checks and production output

```sh
npm run typecheck
npm test
npm run build
npm run verify:originals
npm run preview
```

The build writes `dist/` locally. `preview` serves that output locally; it does not publish it. The SHA-256 manifest in `audit/original-manifest.json` covers all 53 supplied original files.

## Structure

- `src/App.tsx`: original section order and order-state provider.
- `src/components/`: navigation, hero, menu/product components, cart, customer details and static sections.
- `src/data/menu.ts`: all 28 original products, frozen as in the original script.
- `src/lib/order.ts`: typed quantities, choices, Paris opening-hours check and WhatsApp message generation.
- `src/hooks/`: React order state, canvas animation, moving selection indicators and mobile tab-scroll discovery.
- `src/i18n/`: bundled English, French and Hindi translations and i18next initialization.
- `public/`: unchanged original assets/stylesheet plus derived responsive images and crawl-discovery files.
- `index.html`, `scripts/seo.ts`: French metadata and catalogue JSON-LD generated before JavaScript runs; original Google Fonts families retained.
- `tests/`: comparisons against the original source and runtime in an isolated DOM environment. WhatsApp opening is mocked; no test sends an order.

## Parity decisions

`public/original.css` is the exact original inline stylesheet. It remains unprocessed so the cascade, keyframes, breakpoints and relative hero-image URL are preserved. Tailwind's theme and utilities are enabled without Preflight. Existing UI does not use shadcn defaults: none of its stock components is needed to reproduce this interface.

Original SVG paths, emoji, source images, image crops and font families are retained. Catalogue description markup (`&amp;` entities and the Thali's `<strong>`) comes only from bundled translations; customer fields are React-controlled text. Interactive state is typed React state, not the old global script. Separate responsive image derivatives reduce transfer size without overwriting originals.

Existing behavior is intentionally retained, including:

- `Math.ceil(total)` for the €30 minimum, while free-delivery wording requires an actual €30 total.
- Party items start at five servings and disappear when reduced below five.
- The original message generator keeps its 99-item quantity limit. Checkout now rejects unsupported quantities before any line can be silently omitted.
- One bread/snack choice per product; choices survive removal and order submission.
- Paris-time opening hours but visitor-local order references, timestamps and tomorrow's date.
- Opening-hours banners refresh at minute boundaries, on return to the tab and when the drawer opens, using the original Paris-time rules.
- Undhiyu's cart notice and separate party-order message behavior.
- Cart reset only after WhatsApp opens successfully. Blocked/failed windows retain the order and details for retry; opening WhatsApp does not confirm that a message was sent.
- Initial versus subsequent empty-cart wording; cart and checkout fields are not persisted.
- Existing dismissal buttons and navigation, with keyboard focus/Escape handling, reduced-motion support and an accessible image-error fallback.
- The separate maintenance site's original files and date remain unchanged.

Unused legacy `_noop()` canvas code is not executed or ported. The active canvas effect is ported with lifecycle cleanup. The original CSS, including unused selectors, is retained.

The maintenance site and brand palette/QR files remain their original independent artifacts; no new route or UI feature is added for them.

## Languages

The existing header includes a labeled native language selector for English, Français and हिन्दी. First-time visitors see French. The choice is stored under `i18nextLng` in localStorage; invalid or unavailable storage falls back to French. Switching language updates the interface, document language, title and social metadata immediately, while retaining cart contents, product choices and entered checkout details.

Edit `src/i18n/locales/en.json`, `fr.json` and `hi.json` together, keeping identical keys and interpolation placeholders. Product text lives under `products` by original product ID, separate from prices, images and order flags in `src/data/menu.ts`. Canonical English product labels and the existing WhatsApp message format are deliberately retained for order processing. `src/i18n/metadata.ts` supplies build-time and runtime metadata from the same resources and catalogue. The original assets and stylesheet in `public/` are unchanged; layout and accessibility fixes are added in `src/styles/tailwind.css`.

The i18n tests check resource parity, persistence and storage restrictions, live translations and accessible labels, retained order state and exact WhatsApp output. Initialization runs from `src/main.tsx` before React renders.

## Optional order email notifications

Copy `.env.example` to `.env.local` and set `VITE_GOOGLE_SCRIPT_URL` to the existing Google Apps Script Web App URL ending in `/exec`. Leave it blank to keep email notifications disabled. Restart the Vite development server after changing this value; production output must be rebuilt to include changes. This URL is public browser configuration, so never use a password, Gmail credential or private token as its value.

On explicit valid checkout submission, WhatsApp opens synchronously and the website attempts a background notification, including when the new WhatsApp window is blocked. Identical blocked-window retries are deduplicated. WhatsApp checkout remains the primary flow. The `no-cors` response is opaque and cannot confirm email delivery, and notification failures do not block the order handoff. See [order notification setup and endpoint contract](docs/order-notifications.md) for the exact payload, safeguards and verification limits. This project does not modify or deploy the Apps Script application.

## Review limits

The production-readiness review is recorded in [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md). Automated tests cover catalogue/order-message parity, dialogs, translations, metadata and media behavior. Browser checks cover the local production build at desktop, tablet and mobile widths. Google Fonts still requires a network connection, as in the original. WhatsApp opening is mocked in tests; real device handoff and message delivery still need manual verification. No order was sent and no deployment was performed.

For visual review, compare both local sites using the same browser, font-loading state and viewport (1440, 1100, 901/900, 600, 481/480, 390 and 375 pixels). Check each category, the party choices, hover states, drawer notices, form, toasts and initial/repeating animations. Canvas particles are randomized in the original and migrated versions.
