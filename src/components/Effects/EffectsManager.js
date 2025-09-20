// ✨ GESTOR DE EFECTOS
// ===================
// Maneja efectos visuales y partículas

export class EffectsManager {
  constructor(game) {
    this.game = game;
    this.effects = [];
  }
  
  update(deltaTime) {
    // TODO: Actualizar efectos
  }
  
  render(ctx) {
    // TODO: Renderizar efectos
  }
  
  startCleaningEffect() {
    console.log('Efecto de limpieza iniciado');
  }
  
  startHealingEffect() {
    console.log('Efecto de curación iniciado');
  }
  
  onResize() {
    // TODO: Ajustar efectos al tamaño
  }
}

