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
    const stageTop = document.getElementById('scopeStageTop');
    const stageBottom = document.getElementById('scopeStageBottom');
    const grid = document.querySelector('.energy-grid');
    if (!stageTop || !stageBottom) return;
    const nodes = document.querySelectorAll('.energy-node');
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const id = node.dataset.scope;
            const isTop = node.dataset.row === 'top';
            const stage = isTop ? stageTop : stageBottom;
            const otherStage = isTop ? stageBottom : stageTop;
            otherStage.hidden = true;

            nodes.forEach(n => {
                n.classList.toggle('active', n === node);
                n.classList.toggle('dimmed', n !== node);
            });
            stage.querySelector('.scopeTitle').textContent = SCOPE_NAMES[id];
            stage.querySelector('.scopeList').innerHTML = SCOPES[id].map(x => `<li><i class="fas fa-bolt"></i> ${x}</li>`).join('');
            stage.hidden = false;
            // Posicionar el conector alineado con el nodo seleccionado
            const gridRect = grid.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();
            const centerPercent = ((nodeRect.left + nodeRect.width / 2 - gridRect.left) / gridRect.width) * 100;
            stage.style.setProperty('--arrow-pos', `${centerPercent}%`);
            stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
})();

/* ===== FILTRO DE GALERÍA DE PROYECTOS ===== */
(function () {
    const bar = document.querySelector('.filter-bar');
    const grid = document.getElementById('projGrid');
    if (!bar || !grid) return;
    const btns = bar.querySelectorAll('.filter-btn');
    const cards = grid.querySelectorAll('.proj-card');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const cats = (card.dataset.cat || '').split(' ');
                const show = filter === 'all' || cats.includes(filter);
                card.classList.toggle('filtered-out', !show);
            });
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
                    const a = (1 - dist / DIST) * 0.28;
                    cx.strokeStyle = `rgba(184,134,11,${a.toFixed(2)})`;
                    cx.lineWidth = 1.1;
                    cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y); cx.stroke();
                }
            }
        }
        for (const p of pts) {
            cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            cx.shadowColor = 'rgba(184,134,11,0.5)'; cx.shadowBlur = 3;
            cx.fillStyle = p.spark ? 'rgba(230,170,0,1)' : 'rgba(200,148,0,0.9)';
            cx.fill();
        }
        cx.shadowBlur = 0;
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

/* ===== SISTEMA DE RAYO CINEMATOGRÁFICO ===== */
window.addEventListener('DOMContentLoaded', () => {
    if (!reducedMotion && typeof LightningEffect !== 'undefined') {
        const lightning = new LightningEffect('canvas-lightning', 'boltStage');

        // Audio — se activa con la primera interacción (política de autoplay del navegador)
        let electricSound = null;
        if (typeof ElectricSound !== 'undefined') {
            electricSound = new ElectricSound();
            const unlockAudio = () => {
                electricSound.resume();
                electricSound.startAmbientHum();
            };
            document.addEventListener('pointerdown', unlockAudio, { once: true });
        }

        // Campo electromagnético
        let emField = null;
        if (typeof ElectromagneticField !== 'undefined') {
            emField = new ElectromagneticField(lightning, 'canvas-lightning');
        }

        // Integración con scroll intensity
        if (window.gsap && window.ScrollTrigger) {
            ScrollTrigger.create({
                trigger: '.hero', start: 'top top', end: 'bottom top',
                onUpdate: self => {
                    if (lightning) lightning.setIntensityFromScroll(0.7 + self.progress * 0.3);
                }
            });
        }

        // Campo electromagnético dibujado sobre el rayo
        if (emField) {
            const originalRender = lightning.render.bind(lightning);
            lightning.render = function() {
                originalRender();
                emField.draw();
            };
        }

        // Partículas flotantes (mismo canvas, se dibujan tras el rayo)
        if (typeof ParticlesEffect !== 'undefined') {
            new ParticlesEffect('canvas-lightning');
        }

        // Descargas interactivas en botones, textos y clicks
        if (typeof InteractionEffects !== 'undefined') {
            new InteractionEffects(lightning, 'canvas-lightning');
        }

        // Eventos de sonido
        if (electricSound) {
            document.addEventListener('click', () => electricSound.discharge());
            document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
                btn.addEventListener('mouseenter', () => electricSound.spark(btn.getBoundingClientRect().x, btn.getBoundingClientRect().y));
            });
        }

        window.lightningEffect = lightning;
        window.electricSound = electricSound;
    }
});
