# 🏗️ Arquitectura Modular - Mi Pececito

## 🎯 Objetivo: **CERO Dolores de Cabeza de Diseño**

### ❌ Problema Actual:
- Cambiar un color = tocar 20 archivos
- Modificar un botón = buscar en todo el código  
- Agregar una característica = duplicar código
- Mantener consistencia = pesadilla

### ✅ Solución Propuesta:
**Sistema centralizado donde UN cambio se aplica AUTOMÁTICAMENTE en todo el juego**

---

## 🧱 Estructura del Proyecto

```
mi-pececito/
├── 📁 src/
│   ├── 📁 core/              # Motor del juego
│   │   ├── Game.js          # Clase principal del juego
│   │   ├── GameLoop.js      # Loop principal 60fps
│   │   ├── StateManager.js  # Estados del pez
│   │   └── SaveSystem.js    # Guardado automático
│   │
│   ├── 📁 config/           # 🔥 CONFIGURACIÓN CENTRALIZADA
│   │   ├── gameConfig.js    # Todas las constantes
│   │   ├── fishConfig.js    # Configuración de peces
│   │   ├── uiConfig.js      # Colores, tamaños, animaciones
│   │   └── assetsConfig.js  # Rutas de todas las imágenes
│   │
│   ├── 📁 components/       # Componentes reutilizables
│   │   ├── Fish/           # Todo lo relacionado con peces
│   │   ├── UI/             # Elementos de interfaz
│   │   ├── Effects/        # Partículas y efectos
│   │   └── Backgrounds/    # Gestión de fondos
│   │
│   ├── 📁 styles/           # CSS centralizado
│   │   ├── variables.css    # Variables CSS globales
│   │   ├── components.css   # Estilos de componentes
│   │   └── animations.css   # Animaciones reutilizables
│   │
│   ├── 📁 utils/            # Utilidades
│   │   ├── assetLoader.js   # Carga inteligente de assets
│   │   ├── animations.js    # Funciones de animación
│   │   └── storage.js       # LocalStorage wrapper
│   │
│   └── 📁 pages/            # Pantallas del juego
│       ├── GameScreen.js    # Pantalla principal
│       ├── MenuScreen.js    # Menú inicial
│       ├── ShopScreen.js    # Tienda
│       └── SettingsScreen.js # Configuración
│
├── 📁 assets/               # Assets organizados
│   └── images/             # (ya reorganizado)
│
├── 📁 dist/                # Build final
└── index.html              # Punto de entrada
```

---

## 🎨 Sistema de Diseño Centralizado

### **1. Variables CSS Globales** (`styles/variables.css`)
```css
:root {
  /* 🎨 Colores Principales */
  --primary-bg: #08243a;
  --secondary-bg: #1d4b6b;
  --accent-bg: #2a6287;
  --text-color: #e9f6ff;
  
  /* 🐟 Colores de Peces */
  --fish-baby-body: #d9ccff;
  --fish-baby-tail: #ff9ecf;
  --fish-young-body: #b1a1ff;
  --fish-adult-body: #5a48c8;
  
  /* 🎮 UI */
  --button-primary: #205b86;
  --button-hover: #2a6287;
  --button-radius: 12px;
  --shadow-soft: 0 6px 20px rgba(0,0,0,.25);
  
  /* 📐 Tamaños */
  --fish-baby-size: 46px;
  --fish-young-size: 52px;
  --fish-adult-size: 60px;
  --ui-button-size: 80px;
  
  /* ⚡ Animaciones */
  --transition-fast: 0.15s ease;
  --transition-smooth: 0.3s ease;
}
```

### **2. Configuración del Juego** (`config/gameConfig.js`)
```javascript
export const GAME_CONFIG = {
  // 🎮 Configuración general
  canvas: {
    targetFPS: 60,
    alpha: false,
    antialias: true
  },
  
  // ⏱️ Tiempos de evolución
  evolution: {
    eggToBaby: 30000,    // 30 segundos para demo
    babyToYoung: 120000,  // 2 minutos
    youngToAdult: 300000  // 5 minutos
  },
  
  // 📊 Estados del pez
  stats: {
    maxHunger: 100,
    maxHappiness: 100,
    maxCleanliness: 100,
    maxHealth: 100,
    
    // Velocidad de decaimiento
    hungerDecay: 0.5,     // por minuto
    happinessDecay: 0.3,
    cleanlinessDecay: 0.2,
    healthDecay: 0.1
  },
  
  // 🎯 Valores de acciones
  actions: {
    feed: { hunger: +25, happiness: +5 },
    play: { happiness: +20, hunger: -5 },
    clean: { cleanliness: +30, happiness: +5 },
    medicine: { health: +40, happiness: -10 }
  }
};
```

