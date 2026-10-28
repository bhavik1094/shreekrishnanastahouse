import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { addItem, cartTotal, createOrderMessage, getItem, isOrderingOpen, removeItem, WA_NUMBER } from '../lib/order';
import { createOrderNotifier } from '../lib/orderNotifications';
import type { BreadChoice, BreadSelections, Cart, OrderDetails, SnackChoice, SnackSelections } from '../types';

const emptyDetails: OrderDetails = { name: '', phone: '', addr: '', note: '' };

function useOrderState() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<Cart>({});
  const [breadSelections, setBreadSelections] = useState<BreadSelections>({});
  const [snackSelections, setSnackSelections] = useState<SnackSelections>({});
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [summary, setSummary] = useState({
    total: 0, belowMin: false, minLeft: '', hasPreorder: false, hasParty: false,
  });
  const [orderingOpen, setOrderingOpen] = useState(() => isOrderingOpen());
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState<OrderDetails>(emptyDetails);
  const [toast, setToast] = useState<{ key: string; values: Record<string, string | number>; visible: boolean }>({ key: '', values: {}, visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const submitting = useRef(false);
  const notifier = useRef<ReturnType<typeof createOrderNotifier> | null>(null);
  if (!notifier.current) notifier.current = createOrderNotifier();
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => setOrderingOpen(isOrderingOpen());
    const tick = () => {
      update();
      timer = setTimeout(tick, 60_000 - Date.now() % 60_000 + 25);
    };
    const onVisibility = () => { if (!document.hidden) update(); };
    tick();
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  function showToast(key: string, values: Record<string, string | number> = {}, duration = 2600) {
    clearTimeout(toastTimer.current);
    setToast({ key, values, visible: true });
    toastTimer.current = setTimeout(() => setToast((current) => ({ ...current, visible: false })), duration);
  }

  function refresh(nextCart: Cart) {
    setOrderingOpen(isOrderingOpen());
    setHasRefreshed(true);
    setRefreshCount((count) => count + 1);
    const ids = Object.keys(nextCart);
    if (!ids.length) return; // The hidden footer retains its last values in the original.
    const total = cartTotal(nextCart);
    const belowMin = Math.ceil(total) < 30;
    setSummary((previous) => ({
      total, belowMin,
      minLeft: belowMin ? '€' + (30 - total).toFixed(2) : previous.minLeft,
      hasPreorder: ids.some((id) => Boolean(getItem(Number(id))?.preorder)),
      hasParty: ids.some((id) => Boolean(getItem(Number(id))?.minQty)),
    }));
  }

  function hasInvalidQuantities() {
    return Object.entries(cart).some(([id, quantity]) => {
      const item = getItem(Number(id));
      return !item || !Number.isInteger(quantity) || quantity < (item.minQty || 1) || quantity > 99;
    });
  }

  function add(id: number) {
    const minimum = getItem(id)?.minQty || 1;
    const firstPartyServing = !cart[id] && minimum > 1;
    const next = addItem(cart, id);
    setCart(next);
    refresh(next);
    showToast(firstPartyServing ? 'notices.partyAdded' : 'notices.added', { minimum });
  }

  function remove(id: number) {
    if (!cart[id]) return;
    const minimum = getItem(id)?.minQty || 1;
    const next = removeItem(cart, id);
    if (!next[id] && minimum > 1) showToast('notices.partyRemoved', { minimum });
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
    if (!Object.keys(cart).length) { showToast('notices.empty'); return; }
    if (!isOrderingOpen()) { showToast('notices.closed'); return; }
    if (hasInvalidQuantities()) { showToast('notices.invalidQuantity', { maximum: 99 }); return; }
    if (Math.ceil(cartTotal(cart)) < 30) { showToast('notices.minimum', { minimum: '€30' }); return; }
    submitting.current = false;
    setCartOpen(false);
    setModalOpen(true);
  }

  function sendOrder() {
    if (!modalOpen || submitting.current) return;
    if (!isOrderingOpen()) {
      showToast('notices.closed');
      setModalOpen(false);
      return;
    }
    if (hasInvalidQuantities()) { showToast('notices.invalidQuantity', { maximum: 99 }); return; }
    const order = createOrderMessage(cart, breadSelections, snackSelections, details);
    if (!order.submittedIds.length) { showToast('notices.empty'); setModalOpen(false); return; }
    if (Math.ceil(order.total) < 30) { showToast('notices.minimum', { minimum: '€30' }); setModalOpen(false); return; }
    if (!details.name.trim() || !details.phone.trim()) { showToast('notices.requiredDetails'); return; }

    submitting.current = true;
    let checkoutWindow: Window | null;
    try {
      checkoutWindow = window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(order.message)}`, '_blank');
    } catch {
      checkoutWindow = null;
    }
    // Opening WhatsApp stays synchronous. This optional request never gates checkout.
    void notifier.current?.notify(order, details);
    if (!checkoutWindow) {
      submitting.current = false;
      showToast('notices.whatsappBlocked', {}, 5000);
      return;
    }
    // Keep a handle to detect blocked windows; the noopener feature returns null even on success.
    try { checkoutWindow.opener = null; } catch { /* The destination may already be cross-origin. */ }
    notifier.current?.reset();
    const next = { ...cart };
    order.submittedIds.forEach((id) => { delete next[id]; });
    setCart(next);
    refresh(next);
    setModalOpen(false);
    setDetails(emptyDetails);
    showToast('notices.sent', {}, 5000);
  }

  return {
    cart, breadSelections, snackSelections, hasRefreshed, refreshCount, summary: { ...summary, closed: !orderingOpen },
    cartOpen, modalOpen, details, toast: { message: toast.key ? t(toast.key, toast.values) : '', visible: toast.visible }, add, remove, selectBread, selectSnack,
    openCart: () => { setOrderingOpen(isOrderingOpen()); setCartOpen(true); }, closeCart: () => setCartOpen(false),
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
