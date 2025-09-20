# 🧹 SISTEMA DE LIMPIEZA ESPECTACULAR

## 📋 Descripción
Sistema completo de limpieza con efecto de burbujas espectacular que sube desde el fondo del acuario. El sistema incluye sonidos, animaciones del pez y reducción gradual de la suciedad.

## 🔧 Funciones Principales

### 1. startCleaning() - Iniciar Limpieza
```javascript
startCleaning() {
    console.log('🧹 ¡LIMPIEZA ESPECTACULAR INICIADA!');
    
    // 🔊 SONIDO DE LIMPIEZA
    if (window.audioManager) {
        window.audioManager.playSound('clean');
    }
    
    // Sistema del documento original
    this.cleaningActive = true;
    this.cleanEmitT = 2.6; // 2.6 segundos emitiendo burbujas
    this.dirtStart = this.gameState.needs.dirt; // Guardar suciedad inicial
    
    // Pez feliz con giros de limpieza
    if (this.fish) {
        this.fish.happyBurst = 3.2;
        this.fish.spinKind = "clean";
    }
    
    // Crear arrays si no existen
    if (!this.cleanBubbles) this.cleanBubbles = [];
    
    // Lote inicial inmediato
    this.emitCleanBubbles();
    
    console.log('🧹 Pecera limpiándose con burbujas espectaculares!');
}
```

### 2. emitCleanBubbles() - Generar Burbujas
```javascript
emitCleanBubbles() {
    const W = this.canvas.width; // CORREGIDO: usar canvas.width directamente
    const H = this.canvas.height; // CORREGIDO: usar canvas.height directamente
    const vents = Math.max(16, Math.floor(W/24)); // Respiraderos
    const perVent = 2; // Burbujas por respiradero por frame
    
    for (let i = 0; i < vents; i++) {
        const baseX = (i + 0.5) * (W / vents) + (Math.random() - 0.5) * 8;
        
        for (let k = 0; k < perVent; k++) {
            const vy = 260 + Math.random() * 120;       // px/s reales
            const y0 = H - 1.5 + Math.random() * 0.5;   // pegadas al borde inferior
            const dur = (H + 24) / vy;                 // tiempo hasta salir
            const x0 = this.clamp(baseX + (Math.random() - 0.5) * 6, 2, W - 2);
            
            this.cleanBubbles.push({
                x: x0, 
                y: y0,
                r: 2 + Math.random() * 3,
                life: 3 + Math.random() * 2, // 3-5 segundos de vida
                wobble: Math.random() * 6.28,
                opacity: 0.7 + Math.random() * 0.3,
                color: `hsla(${190 + Math.random() * 40}, 85%, 88%, ${0.6 + Math.random() * 0.4})`,
                from: 'clean' // Identificador para distinguir de otras burbujas
            });
        }
    }
    
    // Control de memoria (máximo 1400 burbujas)
    if (this.cleanBubbles.length > 1400) {
        this.cleanBubbles.splice(0, this.cleanBubbles.length - 1400);
    }
}
```

### 3. updateCleaning() - Actualizar Sistema
```javascript
updateCleaning(deltaTime) {
    if (!this.cleaningActive) return;
    
    this.cleanEmitT -= deltaTime;
    this.emitCleanBubbles(); // Emitir más burbujas cada frame
    
    // Progreso de limpieza (0-1)
    const progress = this.clamp(1 - Math.max(this.cleanEmitT, 0) / 2.6, 0, 1);
    
    // Bajar suciedad gradualmente
    this.gameState.needs.dirt = this.clamp((1 - progress) * this.dirtStart, 0, 100);
    this.updateNeedBars();
    
    // Terminar limpieza
    if (this.cleanEmitT <= 0) {
        this.cleaningActive = false;
        console.log('🧹 ¡Limpieza completada! Suciedad:', this.gameState.needs.dirt);
    }
    
    // 🎯 MOVIMIENTO SIMPLE Y EFECTIVO DE BURBUJAS
    for (const b of this.cleanBubbles) {
        // Movimiento simple hacia arriba
        b.y -= 120 * deltaTime; // 120px/segundo hacia arriba
        b.x += Math.sin(Date.now() * 0.003 + b.wobble) * 30 * deltaTime; // Oscilación suave
        b.life -= deltaTime;
    }
    
    // Purga por fin de vida o posición
    for (let i = this.cleanBubbles.length - 1; i >= 0; i--) {
        const b = this.cleanBubbles[i];
        if (b.life <= 0 || b.y < -50) { // Eliminar si se acabó la vida o salió de pantalla
            this.cleanBubbles.splice(i, 1);
        }
    }
    
    // Si ya no quedan burbujas, garantizar suciedad = 0
    if (!this.cleaningActive && this.gameState.needs.dirt > 0 && this.cleanBubbles.length === 0) {
        this.gameState.needs.dirt = 0;
        this.updateNeedBars();
    }
}
```

