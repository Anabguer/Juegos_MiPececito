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

console.log('🐠 Fish System cargado');

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

class FishSystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
    }

    /**
     * 🎨 DIBUJAR PEZ
     */
    drawFish() {
        if (!this.game.fish) return;
        
        const fish = this.game.fish;
        const ctx = this.ctx;
        
        // Guardar estado del contexto
        ctx.save();
        
        // Aplicar transformaciones
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.breatheScale, fish.breatheScale);
        
        if (fish.facingLeft) {
            ctx.scale(-1, 1);
        }
        
        // Dibujar cuerpo del pez
        this.drawFishBody(fish, ctx);
        
        // Dibujar ojos
        this.drawFishEyes(fish, ctx);
        
        // Restaurar estado del contexto
        ctx.restore();
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
    getFishColors(stage) {
        const colors = {
            baby: {
                body: '#d9ccff',
                tail: '#ff9ecf',
                fin: '#ffd0e2',
                stripe: '#ffba7a'
            },
            young: {
                body: '#b1a1ff',
                tail: '#f191cd',
                fin: '#f1c4e4',
                stripe: '#ffa960'
            },
            adult: {
                body: '#5a48c8',
                tail: '#e91e63',
                fin: '#f8bbd9',
                stripe: '#ff9800'
            }
        };
        
        return colors[stage] || colors.baby;
    }

    /**
     * 🐟 MOVIMIENTO DEL PEZ
     */
    updateFishMovement(deltaTime) {
        if (!this.game.fish) return;
        
        const fish = this.game.fish;
        const canvas = this.canvas;
        const config = FISH_MOVEMENT_CONFIG;
        
        // Aplicar velocidad
        fish.x += fish.vx * deltaTime;
        fish.y += fish.vy * deltaTime;
        
        // Mantener dentro de límites
        const padLeft = 60;
        const padRight = 30;
        const padTop = 125;
        const padBottom = 5;
        
        fish.x = Math.max(padLeft, Math.min(canvas.width - padRight, fish.x));
        fish.y = Math.max(padTop, Math.min(canvas.height - padBottom, fish.y));
        
        // Aplicar fricción
        fish.vx *= config.friction;
        fish.vy *= config.friction;
        
        // Actualizar fase de nado
        fish.swimPhase += deltaTime * 2;
        
        // Actualizar orientación
        this.updateFishOrientation();
        
        // Debug de movimiento (cada 2 segundos)
        if (Math.floor(fish.swimPhase) % 4 === 0 && Math.random() < 0.01) {
            console.log('🐠 MOVIMIENTO:', {
                x: fish.x.toFixed(1),
                y: fish.y.toFixed(1),
                vx: fish.vx.toFixed(1),
                vy: fish.vy.toFixed(1),
                speed: Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy).toFixed(1)
            });
        }
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
            x: this.game.clamp(x, padLeft, W - padRight),
            y: this.game.clamp(y, 125, H - 5)
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
}

// Exportar para uso global
window.FishSystem = FishSystem;