### **3. Configuración de Peces** (`config/fishConfig.js`)
```javascript
export const FISH_CONFIGS = {
  baby: {
    size: 46,
    body: 'var(--fish-baby-body)',
    tail: 'var(--fish-baby-tail)',
    fin: '#ffd0e2',
    eyeScale: 1.6,
    stripeColor: '#ffba7a',
    stripeWidth: 0.32,
    speed: 120,
    wobbleFreq: 6
  },
  
  young: {
    size: 52,
    body: 'var(--fish-young-body)',
    tail: '#f191cd',
    fin: '#f1c4e4',
    eyeScale: 1.25,
    stripeColor: '#ffa960',
    stripeWidth: 0.20,
    speed: 130,
    wobbleFreq: 6
  },
  
  adult: {
    size: 60,
    body: 'var(--fish-adult-body)',
    tail: '#d073c6',
    fin: '#e2a8d6',
    eyeScale: 0.95,
    stripeColor: '#ff9745',
    stripeWidth: 0.12,
    speed: 125,
    wobbleFreq: 5.6
  }
};
```

---

## 🔧 Componentes Reutilizables

### **Ejemplo: Botón Universal** (`components/UI/Button.js`)
```javascript
export class UniversalButton {
  constructor(config) {
    this.type = config.type;
    this.icon = config.icon;
    this.action = config.action;
    this.element = this.create();
  }
  
  create() {
    const btn = document.createElement('button');
    btn.className = 'universal-btn';
    btn.innerHTML = `${this.icon} ${this.type}`;
    btn.onclick = this.action;
    
    // Estilo se aplica automáticamente desde CSS
    return btn;
  }
}
```

### **CSS del Botón** (`styles/components.css`)
```css
.universal-btn {
  width: var(--ui-button-size);
  height: var(--ui-button-size);
  background: var(--button-primary);
  color: var(--text-color);
  border: none;
  border-radius: var(--button-radius);
  box-shadow: var(--shadow-soft);
  transition: var(--transition-fast);
  cursor: pointer;
  font-weight: 600;
}

.universal-btn:hover {
  background: var(--button-hover);
  transform: translateY(-2px);
}

.universal-btn:active {
  transform: translateY(0);
}
```

---

## 🎯 Ventajas del Sistema

### ✅ **UN Solo Lugar para Cambios**
```javascript
// ¿Quieres cambiar el color de todos los botones?
// SOLO cambia esta línea:
--button-primary: #ff6b6b; // Era #205b86

// ¿Quieres que el pez bebé sea más grande?
// SOLO cambia esto:
--fish-baby-size: 60px; // Era 46px
```

### ✅ **Componentes Inteligentes**
```javascript
// Crear un botón de alimentar:
const feedBtn = new UniversalButton({
  type: 'feed',
  icon: '🍎',
  action: () => fish.feed()
});

// Automáticamente tendrá:
// - Estilo consistente
// - Animaciones
// - Responsividad
// - Accesibilidad
```

### ✅ **Assets Dinámicos**
```javascript
// El sistema carga automáticamente el asset correcto:
const fishSprite = AssetLoader.getFishSprite(fish.stage, fish.mood);
// Retorna: 'assets/images/fish/fish_baby_happy.png'
```

### ✅ **Temas Intercambiables**
```javascript
// Cambiar tema completo en una línea:
ThemeManager.setTheme('dark'); // o 'light', 'ocean', 'space'
```

---

## 🚀 Plan de Implementación

### **Fase 1: Base** (1-2 días)
1. ✅ Estructura de carpetas
2. ⏳ Configuración centralizada  
3. ⏳ Sistema de carga de assets
4. ⏳ Variables CSS globales

### **Fase 2: Componentes** (2-3 días)  
1. ⏳ Clase Fish universal
2. ⏳ Sistema de UI modular
3. ⏳ Gestión de estados
4. ⏳ Sistema de efectos

### **Fase 3: Juego** (3-4 días)
1. ⏳ Loop principal
2. ⏳ Mecánicas de Tamagotchi
3. ⏳ Sistema de guardado
4. ⏳ Pantallas del juego

### **Fase 4: Pulido** (1-2 días)
1. ⏳ Optimizaciones
2. ⏳ Responsive design
3. ⏳ Testing
4. ⏳ Deploy

---

## 💡 Ejemplos de Uso

### **Cambiar color de todos los peces bebé:**
```css
/* En variables.css */
--fish-baby-body: #ff99cc; /* Cambio global instantáneo */
```

### **Agregar nuevo tipo de botón:**
```javascript
// En un solo lugar
const shopBtn = new UniversalButton({
  type: 'shop',
  icon: '🛒',
  action: () => openShop()
});
```

### **Cambiar velocidad de todos los peces:**
```javascript
// En gameConfig.js
evolution: {
  globalSpeedMultiplier: 1.5 // Todos van 50% más rápido
}
```

---

## 🎉 Resultado Final

### **Antes (Dolor de cabeza):**
- 20 archivos HTML con CSS duplicado
- Cambiar un color = buscar y reemplazar en 15 lugares
- Inconsistencias visuales
- Código difícil de mantener

### **Después (Zen total):**
- 1 archivo de configuración
- 1 cambio = efecto global instantáneo  
- Consistencia automática
- Código mantenible y escalable

---

**¿Qué opinas? ¿Empezamos con esta arquitectura?** 🚀

