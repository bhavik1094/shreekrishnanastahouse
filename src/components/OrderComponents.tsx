import { useOrder } from '../hooks/useOrder';
import { getItem, itemLabel } from '../lib/order';

export function Navigation() {
  const { cart, hasRefreshed, openCart } = useOrder();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  return (
<nav>
  <a className="nav-logo" href="#">Shree Krishna <span>Nasta House</span></a>
  <ul className="nav-links">
    <li><a href="#menu">Menu</a></li>
    <li><a href="#party-menu" className="nav-party-link"> Party Menu</a></li>
    <li><a href="#story">Our Story</a></li>
    <li><a href="#packaging">Packaging</a></li>
  </ul>
  <button className="cart-btn" onClick={openCart}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    My Order
    <span className="cart-badge" id="cartBadge" style={hasRefreshed ? { display: count > 0 ? "flex" : "none" } : undefined}>{hasRefreshed ? count : null}</span>
  </button>
</nav>
  );
}

export function CartDrawer() {
  const { cart, breadSelections, snackSelections, hasRefreshed, refreshCount, summary, cartOpen, closeCart, add, remove, openModal } = useOrder();
  const ids = Object.keys(cart);
  const { total, belowMin, minLeft, closed, hasPreorder, hasParty } = summary;
  return <>
    <div className={`c-overlay${cartOpen ? ' open' : ''}`} id="cOverlay" onClick={closeCart}></div>
    <div className={`c-drawer${cartOpen ? ' open' : ''}`} id="cDrawer">
      <div className="c-head">
        <h3>Your Order 🛒</h3>
        <button className="x-btn" onClick={closeCart}>✕</button>
      </div>
      <div className="c-items" id="cItems">
        {ids.length === 0 ? <div className="c-empty">
          <div className="ei">🛒</div>
          <p>Your cart is empty.<br />{hasRefreshed ? 'Add some delicious nasta!' : 'Add something delicious!'}</p>
        </div> : ids.map((key) => {
          const id = Number(key);
          const item = getItem(id);
          const quantity = cart[id] || 0;
          if (!item) return null;
          return <div className="c-item" key={`${id}-${refreshCount}`}>
            <div className="c-item-info">
              <div className="c-item-name">{itemLabel(item, breadSelections, snackSelections)} {item.unit}</div>
              <div className="c-item-price">€{item.price.toFixed(2)} × {quantity} = €{(item.price * quantity).toFixed(2)}</div>
            </div>
            <div className="c-item-qty">
              <button onClick={() => remove(id)}>−</button>
              <span>{quantity}</span>
              <button onClick={() => add(id)}>+</button>
            </div>
          </div>;
        })}
      </div>
  <div className="c-foot" id="cFoot" style={{ display: ids.length ? "block" : "none" }}>
    <div className={`cart-closed-banner${closed ? " show" : ""}`} id="cartClosedBanner">
      <span className="ccb-icon">🌙</span>
      <p><strong>We're closed right now.</strong> Orders can be placed between <strong>7:00 AM and 8:00 PM</strong>, 7 days a week. Come back tomorrow morning and we'll be ready! 🪔</p>
    </div>
    <div className={`cart-minorder-banner${belowMin ? " show" : ""}`} id="cartMinorderBanner">
      <span className="cmb-icon">🛒</span>
      <p><strong>Minimum order is €30.</strong> Add <strong id="cartMinLeft">{minLeft}</strong> more to place your order. We deliver across <strong>Île-de-France</strong> only (Paris &amp; surrounding departments).</p>
    </div>
    <div className={`cart-preorder-warn${hasPreorder ? " show" : ""}`} id="cartPreorderWarn">
      <span className="cpw-icon">⏰</span>
      <p><strong>Pre-order notice:</strong> Your order includes Surti Undhiyu, which requires <strong>1 day advance notice</strong>. Please place your order today for tomorrow's delivery.</p>
    </div>
    <div className={`cart-party-note${hasParty ? " show" : ""}`} id="cartPartyNote">
      <span className="cpn-icon">🎉</span>
      <p><strong>Party Menu:</strong> These dishes are priced <strong>per person</strong> with a <strong>minimum of 5 servings each</strong>, and need to be ordered <strong>at least 1 day in advance</strong> of your event. Want to mix roti &amp; paratha for the same dish? Just mention the split in the <strong>order note</strong>.</p>
    </div>
    <div className="c-total">
      <span className="c-total-lbl">Order Total</span>
      <span className="c-total-amt" id="cTotal">€{total.toFixed(2)}</span>
    </div>
    <button className={`chk-btn${closed || belowMin ? " disabled" : ""}`} id="chkBtn" onClick={(event) => { event.preventDefault(); if (!closed && !belowMin) openModal(); }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M5.077 19.878c1.648.743 3.45 1.122 5.268 1.122 9.056 0 13.999-7.496 13.999-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59a9.72 9.72 0 0 1-2.83.776 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209"/></svg>
      Send on WhatsApp
    </button>
  </div>
    </div>
  </>;
}

export function OrderModal() {
  const { modalOpen, details, setField, closeModal, sendOrder } = useOrder();
  return (
<div className={`m-overlay${modalOpen ? " open" : ""}`} id="mOverlay">
  <div className="modal">
    <h3>Almost there! 🎉</h3>
    <p>Tell us who you are so we can confirm your order and arrange delivery.</p>
    <div className="fg">
      <label>Your Name</label>
      <input type="text" id="fName" value={details.name} onChange={(event) => setField("name", event.currentTarget.value)} placeholder="e.g. Shree Krishna" />
    </div>
    <div className="fg">
      <label>WhatsApp Number</label>
      <input type="tel" id="fPhone" value={details.phone} onChange={(event) => setField("phone", event.currentTarget.value)} placeholder="e.g. +33 6 12 34 56 78" />
    </div>
    <div className="fg">
      <label>Delivery Address (or choose pickup point)</label>
      <input type="text" id="fAddr" value={details.addr} onChange={(event) => setField("addr", event.currentTarget.value)} placeholder="Street, arrondissement… or Pickup: Gallieni / Montreuil" />
    </div>
    <div className="fg">
      <label>Any Special Request? (optional)</label>
      <input type="text" id="fNote" value={details.note} onChange={(event) => setField("note", event.currentTarget.value)} placeholder="e.g. extra spicy, no onion…" />
    </div>
    <div className="m-actions">
      <button className="btn-cancel" onClick={closeModal}>← Back</button>
      <button className="btn-send"   onClick={sendOrder}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
        Send Order
      </button>
    </div>
  </div>
</div>


  );
}
