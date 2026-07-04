# Guía de Instalación

## Instalación Rápida

El sistema de efectos del rayo ya está instalado y listo para usar en el proyecto.

### Verificar archivos necesarios

Confirma que tienes estos archivos en la carpeta `effects/`:

```
effects/
├── audio.js                      ✓
├── cursor.js                     ✓
├── electromagnetic-field.js       ✓
├── interactions.js               ✓
├── lightning.js                  ✓
└── particles.js                  ✓
```

### Verificar carga en HTML

En `index.html`, verifica que está cargando todos los scripts:

```html
<script src="effects/audio.js"></script>
<script src="effects/lightning.js"></script>
<script src="effects/particles.js"></script>
<script src="effects/cursor.js"></script>
<script src="effects/electromagnetic-field.js"></script>
<script src="effects/interactions.js"></script>
<script src="script.js?v=4"></script>
```

### Verificar inicialización en script.js

En `script.js`, busca la sección `/* ===== SISTEMA DE RAYO CINEMATOGRÁFICO ===== */`

Debe contener inicialización de:
- LightningEffect
- ElectricSound
- CustomCursor
- ElectromagneticField

## Instalación Manual

Si necesitas instalar desde cero:

### Paso 1: Crear estructura de carpetas

```bash
mkdir -p effects/
mkdir -p docs/
```

### Paso 2: Copiar archivos

Copiar los siguientes archivos a `effects/`:
- lightning.js
- cursor.js
- particles.js
- audio.js
- electromagnetic-field.js
- interactions.js

### Paso 3: Actualizar HTML

En `<head>`, antes del cierre:

```html
<!-- Canvas para efectos -->
<canvas id="canvas-grid" aria-hidden="true"></canvas>
<canvas id="canvas-lightning" aria-hidden="true"></canvas>
```

En el hero:

```html
<section class="hero" id="inicio">
  <div class="hero-content">
    <!-- contenido -->
  </div>
  <div class="bolt-stage" id="boltStage" aria-hidden="true"></div>
</section>
```

Antes del cierre de `</body>`:

```html
<script src="effects/audio.js"></script>
<script src="effects/lightning.js"></script>
<script src="effects/particles.js"></script>
<script src="effects/cursor.js"></script>
<script src="effects/electromagnetic-field.js"></script>
<script src="effects/interactions.js"></script>
<script src="script.js"></script>
```

### Paso 4: Actualizar script.js

Agregar al final del archivo `script.js`:

```javascript
/* ===== SISTEMA DE RAYO CINEMATOGRÁFICO ===== */
window.addEventListener('DOMContentLoaded', () => {
    if (!reducedMotion && typeof LightningEffect !== 'undefined') {
        const lightning = new LightningEffect('canvas-lightning', 'boltStage');

        // Audio
        let electricSound = null;
        if (typeof ElectricSound !== 'undefined') {
            electricSound = new ElectricSound();
            electricSound.startAmbientHum();
        }

        // Campo electromagnético
        let emField = null;
        if (typeof ElectromagneticField !== 'undefined') {
            emField = new ElectromagneticField(lightning, 'canvas-lightning');
        }

        // Scroll trigger
        if (window.gsap && window.ScrollTrigger) {
            ScrollTrigger.create({
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                onUpdate: self => {
                    if (lightning) lightning.setIntensityFromScroll(0.7 + self.progress * 0.3);
                }
            });
        }

        // Cursor
        if (typeof CustomCursor !== 'undefined') {
            const cursor = new CustomCursor(lightning);
            const originalRender = lightning.render.bind(lightning);

            lightning.render = function() {
                originalRender();
                cursor.draw(lightning.ctx);
                if (emField) emField.draw();
            };
        }

        // Eventos de sonido
        if (electricSound) {
            document.addEventListener('click', () => electricSound.discharge());
            document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
                btn.addEventListener('mouseenter', () => 
                    electricSound.spark(btn.getBoundingClientRect().x, btn.getBoundingClientRect().y)
                );
            });
        }

        window.lightningEffect = lightning;
        window.electricSound = electricSound;
    }
});
```

### Paso 5: Actualizar CSS (opcional)

En `styles.css`, asegurar que los canvas están configurados:

```css
#canvas-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

#canvas-lightning {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

html {
  cursor: none; /* Ocultar cursor default */
}
```

