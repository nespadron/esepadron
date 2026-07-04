/**
 * Electromagnetic Field - Campo electromagnético distorsionador
 * Crea un halo distorsionador alrededor del cursor
 * Afecta partículas y electricidad sutilmente
 */

class ElectromagneticField {
  constructor(lightningEffect, canvasId) {
    this.lightning = lightningEffect;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = { x: -9999, y: -9999 };
    this.fieldStrength = 0;

    this.config = {
      fieldRadius: 250,
      maxDistortion: 15,
      glowRadius: 80,
    };

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }

  updateFieldStrength() {
    const dist = this.lightning.distanceToMouse();
    const maxDist = this.config.fieldRadius;

    if (dist < maxDist && dist > 0) {
      this.fieldStrength = 1 - (dist / maxDist);
    } else {
      this.fieldStrength = Math.max(0, this.fieldStrength - 0.05);
    }
  }

  draw() {
    this.updateFieldStrength();
    if (this.fieldStrength < 0.01) return;

    const ctx = this.ctx;
    const x = this.mouse.x;
    const y = this.mouse.y;

    // Círculos de distorsión concéntricos
    const layers = 4;
    for (let i = 0; i < layers; i++) {
      const progress = i / layers;
      const radius = this.config.glowRadius * (1 - progress);
      const alpha = this.fieldStrength * (1 - progress) * 0.15;

      ctx.strokeStyle = `rgba(241, 196, 15, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Líneas de campo magnético
    const lineCount = 8;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const x1 = x + Math.cos(angle) * 30;
      const y1 = y + Math.sin(angle) * 30;
      const x2 = x + Math.cos(angle) * (this.config.glowRadius * 0.6);
      const y2 = y + Math.sin(angle) * (this.config.glowRadius * 0.6);

      ctx.strokeStyle = `rgba(255, 200, 0, ${this.fieldStrength * 0.08})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Halo central suave
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.config.glowRadius);
    gradient.addColorStop(0, `rgba(255, 200, 0, ${this.fieldStrength * 0.2})`);
    gradient.addColorStop(1, `rgba(255, 200, 0, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, this.config.glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  getDistortion(x, y) {
    const dx = x - this.mouse.x;
    const dy = y - this.mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.config.fieldRadius || dist === 0) return { x: 0, y: 0 };

    const force = (1 - dist / this.config.fieldRadius) * this.config.maxDistortion;
    const angle = Math.atan2(dy, dx);

    return {
      x: Math.cos(angle) * force * this.fieldStrength,
      y: Math.sin(angle) * force * this.fieldStrength,
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElectromagneticField;
}
