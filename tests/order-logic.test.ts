import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { MENU } from '../src/data/menu';
import {
  addItem, cartTotal, createOrderMessage, getBread, getSnack,
  isOrderingOpen, itemLabel, removeItem, WA_NUMBER,
} from '../src/lib/order';
import type {
  BreadSelections, Cart, MenuItem, OrderDetails, SnackSelections,
} from '../src/types';

const originalHTML = readFileSync(resolve(import.meta.dirname, '../../website/index.html'), 'utf8');
const menuStart = originalHTML.indexOf('const MENU = {');
const originalMenu = originalHTML.slice(menuStart, originalHTML.indexOf('\n};', menuStart) + 3);

function originalFunction(name: string): string {
  const start = originalHTML.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Original function missing: ${name}`);
  const end = originalHTML.indexOf('\n}', start);
  if (end < 0) throw new Error(`Original function terminator missing: ${name}`);
  return originalHTML.slice(start, end + 2);
}

interface OriginalOrder {
  cart: Cart;
  breadSel: BreadSelections;
  snackSel: SnackSelections;
  addToCart(id: number): void;
  removeFromCart(id: number): void;
  isOrderingOpen(): boolean;
  itemLabel(item: MenuItem): string;
  sendOrder(): void;
}

// Execute the original business functions verbatim. Only their UI/network side
// effects are replaced; no HTTP request or WhatsApp message is sent by tests.
function originalOrder(
  cart: Cart = {},
  breadSel: BreadSelections = {},
  snackSel: SnackSelections = {},
  details: OrderDetails = { name: 'Test customer', phone: '123456', addr: '', note: '' },
) {
  const opened: Array<{ url: string; target: string }> = [];
  const fields: Record<string, { value: string }> = {
    fName: { value: details.name }, fPhone: { value: details.phone },
    fAddr: { value: details.addr }, fNote: { value: details.note },
  };
  const context = createContext({
    Date, Intl,
    document: { getElementById: (id: string) => fields[id] },
    window: { open: (url: string, target: string) => { opened.push({ url, target }); return null; } },
    refreshCartUI: () => undefined, refreshCardCtrl: () => undefined,
    showToast: () => undefined, closeModal: () => undefined,
  });
  const evaluated: unknown = runInContext(
    originalMenu + '\n' +
    'const WA_NUMBER="33781658862", BUSINESS_NAME="Shree Krishna Nasta House";\n' +
    'const cart={},breadSel={},snackSel={};\n' +
    ['getItem', 'getBread', 'getSnack', 'itemLabel', 'addToCart', 'removeFromCart', 'isOrderingOpen', 'sendOrder']
      .map(originalFunction).join('\n') + '\n' +
    '({cart,breadSel,snackSel,addToCart,removeFromCart,isOrderingOpen,itemLabel,sendOrder})',
    context,
  );
  const original = evaluated as OriginalOrder;
  Object.assign(original.cart, cart);
  Object.assign(original.breadSel, breadSel);
  Object.assign(original.snackSel, snackSel);
  return { original, opened };
}

function compareMessage(
  cart: Cart,
  bread: BreadSelections = {},
  snack: SnackSelections = {},
  details: OrderDetails = { name: ' Test customer ', phone: ' +33 123456 ', addr: ' ', note: ' ' },
) {
  const { original, opened } = originalOrder(cart, bread, snack, details);
  const result = createOrderMessage(cart, bread, snack, details);
  original.sendOrder();
  expect(opened).toHaveLength(1);
  const openedOrder = opened[0];
  if (!openedOrder) throw new Error('Original order did not open WhatsApp');
  const url = new URL(openedOrder.url);
  expect(url.origin + url.pathname).toBe(`https://wa.me/${WA_NUMBER}`);
  expect(openedOrder.target).toBe('_blank');
  expect(url.searchParams.get('text')).toBe(result.message);
  const remaining = { ...cart };
  result.submittedIds.forEach((id) => { delete remaining[id]; });
  expect(remaining).toEqual({ ...original.cart });
  return result;
}

