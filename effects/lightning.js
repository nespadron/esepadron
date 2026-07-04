/**
 * Lightning Effect - Sistema de rayo realista y cinematográfico
 * Inspirado en descargas eléctricas reales con múltiples capas y ramificaciones
 * Electricidad densa recorriendo constantemente, glow intenso, bloom exterior
 */

class LightningEffect {
  constructor(canvasId, stageId) {
    this.canvas = document.getElementById(canvasId);
    this.stage = document.getElementById(stageId);
    if (!this.canvas || !this.stage) return;
    this.ctx = this.canvas.getContext('2d');

    this.setupCanvas();
    this.initState();
    this.startAnimation();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
    this.dpr = dpr;

    window.addEventListener('resize', () => this.setupCanvas(), { passive: true });
  }

  initState() {
    this.boltShape = null;
    this.electricityBranches = [];
    this.sparks = [];
    this.time = 0;
    this.intensity = 0.8;
    this.loadProgress = 0;
    this.mouse = { x: -9999, y: -9999 };
    this.isEntering = true;
    this.entryTime = 0;

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }

  generateBoltShape() {
    if (!this.stage) return;

    const rect = this.stage.getBoundingClientRect();
    if (rect.height === 0) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const baseShape = [
      [0.5, 0.0],
      [0.62, 0.02],
      [0.72, 0.18],
      [0.62, 0.28],
      [0.68, 0.48],
      [0.54, 0.56],
      [0.62, 0.78],
      [0.50, 0.92],
      [0.44, 1.0],
      [0.42, 0.82],
      [0.32, 0.54],
      [0.24, 0.48],
      [0.32, 0.28],
      [0.22, 0.18],
    ];

    const scale = rect.width * 0.8;
    const angle = -0.25;

    this.boltShape = baseShape.map(([nx, ny]) => {
      const x = (nx - 0.5) * 2;
      const y = (ny - 0.5) * 2;

      const rx = x * Math.cos(angle) - y * Math.sin(angle);
      const ry = x * Math.sin(angle) + y * Math.cos(angle);

      return {
        x: centerX + rx * scale * 0.5,
        y: centerY + ry * scale * 0.6,
      };
    });
  }

  // Electricidad DENSA recorriendo el borde - mucho más realista
  generateElectricity() {
    if (!this.boltShape || this.boltShape.length < 2) return [];

    const branches = [];
    const time = this.time * 0.004;

    for (let i = 0; i < this.boltShape.length; i++) {
      const p1 = this.boltShape[i];
      const p2 = this.boltShape[(i + 1) % this.boltShape.length];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // MÁS puntos = más ramificaciones densas
      const points = Math.max(3, Math.floor(len / 4));

      for (let j = 0; j < points; j++) {
        const t = j / points;
        const x = p1.x + dx * t;
        const y = p1.y + dy * t;

        // Ruido multi-frecuencia MÁS complejo
        const f1 = Math.sin((x * 0.01 + time * 50) * 0.004) * 0.35;
        const f2 = Math.cos((y * 0.01 + time * 40) * 0.005) * 0.35;
        const f3 = Math.sin((i + time * 0.6) * 0.6) * 0.3;
        const noise = f1 + f2 + f3;

        // MUCHAS más ramificaciones
        if (Math.abs(noise) > 0.3 || Math.random() < 0.25) {
          const outwardDist = 6 + Math.abs(noise) * 18;
          const branchLen = 14 + Math.sin(time + i * 0.5) * 10;
          const angle = Math.atan2(ny, nx) + noise * 0.9 + (Math.random() - 0.5) * 0.5;

          branches.push({
            x1: x + nx * outwardDist,
            y1: y + ny * outwardDist,
            x2: x + nx * outwardDist + Math.cos(angle) * branchLen,
            y2: y + ny * outwardDist + Math.sin(angle) * branchLen,
            alpha: Math.max(0.15, Math.abs(noise)),
            width: 0.7 + Math.abs(noise) * 0.9,
          });

          // Sub-ramificaciones adicionales
          if (Math.random() < 0.4) {
            const subAngle = angle + (Math.random() - 0.5) * 1.2;
            const subLen = branchLen * (0.4 + Math.random() * 0.3);
            branches.push({
              x1: x + nx * outwardDist + Math.cos(angle) * branchLen * 0.5,
              y1: y + ny * outwardDist + Math.sin(angle) * branchLen * 0.5,
              x2: x + nx * outwardDist + Math.cos(angle) * branchLen * 0.5 + Math.cos(subAngle) * subLen,
              y2: y + ny * outwardDist + Math.sin(angle) * branchLen * 0.5 + Math.sin(subAngle) * subLen,
              alpha: Math.max(0.1, Math.abs(noise) * 0.6),
              width: 0.4 + Math.abs(noise) * 0.4,
            });
          }
        }
      }
    }

    return branches;
  }

