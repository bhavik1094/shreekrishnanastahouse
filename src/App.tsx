import { OrderProvider, useOrder } from './hooks/useOrder';
import { Hero } from './components/Hero';
import { Footer, FloatingWhatsApp, OrderCallToAction, PackagingSection, StorySection } from './components/StaticSections';
import { Navigation, CartDrawer, OrderModal } from './components/OrderComponents';
import { MenuSection, PartyMenuSection } from './components/Menu';
import { useDialogFocus } from './hooks/useDialogFocus';

function Storefront() {
  const { toast, cartOpen, modalOpen, closeCart, closeModal } = useOrder();
  useDialogFocus(modalOpen ? 'checkout-dialog' : cartOpen ? 'cDrawer' : null, modalOpen ? closeModal : closeCart, 'order-cart-trigger');
  return <>
    <div inert={cartOpen || modalOpen}>
    <Navigation />
    <main id="main-content">
    <Hero />
    <MenuSection />
    <PartyMenuSection />
    <StorySection />
    <PackagingSection />
    <OrderCallToAction />
    </main>
    <Footer />
    <FloatingWhatsApp />
    </div>
    <CartDrawer />
    <OrderModal />
    <div className={`toast${toast.visible ? ' show' : ''}`} id="toast" role="status" aria-live="polite">{toast.message}</div>
  </>;
}

export default function App() {
  return <OrderProvider><Storefront /></OrderProvider>;
}
