// 📊 GESTOR DE ESTADO DEL JUEGO
// =============================
// Controla toda la lógica de estado y progresión

import { GAME_CONFIG } from '../config/gameConfig.js';

export class StateManager {
  constructor() {
    // 🎯 Estado actual del juego
    this.gameState = {
      // 🐟 Estado del pez
      stage: 'egg',           // egg, baby, young, adult
      fishName: null,
      birthTime: null,
      
      // ⏰ Tiempos
      eggStartTime: Date.now(),
      lastSaveTime: Date.now(),
      lastActiveTime: Date.now(),
      
      // 📊 Necesidades (timestamps de última satisfacción)
      needs: {
        hunger: Date.now(),
        play: Date.now(),
        clean: Date.now(),
        medicine: Date.now()
      },
      
      // 🎮 Progreso de juego
      totalBubbles: 0,
      totalStars: 0,
      gamesUnlocked: ['bubbles'],
      
      // 🎁 Recompensas diarias
      dailyStreak: 0,
      lastDailyReward: null,
      
      // 🏞️ Personalización
      currentBackground: 'basic',
      
      // 📱 Configuración
      settings: {
        vibration: true,
        sound: true
      }
    };
    
    // 🔄 Estado de evolución
    this.evolutionState = {
      isEvolving: false,
      evolutionStartTime: null,
      evolutionDuration: 2000 // 2 segundos de animación
    };
  }
  
  // 🚀 Inicializar con datos guardados
  initialize(savedData = null) {
    if (savedData) {
      // Cargar datos guardados
      this.gameState = { ...this.gameState, ...savedData };
      
      // Validar y ajustar tiempos si es necesario
      this.validateTimes();
    } else {
      // Nuevo juego
      console.log('🆕 Iniciando nuevo juego');
      this.startNewGame();
    }
    
    // Verificar si necesita evolucionar
    this.checkEvolution();
  }
  
  // 🆕 Iniciar nuevo juego
  startNewGame() {
    const now = Date.now();
    
    this.gameState.eggStartTime = now;
    this.gameState.lastSaveTime = now;
    this.gameState.lastActiveTime = now;
    
    // Reiniciar necesidades
    Object.keys(this.gameState.needs).forEach(need => {
      this.gameState.needs[need] = now;
    });
    
    console.log('🥚 Nuevo huevo iniciado');
  }
  
  // ✅ Validar tiempos tras cargar
  validateTimes() {
    const now = Date.now();
    
    // Si el juego estuvo cerrado mucho tiempo, ajustar
    const timeClosed = now - this.gameState.lastActiveTime;
    
    if (timeClosed > 24 * 60 * 60 * 1000) { // Más de 24h
      console.log('⏰ Juego estuvo cerrado más de 24h, ajustando tiempos');
      // Aquí podrías implementar lógica especial
    }
    
    this.gameState.lastActiveTime = now;
  }
  
  // 🔄 Actualizar cada frame
  update(deltaTime) {
    const now = Date.now();
    
    // Verificar evolución
    this.checkEvolution();
    
    // Actualizar animación de evolución
    this.updateEvolution(deltaTime);
    
    // Verificar recompensas diarias
    this.checkDailyReward();
  }
  
  // 🐣 Verificar si debe evolucionar
  checkEvolution() {
    if (this.evolutionState.isEvolving) return;
    
    const now = Date.now();
    const currentStage = this.gameState.stage;
    
    switch (currentStage) {
      case 'egg':
        const eggAge = now - this.gameState.eggStartTime;
        if (eggAge >= GAME_CONFIG.evolution.eggDuration) {
          this.startEvolution('baby');
        }
        break;
        
      case 'baby':
        if (this.gameState.birthTime) {
          const babyAge = now - this.gameState.birthTime;
          if (babyAge >= GAME_CONFIG.evolution.babyDuration) {
            this.startEvolution('young');
          }
        }
        break;
        
      case 'young':
        if (this.gameState.birthTime) {
          const totalAge = now - this.gameState.birthTime;
          const youngThreshold = GAME_CONFIG.evolution.babyDuration + GAME_CONFIG.evolution.youngDuration;
          if (totalAge >= youngThreshold) {
            this.startEvolution('adult');
          }
        }
        break;
    }
  }
  
