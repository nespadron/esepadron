const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
burger.addEventListener('click', () => nav.classList.toggle('nav-active'));
document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('nav-active')));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== ALCANCES POR EQUIPO (interactivo) ===== */
const SCOPES = {
    'acometida': ['Inspección visual del estado de los componentes.', 'Limpieza general.', 'Revisión de apartarrayos.', 'Pruebas de resistencia de aislamiento a apartarrayos.', 'Revisión de estado de listón fusible.'],
    'subestacion': ['Limpieza interna y externa.', 'Inspección visual de los componentes del equipo.', 'Remoción, revisión y limpieza de fusibles.', 'Lubricación de mecanismo de seccionadores.', 'Prueba mecánica a seccionadores.', 'Prueba de resistencia de aislamiento.', 'Prueba de resistencia de contacto.', 'Pruebas eléctricas a relevador de control (si aplica).'],
    'transformadores-mt': ['Limpieza interna y externa.', 'Inspección visual de los componentes.', 'Prueba de resistencia de aislamiento.', 'Prueba de relación de transformación (TTR).', 'Reapriete de puntos de conexión.'],
    'transformadores-bt': ['Limpieza interna y externa.', 'Inspección visual de los componentes.', 'Prueba de resistencia de aislamiento.', 'Prueba de relación de transformación (TTR).', 'Reapriete de puntos de conexión.'],
    'interruptores': ['Limpieza interna y externa.', 'Remoción, inspección y limpieza de cámaras de arqueo.', 'Inspección y limpieza de contactos fijos y móviles.', 'Revisión y lubricación del mecanismo de carga de resorte.', 'Pruebas mecánicas.', 'Pruebas eléctricas a unidad de control con Test-Kit.'],
    'tableros': ['Limpieza interna y externa.', 'Reapriete general de conexiones de fuerza (bus de barras, cableado de interruptores derivados).', 'Reapriete general de conexiones de control.', 'Comprobación de funcionamiento de fusibles de control (si aplica).']
};
const SCOPE_NAMES = { 'acometida': 'Acometida', 'subestacion': 'Subestación', 'transformadores-mt': 'Transformadores MT', 'transformadores-bt': 'Transformadores BT', 'interruptores': 'Interruptores', 'tableros': 'Tableros' };
(function () {
    const stage = document.getElementById('scopeStage');
    const list = document.getElementById('scopeList');
    const title = document.getElementById('scopeTitle');
    if (!stage) return;
    document.querySelectorAll('.energy-node').forEach(node => {
        node.addEventListener('click', () => {
            const id = node.dataset.scope;
            document.querySelectorAll('.energy-node').forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            title.textContent = SCOPE_NAMES[id];
            list.innerHTML = SCOPES[id].map(x => `<li><i class="fas fa-bolt"></i> ${x}</li>`).join('');
            stage.hidden = false;
            stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
})();

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
                    const a = (1 - dist / DIST) * 0.22;
                    cx.strokeStyle = `rgba(241,196,15,${a.toFixed(2)})`;
                    cx.lineWidth = 1.8;
                    cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y); cx.stroke();
                }
            }
        }
        for (const p of pts) {
            cx.beginPath(); cx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
            cx.fillStyle = p.spark ? 'rgba(255,217,0,0.95)' : 'rgba(241,196,15,0.65)';
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

/* ===== RAYO REALISTA + RELÁMPAGOS (canvas) ===== */
if (!reducedMotion) (function () {
    const cv = document.getElementById('canvas-lightning');
    const cx = cv.getContext('2d');
    let W, H;
    function size() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
    size();
    window.addEventListener('resize', () => { if (window.innerWidth !== W) size(); else H = cv.height = window.innerHeight; }, { passive: true });

    // Genera un trazo de rayo dentado con desplazamiento del punto medio
    function jag(x1, y1, x2, y2, disp, branchProb) {
        let segs = [{ x1, y1, x2, y2 }];
        for (let d = disp; d >= 4; d /= 2) {
            const next = [];
            for (const s of segs) {
                const mx = (s.x1 + s.x2) / 2 + (Math.random() - 0.5) * d;
                const my = (s.y1 + s.y2) / 2 + (Math.random() - 0.5) * d;
                next.push({ x1: s.x1, y1: s.y1, x2: mx, y2: my });
                next.push({ x1: mx, y1: my, x2: s.x2, y2: s.y2 });
                if (Math.random() < branchProb) {
                    const ang = Math.atan2(s.y2 - my, s.x2 - mx) + (Math.random() - 0.5) * 1.5;
                    const len = d * 1.7;
                    next.push({ x1: mx, y1: my, x2: mx + Math.cos(ang) * len, y2: my + Math.sin(ang) * len });
                }
            }
            segs = next;
        }
        return segs;
    }

    // Dibuja un trazo con triple pasada: glow azul, glow amarillo, núcleo blanco (look eléctrico real)
    function drawStroke(segs, alpha, scale) {
        cx.globalAlpha = alpha;
        cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.strokeStyle = 'rgba(120,180,255,0.5)'; cx.lineWidth = 7 * scale; cx.shadowColor = '#79b4ff'; cx.shadowBlur = 26;
        stroke(segs);
        cx.strokeStyle = 'rgba(241,196,15,0.95)'; cx.lineWidth = 3.5 * scale; cx.shadowColor = '#f1c40f'; cx.shadowBlur = 16;
        stroke(segs);
        cx.strokeStyle = '#ffffff'; cx.lineWidth = 1.3 * scale; cx.shadowBlur = 6;
        stroke(segs);
    }
    function stroke(segs) {
        cx.beginPath();
        for (const s of segs) { cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); }
        cx.stroke();
    }

    // Silueta del rayo GEOMÉTRICO — forma elongada tipo Flash, normalizada 0..1
    const BOLT = [[0.5,0.0],[0.35,0.25],[0.55,0.35],[0.3,0.5],[0.5,0.65],[0.25,0.8],[0.45,1.0],[0.7,0.75],[0.85,0.5],[0.65,0.3],[0.75,0.1]];

    // RAYO PRINCIPAL: múltiples rayos formando una forma cohesiva, rotado y elongado
    const stage = document.getElementById('boltStage');
    let mainBolt = null, mainPoly = null, mainTimer = 0, mainVisible = true;
    function regenMain() {
        if (!stage) return;
        const r = stage.getBoundingClientRect();
        mainVisible = r.bottom > 0 && r.top < H;
        if (!mainVisible) return;

        // Centro y escala con rotación
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const angle = -0.3; // rotación diagonal (Flash-style)
        const scaleX = r.width * 0.65;
        const scaleY = r.height * 1.1; // elongado verticalmente

        // Transformar puntos con rotación y escala
        const pts = BOLT.map(([nx, ny]) => {
            // Centrar en 0.5, 0.5
            const x = (nx - 0.5) * 2;
            const y = (ny - 0.5) * 2;
            // Rotar
            const rx = x * Math.cos(angle) - y * Math.sin(angle);
            const ry = x * Math.sin(angle) + y * Math.cos(angle);
            // Escalar y trasladar
            return [cx + rx * scaleX * 0.5, cy + ry * scaleY * 0.5];
        });
        mainPoly = pts;

        // Generar múltiples rayos dentro de la forma (efecto multibolt tipo Flash)
        mainBolt = [];

        // Rayo principal con bordes dentados
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i], b = pts[(i + 1) % pts.length];
            mainBolt.push(...jag(a[0], a[1], b[0], b[1], 16, 0.25));
        }

        // Múltiples rayos secundarios en varias direcciones (como electricidad/Flash)
        for (let b = 0; b < 4; b++) {
            if (Math.random() < 0.8) {
                const splitPoint = Math.floor(Math.random() * pts.length);
                const a = pts[splitPoint];
                const angle = (Math.random() * Math.PI * 2);
                const len = (Math.random() + 0.8) * r.height * 0.5;
                const endX = a[0] + Math.cos(angle) * len;
                const endY = a[1] + Math.sin(angle) * len;
                mainBolt.push(...jag(a[0], a[1], endX, endY, 12, 0.4));
            }
        }
    }

    // Relámpagos que cruzan la pantalla al azar
    const strikes = [];
    function strike() {
        const fromLeft = Math.random() < 0.5;
        strikes.push({ segs: jag(fromLeft ? 0 : W, Math.random() * H * 0.5, Math.random() * W, H * (0.4 + Math.random() * 0.6), 130, 0.4), life: 1 });
    }

    function frame(t) {
        cx.clearRect(0, 0, W, H);

        // Rayo principal: regenera cada ~90ms para el titileo eléctrico
        if (t - mainTimer > 90) { regenMain(); mainTimer = t; }
        if (mainBolt && mainVisible) {
            // Relleno tenue para que se lea como rayo sólido
            cx.save();
            cx.globalAlpha = 0.5 + Math.random() * 0.12;
            cx.beginPath();
            mainPoly.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]));
            cx.closePath();
            cx.fillStyle = 'rgba(241,196,15,0.9)';
            cx.shadowColor = '#f1c40f'; cx.shadowBlur = 30;
            cx.fill();
            cx.restore();
            // Bordes eléctricos crepitando (mismo estilo que los rayitos del fondo)
            drawStroke(mainBolt, 0.9 + Math.random() * 0.1, 1);
        }

        // Relámpagos cruzando
        for (let i = strikes.length - 1; i >= 0; i--) {
            const s = strikes[i];
            drawStroke(s.segs, s.life, 0.8);
            s.life -= 0.08;
            if (s.life <= 0) strikes.splice(i, 1);
        }
        cx.globalAlpha = 1; cx.shadowBlur = 0;

        const intensity = window.__boltIntensity || 0;
        if (Math.random() < 0.015 + intensity * 0.05) strike();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setTimeout(strike, 500);
})();
