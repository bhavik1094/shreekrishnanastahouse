import { useState } from 'react';

export function StorySection() {
  return (
    <section id="story">
      <div className="story-grid">
        <div className="story-visual">
          <div className="story-photo-placeholder">
            <div className="spp-icon">🪔</div>
            <p className="spp-text">A husband &amp; wife,<br />cooking with heart<br />in the heart of Paris.</p>
            <p className="spp-mantra">॥ Jay Shree Krishna ॥</p>
            
          </div>
          <div className="story-badge">
            <div className="n">🌿</div>
            <div className="l">100%<br />Vegetarian</div>
          </div>
        </div>
        <div className="story-text">
          <div className="sec-label">Behind the Kitchen</div>
          <h2 className="sec-title" style={{ fontStyle: "italic" }}>A family,<br />a tradition,<br />a promise.</h2>
          <div className="story-body">
            <p>We are a husband and wife duo, originally from <strong style={{ color: "var(--cream)" }}>Gujarat, India</strong>, now bringing the
              authentic flavours of our homeland to the streets of Paris.</p>
            <p>With <strong style={{ color: "var(--cream)" }}>over 9 years of professional culinary experience as a Chef in Paris</strong>,
              every dish carries the precision of a trained kitchen and the warmth of a home cook.
              Each item is prepared fresh daily using recipes passed down through generations.</p>
            <p>We deliver personally — together — because we want every order to feel like it came from family.</p>
          </div>
          <div className="story-feats">
            <div className="sfeat">
              <div className="sfeat-icon">👨‍🍳</div>
              <div className="sfeat-text">
                <strong>9+ Years as a Chef</strong>
                <span>Professional culinary experience in Paris — trained hands, authentic recipes, restaurant-quality taste at your doorstep.</span>
              </div>
            </div>
            <div className="sfeat">
              <div className="sfeat-icon">🌿</div>
              <div className="sfeat-text">
                <strong>100% Vegetarian</strong>
                <span>Every dish is fully vegetarian — made with love and no compromise.</span>
              </div>
            </div>
            <div className="sfeat">
              <div className="sfeat-icon">🚗</div>
              <div className="sfeat-text">
                <strong>Personal Delivery</strong>
                <span>We deliver it ourselves — no middlemen, no delays, no surprises.</span>
              </div>
            </div>
            <div className="sfeat">
              <div className="sfeat-icon">📞</div>
              <div className="sfeat-text">
                <strong>Always Reachable</strong>
                <span>Call or WhatsApp us on <a href="tel:+33781658862">07 81 65 88 62</a> or <a href="tel:+33769070003">07 69 07 00 03</a> for orders &amp; queries.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PackagingSection() {
  return (
    <section id="packaging">
      <div className="sec-hdr">
        <div className="sec-label">Reliable · Hygienic · Safe</div>
        <h2 className="sec-title">Packed with Care</h2>
        <p className="sec-sub">We take our packaging as seriously as the cooking itself.</p>
      </div>
      <div className="pack-grid">
        <div className="pack-card">
          <div className="pack-icon">🔒</div>
          <div className="pack-title">Spill-Proof Sealing</div>
          <div className="pack-desc">Every container is sealed air-tight so your food arrives exactly
            as it left our kitchen — no leaks, no mess, guaranteed.</div>
        </div>
        <div className="pack-card">
          <div className="pack-icon">🌡️</div>
          <div className="pack-title">Temperature Retained</div>
          <div className="pack-desc">Insulated packing keeps your tiffin warm during transit.
            Your dal will still be piping hot when you open it.</div>
        </div>
        <div className="pack-card">
          <div className="pack-icon">🌱</div>
          <div className="pack-title">Eco-Friendly Materials</div>
          <div className="pack-desc">We use food-grade, eco-conscious containers — because we care
            about your family and the environment equally.</div>
        </div>
      </div>
    </section>
  );
}

export function OrderCallToAction() {
  return (
    <section id="cta">
      <h2>Ready to Order? It's Simple.</h2>
      <p>Browse the menu, add to your cart, share your details — and we'll confirm &amp; deliver fresh Gujarati nasta to your door in Paris.</p>
      <a href="#menu" className="btn-wa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M5.077 19.878c1.648.743 3.45 1.122 5.268 1.122 9.056 0 13.999-7.496 13.999-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59a9.72 9.72 0 0 1-2.83.776 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209"/></svg>
        Browse &amp; Order
      </a>
    </section>
  );
}

export function Footer() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer>
      <p>© {year} <strong>Shree Krishna Nasta House</strong> · Authentic Gujarati Snacks · Paris, France · 🙏 Jay Shree Krishna</p>
      <p style={{ marginTop: "0.4rem" }}>Minimum order €30 · Free delivery · Île-de-France only · Pickup: Marie de Montreuil (M9) &amp; Gallieni (M3)</p>
      <p style={{ marginTop: "0.5rem" }}>
        <a href="https://www.instagram.com/shreekrishnanastahouseparis" target="_blank" rel="noopener"
           style={{ color: "rgba(251,245,232,0.65)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px", transition: "color 0.2s" }}
           onMouseOver={(event) => { event.currentTarget.style.color = '#E8A020'; }} onMouseOut={(event) => { event.currentTarget.style.color = 'rgba(251,245,232,0.65)'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: "0" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          @shreekrishnanastahouseparis
        </a>
      </p>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a className="wa-float" href="https://wa.me/33781658862" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.187-1.443A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 0 1-5.006-1.374l-.358-.214-3.724.869.937-3.618-.235-.372A9.79 9.79 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    </a>
  );
}

