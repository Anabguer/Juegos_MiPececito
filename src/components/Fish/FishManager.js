// 🐟 GESTOR DE PECES
// ==================
// Coordina toda la lógica y renderizado de peces

import { EggRenderer } from './EggRenderer.js';
import { EggTimer } from '../UI/EggTimer.js';

export class FishManager {
  constructor(game) {
    this.game = game;
    
    // 🥚 Sistema de huevo
    this.eggRenderer = new EggRenderer(game);
    this.eggTimer = new EggTimer(game);
    
    // 🐟 Sistema de pez (se inicializa tras eclosión)
    this.fishRenderer = null;
    
    // 🎯 Estado actual
    this.currentStage = 'egg';
    
    // 🎮 Configurar eventos
    this.setupEvents();
  }
  
  // ⚙️ Configurar eventos
  setupEvents() {
    // Eventos de evolución
    document.addEventListener('evolutionStart', (e) => {
      this.onEvolutionStart(e.detail);
    });
    
    document.addEventListener('evolutionComplete', (e) => {
      this.onEvolutionComplete(e.detail);
    });
    
    // Eventos de eclosión
    document.addEventListener('hatchStart', () => {
      this.onHatchStart();
    });
    
    document.addEventListener('hatchComplete', () => {
      this.onHatchComplete();
    });
    
    // Click en timer de huevo
    this.game.canvas.addEventListener('pointerdown', (e) => {
      if (this.currentStage === 'egg') {
        this.eggTimer.handleClick(e.clientX, e.clientY);
      }
    });
  }
  
  // 🔄 Actualizar
  update(deltaTime) {
    this.currentStage = this.game.state.getCurrentStage();
    
    // Actualizar según etapa
    switch (this.currentStage) {
      case 'egg':
        this.eggRenderer.update(deltaTime);
        this.eggTimer.update(deltaTime);
        break;
        
      case 'baby':
      case 'young':
      case 'adult':
        if (this.fishRenderer) {
          this.fishRenderer.update(deltaTime);
        }
        break;
    }
  }
  
  // 🎨 Renderizar
  render(ctx) {
    switch (this.currentStage) {
      case 'egg':
        this.eggRenderer.render(ctx);
        this.eggTimer.render(ctx);
        break;
        
      case 'baby':
      case 'young':
      case 'adult':
        if (this.fishRenderer) {
          this.fishRenderer.render(ctx);
        }
        break;
    }
  }
  
  // 🎭 Manejar inicio de evolución
  onEvolutionStart(detail) {
    console.log(`🎭 Iniciando evolución: ${detail.from} → ${detail.to}`);
    
    if (detail.from === 'egg') {
      // Preparar transición de huevo a bebé
      this.prepareHatchTransition();
    }
  }
  
  // ✅ Manejar evolución completada
  onEvolutionComplete(detail) {
    console.log(`✅ Evolución completada: ${detail.from} → ${detail.to}`);
    
    this.currentStage = detail.to;
    
    if (detail.to !== 'egg' && !this.fishRenderer) {
      this.createFishRenderer(detail.to);
    } else if (this.fishRenderer) {
      this.fishRenderer.setStage(detail.to);
    }
  }
  
  // 🐣 Preparar transición de eclosión
  prepareHatchTransition() {
    // Importar dinámicamente el renderizador de pez
    import('./FishRenderer.js').then(({ FishRenderer }) => {
      this.fishRenderer = new FishRenderer(this.game);
      this.fishRenderer.setStage('baby');
      this.fishRenderer.setVisible(false); // Inicialmente invisible
    });
  }
  
  // 🐣 Manejar inicio de eclosión
  onHatchStart() {
    console.log('🐣 Iniciando eclosión visual');
    
    // Efectos visuales adicionales si es necesario
    document.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: '¡Nace el pececito! 🐣➡️🐟', duration: 2000 }
    }));
  }
  
  // ✅ Manejar eclosión completada
  onHatchComplete() {
    console.log('✅ Eclosión visual completada');
    
    // Hacer visible el pez
    if (this.fishRenderer) {
      this.fishRenderer.setVisible(true);
      this.fishRenderer.playBirthAnimation();
    }
  }
  
  // 🐟 Crear renderizador de pez
  createFishRenderer(stage) {
    import('./FishRenderer.js').then(({ FishRenderer }) => {
      this.fishRenderer = new FishRenderer(this.game);
      this.fishRenderer.setStage(stage);
      this.fishRenderer.setVisible(true);
    });
  }
  
  // 🎯 API para interacciones
  
  // Establecer objetivo para el pez
  setTarget(target) {
    if (this.fishRenderer && this.currentStage !== 'egg') {
      this.fishRenderer.setTarget(target);
    }
  }
  
  // Activar modo turbo
  setTurbo(active) {
    if (this.fishRenderer && this.currentStage !== 'egg') {
      this.fishRenderer.setTurbo(active);
      
      // Disparar evento para UI
      if (active) {
        document.dispatchEvent(new CustomEvent('turboStart'));
      } else {
        document.dispatchEvent(new CustomEvent('turboEnd'));
      }
    }
  }
  
  // Alimentar pez
  feed() {
    if (this.fishRenderer && this.currentStage !== 'egg') {
      this.fishRenderer.startFeedingAnimation();
    }
  }
  
  // 📐 Redimensionar
  onResize() {
    this.eggRenderer.onResize();
    this.eggTimer.onResize();
    
    if (this.fishRenderer) {
      this.fishRenderer.onResize();
    }
  }
  
  // 🎯 Obtener información
  getInfo() {
    switch (this.currentStage) {
      case 'egg':
        return {
          stage: 'egg',
          ...this.eggRenderer.getInfo(),
          timer: this.eggTimer.getInfo()
        };
        
      default:
        return {
          stage: this.currentStage,
          fish: this.fishRenderer ? this.fishRenderer.getInfo() : null
        };
    }
  }
}

