import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderProvider, useOrder } from '../src/hooks/useOrder';
import { createOrderMessage } from '../src/lib/order';
import { createOrderNotificationPayload, getGoogleScriptUrl, postOrderNotification } from '../src/lib/orderNotifications';

// This is deliberately not a deployment URL. Every request is intercepted by the fetch mock.
const endpoint = 'https://script.google.com/macros/s/test-only-mocked-endpoint/exec';
const details = { name: '  Test Customer  ', phone: ' +33 123456 ', addr: ' Pickup: Gallieni ', note: ' No onion\nExtra spicy ' };
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_SCRIPT_URL', endpoint);
  fetchMock.mockReset().mockResolvedValue({ type: 'opaque' } as Response);
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllEnvs(); });

function prepareCheckout() {
  const hook = renderHook(() => useOrder(), { wrapper: OrderProvider });
  act(() => hook.result.current.add(27));
  act(() => {
    hook.result.current.selectBread(27, 'Paratha');
    hook.result.current.selectSnack(27, 'Dhokla');
    Object.entries(details).forEach(([field, value]) => hook.result.current.setField(field as keyof typeof details, value));
    hook.result.current.openModal();
  });
  return hook;
}

function payload() {
  const body = fetchMock.mock.calls[0]?.[1]?.body;
  if (typeof body !== 'string') throw new Error('Missing JSON request body');
  return JSON.parse(body) as Record<string, string>;
}

describe('Apps Script payload and request', () => {
  it('uses exactly eight fields and the existing generated item lines, choices and calculated total', () => {
    const order = createOrderMessage({ 1: 6, 27: 5 }, { 27: 'Paratha' }, { 27: 'Dhokla' }, details);
    const result = createOrderNotificationPayload(order, details, 'unique-test-reference');
    expect(result).toEqual({
      order_id: 'unique-test-reference',
      customer_name: 'Test Customer',
      customer_phone: '+33 123456',
      order_items: order.itemsText,
      order_total: '€149.89',
      delivery_details: 'Pickup: Gallieni',
      special_request: 'No onion\nExtra spicy',
      website: '',
    });
    expect(order.message).toContain(order.itemsText);
    expect(result.order_items).toContain('Gujarati Thali + Paratha (3 pcs) + Dhokla (per person)');
    expect(result.order_items).toContain('Qty: 5  x  €23.99  =  €119.95');
    expect(result.order_items).toContain('Qty: 6  x  €4.99  =  €29.94');
  });

  it('keeps blank notes/honeypot, uses the existing pickup fallback and generates unique references within a minute', () => {
    const order = createOrderMessage({ 18: 5 }, {}, {}, details);
    const first = createOrderNotificationPayload(order, { ...details, addr: ' ', note: ' ' });
    const second = createOrderNotificationPayload(order, details);
    expect(first.order_id).toMatch(new RegExp(`^${order.orderRef}-[0-9a-f-]+$`));
    expect(first.order_id).not.toBe(second.order_id);
    expect(first.delivery_details).toBe('Will confirm on call');
    expect(first.special_request).toBe('');
    expect(first.website).toBe('');
  });

  it('accepts only a configured HTTPS Apps Script deployment /exec endpoint', () => {
    expect(getGoogleScriptUrl(` ${endpoint} `)).toBe(endpoint);
    for (const value of ['', null, 123, 'not a URL', endpoint.replace('/exec', '/dev'), endpoint.replace('https:', 'http:'), endpoint + '?secret=x', endpoint + '#fragment', endpoint.replace('script.google.com', 'example.com'), endpoint.replace('script.google.com', 'script.google.com.example.com')]) {
      expect(getGoogleScriptUrl(value), String(value)).toBeNull();
    }
  });

  it('sends JSON as a CORS-safelisted body and never reads an opaque response as delivery confirmation', async () => {
    const order = createOrderMessage({ 18: 5 }, {}, {}, details);
    const notification = createOrderNotificationPayload(order, details);
    fetchMock.mockResolvedValue(new Proxy({} as Response, { get(_target, key) {
      if (key === 'then') return undefined; // Allow Promise resolution without inspecting response data.
      throw new Error('Opaque responses must not be inspected');
    } }));
    await expect(postOrderNotification(endpoint, notification)).resolves.toBe('attempted');
    expect(fetchMock).toHaveBeenCalledWith(endpoint, {
      method: 'POST', mode: 'no-cors', credentials: 'omit', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(notification), keepalive: true,
    });
  });

  it('does not truncate large Unicode notes or subject them to the keepalive body limit', async () => {
    const note = 'नमस्ते'.repeat(12_000);
    const order = createOrderMessage({ 18: 5 }, {}, {}, details);
    await postOrderNotification(endpoint, createOrderNotificationPayload(order, { ...details, note }));
    expect(fetchMock.mock.calls[0]?.[1]?.keepalive).toBe(false);
    expect(payload().special_request).toBe(note);
  });
});

