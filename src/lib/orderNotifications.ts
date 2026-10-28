import type { OrderDetails, OrderMessage } from '../types';

export interface OrderNotificationPayload {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  order_items: string;
  order_total: string;
  delivery_details: string;
  special_request: string;
  website: string;
}

export function createOrderNotificationPayload(order: OrderMessage, details: OrderDetails, orderId = notificationId(order.orderRef)): OrderNotificationPayload {
  return {
    order_id: orderId,
    customer_name: details.name.trim(),
    customer_phone: details.phone.trim(),
    order_items: order.itemsText,
    order_total: `€${order.total.toFixed(2)}`,
    delivery_details: details.addr.trim() || 'Will confirm on call',
    special_request: details.note.trim(),
    website: '',
  };
}

function notificationId(orderRef: string): string {
  const unique = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, '0')).join('');
  return `${orderRef}-${unique}`;
}

export function getGoogleScriptUrl(value: unknown = import.meta.env.VITE_GOOGLE_SCRIPT_URL): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname === 'script.google.com' && !url.port &&
      !url.username && !url.password && !url.search && !url.hash && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)
      ? url.href : null;
  } catch {
    return null;
  }
}

export type NotificationAttempt = 'skipped' | 'attempted' | 'failed';

export async function postOrderNotification(url: string, payload: OrderNotificationPayload): Promise<NotificationAttempt> {
  try {
    const body = JSON.stringify(payload);
    // text/plain is CORS-safelisted; Apps Script reads the JSON via e.postData.contents.
    // A no-cors response is opaque: completion cannot verify acceptance or email delivery.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      // Keepalive has a shared 64 KiB browser limit. Never truncate larger orders.
      keepalive: new TextEncoder().encode(body).byteLength <= 60_000,
    });
    return 'attempted';
  } catch {
    // Do not log customer data, endpoint URLs or errors that may contain them.
    console.warn('Order notification request failed; WhatsApp checkout is unaffected.');
    return 'failed';
  }
}

/** One notifier per mounted checkout; identical blocked-popup retries share an attempt. */
export function createOrderNotifier() {
  const attempted = new Set<string>();
  return {
    reset() { attempted.clear(); },
    async notify(order: OrderMessage, details: OrderDetails): Promise<NotificationAttempt> {
      try {
        const url = getGoogleScriptUrl();
        if (!url) return 'skipped';
        const payload = createOrderNotificationPayload(order, details);
        // Exclude generated references/timestamps so waiting a minute does not resend a retry.
        const fingerprint = JSON.stringify({ ...payload, order_id: '' });
        if (attempted.has(fingerprint)) return 'skipped';
        attempted.add(fingerprint);
        return await postOrderNotification(url, payload);
      } catch {
        console.warn('Order notification could not be prepared; WhatsApp checkout is unaffected.');
        return 'failed';
      }
    },
  };
}
