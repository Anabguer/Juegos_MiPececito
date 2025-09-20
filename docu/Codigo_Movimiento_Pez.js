// 🐠 SISTEMA DE MOVIMIENTO DEL PEZ - Mi Pececito
// Archivo: index.html (líneas 2738-2950 aprox)
// Clase: CompleteGame

// ============================================================================
// 🏊 FUNCIÓN PRINCIPAL DE MOVIMIENTO
// ============================================================================

updateFishMovement(deltaTime) {
    if (!this.fish) return;
    
    const fish = this.fish;
    
    if (fish.isLottie) {
        // Para pez Lottie: movimientos naturales de pez real
        this.updateNaturalFishMovement(deltaTime);
    } else {
        // Para pez Canvas: animaciones manuales
        this.updateCanvasFishAnimations(deltaTime);
    }
}

// ============================================================================
// 🐠 LÓGICA PRINCIPAL DE MOVIMIENTO NATURAL
// ============================================================================

updateNaturalFishMovement(deltaTime) {
    const fish = this.fish;
    const currentStage = this.gameState.stage;
    
    // ----------------------------------------
    // INICIALIZACIÓN DE VARIABLES
    // ----------------------------------------
    
    if (!fish.direction) fish.direction = 1; // 1 = derecha, -1 = izquierda
    if (!fish.baseSpeed) fish.baseSpeed = currentStage === 'baby' ? 60 : 45; // Velocidad base
    if (!fish.speed) fish.speed = fish.baseSpeed; // Velocidad actual
    if (!fish.swimPhase) fish.swimPhase = 0;
    if (!fish.facing) fish.facing = 1;
    if (!fish.changeTimer) fish.changeTimer = 0;
    if (!fish.verticalDirection) fish.verticalDirection = 0; // -1 arriba, 0 medio, 1 abajo
    if (!fish.verticalTimer) fish.verticalTimer = 0;
    
    // BEBÉ NACE CON HAMBRE - Configurar tiempo anterior
    if (!fish.lastFeedTime) {
        const hungerTime = 4 * 60 * 60 * 1000 + 60 * 1000; // 4h 1min atrás
        fish.lastFeedTime = Date.now() - hungerTime;
        console.log('🍼 ¡Bebé nace con HAMBRE! Necesita comer inmediatamente');
    }
    
    // Inicializar otros tiempos si no existen
    if (!this.gameState.lastClean) this.gameState.lastClean = Date.now();
    if (!this.gameState.lastMedicine) this.gameState.lastMedicine = Date.now();
    if (!this.gameState.lastPlay) this.gameState.lastPlay = Date.now();
    
    // ----------------------------------------
    // CONTADORES DE TIEMPO
    // ----------------------------------------
    
    // Fase de natación para ondulación
    fish.swimPhase += deltaTime * (currentStage === 'baby' ? 2 : 1.2);
    fish.changeTimer += deltaTime;
    
    // CAMBIOS DE DIRECCIÓN
    const changeInterval = currentStage === 'baby' ? 4 + Math.random() * 4 : 6 + Math.random() * 4;
    fish.verticalTimer += deltaTime;
    
    if (fish.changeTimer > changeInterval) {
        // 50% chance de cambiar dirección horizontal
        if (Math.random() < 0.5) {
            fish.direction *= -1;
            console.log(`🐠 Cambio horizontal: ${fish.direction === 1 ? 'DERECHA →' : 'IZQUIERDA ←'}`);
        }
        
        // 60% chance de cambiar dirección vertical
        if (Math.random() < 0.6) {
            const options = [-1, 0, 1]; // arriba, medio, abajo
            fish.verticalDirection = options[Math.floor(Math.random() * options.length)];
            const verticalNames = ['ARRIBA ↑', 'MEDIO →', 'ABAJO ↓'];
            console.log(`🐠 Cambio vertical: ${verticalNames[fish.verticalDirection + 1]}`);
        }
        
        fish.changeTimer = 0;
    }
    
    // Cambios verticales independientes (más frecuentes)
    if (fish.verticalTimer > 3 + Math.random() * 3) {
        if (Math.random() < 0.4) {
            const options = [-1, 0, 1];
            fish.verticalDirection = options[Math.floor(Math.random() * options.length)];
        }
        fish.verticalTimer = 0;
    }
    
    // ========================================================================
    // 🎯 PRIORIDADES DE MOVIMIENTO (EN ORDEN)
    // ========================================================================
    
    // ----------------------------------------
    // 1. PRIORIDAD MÁXIMA: IR AL DEDO
    // ----------------------------------------
    if (fish.desire) {
        const dx = fish.desire.x - fish.x;
        const dy = fish.desire.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 20) {
            // MOVIMIENTO DIRECTO Y RÁPIDO
            const baseSpeed = fish.baseSpeed || (currentStage === 'baby' ? 60 : 45);
            const targetSpeed = fish.isDepressed ? baseSpeed * 0.3 : (currentStage === 'baby' ? 150 : 120);
            
            // Movimiento directo hacia el objetivo (SIN ángulos complejos)
            fish.vx = (dx / distance) * targetSpeed;
            fish.vy = (dy / distance) * targetSpeed;
            
            // Orientación simple
            fish.direction = dx > 0 ? 1 : -1;
            
            // Log menos frecuente para no saturar
            if (Math.random() < 0.01) {
                console.log(`👆 Pez DIRECTO hacia dedo: ${distance.toFixed(0)}px`);
            }
        } else {
            // Llegó al objetivo - liberar desire
            fish.desire = null;
            fish.excited = true;
            console.log('👆 ¡Pez llegó al dedo!');
            
            // Pequeña pausa feliz
            setTimeout(() => {
                fish.excited = false;
            }, 2000);
        }
    } 
    
    // ----------------------------------------
    // 2. PRIORIDAD ALTA: PERSEGUIR COMIDA
    // ----------------------------------------
    else if (fish.isChasing) {
        // Durante persecución, usar la velocidad ya calculada en makeFishChaseFood
        // No sobreescribir fish.vx y fish.vy aquí
        // La lógica está en makeFishChaseFood() línea ~3520
    } 
    
    // ----------------------------------------
    // 3. PRIORIDAD MEDIA: TIRABUZONES DE LIMPIEZA
    // ----------------------------------------
    else if (fish.isCleaning) {
        fish.cleaningTime += deltaTime;
        
        // MOVIMIENTO EN TIRABUZONES (COSQUILLAS)
        const spiralSpeed = fish.baseSpeed * 1.5;
        const spiralRadius = 40 + Math.sin(fish.cleaningTime * 3) * 20;
        const spiralAngle = fish.cleaningTime * 4; // 4 vueltas por segundo
        
        fish.vx = Math.cos(spiralAngle) * spiralRadius * 0.1 + 
                  Math.sin(fish.cleaningTime * 8) * spiralSpeed * 0.3;
        fish.vy = Math.sin(spiralAngle) * spiralRadius * 0.1 + 
                  Math.cos(fish.cleaningTime * 6) * spiralSpeed * 0.2;
        
        // Movimiento errático como si tuviera cosquillas
        fish.vx += (Math.random() - 0.5) * spiralSpeed * 0.4;
        fish.vy += (Math.random() - 0.5) * spiralSpeed * 0.3;
        
        console.log(`🌀 Pez haciendo tirabuzones - tiempo: ${fish.cleaningTime.toFixed(1)}s`);
    } 
    
    // ----------------------------------------
    // 4. PRIORIDAD BAJA: PEZ TRISTE VA A ESQUINA
    // ----------------------------------------
    else if (fish.goingToCorner) {
        const dx = fish.cornerTargetX - fish.x;
        const dy = fish.cornerTargetY - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 15) {
            // Movimiento LENTO hacia esquina
            const slowSpeed = fish.baseSpeed * 0.5; // MUY lento
            fish.vx = (dx / distance) * slowSpeed;
            fish.vy = (dy / distance) * slowSpeed;
            fish.direction = dx > 0 ? 1 : -1;
        } else {
            // Llegó a la esquina - quedarse quieto
            fish.goingToCorner = false;
            fish.vx = 0;
            fish.vy = 0;
            console.log('😢 Pez llegó a esquina - Se queda quieto');
        }
    } 
    
    // ----------------------------------------
    // 5. MOVIMIENTO NORMAL: NATACIÓN LIBRE
    // ----------------------------------------
    else {
        fish.vx = fish.direction * fish.speed;
        
        // Movimiento vertical combinado
        let baseVerticalMovement = Math.sin(fish.swimPhase) * (currentStage === 'baby' ? 12 : 8); // Ondulación natural
        let directionalVertical = fish.verticalDirection * (fish.speed * 0.4); // Movimiento direccional vertical
        
        fish.vy = baseVerticalMovement + directionalVertical;
    }
    
    // ========================================================================
    // 📍 APLICAR MOVIMIENTO FINAL
    // ========================================================================
    
    // Aplicar movimiento
    fish.x += fish.vx * deltaTime;
    fish.y += fish.vy * deltaTime;
    
    // GIRO SIMPLE: Solo cuando llega al borde
    this.handleSimpleFishBoundaries();
    
    // Orientación simple
    this.updateFishOrientation();
}

