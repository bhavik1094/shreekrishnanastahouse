import { useRef, useState, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MENU } from '../data/menu';
import type { Category, MenuItem } from '../types';
import { getBread, getSnack } from '../lib/order';
import { responsiveImage } from '../lib/responsiveImages';
import { useOrder } from '../hooks/useOrder';
import { useGlassIndicator } from '../hooks/useGlassIndicator';
import { useTabPeek } from '../hooks/useTabPeek';

export function SectionHeading({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <div className="sec-hdr">
    <div className="sec-label">{label}</div>
    <h2 className="sec-title">{title}</h2>
    {children}
    <div className="orn">✦ ✦ ✦</div>
  </div>;
}

const tabs = [
  ['steamed', '🤍'], ['street', '🌶️'],
  ['sweet', '🍬'], ['specials', '⭐'], ['drinks', '🥛'],
] as const;

export function MenuSection() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState<Category>('steamed');
  const [selectionCount, setSelectionCount] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useGlassIndicator(tabsRef, `${active}-${selectionCount}-${i18n.resolvedLanguage}`, '.m-tab.active', '.tab-glass-indicator', true);
  useTabPeek(tabsRef, wrapRef);
  return <section id="menu">
    <SectionHeading label={t('menu.label')} title={t('menu.title')}>
      <p className="sec-sub">{t('menu.description')}</p>
    </SectionHeading>
    <div className="tabs-wrap" ref={wrapRef}>
      <div className="menu-tabs" ref={tabsRef}>
        <div className="tab-glass-indicator" id="tabGlassIndicator" aria-hidden="true"></div>
        {tabs.map(([category, emoji]) => <button key={category} className={`m-tab${active === category ? ' active' : ''}`} aria-pressed={active === category} onClick={() => { setActive(category); setSelectionCount((count) => count + 1); }}>{emoji} {t(`menu.categories.${category}`)}</button>)}
      </div>
      <span className="tabs-scroll-hint" aria-hidden="true">›</span>
    </div>
    {tabs.map(([category]) => <div className={`menu-panel${active === category ? ' active' : ''}`} id={`tab-${category}`} key={category}>
      <ProductGrid category={category} />
    </div>)}
  </section>;
}

export function PartyMenuSection() {
  const { t } = useTranslation();
  return <section id="party-menu">
    <SectionHeading label={t('menu.partyLabel')} title={t('menu.partyTitle')}>
      <p className="sec-sub"><Trans i18nKey="menu.partyDescription" components={{ strong: <strong /> }} /></p>
      <p className="party-advance-note">📅 <Trans i18nKey="menu.partyAdvance" components={{ strong: <strong /> }} /></p>
    </SectionHeading>
    <h3 className="party-subhdr"><span className="ps-orn">✦</span> {t('menu.categories.party')} <span className="ps-orn">✦</span></h3>
    <ProductGrid category="party" />
    <h3 className="party-subhdr"><span className="ps-orn">✦</span> {t('menu.categories.partymeals')} <span className="ps-orn">✦</span></h3>
    <ProductGrid category="partymeals" />
  </section>;
}

function ProductGrid({ category }: { category: Category }) {
  return <div className="menu-grid" id={`grid-${category}`}>{MENU[category].map((item) => <ProductCard item={item} key={item.id} />)}</div>;
}

function ProductOptionToggle<T extends string>({ id, value, options, onChange }: { id: string; value: T; options: readonly T[]; onChange: (choice: T) => void }) {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  useGlassIndicator(ref, `${value}-${selectionCount}-${i18n.resolvedLanguage}`, '.bt-opt.on', '.bt-glass-indicator');
  return <div className="bread-toggle" id={id} ref={ref} data-built="1">
    <div className="bt-glass-indicator" aria-hidden="true"></div>
    {options.map((option) => <button key={option} className={`bt-opt${value === option ? ' on' : ''}`} type="button" aria-pressed={value === option} onClick={() => { onChange(option); setSelectionCount((count) => count + 1); }}>{t(`choices.${option}`)}</button>)}
  </div>;
}

function ProductCard({ item }: { item: MenuItem }) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const { cart, breadSelections, snackSelections, selectBread, selectSnack, add, remove } = useOrder();
  const quantity = cart[item.id] || 0;
  const name = t(`products.${item.id}.name`);
  const imageSources = responsiveImage(item.photo);
  return <div className={`food-card${item.hero ? ' food-card-hero' : ''}`}>
    <div className="food-img" style={{ background: item.bg }}>
      {item.photo && !imageFailed ? <img src={item.photo} srcSet={imageSources?.srcSet} sizes={imageSources?.sizes} alt={name} loading="lazy" decoding="async" style={{ objectPosition: item.pos || 'center center' }} onError={() => setImageFailed(true)} /> : <span role="img" aria-label={name}>{item.emoji}</span>}
      {item.preorder ? <span className="preorder-badge">⏰ {t('menu.preorder')}</span> : null}
      {item.minQty ? <span className="party-badge"> {t('menu.minimumServings', { minimum: item.minQty })}</span> : null}
    </div>
    <div className="food-body">
      <div className="food-name">{name}<span className="food-unit">{t(`products.${item.id}.unit`)}</span></div>
      {/* Only bundled translation resources contain this markup; never customer input. */}
      <div className="food-desc" dangerouslySetInnerHTML={{ __html: t(`products.${item.id}.description`) }} />
      {item.breadChoice ? <div className="bread-row">
        <span className="bread-lbl">{t('menu.servedWith')}</span>
        <ProductOptionToggle id={`bread-${item.id}`} value={getBread(item.id, breadSelections)} options={['Roti', 'Paratha'] as const} onChange={(choice) => selectBread(item.id, choice)} />
      </div> : null}
      {item.snackChoice ? <div className="bread-row">
        <span className="bread-lbl">{t('menu.chooseOne')}</span>
        <ProductOptionToggle id={`snack-${item.id}`} value={getSnack(item.id, snackSelections)} options={['Khaman', 'Dhokla'] as const} onChange={(choice) => selectSnack(item.id, choice)} />
      </div> : null}
      <div className="food-foot">
        <span className="food-price">€{item.price.toFixed(2)}</span>
        <div id={`ctrl-${item.id}`}>
          {quantity === 0 ? <button className="add-btn" aria-label={t('menu.addItem', { name })} onClick={() => add(item.id)}>+ {t('menu.add')}</button> : <div className="qty-ctrl" key={quantity}>
            <button aria-label={t('menu.decreaseItem', { name })} onClick={() => remove(item.id)}>−</button>
            <span className="qty-n">{quantity}</span>
            <button aria-label={t('menu.increaseItem', { name })} onClick={() => add(item.id)}>+</button>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
