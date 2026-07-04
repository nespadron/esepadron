# Referencia de API

## LightningEffect

La clase principal que renderiza el rayo con todas sus capas.

### Constructor

```javascript
const lightning = new LightningEffect(canvasId, stageId);
```

**Parámetros:**
- `canvasId` (string): ID del elemento canvas donde renderizar
- `stageId` (string): ID del elemento stage (referencia de posición)

**Ejemplo:**
```javascript
const lightning = new LightningEffect('canvas-lightning', 'boltStage');
```

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `canvas` | HTMLCanvasElement | Elemento canvas |
| `ctx` | CanvasRenderingContext2D | Contexto de renderizado |
| `boltShape` | Array | Puntos de la silueta del rayo |
| `time` | number | Contador de frames |
| `intensity` | number | 0-1, controla opacidad |
| `width` | number | Ancho del canvas en px |
| `height` | number | Alto del canvas en px |
| `mouse` | Object | `{x, y}` posición actual |

### Métodos Públicos

#### `setIntensityFromScroll(value)`
Controla la intensidad basada en scroll.

```javascript
lightning.setIntensityFromScroll(0.8); // 0-1
```

**Parámetro:**
- `value` (number): 0-1, se clampea a [0.7, 1]

**Uso típico:**
```javascript
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
  onUpdate: self => {
    lightning.setIntensityFromScroll(0.7 + self.progress * 0.3);
  }
});
```

#### `distanceToMouse()`
Calcula distancia desde el centro del rayo al cursor.

```javascript
const dist = lightning.distanceToMouse();
if (dist < 100) {
  console.log('Cursor muy cercano al rayo');
}
```

**Retorna:** number (píxeles)

#### `render()`
Renderiza un frame (se llama automáticamente).

```javascript
lightning.render();
```

**Nota:** Normalmente no necesitas llamar esto directamente.

### Propiedades Configurables

En el constructor, antes de `startAnimation()`:

```javascript
lightning.config.boltWidth = 100;      // Ancho del rayo
lightning.config.boltHeight = 250;     // Alto del rayo
lightning.config.electricityThinness = 1.5; // Grosor de ramas
```

---

## CustomCursor

Pararrayos interactivo que sigue el cursor.

### Constructor

```javascript
const cursor = new CustomCursor(lightningEffect);
```

**Parámetro:**
- `lightningEffect`: Instancia de LightningEffect

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `x` | number | Posición X del cursor |
| `y` | number | Posición Y del cursor |
| `glow` | number | 0-1, intensidad del glow |
| `sparkles` | Array | Chispas activas |
| `isActive` | boolean | Si el cursor está visible |

### Métodos Públicos

#### `draw(ctx)`
Dibuja el pararrayos en el canvas.

```javascript
cursor.draw(ctx);
```

**Parámetro:**
- `ctx`: CanvasRenderingContext2D

**Nota:** Se llama automáticamente si está integrado en script.js

#### `createSpark()`
Dispara una chispa manualmente.

```javascript
cursor.createSpark();
```

**Nota:** Se llama automáticamente cuando está cerca del rayo.

### Propiedades Configurables

```javascript
cursor.config.rodLength = 25;           // Longitud del pararrayos
cursor.config.glowDistance = 200;       // Distancia de efecto
cursor.config.sparkProbability = 0.1;   // Probabilidad de chispa
```

---

## ParticlesEffect

Sistema de 45 partículas flotantes.

### Constructor

```javascript
const particles = new ParticlesEffect(canvasId);
```

**Parámetro:**
- `canvasId`: ID del elemento canvas

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `particles` | Array | Lista de partículas activas |
| `mouse` | Object | Posición actual del cursor |

### Métodos Públicos

#### `createParticle()`
Crea una nueva partícula.

```javascript
const particle = particles.createParticle();
particles.particles.push(particle);
```

**Retorna:** Object con propiedades de partícula

### Propiedades Configurables

```javascript
particles.config.particleCount = 60;        // Número de partículas
particles.config.minSize = 0.3;             // Tamaño mínimo
particles.config.maxSize = 3;               // Tamaño máximo
particles.config.mouseInteractionDistance = 250; // Radio de repulsión
```

---

## ElectricSound

Síntesis de sonido eléctrico con Web Audio API.

### Constructor

```javascript
const sound = new ElectricSound();
```

**Nota:** Se inicializa automáticamente en el constructor.

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `audioContext` | AudioContext | Contexto de Web Audio |
| `masterGain` | GainNode | Nodo de volumen maestro |
| `isInitialized` | boolean | Si se inicializó correctamente |
| `ambientOscillators` | Array | Osciladores activos |

### Métodos Públicos

#### `startAmbientHum()`
Inicia el zumbido eléctrico continuo.

```javascript
sound.startAmbientHum();
```

**Nota:** Debe llamarse una sola vez.

#### `spark(x, y)`
Dispara sonido de chispa.

```javascript
sound.spark(100, 200);
```

