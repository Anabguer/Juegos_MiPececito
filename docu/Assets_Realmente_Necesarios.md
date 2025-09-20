# 🐠 Assets Realmente Necesarios - Mi Pececito

## 📋 Basado en el Documento Original

Según el documento "Proyecto_Pecera_Compilado_Chat.md", el juego funciona principalmente con **canvas 2D sin imágenes externas**, excepto casos específicos.

---

## 🎯 Assets CRÍTICOS Necesarios

### 1. **HUEVO INICIAL** (fish/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `egg_00_cracked.png` | Imagen azul #4 agrietada (mencionada en documento) | **64x64px, PNG transparente, estilo kawaii.** Huevo de pez color azul claro (#87CEEB), superficie agrietada con líneas finas, grietas que sugieren próxima eclosión, textura suave pero con fracturas visibles, brillo sutil, aspecto a punto de romperse. |

### 2. **ICONOS DE ESTADO FALTANTES** (ui/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `badge_dirty.png` | Icono de suciedad | **64x64px, PNG transparente, estilo kawaii.** Ícono circular con borde redondeado, color marrón (#8B4513), gotas de agua sucias, símbolo de limpieza (esponja pequeña), fondo semitransparente, estilo consistente con badges existentes. |

### 3. **BOTONES DE ACCIÓN** (ui/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `btn_food.png` | Botón de comida (solo bebé lo usa) | **80x80px, PNG transparente, estilo kawaii.** Botón circular redondeado, color naranja cálido (#FF8C42), ícono de pellets de comida en el centro, borde suave, sombra sutil, estilo consistente con UI del juego. |
| `btn_reset.png` | Botón reset/reiniciar | **80x80px, PNG transparente, estilo kawaii.** Botón circular redondeado, color azul (#1d4b6b), ícono de flecha circular (↺), borde suave, sombra sutil, estilo consistente con UI del juego. |

### 4. **FONDO BÁSICO** (backgrounds/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `bg_basic.png` | Fondo pecera neutro por defecto | **1920x1080px, PNG, estilo simple.** Fondo de acuario básico, agua azul degradado (#08243a a #061726), algunas plantas acuáticas simples en los bordes, arena o grava en el fondo, estilo "cutrecillo simpático" como POU, sin distraer del pez principal. |

---

## ❌ LO QUE NO NECESITAMOS

### **Sprites de Peces Separados**
- ❌ `fish_baby_idle.png`, `fish_baby_happy.png`, etc.
- **Razón**: Los peces se dibujan dinámicamente en canvas
- **Estados emocionales**: Se manejan por comportamiento, no por sprites diferentes

### **Efectos Complejos**  
- ❌ Partículas PNG, burbujas estáticas, etc.
- **Razón**: Las burbujas y efectos se generan dinámicamente en canvas

### **Múltiples Variaciones de UI**
- ❌ Botones de diferentes estados, temas, etc.
- **Razón**: El documento especifica estilo simple y neutro

---

## 🎨 Especificaciones de Diseño

### **Estilo Visual Requerido:**
- **Tono**: "Cutrecillo simpático" (referencia POU)
- **Estética**: Neutra que no distrae del pez
- **Colores**: Consistentes con los ya definidos en canvas
- **Tamaño**: Optimizado para móviles (el documento especifica uso principalmente móvil)

### **Paleta de Colores del Juego:**
```
--bg: #08243a          (Fondo principal)
--ui: #1d4b6b          (UI elementos)
--ui2: #2a6287         (UI hover)
--text: #e9f6ff        (Texto)

Pez Bebé: #d9ccff      (Lila claro)
Pez Joven: #b1a1ff     (Violeta medio)  
Pez Adulto: #5a48c8    (Violeta oscuro)
```

### **Formatos Técnicos:**
- **Huevo**: 64x64px PNG transparente
- **Badges**: 64x64px PNG transparente  
- **Botones**: 80x80px PNG transparente
- **Fondos**: 1920x1080px PNG (escalable)
- **Resolución**: 72 DPI mínimo
- **Optimización**: Para pantallas móviles

---

## 🚀 Prioridades de Creación

### **PRIORIDAD MÁXIMA** ⚡
1. `egg_00_cracked.png` - Huevo agrietado (reemplaza el vectorial temporal)
2. `badge_dirty.png` - Completa los iconos de estado
3. `bg_basic.png` - Fondo por defecto

### **PRIORIDAD ALTA** 🔶
1. `btn_food.png` - Botón de alimentación  
2. `btn_reset.png` - Botón de reset

### **PRIORIDAD MEDIA** 🔸
1. Fondos temáticos adicionales (si se requieren más adelante)

---

## 💡 Notas de Implementación

### **Según el Documento Original:**
- **Render principal**: Canvas 2D dinámico
- **Interacciones**: Turbo (mantener pulsado), comida solo para bebé
- **Evolución**: Huevo → Bebé → Joven → Adulto (tiempos configurables)
- **Estados**: Por comportamiento (rápido/lento/escondido), no sprites
- **Eclosión**: Blur del huevo → crossfade al bebé
- **Naming**: Burbuja flotante para escribir nombre tras nacer

### **Sistema de Assets:**
- **Carga mínima**: Solo assets realmente necesarios
- **Rutas centralizadas**: Sistema modular para cambios fáciles
- **Mobile-first**: Optimizado para dispositivos móviles como especifica el documento

---

## 📁 Estructura Final de Assets

```
images/
├── backgrounds/
│   ├── bg_basic.png           ← NUEVO (fondo por defecto)
│   ├── bg_cartoon.png         ← EXISTENTE  
│   ├── bg_coral.png           ← EXISTENTE
│   ├── bg_demonslayer.png     ← EXISTENTE
│   ├── bg_mario.png           ← EXISTENTE
│   ├── bg_minecraft.png       ← EXISTENTE
│   ├── bg_minecraft2.png      ← EXISTENTE
│   ├── bg_minecraft_clouds.png ← EXISTENTE
│   ├── bg_peppapig.png        ← EXISTENTE
│   └── bg_volcano.png         ← EXISTENTE
├── fish/
│   ├── egg_00_cracked.png     ← NUEVO (reemplaza vectorial)
│   ├── egg_01_clean.png       ← EXISTENTE
│   ├── egg_02_clean.png       ← EXISTENTE
│   ├── egg_03_clean.png       ← EXISTENTE
│   └── egg_04_clean.png       ← EXISTENTE
├── ui/
│   ├── badge_dirty.png        ← NUEVO (faltante)
│   ├── badge_hunger.png       ← EXISTENTE
│   ├── badge_medicine.png     ← EXISTENTE
│   ├── badge_play.png         ← EXISTENTE
│   ├── btn_food.png           ← NUEVO (alimentar)
│   └── btn_reset.png          ← NUEVO (reiniciar)
└── effects/
    └── (vacío - efectos en canvas)
```

---

### 5. **ELEMENTOS DE JUEGO Y DECORACIÓN** (effects/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `algae_small.png` | Alga pequeña para esconderse | **32x48px, PNG transparente, estilo kawaii.** Alga marina pequeña color verde oscuro (#2E7D32), hojas ondulantes, base en arena, estilo simple que no distrae, para que el pez se esconda detrás. |
| `algae_medium.png` | Alga mediana decorativa | **48x72px, PNG transparente, estilo kawaii.** Alga marina mediana color verde medio (#4CAF50), más frondosa que la pequeña, hojas que se mueven suavemente, estilo consistente. |
| `algae_large.png` | Alga grande decorativa | **64x96px, PNG transparente, estilo kawaii.** Alga marina grande color verde claro (#66BB6A), muy frondosa, perfecta para esconderse completamente, estilo elegante pero simple. |

### 6. **SISTEMA DE RECOMPENSAS Y JUEGOS** (ui/)
| Archivo | Descripción | Prompt Estandarizado |
|---------|-------------|---------------------|
| `badge_food.png` | Ícono de comida para burbuja de necesidad | **64x64px, PNG transparente, estilo kawaii.** Ícono circular con pellet de comida naranja (#FF8C42) en el centro, borde redondeado, estilo consistente con otros badges, para mostrar necesidad de alimentar. |
| `food_premium.png` | Comida premium (recompensa día 7) | **16x16px, PNG transparente, estilo kawaii.** Pellet de comida dorado (#FFD700) con brillo y pequeñas estrellas alrededor, efecto premium especial, más atractivo que comida normal. |
| `bubble_need.png` | Burbuja base para mostrar necesidades | **48x48px, PNG transparente, estilo kawaii.** Burbuja translúcida blanco-azul (#E3F2FD con 80% opacidad), borde suave, que flote sobre el pez para mostrar necesidades. |
| `star_icon.png` | Ícono de estrella para juegos | **32x32px, PNG transparente, estilo kawaii.** Estrella dorada (#FFD700) brillante, estilo simple pero atractivo, para mostrar progreso en juegos y rankings. |
| `pellet_normal.png` | Pellet de comida normal | **16x16px, PNG transparente, estilo kawaii.** Pellet de comida naranja (#FF8C42) redondo, simple y claro, para animaciones de alimentación. |

**TOTAL ASSETS A CREAR: 14 archivos**
- 1 huevo agrietado
- 1 badge de suciedad  
- 2 botones de acción
- 1 fondo básico
- 3 algas decorativas
- 5 elementos de UI y recompensas

*Documento basado únicamente en especificaciones reales del proyecto*
