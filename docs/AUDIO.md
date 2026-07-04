# Sistema de Audio Eléctrico

## ElectricSound - Síntesis Web Audio API

El componente `audio.js` genera sonido eléctrico en tiempo real usando Web Audio API, sin archivos de audio externos.

## Inicialización

```javascript
const sound = new ElectricSound();
sound.startAmbientHum(); // Inicia zumbido ambiental
sound.setVolume(0.15);   // Volumen default
```

## Componentes de Sonido

### 1. Zumbido Ambiental (Ambient Hum)

#### ¿Qué es?
Un sonido continuo de fondo que simula el zumbido eléctrico de alta tensión, como el que escucharías cerca de transformadores o líneas de poder.

#### Técnica
```javascript
startAmbientHum() {
  const frequencies = [60, 120, 180, 240]; // Hz
  // Cada frecuencia:
  // - Genera un oscilador
  // - Aplica modulación de amplitud (LFO)
  // - Conecta a masterGain
}
```

#### Características

| Parámetro | Valor | Descripción |
|---|---|---|
| **Frecuencia base** | 60 Hz | Frecuencia de línea eléctrica estándar |
| **Armónicas** | 120, 180, 240 Hz | Múltiplos de 60 Hz |
| **Tipo onda base** | Sine | Suave, natural |
| **Tipo armónicas** | Triangle | Más rico en frecuencias |
| **Modulación LFO** | 4-6 Hz | Variación sutil de amplitud |
| **Volumen** | 0.08 × (1/índice) | Decreciente para armónicas |

#### Por qué funciona
- **60 Hz** es la frecuencia de CA estándar en América del Norte
- El oído humano percibe esto como "zumbido de poder"
- Las **armónicas** crean una textura rica sin ser abrumador
- La **modulación de amplitud** evita que suene plano

### 2. Sonido de Chispa (Spark)

#### ¿Qué es?
Un sonido corto y agudo que simula chispas eléctricas individuales.

#### Técnica
```javascript
spark(x, y) {
  // Genera ruido blanco transitorio
  // Filtro paso-alto a ~4-6 kHz
  // Decay exponencial en 150ms
}
```

#### Características

```
Tiempo →
Amplitud
    ↑ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █
0.08│╱▔▔▔▔▔▔▔▔▔▔▔▔▔╲
    │                ╲
    │                 ╲
0.00│______________________ (150ms)
```

| Parámetro | Valor | Descripción |
|---|---|---|
| **Tipo** | Ruido blanco | Espectro completo |
| **Filtro** | Paso-alto @ 4-6kHz | Solo agudos |
| **Duración** | 150ms | Corto y punzante |
| **Decay** | Exponencial | Suena natural |
| **Amplitud** | 0.08 | Bajo pero audible |

#### Cuándo se dispara
- Al acercarse el cursor dentro de 80px del rayo
- Probabilidad: 8% por frame
- Resultado: Sonido ocasional de chispas

### 3. Sonido de Descarga (Discharge)

#### ¿Qué es?
Un sonido rápido que simula la liberación de energía eléctrica, como un rayo descargándose.

#### Técnica
```javascript
discharge() {
  // Barrida rápida de frecuencia (800Hz → 100Hz)
  // Tipo: Sine wave
  // Duración: 80ms
  // + ruido blanco adicional
}
```

#### Características

```
Frecuencia ↑
800Hz  │ ╱╲
       │╱  ╲
400Hz  │    ╲
       │     ╲
100Hz  │      ╲____
       └────────────  Tiempo →
           80ms
```

| Parámetro | Valor | Descripción |
|---|---|---|
| **Freq inicio** | 800 Hz | Agudo inicial |
| **Freq final** | 100 Hz | Grave final |
| **Tipo barrida** | Exponencial | Suena natural |
| **Duración** | 80ms | Impacto fuerte |
| **Envolvente** | ADSR rápido | Attack instantáneo, Decay exponencial |

#### Cuándo se dispara
- Al hacer click en la página
- Al hacer hover en botones
- Resultado: Sonido de descarga eléctrica

### 4. Sonido de Carga (Charge)

#### ¿Qué es?
Una barrida ascendente de frecuencia que simula acumulación de energía.

#### Técnica
```javascript
charge() {
  // Barrida: 200Hz → 800Hz
  // Tipo: Triangle wave (más rico)
  // Duración: 300ms
  // Amplitud: Creciente
}
```

| Parámetro | Valor | Descripción |
|---|---|---|
| **Freq inicio** | 200 Hz | Grave inicial |
| **Freq final** | 800 Hz | Agudo final |
| **Tipo onda** | Triangle | Más armónico que sine |
| **Duración** | 300ms | Más lenta que descarga |
| **Envolvente** | Creciente | Amplitud sube durante evento |

## API Completa

### Métodos Públicos

