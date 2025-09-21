# CÓDIGO DEL COMPORTAMIENTO DEL PEZ Y NECESIDADES - Mi Pececito

## RESUMEN EJECUTIVO
Este documento contiene todo el código actual que controla:
- Las necesidades del pez (hambre, suciedad, diversión)
- El comportamiento del pez (movimiento, reacciones)
- La lógica de comida y limpieza
- Los tiempos y cálculos matemáticos exactos

---

## 1. NECESIDADES AUTOMÁTICAS DEL PEZ

### Cálculo de Necesidades (updateAutoNeeds)
```javascript
updateAutoNeeds(deltaTime) {
    if (!this.fish || this.gameState.stage === 'egg') return;

    // CÁLCULOS MATEMÁTICOS EXACTOS:
    // Suciedad: 4 horas = 14,400 segundos para 100%
    // Hambre bebé: 2 horas = 7,200 segundos para 100% 
    // Diversión: 3 horas = 10,800 segundos para 100%
    const dirtInc = (100 / (4 * 60 * 60)) * deltaTime;  // 4 horas para ensuciarse
    const hungerInc = (100 / (2 * 60 * 60)) * deltaTime; // 2 horas para hambre total
    const funDec = (100 / (3 * 60 * 60)) * deltaTime;    // 3 horas para aburrirse

    // Aplicar cambios
    this.gameState.needs.dirt = Math.min(100, this.gameState.needs.dirt + dirtInc);
    this.gameState.needs.hunger = Math.min(100, this.gameState.needs.hunger + hungerInc);
    this.gameState.needs.fun = Math.max(0, this.gameState.needs.fun - funDec);

    // Debug cada 10 segundos
    this.debugTimer = (this.debugTimer || 0) + deltaTime;
    if (this.debugTimer >= 10) {
        console.log(`🔄 Necesidades AUTO (deltaTime=${deltaTime.toFixed(4)}s): Hambre: ${this.gameState.needs.hunger.toFixed(1)}% (+${hungerInc.toFixed(2)}) Suciedad: ${this.gameState.needs.dirt.toFixed(1)}% (+${dirtInc.toFixed(2)}) Diversión: ${this.gameState.needs.fun.toFixed(1)}% (-${funDec.toFixed(2)})`);
        this.debugTimer = 0;
    }
}
```

### Flags de Crisis (updateCrisisFlags)
```javascript
updateCrisisFlags() {
    if (!this.gameState.crisis) this.gameState.crisis = {};
    
    // Crisis por hambre (>75%)
    this.gameState.crisis.hungry = this.gameState.needs.hunger > 75;
    
    // Crisis por suciedad (>70%)
    this.gameState.crisis.dirty = this.gameState.needs.dirt > 70;
    
    // Crisis por aburrimiento (≤25% diversión)
    this.gameState.crisis.bored = this.gameState.needs.fun <= 25;
}
```

---

## 2. SISTEMA DE COMIDA

### Lógica Principal de Comida (updateFood)
```javascript
updateFood(deltaTime) {
    // Mover comida existente
    for (let i = this.food.length - 1; i >= 0; i--) {
        const f = this.food[i];
        f.vy += 120 * deltaTime; // Gravedad
        f.y += f.vy * deltaTime;
        f.life -= deltaTime;
        
        // Eliminar si sale de pantalla o expira
        if (f.y > this.canvas.height + 20 || f.life <= 0) {
            this.food.splice(i, 1);
            continue;
        }
        
        // Colisión con pez (LÓGICA SIMPLIFICADA)
        if (this.fish) {
            const dist = Math.hypot(f.x - this.fish.x, f.y - this.fish.y);
            if (dist < 25) {
                // ✅ SIEMPRE COMER SI TIENE HAMBRE (>1%)
                if (this.gameState.needs.hunger > 1) {
                    // Reducir hambre
                    this.gameState.needs.hunger = Math.max(0, this.gameState.needs.hunger - 30);
                    
                    // ✅ SIEMPRE mostrar efectos y sonido
                    this.addLabel(this.fish.x, this.fish.y - 30, 'Ñam', '#ffff00', 1.5);
                    if (window.audioManager) {
                        window.audioManager.playSound('eat');
                    }
                    
                    console.log(`🍎 PEZ COMIÓ: Hambre ${this.gameState.needs.hunger.toFixed(1)}% (era ${(this.gameState.needs.hunger + 30).toFixed(1)}%)`);
                    this.updateNeedBars();
                }
                
                // Eliminar comida
                this.food.splice(i, 1);
                continue;
            }
        }
    }
    
    // Limitar cantidad máxima
    if (this.food.length > 8) {
        this.food.splice(0, this.food.length - 8);
    }
}
```

