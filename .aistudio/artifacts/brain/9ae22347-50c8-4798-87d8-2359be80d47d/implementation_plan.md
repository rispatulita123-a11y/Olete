# Plan de Evolución UI/UX AAA 2026: Pantallas de Selección Estilo Gran Turismo 7

Transformación integral de las pantallas secundarias de selección de Apex GT, elevando su nivel visual de una interfaz funcional a una experiencia editorial de automovilismo de lujo y competición profesional inspirada en **Gran Turismo 7** y **F1 24**.

## Decisiones Críticas Confirmadas

> [!IMPORTANT]
> Preferencias confirmadas por el usuario:
> - **Atmósfera Visual**: Estilo editorial limpio, elegante y de alta tecnología automotriz inspirado en *Gran Turismo 7*.
> - **Distribución**: Layout panorámico asimétrico de dos paneles:
>   - **Panel Izquierdo**: Previa técnica del circuito (blueprint SVG dinámico, sectores, curvas) y dossier del monoplaza (1050 HP, peso, carga aerodinámica, telemetría y meteorología de pista).
>   - **Panel Derecho**: Centro de mando con selectores en cápsulas táctiles de alta densidad, compuestos de neumáticos con índices de desgaste, meteorología y condiciones de pista.
> - **Información Técnica**: Telemetría completa, velocidad punta esperada (Top Speed), temperatura de asfalto, viento, humedad y tiempos de vuelta de referencia.

---

## 1. Visión General y Concepto

Las pantallas de cada uno de los 4 modos (*Modo Carrera*, *Modo Libre*, *Multijugador*, *Gran Premio*) dejarán atrás cualquier aspecto genérico o plano para convertirse en estaciones de ingeniería de competición:

1. **Jerarquía Visual Editorial**: 
   - Tipografía técnica de competición combinada con encabezados limpios y números de telemetría de gran formato (`Chakra Petch` + `Plus Jakarta Sans`).
   - Tonos titanio oscuro, grafito y carbono con acentos sutiles en carmesí de competición (`#ef4444`), ámbar GT y cian de telemetría.
2. **Panel Izquierdo: Ficha Técnica & Blueprint Dinámico**:
   - Trazado vectorial del circuito con puntos de frenada, zonas DRS y sectores de tiempo.
   - Datos meteorológicos en vivo de la sesión (Temperatura de asfalto: 32°C, Temperatura ambiental: 24°C, Humedad: 48%, Velocidad del viento: 12 km/h SO, Nivel de agarre de pista: 98%).
   - Ficha del monoplaza: Motor F1 V10 Híbrido 3.0L, Potencia combinada 1.050 CV, Régimen de giro 18.500 RPM, Velocidad punta 354 km/h, Peso 798 kg con piloto.
3. **Panel Derecho: Selectores en Cápsulas 2026**:
   - Cápsulas interactivas rediseñadas con micro-detalles: indicadores de durabilidad y adherencia de neumáticos (C2, C3, C4), selector de distancia con cálculo de tiempo estimado de carrera, nivel de agresión de IA, asistencias y cámara activa.
   - Botón de ignición principal con acabado de fibra de carbono y resplandor activo.

---

## 2. Experiencia de Usuario y Distribución Espacial