### 4. drawCleanBubbles() - Dibujar Burbujas
```javascript
drawCleanBubbles() {
    if (!this.cleanBubbles || this.cleanBubbles.length === 0) return;
    
    this.ctx.save();
    
    // 🎯 COMPOSICIÓN NORMAL (SIN BLENDS RAROS)
    this.ctx.globalCompositeOperation = 'source-over';
    
    for (const b of this.cleanBubbles) {
        // Alpha basado en vida restante
        this.ctx.globalAlpha = b.opacity || 0.8;
        
        // Dibujo simple de burbuja
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        
        // Color de la burbuja
        this.ctx.fillStyle = b.color || '#dff7ff';
        this.ctx.fill();
        
        // Borde suave
        this.ctx.lineWidth = 0.9;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        this.ctx.stroke();
    }
    
    this.ctx.restore();
}
```

### 5. Función Auxiliar clamp()
```javascript
clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
```

## 🎮 Integración en el Game Loop

### En el método update() principal:
```javascript
// Llamar ANTES de render
this.updateCleaning(deltaTime);
```

### En el método render():
```javascript
// Llamar DESPUÉS del fondo pero ANTES del pez
this.drawCleanBubbles();
```

## 🔘 Activación del Botón

### En updateUI():
```javascript
const needsCleaning = true; // LIMPIEZA SIEMPRE DISPONIBLE
```

### En el event listener del botón:
```javascript
case 'cleanBtn': this.startCleaning(); break;
```

## ⚠️ Problemas Identificados y Correcciones

### 1. Funciones viewW() y viewH() inexistentes
**Problema:** El código original usa `this.viewW()` y `this.viewH()` que no están definidas.
**Solución:** Usar `this.canvas.width` y `this.canvas.height` directamente.

### 2. Falta integración en game loop
**Problema:** Las funciones no se llaman en el bucle principal.
**Solución:** Agregar `updateCleaning(deltaTime)` y `drawCleanBubbles()` en los lugares correctos.

### 3. Variables no inicializadas
**Problema:** `cleanBubbles`, `cleaningActive`, etc. pueden no existir.
**Solución:** Inicializar en el constructor o verificar existencia.

## 📊 Variables de Estado Necesarias

```javascript
// En el constructor de la clase:
this.cleanBubbles = [];
this.cleaningActive = false;
this.cleanEmitT = 0;
this.dirtStart = 0;
```

## 🎵 Dependencias de Audio

El sistema requiere que `audioManager` tenga el sonido 'clean' configurado:

```javascript
// En AudioManager:
sounds: {
    clean: './sound/limpiar.mp3'
}
```

## 🔄 Flujo del Sistema

1. **Activación:** Usuario hace click en botón de limpieza
2. **Inicio:** `startCleaning()` se ejecuta
3. **Emisión:** `emitCleanBubbles()` crea burbujas desde el fondo
4. **Actualización:** `updateCleaning()` mueve burbujas y reduce suciedad
5. **Renderizado:** `drawCleanBubbles()` dibuja las burbujas en pantalla
6. **Finalización:** Cuando `cleanEmitT <= 0`, la limpieza termina

## 🎨 Características Visuales

- **1400+ burbujas simultáneas** para efecto espectacular
- **Movimiento realista** con oscilación lateral
- **Colores azul-cian** con transparencias variables
- **Tamaños aleatorios** de 2-5px de radio
- **Vida de 3-5 segundos** por burbuja
- **Velocidad de 260-380 px/s** hacia arriba

## 🔧 Configuración Ajustable

```javascript
// Duración total de emisión
this.cleanEmitT = 2.6; // segundos

// Número de respiraderos
const vents = Math.max(16, Math.floor(W/24));

// Burbujas por respiradero
const perVent = 2;

// Velocidad de subida
b.y -= 120 * deltaTime; // px/segundo

// Límite de memoria
if (this.cleanBubbles.length > 1400)
```