### Comportamiento del Pez hacia la Comida
```javascript
// En updateFishMovement - PERSEGUIR COMIDA
if (this.food.length > 0 && this.gameState.needs.hunger > 1) { // SIMPLIFICADO: >1% hambre
    let closest = null;
    let closestDist = Infinity;
    
    for (const f of this.food) {
        const d = this.dist(fish.x, fish.y, f.x, f.y);
        if (d < closestDist) {
            closest = f;
            closestDist = d;
        }
    }
    
    if (closest && closestDist < 200) {
        const dx = closest.x - fish.x;
        const dy = closest.y - fish.y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
            targetV.vx = (dx / len) * 80; // Velocidad hacia comida
            targetV.vy = (dy / len) * 80;
            speedMul = 1.8; // Más rápido cuando persigue comida
            fish.isChasing = true;
        }
    }
}
```

---

## 3. SISTEMA DE LIMPIEZA

### Iniciar Limpieza (startCleaning)
```javascript
startCleaning() {
    console.log('🧹 ¡LIMPIEZA ESPECTACULAR INICIADA!');
    
    // 🎯 INICIALIZAR ARRAYS PERO NO CREAR BURBUJAS AÚN
    this._time = this._time || 0;
    this.cleanBubbles = this.cleanBubbles || [];
    
    if (this.fish) { this.fish.happyBurst = 3.2; this.fish.spinKind = "clean"; }
    
    // 🔊 SONIDO INMEDIATO
    if (window.audioManager) {
        window.audioManager.playSound('clean');
    }
    
    // 🫧 CREAR BURBUJAS AL MISMO TIEMPO QUE SONIDO Y LIMPIEZA
    this.emitCleanBubbles();
    this.emitCleanBubbles(); // Doble ráfaga como antes
    console.log(`🫧 Burbujas creadas SINCRONIZADAS: ${this.cleanBubbles.length}`);
    
    // 🧹 ACTIVAR LIMPIEZA INMEDIATAMENTE
    this.cleaningActive = true;
    this.cleanEmitT = 2.6;
    this.dirtStart = this.gameState.needs.dirt;
}
```

### Crear Burbujas de Limpieza (emitCleanBubbles)
```javascript
emitCleanBubbles() {
    const W = this.viewW();   // CSS px
    const H = this.viewH();   // CSS px
    const vents = Math.max(16, Math.floor(W / 24));
    const perVent = 2;

    for (let i = 0; i < vents; i++) {
        const baseX = (i + 0.5) * (W / vents) + (Math.random() - 0.5) * 8;

        for (let k = 0; k < perVent; k++) {
            const vy  = 260 + Math.random() * 120;     // velocidad vertical (CSS px/s)
            const y0  = H - 1 + Math.random() * 0.5;   // nacen pegadas al fondo
            const dur = (H + 24) / vy;                 // tiempo exacto hasta salir por arriba
            const x0  = this.clamp(baseX + (Math.random() - 0.5) * 6, 2, W - 2);

            this.cleanBubbles.push({
                x0, y0, vy, dur,
                r: 3 + Math.random() * 4,
                t: 0,
                opacity: 0.6 + Math.random() * 0.4
            });
        }
    }

    // Limitar cantidad máxima
    if (this.cleanBubbles.length > 1400) {
        this.cleanBubbles.splice(0, this.cleanBubbles.length - 1400);
    }
}
```

