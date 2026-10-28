# Production readiness review — 28 October 2026

The local production build and automated checks pass. No deployment or real WhatsApp order was performed. The existing visual design, product catalogue, prices, image crops, choices, minimum-serving rules, Paris opening hours and WhatsApp message format are preserved. All 53 supplied original files remain byte-for-byte unchanged.

## Issues fixed

| Observed issue | Change |
| --- | --- |
| A blocked or throwing `window.open` discarded the cart and customer details. | Keep the order and form open on failure, permit retry, and clear them only after a window handle is returned. Prevent duplicate submissions before React commits. The success notice now correctly says to send the message in WhatsApp. |
| Quantities above 99 could silently disappear from the generated order. | Validate before checkout and handoff, keeping the existing message-generator limit and cart intact. Product add/remove and minimum-serving rules are unchanged. |
| A cart opened after closing time, or reopened the following morning, could display stale availability. | Refresh the displayed Paris-time availability at minute boundaries, on tab return and on drawer opening. Submission still checks hours independently. |
| Closed overlays remained in the keyboard sequence; open dialogs lacked focus containment, Escape and focus restoration. | Add native inert backgrounds/closed overlays, dialog semantics, initial focus, Tab wrapping, Escape, opener restoration and scroll locking. Preserve focus when quantities change. Reset retained dialog scrolling on each opening. |
| Checkout fields lacked autocomplete and accessible validation relationships; Enter did not submit the form. | Associate existing labels and required-field messages, add autocomplete/ARIA state and normal form submission without stricter phone/address validation. Hide decorative graphics from assistive technology. |
| French product names were clipped, and ordinary product action rows shifted with description length. | Let names and units wrap, and use flex-column bodies with bottom-aligned actions. Retain the Full Meals content-sized shared rows and Thali's extra selector. |
| On short screens, notices and checkout actions extended past the viewport without a reachable scroll area. | Constrain dialogs to the dynamic viewport, permit internal/parent scrolling and retain usable cart-item space. Long notices now wrap inside the screen. Mobile navigation targets clear the fixed header. |
| Every product image loaded eagerly; image failures left a blank gradient. | Native lazy loading/async decoding, responsive sources for large photos, and the existing emoji as a localized accessible fallback. Original photos remain available. |
| Hero effects continued running while customers browsed below the hero; optional motion ignored reduced-motion preferences. | Pause/resume the canvas offscreen, honor reduced motion in canvas/CSS/mobile tab peeking, and clean up listeners, observers and timers. Default animation drawing parity remains tested. |
| Static English metadata disagreed with the French default, social metadata described the wrong image/size, and structured data contained stale prices and unsupported claims. | Generate French HTML metadata and all 28 structured menu entries from the existing locale/catalogue resources. Synchronize runtime language changes. Correct the 800×800 logo, delivery region and price range; remove unsupported rating, precise coordinates, payment and staff-language claims. Add canonical robots/sitemap files and resource hints. |

## Image delivery

Eight derived WebP files serve four large product photos. Their encoding is lossless after resizing; the generation script verifies decoded pixels against each resized image. No original file is overwritten. The original source remains the fallback and highest-resolution candidate. `scripts/optimize-menu-images.py` can reproduce the derivatives using Python with Pillow; no application dependency was added.

For example, the Mirchi source is 4,588,298 bytes. Its 480px variant is 312,038 bytes (93% smaller); the 960px variant is 1,114,404 bytes (76% smaller). The production browser selected and decoded the 480px variant on a 390px, DPR 1 viewport while retaining `object-fit: cover` and the original crop position.

## Verification completed

- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm test -- --maxWorkers=1 --no-file-parallelism` — **63 tests passed across 8 files**.
- `npm run verify:originals` — all 53 original files unchanged.
- Original order-message, catalogue behavior, quantities, Paris/DST boundaries and default canvas drawing parity remain covered.
- Added regression coverage for popup failure/retry/duplicate submission, quantity rejection, live hours, dialog focus/scrolling/validation, reduced motion, lazy/error image handling, derived image files and static/runtime SEO.
- Local production preview checked in Chromium at desktop/tablet/mobile widths from 320px to 1440px, including 320×568 checkout/cart scrolling. Final checks of all five categories with French labels at 320px, 768px and 1440px found no clipped product titles or page overflow. English/Hindi switching and Full Meals alignment were also checked.
- Production browser console checks showed no warnings/errors. WhatsApp windows are mocked in tests; browser checks did not send a message.

## Remaining limitation and manual verification

1. **Existing button contrast remains insufficient.** White text on WhatsApp green (`#25D366`) measures **1.98:1**. Normal text needs 4.5:1 under [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum). Correcting this requires a color change, so it was left unchanged under the instruction to preserve the design. This review does not establish full accessibility conformance.
2. **Real WhatsApp handoff:** test WhatsApp Web and installed iOS/Android apps, confirm recipient, quantities, both meal choices, Unicode/multiline customer details and actual message receipt. Opening the destination is not proof of sending. Verify popup-blocker retry on those devices.
3. **Real devices and assistive technology:** check Safari/Firefox, VoiceOver/NVDA, keyboard-only operation, zoom/text scaling, landscape screens and the mobile keyboard/browser toolbar. Local Chromium emulation and DOM tests cannot establish every browser/device behavior.
4. **Hosted performance and SEO:** verify HTTPS/canonical redirects, compression/cache headers, Google Fonts/network failure behavior, throttled mobile loading and high-DPR image selection on the intended host. Check social previews and structured data with the providers' validators. The English/Hindi selections share the same canonical URL; they do not have separate indexable language routes.
5. **Business confirmation:** verify the existing telephone numbers, delivery/pickup information and hours operationally. Full street address, accepted payment methods and review/rating evidence were not invented or published; verify these before adding richer business claims. The original ceiling-based €30 eligibility rule and visitor-local order references/dates remain unchanged intentionally.

No new product features, routes or deployment configuration were introduced.
