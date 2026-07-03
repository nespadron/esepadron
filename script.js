const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
burger.addEventListener('click', () => nav.classList.toggle('nav-active'));
document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('nav-active')));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== FONDO — RED ELÉCTRICA (nodos amarillos + líneas de tensión) ===== */
if (!reducedMotion) (function () {
    const cv = document.getElementById('canvas-grid');
    const cx = cv.getContext('2d');
    const DIST = 150;
    let W, H, pts, N;
    const mouse = { x: -9999, y: -9999 };

    function init() {
        W = cv.width = window.innerWidth;
        H = cv.height = window.innerHeight;
        N = W < 700 ? 35 : 70;
        pts = Array.from({ length: N }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.6 + 0.7,
            spark: Math.random() < 0.15, // 15% nodos "chispa" más brillantes
        }));
    }
    init();
    // iOS: el scroll cambia innerHeight; solo reiniciar si cambió el ancho
    window.addEventListener('resize', () => { if (window.innerWidth !== W) init(); else { H = cv.height = window.innerHeight; } }, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

    function frame() {
        cx.clearRect(0, 0, W, H);
        for (const p of pts) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110 && d > 0) { p.vx += dx / d * 0.06; p.vy += dy / d * 0.06; }
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > 1) { p.vx = p.vx / spd; p.vy = p.vy / spd; }
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < DIST) {
                    const a = (1 - dist / DIST) * 0.12;
                    cx.strokeStyle = `rgba(241,196,15,${a.toFixed(2)})`;
                    cx.lineWidth = 0.6;
                    cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y); cx.stroke();
                }
            }
        }
        for (const p of pts) {
            cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            cx.fillStyle = p.spark ? 'rgba(255,217,0,0.85)' : 'rgba(241,196,15,0.4)';
            cx.fill();
        }
        requestAnimationFrame(frame);
    }
    frame();
})();

/* ===== SCROLL: Lenis + GSAP + RAYO 3D ===== */
if (window.Lenis && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.2 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -72 }); }
        });
    });

    gsap.to('#scroll-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });

    ScrollTrigger.batch('.reveal', {
        start: 'top 85%', once: true,
        onEnter: b => b.forEach((el, i) => gsap.delayedCall(i * 0.1, () => el.classList.add('visible')))
    });

    // Parallax del rayo del hero al deslizar
    if (!reducedMotion) {
        gsap.to('.bolt-stage', {
            y: 100, ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 }
        });
        // Al deslizar por el hero, sube la intensidad de los relámpagos
        ScrollTrigger.create({
            trigger: '#hero', start: 'top top', end: 'bottom top',
            onUpdate: self => { window.__boltIntensity = self.progress; }
        });
    }
} else {
    const obs = new IntersectionObserver(es => {
        es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ===== RELÁMPAGOS ESTILO FLASH — electricidad corriendo ===== */
if (!reducedMotion) (function () {
    const cv = document.getElementById('canvas-lightning');
    const cx = cv.getContext('2d');
    let W, H;
    function size() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
    size();
    window.addEventListener('resize', () => { if (window.innerWidth !== W) size(); else H = cv.height = window.innerHeight; }, { passive: true });

    // Genera un rayo dentado entre dos puntos (desplazamiento del punto medio)
    function bolt(x1, y1, x2, y2, disp) {
        let segs = [{ x1, y1, x2, y2 }];
        for (let d = disp; d >= 4; d /= 2) {
            const next = [];
            for (const s of segs) {
                const mx = (s.x1 + s.x2) / 2 + (Math.random() - 0.5) * d;
                const my = (s.y1 + s.y2) / 2 + (Math.random() - 0.5) * d;
                next.push({ x1: s.x1, y1: s.y1, x2: mx, y2: my });
                next.push({ x1: mx, y1: my, x2: s.x2, y2: s.y2 });
                // Ramificación ocasional (las bifurcaciones del rayo de Flash)
                if (Math.random() < 0.35) {
                    const ang = Math.atan2(s.y2 - my, s.x2 - mx) + (Math.random() - 0.5) * 1.4;
                    const len = d * 1.6;
                    next.push({ x1: mx, y1: my, x2: mx + Math.cos(ang) * len, y2: my + Math.sin(ang) * len });
                }
            }
            segs = next;
        }
        return segs;
    }

    // Un relámpago vive unos frames y se desvanece
    const strikes = [];
    function strike() {
        const fromLeft = Math.random() < 0.5;
        const x1 = fromLeft ? 0 : W, y1 = Math.random() * H * 0.5;
        const x2 = Math.random() * W, y2 = H * (0.4 + Math.random() * 0.6);
        strikes.push({ segs: bolt(x1, y1, x2, y2, 120), life: 1 });
    }

    function draw() {
        cx.clearRect(0, 0, W, H);
        for (let i = strikes.length - 1; i >= 0; i--) {
            const s = strikes[i];
            cx.globalAlpha = s.life;
            // resplandor exterior amarillo
            cx.strokeStyle = 'rgba(241,196,15,0.9)';
            cx.lineWidth = 4; cx.shadowColor = '#f1c40f'; cx.shadowBlur = 18;
            cx.beginPath();
            for (const seg of s.segs) { cx.moveTo(seg.x1, seg.y1); cx.lineTo(seg.x2, seg.y2); }
            cx.stroke();
            // núcleo blanco brillante
            cx.strokeStyle = '#fff'; cx.lineWidth = 1.4; cx.shadowBlur = 8;
            cx.stroke();
            s.life -= 0.08;
            if (s.life <= 0) strikes.splice(i, 1);
        }
        cx.globalAlpha = 1; cx.shadowBlur = 0;

        // Frecuencia: base + más rápido conforme deslizas por el hero
        const intensity = window.__boltIntensity || 0;
        if (Math.random() < 0.02 + intensity * 0.06) strike();
        requestAnimationFrame(draw);
    }
    draw();
    setTimeout(strike, 600); // primer rayo de bienvenida
})();
