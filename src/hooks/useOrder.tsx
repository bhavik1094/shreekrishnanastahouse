import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { addItem, cartTotal, createOrderMessage, getItem, isOrderingOpen, removeItem, WA_NUMBER } from '../lib/order';
import type { BreadChoice, BreadSelections, Cart, OrderDetails, SnackChoice, SnackSelections } from '../types';

const emptyDetails: OrderDetails = { name: '', phone: '', addr: '', note: '' };

function useOrderState() {
  const [cart, setCart] = useState<Cart>({});
  const [breadSelections, setBreadSelections] = useState<BreadSelections>({});
  const [snackSelections, setSnackSelections] = useState<SnackSelections>({});
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [summary, setSummary] = useState({
    total: 0, belowMin: false, minLeft: '', closed: false, hasPreorder: false, hasParty: false,
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState<OrderDetails>(emptyDetails);
  const [toast, setToast] = useState({ message: '', visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message: string, duration = 2600) {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => setToast((current) => ({ ...current, visible: false })), duration);
  }

  // The original refreshes the opening-hours banner only on cart/option updates.
  function refresh(nextCart: Cart) {
    setHasRefreshed(true);
    setRefreshCount((count) => count + 1);
    const ids = Object.keys(nextCart);
    if (!ids.length) return; // The hidden footer retains its last values in the original.
    const total = cartTotal(nextCart);
    const belowMin = Math.ceil(total) < 30;
    setSummary((previous) => ({
      total, belowMin,
      minLeft: belowMin ? '€' + (30 - total).toFixed(2) : previous.minLeft,
      closed: !isOrderingOpen(),
      hasPreorder: ids.some((id) => Boolean(getItem(Number(id))?.preorder)),
      hasParty: ids.some((id) => Boolean(getItem(Number(id))?.minQty)),
    }));
  }

  function add(id: number) {
    const minimum = getItem(id)?.minQty || 1;
    const firstPartyServing = !cart[id] && minimum > 1;
    const next = addItem(cart, id);
    setCart(next);
    refresh(next);
    showToast(firstPartyServing ? `Party item — starts at ${minimum} servings ✓` : 'Added to order ✓');
  }

  function remove(id: number) {
    if (!cart[id]) return;
    const minimum = getItem(id)?.minQty || 1;
    const next = removeItem(cart, id);
    if (!next[id] && minimum > 1) showToast(`Minimum is ${minimum} servings — item removed`);
    setCart(next);
    refresh(next);
  }

  function selectBread(id: number, choice: BreadChoice) {
    setBreadSelections((current) => ({ ...current, [id]: choice }));
    refresh(cart);
  }

  function selectSnack(id: number, choice: SnackChoice) {
    setSnackSelections((current) => ({ ...current, [id]: choice }));
    refresh(cart);
  }

  function openModal() {
    if (!Object.keys(cart).length) { showToast('Your cart is empty!'); return; }
    if (!isOrderingOpen()) { showToast('Orders open 7 AM – 8 PM. Try again tomorrow! 🌙'); return; }
    if (Math.ceil(cartTotal(cart)) < 30) { showToast('Minimum order is €30. Keep adding! 🛒'); return; }
    setCartOpen(false);
    setModalOpen(true);
  }

  function sendOrder() {
    if (!isOrderingOpen()) {
      showToast('Orders open 7 AM – 8 PM. Try again tomorrow! 🌙');
      setModalOpen(false);
      return;
    }
    const order = createOrderMessage(cart, breadSelections, snackSelections, details);
    if (!order.submittedIds.length) { showToast('Your cart is empty!'); setModalOpen(false); return; }
    if (Math.ceil(order.total) < 30) { showToast('Minimum order is €30. Keep adding! 🛒'); setModalOpen(false); return; }
    if (!details.name.trim() || !details.phone.trim()) { showToast('Please enter your name & phone number!'); return; }

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(order.message)}`, '_blank');
    const next = { ...cart };
    order.submittedIds.forEach((id) => { delete next[id]; });
    setCart(next);
    refresh(next);
    setModalOpen(false);
    setDetails(emptyDetails);
    showToast("Order sent! We'll confirm shortly.", 5000);
  }

  return {
    cart, breadSelections, snackSelections, hasRefreshed, refreshCount, summary,
    cartOpen, modalOpen, details, toast, add, remove, selectBread, selectSnack,
    openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    openModal, closeModal: () => setModalOpen(false), sendOrder,
    setField: (field: keyof OrderDetails, value: string) => setDetails((current) => ({ ...current, [field]: value })),
  };
}

const OrderContext = createContext<ReturnType<typeof useOrderState> | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const order = useOrderState();
  return <OrderContext.Provider value={order}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const order = useContext(OrderContext);
  if (!order) throw new Error('OrderProvider is required');
  return order;
}
