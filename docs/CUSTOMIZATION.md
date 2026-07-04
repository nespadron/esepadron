# Guía de Personalización Avanzada

## Modificar el Rayo

### Cambiar colores

En `effects/lightning.js`:

```javascript
drawBoltCore() {
  const ctx = this.ctx;
  const shape = this.boltShape;

  // Cambiar de gris oscuro a azul oscuro
  ctx.fillStyle = 'rgba(10, 20, 40, 0.9)'; // Azul en lugar de gris
  ctx.beginPath();
  shape.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
}
```

**Paletas prehechas:**

```javascript
// Rayo azul (como en cielo)
'rgba(0, 100, 255, 0.9)'    // Interior
'rgba(100, 200, 255, 0.8)'  // Glow

// Rayo púrpura (cyberpunk)
'rgba(80, 0, 120, 0.9)'     // Interior
'rgba(200, 100, 255, 0.8)'  // Glow

// Rayo rojo (peligro)
'rgba(100, 20, 20, 0.9)'    // Interior
'rgba(255, 100, 100, 0.8)'  // Glow
```

### Cambiar tamaño del rayo

En `effects/lightning.js`, en método `generateBoltShape()`:

```javascript
const scale = rect.width * 0.8; // 80% del ancho
// Cambiar a:
const scale = rect.width * 1.2; // 120% del ancho (más grande)
```

También puedes cambiar la altura:

```javascript
const scaleY = r.height * 1.1; // Altura vertical
// Cambiar a:
const scaleY = r.height * 1.5; // Más alto
```

### Cambiar velocidad de pulsación

En `updateIntensity()`:

```javascript
updateIntensity() {
  const pulse = Math.sin(this.time * 0.0025) * 0.12 + 0.88;
  // Cambiar 0.0025 para velocidad:
  // Mayor = más lento
  // Menor = más rápido
  
  // Ejemplo: Pulsación más rápida
  const pulse = Math.sin(this.time * 0.005) * 0.12 + 0.88; // 2x más rápido
}
```

### Aumentar densidad de electricidad

En `generateElectricity()`:

```javascript
const points = Math.max(3, Math.floor(len / 4));
// Cambiar a:
const points = Math.max(3, Math.floor(len / 2)); // Más puntos = más rama
```

También aumentar probabilidad:

```javascript
if (Math.abs(noise) > 0.3 || Math.random() < 0.25) {
  // Cambiar 0.25 a 0.5 para más ramificaciones (50% vs 25%)
}
```

## Personalizar el Cursor

En `effects/cursor.js`:

### Cambiar forma

```javascript
// Cambiar de varilla diagonal a vertical
const angle = 0; // Vertical en lugar de -Math.PI / 4

// O hacer una forma de cruz
// Dibujar dos varillas (una vertical, una horizontal)
```

### Cambiar color

```javascript
// Interior del conductor
ctx.strokeStyle = `rgba(200, 100, 50, ${mainAlpha})`; // Naranja en lugar de gris

// Brillo
ctx.strokeStyle = `rgba(255, 200, 100, ${shineAlpha})`; // Más cálido
```

### Cambiar tamaño

```javascript
this.config.rodLength = 30;  // Más largo (default 22)
this.config.rodWidth = 12;   // Más grueso (default 9)
```

### Cambiar color de chispas

En método `createSpark()`:

```javascript
this.sparkles.push({
  // ...
  color: Math.random() < 0.6 ? 'red' : 'orange', // Rojo/naranja en lugar de white/yellow
});
```

## Modificar Sonido

En `effects/audio.js`:

### Cambiar frecuencia base

```javascript
startAmbientHum() {
  // De 60Hz (América del Norte) a 50Hz (Europa)
  const frequencies = [50, 100, 150, 200];
}
```

### Cambiar volumen

```javascript
// En script.js al inicializar
electricSound.setVolume(0.25); // Más fuerte (default 0.15)
```

### Deshabilitar sonidos específicos

```javascript
// Desabilitar spark
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
  // btn.addEventListener('mouseenter', () => electricSound.spark(...)); // Comentar
});

// Desabilitar discharge
// document.addEventListener('click', () => electricSound.discharge()); // Comentar
```

### Agregar nuevos sonidos

```javascript
class ElectricSound {
  // Nuevo método
  powerDown() {
    if (!this.audioContext) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5); // Barrida lenta

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// Usar
window.electricSound.powerDown();
```

## Modificar Partículas

En `effects/particles.js`:

### Cambiar cantidad

```javascript
this.config.particleCount = 100; // Más partículas (default 45)
```

### Cambiar colores

```javascript
this.config.colors = [
  'rgba(255, 0, 0, ',      // Rojo
  'rgba(0, 255, 0, ',      // Verde
  'rgba(0, 0, 255, '       // Azul
];
```

### Cambiar tamaño

```javascript
this.config.minSize = 1;    // Más grande (default 0.5)
this.config.maxSize = 4;    // Más grande (default 2.5)
```

### Cambiar velocidad

```javascript
this.config.minSpeed = 0.5; // Más rápido (default 0.3)
this.config.maxSpeed = 1.5; // Más rápido (default 0.8)
```

## Modificar Campo Electromagnético

En `effects/electromagnetic-field.js`:

### Cambiar tamaño del campo

```javascript
this.config.fieldRadius = 400;  // Más grande (default 250)
this.config.glowRadius = 150;   // Más grande (default 80)
```

