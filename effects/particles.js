/**
 * Particles Effect - Sistema de partículas interactivas
 * Partículas: blanco, amarillo, dorado
 * Comportamiento: flotan, desaparecen, aparecen, reaccionan al cursor
 */

class ParticlesEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, distance: Infinity };
    this.time = 0;

    this.config = {
      particleCount: 45,
      colors: ['rgba(255, 255, 255, ', 'rgba(241, 196, 15, ', 'rgba(218, 165, 32, '],
      minSize: 0.5,
      maxSize: 2.5,
      minLifetime: 300,  // frames (~5s a 60fps)
      maxLifetime: 700,  // frames (~12s a 60fps)
      minSpeed: 0.3,
      maxSpeed: 0.8,
      mouseInteractionDistance: 200,
      mouseRepulsionForce: 3,
    };

    this.init();
    this.setupEventListeners();
    this.frame();
  }

  init() {
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const colorIndex = Math.floor(Math.random() * this.config.colors.length);
    const color = this.config.colors[colorIndex];

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * this.config.maxSpeed,
      vy: (Math.random() - 0.5) * this.config.maxSpeed,
      size: Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize,
      color,
      alpha: 0,
      baseAlpha: Math.random() * 0.6 + 0.4,
      lifetime: Math.random() * (this.config.maxLifetime - this.config.minLifetime) + this.config.minLifetime,
      age: 0,
      phase: Math.random() * Math.PI * 2, // Para animación de flotación
    };
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }

  updateParticles() {
    const { width, height } = this.canvas.getBoundingClientRect();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age++;

      // Flotación sinusoidal sutil
      const floatForce = Math.sin(p.phase + this.time * 0.001) * 0.02;
      p.vy += floatForce;
      p.vy *= 0.98; // Fricción

      // Movimiento
      p.x += p.vx;
      p.y += p.vy;

      // Interacción con mouse
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.config.mouseInteractionDistance && dist > 0) {
        const force = (1 - dist / this.config.mouseInteractionDistance) * this.config.mouseRepulsionForce;
        p.vx += (dx / dist) * force * -0.1; // Repulsión
        p.vy += (dy / dist) * force * -0.1;
      }

      // Wrapping
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      // Fade in/out suave (60 frames ≈ 1s)
      if (p.age < 60) {
        p.alpha = (p.age / 60) * p.baseAlpha;
      } else if (p.age > p.lifetime - 60) {
        p.alpha = ((p.lifetime - p.age) / 60) * p.baseAlpha;
      } else {
        p.alpha = p.baseAlpha;
      }

      // Remover si expiró
      if (p.age > p.lifetime) {
        this.particles.splice(i, 1);
        if (this.particles.length < this.config.particleCount) {
          this.particles.push(this.createParticle());
        }
      }
    }
  }

  drawParticles() {
    const ctx = this.ctx;

    for (const p of this.particles) {
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow suave
      ctx.strokeStyle = p.color + p.alpha * 0.5 + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  frame() {
    this.updateParticles();
    this.drawParticles();

    this.time++;
    requestAnimationFrame(() => this.frame());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticlesEffect;
}
