import { OrderProvider, useOrder } from './hooks/useOrder';
import { Hero } from './components/Hero';
import { Footer, FloatingWhatsApp, OrderCallToAction, PackagingSection, StorySection } from './components/StaticSections';
import { Navigation, CartDrawer, OrderModal } from './components/OrderComponents';
import { MenuSection, PartyMenuSection } from './components/Menu';

function Storefront() {
  const { toast } = useOrder();
  return <>
    <Navigation />
    <Hero />
    <MenuSection />
    <PartyMenuSection />
    <StorySection />
    <PackagingSection />
    <OrderCallToAction />
    <Footer />
    <CartDrawer />
    <OrderModal />
    <FloatingWhatsApp />
    <div className={`toast${toast.visible ? ' show' : ''}`} id="toast">{toast.message}</div>
  </>;
}

export default function App() {
  return <OrderProvider><Storefront /></OrderProvider>;
}