  drawBoltCore() {
    if (!this.boltShape) return;

    const ctx = this.ctx;
    const shape = this.boltShape;

    ctx.fillStyle = 'rgba(15, 12, 8, 0.9)';
    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  }

  drawBoltBorder() {
    if (!this.boltShape) return;

    const ctx = this.ctx;
    const shape = this.boltShape;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
  }

  drawBoltGlow() {
    if (!this.boltShape) return;

    const ctx = this.ctx;
    const shape = this.boltShape;

    // Glow amarillo INTENSO
    ctx.shadowColor = 'rgba(255, 200, 0, 1)';
    ctx.shadowBlur = 32;
    ctx.strokeStyle = 'rgba(255, 230, 50, 0.8)';
    ctx.lineWidth = 8;

    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();

    // Glow naranja/dorado
    ctx.shadowColor = 'rgba(255, 150, 0, 0.6)';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.4)';
    ctx.lineWidth = 16;

    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.stroke();
  }

  drawBoltBloom() {
    if (!this.boltShape) return;

    const ctx = this.ctx;
    const shape = this.boltShape;

    ctx.shadowColor = 'rgba(255, 200, 0, 0.8)';
    ctx.shadowBlur = 60;
    ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';

    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  }

  drawElectricity(branches) {
    const ctx = this.ctx;

    branches.forEach((branch) => {
      const alpha = branch.alpha * this.intensity;

      // Línea principal - blanca y brillante
      ctx.strokeStyle = `rgba(255, 255, 180, ${alpha * 0.95})`;
      ctx.lineWidth = branch.width;
      ctx.lineCap = 'round';
      ctx.shadowColor = `rgba(255, 255, 120, ${alpha * 0.8})`;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(branch.x1, branch.y1);
      ctx.lineTo(branch.x2, branch.y2);
      ctx.stroke();

      // Ramificación terciaria
      if (Math.random() < 0.45 && alpha > 0.25) {
        const angle = Math.atan2(branch.y2 - branch.y1, branch.x2 - branch.x1);
        const len = Math.hypot(branch.x2 - branch.x1, branch.y2 - branch.y1);
        const t = 0.5 + Math.random() * 0.4;
        const px = branch.x1 + Math.cos(angle) * len * t;
        const py = branch.y1 + Math.sin(angle) * len * t;

        ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.55})`;
        ctx.lineWidth = branch.width * 0.35;
        ctx.shadowColor = `rgba(255, 255, 150, ${alpha * 0.4})`;
        ctx.shadowBlur = 5;

        ctx.beginPath();
        ctx.moveTo(px, py);
        const sideAngle = angle + (Math.random() - 0.5) * 1;
        ctx.lineTo(px + Math.cos(sideAngle) * 8, py + Math.sin(sideAngle) * 8);
        ctx.stroke();
      }
    });
  }

  drawElectricalArcs() {
    if (!this.boltShape) return;

    const ctx = this.ctx;
    const lastPoint = this.boltShape[this.boltShape.length - 1];

    const arcRadius = 40 + Math.sin(this.time * 0.007) * 15;
    const arcAlpha = Math.max(0.35, Math.sin(this.time * 0.005) * 0.8 + 0.55) * this.intensity;

    ctx.strokeStyle = `rgba(255, 210, 0, ${arcAlpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `rgba(255, 200, 0, ${arcAlpha})`;
    ctx.shadowBlur = 22;

    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y + 25, arcRadius, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    const sparkCount = 5 + Math.floor(Math.sin(this.time * 0.012) * 2);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI / 4) + (i * Math.PI / sparkCount);
      const sx = lastPoint.x + Math.cos(angle) * (arcRadius - 2);
      const sy = lastPoint.y + 25 + Math.sin(angle) * (arcRadius - 2);

      ctx.fillStyle = `rgba(255, 255, 220, ${arcAlpha * 1.1})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  updateIntensity() {
    const pulse = Math.sin(this.time * 0.0025) * 0.12 + 0.88;
    this.intensity = Math.max(0.65, pulse);
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;

    this.generateBoltShape();
    this.updateIntensity();

    if (!this.boltShape) return;

    ctx.globalAlpha = this.intensity;

    this.drawBoltCore();
    this.drawBoltBorder();
    this.drawBoltGlow();
    this.drawBoltBloom();

    const branches = this.generateElectricity();
    ctx.globalAlpha = Math.min(1, this.intensity * 1.4);
    this.drawElectricity(branches);

    ctx.globalAlpha = this.intensity * 0.9;
    this.drawElectricalArcs();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  startAnimation() {
    const loop = () => {
      this.render();
      this.time++;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setIntensityFromScroll(value) {
    this.intensity = Math.max(0.7, Math.min(1, value));
  }

  distanceToMouse() {
    if (!this.boltShape || this.boltShape.length === 0) return Infinity;

    const centerX = this.boltShape[0].x;
    const centerY = this.boltShape[0].y;

    const dx = this.mouse.x - centerX;
    const dy = this.mouse.y - centerY;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightningEffect;
}
