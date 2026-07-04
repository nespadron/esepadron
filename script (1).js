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

    // Dibuja un trazo eléctrico con triple pasada (soporta colores)
    function drawStroke(segs, alpha, scale, colorType = 'yellow') {
        cx.globalAlpha = alpha;
        cx.lineCap = 'round'; cx.lineJoin = 'round';

        if (colorType === 'blue') {
            // Glow dorado exterior
            cx.strokeStyle = 'rgba(255,200,0,0.5)'; cx.lineWidth = 14 * scale; cx.shadowColor = '#ffc800'; cx.shadowBlur = 28;
            stroke(segs);
            // Glow dorado intenso
            cx.strokeStyle = 'rgba(255,215,0,0.85)'; cx.lineWidth = 7 * scale; cx.shadowColor = '#ffd700'; cx.shadowBlur = 18;
            stroke(segs);
        } else {
            // Default: dorado/amarillo como los feeders
            cx.strokeStyle = 'rgba(255,200,0,0.4)'; cx.lineWidth = 12 * scale; cx.shadowColor = '#ffc800'; cx.shadowBlur = 22;
            stroke(segs);
            // Línea interior más brillante
            cx.strokeStyle = 'rgba(255,240,100,0.8)'; cx.lineWidth = 6 * scale; cx.shadowColor = '#fff064'; cx.shadowBlur = 16;
            stroke(segs);
        }
        // Núcleo blanco brillante
        cx.strokeStyle = '#ffffff'; cx.lineWidth = 2 * scale; cx.shadowBlur = 6;
        stroke(segs);
    }
    function stroke(segs) {
        cx.beginPath();
        for (const s of segs) { cx.moveTo(s.x1, s.y1); cx.lineTo(s.x2, s.y2); }
        cx.stroke();
    }

    // Silueta del rayo — Exacta al rayo azul de referencia (punta de flecha diagonal)
    const BOLT = [[0.58,0.0],[0.72,0.02],[0.80,0.18],[0.68,0.28],[0.76,0.48],[0.60,0.54],[0.68,0.78],[0.52,0.92],[0.48,1.0],[0.44,0.80],[0.32,0.54],[0.24,0.48],[0.32,0.28],[0.20,0.18]];

    // RAYO PRINCIPAL: silueta azul sólida "cargada" por rayos que llegan de afuera (efecto pararrayos)
    const stage = document.getElementById('boltStage');
    let mainPoly = null, mainOutline = null, mainTimer = 0, outlineTimer = 0, mainVisible = true, stageRect = null;
    function regenMain() {
        if (!stage) return;
        const r = stage.getBoundingClientRect();
        stageRect = r;
        mainVisible = r.bottom > 0 && r.top < H;
        if (!mainVisible) return;

        // Centro y escala con rotación
        const ccx = r.left + r.width / 2;
        const ccy = r.top + r.height / 2;
        const angle = -0.3; // rotación diagonal (Flash-style)
        const scaleX = r.width * 0.35;
        const scaleY = r.height * 0.65; // elongado verticalmente

        // Transformar puntos con rotación y escala (silueta estable)
        mainPoly = BOLT.map(([nx, ny]) => {
            const x = (nx - 0.5) * 2;
            const y = (ny - 0.5) * 2;
            const rx = x * Math.cos(angle) - y * Math.sin(angle);
            const ry = x * Math.sin(angle) + y * Math.cos(angle);
            return [ccx + rx * scaleX * 0.5, ccy + ry * scaleY * 0.5];
        });
    }

    // Contorno crepitante sobre la silueta estable (textura eléctrica)
    function regenOutline() {
        if (!mainPoly) return;
        mainOutline = [];
        for (let i = 0; i < mainPoly.length; i++) {
            const a = mainPoly[i], b = mainPoly[(i + 1) % mainPoly.length];
            mainOutline.push(...jag(a[0], a[1], b[0], b[1], 6, 0.08));
        }
    }

    // Dibuja la silueta rellena con glow neón dorado/amarillo intenso
    function drawBoltFill(poly) {
        cx.save();
        cx.globalAlpha = 0.65 + Math.random() * 0.2;
        cx.beginPath();
        poly.forEach((p, i) => i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]));
        cx.closePath();
        // Glow exterior dorado
        cx.fillStyle = 'rgba(255,200,0,0.5)';
        cx.shadowColor = '#ffc800'; cx.shadowBlur = 50;
        cx.fill();
        // Núcleo amarillo intenso
        cx.globalAlpha = 0.9;
        cx.fillStyle = 'rgba(255,215,0,0.85)';
        cx.shadowColor = '#ffd700'; cx.shadowBlur = 35;
        cx.fill();
        // Contorno blanco brillante
        cx.globalAlpha = 0.95;
        cx.lineWidth = 3;
        cx.strokeStyle = 'rgba(255,240,100,0.95)';
        cx.shadowColor = '#fff064'; cx.shadowBlur = 20;
        cx.stroke();
        cx.restore();
    }

    // Rayos alimentadores: llegan de afuera hacia la silueta, como un pararrayos cargándose
    const feeders = [];
    function spawnFeeder() {
        if (!mainPoly || !stageRect) return;
        const dest = mainPoly[Math.floor(Math.random() * mainPoly.length)];
        const ccx = stageRect.left + stageRect.width / 2;
        const ccy = stageRect.top + stageRect.height / 2;
        const ang = Math.atan2(dest[1] - ccy, dest[0] - ccx) + (Math.random() - 0.5) * 0.7;
        const dist = Math.max(stageRect.width, stageRect.height) * (0.9 + Math.random() * 0.7);
        const srcX = dest[0] + Math.cos(ang) * dist;
        const srcY = dest[1] + Math.sin(ang) * dist;
        feeders.push({ segs: jag(srcX, srcY, dest[0], dest[1], 22, 0.3), life: 1 });
    }

    // Relámpagos que cruzan la pantalla al azar (amarillos y azules)
    const strikes = [];
    function strike() {
        const fromLeft = Math.random() < 0.5;
        const isBlue = Math.random() < 0.4;
        strikes.push({
            segs: jag(fromLeft ? 0 : W, Math.random() * H * 0.5, Math.random() * W, H * (0.4 + Math.random() * 0.6), 130, 0.4),
            life: 1,
            color: isBlue ? 'blue' : 'yellow'
        });
    }

    function frame(t) {
        cx.clearRect(0, 0, W, H);

        // Posición/visibilidad de la silueta: se recalcula cada ~200ms (estable, sin temblar)
        if (t - mainTimer > 200) { regenMain(); mainTimer = t; }
        // Contorno crepitante: se regenera más seguido para dar textura eléctrica
        if (t - outlineTimer > 90) { regenOutline(); outlineTimer = t; }

        if (mainPoly && mainVisible) {
            drawBoltFill(mainPoly);
            if (mainOutline) drawStroke(mainOutline, 0.85 + Math.random() * 0.15, 0.8, 'blue');
        }

        // Rayos alimentadores llegando de afuera (efecto pararrayos cargándose)
        if (mainVisible && Math.random() < 0.18) spawnFeeder();
        for (let i = feeders.length - 1; i >= 0; i--) {
            const f = feeders[i];
            drawStroke(f.segs, f.life, 0.7, 'blue');
            f.life -= 0.15;
            if (f.life <= 0) feeders.splice(i, 1);
        }

        // Relámpagos cruzando (ambiente general de la página)
        for (let i = strikes.length - 1; i >= 0; i--) {
            const s = strikes[i];
            cx.save();
            drawStroke(s.segs, s.life * 0.9, 0.8, s.color);
            cx.restore();
            s.life -= 0.12;
            if (s.life <= 0) strikes.splice(i, 1);
        }
        cx.globalAlpha = 1; cx.shadowBlur = 0;

        const intensity = window.__boltIntensity || 0;
        if (Math.random() < 0.03 + intensity * 0.1) strike();
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setTimeout(strike, 500);
    setTimeout(spawnFeeder, 300);
})();

