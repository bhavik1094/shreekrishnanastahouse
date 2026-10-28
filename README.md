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
- `public/`: unchanged original assets, verification response and original stylesheet.
- `index.html`: original static metadata, JSON-LD and Google Fonts URL.
- `tests/`: comparisons against the original source and runtime in an isolated DOM environment. WhatsApp opening is mocked; no test sends an order.

## Parity decisions

`public/original.css` is the exact original inline stylesheet. It remains unprocessed so the cascade, keyframes, breakpoints and relative hero-image URL are preserved. Tailwind's theme and utilities are enabled without Preflight. Existing UI does not use shadcn defaults: none of its stock components is needed to reproduce this interface.

Original SVG paths, emoji, image bytes, image crops, fonts and copy are retained. The only HTML insertion is immutable catalogue description markup (`&amp;` entities and the Thali's `<strong>`); customer fields are React-controlled text. Interactive state is typed React state, not the old global script.

Existing behavior is intentionally retained, including:

- `Math.ceil(total)` for the €30 minimum, while free-delivery wording requires an actual €30 total.
- Party items start at five servings and disappear when reduced below five.
- Quantity controls can exceed 99, but submission omits those quantities; omitted items remain in the cart.
- One bread/snack choice per product; choices survive removal and order submission.
- Paris-time opening hours but visitor-local order references, timestamps and tomorrow's date.
- Opening-hours banners refresh on cart/choice changes, not on a timer or drawer opening.
- Undhiyu's cart notice and separate party-order message behavior.
- Cart reset after opening WhatsApp, without delivery/confirmation acknowledgement.
- Initial versus subsequent empty-cart wording; no persistent storage.
- Original dismissal behavior, mobile navigation, reduced-motion handling and image-error fallback.
- Original SEO inconsistencies and static maintenance date.

Unused legacy `_noop()` canvas code is not executed or ported. The active canvas effect is ported with lifecycle cleanup. The original CSS, including unused selectors, is retained.

The maintenance site and brand palette/QR files remain their original independent artifacts; no new route or UI feature is added for them.

## Review limits

Automated DOM comparisons check content, structure, attributes and interactions; identical CSS/assets preserve the source visual contract. They do not substitute for pixel comparison in a real browser. Browser UI inspection was stopped by the user with Escape, so complete desktop/mobile screenshot parity and animation timing at each viewport remain unverified. Google Fonts still requires a network connection, as in the original. The final WhatsApp handoff is tested through its generated URL, without sending a real order.

For visual review, compare both local sites using the same browser, font-loading state and viewport (1440, 1100, 901/900, 600, 481/480, 390 and 375 pixels). Check each category, the party choices, hover states, drawer notices, form, toasts and initial/repeating animations. Canvas particles are randomized in the original and migrated versions.
