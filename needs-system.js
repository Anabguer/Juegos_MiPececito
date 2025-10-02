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
     * 🍎 ALIMENTAR PEZ
     */
    feedFish() {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const hungerDecrease = config.hunger.decrease;
        
        this.game.gameState.needs.hunger = Math.max(0, this.game.gameState.needs.hunger - hungerDecrease);
        
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
            newHunger: this.game.gameState.needs.hunger.toFixed(1)
        });
    }

    /**
     * 🧹 LIMPIAR PEZ
     */
    cleanFish() {
        if (this.game.gameState.stage === 'egg') return;
        
        const config = this.getNeedsConfig();
        const dirtDecrease = config.dirt.decrease;
        
        this.game.gameState.needs.dirt = Math.max(0, this.game.gameState.needs.dirt - dirtDecrease);
        
        // Mostrar mensaje
        if (this.game.showFishMessage) {
            this.game.showFishMessage('¡Me siento más limpio!', '#44ff44');
        }
        
        // Reproducir sonido
        if (this.game.audioManager) {
            this.game.audioManager.playSound('limpiar');
        }
        
        // Actualizar UI
        this.updateNeedBars();
        this.updateCrisisFlags();
        
        console.log('🧹 PEZ LIMPIADO:', {
            stage: this.game.gameState.stage,
            dirtDecrease: dirtDecrease,
            newDirt: this.game.gameState.needs.dirt.toFixed(1)
        });
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