### Actualizar Limpieza (updateCleaning)
```javascript
updateCleaning(deltaTime) {
    this._time = (this._time || 0) + deltaTime;

    if (this.cleaningActive) {
        this.cleanEmitT -= deltaTime;
        this.emitCleanBubbles();

        const progress = this.clamp(1 - Math.max(this.cleanEmitT, 0) / 2.6, 0, 1);
        this.gameState.needs.dirt = this.clamp((1 - progress) * this.dirtStart, 0, 100);
        this.updateNeedBars();

        if (this.cleanEmitT <= 0) {
            this.cleaningActive = false;
            this.cleaningJustFinished = true; // Marcar que acabamos de terminar
            console.log('🧹 Limpieza terminada - Esperando que se vayan las burbujas...');
        }
    }

    // Movimiento paramétrico: y = y0 - p*(H+24)
    const H = this.viewH();
    for (const b of this.cleanBubbles) {
        b.t += deltaTime;
        const p = Math.min(1, b.t / (b.dur || 1));       // 0→1
        b.y = b.y0 - p * (H + 24);                       // Movimiento lineal hacia arriba
    }

    // Eliminar burbujas que salieron por arriba
    this.cleanBubbles = this.cleanBubbles.filter(b => b.t < (b.dur || 1));

    // Garantía de limpieza completa
    if (this.cleaningJustFinished && this.cleanBubbles.length === 0) {
        this.gameState.needs.dirt = 0; // GARANTÍA: Limpieza perfecta
        this.updateNeedBars();
        this.cleaningJustFinished = false; // Reset flag
        console.log('🧹 Limpieza completada - Garantía: suciedad = 0');
    }
}
```

---

## 4. COMPORTAMIENTO Y MOVIMIENTO DEL PEZ

### Movimiento Principal (updateFishMovement)
```javascript
updateFishMovement(deltaTime) {
    if (!this.fish) return;
    const fish = this.fish;

    // Animaciones básicas
    fish.blinkT -= deltaTime;
    if (fish.blinkT <= 0) {
        fish.blinkT = 0.12;
        fish.nextBlink = 2 + Math.random() * 4;
    }

    // Burbujas de respiración
    fish.breathT -= deltaTime;
    if (fish.breathT <= 0 && !this.cleaningActive) {
        this.emitMouthBubbles(3 + Math.floor(Math.random() * 3));
        fish.breathT = 2 + Math.random() * 3;
    }

    fish.swimPhase += deltaTime * 3.2;
    let targetV = {vx: 0, vy: 0};
    let speedMul = 1.0;

    // 🔥 TURBO DE DEDO (decaimiento)
    fish.fingerBoostT = Math.max(0, (fish.fingerBoostT || 0) - deltaTime);

    // 🍎 PERSEGUIR COMIDA (LÓGICA SIMPLIFICADA)
    fish.isChasing = false;
    if (this.food.length > 0 && this.gameState.needs.hunger > 1) { // SIMPLIFICADO: >1% hambre
        let closest = null;
        let closestDist = Infinity;
        
        for (const f of this.food) {
            const d = this.dist(fish.x, fish.y, f.x, f.y);
            if (d < closestDist) {
                closest = f;
                closestDist = d;
            }
        }
        
        if (closest && closestDist < 200) {
            const dx = closest.x - fish.x;
            const dy = closest.y - fish.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                targetV.vx = (dx / len) * 80; // Velocidad hacia comida
                targetV.vy = (dy / len) * 80;
                speedMul = 1.8; // Más rápido cuando persigue comida
                fish.isChasing = true;
            }
        }
    }

    // 👆 SEGUIR DEDO (prioridad alta)
    if (this.fingerTarget && this.dist(fish.x, fish.y, this.fingerTarget.x, this.fingerTarget.y) > 30) {
        const dx = this.fingerTarget.x - fish.x;
        const dy = this.fingerTarget.y - fish.y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
            targetV.vx = (dx / len) * 120; // MÁS RÁPIDO hacia dedo
            targetV.vy = (dy / len) * 120;
            speedMul = 2.5; // TURBO hacia dedo
            fish.fingerBoostT = 1.0; // Activar turbo visual
        }
    }

    // 🎯 MOVIMIENTO ALEATORIO (cuando no hay objetivos)
    if (targetV.vx === 0 && targetV.vy === 0) {
        fish.wanderT -= deltaTime;
        if (fish.wanderT <= 0) {
            const angle = Math.random() * Math.PI * 2;
            fish.wanderDir = {
                vx: Math.cos(angle) * (20 + Math.random() * 30),
                vy: Math.sin(angle) * (20 + Math.random() * 30)
            };
            fish.wanderT = 1 + Math.random() * 3;
        }
        targetV = fish.wanderDir || {vx: 0, vy: 0};
        speedMul = 0.6; // Más lento en movimiento aleatorio
    }

    // 🏊 APLICAR VELOCIDAD CON SUAVIZADO
    const smoothing = 1 - Math.exp(-3 * deltaTime);
    fish.vx += (targetV.vx * speedMul - fish.vx) * smoothing;
    fish.vy += (targetV.vy * speedMul - fish.vy) * smoothing;

    // 🧱 LÍMITES DE PANTALLA (con rebote suave)
    const margin = 55;
    const leftLimit = margin;
    const rightLimit = this.canvas.width - margin;
    const topLimit = 125;
    const bottomLimit = this.canvas.height - 160;

    if (fish.x <= leftLimit && fish.vx < 0) fish.vx = Math.abs(fish.vx) * 0.8;
    if (fish.x >= rightLimit && fish.vx > 0) fish.vx = -Math.abs(fish.vx) * 0.8;
    if (fish.y <= topLimit && fish.vy < 0) fish.vy = Math.abs(fish.vy) * 0.8;
    if (fish.y >= bottomLimit && fish.vy > 0) fish.vy = -Math.abs(fish.vy) * 0.8;

    // 🚀 MOVER PEZ
    fish.x += fish.vx * deltaTime;
    fish.y += fish.vy * deltaTime;

    // 🔒 CLAMP FINAL (garantía)
    fish.x = this.clamp(fish.x, leftLimit, rightLimit);
    fish.y = this.clamp(fish.y, topLimit, bottomLimit);

    // 🐟 ORIENTACIÓN (mirar hacia donde nada)
    if (Math.abs(fish.vx) > 5) {
        fish.facingRight = fish.vx > 0;
    }

    // 🎭 ESTADOS ESPECIALES
    if (fish.happyBurst > 0) {
        fish.happyBurst -= deltaTime;
        if (fish.happyBurst <= 0) fish.spinKind = null;
    }
}
```