## Requisitos del Sistema

### Navegador

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Características requeridas

- ✅ Canvas 2D (HTMLCanvasElement)
- ✅ Web Audio API
- ✅ ES6 JavaScript (const, arrow functions, Proxy)
- ✅ Flexbox/Grid CSS

### Hardware recomendado

- RAM: 4GB+
- CPU: Moderno (dentro de 5 años)
- GPU: Integrada o dedicada

**Rendimiento mínimo:** ~60 FPS en navegadores modernos

## Verificación de Instalación

### Checklist visual

Después de instalar, verifica:

- [ ] Rayo visible en el hero
- [ ] Rayo "pulsa" sutilmente
- [ ] Cursor personalizado visible
- [ ] Chispas aparecen al mover cursor cerca del rayo
- [ ] Sonido de zumbido se escucha (si audio habilitado)
- [ ] Descargas en botones al pasar cursor

### Checklist en consola

Abre DevTools (F12) y ejecuta:

```javascript
// Verificar componentes
console.log('Lightning:', typeof LightningEffect !== 'undefined');
console.log('Cursor:', typeof CustomCursor !== 'undefined');
console.log('Audio:', typeof ElectricSound !== 'undefined');
console.log('Field:', typeof ElectromagneticField !== 'undefined');

// Verificar instancias globales
console.log('lightningEffect:', window.lightningEffect);
console.log('electricSound:', window.electricSound);
```

Resultado esperado:
```
Lightning: true
Cursor: true
Audio: true
Field: true
lightningEffect: LightningEffect {...}
electricSound: ElectricSound {...}
```

## Solución de Problemas

### No se ve el rayo

**Causa probable:** Canvas no inicializado
**Solución:**
1. Verificar que canvas tiene ID: `canvas-lightning`
2. Verificar que stage tiene ID: `boltStage`
3. Abrir DevTools, ir a Inspector
4. Buscar estos elementos

### No hay sonido

**Causa probable:** Web Audio API no inicializado
**Solución:**
1. Necesita interacción del usuario para iniciar audio
2. Hacer click en la página
3. Revisar volumen del navegador/sistema
4. Revisar preferencias de audio en localStorage

```javascript
// Forzar reinicio de audio
window.electricSound?.stop();
window.electricSound = new ElectricSound();
window.electricSound.startAmbientHum();
```

### FPS bajo

**Causa probable:** Too many particles/branches
**Solución:**
1. Reducir particleCount: `particles.config.particleCount = 20`
2. Reducir detalle de electricidad en lightning.js
3. Desactivar campo electromagnético
4. Actualizar navegador a versión más nueva

### Cursor no aparece

**Causa probable:** CSS oculta el cursor
**Solución:**
```css
/* En styles.css */
html {
  cursor: none; /* Necesario */
}
```

### El sonido suena extraño

**Causa probable:** Volumen demasiado alto
**Solución:**
```javascript
window.electricSound.setVolume(0.08); // Bajar volumen
```

## Deployar a Producción

### Verificaciones pre-deploy

- [ ] Todos los archivos en `effects/` incluidos
- [ ] `script.js` actualizado con inicialización
- [ ] Canvas HTML elements presentes
- [ ] Sans de `prefers-reduced-motion` respetados
- [ ] Audio inicializado solo con interacción

### Optimizaciones para producción

```javascript
// En script.js
const PRODUCTION = true;

if (PRODUCTION) {
  // Reducir cantidad de partículas
  particles.config.particleCount = 30;
  
  // Reducir audio
  electricSound.setVolume(0.1);
  
  // Deshabilitar field si es muy lento
  emField = null;
}
```

### Monitoreo

Agregar analytics:

```javascript
// Track que el rayo se está renderizando
window.addEventListener('load', () => {
  console.log('Lightning effect loaded');
  // gtag('event', 'lightning_loaded');
});
```

## Actualizar en el futuro

Para actualizar los efectos:

1. Descargar nuevos archivos desde repository
2. Reemplazar en carpeta `effects/`
3. No es necesario modificar HTML
4. Posiblemente necesite actualizar `script.js` si hay cambios de API

---

**Siguiente:** [CUSTOMIZATION.md](./CUSTOMIZATION.md) - Personalización avanzada
