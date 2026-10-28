import { MENU } from '../data/menu';
import type {
  BreadChoice,
  BreadSelections,
  Cart,
  MenuItem,
  OrderDetails,
  OrderMessage,
  SnackChoice,
  SnackSelections,
} from '../types';

export const WA_NUMBER = '33781658862';
export const BUSINESS_NAME = 'Shree Krishna Nasta House';

export function getItem(id: number): MenuItem | undefined {
  return Object.values(MENU).flat().find((item) => item.id === id);
}

export function getBread(id: number, selections: BreadSelections): BreadChoice {
  return selections[id] === 'Paratha' ? 'Paratha' : 'Roti';
}

export function getSnack(id: number, selections: SnackSelections): SnackChoice {
  return selections[id] === 'Dhokla' ? 'Dhokla' : 'Khaman';
}

export function itemLabel(
  item: MenuItem,
  breadSelections: BreadSelections,
  snackSelections: SnackSelections,
): string {
  let label = item.name;
  if (item.breadChoice) label += ` + ${getBread(item.id, breadSelections)} (3 pcs)`;
  if (item.snackChoice) label += ` + ${getSnack(item.id, snackSelections)}`;
  return label;
}

export function isOrderingOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now);
  const hour = Number.parseInt(parts.find((part) => part.type === 'hour')?.value ?? '', 10);
  return hour >= 7 && hour < 20;
}

export function cartTotal(cart: Cart): number {
  return Object.entries(cart).reduce((sum, [id, quantity]) => {
    const item = getItem(Number(id));
    return sum + (item ? item.price * quantity : 0);
  }, 0);
}

export function addItem(cart: Cart, id: number): Cart {
  const minQty = getItem(id)?.minQty || 1;
  const quantity = cart[id] || 0;
  return { ...cart, [id]: !quantity && minQty > 1 ? minQty : quantity + 1 };
}

export function removeItem(cart: Cart, id: number): Cart {
  const quantity = cart[id];
  if (!quantity) return cart;
  const minQty = getItem(id)?.minQty || 1;
  const nextCart = { ...cart, [id]: quantity - 1 };
  if (quantity - 1 < minQty) delete nextCart[id];
  return nextCart;
}

export function createOrderMessage(
  cart: Cart,
  breadSelections: BreadSelections,
  snackSelections: SnackSelections,
  details: OrderDetails,
  now: Date = new Date(),
): OrderMessage {
  const items = Object.entries(cart).flatMap(([id, quantity]) => {
    const item = getItem(Number(id));
    return item && Number.isInteger(quantity) && quantity > 0 && quantity <= 99
      ? [{ item, quantity }]
      : [];
  });

  const itemLines: string[] = [];
  let total = 0;
  items.forEach(({ item, quantity }, index) => {
    const minQ = item.minQty || 1;
    const qty = Math.max(minQ, Math.min(99, Math.floor(quantity)));
    const sub = item.price * qty;
    total += sub;
    itemLines.push(`${index + 1}. ${itemLabel(item, breadSelections, snackSelections)} ${item.unit}`);
    itemLines.push(`    Qty: ${qty}  x  €${item.price.toFixed(2)}  =  €${sub.toFixed(2)}`);
  });

  const hasPartyItems = items.some(({ item }) => (item.minQty || 1) > 1);
  const name = details.name.trim();
  const phone = details.phone.trim();
  const addr = details.addr.trim();
  const note = details.note.trim();

  const orderRef = 'SK-' + now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') +
    '-' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  const placedAt = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  let partyLine: string | null = null;
  if (hasPartyItems) {
    const earliest = new Date(now);
    earliest.setDate(earliest.getDate() + 1);
    const earliestStr = earliest.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    partyLine = 'Note: This order includes Party Menu items \u2014 earliest delivery/pickup date is ' + earliestStr + '.';
  }

  const line = '------------------------------';
  const message = [
    'NEW ORDER \u2014 ' + BUSINESS_NAME,
    'Order Ref: ' + orderRef,
    'Placed: ' + placedAt,
    '',
    'CUSTOMER DETAILS',
    'Name: ' + name,
    'Phone: ' + phone,
    'Address / Pickup: ' + (addr || 'Will confirm on call'),
    note ? 'Note: ' + note : null,
    line,
    'ORDER DETAILS',
    itemLines.join('\n'),
    line,
    'TOTAL: \u20AC' + total.toFixed(2),
    total >= 30 ? 'Qualifies for free delivery' : null,
    partyLine,
    '',
    'Kindly confirm my order.',
    'Jay Shree Krishna',
  ].filter((part) => part !== null && part !== undefined).join('\n').trim();

  return { message, submittedIds: items.map(({ item }) => item.id), total };
}
