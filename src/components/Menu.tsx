import { useRef, useState, type ReactNode } from 'react';
import { MENU } from '../data/menu';
import type { Category, MenuItem } from '../types';
import { getBread, getSnack } from '../lib/order';
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
  ['steamed', '🤍 Steamed Delights'], ['street', '🌶️ Street Specials'],
  ['sweet', '🍬 Sweet Treats'], ['specials', '⭐ Weekly Specials'], ['drinks', '🥛 Beverage'],
] as const;

export function MenuSection() {
  const [active, setActive] = useState<Category>('steamed');
  const [selectionCount, setSelectionCount] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  useGlassIndicator(tabsRef, `${active}-${selectionCount}`, '.m-tab.active', '.tab-glass-indicator', true);
  useTabPeek(tabsRef, wrapRef);
  return <section id="menu">
    <SectionHeading label="What We Make" title="Our Menu">
      <p className="sec-sub">Everything is prepared fresh daily using traditional Gujarati recipes. Order by WhatsApp for same-day delivery.</p>
    </SectionHeading>
    <div className="tabs-wrap" ref={wrapRef}>
      <div className="menu-tabs" ref={tabsRef}>
        <div className="tab-glass-indicator" id="tabGlassIndicator" aria-hidden="true"></div>
        {tabs.map(([category, label]) => <button key={category} className={`m-tab${active === category ? ' active' : ''}`} onClick={() => { setActive(category); setSelectionCount((count) => count + 1); }}>{label}</button>)}
      </div>
      <span className="tabs-scroll-hint" aria-hidden="true">›</span>
    </div>
    {tabs.map(([category]) => <div className={`menu-panel${active === category ? ' active' : ''}`} id={`tab-${category}`} key={category}>
      <ProductGrid category={category} />
    </div>)}
  </section>;
}

export function PartyMenuSection() {
  return <section id="party-menu">
    <SectionHeading label="Feeding a Crowd?" title="Party Menu">
      <p className="sec-sub">For groups of 5 or more — every dish below is priced <strong>per person</strong>, with a <strong>minimum of 5 servings per dish</strong>. Perfect for gatherings, pujas, birthdays &amp; get-togethers.</p>
      <p className="party-advance-note">📅 Party orders need to be placed <strong>at least 1 day in advance</strong> of your event.</p>
    </SectionHeading>
    <h3 className="party-subhdr"><span className="ps-orn">✦</span> Nasta &amp; Snacks <span className="ps-orn">✦</span></h3>
    <ProductGrid category="party" />
    <h3 className="party-subhdr"><span className="ps-orn">✦</span> Full Meals <span className="ps-orn">✦</span></h3>
    <ProductGrid category="partymeals" />
  </section>;
}

function ProductGrid({ category }: { category: Category }) {
  return <div className="menu-grid" id={`grid-${category}`}>{MENU[category].map((item) => <ProductCard item={item} key={item.id} />)}</div>;
}

function ProductOptionToggle<T extends string>({ id, value, options, onChange }: { id: string; value: T; options: readonly T[]; onChange: (choice: T) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  useGlassIndicator(ref, `${value}-${selectionCount}`, '.bt-opt.on', '.bt-glass-indicator');
  return <div className="bread-toggle" id={id} ref={ref} data-built="1">
    <div className="bt-glass-indicator" aria-hidden="true"></div>
    {options.map((option) => <button key={option} className={`bt-opt${value === option ? ' on' : ''}`} type="button" onClick={() => { onChange(option); setSelectionCount((count) => count + 1); }}>{option}</button>)}
  </div>;
}

function ProductCard({ item }: { item: MenuItem }) {
  const { cart, breadSelections, snackSelections, selectBread, selectSnack, add, remove } = useOrder();
  const quantity = cart[item.id] || 0;
  return <div className={`food-card${item.hero ? ' food-card-hero' : ''}`}>
    <div className="food-img" style={{ background: item.bg }}>
      {item.photo ? <img src={item.photo} alt={item.name} style={{ objectPosition: item.pos || 'center center' }} onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : item.emoji}
      {item.preorder ? <span className="preorder-badge">⏰ Pre-order</span> : null}
      {item.minQty ? <span className="party-badge"> Min {item.minQty} servings</span> : null}
    </div>
    <div className="food-body">
      <div className="food-name">{item.name}<span className="food-unit">{item.unit}</span></div>
      {/* Only immutable, local catalogue descriptions contain markup; never customer input. */}
      <div className="food-desc" dangerouslySetInnerHTML={{ __html: item.desc }} />
      {item.breadChoice ? <div className="bread-row">
        <span className="bread-lbl">Served with · 3 pcs</span>
        <ProductOptionToggle id={`bread-${item.id}`} value={getBread(item.id, breadSelections)} options={['Roti', 'Paratha'] as const} onChange={(choice) => selectBread(item.id, choice)} />
      </div> : null}
      {item.snackChoice ? <div className="bread-row">
        <span className="bread-lbl">Choose one</span>
        <ProductOptionToggle id={`snack-${item.id}`} value={getSnack(item.id, snackSelections)} options={['Khaman', 'Dhokla'] as const} onChange={(choice) => selectSnack(item.id, choice)} />
      </div> : null}
      <div className="food-foot">
        <span className="food-price">€{item.price.toFixed(2)}</span>
        <div id={`ctrl-${item.id}`}>
          {quantity === 0 ? <button className="add-btn" onClick={() => add(item.id)}>+ Add</button> : <div className="qty-ctrl" key={quantity}>
            <button onClick={() => remove(item.id)}>−</button>
            <span className="qty-n">{quantity}</span>
            <button onClick={() => add(item.id)}>+</button>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