  // 🎭 Iniciar evolución
  startEvolution(newStage) {
    console.log(`🎭 Evolucionando de ${this.gameState.stage} a ${newStage}`);
    
    this.evolutionState.isEvolving = true;
    this.evolutionState.evolutionStartTime = Date.now();
    this.evolutionState.targetStage = newStage;
    
    // Si es la primera evolución (huevo → bebé), marcar nacimiento
    if (this.gameState.stage === 'egg' && newStage === 'baby') {
      this.gameState.birthTime = Date.now();
    }
    
    // Disparar evento para la UI
    document.dispatchEvent(new CustomEvent('evolutionStart', {
      detail: { from: this.gameState.stage, to: newStage }
    }));
  }
  
  // 🔄 Actualizar animación de evolución
  updateEvolution(deltaTime) {
    if (!this.evolutionState.isEvolving) return;
    
    const elapsed = Date.now() - this.evolutionState.evolutionStartTime;
    
    if (elapsed >= this.evolutionState.evolutionDuration) {
      // Completar evolución
      this.completeEvolution();
    }
  }
  
  // ✅ Completar evolución
  completeEvolution() {
    const oldStage = this.gameState.stage;
    const newStage = this.evolutionState.targetStage;
    
    this.gameState.stage = newStage;
    this.evolutionState.isEvolving = false;
    
    console.log(`✅ Evolución completada: ${oldStage} → ${newStage}`);
    
    // Disparar evento
    document.dispatchEvent(new CustomEvent('evolutionComplete', {
      detail: { from: oldStage, to: newStage }
    }));
    
    // Si evolucionó a bebé, mostrar burbuja de nombre
    if (newStage === 'baby' && !this.gameState.fishName) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('showNameBubble'));
      }, 1000);
    }
  }
  
  // 🥚 Obtener progreso del huevo (0-1)
  getEggProgress() {
    if (this.gameState.stage !== 'egg') return 1;
    
    const elapsed = Date.now() - this.gameState.eggStartTime;
    const progress = Math.min(1, elapsed / GAME_CONFIG.evolution.eggDuration);
    
    return progress;
  }
  
  // 🖼️ Obtener imagen actual del huevo
  getCurrentEggImage() {
    const progress = this.getEggProgress();
    
    if (progress >= 1.0) return GAME_CONFIG.eggStages.final.image;
    if (progress >= 0.75) return GAME_CONFIG.eggStages.stage4.image;
    if (progress >= 0.5) return GAME_CONFIG.eggStages.stage3.image;
    if (progress >= 0.25) return GAME_CONFIG.eggStages.stage2.image;
    
    return GAME_CONFIG.eggStages.stage1.image;
  }
  
  // ⏰ Obtener tiempo restante del huevo
  getEggTimeRemaining() {
    if (this.gameState.stage !== 'egg') return 0;
    
    const elapsed = Date.now() - this.gameState.eggStartTime;
    const remaining = Math.max(0, GAME_CONFIG.evolution.eggDuration - elapsed);
    
    return remaining;
  }
  
  // 🎁 Verificar recompensa diaria
  checkDailyReward() {
    const now = new Date();
    const today = now.toDateString();
    
    if (this.gameState.lastDailyReward !== today) {
      this.grantDailyReward();
      this.gameState.lastDailyReward = today;
    }
  }
  
  // 🎁 Otorgar recompensa diaria
  grantDailyReward() {
    this.gameState.dailyStreak++;
    
    const dayReward = GAME_CONFIG.dailyRewards[`day${Math.min(7, this.gameState.dailyStreak)}`];
    
    if (dayReward) {
      this.gameState.totalBubbles += dayReward.bubbles;
      
      console.log(`🎁 Recompensa día ${this.gameState.dailyStreak}: +${dayReward.bubbles} burbujas`);
      
      // Disparar evento
      document.dispatchEvent(new CustomEvent('dailyReward', {
        detail: { day: this.gameState.dailyStreak, reward: dayReward }
      }));
    }
  }
  
  // 📛 Establecer nombre del pez
  setFishName(name) {
    this.gameState.fishName = name;
    console.log(`🐟 Pez nombrado: ${name}`);
    
    document.dispatchEvent(new CustomEvent('fishNamed', {
      detail: { name }
    }));
  }
  
  // 🎮 Registrar acción del jugador
  recordAction(action) {
    const now = Date.now();
    
    switch (action) {
      case 'feed':
        this.gameState.needs.hunger = now;
        break;
      case 'play':
        this.gameState.needs.play = now;
        break;
      case 'clean':
        this.gameState.needs.clean = now;
        break;
      case 'heal':
        this.gameState.needs.medicine = now;
        break;
    }
    
    this.gameState.lastActiveTime = now;
  }
  
  // 🔍 Verificar si puede realizar acción
  canFeed() { return this.gameState.stage !== 'egg'; }
  canPlay() { return this.gameState.stage !== 'egg'; }
  canClean() { return this.gameState.stage !== 'egg'; }
  canHeal() { return this.gameState.stage !== 'egg'; }
  canInteract() { 
    return this.gameState.stage !== 'egg' && !this.evolutionState.isEvolving;
  }
  
  // 📊 Obtener datos para guardar
  getData() {
    return {
      ...this.gameState,
      lastSaveTime: Date.now()
    };
  }
  
  // 🎯 Getters públicos
  getCurrentStage() { return this.gameState.stage; }
  getFishName() { return this.gameState.fishName; }
  getCurrentBackground() { return this.gameState.currentBackground; }
  isEvolving() { return this.evolutionState.isEvolving; }
  getEvolutionProgress() {
    if (!this.evolutionState.isEvolving) return 0;
    
    const elapsed = Date.now() - this.evolutionState.evolutionStartTime;
    return Math.min(1, elapsed / this.evolutionState.evolutionDuration);
  }
  
  // 📊 Obtener estadísticas
  getStats() {
    return {
      stage: this.gameState.stage,
      totalBubbles: this.gameState.totalBubbles,
      totalStars: this.gameState.totalStars,
      dailyStreak: this.gameState.dailyStreak,
      gamesUnlocked: this.gameState.gamesUnlocked.length
    };
  }
  
  // 💾 Verificar si debe auto-guardar
  shouldAutoSave() {
    const timeSinceLastSave = Date.now() - this.gameState.lastSaveTime;
    return timeSinceLastSave >= GAME_CONFIG.mobile.autoSave;
  }
  
  // 🔧 MÉTODOS DE DEBUG
  
  // Iniciar nuevo juego
  startNewGame() {
    this.gameState.stage = 'egg';
    this.gameState.eggStartTime = Date.now();
    this.gameState.birthTime = null;
    this.gameState.fishName = null;
    console.log('🆕 Nuevo juego iniciado');
  }
  
  // Establecer posición del huevo
  setEggPosition(x, y) {
    this.gameState.eggPosition = { x, y };
    console.log(`🥚 Huevo posicionado en (${Math.round(x)}, ${Math.round(y)})`);
  }
  
  // Establecer tiempo del huevo
  setEggTime(elapsed) {
    this.gameState.eggStartTime = Date.now() - elapsed;
    console.log(`⏰ Tiempo del huevo ajustado a ${Math.round(elapsed/1000)}s`);
  }
  
  // Añadir tiempo al huevo
  addEggTime(milliseconds) {
    this.gameState.eggStartTime -= milliseconds;
    console.log(`⏰ +${Math.round(milliseconds/1000/60/60)}h añadidas`);
  }
  
  // Obtener tiempo transcurrido del huevo
  getEggElapsedTime() {
    if (this.gameState.stage !== 'egg') return 0;
    return Date.now() - this.gameState.eggStartTime;
  }
  
  // Cambiar fondo
  nextBackground() {
    const backgrounds = ['basic', 'cartoon', 'coral', 'mario', 'minecraft'];
    const current = backgrounds.indexOf(this.gameState.currentBackground);
    const next = (current + 1) % backgrounds.length;
    this.gameState.currentBackground = backgrounds[next];
    console.log(`🖼️ Fondo cambiado a: ${this.gameState.currentBackground}`);
  }
  
  // Obtener burbujas
  getBubbles() {
    return this.gameState.totalBubbles || 0;
  }
  
  // Obtener estrellas
  getStars() {
    return this.gameState.totalStars || 0;
  }
  
  // Añadir burbujas
  addBubbles(amount) {
    this.gameState.totalBubbles = (this.gameState.totalBubbles || 0) + amount;
  }
  
  // Añadir estrellas
  addStars(amount) {
    this.gameState.totalStars = (this.gameState.totalStars || 0) + amount;
  }
}
