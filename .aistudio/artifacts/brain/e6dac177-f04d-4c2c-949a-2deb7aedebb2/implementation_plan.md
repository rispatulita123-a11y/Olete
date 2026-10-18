# Plan de Implementación: Biomecánica Anatómica de Brazos, Encuadre de Cámara Plano Medio y Subtítulos Minimalistas

Este plan detalla las soluciones técnicas para resolver la orientación de las extremidades superiores, evitar que los brazos atraviesen el torso durante la marcha, encuadrar la cámara desde la cintura hacia arriba para ocultar los pies sin alterar la cinemática, y estilizar los subtítulos de forma compacta y no intrusiva.

---

## 1. Diagnóstico Técnico y Objetivos

### A. Cinemática de Extremidades Superiores (Hombro, Codo, Muñeca y Mano)
* **Causa del cruce con el torso:** El punto de inserción del hombro estaba a `x = ±0.21`, mientras que el ancho pectoral del mono de competición es de `~0.233`. Además, la rotación lateral `rotation.z` tenía signo invertido (`+0.08` en el brazo izquierdo inclinaba el brazo hacia el interior del pecho).
* **Causa de la apariencia \"del revés\":** La mano tenía el dorso (escudo de nudillos) posicionado directamente hacia adelante (+Z) y la palma hacia atrás (-Z) en lugar de la orientación biomecánica humana (palma semi-pronada mirando hacia el muslo y pulgar orientado radialmente hacia adelante/adentro).
* **Ausencia de articulación en muñeca:** `leftWristJoint` y `rightWristJoint` estaban estáticas sin participar en la cinemática de oscilación del paso.

### B. Encuadre de Cámara (Plano Medio Frontal: Cintura hacia Arriba)
* **Causa de la sensación de deslizamiento:** Incluso con cinemática analítica de velocidad cero relativa, el plano general enfoca el contacto asfalto-bota en perspectiva cónica amplia, revelando cualquier micro-diferencia de textura.
* **Solución acordada:** Reconfigurar la cámara de seguimiento cinematográfico a un **Plano Medio Frontal (Waist-Up)** centrado en torso, mono, patrocinadores y casco, dejando el plano de corte justo por encima de la cintura/caderas (`y ≈ 0.95m - 1.85m`).

### C. Rediseño de Subtítulos Compactos y No Intrusivos
* **Situación actual:** Contenedor de `text-base` a `text-xl` con fondo negro pronunciado `bg-black/65` y padding amplio.
* **Solución acordada:** Tipografía reducida (`text-xs sm:text-sm`), cápsula translúcida ligera (`bg-black/40 backdrop-blur-sm border-white/5`), espaciado inferior compacto y posición no intrusiva.

---

## 2. Cambios Arquitectónicos y Archivos Afectados

### Archivo 1: `src/game/pilot/PilotModelBuilder.ts`
1. **Ensanchamiento y despeje de hombros:**
   * Aumentar la coordenada de los hombros a `sign * 0.245` para asegurar un despeje natural de 3-4 cm respecto a los pectorales y dorsales.
2. **Reorientación anatómica de la mano y guante:**
   * Rotar la palma del guante para que mire hacia el interior (`sign * 0.70 rad` ~ 40° de semi-pronación natural).
   * Posicionar el pulgar en el borde radial exterior con ángulo de pinza relajada.
   * Alinear los 4 dedos con curvatura anatómica en dirección anteromedial, emulando la marcha de un atleta en reposo.
3. **Exposición de articulaciones de muñeca en el Rig:**
   * Exponer `leftWrist` y `rightWrist` en la interfaz `ProceduralPilotRig` para su animación en tiempo real.

### Archivo 2: `src/game/pilot/PilotWalkManager.ts`
1. **Actualización de Cinemática FK de Brazos:**
   * **Hombros:** Separación en A con `rotation.z = -sign * 0.16` (abducción hacia el exterior), eliminando cualquier penetración en el torso.
   * **Plano de oscilación:** La oscilación frontal (`rotation.x`) se combina con una apertura transversal suave (`rotation.y = sign * 0.06`), permitiendo que el brazo viaje hacia adelante y ligeramente hacia afuera.
   * **Codos:** Flexión orgánica (`rotation.x = 0.22 a 0.50` según la fase de marcha) con ángulo de transporte natural (*carrying angle*).
   * **Muñecas:** Compensación y oscilación suave en pitch y yaw (`rotation.x` y `rotation.z`), aportando peso y elasticidad al movimiento.
2. **Reconfiguración de Presets de Cámara (Waist-Up):**
   * `dynamic_front`: Distancia reducida a `2.10m`, altura `offsetY = 0.22m`, punto de mira `targetOffsetY = 0.20m` (pecho/casco), recortando completamente piernas y pies.
   * Actualización del resto de presets para mantener un encuadre televisivo superior enfocado en el piloto.

### Archivo 3: `src/components/PilotPresentationOverlay.tsx`
1. **Subtítulos compactos y elegantes:**
   * Rediseño del contenedor de subtítulos a una cápsula flotante estilizada con `text-xs sm:text-sm text-white/90`.
   * Reducción del padding (`px-3.5 py-1.5`) y fondo de cristal translúcido suave (`bg-black/40 border-white/5`).
   * Desplazamiento visual no intrusivo a `bottom-6`.

---

## 3. Plan de Verificación y Rendimiento
* **Verificación de build:** Ejecución de `tsc --noEmit` y `npm run build` sin errores ni advertencias de tipos.
* **Cálculo de Frametime:** Zero-allocation en el bucle de animación (`PilotWalkManager.updateProceduralKinematics`), reutilizando variables y matrices sin instanciar objetos Three.js por fotograma.
* **Estabilidad a 60/120 FPS:** Mantener los 60 FPS estables y 120 FPS en pantallas compatibles.