describe('checkout notification integration', () => {
  it('opens WhatsApp before starting fetch, without waiting for a response, while preserving the exact message and cart reset', () => {
    const sequence: string[] = [];
    vi.mocked(window.open).mockImplementation(() => { sequence.push('whatsapp'); return { opener: null } as unknown as Window; });
    fetchMock.mockImplementation(() => { sequence.push('notification'); return new Promise(() => undefined); });
    const { result } = prepareCheckout();
    const expected = createOrderMessage(result.current.cart, result.current.breadSelections, result.current.snackSelections, result.current.details);
    act(() => { result.current.sendOrder(); result.current.sendOrder(); });
    expect(sequence).toEqual(['whatsapp', 'notification']);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(new URL(String(vi.mocked(window.open).mock.calls[0]?.[0])).searchParams.get('text')).toBe(expected.message);
    expect(payload().order_items).toBe(expected.itemsText);
    expect(payload().order_total).toBe('€119.95');
    expect(result.current.cart).toEqual({});
    expect(result.current.details.name).toBe('');
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.toast.message).not.toMatch(/email|delivered/i);
  });

  it('attempts notification on valid explicit submission even when WhatsApp is blocked and deduplicates later retries', () => {
    const { result } = prepareCheckout();
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.sendOrder());
    const firstId = payload().order_id;
    expect(result.current.cart).toEqual({ 27: 5 });
    expect(result.current.modalOpen).toBe(true);
    vi.setSystemTime(new Date('2026-10-28T12:36:00Z'));
    act(() => result.current.sendOrder());
    expect(window.open).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(payload().order_id).toBe(firstId);
    act(() => result.current.setField('note', 'A different request'));
    act(() => result.current.sendOrder());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).order_id).not.toBe(firstId);
  });

  it.each(['', 'invalid', endpoint.replace('/exec', '/dev')])('keeps WhatsApp working when endpoint configuration is missing or invalid (%s)', (configured) => {
    vi.stubEnv('VITE_GOOGLE_SCRIPT_URL', configured);
    vi.mocked(window.open).mockReturnValue({ opener: null } as unknown as Window);
    const { result } = prepareCheckout();
    act(() => result.current.sendOrder());
    expect(window.open).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.cart).toEqual({});
  });

  it('handles network failure without breaking WhatsApp or logging customer information', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network unavailable'));
    vi.mocked(window.open).mockReturnValue({ opener: null } as unknown as Window);
    const { result } = prepareCheckout();
    await act(async () => { result.current.sendOrder(); });
    expect(result.current.cart).toEqual({});
    expect(result.current.modalOpen).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith('Order notification request failed; WhatsApp checkout is unaffected.');
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('Test Customer');
  });

  it('does not automatically resend a failed notification when retrying a blocked WhatsApp handoff', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network unavailable'));
    const { result } = prepareCheckout();
    await act(async () => { result.current.sendOrder(); });
    await act(async () => { result.current.sendOrder(); });
    expect(window.open).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.current.cart).toEqual({ 27: 5 });
    expect(result.current.details.name).toBe(details.name);
  });

  it('allows distinct completed orders in the same minute and assigns different notification IDs', () => {
    vi.mocked(window.open).mockReturnValue({ opener: null } as unknown as Window);
    const { result } = prepareCheckout();
    act(() => result.current.sendOrder());
    const firstId = payload().order_id;
    act(() => result.current.add(27));
    act(() => {
      Object.entries(details).forEach(([field, value]) => result.current.setField(field as keyof typeof details, value));
      result.current.openModal();
    });
    act(() => result.current.sendOrder());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondId = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)).order_id;
    expect(secondId).not.toBe(firstId);
    expect(secondId.split('-').slice(0, 3).join('-')).toBe(firstId?.split('-').slice(0, 3).join('-'));
    expect(result.current.cart).toEqual({});
  });

  it('does not notify for browsing, missing required details, a below-minimum cart or closed hours', () => {
    const { result } = renderHook(() => useOrder(), { wrapper: OrderProvider });
    act(() => result.current.openCart());
    act(() => result.current.add(1));
    act(() => result.current.openModal());
    act(() => result.current.sendOrder());
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.add(27));
    act(() => result.current.openModal());
    act(() => result.current.sendOrder());
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => { result.current.setField('name', 'Customer'); result.current.setField('phone', '123'); });
    vi.setSystemTime(new Date('2026-10-28T20:00:00Z'));
    act(() => result.current.sendOrder());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });
});
