// ⏰ CONTADOR DE HUEVO
// ====================
// UI que muestra el tiempo restante para la eclosión

export class EggTimer {
  constructor(game) {
    this.game = game;
    
    // 🎨 Propiedades visuales
    this.visible = true;
    this.position = {
      x: 0,
      y: 30
    };
    
    // 🎭 Animación
    this.pulseTime = 0;
    this.pulseSpeed = 2;
    
    // 📱 Responsive
    this.fontSize = 18;
    this.updateResponsive();
  }
  
  // 📱 Actualizar responsive
  updateResponsive() {
    const width = this.game.canvas.width;
    
    if (width <= 480) {
      this.fontSize = 16;
    } else if (width <= 768) {
      this.fontSize = 17;
    } else {
      this.fontSize = 18;
    }
  }
  
  // 🔄 Actualizar
  update(deltaTime) {
    // Solo visible durante etapa de huevo
    this.visible = this.game.state.getCurrentStage() === 'egg';
    
    if (!this.visible) return;
    
    // Actualizar posición
    this.position.x = this.game.canvas.width / 2;
    
    // Animación de pulso
    this.pulseTime += deltaTime * this.pulseSpeed;
    
    // Verificar si está cerca de eclosionar
    const timeRemaining = this.game.state.getEggTimeRemaining();
    if (timeRemaining < 60000) { // Menos de 1 minuto
      this.pulseSpeed = 4; // Pulso más rápido
    } else if (timeRemaining < 300000) { // Menos de 5 minutos
      this.pulseSpeed = 3;
    } else {
      this.pulseSpeed = 2;
    }
  }
  
  // 🎨 Renderizar
  render(ctx) {
    if (!this.visible) return;
    
    const timeRemaining = this.game.state.getEggTimeRemaining();
    const timeText = this.formatTime(timeRemaining);
    
    ctx.save();
    
    // Configurar fuente
    ctx.font = `bold ${this.fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Efecto de pulso
    const pulseScale = 1 + Math.sin(this.pulseTime) * 0.05;
    ctx.translate(this.position.x, this.position.y);
    ctx.scale(pulseScale, pulseScale);
    
    // Sombra del texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    
    // Texto principal
    if (timeRemaining > 0) {
      ctx.fillStyle = '#e9f6ff';
      ctx.fillText(`Eclosión en: ${timeText}`, 0, 0);
    } else {
      // Texto de eclosión
      ctx.fillStyle = '#ffeb3b';
      const hatchText = Math.sin(this.pulseTime * 3) > 0 ? '¡ECLOSIONANDO!' : '🐣 ¡NACIENDO! 🐣';
      ctx.fillText(hatchText, 0, 0);
    }
    
    // Botón de eclosión manual (solo si quedan menos de 30 segundos)
    if (timeRemaining < 30000 && timeRemaining > 0) {
      this.renderHatchButton(ctx);
    }
    
    ctx.restore();
  }
  
  // 🔘 Renderizar botón de eclosión manual
  renderHatchButton(ctx) {
    const buttonY = 40;
    const buttonWidth = 150;
    const buttonHeight = 35;
    
    // Fondo del botón
    ctx.fillStyle = 'rgba(29, 75, 107, 0.9)';
    ctx.strokeStyle = 'rgba(42, 98, 135, 1)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.roundRect(-buttonWidth/2, buttonY, buttonWidth, buttonHeight, 12);
    ctx.fill();
    ctx.stroke();
    
    // Texto del botón
    ctx.font = `600 ${this.fontSize - 2}px system-ui`;
    ctx.fillStyle = '#e9f6ff';
    ctx.shadowBlur = 2;
    ctx.fillText('Eclosionar ahora', 0, buttonY + buttonHeight/2 - 6);
    
    // Guardar área del botón para detección de clicks
    this.buttonArea = {
      x: this.position.x - buttonWidth/2,
      y: this.position.y + buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
  }
  
  // ⏰ Formatear tiempo
  formatTime(milliseconds) {
    if (milliseconds <= 0) return '0s';
    
    const totalSeconds = Math.ceil(milliseconds / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  // 👆 Manejar click
  handleClick(x, y) {
    if (!this.visible || !this.buttonArea) return false;
    
    // Verificar si el click está en el botón
    if (x >= this.buttonArea.x && 
        x <= this.buttonArea.x + this.buttonArea.width &&
        y >= this.buttonArea.y && 
        y <= this.buttonArea.y + this.buttonArea.height) {
      
      // Forzar eclosión
      this.forceHatch();
      return true;
    }
    
    return false;
  }
  
  // 🐣 Forzar eclosión
  forceHatch() {
    console.log('🐣 Eclosión forzada por el usuario');
    
    // Forzar evolución inmediata
    this.game.state.gameState.eggStartTime = Date.now() - this.game.state.gameState.eggDuration;
    this.game.state.checkEvolution();
    
    // Disparar evento
    document.dispatchEvent(new CustomEvent('forceHatch'));
  }
  
  // 📐 Redimensionar
  onResize() {
    this.updateResponsive();
  }
  
  // 🎯 Obtener información
  getInfo() {
    return {
      visible: this.visible,
      timeRemaining: this.game.state.getEggTimeRemaining(),
      canForceHatch: this.game.state.getEggTimeRemaining() < 30000
    };
  }
}

// 🌟 EXTENSIÓN PARA CANVAS ROUNDRECT (si no existe)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

