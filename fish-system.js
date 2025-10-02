/**
 * 🐠 SISTEMA DEL PEZ - REFACTORIZADO
 * 
 * Este archivo contiene toda la lógica relacionada con el pez:
 * - Dibujo del pez
 * - Movimiento del pez
 * - Interacción con el dedo
 * - Estados de ánimo
 * - Orientación
 * 
 * 📊 PARÁMETROS DE MOVIMIENTO:
 * - Velocidad base: 50-100 px/s
 * - Fricción: 0.95 (reduce velocidad cada frame)
 * - Aceleración hacia dedo: 200-400 px/s²
 * - Distancia máxima para seguir dedo: 300px
 * - Tiempo de boost del dedo: 1.6s
 */

// 📊 CONFIGURACIÓN DE MOVIMIENTO DEL PEZ
const FISH_MOVEMENT_CONFIG = {
    // Velocidades base (px/s)
    baseSpeed: {
        min: 50,
        max: 100
    },
    
    // Fricción (0-1, más alto = más lento)
    friction: 0.95,
    
    // Aceleración hacia el dedo (px/s²)
    fingerAcceleration: {
        min: 200,
        max: 400
    },
    
    // Distancia máxima para seguir el dedo (px)
    maxFingerDistance: 300,
    
    // Tiempo de boost del dedo (segundos)
    fingerBoostTime: 1.6,
    
    // Escala de respiración
    breatheScale: {
        min: 0.94,
        max: 1.06
    },
    
    // Frecuencia de respiración (ciclos por segundo)
    breatheFrequency: 0.5
};

console.log('🐠 Fish System cargado');
console.log('🐠 CONFIGURACIÓN DE MOVIMIENTO:', FISH_MOVEMENT_CONFIG);

class FishSystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
    }

    /**
     * 🎨 DIBUJAR PEZ - FUNCIÓN COMPLETA
     */
    drawFish() {
        if (!this.game.fish) return;
        
        const fish = this.game.fish;
        const size = fish.size;
        const colors = this.getFishColors();
        
        this.ctx.save();
        this.ctx.translate(fish.x, fish.y);
        this.ctx.rotate(-25 * Math.PI / 180); // Inclinación del Lottie
        
        // 🫁 APLICAR RESPIRACIÓN
        this.ctx.scale(fish.breatheScale, fish.breatheScale);
        
        // 🐟 COLA PRINCIPAL (forma exacta del Lottie)
        this.ctx.save();
        this.ctx.translate(-size * 0.8, 0);
        this.ctx.rotate(fish.finRotation); // Ondulación -36° a +4°
        
        this.ctx.fillStyle = colors.tail;
        this.ctx.beginPath();
        // Forma de cola del Lottie (más orgánica)
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-size * 0.3, -size * 0.4, -size * 0.6, -size * 0.2);
        this.ctx.quadraticCurveTo(-size * 0.7, 0, -size * 0.6, size * 0.2);
        this.ctx.quadraticCurveTo(-size * 0.3, size * 0.4, 0, 0);
        this.ctx.fill();
        this.ctx.restore();
        
        // 🐠 CUERPO PRINCIPAL (forma orgánica del Lottie)
        this.ctx.fillStyle = colors.body;
        this.ctx.beginPath();
        // Forma de pez más realista basada en el JSON
        this.ctx.moveTo(size * 0.6, 0);
        this.ctx.quadraticCurveTo(size * 0.4, -size * 0.5, 0, -size * 0.4);
        this.ctx.quadraticCurveTo(-size * 0.6, -size * 0.3, -size * 0.7, 0);
        this.ctx.quadraticCurveTo(-size * 0.6, size * 0.3, 0, size * 0.4);
        this.ctx.quadraticCurveTo(size * 0.4, size * 0.5, size * 0.6, 0);
        this.ctx.fill();
        
        // 🎨 FRANJAS (patrón del Lottie)
        this.ctx.fillStyle = colors.stripes;
        this.ctx.beginPath();
        // Franja superior
        this.ctx.moveTo(size * 0.4, -size * 0.15);
        this.ctx.quadraticCurveTo(0, -size * 0.25, -size * 0.4, -size * 0.15);
        this.ctx.quadraticCurveTo(-size * 0.2, -size * 0.05, size * 0.4, -size * 0.15);
        this.ctx.fill();
        
        // Franja inferior (solo para bebé)
        if (this.game.gameState.stage === 'baby') {
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.4, size * 0.15);
            this.ctx.quadraticCurveTo(0, size * 0.25, -size * 0.4, size * 0.15);
            this.ctx.quadraticCurveTo(-size * 0.2, size * 0.05, size * 0.4, size * 0.15);
            this.ctx.fill();
        }
        
        // 🐟 ALETA SUPERIOR (forma del Lottie)
        this.ctx.save();
        this.ctx.translate(size * 0.1, -size * 0.4);
        this.ctx.rotate(fish.finRotation * 0.6); // Ondulación sutil
        
        this.ctx.fillStyle = colors.fins;
        this.ctx.beginPath();
        // Forma de aleta orgánica
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-size * 0.15, -size * 0.3, size * 0.05, -size * 0.35);
        this.ctx.quadraticCurveTo(size * 0.2, -size * 0.25, size * 0.15, -size * 0.1);
        this.ctx.quadraticCurveTo(size * 0.05, 0, 0, 0);
        this.ctx.fill();
        this.ctx.restore();
        
        // 🐟 ALETA INFERIOR
        this.ctx.save();
        this.ctx.translate(size * 0.2, size * 0.5);
        this.ctx.rotate(-fish.finRotation * 0.4);
        
        this.ctx.fillStyle = colors.fins;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-size * 0.1, size * 0.2, size * 0.05, size * 0.25);
        this.ctx.quadraticCurveTo(size * 0.15, size * 0.15, size * 0.1, size * 0.05);
        this.ctx.quadraticCurveTo(size * 0.05, 0, 0, 0);
        this.ctx.fill();
        this.ctx.restore();
        
        // 👁️ OJO EXACTO DEL LOTTIE
        if (fish.eyeOpen > 0) {
            // Ojo blanco (forma orgánica del Lottie) - MÁS GRANDE PARA JOVEN
            const whiteEyeScale = this.game.gameState.stage === 'baby' ? 1.0 : 1.6;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.ellipse(size * 0.3, -size * 0.05, size * 0.2 * whiteEyeScale, size * 0.15 * fish.eyeOpen * whiteEyeScale, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupila negra
            // 👁️ OJO SÚPER GRANDE (especialmente para joven/adulto)
            const eyeScale = this.game.gameState.stage === 'baby' ? 1.0 : 1.8; // MUCHO más grande para joven/adulto
            this.ctx.fillStyle = '#323232'; // Color exacto [0.1961,0.1961,0.1961]
            this.ctx.beginPath();
            this.ctx.ellipse(size * 0.32, -size * 0.05, size * 0.08 * eyeScale, size * 0.1 * fish.eyeOpen * eyeScale, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Brillo en el ojo (más grande también)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(size * 0.34, -size * 0.08, size * 0.03 * eyeScale, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 👄 BOCA PEQUEÑA (del Lottie)
        this.ctx.fillStyle = colors.fins;
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.5, size * 0.05, size * 0.05, size * 0.03, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 🍼 CHUPETE (solo para bebé)
        if (this.game.gameState.stage === 'baby' && colors.pacifier) {
            // Chupete principal
            this.ctx.fillStyle = colors.pacifier;
            this.ctx.beginPath();
            this.ctx.arc(size * 0.6, size * 0.1, size * 0.12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Anillo del chupete
            this.ctx.strokeStyle = colors.pacifier;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(size * 0.6, size * 0.1, size * 0.16, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Mango del chupete
            this.ctx.fillStyle = colors.pacifier;
            this.ctx.fillRect(size * 0.72, size * 0.08, size * 0.08, size * 0.04);
        }
        
        this.ctx.restore();
    }

    /**
     * 🎨 DIBUJAR CUERPO DEL PEZ
     */
    drawFishBody(fish, ctx) {
        const colors = this.getFishColors(fish.stage);
        
        // Cuerpo principal
        ctx.fillStyle = colors.body;
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.size * 0.8, fish.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cola
        ctx.fillStyle = colors.tail;
        ctx.beginPath();
        ctx.ellipse(-fish.size * 0.6, 0, fish.size * 0.4, fish.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Aletas
        ctx.fillStyle = colors.fin;
        ctx.beginPath();
        ctx.ellipse(0, -fish.size * 0.4, fish.size * 0.2, fish.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rayas
        ctx.fillStyle = colors.stripe;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(-fish.size * 0.2 + i * fish.size * 0.2, 0, fish.size * 0.1, fish.size * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 👁️ DIBUJAR OJOS DEL PEZ
     */
    drawFishEyes(fish, ctx) {
        const eyeSize = fish.size * 0.15;
        const eyeY = -fish.size * 0.2;
        
        // Ojo izquierdo
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-fish.size * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupila izquierda
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-fish.size * 0.3, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojo derecho
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(fish.size * 0.1, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupila derecha
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(fish.size * 0.1, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 🎨 OBTENER COLORES DEL PEZ SEGÚN SU ETAPA
     */
    getFishColors() {
        const stage = this.game.gameState.stage;
        const ageInDays = this.game.gameState.ageInDays || 0;
        
        // Bebé (0-2 días) - Colores Lottie + chupete
        if (stage === 'baby' || ageInDays < 3) {
            return {
                body: '#978bd8',      // Color exacto Lottie [0.5922,0.5451,0.8471]
                stripes: '#9f8cb9',   // Franjas Lottie [0.6235,0.549,0.7255]
                tail: '#d14444',      // Cola roja Lottie [0.8196,0.2667,0.2667]
                fins: '#d78383',      // Aletas rosa Lottie [0.8431,0.5137,0.5137]
                pacifier: '#ff9ecf'   // Chupete rosa para bebé
            };
        }
        
        // Joven (3-7 días) - Variación más intensa
        if (stage === 'young' || ageInDays < 8) {
            return {
                body: '#8a7bd8',      // Morado más intenso
                stripes: '#f4d03f',   // RAYA AMARILLENTA SUAVE
                tail: '#c13434',      // Cola más intensa
                fins: '#c77373',      // Aletas más fuertes
                pacifier: null        // Sin chupete
            };
        }
        
        // Adulto (8+ días) - Colores maduros
        return {
            body: '#7d6bd8',        // Morado profundo
            stripes: '#7f6cb9',     // Franjas sutiles
            tail: '#b12424',        // Cola madura
            fins: '#b76363',        // Aletas elegantes
            pacifier: null          // Sin chupete
        };
    }

    /**
     * 🐟 MOVIMIENTO DEL PEZ - FUNCIÓN COMPLETA
     */
    updateFishMovement(deltaTime) {
        if (!this.game.fish) return;
        const fish = this.game.fish;

        // Inicializar propiedades del pez (igual que el demo perfecto)
        if (!fish.baseSpeed) fish.baseSpeed = 140;
        if (!fish.maxSpeed) fish.maxSpeed = 300;
        if (!fish.maxAccel) fish.maxAccel = 900;
        if (!fish.facing) fish.facing = 1;
        if (!fish.wanderTimer) fish.wanderTimer = 0;
        if (!fish.wanderDir) fish.wanderDir = {x: 1, y: 0};
        if (!fish.swimPhase) fish.swimPhase = 0;
        if (!fish.desire) fish.desire = null;
        if (!fish.happyBurst) fish.happyBurst = 0;
        if (!fish.spinKind) fish.spinKind = "eat";

        // Parpadeo y respiración
        fish.blinkT = Math.max(0, fish.blinkT - deltaTime);
        fish.nextBlink = (fish.nextBlink || 2) - deltaTime;
        if (fish.nextBlink <= 0 && fish.blinkT <= 0) {
            fish.blinkT = 0.12;
            fish.nextBlink = 2 + Math.random() * 4;
        }
        
        fish.breathT = (fish.breathT || 2) - deltaTime;
        if (fish.breathT <= 0 && !this.game.cleaningState) {
            this.emitMouthBubbles(3 + Math.floor(Math.random() * 3));
            fish.breathT = 2 + Math.random() * 3;
        }

        fish.swimPhase += deltaTime * 3.2;
        let targetV = {vx: 0, vy: 0};
        let speedMul = 1.0;

        // Crisis flags (igual que el demo)
        const inHunger = this.game.gameState?.needs?.hunger >= 75;
        const inDirt = this.game.gameState?.needs?.dirt >= 75;
        const inBored = this.game.gameState?.needs?.fun <= 25;

        // Celebración (happyBurst)
        if (fish.happyBurst > 0) {
            const w = (fish.spinKind === "clean") ? 13.0 : 6.0;
            const R = (fish.spinKind === "clean") ? 140 : 55;
            const a = (this.game._time || 0) * w;
            targetV = {vx: Math.cos(a) * R * 0.65, vy: Math.sin(a) * R * 0.65};
            speedMul = (fish.spinKind === "clean") ? 1.8 : 1.25;
            fish.happyBurst = Math.max(0, fish.happyBurst - (fish.spinKind === "clean" ? 0.6 : 1.6) * deltaTime);
        }
        // 🍎 COMIDA = MÁXIMA PRIORIDAD (SIEMPRE RÁPIDO)
        else if (this.game.food?.length) {
            const best = this.nearestFood();
            if (inHunger) {
                // Crisis hambre + comida (RÁPIDO)
                const s = this.seek(fish.x, fish.y, best.x, best.y, fish.maxSpeed * 1.2);
                speedMul = 1.2;
                targetV = {vx: s.vx, vy: s.vy};
            } else if (inDirt) {
                // Crisis suciedad + comida (NORMAL-RÁPIDO)
                const s = this.seek(fish.x, fish.y, best.x, best.y, fish.maxSpeed * 1.1);
                speedMul = 1.0;
                targetV = {vx: s.vx, vy: s.vy};
            } else if (inBored) {
                // Crisis aburrimiento + comida (NORMAL-RÁPIDO)
                const s = this.seek(fish.x, fish.y, best.x, best.y, fish.maxSpeed * 1.1);
                speedMul = 1.0;
                targetV = {vx: s.vx, vy: s.vy};
            } else {
                // Comida normal (NORMAL)
                const s = this.seek(fish.x, fish.y, best.x, best.y, fish.maxSpeed * 1.0);
                speedMul = 0.9;
                targetV = {vx: s.vx, vy: s.vy};
            }
        }
        // Crisis hambre sin comida
        else if (inHunger) {
            const home = {x: this.canvas.width * 0.2, y: 140}; // Ajustado para estar visible
            const s = this.seek(fish.x, fish.y, home.x, home.y, 60);
            speedMul = 0.5;
            if (s.dist > 20) {
                targetV = {vx: s.vx * 0.5, vy: s.vy * 0.5};
            } else {
                targetV = {vx: Math.sin(fish.swimPhase) * 6, vy: Math.cos(fish.swimPhase * 1.2) * 3};
            }
        }
        // Crisis suciedad sin comida
        else if (inDirt) {
            const home = {x: this.canvas.width - 70, y: this.getFloorY() - 70};
            const s = this.seek(fish.x, fish.y, home.x, home.y, 70);
            speedMul = 0.7;
            if (s.dist > 20) {
                targetV = {vx: s.vx * 0.5, vy: s.vy * 0.5};
            } else {
                targetV = {vx: Math.sin(fish.swimPhase) * 5, vy: Math.cos(fish.swimPhase * 1.2) * 2};
            }
        }
        // Seguir dedo (SIEMPRE que haya dedo, sin restricciones)
        else if (fish.desire) {
            const s = this.seek(fish.x, fish.y, fish.desire.x, fish.desire.y, fish.maxSpeed * 0.7);
            const t = this.clamp(s.dist / 120, 0.25, 1);
            targetV = {vx: s.vx * t, vy: s.vy * t};
            if (s.dist < 22) {
                fish.desire = null;
                targetV = {vx: 0, vy: 0};
                // 🔊 SONIDO cuando llega al dedo
                if (this.game.audioManager) {
                    this.game.audioManager.playSound('dedo');
                }
                // 💖 ACTUALIZAR DIVERSIÓN cuando llega al dedo
                this.launchHeartToFun();
            }
        }
        // Crisis aburrimiento sin comida (solo si no hay dedo)
        else if (inBored) {
            const home = {x: this.canvas.width * 0.5, y: this.getFloorY() - 70};
            const s = this.seek(fish.x, fish.y, home.x, home.y, 80);
            speedMul = 0.9;
            if (s.dist > 18) {
                targetV = {vx: s.vx * 0.6, vy: s.vy * 0.6};
            } else {
                targetV = {vx: Math.sin(fish.swimPhase) * 7, vy: Math.cos(fish.swimPhase * 1.5) * 3};
            }
        }
        // Movimiento natural (igual que el demo perfecto)
        else {
            fish.wanderTimer -= deltaTime;
            if (fish.wanderTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                fish.wanderDir.x = Math.cos(angle);
                fish.wanderDir.y = Math.sin(angle) * 0.33; // Factor vertical reducido
                fish.wanderTimer = 0.8 + Math.random() * 1.1;
            }
            const cruise = fish.baseSpeed * 1.1;
            targetV = {
                vx: fish.wanderDir.x * cruise + Math.cos(fish.swimPhase) * 16,
                vy: fish.wanderDir.y * cruise + Math.sin(fish.swimPhase * 1.8) * 16
            };
        }

        // Física (igual que el demo)
        const maxSpeed = fish.maxSpeed * speedMul;
        const maxAccel = fish.maxAccel * speedMul;
        const ax = this.clamp(targetV.vx - fish.vx, -maxAccel, maxAccel);
        const ay = this.clamp(targetV.vy - fish.vy, -maxAccel, maxAccel);
        fish.vx += ax * deltaTime;
        fish.vy += ay * deltaTime;

        fish.x += fish.vx * deltaTime;
        fish.y += fish.vy * deltaTime;

        // Límites ajustados para tu juego (con cabecera)
        const padLeft = 60, padRight = 30, padTop = 125, padBottom = 20; // Aumentado para que baje más
        const W = this.canvas.width;
        const H = this.getFloorY();
        if (fish.x < padLeft) { fish.x = padLeft; if (fish.vx < 0) fish.vx *= -0.5; }
        if (fish.x > W - padRight) { fish.x = W - padRight; if (fish.vx > 0) fish.vx *= -0.5; }
        if (fish.y < padTop) { fish.y = padTop; if (fish.vy < 0) fish.vy *= -0.5; }
        if (fish.y > H - padBottom) { fish.y = H - padBottom; if (fish.vy > 0) fish.vy *= -0.5; }

        // Orientación
        if (Math.abs(fish.vx) > 2) {
            fish.facing = fish.vx > 0 ? 1 : -1;
        }
        
        // Ondulación de aletas
        fish.finRotation = Math.sin(fish.swimPhase) * 0.3;

        // Parpadeo
        fish.eyeOpen = fish.blinkT > 0 ? 0 : 1;

        // Escala de respiración
        fish.breatheScale = 0.94 + Math.sin(fish.swimPhase * 0.5) * 0.06;
    }

    /**
     * 🔄 ORIENTACIÓN DEL PEZ
     */
    updateFishOrientation() {
        const fish = this.game.fish;
        if (!fish) return;
        
        const config = FISH_MOVEMENT_CONFIG;
        
        // Cambiar orientación basada en velocidad
        if (fish.vx > 0.1) {
            fish.facingLeft = false;
        } else if (fish.vx < -0.1) {
            fish.facingLeft = true;
        }
        
        // Actualizar escala de respiración
        const breatheCycle = fish.swimPhase * config.breatheFrequency;
        const breatheRange = config.breatheScale.max - config.breatheScale.min;
        fish.breatheScale = config.breatheScale.min + (Math.sin(breatheCycle) + 1) * 0.5 * breatheRange;
    }

    /**
     * 😢 ESTADO DE ÁNIMO DEL PEZ
     */
    updateFishMood() {
        if (!this.game.fish) return;
        
        const fish = this.game.fish;
        const gameState = this.game.gameState;
        
        // Verificar si está deprimido
        const isDepressed = gameState.needs.hunger > 80 || 
                           gameState.needs.dirt > 80 || 
                           gameState.needs.fun < 20;
        
        fish.isDepressed = isDepressed;
        
        // Cambiar color si está deprimido
        if (isDepressed) {
            fish.depressedTint = Math.min(1, fish.depressedTint + 0.02);
        } else {
            fish.depressedTint = Math.max(0, fish.depressedTint - 0.01);
        }
    }

    /**
     * 👆 MANEJAR CLICK EN CANVAS
     */
    handleCanvasClick(event) {
        console.log('👆 CLICK DETECTADO - Pez:', !!this.game.fish, 'Stage:', this.game.gameState.stage);
        
        if (!this.game.fish || this.game.gameState.stage === 'egg' || this.game.fish.isDepressed) {
            console.log('❌ Click ignorado - Sin pez o en huevo');
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Debug de crisis
        console.log('🔍 DEBUG CRISIS:', {
            hunger: this.game.gameState.crisis.hunger,
            dirt: this.game.gameState.crisis.dirt,
            bored: this.game.gameState.crisis.bored,
            fun: this.game.gameState.needs.fun
        });
        
        // El pez siempre viene al dedo
        console.log('🐠 Pez viene al dedo - Sin restricciones de crisis');
        
        const config = FISH_MOVEMENT_CONFIG;
        
        // Configurar dedo
        const padLeft = 60;
        const padRight = 30;
        const W = this.canvas.width;
        const H = this.canvas.height;
        
        this.game.fish.desire = {
            x: this.clamp(x, padLeft, W - padRight),
            y: this.clamp(y, 125, H - 5)
        };
        
        this.game.fish.fingerBoostT = config.fingerBoostTime;
        this.game.fish.returnToBottom = false;
        this.game.fish.shouldLaunchHeart = true;
        
        console.log('🐠 Dedo configurado:', {
            x: this.game.fish.desire.x,
            y: this.game.fish.desire.y,
            boostTime: config.fingerBoostTime
        });
        
        // Reproducir sonido
        if (this.game.audioManager) {
            this.game.audioManager.playSound('dedo');
        }
        
        console.log('🐠 Dedo configurado:', this.game.fish.desire);
    }

    /**
     * 🎯 FUNCIONES AUXILIARES - COPIADAS DEL CÓDIGO ORIGINAL
     */
    
    // Función seek (del código original)
    seek(fx, fy, tx, ty, maxSpeed) {
        const dx = tx - fx;
        const dy = ty - fy;
        const d = Math.hypot(dx, dy) || 1;
        return {
            vx: dx / d * maxSpeed,
            vy: dy / d * maxSpeed,
            dist: d
        };
    }

    // Función nearestFood (del código original)
    nearestFood() {
        let best = null, bestD = 1e9;
        for (const f of this.game.food) {
            const d = this.dist(this.game.fish.x, this.game.fish.y, f.x, f.y);
            if (d < bestD) {
                bestD = d;
                best = f;
            }
        }
        return best || null;
    }

    // Función getFloorY (del código original)
    getFloorY() {
        const uiBottom = 100;  // ← ajusta si tu barra real es otra
        return this.canvas.height - uiBottom;
    }

    // Función clamp (del código original)
    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    // Función dist (del código original)
    dist(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    // Función emitMouthBubbles (del código original)
    emitMouthBubbles(n = 4, x0, y0) {
        const fish = this.game.fish;
        if (!fish) return;
        
        // Posición de la boca del pez
        const bodyW = fish.size * 0.4;
        const bodyH = fish.size * 0.24;
        const mx = fish.x + (fish.facing > 0 ? 1 : -1) * (bodyW * 0.42);
        const my = fish.y - bodyH * 0.12;
        
        for (let i = 0; i < n; i++) {
            const x = x0 !== undefined ? x0 : mx + (Math.random() - 0.5) * 8;
            const y = y0 !== undefined ? y0 : my + (Math.random() - 0.5) * 8;
            this.game.bubbles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 20 - 15,
                life: 1.0,
                size: 1.5 + Math.random() * 2
            });
        }
    }

    // Función launchHeartToFun (del código original)
    launchHeartToFun(x, y) {
        // IMPORTANTE: Esta función solo debe llamarse cuando el usuario toca al pez
        // NO cuando el pez come
        
        // Si no se pasan coordenadas, usar posición del pez
        const startX = x !== undefined ? x : this.game.fish.x;
        const startY = y !== undefined ? y : this.game.fish.y;
        
        // Crear corazón
        this.game.hearts.push({
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 40,
            vy: -Math.random() * 60 - 30,
            life: 1.0,
            size: 8 + Math.random() * 4
        });
        
        // Actualizar diversión
        if (this.game.needsSystem) {
            this.game.needsSystem.entertainFish(15);
        }
    }
}

// Exportar para uso global
window.FishSystem = FishSystem;
