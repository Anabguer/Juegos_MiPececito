// 🫧 GESTOR DE NECESIDADES
// ========================
// Maneja las burbujas de necesidades del pez

export class NeedsManager {
  constructor(game) {
    this.game = game;
    this.needs = [];
    this.lastCheck = Date.now();
  }
  
  update(deltaTime) {
    // TODO: Implementar sistema de necesidades
    console.log('NeedsManager actualizado');
  }
  
  render(ctx) {
    // TODO: Renderizar burbujas de necesidades
  }
  
  satisfyNeed(needType) {
    console.log(`Necesidad satisfecha: ${needType}`);
  }
  
  getCurrentNeeds() {
    return {};
  }
  
  onResize() {
    // TODO: Ajustar posiciones
  }
}

