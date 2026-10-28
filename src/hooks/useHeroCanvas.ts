import { useEffect, type RefObject } from 'react';

interface Bird {
  x: number;
  y: number;
  speed: number;
  maxX: number;
  wingPhase: number;
  wingSpeed: number;
  size: number;
  opacity: number;
}

interface Note {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  char: string;
  size: number;
  rot: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  decay: number;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  life: number;
  color: string;
}

/** The original frame-based hero animation, with React lifecycle cleanup. */
export function useHeroCanvas(
  heroRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const canvasElement = canvasRef.current;
    const heroElement = heroRef.current;
    if (!canvasElement || !heroElement) return;
    const canvas = canvasElement;
    const hero = heroElement;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx = context;
    let W = 0, H = 0, t = 0;
    let animationFrame = 0;
    let inView = true;
    let ready = false;
    let disposed = false;
    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  
    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
  
    // ── BIRDS ──
    // Birds fly ONLY in the far sky (top ~18% of hero) and left half,
    // never crossing over Krishna who stands center-right
    const birds: Bird[] = [];
    const KRISHNA_LEFT = 0.38;  // Krishna occupies roughly 38%-70% of width
    const SKY_BOTTOM = 0.18;    // birds only in top 18% (far background sky)
  
    function spawnBird() {
      // Birds enter from far left only, fly rightward but exit before Krishna
      const y = 25 + Math.random() * H * SKY_BOTTOM;
      const speed = 0.4 + Math.random() * 0.8;
      birds.push({
        x: -30,
        y: y,
        speed: speed,
        maxX: W * KRISHNA_LEFT - 20,  // stop before Krishna
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 3 + Math.random() * 2,
        size: 4 + Math.random() * 3.5,  // smaller — they're far away
        opacity: 0.18 + Math.random() * 0.22
      });
    }
    // Start with a couple birds in the left sky
    for (let i = 0; i < 2; i++) {
      const b = {
        x: Math.random() * W * 0.3,
        y: 20 + Math.random() * H * 0.14,
        speed: 0.4 + Math.random() * 0.7,
        maxX: W * KRISHNA_LEFT - 20,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 3 + Math.random() * 2,
        size: 4 + Math.random() * 3,
        opacity: 0.15 + Math.random() * 0.2
      };
      birds.push(b);
    }
  
    function drawBird(b: Bird) {
      // Fade out as bird approaches Krishna zone
      const fadeZone = b.maxX - 60;
      const fadeFactor = b.x > fadeZone ? 1 - ((b.x - fadeZone) / 60) : 1;
      if (fadeFactor <= 0) return;
  
      const wing = Math.sin(t * b.wingSpeed + b.wingPhase);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.globalAlpha = b.opacity * Math.max(0, fadeFactor);
      ctx.strokeStyle = 'rgba(40,35,25,0.85)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      // left wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-b.size * 0.5, -b.size * wing * 0.7, -b.size, -b.size * wing * 0.5);
      ctx.stroke();
      // right wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(b.size * 0.5, -b.size * wing * 0.7, b.size, -b.size * wing * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  
    // ── MUSICAL NOTES ──
    const notes: Note[] = [];
    // Flute position is roughly center-right of the image (Krishna's flute area)
    function fluteX() { return W * 0.52; }
    function fluteY() { return H * 0.32; }
  
    function spawnNote() {
      notes.push({
        x: fluteX() + (Math.random() - 0.5) * 30,
        y: fluteY() + (Math.random() - 0.5) * 15,
        vx: 0.3 + Math.random() * 0.8,
        vy: -0.5 - Math.random() * 0.6,
        life: 1,
        char: Math.random() > 0.5 ? '♪' : '♫',
        size: 12 + Math.random() * 10,
        rot: (Math.random() - 0.5) * 0.5
      });
    }
  
    // ── GOLDEN PARTICLES (divine glow) ──
    const particles: Particle[] = [];
    function spawnParticle() {
      // Spawn around the sunlight area (top right of image)
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * W * 0.4;
      particles.push({
        x: W * 0.65 + Math.cos(angle) * dist,
        y: H * 0.2 + Math.sin(angle) * dist * 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.15 + Math.random() * 0.4,
        life: 1,
        size: 1.5 + Math.random() * 2.5,
        decay: 0.002 + Math.random() * 0.004
      });
    }
  
    // ── LIGHT RAYS (god rays from sun area) ──
    function drawLightRays() {
      const cx = W * 0.68;
      const cy = H * 0.08;
      const rayCount = 6;
      const pulse = Math.sin(t * 0.3) * 0.15 + 0.85;
  
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 0.7 + 0.3 + Math.sin(t * 0.15 + i) * 0.04;
        const len = H * 0.7 + Math.sin(t * 0.2 + i * 1.3) * H * 0.1;
        const spread = 0.04 + Math.sin(t * 0.25 + i * 0.8) * 0.015;
  
        ctx.save();
        ctx.globalAlpha = (0.035 + Math.sin(t * 0.4 + i * 1.1) * 0.015) * pulse;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle - spread) * len, cy + Math.sin(angle - spread) * len);
        ctx.lineTo(cx + Math.cos(angle + spread) * len, cy + Math.sin(angle + spread) * len);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,230,150,1)';
        ctx.fill();
        ctx.restore();
      }
    }
  
    // ── FLOATING PETALS (flower petals drifting) ──
    const petals: Petal[] = [];
    function spawnPetal() {
      petals.push({
        x: Math.random() * W,
        y: -10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.4 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        size: 3 + Math.random() * 4,
        life: 1,
        color: Math.random() > 0.5
          ? `rgba(255,${180 + Math.floor(Math.random()*60)},${80 + Math.floor(Math.random()*60)},`
          : `rgba(255,${200 + Math.floor(Math.random()*55)},${150 + Math.floor(Math.random()*50)},`
      });
    }
  
    function drawPetal(p: Petal) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = p.color + (p.life * 0.5) + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  
    // ── MAIN ANIMATION LOOP ──
    let noteTimer = 0;
    let birdTimer = 0;
    let particleTimer = 0;
    let petalTimer = 0;
  
    function animate() {
      animationFrame = 0;
      if (disposed || !inView || motionPreference?.matches) return;
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
  
      // Wait for image to load before showing effects
      if (t < 1.5) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
  
      // Global fade-in for effects
      const effectAlpha = Math.min(1, (t - 1.5) / 1.5);
      ctx.save();
      ctx.globalAlpha = effectAlpha;
  
      // Light rays
      drawLightRays();
  
      // Spawn birds periodically
      birdTimer += 0.016;
      if (birdTimer > 6 + Math.random() * 5) {
        spawnBird();
        birdTimer = 0;
      }
  
      // Update & draw birds
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i]!;
        b.x += b.speed;
        b.y += Math.sin(t * 0.8 + b.wingPhase) * 0.1;
        drawBird(b);
        if (b.x < -60 || b.x > b.maxX) birds.splice(i, 1);
      }
  
      // Spawn notes
      noteTimer += 0.016;
      if (noteTimer > 1.2 + Math.random() * 1.5) {
        spawnNote();
        noteTimer = 0;
      }
  
      // Update & draw notes
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i]!;
        n.x += n.vx;
        n.y += n.vy;
        n.vy -= 0.003; // float upward
        n.life -= 0.006;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.globalAlpha = n.life * 0.55 * effectAlpha;
        ctx.fillStyle = `rgba(255,215,0,1)`;
        ctx.font = `${n.size}px serif`;
        ctx.fillText(n.char, 0, 0);
        ctx.restore();
        if (n.life <= 0) notes.splice(i, 1);
      }
  
      // Spawn golden particles
      particleTimer += 0.016;
      if (particleTimer > 0.12) {
        spawnParticle();
        particleTimer = 0;
      }
  
      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx + Math.sin(t + p.x * 0.01) * 0.15;
        p.y += p.vy;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = p.life * 0.5 * effectAlpha;
        // Glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grd.addColorStop(0, 'rgba(255,220,100,0.6)');
        grd.addColorStop(1, 'rgba(255,200,50,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = 'rgba(255,240,180,0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p.life <= 0) particles.splice(i, 1);
      }
  
      // Spawn petals
      petalTimer += 0.016;
      if (petalTimer > 2.5 + Math.random() * 3) {
        spawnPetal();
        petalTimer = 0;
      }
  
      // Update & draw petals
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]!;
        p.x += p.vx + Math.sin(t * 0.8 + p.x * 0.005) * 0.3;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.life -= 0.001;
        drawPetal(p);
        if (p.y > H + 20 || p.life <= 0) petals.splice(i, 1);
      }
  
      ctx.restore();
      animationFrame = requestAnimationFrame(animate);
    }
  
    function updatePlayback() {
      if (disposed || !ready) return;
      if (!inView || motionPreference?.matches) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        if (motionPreference?.matches) ctx.clearRect(0, 0, W, H);
      } else if (!animationFrame) {
        animate();
      }
    }

    // Offscreen effects do not need to redraw while customers browse the menu.
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === hero);
      if (!entry) return;
      inView = entry.isIntersecting;
      updatePlayback();
    });
    observer?.observe(hero);
    motionPreference?.addEventListener('change', updatePlayback);

    // Start animation after a short delay for image to paint.
    const startTimer = window.setTimeout(() => { ready = true; updatePlayback(); }, 100);
  
    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
      motionPreference?.removeEventListener('change', updatePlayback);
    };
  }, [heroRef, canvasRef]);
}