describe('original ordering business logic parity', () => {
  it('matches original messages for every product and meal choice', () => {
    for (const item of Object.values(MENU).flat()) {
      const quantity = Math.max(item.minQty || 1, Math.ceil(30 / item.price));
      const breadOptions = item.breadChoice ? ['Roti', 'Paratha'] as const : ['Roti'] as const;
      const snackOptions = item.snackChoice ? ['Khaman', 'Dhokla'] as const : ['Khaman'] as const;
      for (const bread of breadOptions) {
        for (const snack of snackOptions) {
          compareMessage({ [item.id]: quantity }, { [item.id]: bread }, { [item.id]: snack });
        }
      }
    }
  });

  it('preserves integer filtering, unknown IDs, the 99 limit and party minimum clamping', () => {
    const cart = { 1: 6, 2: 100, 3: 1.5, 4: 0, 5: -1, 6: Number.NaN, 7: Infinity, 18: 1, 27: 99, 999: 4 };
    const originalCart = { ...cart };
    const result = compareMessage(cart, { 27: 'Paratha' }, { 27: 'Dhokla' });
    expect(result.submittedIds).toEqual([1, 18, 27]);
    expect(result.total).toBe(4.99 * 6 + 6.99 * 5 + 23.99 * 99);
    expect(result.message).toContain('Qty: 5  x  €6.99  =  €34.95');
    expect(cart).toEqual(originalCart);
  });

  it('keeps numeric item order, trims customer fields and preserves multiline notes', () => {
    const cart: Cart = {};
    cart[27] = 5;
    cart[18] = 5;
    cart[1] = 6;
    const result = compareMessage(cart, { 27: 'Paratha' }, { 27: 'Dhokla' }, {
      name: '  Customer 🪔  ', phone: '  07 81 65 88 62  ',
      addr: '  10 Rue Test\nParis  ', note: '  No chilli & please call\nPickup preferred  ',
    });
    expect(result.submittedIds).toEqual([1, 18, 27]);
    expect(result.message).toContain('Name: Customer 🪔\n');
    expect(result.message).toContain('Address / Pickup: 10 Rue Test\nParis\n');
    expect(result.message).toContain('Note: No chilli & please call\nPickup preferred\n');
  });

  it('preserves the ceiling-based €30 eligibility quirk without adding a delivery claim', () => {
    const result = compareMessage({ 1: 6 });
    expect(result.total).toBeCloseTo(29.94);
    expect(Math.ceil(result.total)).toBe(30);
    expect(result.message).not.toContain('Qualifies for free delivery');
    expect(result.message).toContain('Address / Pickup: Will confirm on call');
    expect(result.message).not.toContain('\nNote:');
    expect(compareMessage({ 18: 5 }).message).toContain('Qualifies for free delivery');
  });

  it('retains option defaults and exact original labels for every item', () => {
    for (const bread of [{}, { 27: 'Paratha' as const }]) {
      for (const snack of [{}, { 27: 'Dhokla' as const }]) {
        const { original } = originalOrder({}, bread, snack);
        for (const item of Object.values(MENU).flat()) {
          expect(itemLabel(item, bread, snack)).toBe(original.itemLabel(item));
        }
      }
    }
    expect(getBread(27, {})).toBe('Roti');
    expect(getSnack(27, {})).toBe('Khaman');
  });

  it('matches original add/remove sequences without mutating previous state', () => {
    for (const item of Object.values(MENU).flat()) {
      const { original } = originalOrder();
      let cart: Cart = {};
      for (let count = 0; count < 101; count++) {
        const prior = { ...cart };
        const next = addItem(cart, item.id);
        original.addToCart(item.id);
        expect(next).toEqual({ ...original.cart });
        expect(cart).toEqual(prior);
        cart = next;
      }
      for (let count = 0; count < 102; count++) {
        const prior = { ...cart };
        const next = removeItem(cart, item.id);
        original.removeFromCart(item.id);
        expect(next).toEqual({ ...original.cart });
        expect(cart).toEqual(prior);
        cart = next;
      }
      expect(cart).toEqual({});
    }
  });

  it('uses the catalogue price for totals and ignores unknown IDs like original modal validation', () => {
    expect(cartTotal({ 1: 6, 27: 5, 999: 1000 })).toBe(4.99 * 6 + 23.99 * 5);
    expect(cartTotal({})).toBe(0);
  });

  it('matches Paris hours every day of 2026, including both daylight-saving transitions', () => {
    const { original } = originalOrder();
    for (let day = Date.UTC(2026, 0, 1); day < Date.UTC(2027, 0, 1); day += 86_400_000) {
      for (const minutes of [299, 300, 359, 360, 1079, 1080, 1139, 1140]) {
        const now = new Date(day + minutes * 60_000);
        vi.setSystemTime(now);
        expect(isOrderingOpen(now), now.toISOString()).toBe(original.isOrderingOpen());
      }
    }
  });

  it.each([
    ['2026-03-28T05:59:59Z', false], ['2026-03-28T06:00:00Z', true],
    ['2026-03-29T04:59:59Z', false], ['2026-03-29T05:00:00Z', true],
    ['2026-03-29T17:59:59Z', true], ['2026-03-29T18:00:00Z', false],
    ['2026-10-24T04:59:59Z', false], ['2026-10-24T05:00:00Z', true],
    ['2026-10-25T05:59:59Z', false], ['2026-10-25T06:00:00Z', true],
    ['2026-10-25T18:59:59Z', true], ['2026-10-25T19:00:00Z', false],
  ])('keeps exact opening boundary at %s', (iso, expected) => {
    expect(isOrderingOpen(new Date(iso))).toBe(expected);
  });

  it.each([
    '2026-01-31T12:34:00Z', '2028-02-28T12:34:00Z', '2028-02-29T12:34:00Z',
    '2026-03-28T12:34:00Z', '2026-03-29T12:34:00Z',
    '2026-10-24T12:34:00Z', '2026-10-25T12:34:00Z', '2026-12-31T12:34:00Z',
  ])('keeps original local reference/timestamp/tomorrow across %s', (iso) => {
    vi.setSystemTime(new Date(iso));
    compareMessage({ 27: 5 });
  });
});