---

## 5. ESTADOS INICIALES Y CONFIGURACIÓN

### Valores Iniciales del Pez Bebé
```javascript
// Al nacer (en birth function)
this.gameState.needs = {
    hunger: 80,    // Bebé nace con hambre (80%)
    dirt: 0,       // Pantalla limpia al nacer
    fun: 95        // Bebé feliz al nacer
};
```

### Reset al Colocar Nuevo Huevo
```javascript
// En startEggMagic function
// 🏷️ RESETEAR NOMBRE PARA NUEVO PEZ
this.gameState.hasAskedForName = false;
this.gameState.fishName = null;

// 🧼 RESETEAR PANTALLA LIMPIA AL INICIAR HUEVO
this.gameState.needs.dirt = 0;
this.gameState.needs.hunger = 15;  // Huevo con poca hambre
this.gameState.needs.fun = 95;     // Huevo feliz
```

---

## 6. BUCLE PRINCIPAL DEL JUEGO

### Update Loop Principal
```javascript
update(deltaTime) {
    // ... código del huevo ...
    
    // Movimiento del pez (todas las etapas)
    if (this.fish && (this.gameState.stage === 'baby' || this.gameState.stage === 'young' || this.gameState.stage === 'adult')) {
        // 🚀 SISTEMA REALISTA COMPLETO
        this.updateAutoNeeds(deltaTime);      // Necesidades automáticas
        this.updateCrisisFlags();             // Flags de crisis
        this.updateFood(deltaTime);           // 🍎 COMIDA DEL DOCUMENTO
        this.updateCleaning(deltaTime);       // 🧹 LIMPIEZA ESPECTACULAR
        this.updateFishMovement(deltaTime);   // Movimiento realista
        this.updateTinyBubbles(deltaTime);    // Burbujas de respiración
        this.updateFlyers(deltaTime);         // Corazones voladores
        this.updateLabels(deltaTime);         // 🍎 LABELS ("Ñam")
        
        // Actualizar UI cada pocos segundos
        if (Math.random() < 0.05) {
            this.updateUI();
            this.checkForAlbumEvents();
            this.checkEvolution();
        }
    }
}
```

---

## NOTAS IMPORTANTES:

1. **Tiempos exactos**: 4h suciedad, 2h hambre bebé, 3h diversión
2. **Comida**: Pez persigue si hambre > 1%, siempre hace "ñam" y sonido
3. **Limpieza**: Burbujas sincronizadas con sonido (sin delays)
4. **Bebé**: Nace con 80% hambre, 0% suciedad, 95% diversión
5. **Huevo**: Inicia con 15% hambre, 0% suciedad, 95% diversión

Este es el código completo y actual del comportamiento del pez.
