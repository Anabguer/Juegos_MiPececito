// 🎮 CLASE PRINCIPAL DEL JUEGO
// ===========================
// Motor central que coordina todo

import { GAME_CONFIG } from '../config/gameConfig.js';
import { getFishConfig } from '../config/fishConfig.js';
import { assetLoader, initializeAssets } from '../utils/assetLoader.js';
import { StateManager } from './StateManager.js';
import { SaveSystem } from './SaveSystem.js';
import { FoodSystem } from '../food-system.js';

export class Game {
  constructor(canvasId) {
    // 🎯 Referencias DOM
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d', { 
      alpha: GAME_CONFIG.canvas.alpha,
      antialias: GAME_CONFIG.canvas.antialias 
    });
    
    // 📊 Estado del juego
    this.state = new StateManager();
    this.saveSystem = new SaveSystem();
    
    // ⏱️ Sistema de tiempo
    this.lastFrame = 0;
    this.deltaTime = 0;
    this.running = false;
    
    // 🎯 Sistemas del juego
    this.fish = null;
    this.needs = null;
    this.effects = null;
    
    // 📱 Control táctil
    this.pointer = null;
    this.setupControls();
    
    // 📐 Responsive
    this.setupResize();
  }
  
  // 🚀 Inicializar juego
  async initialize() {
    console.log('🎮 Inicializando Mi Pececito...');
    
    try {
      // 1. Cargar assets críticos
      await initializeAssets();
      
      // 2. Cargar datos guardados
      await this.saveSystem.load();
      
      // 3. Inicializar estado
      this.state.initialize(this.saveSystem.data);
      
      // 4. Configurar sistemas
      await this.setupSystems();
      
      // 5. Iniciar loop
      this.start();
      
      console.log('✅ Juego inicializado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando juego:', error);
      throw error;
    }
  }
  
  // ⚙️ Configurar sistemas del juego
  async setupSystems() {
    try {
      // Importar sistemas
      const { FishManager } = await import('../components/Fish/FishManager.js');
      const { NeedsManager } = await import('../components/Effects/NeedsManager.js');
      const { EffectsManager } = await import('../components/Effects/EffectsManager.js');
      
      // Crear instancias
      this.fish = new FishManager(this);
      this.needs = new NeedsManager(this);
      self.effects = new EffectsManager(this);
      this.food = new FoodSystem(this);
      console.log('✅ Sistemas del juego inicializados');
    } catch (error) {
      console.error('❌ Error inicializando sistemas:', error);
    }
  }
  
  // 🎮 Configurar controles táctiles
  setupControls() {
    // Turbo mode - mantener pulsado
    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointer = { x: e.clientX, y: e.clientY };
      if (this.fish) {
        this.fish.setTarget(this.pointer);
        this.fish.setTurbo(true);
      }
    });
    
    this.canvas.addEventListener('pointermove', (e) => {
      if (this.pointer) {
        this.pointer.x = e.clientX;
        this.pointer.y = e.clientY;
      }
    });
    
    this.canvas.addEventListener('pointerup', () => {
      this.pointer = null;
      if (this.fish) {
        this.fish.setTarget(null);
        this.fish.setTurbo(false);
      }
    });
    
    this.canvas.addEventListener('pointercancel', () => {
      this.pointer = null;
      if (this.fish) {
        this.fish.setTarget(null);
        this.fish.setTurbo(false);
      }
    });
  }
  
  // 📐 Configurar responsive
  setupResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Notificar a sistemas que el tamaño cambió
      if (this.fish) this.fish.onResize();
      if (this.effects) this.effects.onResize();
    };
    
    window.addEventListener('resize', resize);
    resize(); // Llamar inmediatamente
  }
  
  // ▶️ Iniciar loop del juego
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastFrame = performance.now();
    this.gameLoop();
    
    console.log('▶️ Loop del juego iniciado');
  }
  
  // ⏸️ Pausar juego
  pause() {
    this.running = false;
    console.log('⏸️ Juego pausado');
  }
  
  // 🔄 Loop principal del juego (60 FPS)
  gameLoop() {
    if (!this.running) return;
    
    const currentTime = performance.now();
    this.deltaTime = Math.min(0.033, (currentTime - this.lastFrame) / 1000);
    this.lastFrame = currentTime;
    
    // 🔄 Actualizar sistemas
    this.update(this.deltaTime);
    
    // 🎨 Renderizar
    this.render();
    
    // 💾 Auto-guardar (cada minuto)
    this.autoSave();
    
    // ➡️ Siguiente frame
    requestAnimationFrame(() => this.gameLoop());
  }
  
  // 🔄 Actualizar lógica del juego
  update(deltaTime) {
    // Actualizar estado global
    this.state.update(deltaTime);
    
    // Actualizar sistemas
    if (this.food) this.food.update(deltaTime);
    if (this.fish) this.fish.update(deltaTime);
    if (this.needs) this.needs.update(deltaTime);
    if (this.effects) this.effects.update(deltaTime);
    // --- FOOD CHASE INTEGRATION ---
    if (this.food && this.fish && this.fish.currentStage !== 'egg') {
      const pellets = this.food.food;
      if (pellets && pellets.length) {
        const p = this.food.nearestFood();
        if (p) {
          this.fish.setTarget({ x: p.x, y: p.y });
          // turbo si está hambriento (placeholder: usar NeedsManager cuando esté listo)
          const hungry = (this.state && this.state.gameState && this.state.gameState.needs && this.state.gameState.needs.hunger) ?
                          (Date.now() - this.state.gameState.needs.hunger > 4*60*60*1000) : true;
          this.fish.setTurbo(true);
        }
      } else {
        this.fish.setTurbo(false);
      }
    }
    // --- END FOOD CHASE ---

  }
  
  // 🎨 Renderizar frame
  render() {
    // Limpiar canvas
    this.clearCanvas();
    
    // Renderizar fondo
    this.renderBackground();
    
    // Renderizar sistemas
    if (this.effects) this.effects.render(this.ctx);
    if (this.food) this.food.render(this.ctx);
    if (this.fish) this.fish.render(this.ctx);
    if (this.needs) this.needs.render(this.ctx);
  }
  
  // 🧹 Limpiar canvas
  clearCanvas() {
    // Fondo degradado como en los ejemplos
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0b304d');
    gradient.addColorStop(1, '#061726');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // 🏞️ Renderizar fondo
  renderBackground() {
    const currentBg = this.state.getCurrentBackground();
    const bgPath = `./images/backgrounds/bg_${currentBg}.png`;
    const bgAsset = assetLoader.getAsset(bgPath);
    
    if (bgAsset) {
      // Escalar fondo para cubrir toda la pantalla
      this.ctx.drawImage(
        bgAsset, 
        0, 0, 
        this.canvas.width, 
        this.canvas.height
      );
    }
  }
  
  // 💾 Auto-guardar
  autoSave() {
    if (this.state.shouldAutoSave()) {
      this.saveSystem.save(this.state.getData());
    }
  }
  
  // 🎯 API pública para interacciones
  
  // Alimentar pez
  feedFish() {
    if (this.fish && this.state.canFeed()) {
      this.fish.feed();
      this.needs.satisfyNeed('hunger');
      this.state.recordAction('feed');
    }
  }
  
  // Jugar con pez  
  playWithFish() {
    if (this.state.canPlay()) {
      // Abrir pantalla de juegos
      this.openGamesScreen();
      this.needs.satisfyNeed('play');
      this.state.recordAction('play');
    }
  }
  
  // Limpiar pez
  cleanFish() {
    if (this.state.canClean()) {
      this.effects.startCleaningEffect();
      this.needs.satisfyNeed('clean');
      this.state.recordAction('clean');
    }
  }
  
  // Dar medicina
  giveMedicine() {
    if (this.state.canHeal()) {
      this.effects.startHealingEffect();
      this.needs.satisfyNeed('medicine');
      this.state.recordAction('heal');
    }
  }
  
  // Abrir pantalla de juegos
  openGamesScreen() {
    // TODO: Implementar pantalla de juegos
    console.log('🎮 Abriendo pantalla de juegos...');
  }
  
  // Soltar comida (debug/UI)
  dropFood() {
    if (this.food) this.food.dropFood();
  }

  
  // 📊 Obtener información del juego
  getGameInfo() {
    return {
      stage: this.state.getCurrentStage(),
      fishName: this.state.getFishName(),
      eggTime: this.state.getEggElapsedTime(),
      bubbles: this.state.getBubbles(),
      stars: this.state.getStars(),
      needs: this.needs ? this.needs.getCurrentNeeds() : {},
      stats: this.state.getStats(),
      canInteract: this.state.canInteract()
    };
  }
  
  // 🔧 MÉTODOS DE DEBUG
  
  // Colocar primer huevo
  placeFirstEgg(x, y) {
    console.log(`🥚 Colocando primer huevo en (${Math.round(x)}, ${Math.round(y)})`);
    this.state.startNewGame();
    this.state.setEggPosition(x, y);
  }
  
  // Iniciar primer huevo (sin posición específica)
  startFirstEgg() {
    console.log('🥚 Iniciando primer huevo en centro');
    this.state.startNewGame();
    this.state.setEggPosition(this.canvas.width / 2, this.canvas.height / 2);
  }
  
  // Forzar eclosión (últimos 5 segundos)
  setEggTimeToFinalSeconds() {
    const totalTime = 24 * 60 * 60 * 1000; // 24 horas en ms
    const finalSeconds = totalTime - (5 * 1000); // Últimos 5 segundos
    this.state.setEggTime(finalSeconds);
    console.log('🐣 Huevo ajustado a últimos 5 segundos');
  }
  
  // Añadir tiempo
  addTime(milliseconds) {
    this.state.addEggTime(milliseconds);
    console.log(`⏰ +${milliseconds/1000/60/60}h añadidas`);
  }
  
  // Cambiar fondo
  toggleBackground() {
    this.state.nextBackground();
    console.log('🖼️ Fondo cambiado');
  }
  
  // Añadir monedas/estrellas
  addCurrency(type, amount) {
    if (type === 'bubbles') {
      this.state.addBubbles(amount);
    } else if (type === 'stars') {
      this.state.addStars(amount);
    }
    console.log(`💰 +${amount} ${type} añadidas`);
  }
}

// 🌟 FUNCIÓN DE INICIALIZACIÓN GLOBAL
export async function createGame(canvasId = 'gameCanvas') {
  const game = new Game(canvasId);
  await game.initialize();
  return game;
}
