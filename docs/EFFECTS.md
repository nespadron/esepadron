# Guía de Efectos Visuales

## Componente Principal: LightningEffect

El componente `lightning.js` es responsable de renderizar el rayo con todas sus capas visuales.

### Las 6 Capas del Rayo

#### 1. Interior Oscuro (Core)
```javascript
drawBoltCore() {
  ctx.fillStyle = 'rgba(15, 12, 8, 0.9)';
  // Interior tipo carbón quemado
}
```
- **Color:** RGBA(15, 12, 8, 0.9) - gris muy oscuro
- **Propósito:** Proporciona contraste y profundidad
- **Efecto:** Hace que el rayo se vea "sólido" en lugar de transparente

#### 2. Borde Blanco Brillante
```javascript
drawBoltBorder() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 12;
}
```
- **Color:** Blanco casi puro (255, 255, 255)
- **Grosor:** 2.5px
- **Sombra:** Blur 12px
- **Propósito:** Define los bordes del rayo con precisión

#### 3. Glow Amarillo Intenso
```javascript
// Primer glow
ctx.shadowColor = 'rgba(255, 200, 0, 1)';
ctx.shadowBlur = 32;
ctx.strokeStyle = 'rgba(255, 230, 50, 0.8)';
ctx.lineWidth = 8;
```
- **Color principal:** Amarillo brillante (255, 200, 0)
- **Color stroke:** Amarillo más claro (255, 230, 50)
- **Blur:** 32px para efecto difuso
- **Propósito:** Principal fuente de luminosidad

#### 4. Glow Naranja Ligero
```javascript
// Segundo glow
ctx.shadowColor = 'rgba(255, 150, 0, 0.6)';
ctx.shadowBlur = 40;
ctx.strokeStyle = 'rgba(255, 180, 0, 0.4)';
ctx.lineWidth = 16;
```
- **Color:** Naranja (255, 150, 0)
- **Blur:** 40px para expansión suave
- **Propósito:** Complementa el amarillo con calidez

#### 5. Bloom Exterior
```javascript
drawBoltBloom() {
  ctx.shadowColor = 'rgba(255, 200, 0, 0.8)';
  ctx.shadowBlur = 60;
  ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
}
```
- **Alcance:** Blur 60px
- **Efecto:** Ilumina el fondo blanco circundante
- **Propósito:** Crea el efecto de "luz que sale del rayo"

#### 6. Electricidad Recorriendo el Borde
```javascript
generateElectricity() {
  // Genera miles de ramificaciones finas
  const points = Math.max(3, Math.floor(len / 4));
  // Para cada punto:
  if (Math.abs(noise) > 0.3 || Math.random() < 0.25) {
    // Crear ramificación
  }
}
```
- **Densidad:** Variable según ruido perlin simulado
- **Grosor:** 0.7-1.5px
- **Color:** Blanco con tinte amarillo
- **Renovación:** Cada frame (~16ms)
- **Propósito:** Simula electricidad fluyendo constantemente

### Ruido Multi-Frecuencia

La electricidad se genera usando ruido basado en múltiples frecuencias sinusoidales:

```javascript
const f1 = Math.sin((x * 0.01 + time * 50) * 0.004) * 0.35;  // Baja frecuencia
const f2 = Math.cos((y * 0.01 + time * 40) * 0.005) * 0.35;  // Media frecuencia
const f3 = Math.sin((i + time * 0.6) * 0.6) * 0.3;            // Alta frecuencia
const noise = f1 + f2 + f3;
```

Esto crea ramificaciones que:
- Parecen **naturales** y **impredecibles**
- No repiten exactamente el mismo patrón
- Tienen **múltiples escalas** de detalle
- Fluyen de forma **orgánica**

### Pulsación y Movimiento

```javascript
updateIntensity() {
  const pulse = Math.sin(this.time * 0.0025) * 0.12 + 0.88;
  this.intensity = Math.max(0.65, pulse);
}
```

- **Período:** ~2.5 segundos por ciclo completo
- **Amplitud:** ±12% alrededor de 88%
- **Mínimo:** 65% (nunca se apaga completamente)
- **Efecto:** El rayo "respira" sutilmente

### Arco Eléctrico en la Base

```javascript
drawElectricalArcs() {
  const arcRadius = 40 + Math.sin(this.time * 0.007) * 15;
  // Dibuja arco circular en la base
  // Agrega chispas puntuales
}
```

- **Radio base:** 40px
- **Variación:** ±15px sinusoidal
- **Chispas:** 4-6 por frame
- **Efecto:** Simula descarga donde toca el suelo

## Componente: CustomCursor (Pararrayos)

### Estructura del Pararrayos