// ============================================================================
// 🎯 FUNCIÓN DE CLICK DEL USUARIO
// ============================================================================

handleCanvasClick(event) {
    if (!this.fish || this.gameState.stage === 'egg' || this.fish.isDepressed) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // SISTEMA DEL DEMO: fish.desire con límites
    this.fish.desire = { 
        x: Math.max(30, Math.min(this.canvas.width - 30, clickX)), 
        y: Math.max(30, Math.min(this.canvas.height - 30, clickY)) 
    };
    
    this.fish.excited = true;
    console.log(`👆 ¡Pez DESIRE hacia el dedo! (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
    
    // Quitar emoción después de llegar
    setTimeout(() => {
        this.fish.excited = false;
    }, 3000);
}

// ============================================================================
// 🔄 DETECCIÓN DE BORDES
// ============================================================================

handleSimpleFishBoundaries() {
    const fish = this.fish;
    const padding = 100; // Distancia del borde para detectar
    
    // Detección horizontal
    if (fish.x <= padding) {
        fish.direction = 1; // Girar a la derecha
        fish.x = padding + 10; // Reposicionar dentro
        console.log('🐠 Detección IZQUIERDO → Gira a la DERECHA');
    } else if (fish.x >= this.canvas.width - padding) {
        fish.direction = -1; // Girar a la izquierda
        fish.x = this.canvas.width - padding - 10;
        console.log('🐠 Detección DERECHO → Gira a la IZQUIERDA');
    }
    
    // Detección vertical
    const verticalPadding = this.canvas.height * 0.15;
    if (fish.y <= verticalPadding) {
        fish.verticalDirection = 1; // Hacia abajo
        fish.y = verticalPadding + 10;
    } else if (fish.y >= this.canvas.height - verticalPadding) {
        fish.verticalDirection = -1; // Hacia arriba
        fish.y = this.canvas.height - verticalPadding - 10;
    }
}

// ============================================================================
// 🎭 ORIENTACIÓN VISUAL DEL PEZ
// ============================================================================

updateFishOrientation() {
    if (!this.fish || !this.fish.isLottie) return;
    
    const fish = this.fish;
    const lottieContainer = document.getElementById('lottieContainer');
    if (!lottieContainer) return;
    
    // El pez Lottie mira hacia la IZQUIERDA por defecto
    // scaleX(-1) = mira DERECHA, scaleX(1) = mira IZQUIERDA
    const scaleX = fish.direction === 1 ? -1 : 1;
    
    // Efectos visuales según estado
    let filterEffects = '';
    if (fish.excited) {
        filterEffects = 'brightness(1.3) saturate(1.2)'; // Feliz
    } else if (fish.isDepressed) {
        filterEffects = 'brightness(0.8) saturate(0.6) grayscale(0.2)'; // Triste
    } else {
        filterEffects = 'brightness(1.0) saturate(1.0)'; // Normal
    }
    
    // Aplicar transformaciones
    lottieContainer.style.transform = `translate(-50%, -50%) scaleX(${scaleX}) scale(${fish.scale || 1})`;
    lottieContainer.style.filter = filterEffects;
    
    console.log(`🔄 Pez orientado: ${fish.direction === 1 ? 'DERECHA →' : 'IZQUIERDA ←'} (scaleX ${scaleX})`);
}

// ============================================================================
// 😢 SISTEMA DE HUMOR DEL PEZ
// ============================================================================

updateFishMood() {
    if (!this.fish) return;
    
    const currentTime = Date.now();
    const currentStage = this.gameState.stage;
    
    // Calcular tiempo sin atender necesidades
    const timeSinceFood = this.fish.lastFeedTime ? currentTime - this.fish.lastFeedTime : 0;
    const timeSincePlay = this.gameState.lastPlay ? currentTime - this.gameState.lastPlay : 0;
    const timeSinceClean = this.gameState.lastClean ? currentTime - this.gameState.lastClean : 0;
    
    // Umbrales de descuido (8 horas sin atender)
    const neglectThreshold = 8 * 60 * 60 * 1000; // 8 horas
    
    const isNeglected = timeSinceFood > neglectThreshold || 
                      timeSincePlay > neglectThreshold || 
                      timeSinceClean > neglectThreshold;
    
    if (isNeglected) {
        // ----------------------------------------
        // PEZ TRISTE Y APÁTICO
        // ----------------------------------------
        this.fish.baseSpeed = (currentStage === 'baby' ? 60 : 45) * 0.3; // MUY lento
        this.fish.isDepressed = true;
        this.fish.hideTimer = (this.fish.hideTimer || 0) + 1/60;
        
        // Se va a una esquina y se queda quieto MÁS TIEMPO
        if (!this.fish.isInCorner && this.fish.hideTimer > 3) {
            // Ir a una esquina aleatoria
            const corners = [
                { x: 100, y: this.canvas.height * 0.2 }, // Esquina superior izquierda
                { x: this.canvas.width - 100, y: this.canvas.height * 0.2 }, // Superior derecha
                { x: 100, y: this.canvas.height * 0.8 }, // Inferior izquierda
                { x: this.canvas.width - 100, y: this.canvas.height * 0.8 } // Inferior derecha
            ];
            
            const corner = corners[Math.floor(Math.random() * corners.length)];
            this.fish.targetX = corner.x;
            this.fish.targetY = corner.y;
            // Pez triste va LENTO a esquina (SIN desire para evitar conflictos)
            this.fish.cornerTargetX = corner.x;
            this.fish.cornerTargetY = corner.y;
            this.fish.goingToCorner = true;
            this.fish.isInCorner = true;
            this.fish.cornerTime = 8 + Math.random() * 12; // 8-20 segundos en esquina
            console.log('😢 Pez triste va a esconderse en esquina...');
        }
        
        // Quedarse quieto en la esquina
        if (this.fish.isInCorner) {
            this.fish.cornerTime -= 1/60;
            
            // Movimiento MUY reducido en la esquina
            if (this.fish.cornerTime > 0) {
                this.fish.vx *= 0.95; // Casi inmóvil
                this.fish.vy *= 0.95;
            } else {
                this.fish.isInCorner = false;
                this.fish.hideTimer = 0;
                console.log('🐠 Pez sale de la esquina');
            }
        }
        
        // NO RESPONDE AL DEDO cuando está muy triste
        if (this.fish.desire && this.fish.isDepressed) {
            this.fish.desire = null;
            this.fish.targetX = null;
            this.fish.targetY = null;
            console.log('😢 Pez demasiado triste para venir al dedo');
        }
        
    } else {
        // ----------------------------------------
        // PEZ NORMAL Y FELIZ
        // ----------------------------------------
        this.fish.baseSpeed = currentStage === 'baby' ? 60 : 45; // Velocidad normal
        this.fish.isDepressed = false;
        this.fish.isInCorner = false;
        this.fish.hideTimer = 0;
    }
}

// ============================================================================
// 🍽️ SISTEMA DE PERSEGUIR COMIDA
// ============================================================================

makeFishChaseFood() {
    if (!this.fish || !this.fallingFood || this.fallingFood.length === 0) return;
    
    const fish = this.fish;
    
    // Encontrar comida más cercana
    let closestFood = null;
    let closestDistance = Infinity;
    
    for (const food of this.fallingFood) {
        const dx = food.x - fish.x;
        const dy = food.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestFood = food;
        }
    }
    
    if (closestFood && closestDistance < 200) {
        // Ir hacia la comida más cercana
        const dx = closestFood.x - fish.x;
        const dy = closestFood.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const chaseSpeed = fish.baseSpeed * 1.5; // 1.5x velocidad normal
            
            // Normalizar y aplicar velocidad
            fish.vx = (dx / distance) * chaseSpeed;
            fish.vy = (dy / distance) * chaseSpeed;
            
            // SOLO cambiar orientación si hay un cambio SIGNIFICATIVO
            const significantChange = Math.abs(dx) > 20; // Solo si está a más de 20px
            if (significantChange) {
                fish.direction = dx > 0 ? 1 : -1;
            }
            
            console.log(`🍽️ Persiguiendo comida: distancia=${distance.toFixed(0)}px`);
        }
    }
}

// ============================================================================
// 📊 VARIABLES IMPORTANTES DEL PEZ
// ============================================================================

/*
ESTRUCTURA DEL OBJETO fish:
{
    // Posición
    x: number,              // Coordenada X actual
    y: number,              // Coordenada Y actual
    
    // Velocidad
    vx: number,             // Velocidad X (píxeles/segundo)
    vy: number,             // Velocidad Y (píxeles/segundo)
    
    // Configuración de velocidad
    baseSpeed: number,      // Velocidad base (60 bebé, 45 adulto)
    speed: number,          // Velocidad actual (puede cambiar temporalmente)
    
    // Dirección
    direction: 1 | -1,      // 1 = derecha, -1 = izquierda
    verticalDirection: -1 | 0 | 1, // -1 = arriba, 0 = medio, 1 = abajo
    
    // Estados de movimiento
    desire: {x, y} | null,  // Coordenadas hacia donde ir (click usuario)
    isChasing: boolean,     // Persiguiendo comida
    isCleaning: boolean,    // Haciendo tirabuzones de limpieza
    goingToCorner: boolean, // Yendo a esquina (pez triste)
    isDepressed: boolean,   // Estado triste (no responde al dedo)
    
    // Animación
    swimPhase: number,      // Para ondulación con Math.sin()
    changeTimer: number,    // Para cambios de dirección
    verticalTimer: number,  // Para cambios verticales
    
    // Estados especiales
    excited: boolean,       // Feliz (más brillo)
    isLottie: boolean,      // Usa animación Lottie (siempre true)
    scale: number,          // Escala visual (para crecimiento)
}
*/

// ============================================================================
// 🚨 POSIBLES PROBLEMAS DETECTADOS
// ============================================================================

/*
PROBLEMA 1: CONFLICTO DE VELOCIDADES
- fish.baseSpeed se modifica en updateFishMood()
- fish.speed se modifica en updateNaturalFishMovement()
- Pueden pisarse mutuamente

PROBLEMA 2: DESIRE vs CORNER
- fish.desire para ir al dedo
- fish.cornerTargetX/Y para ir a esquina
- Pueden conflictar si se activan simultáneamente

PROBLEMA 3: LOGS EXCESIVOS
- "👆 Pez va hacia DESIRE" se imprime 60 veces por segundo
- Debería ser menos frecuente

PROBLEMA 4: MOVIMIENTO LENTO
- Velocidades quizás demasiado bajas
- deltaTime podría estar mal calculado
- fish.vx/vy se sobrescriben constantemente

POSIBLE SOLUCIÓN:
- Separar velocidad base de velocidad temporal
- Usar diferentes variables para diferentes tipos de movimiento
- Reducir logs de debug
- Verificar cálculo de deltaTime
*/

// ============================================================================
// 📁 UBICACIÓN EN EL CÓDIGO
// ============================================================================

/*
ARCHIVO: index.html
CLASE: CompleteGame
LÍNEAS APROXIMADAS:

updateFishMovement()        → ~2738
updateNaturalFishMovement() → ~2753
handleCanvasClick()         → ~2900
handleSimpleFishBoundaries()→ ~3960
updateFishOrientation()     → ~4030
makeFishChaseFood()         → ~3520
updateFishMood()            → ~3050

TODO EN UN SOLO ARCHIVO - NO HAY SEPARACIÓN MODULAR
*/

