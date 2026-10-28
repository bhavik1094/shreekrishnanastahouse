# Order email notifications

The website attempts to notify the existing `SKNH Order Notifications` Google Apps Script email endpoint when a customer explicitly submits a valid checkout. WhatsApp opens synchronously first; the notification runs in the background even if the WhatsApp window is blocked. WhatsApp checkout, its message format, product choices, prices and order calculations remain unchanged. The email recipient (`royalbhavik94@gmail.com`) stays configured in the existing script, not in the website payload.

## Configuration

1. Create `.env.local` from `.env.example` in the React app directory.
2. Set `VITE_GOOGLE_SCRIPT_URL` to the actual, existing Google Apps Script Web App URL ending in `/exec`. No deployment URL is supplied with this project; do not substitute an example URL, script editor link or `/dev` URL.
3. Restart the Vite development server after editing the file. For a production artifact, rebuild after configuring the value in the build environment. Vite embeds `VITE_*` values at build time.

Leaving the value blank disables notification requests. Only HTTPS URLs matching `script.google.com/macros/s/<deployment-id>/exec` are accepted; malformed URLs, credentials, query strings, fragments, other hosts and `/dev` are skipped without affecting WhatsApp. `.env.local` is ignored by Git. The `VITE_` prefix makes the endpoint URL public in the browser bundle; it is configuration, not a secret. Do not add Gmail passwords, OAuth credentials, service-account keys or private API tokens to the frontend environment.

This integration does not create, change or deploy an Apps Script project. The existing endpoint must already permit requests from website visitors and support the request contract below.

## Request and delivery semantics

The request uses `POST`, `mode: 'no-cors'`, `credentials: 'omit'`, normal redirect following and `Content-Type: text/plain;charset=UTF-8`, with a JSON string as the request body. Keeping a plain-text content type avoids the CORS preflight that an `application/json` content type would trigger. The existing handler must parse the JSON from `e.postData.contents`, not form-encoded parameters; this integration does not change or inspect the deployed script. `keepalive` is enabled for bodies up to 60,000 UTF-8 bytes; larger bodies use ordinary fetch without truncating the order. This is best effort, not a durable delivery queue.

Exactly these eight fields are sent:

| Field | Value |
| --- | --- |
| `order_id` | Existing `SK-...` WhatsApp reference plus a random UUID suffix, unique per notification. The WhatsApp message retains its original reference format. A cryptographic random fallback is used if `randomUUID` is unavailable. |
| `customer_name` | Trimmed `details.name`. |
| `customer_phone` | Trimmed `details.phone`. |
| `order_items` | Readable string of the same generated order item lines as WhatsApp: canonical product names, units, quantities, selected Roti/Paratha and Khaman/Dhokla options, unit prices and subtotals. |
| `order_total` | Existing calculated total formatted as `€` plus two decimal places. |
| `delivery_details` | Trimmed `details.addr`, or the existing `Will confirm on call` fallback. |
| `special_request` | Trimmed `details.note`, or an empty string. |
| `website` | Always an empty string because the existing script treats non-empty values as honeypot submissions. |

The browser cannot read the status or response body of an opaque `no-cors` response. A resolved request does not establish that the script accepted the order, sent an email or delivered an email to an inbox. The interface must not claim email success based on that response. Network errors and an absent endpoint must not interrupt the WhatsApp handoff or change its result.

Opening the cart, editing details, validation failures and invalid checkout do not send requests. A valid explicit submit attempts notification even when WhatsApp is blocked; the email therefore represents an initiated checkout, not a confirmed, paid or accepted order. Existing blocked-window handling still retains the cart and details. Repeated blocked-window retries with identical order/details/options are deduplicated in memory, including if the time or interface language changes. Editing the order can produce another attempt. A successfully opened WhatsApp checkout resets this deduplication for the next order. There are no automatic retries, even after a detectable network failure, because delivery may be uncertain. Failures produce a generic console warning without logging customer details or affecting the UI/WhatsApp result.

## Endpoint trust and abuse limits

The endpoint URL is discoverable from the website bundle and network requests. A third party can call it directly and forge the JSON, including customer details, quantities, totals and order identifiers. Client validation and an empty honeypot are only convenience measures; neither authenticates an order nor prevents deliberate abuse. Treat the submitted total as non-authoritative and confirm the order through the existing business process.

Duplicate submission protection in the browser can prevent accidental rapid clicks during one checkout, but it cannot guarantee exactly-once delivery across browsers, reloads or direct endpoint calls. The receiving service needs its own validation, rate limits and duplicate `order_id` handling if those guarantees are required. Customer fields should be handled as untrusted text by the existing endpoint, especially if an email is composed as HTML.

There is no server-side enforcement in this client integration. Client-provided totals are not authoritative for accounting or payment. Confirm the products, total, delivery and acceptance through the existing business process. This change adds no credentials, payment handling or order-confirmation mechanism.

## Verification limits

Use the automated tests with mocked network requests to inspect payload shape, disabled configuration, duplicate-click handling and failure behavior. The shared test setup disables notification configuration even if a real `.env.local` is present; notification tests opt in to a test-only URL with mocked fetch. A mocked request or an opaque browser response cannot verify the existing Apps Script deployment, its authorization, email quota, inbox acceptance or delivery. No live request or test email was sent during these frontend checks.

Protocol references: [Apps Script web app request fields](https://developers.google.com/apps-script/guides/web), [Content Service redirects](https://developers.google.com/apps-script/guides/content), and the [Fetch Standard](https://fetch.spec.whatwg.org/).
