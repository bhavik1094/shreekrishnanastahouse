import { useEffect, useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useOrder } from '../hooks/useOrder';
import { getBread, getItem, getSnack } from '../lib/order';
import { LanguageSelector } from './LanguageSelector';

export function Navigation() {
  const { t } = useTranslation();
  const { cart, hasRefreshed, cartOpen, openCart } = useOrder();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  return (
<nav aria-label={t('navigation.label')}>
  <a className="nav-logo" href="#">{t('navigation.brandFirst')} <span>{t('navigation.brandSecond')}</span></a>
  <ul className="nav-links">
    <li><a href="#menu">{t('navigation.menu')}</a></li>
    <li><a href="#party-menu" className="nav-party-link">{t('navigation.partyMenu')}</a></li>
    <li><a href="#story">{t('navigation.story')}</a></li>
    <li><a href="#packaging">{t('navigation.packaging')}</a></li>
  </ul>
  <div className="nav-actions">
  <LanguageSelector />
  <button className="cart-btn" id="order-cart-trigger" onClick={openCart} aria-label={t('cart.open', { count })} aria-haspopup="dialog" aria-controls="cDrawer" aria-expanded={cartOpen}>
    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    {t('navigation.order')}
    <span className="cart-badge" id="cartBadge" style={hasRefreshed ? { display: count > 0 ? "flex" : "none" } : undefined}>{hasRefreshed ? count : null}</span>
  </button>
  </div>
</nav>
  );
}

export function CartDrawer() {
  const { t } = useTranslation();
  const { cart, breadSelections, snackSelections, hasRefreshed, summary, cartOpen, closeCart, add, remove, openModal } = useOrder();
  const ids = Object.keys(cart);
  const { total, belowMin, minLeft, closed, hasPreorder, hasParty } = summary;
  return <>
    <div className={`c-overlay${cartOpen ? ' open' : ''}`} id="cOverlay" onClick={closeCart} aria-hidden="true"></div>
    <div className={`c-drawer${cartOpen ? ' open' : ''}`} id="cDrawer" role="dialog" aria-modal={cartOpen || undefined} inert={!cartOpen} aria-hidden={!cartOpen} aria-labelledby="cart-title" tabIndex={-1}>
      <div className="c-head">
        <h3 id="cart-title">{t('cart.title')} 🛒</h3>
        <button className="x-btn" onClick={closeCart} aria-label={t('cart.close')} data-dialog-initial-focus>✕</button>
      </div>
      <div className="c-items" id="cItems">
        {ids.length === 0 ? <div className="c-empty">
          <div className="ei">🛒</div>
          <p>{t('cart.empty')}<br />{t(hasRefreshed ? 'cart.emptyAfterUpdate' : 'cart.emptyInitial')}</p>
        </div> : ids.map((key) => {
          const id = Number(key);
          const item = getItem(id);
          const quantity = cart[id] || 0;
          if (!item) return null;
          let label = t(`products.${id}.name`);
          if (item.breadChoice) label += ` + ${t('cart.breadPortion', { bread: t(`choices.${getBread(id, breadSelections)}`), quantity: 3 })}`;
          if (item.snackChoice) label += ` + ${t(`choices.${getSnack(id, snackSelections)}`)}`;
          return <div className="c-item" key={id}>
            <div className="c-item-info">
              <div className="c-item-name">{label} {t(`products.${id}.unit`)}</div>
              <div className="c-item-price">€{item.price.toFixed(2)} × {quantity} = €{(item.price * quantity).toFixed(2)}</div>
            </div>
            <div className="c-item-qty">
              <button onClick={() => remove(id)} aria-label={t('cart.decrease', { product: label })}>−</button>
              <span>{quantity}</span>
              <button onClick={() => add(id)} aria-label={t('cart.increase', { product: label })}>+</button>
            </div>
          </div>;
        })}
      </div>
  <div className="c-foot" id="cFoot" style={{ display: ids.length ? "block" : "none" }}>
    <div className={`cart-closed-banner${closed ? " show" : ""}`} id="cartClosedBanner">
      <span className="ccb-icon">🌙</span>
      <p><Trans i18nKey="cart.closedNotice" values={{ opens: t('hours.opens'), closes: t('hours.closes'), days: 7 }} /></p>
    </div>
    <div className={`cart-minorder-banner${belowMin ? " show" : ""}`} id="cartMinorderBanner">
      <span className="cmb-icon">🛒</span>
      <p><Trans i18nKey="cart.minimumNotice" values={{ minimum: '€30', remaining: minLeft }} components={{ remaining: <strong id="cartMinLeft" /> }} /></p>
    </div>
    <div className={`cart-preorder-warn${hasPreorder ? " show" : ""}`} id="cartPreorderWarn">
      <span className="cpw-icon">⏰</span>
      <p><Trans i18nKey="cart.preorderNotice" values={{ product: t('products.13.name'), days: 1 }} /></p>
    </div>
    <div className={`cart-party-note${hasParty ? " show" : ""}`} id="cartPartyNote">
      <span className="cpn-icon">🎉</span>
      <p><Trans i18nKey="cart.partyNotice" values={{ minimum: 5, days: 1 }} /></p>
    </div>
    <div className="c-total">
      <span className="c-total-lbl">{t('cart.total')}</span>
      <span className="c-total-amt" id="cTotal">€{total.toFixed(2)}</span>
    </div>
    <button className={`chk-btn${closed || belowMin ? " disabled" : ""}`} id="chkBtn" aria-disabled={closed || belowMin} onClick={(event) => { event.preventDefault(); if (!closed && !belowMin) openModal(); }}>
      <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M5.077 19.878c1.648.743 3.45 1.122 5.268 1.122 9.056 0 13.999-7.496 13.999-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59a9.72 9.72 0 0 1-2.83.776 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209"/></svg>
      {t('cart.checkout')}
    </button>
  </div>
    </div>
  </>;
}

