/**
 * 🎯 SISTEMA DE NECESIDADES - REFACTORIZADO
 * 
 * Este archivo contiene toda la lógica relacionada con las necesidades del pez:
 * - Hambre
 * - Limpieza
 * - Diversión
 * - Crisis y alertas
 * - Barras de progreso
 * 
 * 📊 PARÁMETROS DE NECESIDADES POR ETAPA:
 * 
 * 🥚 HUEVO (0-2 horas):
 * - Hambre: 0% (no come)
 * - Limpieza: 0% (no se ensucia)
 * - Diversión: 100% (no se aburre)
 * 
 * 🐟 BEBÉ (2-8 horas):
 * - Hambre: +0.8% por segundo (muy hambriento)
 * - Limpieza: +0.4% por segundo (se ensucia rápido)
 * - Diversión: -0.3% por segundo (se aburre rápido)
 * 
 * 🐠 JOVEN (8-24 horas):
 * - Hambre: +0.5% por segundo (hambriento)
 * - Limpieza: +0.3% por segundo (se ensucia normal)
 * - Diversión: -0.2% por segundo (se aburre normal)
 * 
 * 👑 ADULTO (24+ horas):
 * - Hambre: +0.3% por segundo (hambriento lento)
 * - Limpieza: +0.2% por segundo (se ensucia lento)
 * - Diversión: -0.1% por segundo (se aburre lento)
 * 
 * 🚨 CRISIS:
 * - Hambre: >75% = crisis
 * - Limpieza: >75% = crisis
 * - Diversión: <25% = crisis (aburrido)
 */

// 📊 CONFIGURACIÓN DE NECESIDADES POR ETAPA
const NEEDS_CONFIG = {
    // 🥚 HUEVO (0-2 horas)
    egg: {
        hunger: {
            increase: 0,      // No tiene hambre
            decrease: 0,      // No come
            crisis: 100       // Nunca en crisis
        },
        dirt: {
            increase: 0,      // No se ensucia
            decrease: 0,      // No se limpia
            crisis: 100       // Nunca en crisis
        },
        fun: {
            increase: 0,      // No se divierte
            decrease: 0,      // No se aburre
            crisis: 0         // Nunca en crisis
        }
    },
    
    // 🐟 BEBÉ (2-8 horas)
    baby: {
        hunger: {
            increase: 0.8,    // +0.8% por segundo (muy hambriento)
            decrease: 30,     // -30% al comer
            crisis: 75        // Crisis a 75%
        },
        dirt: {
            increase: 0.4,    // +0.4% por segundo (se ensucia rápido)
            decrease: 40,     // -40% al limpiar
            crisis: 75        // Crisis a 75%
        },
        fun: {
            increase: 25,     // +25% al divertirse
            decrease: 0.3,    // -0.3% por segundo (se aburre rápido)
            crisis: 25        // Crisis a 25%
        }
    },
    
    // 🐠 JOVEN (8-24 horas)
    young: {
        hunger: {
            increase: 0.5,    // +0.5% por segundo (hambriento)
            decrease: 30,     // -30% al comer
            crisis: 75        // Crisis a 75%
        },
        dirt: {
            increase: 0.3,    // +0.3% por segundo (se ensucia normal)
            decrease: 40,     // -40% al limpiar
            crisis: 75        // Crisis a 75%
        },
        fun: {
            increase: 25,     // +25% al divertirse
            decrease: 0.2,    // -0.2% por segundo (se aburre normal)
            crisis: 25        // Crisis a 25%
        }
    },
    
    // 👑 ADULTO (24+ horas)
    adult: {
        hunger: {
            increase: 0.3,    // +0.3% por segundo (hambriento lento)
            decrease: 30,     // -30% al comer
            crisis: 75        // Crisis a 75%
        },
        dirt: {
            increase: 0.2,    // +0.2% por segundo (se ensucia lento)
            decrease: 40,     // -40% al limpiar
            crisis: 75        // Crisis a 75%
        },
        fun: {
            increase: 25,     // +25% al divertirse
            decrease: 0.1,    // -0.1% por segundo (se aburre lento)
            crisis: 25        // Crisis a 25%
        }
    }
};