**Parámetros:** (opcionales)
- `x`, `y`: Coordenadas

#### `discharge()`
Dispara sonido de descarga eléctrica.

```javascript
sound.discharge();
```

#### `charge()`
Dispara sonido de carga.

```javascript
sound.charge();
```

#### `setVolume(value)`
Establece el volumen maestro.

```javascript
sound.setVolume(0.2); // 0-1
```

**Parámetro:**
- `value` (number): 0 (mute) - 1 (máximo)

#### `stop()`
Detiene todos los osciladores.

```javascript
sound.stop();
```

**Nota:** Debe llamarse al desmontar.

---

## ElectromagneticField

Campo electromagnético distorsionador.

### Constructor

```javascript
const field = new ElectromagneticField(lightningEffect, canvasId);
```

**Parámetros:**
- `lightningEffect`: Instancia de LightningEffect
- `canvasId`: ID del canvas

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `fieldStrength` | number | 0-1, intensidad actual |
| `mouse` | Object | Posición del cursor |

### Métodos Públicos

#### `draw()`
Dibuja el campo electromagnético.

```javascript
field.draw();
```

**Nota:** Se llama automáticamente en el loop de renderizado.

#### `getDistortion(x, y)`
Calcula distorsión en un punto.

```javascript
const dist = field.getDistortion(100, 200);
// dist = {x: number, y: number}
```

**Retorna:** Object `{x, y}` con distorsión en píxeles

### Propiedades Configurables

```javascript
field.config.fieldRadius = 300;        // Radio de efecto
field.config.maxDistortion = 20;       // Distorsión máxima
field.config.glowRadius = 100;         // Radio del halo visible
```

---

## InteractionEffects

Descargas en botones y textos.

### Constructor

```javascript
const interactions = new InteractionEffects(lightningEffect, canvasId);
```

### Métodos Públicos

#### `triggerButtonDischarge(button)`
Descarga manual en un botón.

```javascript
const button = document.querySelector('.btn-primary');
interactions.triggerButtonDischarge(button);
```

#### `triggerTextDischarge(element)`
Descarga manual en un elemento de texto.

```javascript
const text = document.querySelector('strong');
interactions.triggerTextDischarge(text);
```

#### `triggerClickDischarge(x, y)`
Descarga desde coordenadas.

```javascript
interactions.triggerClickDischarge(100, 200);
```

### Propiedades Configurables

```javascript
interactions.config.keywords = [
  'baja', 'media', 'tensión',
  'eléctrico', 'energía',
  'industrial'
];
```

---

## Integración Completa

### Ejemplo básico

```javascript
// Crear todos los componentes
const lightning = new LightningEffect('canvas-lightning', 'boltStage');
const cursor = new CustomCursor(lightning);
const particles = new ParticlesEffect('canvas-lightning');
const sound = new ElectricSound();
const field = new ElectromagneticField(lightning, 'canvas-lightning');
const interactions = new InteractionEffects(lightning, 'canvas-lightning');

// Iniciar audio
sound.startAmbientHum();

// Integrar con scroll
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
  onUpdate: self => {
    lightning.setIntensityFromScroll(0.7 + self.progress * 0.3);
  }
});

// Eventos
document.addEventListener('click', () => sound.discharge());
```

### Ejemplo: Control de volumen

```javascript
// UI para volumen
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = '0';
volumeSlider.max = '1';
volumeSlider.step = '0.1';
volumeSlider.value = '0.15';

volumeSlider.addEventListener('change', e => {
  sound.setVolume(parseFloat(e.target.value));
});
```

### Ejemplo: Desactivar audio

```javascript
let audioEnabled = true;

function toggleAudio() {
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    sound.startAmbientHum();
  } else {
    sound.stop();
  }
}
```

---

## Constantes Internas

### Timers en ElectricSound

| Sonido | Duración |
|---|---|
| Spark | 150ms |
| Discharge | 80ms |
| Charge | 300ms |

### Frecuencias en ElectricSound

| Componente | Frecuencias |
|---|---|
| Ambient Hum | 60, 120, 180, 240 Hz |
| Spark Filter | 4-6 kHz (paso-alto) |
| Discharge Sweep | 800 → 100 Hz |
| Charge Sweep | 200 → 800 Hz |

---

## Glosario

| Término | Significado |
|---|---|
| **Canvas** | Elemento HTML5 para dibujo 2D |
| **Context** | Objeto que proporciona métodos de dibujo |
| **Render** | Dibujar un frame en pantalla |
| **FPS** | Frames por segundo |
| **Oscilator** | Objeto de audio que genera ondas |
| **Glow** | Efecto de resplandor |
| **Bloom** | Halo de luz que se expande |
| **Distortion** | Deformación sutil de píxeles |
| **Spark** | Chispa eléctrica pequeña |

---

**Anterior:** [AUDIO.md](./AUDIO.md)  
**Siguiente:** [CUSTOMIZATION.md](./CUSTOMIZATION.md)