```javascript
// Dibujo de 4 partes:
1. Conductor metálico (gris oscuro)
2. Brillo del conductor (gris claro)
3. Punta metálica (esfera pequeña)
4. Halo de glow (cuando cerca del rayo)
```

### Sistema de Glow

```javascript
updateGlow() {
  const dist = this.lightning.distanceToMouse();
  const minDist = this.config.glowDistance; // 180px
  
  if (dist < minDist && dist > 0) {
    const targetGlow = 1 - (dist / minDist);
    this.glow = this.glow * 0.85 + targetGlow * 0.15; // Suavizar
  }
}
```

**Características:**
- Transición suave (85% anterior + 15% nuevo)
- Radio de efecto: 180px
- Máxima luminosidad a 0px de distancia

### Generación de Chispas

```javascript
createSpark() {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2.5 + Math.random() * 2.5;
  
  this.sparkles.push({
    x: this.x, y: this.y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    lifetime: 350ms,
    size: 1.2-3px,
    color: 'white' o 'yellow'
  });
}
```

**Características:**
- Dirección aleatoria (360°)
- Velocidad: 2.5-5 px/frame
- Gravedad: 0.12 px/frame²
- Lifetime: 350ms
- Dos colores alternados

## Componente: ParticlesEffect

### Configuración de Partículas

```javascript
this.config = {
  particleCount: 45,
  colors: ['white', 'yellow', 'gold'],
  minSize: 0.5, maxSize: 2.5,
  minSpeed: 0.3, maxSpeed: 0.8,
  mouseInteractionDistance: 200,
  mouseRepulsionForce: 3,
}
```

### Flotación Sinusoidal

```javascript
const floatForce = Math.sin(p.phase + this.time * 0.001) * 0.02;
p.vy += floatForce;
```

- **Frecuencia:** Lenta (0.001 radianes/frame)
- **Amplitud:** ±0.02 px
- **Efecto:** Flotación natural y orgánica

### Repulsión por Mouse

```javascript
if (dist < this.config.mouseInteractionDistance && dist > 0) {
  const force = (1 - dist / this.config.mouseInteractionDistance) * 0.1;
  p.vx += (dx / dist) * force * -0.1; // Repulsión
}
```

- **Radio de interacción:** 200px
- **Fuerza máxima:** Pequeña pero perceptible
- **Efecto:** Las partículas se "apartan" del cursor

## Componente: ElectromagneticField

### Campo Visual

```javascript
// Círculos concéntricos de distorsión
// Líneas de campo magnético radiales
// Halo central con gradiente
```

### Radio de Efecto

```javascript
this.config = {
  fieldRadius: 250,        // Área de influencia total
  maxDistortion: 15,       // Distorsión máxima en px
  glowRadius: 80,          // Radio del halo visible
}
```

### Función de Distorsión

```javascript
getDistortion(x, y) {
  const dist = distance(mouse, point);
  if (dist > fieldRadius) return 0;
  
  const force = (1 - dist / fieldRadius) * maxDistortion;
  return force * fieldStrength; // Desde 0 a maxDistortion
}
```

## Parámetros Configurables

### Lightning.js

```javascript
this.config = {
  boltWidth: 80,              // Ancho aproximado del rayo
  boltHeight: 200,            // Alto aproximado del rayo
  electricityBranchCount: 12, // Ramificaciones por segmento
  electricityThinness: 1.2,   // Grosor de ramificaciones (multiplicador)
  sparkCount: 6,              // Chispas en el arco
  glowIntensity: 1.2,         // Intensidad de glows (multiplicador)
}
```

### CustomCursor.js

```javascript
this.config = {
  rodLength: 22,              // Longitud del pararrayos
  rodWidth: 9,                // Grosor del pararrayos
  glowDistance: 180,          // Distancia de efecto de glow
  glowIntensity: 0,           // 0-1 controlado dinámicamente
  sparkProbability: 0.08,     // Probabilidad de chispa por frame
  sparkLifetime: 350,         // Duración de chispa (ms)
}
```

## Optimizaciones de Rendimiento

1. **Reuso de variables:** Se evitan asignaciones innecesarias
2. **Culling:** Se calcula solo lo visible en viewport
3. **Pooling de partículas:** Se reutilizan espacios de memoria
4. **RAF:** Usa requestAnimationFrame para sincronización V-sync
5. **Shadow solo cuando sea necesario:** Se resetea después de dibujar

## Depuración

Para visualizar componentes individuales, modifica `lightning.render()`:

```javascript
// Mostrar solo una capa:
this.drawBoltCore();
// this.drawBoltBorder();
// this.drawBoltGlow();
// this.drawBoltBloom();
// this.drawElectricity(branches);
// this.drawElectricalArcs();
```

---

**Próxima lectura:** [AUDIO.md](./AUDIO.md) - Sistema de síntesis de sonido
