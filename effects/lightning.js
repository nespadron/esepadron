/**
 * Lightning Effect - Rayo estilo "Flash"
 * Silueta afilada y alargada con dos quiebres, núcleo brillante,
 * estelas de velocidad, arcos eléctricos finos e impacto en el suelo.
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

    if (!this._resizeBound) {
      this._resizeBound = true;
      window.addEventListener('resize', () => this.setupCanvas(), { passive: true });
    }
  }

  initState() {
    this.boltShape = null;
    this.time = 0;
    this.intensity = 0.85;
    this.mouse = { x: -9999, y: -9999 };

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }

  generateBoltShape() {
    if (!this.stage) return;

    const rect = this.stage.getBoundingClientRect();
    if (rect.height === 0) return;

    // Silueta estilo Flash: diagonal alargada, dos quiebres, puntas de aguja.
    // La punta inferior impacta el "suelo" (parte baja del stage).
    const base = [
      [0.88, 0.00], // punta superior (aguja)
      [0.62, 0.30],
      [0.76, 0.345], // quiebre superior
      [0.46, 0.63],
      [0.585, 0.665], // quiebre inferior
      [0.10, 1.00], // punta de impacto
      [0.385, 0.645],
      [0.27, 0.615],
      [0.545, 0.325],
      [0.435, 0.29],
      [0.80, 0.015],
    ];

    this.boltShape = base.map(([nx, ny]) => ({
      x: rect.left + nx * rect.width,
      y: rect.top + ny * rect.height,
    }));

    this.top = this.boltShape[0];
    this.tip = this.boltShape[5];
  }

  tracePath() {
    const ctx = this.ctx;
    const shape = this.boltShape;
    ctx.beginPath();
    shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
  }

  // Arcos eléctricos finos alrededor del rayo (los "rayos" ambientales)
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

      const points = Math.max(2, Math.floor(len / 7));

      for (let j = 0; j < points; j++) {
        const t = j / points;
        const x = p1.x + dx * t;
        const y = p1.y + dy * t;

        const f1 = Math.sin((x * 0.01 + time * 50) * 0.004) * 0.35;
        const f2 = Math.cos((y * 0.01 + time * 40) * 0.005) * 0.35;
        const f3 = Math.sin((i + time * 0.6) * 0.6) * 0.3;
        const noise = f1 + f2 + f3;

        if (Math.abs(noise) > 0.42 || Math.random() < 0.10) {
          const outwardDist = 8 + Math.abs(noise) * 20;
          const branchLen = 16 + Math.sin(time + i * 0.5) * 10;
          const angle = Math.atan2(ny, nx) + noise * 0.9 + (Math.random() - 0.5) * 0.5;

          branches.push({
            x1: x + nx * outwardDist,
            y1: y + ny * outwardDist,
            x2: x + nx * outwardDist + Math.cos(angle) * branchLen,
            y2: y + ny * outwardDist + Math.sin(angle) * branchLen,
            alpha: Math.max(0.12, Math.abs(noise) * 0.8),
            width: 0.6 + Math.abs(noise) * 0.6,
          });

          if (Math.random() < 0.35) {
            const subAngle = angle + (Math.random() - 0.5) * 1.2;
            const subLen = branchLen * (0.4 + Math.random() * 0.3);
            branches.push({
              x1: x + nx * outwardDist + Math.cos(angle) * branchLen * 0.5,
              y1: y + ny * outwardDist + Math.sin(angle) * branchLen * 0.5,
              x2: x + nx * outwardDist + Math.cos(angle) * branchLen * 0.5 + Math.cos(subAngle) * subLen,
              y2: y + ny * outwardDist + Math.sin(angle) * branchLen * 0.5 + Math.sin(subAngle) * subLen,
              alpha: Math.max(0.08, Math.abs(noise) * 0.5),
              width: 0.4,
            });
          }
        }
      }
    }

    return branches;
  }

  drawElectricity(branches) {
    const ctx = this.ctx;

    branches.forEach((branch) => {
      const alpha = branch.alpha * this.intensity;

      ctx.strokeStyle = `rgba(255, 235, 140, ${alpha * 0.9})`;
      ctx.lineWidth = branch.width;
      ctx.lineCap = 'round';
      ctx.shadowColor = `rgba(255, 220, 80, ${alpha * 0.7})`;
      ctx.shadowBlur = 7;

      ctx.beginPath();
      ctx.moveTo(branch.x1, branch.y1);
      ctx.lineTo(branch.x2, branch.y2);
      ctx.stroke();
    });
  }

  // Resplandor amplio detrás del rayo
  drawBloom() {
    const ctx = this.ctx;
    const cx = (this.top.x + this.tip.x) / 2;
    const cy = (this.top.y + this.tip.y) / 2;
    const r = Math.hypot(this.top.x - this.tip.x, this.top.y - this.tip.y) * 0.75;
    if (r <= 0) return;

    const pulse = 0.10 + Math.sin(this.time * 0.004) * 0.03;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255, 208, 60, ${pulse})`);
    g.addColorStop(1, 'rgba(255, 208, 60, 0)');

    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Halo exterior del cuerpo
  drawBoltGlow() {
    const ctx = this.ctx;

    ctx.lineJoin = 'round';

    ctx.shadowColor = 'rgba(255, 200, 0, 0.95)';
    ctx.shadowBlur = 36;
    ctx.strokeStyle = 'rgba(255, 212, 40, 0.55)';
    ctx.lineWidth = 6;
    this.tracePath();
    ctx.stroke();

    ctx.shadowColor = 'rgba(255, 150, 0, 0.5)';
    ctx.shadowBlur = 55;
    ctx.strokeStyle = 'rgba(255, 180, 0, 0.22)';
    ctx.lineWidth = 14;
    this.tracePath();
    ctx.stroke();
  }

  // Cuerpo del rayo: degradado dorado con núcleo blanco brillante
  drawBoltBody() {
    const ctx = this.ctx;

    const g = ctx.createLinearGradient(this.top.x, this.top.y, this.tip.x, this.tip.y);
    g.addColorStop(0, 'rgba(255, 250, 215, 1)');
    g.addColorStop(0.45, 'rgba(255, 214, 64, 1)');
    g.addColorStop(1, 'rgba(255, 172, 0, 1)');

    ctx.shadowColor = 'rgba(255, 200, 0, 0.9)';
    ctx.shadowBlur = 22;
    ctx.fillStyle = g;
    this.tracePath();
    ctx.fill();

    // Núcleo interior brillante (efecto glossy)
    const cx = (this.top.x + this.tip.x) / 2;
    const cy = (this.top.y + this.tip.y) / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.55, 0.6);
    ctx.translate(-cx, -cy);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(255, 255, 240, 0.85)';
    this.tracePath();
    ctx.fill();
    ctx.restore();

    // Borde nítido
    ctx.shadowColor = 'rgba(255, 235, 130, 1)';
    ctx.shadowBlur = 9;
    ctx.strokeStyle = 'rgba(255, 246, 205, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    this.tracePath();
    ctx.stroke();
  }

  // Estelas de velocidad paralelas a los bordes largos
  drawSpeedStreaks() {
    const ctx = this.ctx;
    const streaks = [[0, 1], [4, 5], [9, 10]];

    streaks.forEach(([i, j], k) => {
      const p = this.boltShape[i];
      const q = this.boltShape[j];
      const dx = q.x - p.x;
      const dy = q.y - p.y;

      const x1 = p.x - dx * 0.35;
      const y1 = p.y - dy * 0.35;
      const x2 = q.x + dx * 0.35;
      const y2 = q.y + dy * 0.35;

      const flick = 0.55 + 0.45 * Math.sin(this.time * 0.01 + k * 2.1);
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, `rgba(255, 255, 235, ${0.5 * flick})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }

  // Impacto en el suelo: resplandor + chispas que saltan
  drawImpact() {
    const ctx = this.ctx;
    const t = this.tip;
    const flick = 0.7 + 0.3 * Math.sin(this.time * 0.02);

    // Resplandor elíptico en el punto de impacto
    const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 70);
    g.addColorStop(0, `rgba(255, 242, 185, ${0.5 * flick})`);
    g.addColorStop(0.3, `rgba(255, 200, 40, ${0.28 * flick})`);
    g.addColorStop(1, 'rgba(255, 200, 40, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(t.x, t.y, 70, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chispas radiando hacia arriba (pseudo-aleatorias, cambian cada ~8 frames)
    const sparkCount = 7;
    const step = Math.floor(this.time / 8);

    for (let i = 0; i < sparkCount; i++) {
      const seed = Math.sin(i * 12.9898 + step * 78.233) * 43758.5453;
      const rnd = seed - Math.floor(seed);
      const ang = -Math.PI * (0.15 + 0.7 * (i / sparkCount)) + (rnd - 0.5) * 0.4;
      const len = 10 + rnd * 26;
      const alpha = (0.35 + rnd * 0.5) * flick;

      const ex = t.x + Math.cos(ang) * len;
      const ey = t.y + Math.sin(ang) * len;

      ctx.strokeStyle = `rgba(255, 246, 200, ${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255, 220, 80, 0.9)';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 230, ${alpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  updateIntensity() {
    const pulse = Math.sin(this.time * 0.0025) * 0.1 + 0.9;
    this.intensity = Math.max(0.7, pulse);
  }

  render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;

    this.generateBoltShape();
    this.updateIntensity();

    if (!this.boltShape) return;

    ctx.globalAlpha = this.intensity;
    this.drawBloom();

    const branches = this.generateElectricity();
    ctx.globalAlpha = Math.min(1, this.intensity * 1.2);
    this.drawElectricity(branches);

    ctx.globalAlpha = this.intensity;
    this.drawBoltGlow();
    this.drawBoltBody();
    this.drawSpeedStreaks();
    this.drawImpact();

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

    const centerX = (this.top.x + this.tip.x) / 2;
    const centerY = (this.top.y + this.tip.y) / 2;

    const dx = this.mouse.x - centerX;
    const dy = this.mouse.y - centerY;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LightningEffect;
}