(function(){
const cv=document.getElementById('heroLightningCanvas'); if(!cv)return;
const ctx=cv.getContext('2d');
function rs(){cv.width=cv.clientWidth||600;cv.height=cv.clientHeight||900;}
window.addEventListener('resize',rs);rs();
function bolt(){
 ctx.clearRect(0,0,cv.width,cv.height);
 let pts=[],x=cv.width*0.55,y=20;
 pts.push([x,y]);
 while(y<cv.height-20){x+=(Math.random()-.5)*35;y+=25+Math.random()*25;pts.push([x,y]);}
 ctx.lineCap='round';
 for(let g=18;g>1;g-=4){
  ctx.strokeStyle=`rgba(255,215,80,${0.03*g})`;ctx.lineWidth=g;
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
 }
 ctx.strokeStyle='#fff8d0';ctx.lineWidth=3;
 ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
 pts.forEach((p,i)=>{if(i<pts.length-2&&Math.random()<.7){ctx.beginPath();ctx.moveTo(...p);let bx=p[0]+(Math.random()-.5)*120,by=p[1]+40+Math.random()*60;ctx.lineTo(bx,by);ctx.strokeStyle='rgba(255,235,150,.8)';ctx.lineWidth=1;ctx.stroke();}});
 requestAnimationFrame(bolt);
}
bolt();
})();