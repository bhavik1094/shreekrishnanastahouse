import { useRef } from 'react';
import { useHeroCanvas } from '../hooks/useHeroCanvas';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useHeroCanvas(heroRef, canvasRef);

  return (
    <>
      <section id="hero" ref={heroRef}>
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <canvas id="heroCanvas" ref={canvasRef}></canvas>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow hero-text-reveal htr-1">Homemade · Gujarati · Delivered in Paris</div>
            <h1 className="hero-title hero-text-reveal htr-2">Authentic<br /><em>Gujarati</em><br />Nasta.</h1>
            <p className="hero-desc hero-text-reveal htr-3">
              Traditional Gujarati snacks — made fresh daily by hand, packed with love,
              and delivered personally to your door in Paris. 100% vegetarian.
            </p>
            <div className="hero-cta hero-text-reveal htr-4">
              <a href="#menu" className="btn-primary">Order Now</a>
              <a href="#story" className="btn-ghost">Our Story</a>
            </div>
          </div>
        </div>
      
        
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "3", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "14px 24px", background: "linear-gradient(to top, rgba(26,10,0,0.72) 0%, transparent 100%)" }}>
          <span style={{ flex: "1", maxWidth: "120px", height: "1px", background: "linear-gradient(to right,transparent,rgba(244,168,32,0.6))", display: "block" }}></span>
          <span style={{ fontFamily: "'Crimson Text',Georgia,serif", fontStyle: "italic", fontSize: "clamp(1.4rem,3vw,2.2rem)", color: "rgba(255,225,140,0.95)", letterSpacing: "0.22em", textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>॥ Jay Shree Krishna ॥</span>
          <span style={{ flex: "1", maxWidth: "120px", height: "1px", background: "linear-gradient(to left,transparent,rgba(244,168,32,0.6))", display: "block" }}></span>
        </div>
      </section>
      
      
      <div id="hero-mobile-text">
        <div className="orn-mobile">✦ ✦ ✦</div>
        <div className="hero-eyebrow">Homemade · Gujarati · Delivered in Paris</div>
        <h1 className="hero-title">Authentic<br /><em>Gujarati</em><br />Nasta.</h1>
        <p className="hero-desc">
          Traditional Gujarati snacks — made fresh daily by hand, packed with love,
          and delivered personally to your door in Paris. 100% vegetarian.
        </p>
        <div className="hero-cta">
          <a href="#menu" className="btn-primary">🍽 Order Now</a>
          <a href="#story" className="btn-ghost">Our Story</a>
        </div>
      </div>
    </>
  );
}
