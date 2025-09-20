# 🐠 Sistema de Movimiento del Pez - Mi Pececito

## 📋 Resumen Ejecutivo

**TODO EL MOVIMIENTO está en `index.html`** en una sola clase `CompleteGame`. **NO hay ficheros separados** - todo está integrado en el archivo principal.

---

## 🎯 Función Principal

### **`updateFishMovement(deltaTime)`** - Línea ~2738
```javascript
updateFishMovement(deltaTime) {
    if (!this.fish) return;
    const fish = this.fish;
    
    if (fish.isLottie) {
        // Para pez Lottie: movimientos naturales
        this.updateNaturalFishMovement(deltaTime);
    } else {
        // Para pez Canvas: animaciones manuales
        this.updateCanvasFishAnimations(deltaTime);
    }
}
```

**NOTA**: Actualmente **solo usamos Lottie** (fish.isLottie = true), así que **toda la lógica** está en `updateNaturalFishMovement()`.

---

## 🐠 Sistema de Movimiento Natural

### **`updateNaturalFishMovement(deltaTime)`** - Línea ~2753

#### **🏊 PRIORIDADES DE MOVIMIENTO (en orden):**

1. **🎯 `fish.desire`** - Ir hacia donde clickeó el usuario
2. **🍽️ `fish.isChasing`** - Perseguir comida 
3. **🧽 `fish.isCleaning`** - Tirabuzones durante limpieza
4. **😢 `fish.goingToCorner`** - Pez triste va a esquina
5. **🏊 Movimiento normal** - Natación libre

#### **📍 VARIABLES DE MOVIMIENTO:**
```javascript
// Posición actual
fish.x, fish.y

// Velocidad actual (píxeles por segundo)
fish.vx, fish.vy

// Configuración
fish.direction = 1 o -1 (derecha/izquierda)
fish.speed = velocidad actual
fish.baseSpeed = velocidad base (60 bebé, 45 adulto)
```

---

## 🎯 1. IR AL DEDO (`fish.desire`)

### **Cuándo se activa:**
- Usuario hace click en pantalla
- Se crea `fish.desire = {x, y}` con las coordenadas

### **Lógica de movimiento:**
```javascript
if (fish.desire) {
    const dx = fish.desire.x - fish.x;
    const dy = fish.desire.y - fish.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 20) {
        // Movimiento DIRECTO hacia el objetivo
        const targetSpeed = fish.isDepressed ? baseSpeed * 0.3 : 150;
        fish.vx = (dx / distance) * targetSpeed;
        fish.vy = (dy / distance) * targetSpeed;
        fish.direction = dx > 0 ? 1 : -1;
    } else {
        // Llegó - liberar desire
        fish.desire = null;
        fish.excited = true;
    }
}
```

### **Características:**
- ✅ **Velocidad alta**: 150 (bebé) / 120 (adulto)
- ✅ **Movimiento directo**: Sin curvas complejas
- ✅ **Se libera**: Al llegar a 20px del objetivo
- ❌ **No funciona**: Si `fish.isDepressed = true`

---

## 🍽️ 2. PERSEGUIR COMIDA (`fish.isChasing`)

### **Cuándo se activa:**
- Usuario presiona botón de comida
- `startFeeding()` activa `fish.isChasing = true`

### **Lógica:**
- **NO se modifica** `fish.vx` y `fish.vy` aquí
- Se calcula en `makeFishChaseFood()` (línea ~3520)
- Encuentra comida más cercana y va hacia ella

---

## 🧽 3. TIRABUZONES DE LIMPIEZA (`fish.isCleaning`)

### **Cuándo se activa:**
- Usuario presiona botón de limpiar
- `startCleaning()` activa `fish.isCleaning = true`

### **Lógica de tirabuzones:**
```javascript
if (fish.isCleaning) {
    fish.cleaningTime += deltaTime;
    
    // Movimiento en espiral + errático
    const spiralSpeed = fish.baseSpeed * 1.5;
    const spiralRadius = 40 + Math.sin(fish.cleaningTime * 3) * 20;
    const spiralAngle = fish.cleaningTime * 4; // 4 vueltas/segundo
    
    fish.vx = Math.cos(spiralAngle) * spiralRadius * 0.1 + 
              Math.sin(fish.cleaningTime * 8) * spiralSpeed * 0.3 +
              (Math.random() - 0.5) * spiralSpeed * 0.4;
              
    fish.vy = Math.sin(spiralAngle) * spiralRadius * 0.1 + 
              Math.cos(fish.cleaningTime * 6) * spiralSpeed * 0.2 +
              (Math.random() - 0.5) * spiralSpeed * 0.3;
}
```