#### `constructor()`
```javascript
const sound = new ElectricSound();
```
Inicializa el contexto de audio y configura ganancias.

#### `startAmbientHum()`
```javascript
sound.startAmbientHum();
```
Inicia el zumbido ambiental continuo.
- Debe llamarse una sola vez
- Se puede detener con `stop()`

#### `spark(x, y)`
```javascript
sound.spark(100, 200);
```
Dispara un sonido de chispa en coordenadas (x, y).
- x, y: Parámetros opcionales (por compatibilidad futura)
- Se puede llamar múltiples veces simultáneamente

#### `discharge()`
```javascript
sound.discharge();
```
Dispara un sonido de descarga eléctrica.
- Suena más fuerte que spark
- Más dramático

#### `charge()`
```javascript
sound.charge();
```
Dispara un sonido de carga (barrida ascendente).
- Suena más prolongado
- Sugiere acumulación de energía

#### `stop()`
```javascript
sound.stop();
```
Detiene todos los osciladores activos.
- Debe llamarse al desmontar el componente
- No detiene sparks/discharges activos (dejan decaer naturalmente)

#### `setVolume(value)`
```javascript
sound.setVolume(0.1);  // 0-1
```
Establece el volumen maestro.
- 0 = Silencio
- 0.15 = Default recomendado
- 1.0 = Máximo (puede ser muy fuerte)

## Integración con Eventos

### En script.js

```javascript
const electricSound = new ElectricSound();
electricSound.startAmbientHum();

// Descarga en click global
document.addEventListener('click', () => {
  electricSound.discharge();
});

// Chispa en hover de botones
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    electricSound.spark(btn.getBoundingClientRect().x, 
                       btn.getBoundingClientRect().y);
  });
});
```

## Configuración Avanzada

### Cambiar frecuencia base

```javascript
// En audio.js, método startAmbientHum():
const frequencies = [50, 100, 150, 200]; // 50 Hz base (Europa)
```

### Cambiar timbre

```javascript
// Cambiar de sine a sawtooth para sonido más brillante
osc.type = 'sawtooth';

// Cambiar de sine a square para sonido más áspero
osc.type = 'square';
```

### Cambiar modulación

```javascript
// Modulación más rápida (vibrato más perceptible)
modOsc.frequency.value = 8 + idx * 1.0; // Antes era 4+idx*0.5

// Modulación más lenta (más sutil)
modOsc.frequency.value = 2 + idx * 0.3;
```

## Consideraciones de Accesibilidad

### Opción para deshabilitar audio

```javascript
// En script.js
let audioEnabled = localStorage.getItem('audioEnabled') !== 'false';

if (audioEnabled) {
  electricSound = new ElectricSound();
  electricSound.startAmbientHum();
}

// Toggle por usuario
window.toggleAudio = () => {
  audioEnabled = !audioEnabled;
  localStorage.setItem('audioEnabled', audioEnabled ? 'true' : 'false');
  location.reload();
};
```

### Advertencia para usuarios sensibles

```html
<div class="audio-warning">
  ⚠️ Esta página contiene sonido eléctrico continuo.
  <a href="#" onclick="window.toggleAudio(); return false;">
    Desactivar audio
  </a>
</div>
```

## Rendimiento

- **Osciladores simultáneos:** ~8-12
- **Uso de CPU:** <1% (muy bajo)
- **Latencia:** <20ms
- **Compatible con todos los navegadores modernos:** ✅

## Depuración

### Visualizar salida de audio

```javascript
// En console del navegador
const analyser = electricSound.audioContext.createAnalyser();
electricSound.masterGain.connect(analyser);

// Luego inspeccionar analyser.getByteFrequencyData()
```

### Silenciar solo tipo específico

```javascript
// Detener solo ambient hum
electricSound.ambientOscillators.forEach(o => o.osc.stop());
electricSound.ambientOscillators = [];
```

## Notas Técnicas

### Web Audio API Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 14.5+)
- ⚠️ Algunos navegadores requieren interacción del usuario para iniciar audio

### Limitaciones
- No se puede crear audio completamente gratuito (sin Web Audio API)
- La síntesis en tiempo real tiene menor fidelidad que archivos de audio
- La calidad depende del navegador y dispositivo

## Alternativa: Usar archivos de audio

Si prefieres usar archivos de audio reales:

```javascript
class ElectricSoundFile {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.ambientHum = null;
    this.sparkSound = null;
  }

  async loadSounds() {
    this.ambientHum = await this.loadAudio('/audio/hum.mp3');
    this.sparkSound = await this.loadAudio('/audio/spark.mp3');
  }

  async loadAudio(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(buffer);
  }

  playHum() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.ambientHum;
    source.loop = true;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
```

---

**Próxima lectura:** [API.md](./API.md) - Referencia completa de API
