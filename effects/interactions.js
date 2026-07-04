/**
 * Interactions - Efectos de interacción
 * Descargas en botones, textos, animación de entrada, respuesta al clic
 */

class InteractionEffects {
  constructor(lightningEffect, canvasId) {
    this.lightning = lightningEffect;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.discharges = [];
    this.time = 0;

    this.config = {
      dischargeWidth: 1.5,
      dischargeDuration: 400,
      buttonTargets: ['.btn-primary', '.btn-outline'],
      textTargets: ['strong', 'em'],
      keywords: [
        'baja', 'media', 'tensión',
        'eléctrico', 'electricidad',
        'energía', 'potencia',
        'industrial', 'servicios',
        'mantenimiento', 'diagnóstico',
        'rayo', 'descarga'
      ],
    };

    this.init();
  }

  init() {
    this.setupButtonHovers();
    this.setupTextHovers();
    this.setupClickDischarge();
    this.frame();
  }

  setupButtonHovers() {
    this.config.buttonTargets.forEach(selector => {
      document.querySelectorAll(selector).forEach(button => {
        button.addEventListener('mouseenter', () => this.triggerButtonDischarge(button));
      });
    });
  }

  setupTextHovers() {
    // Buscar palabras clave en el documento
    const walkDOM = (node) => {
      if (node.nodeType === 3) { // Text node
        const text = node.textContent;
        this.config.keywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword)) {
            const parent = node.parentElement;
            parent.addEventListener('mouseenter', () => {
              this.triggerTextDischarge(parent);
            });
          }
        });
      } else {
        node.childNodes.forEach(walkDOM);
      }
    };
    walkDOM(document.body);
  }

  setupClickDischarge() {
    document.addEventListener('click', (e) => {
      this.triggerClickDischarge(e.clientX, e.clientY);
    });
  }

  triggerButtonDischarge(button) {
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Trazar descarga alrededor del botón
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createDischarge(rect.left, rect.top, rect.left + rect.width, rect.top, 'button');
      }, i * 80);
    }
  }

  triggerTextDischarge(element) {
    const rect = element.getBoundingClientRect();
    this.createDischarge(rect.left, rect.top, rect.right, rect.top, 'text');
  }

  triggerClickDischarge(x, y) {
    // Crear descarga desde el cursor hacia arriba (hacia el rayo)
    if (this.lightning.boltShape) {
      const boltY = this.lightning.boltShape[0].y;
      this.createDischarge(x, y, x, boltY, 'click');
    }
  }

  createDischarge(x1, y1, x2, y2, type = 'button') {
    const segments = this.generateJaggedPath(x1, y1, x2, y2, 5);

    this.discharges.push({
      segments,
      age: 0,
      lifetime: this.config.dischargeDuration,
      type,
      alpha: 1,
    });
  }

  generateJaggedPath(x1, y1, x2, y2, displacement) {
    let segs = [{ x1, y1, x2, y2 }];

    for (let d = displacement; d >= 2; d /= 2) {
      const next = [];
      for (const s of segs) {
        const mx = (s.x1 + s.x2) / 2 + (Math.random() - 0.5) * d;
        const my = (s.y1 + s.y2) / 2 + (Math.random() - 0.5) * d;
        next.push({ x1: s.x1, y1: s.y1, x2: mx, y2: my });
        next.push({ x1: mx, y1: my, x2: s.x2, y2: s.y2 });
      }
      segs = next;
    }

    return segs;
  }

  updateDischarges() {
    for (let i = this.discharges.length - 1; i >= 0; i--) {
      const d = this.discharges[i];
      d.age++;
      d.alpha = Math.max(0, 1 - d.age / d.lifetime);

      if (d.age > d.lifetime) {
        this.discharges.splice(i, 1);
      }
    }
  }

  drawDischarges() {
    const ctx = this.ctx;

    for (const discharge of this.discharges) {
      ctx.globalAlpha = discharge.alpha;

      for (const seg of discharge.segments) {
        // Color según tipo
        let color = 'rgba(255, 255, 100, 0.8)';
        if (discharge.type === 'text') {
          color = 'rgba(255, 200, 0, 0.9)';
        } else if (discharge.type === 'click') {
          color = 'rgba(255, 150, 0, 0.95)';
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = this.config.dischargeWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  frame() {
    this.updateDischarges();
    this.drawDischarges();

    this.time++;
    requestAnimationFrame(() => this.frame());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractionEffects;
}
