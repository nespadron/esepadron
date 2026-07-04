# Sistema de Efectos Cinematográficos del Rayo

## Visión General

Este proyecto implementa un sistema completo de efectos visuales y de sonido para crear un rayo "vivo" en el hero de la página web de ESEPADRÓN. El rayo se comporta como una descarga eléctrica real con múltiples capas, ramificaciones dinámicas, interacción con el usuario y efectos de sonido.

## ¿Por qué este rayo es especial?

El rayo NO es:
- ❌ Un SVG estático
- ❌ Un icono o imagen PNG
- ❌ Un dibujo animado
- ❌ Un efecto de neon cyberpunk

Es:
- ✅ Una descarga eléctrica realista renderizada en tiempo real
- ✅ Con múltiples capas físicamente basadas
- ✅ Que reacciona a la interacción del usuario
- ✅ Con sonido ambiental eléctrico
- ✅ Que mantiene 60+ FPS en todos los navegadores

## Características Principales

### 🔆 Visuales

| Característica | Descripción |
|---|---|
| **Interior oscuro** | Carbón/metal quemado para realismo |
| **Borde blanco brillante** | Casi saturado, muy luminoso |
| **Glow amarillo intenso** | Difuso y dinámico |
| **Glow naranja** | Sutil y complementario |
| **Bloom exterior** | Ilumina el fondo blanco circundante |
| **Electricidad densa** | Miles de ramificaciones finas recorriendo el borde |
| **Arco eléctrico** | En la base donde el rayo "toca el suelo" |
| **Chispas puntuales** | Micro explosiones en el arco |

### ⚡ Interacción

| Tipo | Comportamiento |
|---|---|
| **Cursor (Pararrayos)** | Se ilumina al acercarse, emite chispas |
| **Botones** | Descargas animadas al pasar el cursor |
| **Textos clave** | Palabras importantes con descargas |
| **Click** | Descarga desde el cursor hacia el rayo |
| **Scroll** | Intensidad del rayo aumenta en el hero |

### 🔊 Audio

- 🎵 Zumbido ambiental eléctrico continuo
- ✨ Sonidos de chispa al acercarse al rayo
- ⚡ Sonido de descarga al hacer click
- 🎛️ Volumen controlable

### 🌀 Campo Electromagnético

- Halo distorsionador alrededor del cursor
- Líneas de campo magnético visuales
- Círculos de distorsión concéntricos
- Afecta sutilmente el comportamiento de partículas

## Tecnologías Utilizadas

### Frontend
- **Canvas 2D** - Renderizado principal
- **Web Audio API** - Síntesis de sonido
- **RequestAnimationFrame** - Animación optimizada
- **CSS** - Styling base

### Integración
- **GSAP & ScrollTrigger** - Control de intensidad por scroll
- **Lenis** - Scroll suave
- **Modular JavaScript** - Componentes independientes

## Estructura del Proyecto

```
effects/
├── lightning.js                 # Rayo principal (6 capas)
├── cursor.js                    # Pararrayos interactivo
├── particles.js                 # Sistema de partículas
├── interactions.js              # Descargas en botones/textos
├── audio.js                     # Síntesis de sonido eléctrico
└── electromagnetic-field.js     # Campo electromagnético

index.html                        # Página principal
script.js                         # Integración de componentes
styles.css                        # Estilos base
```

## Requisitos

- Navegador moderno con soporte para:
  - Canvas 2D
  - Web Audio API
  - ES6 JavaScript
  - CSS Grid/Flexbox

**Compatibilidad:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Rendimiento

- **FPS:** 60+ en máquinas estándar
- **CPU:** Bajo (<5% en máquinas modernas)
- **GPU:** Aceleración por hardware
- **Memoria:** ~2-5MB (sin memoria dedicada de GPU)

## Guía Rápida

### Instalación

1. Los archivos de efectos están en la carpeta `effects/`
2. Se cargan automáticamente en `index.html`
3. No requiere configuración adicional

### Uso

El sistema se inicializa automáticamente al cargar la página:

```javascript
// Crear el efecto del rayo
const lightning = new LightningEffect('canvas-lightning', 'boltStage');

// Crear cursor personalizado
const cursor = new CustomCursor(lightning);

// Iniciar audio
const sound = new ElectricSound();
sound.startAmbientHum();

// Campo electromagnético
const emField = new ElectromagneticField(lightning, 'canvas-lightning');
```

### Personalización

Ver `EFFECTS.md`, `AUDIO.md` y `API.md` para detalles de configuración.

## Documentación Adicional

- 📖 **[EFFECTS.md](./EFFECTS.md)** - Guía completa de efectos visuales
- 🔊 **[AUDIO.md](./AUDIO.md)** - Sistema de síntesis de sonido
- ⚙️ **[API.md](./API.md)** - Referencia de API de componentes
- 🚀 **[INSTALLATION.md](./INSTALLATION.md)** - Guía de instalación
- 🎨 **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** - Personalización avanzada

## Licencia

Este proyecto es parte de ESEPADRÓN y está bajo la licencia del propietario.

---

**Última actualización:** Julio 2026  
**Versión:** 1.0.0  
**Estado:** Producción