### Cambiar intensidad de distorsión

```javascript
this.config.maxDistortion = 30; // Más distorsión (default 15)
```

### Cambiar visualización

```javascript
draw() {
  // Cambiar número de capas concéntricas
  const layers = 6; // De 4 a 6 (default 4)
  
  // Cambiar número de líneas de campo
  const lineCount = 12; // De 8 a 12 (default 8)
}
```

## Modificar Interacciones

En `effects/interactions.js`:

### Agregar más palabras clave

```javascript
this.config.keywords = [
  'baja', 'media', 'tensión',
  'poder', 'energía', 'voltaje', // Agregar
  'transformador', 'circuito',   // Agregar
  'corriente', 'fase'             // Agregar
];
```

### Cambiar duración de descarga

```javascript
this.config.dischargeDuration = 600; // Más largo (default 400ms)
```

### Cambiar grosor de descarga

```javascript
this.config.dischargeWidth = 2.5; // Más grueso (default 1.5)
```

## Cambios Globales de Rendimiento

### Reducir calidad para mejor rendimiento

```javascript
// En script.js
const PERFORMANCE_MODE = true;

if (PERFORMANCE_MODE) {
  lightning.config.electricityBranchCount = 6; // Menos ramas
  particles.config.particleCount = 20;         // Menos partículas
  emField = null;                              // Desabilitar campo
}
```

### Aumentar calidad

```javascript
// En script.js
const QUALITY_MODE = true;

if (QUALITY_MODE) {
  lightning.config.electricityBranchCount = 18;    // Más ramas
  particles.config.particleCount = 80;             // Más partículas
  // Campo electromagnético se mantiene
}
```

## Temas Predefinidos

### Tema Hielo (Azul frío)

```javascript
// lightning.js
// Interior: Azul gris oscuro
ctx.fillStyle = 'rgba(20, 30, 50, 0.9)';

// Glow 1: Cian brillante
ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
ctx.shadowColor = 'rgba(100, 200, 255, 1)';

// Glow 2: Azul claro
ctx.strokeStyle = 'rgba(150, 220, 255, 0.5)';
ctx.shadowColor = 'rgba(100, 180, 255, 0.6)';

// cursor.js - Color conductor: Plata helada
ctx.strokeStyle = `rgba(180, 200, 220, ${mainAlpha})`;
```

### Tema Lava (Rojo/Naranja)

```javascript
// Interior: Rojo oscuro
ctx.fillStyle = 'rgba(60, 10, 10, 0.9)';

// Glow 1: Rojo brillante
ctx.strokeStyle = 'rgba(255, 100, 50, 0.8)';
ctx.shadowColor = 'rgba(255, 100, 50, 1)';

// Glow 2: Naranja
ctx.strokeStyle = 'rgba(255, 150, 80, 0.5)';
ctx.shadowColor = 'rgba(255, 120, 50, 0.6)';

// cursor.js - Color conductor: Cobre
ctx.strokeStyle = `rgba(184, 115, 51, ${mainAlpha})`;
```

### Tema Ciberpunk (Púrpura)

```javascript
// Interior: Púrpura oscuro
ctx.fillStyle = 'rgba(40, 10, 60, 0.9)';

// Glow 1: Magenta
ctx.strokeStyle = 'rgba(200, 50, 200, 0.8)';
ctx.shadowColor = 'rgba(200, 50, 200, 1)';

// Glow 2: Cian
ctx.strokeStyle = 'rgba(50, 200, 200, 0.5)';
ctx.shadowColor = 'rgba(50, 200, 200, 0.6)';

// cursor.js - Color conductor: Neón
ctx.strokeStyle = `rgba(200, 100, 255, ${mainAlpha})`;
```

## Agregar Eventos Personalizados

```javascript
// En script.js

// Evento: Lightning intensidad cambia
window.addEventListener('lightning-intensity-change', e => {
  console.log('Nueva intensidad:', e.detail.intensity);
});

// Disparar evento personalizado
lightning.render = function() {
  // ... código original ...
  window.dispatchEvent(new CustomEvent('lightning-intensity-change', {
    detail: { intensity: this.intensity }
  }));
};

// Escuchar eventos de chispas
document.addEventListener('spark', e => {
  console.log('Chispa en:', e.detail.x, e.detail.y);
});
```

## Exportar Configuración

Guardar config como JSON:

```javascript
// Crear config
const config = {
  lightning: {
    colors: { dark: 'rgba(15,12,8,0.9)', glow: 'rgba(255,200,0,1)' },
    intensity: lightning.intensity,
    size: { width: 80, height: 200 }
  },
  sound: {
    volume: 0.15,
    enabled: true
  },
  particles: {
    count: 45,
    colors: ['white', 'yellow', 'gold']
  }
};

// Guardar
localStorage.setItem('lightningConfig', JSON.stringify(config));

// Cargar después
const saved = JSON.parse(localStorage.getItem('lightningConfig'));
```

---

**Documentación completa terminada**

Para más información, ver:
- 📖 [README.md](./README.md) - Visión general
- 🔆 [EFFECTS.md](./EFFECTS.md) - Detalles de efectos visuales
- 🔊 [AUDIO.md](./AUDIO.md) - Sistema de sonido
- ⚙️ [API.md](./API.md) - Referencia de API
- 🚀 [INSTALLATION.md](./INSTALLATION.md) - Instalación