console.log('🎯 Needs System cargado');
console.log('🎯 CONFIGURACIÓN DE NECESIDADES:', NEEDS_CONFIG);

class NeedsSystem {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.lastAlertTime = 0;
    }

    /**
     * 📊 OBTENER CONFIGURACIÓN DE NECESIDADES SEGÚN LA ETAPA
     */
    getNeedsConfig() {
        const stage = this.game.gameState.stage;
        return NEEDS_CONFIG[stage] || NEEDS_CONFIG.baby;
    }

    /**
     * 🚨 ACTUALIZAR BANDERAS DE CRISIS
     */
    updateCrisisFlags() {
        const config = this.getNeedsConfig();
        const needs = this.game.gameState.needs;
        
        this.game.gameState.crisis.hunger = needs.hunger >= config.hunger.crisis;
        this.game.gameState.crisis.dirt = needs.dirt >= config.dirt.crisis;
        this.game.gameState.crisis.bored = needs.fun <= config.fun.crisis;
        
        // Debug de crisis
        if (this.game.gameState.crisis.hunger || this.game.gameState.crisis.dirt || this.game.gameState.crisis.bored) {
            console.log('🚨 CRISIS DETECTADA:', {
                hunger: this.game.gameState.crisis.hunger,
                dirt: this.game.gameState.crisis.dirt,
                bored: this.game.gameState.crisis.bored,
                needs: needs
            });
        }
    }

    /**
     * 📊 ACTUALIZAR BARRAS DE NECESIDADES
     */
    updateNeedBars() {
        // Actualizar barra de hambre
        this.updateNeedBar('hunger', this.game.gameState.needs.hunger);
        
        // Actualizar barra de limpieza
        this.updateNeedBar('dirt', this.game.gameState.needs.dirt);
        
        // Actualizar barra de diversión
        this.updateNeedBar('fun', this.game.gameState.needs.fun);
    }

    /**
     * 📊 ACTUALIZAR BARRA INDIVIDUAL
     */
    updateNeedBar(needType, value) {
        const bar = document.getElementById(`${needType}Bar`);
        if (!bar) return;
        
        const percentage = Math.max(0, Math.min(100, value));
        bar.style.width = `${percentage}%`;
        
        // Cambiar color según el nivel
        if (percentage > 75) {
            bar.style.background = 'linear-gradient(90deg, #ff4444, #ff6666)';
        } else if (percentage > 50) {
            bar.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc44)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #44ff44, #66ff66)';
        }
    }

    /**
     * 🍎 ACTUALIZAR SISTEMA DE HAMBRE
     */
    updateHunger(deltaTime) {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const hungerIncrease = config.hunger.increase * deltaTime;
        
        this.game.gameState.needs.hunger = Math.min(100, this.game.gameState.needs.hunger + hungerIncrease);
        
        // Si está muy hambriento, mostrar alerta
        if (this.game.gameState.needs.hunger > config.hunger.crisis) {
            this.showNeedAlert('hunger', '¡Tengo mucha hambre!');
        }
        
        // Debug de hambre (cada 5 segundos)
        if (Math.floor(Date.now() / 5000) % 2 === 0 && Math.random() < 0.01) {
            console.log('🍎 HAMBRE:', {
                stage: this.game.gameState.stage,
                current: this.game.gameState.needs.hunger.toFixed(1),
                increase: hungerIncrease.toFixed(3),
                crisis: config.hunger.crisis
            });
        }
    }

    /**
     * 🧹 ACTUALIZAR SISTEMA DE LIMPIEZA
     */
    updateCleaning(deltaTime) {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const dirtIncrease = config.dirt.increase * deltaTime;
        
        this.game.gameState.needs.dirt = Math.min(100, this.game.gameState.needs.dirt + dirtIncrease);
        
        // Si está muy sucio, mostrar alerta
        if (this.game.gameState.needs.dirt > config.dirt.crisis) {
            this.showNeedAlert('dirt', '¡Estoy muy sucio!');
        }
        
        // Debug de limpieza (cada 5 segundos)
        if (Math.floor(Date.now() / 5000) % 2 === 0 && Math.random() < 0.01) {
            console.log('🧹 LIMPIEZA:', {
                stage: this.game.gameState.stage,
                current: this.game.gameState.needs.dirt.toFixed(1),
                increase: dirtIncrease.toFixed(3),
                crisis: config.dirt.crisis
            });
        }
    }

    /**
     * 🎮 ACTUALIZAR SISTEMA DE DIVERSIÓN
     */
    updateFun(deltaTime) {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const funDecrease = config.fun.decrease * deltaTime;
        
        this.game.gameState.needs.fun = Math.max(0, this.game.gameState.needs.fun - funDecrease);
        
        // Si está muy aburrido, mostrar alerta
        if (this.game.gameState.needs.fun < config.fun.crisis) {
            this.showNeedAlert('fun', '¡Estoy muy aburrido!');
        }
        
        // Debug de diversión (cada 5 segundos)
        if (Math.floor(Date.now() / 5000) % 2 === 0 && Math.random() < 0.01) {
            console.log('🎮 DIVERSIÓN:', {
                stage: this.game.gameState.stage,
                current: this.game.gameState.needs.fun.toFixed(1),
                decrease: funDecrease.toFixed(3),
                crisis: config.fun.crisis
            });
        }
    }

    /**
     * 🚨 MOSTRAR ALERTA DE NECESIDAD
     */
    showNeedAlert(needType, message) {
        // Evitar spam de alertas
        const now = Date.now();
        if (this.lastAlertTime && now - this.lastAlertTime < 5000) return;
        
        this.lastAlertTime = now;
        
        // Mostrar mensaje del pez
        if (this.game.showFishMessage) {
            this.game.showFishMessage(message, '#ff4444');
        }
        
        // Reproducir sonido de alerta
        if (this.game.audioManager) {
            this.game.audioManager.playSound('fail');
        }
    }

    /**
     * 🍎 ALIMENTAR PEZ - FUNCIÓN COMPLETA
     */
    feedFish() {
        if (!this.game.fish || this.game.gameState.stage === 'egg') return;
        
        // Actualizar tiempo de última comida
        this.game.fish.lastFeedTime = Date.now();
        
        // Ocultar burbuja de hambre
        const hungerBubble = document.getElementById('hungerBubble');
        if (hungerBubble) {
            hungerBubble.style.display = 'none';
        }
        
        // Reducir hambre usando configuración por etapa
        const config = this.getNeedsConfig();
        const hungerDecrease = config.hunger.decrease;
        this.game.gameState.needs.hunger = Math.max(0, this.game.gameState.needs.hunger - hungerDecrease);
        
        // 🦠 ENSUSIAR EL AGUA AL COMER (usando configuración por etapa)
        const stageConfig = this.getStageCfg(this.game.gameState);
        const dirtIncrease = stageConfig.dirtPerPellet;
        this.game.gameState.needs.dirt = Math.min(100, this.game.gameState.needs.dirt + dirtIncrease);
        
        console.log(`🦠 Agua ensuciada al comer: +${dirtIncrease}% (total: ${this.game.gameState.needs.dirt.toFixed(1)}%)`);
        
        // Efectos de alimentación
        this.createFeedingEffects();
        
        // Aumentar felicidad
        this.game.gameState.happiness = Math.min(100, this.game.gameState.happiness + 20);
        
        // Mostrar mensaje
        if (this.game.showFishMessage) {
            this.game.showFishMessage('¡Gracias por la comida!', '#44ff44');
        }
        
        // Reproducir sonido
        if (this.game.audioManager) {
            this.game.audioManager.playSound('comer');
        }
        
        // Actualizar UI
        this.updateNeedBars();
        this.updateCrisisFlags();
        
        console.log('🍎 PEZ ALIMENTADO:', {
            stage: this.game.gameState.stage,
            hungerDecrease: hungerDecrease,
            newHunger: this.game.gameState.needs.hunger.toFixed(1),
            happiness: this.game.gameState.happiness
        });
    }
    
    /**
     * ✨ CREAR EFECTOS DE ALIMENTACIÓN
     */
    createFeedingEffects() {
        // Crear partículas de comida cayendo
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                if (this.game.labels) {
                    this.game.labels.push({
                        x: this.game.fish.x + (Math.random() - 0.5) * 40,
                        y: this.game.fish.y - 20,
                        text: "¡Ñam!",
                        a: 1,
                        vy: -30,
                        life: 1.5
                    });
                }
            }, i * 100);
        }
    }

    /**
     * 🧹 LIMPIAR PEZ - SISTEMA COMPLETO
     */
    cleanFish() {
        if (this.game.gameState.stage === 'egg') return;
        
        console.log('🧹 ¡INICIANDO LIMPIEZA COMPLETA!');
        
        const config = this.getNeedsConfig();
        const dirtDecrease = config.dirt.decrease;
        const wasReallyDirty = this.game.gameState.needs.dirt > 15;
        
        // 🫧 DAR BURBUJAS SI ESTABA SUCIO
        if (wasReallyDirty) {
            this.game.gameState.bubbles += 3;
            console.log(`🫧 +3 burbujas por limpiar cuando estaba sucio (suciedad previa: ${this.game.gameState.needs.dirt.toFixed(1)}%)`);
            
            // 🎆 EFECTO VISUAL DE BURBUJAS AL CONTADOR
            if (this.game.createBubbleEffect) {
                this.game.createBubbleEffect(3);
            }
        }
        
        // 🎯 REDUCIR SUCIEDAD
        this.game.gameState.needs.dirt = Math.max(0, this.game.gameState.needs.dirt - dirtDecrease);
        
        // 🐟 EFECTO EN EL PEZ
        if (this.game.fish) { 
            this.game.fish.happyBurst = 3.2; 
            this.game.fish.spinKind = "clean"; 
        }
        
        // 🫧 CREAR BURBUJAS DE LIMPIEZA
        this.createCleaningBubbles();
        
        // 🔊 SONIDO DE LIMPIEZA
        if (this.game.audioManager) {
            this.game.audioManager.playSound('limpiar');
        }
        
        // Mostrar mensaje
        if (this.game.showFishMessage) {
            this.game.showFishMessage('¡Me siento más limpio!', '#44ff44');
        }
        
        // Actualizar UI
        this.updateNeedBars();
        this.updateCrisisFlags();
        
        console.log('🧹 PEZ LIMPIADO:', {
            stage: this.game.gameState.stage,
            dirtDecrease: dirtDecrease,
            newDirt: this.game.gameState.needs.dirt.toFixed(1),
            wasReallyDirty: wasReallyDirty
        });
    }
    
    /**
     * 🫧 CREAR BURBUJAS DE LIMPIEZA
     */
    createCleaningBubbles() {
        // Inicializar array si no existe
        if (!this.game.cleanBubbles) {
            this.game.cleanBubbles = [];
        }
        
        const W = this.game.canvas.width;
        const H = this.game.canvas.height;
        
        // Crear ráfaga de burbujas
        for (let i = 0; i < 50; i++) {
            this.game.cleanBubbles.push({
                x: 30 + Math.random() * (W - 60),
                y: H * 0.8 + Math.random() * (H * 0.15),
                vx: (Math.random() - 0.5) * 20,
                vy: -Math.random() * 100 - 50,
                life: 2.0 + Math.random() * 1.0,
                size: 3 + Math.random() * 5,
                alpha: 0.8 + Math.random() * 0.2
            });
        }
        
        console.log(`🫧 ${this.game.cleanBubbles.length} burbujas de limpieza creadas`);
    }
    
    /**
     * 🫧 ACTUALIZAR BURBUJAS DE LIMPIEZA
     */
    updateCleaningBubbles(deltaTime) {
        if (!this.game.cleanBubbles) return;
        
        for (let i = this.game.cleanBubbles.length - 1; i >= 0; i--) {
            const bubble = this.game.cleanBubbles[i];
            
            // Actualizar posición
            bubble.x += bubble.vx * deltaTime;
            bubble.y += bubble.vy * deltaTime;
            bubble.life -= deltaTime;
            
            // Eliminar burbujas muertas
            if (bubble.life <= 0) {
                this.game.cleanBubbles.splice(i, 1);
            }
        }
    }
    
    /**
     * 🫧 DIBUJAR BURBUJAS DE LIMPIEZA
     */
    drawCleaningBubbles() {
        if (!this.game.cleanBubbles || !this.game.ctx) return;
        
        this.game.ctx.save();
        
        for (const bubble of this.game.cleanBubbles) {
            this.game.ctx.globalAlpha = bubble.alpha * bubble.life;
            this.game.ctx.fillStyle = `hsl(${180 + Math.random() * 40}, 70%, 80%)`;
            this.game.ctx.beginPath();
            this.game.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.game.ctx.fill();
        }
        
        this.game.ctx.restore();
    }
    
    /**
     * 🦠 DIBUJAR EFECTO DE SUCIEDAD
     */
    drawDirtyEffect() {
        if (!this.game.ctx) return;
        
        const dirtValue = this.game.gameState.needs.dirt; // 0-100
        
        if (dirtValue > 15) { // Efecto visual más temprano
            // Calcular nivel de suciedad (0 a 1)
            const dirtLevel = Math.min((dirtValue - 15) / 85, 1); // Escala desde 15-100
            
            // Crear overlay de suciedad MÁS SUTIL
            this.game.ctx.save();
            this.game.ctx.globalAlpha = dirtLevel * 0.15; // Máximo 15% opacidad (más sutil)
            this.game.ctx.globalCompositeOperation = 'multiply';
            
            // Gradiente de suciedad
            const gradient = this.game.ctx.createRadialGradient(
                this.game.canvas.width / 2, this.game.canvas.height / 2, 0,
                this.game.canvas.width / 2, this.game.canvas.height / 2, this.game.canvas.width
            );
            gradient.addColorStop(0, 'rgba(139, 115, 85, 0.2)'); // Marrón claro centro
            gradient.addColorStop(0.7, 'rgba(101, 67, 33, 0.4)'); // Marrón medio
            gradient.addColorStop(1, 'rgba(62, 39, 35, 0.6)'); // Marrón oscuro bordes
            
            this.game.ctx.fillStyle = gradient;
            this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            
            // Partículas de suciedad flotando
            if (!this.game.dirtParticles) this.game.dirtParticles = [];
            
            // Crear partículas ocasionalmente
            if (Math.random() < 0.02 * dirtLevel) {
                this.game.dirtParticles.push({
                    x: Math.random() * this.game.canvas.width,
                    y: Math.random() * this.game.canvas.height,
                    size: 1 + Math.random() * 3,
                    life: 5 + Math.random() * 5,
                    maxLife: 5 + Math.random() * 5,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10
                });
            }
            
            // Dibujar partículas de suciedad
            this.game.ctx.globalCompositeOperation = 'source-over';
            this.game.ctx.globalAlpha = Math.min(0.9, dirtLevel * 2.0); // MUCHO MÁS OPACO
            
            for (let i = this.game.dirtParticles.length - 1; i >= 0; i--) {
                const particle = this.game.dirtParticles[i];
                
                // Actualizar partícula
                particle.x += particle.vx * (1/60);
                particle.y += particle.vy * (1/60);
                particle.life -= 1/60;
                
                // Eliminar si expiró
                if (particle.life <= 0) {
                    this.game.dirtParticles.splice(i, 1);
                    continue;
                }
                
                // Dibujar partícula sucia
                const alpha = particle.life / particle.maxLife;
                this.game.ctx.globalAlpha = alpha * dirtLevel * 1.5; // MUCHO MÁS DENSA
                this.game.ctx.fillStyle = '#8b7355';
                this.game.ctx.beginPath();
                this.game.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.game.ctx.fill();
            }
            
            this.game.ctx.restore();
            
            // OVERLAY GENERAL DE SUCIEDAD (agua SUPER turbia como algas)
            this.game.ctx.globalAlpha = Math.min(0.8, dirtLevel * 1.5); // MUCHO más denso
            
            // Gradiente marrón-verde como algas
            const dirtGradient = this.game.ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
            dirtGradient.addColorStop(0, 'rgba(139, 115, 85, 0.6)'); // Marrón arriba
            dirtGradient.addColorStop(0.5, 'rgba(101, 67, 33, 0.8)'); // Marrón oscuro medio
            dirtGradient.addColorStop(1, 'rgba(46, 125, 50, 0.7)'); // Verde algas abajo
            
            this.game.ctx.fillStyle = dirtGradient;
            this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            this.game.ctx.globalAlpha = 1;
            
            // Log ocasional
            if (Math.random() < 0.005) {
                console.log(`🦠 Pecera sucia - Nivel: ${dirtValue.toFixed(1)}% (sistema unificado)`);
            }
        } else {
            // Limpiar partículas cuando no está sucio
            if (this.game.dirtParticles) {
                this.game.dirtParticles = [];
            }
        }
    }

    /**
     * ⚙️ OBTENER CONFIGURACIÓN POR ETAPA
     */
    getStageCfg(state) {
        const STAGE_RATES = {
            baby:  { hungerHours: 2, dirtHours: 4, funHours: 6, eatReduce: 30, dirtPerPellet: 3, dirtPerRotten: 6 },
            young: { hungerHours: 6, dirtHours: 8, funHours: 8, eatReduce: 25, dirtPerPellet: 2, dirtPerRotten: 5 },
            adult: { hungerHours: 8, dirtHours:10, funHours: 10, eatReduce: 20, dirtPerPellet: 1, dirtPerRotten: 4 },
        };
        const st = (state && state.stage) || 'baby';
        return STAGE_RATES[st] || STAGE_RATES.baby;
    }

    /**
     * 🎮 DIVERTIR PEZ
     */
    entertainFish(amount = null) {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const funIncrease = amount || config.fun.increase;
        
        this.game.gameState.needs.fun = Math.min(100, this.game.gameState.needs.fun + funIncrease);
        
        // Mostrar mensaje
        if (this.game.showFishMessage) {
            this.game.showFishMessage('¡Me divierto mucho contigo!', '#44ff44');
        }
        
        // Reproducir sonido
        if (this.game.audioManager) {
            this.game.audioManager.playSound('acierto');
        }
        
        // Actualizar UI
        this.updateNeedBars();
        this.updateCrisisFlags();
        
        console.log('🎮 PEZ DIVERTIDO:', {
            stage: this.game.gameState.stage,
            funIncrease: funIncrease,
            newFun: this.game.gameState.needs.fun.toFixed(1)
        });
    }

    /**
     * 🔄 ACTUALIZAR TODAS LAS NECESIDADES
     */
    updateAllNeeds(deltaTime) {
        this.updateHunger(deltaTime);
        this.updateCleaning(deltaTime);
        this.updateCleaningBubbles(deltaTime);
        this.updateFun(deltaTime);
        this.updateCrisisFlags();
        this.updateNeedBars();
    }

    /**
     * 📊 MOSTRAR ESTADÍSTICAS DE NECESIDADES
     */
    showNeedsStats() {
        const config = this.getNeedsConfig();
        const needs = this.game.gameState.needs;
        
        console.log('📊 ESTADÍSTICAS DE NECESIDADES:', {
            stage: this.game.gameState.stage,
            hunger: {
                current: needs.hunger.toFixed(1),
                increase: config.hunger.increase,
                crisis: config.hunger.crisis
            },
            dirt: {
                current: needs.dirt.toFixed(1),
                increase: config.dirt.increase,
                crisis: config.dirt.crisis
            },
            fun: {
                current: needs.fun.toFixed(1),
                decrease: config.fun.decrease,
                crisis: config.fun.crisis
            }
        });
    }
}

// Exportar para uso global
window.NeedsSystem = NeedsSystem;