export function OrderModal() {
  const { t } = useTranslation();
  const { modalOpen, details, setField, closeModal, sendOrder } = useOrder();
  const [attempted, setAttempted] = useState(false);
  useEffect(() => { if (!modalOpen) setAttempted(false); }, [modalOpen]);
  const nameInvalid = attempted && !details.name.trim();
  const phoneInvalid = attempted && !details.phone.trim();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    sendOrder();
    if (!details.name.trim()) document.getElementById('fName')?.focus();
    else if (!details.phone.trim()) document.getElementById('fPhone')?.focus();
  };
  return (
<div className={`m-overlay${modalOpen ? " open" : ""}`} id="mOverlay" inert={!modalOpen} aria-hidden={!modalOpen}>
  <div className="modal" id="checkout-dialog" role="dialog" aria-modal={modalOpen || undefined} aria-labelledby="checkout-title" aria-describedby="checkout-description" tabIndex={-1}>
    <h3 id="checkout-title">{t('checkout.title')} 🎉</h3>
    <p id="checkout-description">{t('checkout.description')}</p>
    <form noValidate onSubmit={submit}>
    {nameInvalid || phoneInvalid ? <p id="checkout-required-error" className="sr-only">{t('notices.requiredDetails')}</p> : null}
    <div className="fg">
      <label htmlFor="fName">{t('checkout.name')}</label>
      <input type="text" id="fName" name="name" autoComplete="name" aria-required="true" aria-invalid={nameInvalid || undefined} aria-describedby={nameInvalid ? 'checkout-required-error' : undefined} data-dialog-initial-focus value={details.name} onChange={(event) => setField("name", event.currentTarget.value)} placeholder={t('checkout.namePlaceholder')} />
    </div>
    <div className="fg">
      <label htmlFor="fPhone">{t('checkout.phone')}</label>
      <input type="tel" id="fPhone" name="phone" autoComplete="tel" aria-required="true" aria-invalid={phoneInvalid || undefined} aria-describedby={phoneInvalid ? 'checkout-required-error' : undefined} value={details.phone} onChange={(event) => setField("phone", event.currentTarget.value)} placeholder={t('checkout.phonePlaceholder', { phone: '+33 6 12 34 56 78' })} />
    </div>
    <div className="fg">
      <label htmlFor="fAddr">{t('checkout.address')}</label>
      <input type="text" id="fAddr" name="address" autoComplete="street-address" value={details.addr} onChange={(event) => setField("addr", event.currentTarget.value)} placeholder={t('checkout.addressPlaceholder')} />
    </div>
    <div className="fg">
      <label htmlFor="fNote">{t('checkout.note')}</label>
      <input type="text" id="fNote" name="note" value={details.note} onChange={(event) => setField("note", event.currentTarget.value)} placeholder={t('checkout.notePlaceholder')} />
    </div>
    <div className="m-actions">
      <button className="btn-cancel" type="button" onClick={closeModal}>← {t('checkout.back')}</button>
      <button className="btn-send" type="submit">
        <svg aria-hidden="true" focusable="false" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
        {t('checkout.send')}
      </button>
    </div>
    </form>
  </div>
</div>


  );
}