### Diagrama de Distribución de Pantalla (Dos Paneles Gran Turismo 7)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [← VOLVER AL MENÚ]   APEX GT // [MODALIDAD SELECCIONADA]   [CÁMARA LIBRE] [CONTROLES]  │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ PANEL IZQUIERDO: DOSSIER TÉCNICO & PISTA  │ PANEL DERECHO: SELECTORES DE CÁPSULAS 2026 │
│                                           │                                            │
│ ┌───────────────────────────────────────┐ │ ┌────────────────────────────────────────┐ │
│ │ BLUEPRINT VECTORIAL DEL CIRCUITO      │ │ │ SELECCIÓN DE CIRCUITO (Cápsulas)       │ │
│ │ • Mapa SVG interactivo con sectores   │ │ │ [Apex Square] [SpeedWay] [Marina Bay]  │ │
│ │ • Longitud: 4.8 km | 14 Curvas        │ │ └────────────────────────────────────────┘ │
│ └───────────────────────────────────────┘ │ ┌────────────────────────────────────────┐ │
│ ┌───────────────────────────────────────┐ │ │ DISTANCIA & TIEMPO ESTIMADO            │ │
│ │ CONDICIONES METEOROLÓGICAS DE PISTA   │ │ │ [ 9 Vueltas ] [ 20 Vueltas ] [ 50 V. ] │ │
│ │ • Asfalto: 34°C · Aire: 26°C · Seco   │ │ │ Est. 12m 45s · 1 Parada en Boxes       │ │
│ │ • Agarre: 99.2% · Viento: 8 km/h NE   │ │ └────────────────────────────────────────┘ │
│ └───────────────────────────────────────┘ │ ┌────────────────────────────────────────┐ │
│ ┌───────────────────────────────────────┐ │ │ ESTRATEGIA DE NEUMÁTICOS FIA           │ │
│ │ TELEMETRÍA DEL MONOPLAZA APEX F1      │ │ │ [Blando C4 🔴] [Medio C3 🟡] [Duro ⚪] │ │
│ │ • 1.050 CV | 18.500 RPM | 354 km/h    │ │ │ Agarre: 100% | Vida: 8-10 Vueltas      │ │
│ │ • Escudería: Oracle Red Bull / Scuderia│ │ └────────────────────────────────────────┘ │
│ └───────────────────────────────────────┘ │ ┌────────────────────────────────────────┐ │
│                                           │ │ NIVEL DE RIVALES / MODO MULTIJUGADOR   │ │
│                                           │ │ [Novato] [Intermedio] [Leyenda FIA]    │ │
│                                           │ └────────────────────────────────────────┘ │
│                                           │ ┌────────────────────────────────────────┐ │
│                                           │ │ ▶ CONFIRMAR Y SALTAR A PISTA           │ │
│                                           │ └────────────────────────────────────────┘ │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 3. Especificación Técnica por Modo

1. **Modo Carrera**:
   - Dossier de temporada: posición en el mundial, récord histórico de vueltas, objetivos de la escudería para el Gran Premio.
   - Selector de circuito con información de desgaste de motor y caja de cambios.
   - Selector de compuesto con regla obligatoria de dos compuestos para carreras de más de 20 vueltas.
2. **Modo Libre (Time Attack)**:
   - Panel de vueltas rápidas registradas (Delta vs mejor vuelta personal y récord absoluto).
   - Ajuste de condiciones ambientales de pista (Seco mediodía, Pista fría atardecer, Nocturna).
   - Telemetría en tiempo real de velocidad máxima en recta principal y velocidad mínima en vértice de curva lenta.
3. **Multijugador 1v1**:
   - Paddock estilo sala de telemetría de boxes.
   - Visualización gráfica de ambos coches en parrilla con tiempo de ping y estado de preparación.
   - Generación de código PIN y botón de emparejamiento inmediato.
4. **Gran Premio**:
   - Matriz de parrilla de salida con los 5 monoplazas oficiales (Verstappen, Leclerc, Hamilton, Alonso, Norris).
   - Estrategia de parada en boxes recomendada según la degradación calculada para la distancia seleccionada.

---

## 4. Plan de Ejecución

- Actualizar `src/components/MainMenuDashboard.tsx` implementando la arquitectura de dos paneles con la estética limpia y editorial de Gran Turismo 7.
- Integrar componentes de blueprint SVG para los circuitos (`Square Circuit`, `SpeedWay`, `Singapore Marina Bay`).
- Incorporar widgets de telemetría dinámica con cálculo automático según el circuito y compuesto seleccionado.
- Mantener intacta la primera pantalla y verificar la compilación y pruebas de interfaz con `compile_applet` y `lint_applet`.