### **Características:**
- ✅ **Duración**: 5 segundos
- ✅ **Espiral**: Radio variable 20-60px
- ✅ **Errático**: Movimiento aleatorio (cosquillas)
- ✅ **Velocidad**: 1.5x más rápido que normal

---

## 😢 4. PEZ TRISTE VA A ESQUINA (`fish.goingToCorner`)

### **Cuándo se activa:**
- `updateFishMood()` detecta descuido (8+ horas sin cuidar)
- Se activa `fish.isDepressed = true`

### **Lógica:**
```javascript
if (fish.goingToCorner) {
    const dx = fish.cornerTargetX - fish.x;
    const dy = fish.cornerTargetY - fish.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 15) {
        // Movimiento LENTO hacia esquina
        const slowSpeed = fish.baseSpeed * 0.5;
        fish.vx = (dx / distance) * slowSpeed;
        fish.vy = (dy / distance) * slowSpeed;
    } else {
        // Llegó - quedarse quieto
        fish.goingToCorner = false;
        fish.vx = 0;
        fish.vy = 0;
    }
}
```

### **Características:**
- ✅ **Velocidad**: 50% de la velocidad base
- ✅ **4 esquinas**: Superior/inferior izquierda/derecha
- ✅ **Se queda quieto**: 8-20 segundos en la esquina
- ❌ **No responde**: Al click del usuario

---

## 🏊 5. MOVIMIENTO NORMAL (libre)

### **Cuándo se activa:**
- Cuando NO hay ninguna prioridad anterior
- Movimiento natural del pez

### **Lógica:**
```javascript
else {
    // Movimiento horizontal
    fish.vx = fish.direction * fish.speed;
    
    // Movimiento vertical (ondulación + direccional)
    let baseVerticalMovement = Math.sin(fish.swimPhase) * 12; // Ondulación natural
    let directionalVertical = fish.verticalDirection * (fish.speed * 0.4);
    
    fish.vy = baseVerticalMovement + directionalVertical;
}
```

### **Variables de control:**
```javascript
fish.direction = 1 o -1;           // Horizontal: derecha/izquierda
fish.verticalDirection = -1, 0, 1; // Vertical: arriba/medio/abajo
fish.swimPhase += deltaTime * 2;   // Para ondulación con Math.sin()
fish.changeTimer                   // Cambio de dirección cada 4-8 segundos
```

---

## ⚙️ Aplicación Final del Movimiento

### **Línea ~2900:**
```javascript
// Aplicar movimiento calculado
fish.x += fish.vx * deltaTime;
fish.y += fish.vy * deltaTime;

// Detectar bordes y girar
this.handleSimpleFishBoundaries();

// Actualizar orientación visual
this.updateFishOrientation();
```

---

## 🔧 Funciones de Apoyo

### **`handleSimpleFishBoundaries()`** - Línea ~3960
- Detecta bordes con padding de 100px
- Cambia `fish.direction` cuando llega al borde
- Reposiciona el pez para que no se oculte

### **`updateFishOrientation()`** - Línea ~4030
- Actualiza `lottieContainer.style.transform`
- `scaleX(-1)` para derecha, `scaleX(1)` para izquierda
- Controla filtros de brillo según estado

---

## 📊 Velocidades por Estado

```javascript
// Velocidades base
baby: 60 px/s
adult: 45 px/s

// Modificadores
normal: baseSpeed
hacia_dedo: 150 (bebé) / 120 (adulto)
perseguir_comida: baseSpeed * 1.5
limpieza: baseSpeed * 1.5
triste: baseSpeed * 0.3
triste_a_esquina: baseSpeed * 0.5
```

---

## 🎯 Conclusión

**TODO EL MOVIMIENTO** está en **`index.html`** en la clase `CompleteGame`:

- **Función principal**: `updateFishMovement()` → `updateNaturalFishMovement()`
- **5 tipos de movimiento** con prioridades claras
- **Variables `fish.vx` y `fish.vy`** controlan la velocidad
- **Se aplica** con `fish.x += fish.vx * deltaTime`
- **Un solo archivo** - no hay separación modular

**¿Te parece claro el sistema?** ¿Alguna parte necesita explicación adicional?

