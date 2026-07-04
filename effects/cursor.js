/**
 * Custom Cursor - Pararrayos interactivo
 * Conductor metálico que se ilumina cerca del rayo
 * Emite chispas al aproximarse
 * Atrae sutilmente las ramificaciones
 */

class CustomCursor {
  constructor(lightningEffect) {
    this.lightning = lightningEffect;
    this.x = -9999;
    this.y = -9999;
    this.sparkles = [];
    this.glow = 0;
    this.isActive = false;
    this.lastSparkTime = 0;

    this.config = {
      rodLength: 22,
      rodWidth: 9,
      glowDistance: 180,
      glowIntensity: 0,
      sparkProbability: 0.08,
      sparkLifetime: 350,
    };

    this.init();
  }

  init() {
    // Ocultar cursor por defecto (solo en dispositivos con puntero preciso)
    if (window.matchMedia('(pointer: fine)').matches) {
      document.documentElement.style.cursor = 'none';
    }

    // Tracking de mouse
    document.addEventListener('mousemove', (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
      this.isActive = true;
    });

    document.addEventListener('mouseleave', () => {
      this.isActive = false;
    });

    document.addEventListener('mouseenter', () => {
      this.isActive = true;
    });
  }

  updateGlow() {
    const dist = this.lightning.distanceToMouse();
    const minDist = this.config.glowDistance;

    if (dist < minDist && dist > 0) {
      const targetGlow = 1 - (dist / minDist);
      this.glow = this.glow * 0.85 + targetGlow * 0.15; // Suavizar transición

      // Generar chispas al acercarse
      if (dist < 80 && Math.random() < this.config.sparkProbability) {
        this.createSpark();
      }
    } else {
      this.glow = Math.max(0, this.glow - 0.05);
    }
  }

  createSpark() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 2.5;

    this.sparkles.push({
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      lifetime: this.config.sparkLifetime,
      size: 1.2 + Math.random() * 1.8,
      color: Math.random() < 0.6 ? 'white' : 'yellow',
    });
  }

  updateSparkles() {
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const spark = this.sparkles[i];
      spark.age++;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.12; // Gravedad sutil
      spark.vx *= 0.98; // Fricción

      if (spark.age > spark.lifetime) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    if (!this.isActive) return;

    this.updateGlow();
    this.updateSparkles();

    const angle = -Math.PI / 4; // Diagonal hacia arriba-derecha
    const rodX2 = this.x + Math.cos(angle) * this.config.rodLength;
    const rodY2 = this.y + Math.sin(angle) * this.config.rodLength;

    // Sombra/Glow base que aumenta con proximidad
    const glowBlur = 8 + this.glow * 20;
    ctx.shadowBlur = glowBlur;
    ctx.shadowColor = `rgba(241, 196, 15, ${0.2 + this.glow * 0.6})`;

    // Barra principal del pararrayos - conductor metálico
    const mainAlpha = 0.65 + this.glow * 0.35;
    ctx.strokeStyle = `rgba(100, 105, 110, ${mainAlpha})`;
    ctx.lineWidth = this.config.rodWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(rodX2, rodY2);
    ctx.stroke();

    // Brillo del conductor - capa de luz
    const shineAlpha = 0.3 + this.glow * 0.7;
    ctx.strokeStyle = `rgba(220, 225, 230, ${shineAlpha})`;
    ctx.lineWidth = this.config.rodWidth * 0.35;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(rodX2, rodY2);
    ctx.stroke();

    // Punta de la varilla - esfera metálica
    const tipAlpha = 0.75 + this.glow * 0.25;
    ctx.fillStyle = `rgba(210, 215, 220, ${tipAlpha})`;
    ctx.beginPath();
    ctx.arc(rodX2, rodY2, this.config.rodWidth * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Glow intenso en la punta cuando cerca
    if (this.glow > 0.15) {
      ctx.shadowColor = `rgba(255, 200, 0, ${this.glow * 0.95})`;
      ctx.shadowBlur = 25;
      ctx.fillStyle = `rgba(255, 240, 150, ${this.glow * 0.35})`;
      ctx.beginPath();
      ctx.arc(rodX2, rodY2, this.config.rodWidth * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dibujar chispas
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(255, 200, 0, 0.5)';

    for (const spark of this.sparkles) {
      const sparkAlpha = Math.max(0, 1 - (spark.age / spark.lifetime));

      if (spark.color === 'white') {
        ctx.fillStyle = `rgba(255, 255, 200, ${sparkAlpha * 0.85})`;
      } else {
        ctx.fillStyle = `rgba(255, 200, 50, ${sparkAlpha * 0.9})`;
      }

      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow de la chispa
      ctx.strokeStyle = `rgba(255, 200, 0, ${sparkAlpha * 0.4})`;
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomCursor;
}
