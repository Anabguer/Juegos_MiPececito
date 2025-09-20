// 🥚 RENDERIZADOR DE HUEVO
// ========================
// Maneja la visualización y animación del huevo

import { assetLoader } from '../../utils/assetLoader.js';

export class EggRenderer {
  constructor(game) {
    this.game = game;
    
    // 🎨 Propiedades visuales
    this.position = {
      x: 0,
      y: 0,
      baseY: 0,
      floatOffset: 0
    };
    
    // ⏰ Animación de flotación
    this.floatTime = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.8;
    this.floatAmplitude = 6;
    
    // 💥 Animación de eclosión
    this.hatchAnimation = {
      active: false,
      progress: 0,
      duration: 2000, // 2 segundos
      blurAmount: 0,
      scale: 1
    };
    
    // 🫧 Burbujas de fondo
    this.backgroundBubbles = this.createBackgroundBubbles();
  }
  
  // 🫧 Crear burbujas de fondo
  createBackgroundBubbles() {
    const bubbles = [];
    for (let i = 0; i < 18; i++) {
      bubbles.push({
        x: Math.random() * this.game.canvas.width,
        y: this.game.canvas.height + Math.random() * this.game.canvas.height,
        radius: 1 + Math.random() * 3,
        speed: 12 + Math.random() * 24,
        opacity: 0.28
      });
    }
    return bubbles;
  }
  
  // 🔄 Actualizar
  update(deltaTime) {
    // Actualizar posición central
    this.updatePosition();
    
    // Actualizar animación de flotación
    this.updateFloat(deltaTime);
    
    // Actualizar burbujas de fondo
    this.updateBackgroundBubbles(deltaTime);
    
    // Verificar si debe iniciar eclosión
    this.checkHatching();
    
    // Actualizar animación de eclosión
    this.updateHatchAnimation(deltaTime);
  }
  
  // 📐 Actualizar posición central
  updatePosition() {
    this.position.x = this.game.canvas.width * 0.5;
    this.position.baseY = this.game.canvas.height * 0.55;
  }
  
  // 🌊 Actualizar flotación
  updateFloat(deltaTime) {
    this.floatTime += deltaTime * this.floatSpeed;
    this.floatOffset = Math.sin(this.floatTime) * this.floatAmplitude;
    this.position.y = this.position.baseY + this.floatOffset;
  }
  
  // 🫧 Actualizar burbujas de fondo
  updateBackgroundBubbles(deltaTime) {
    for (const bubble of this.backgroundBubbles) {
      bubble.y -= bubble.speed * deltaTime;
      
      if (bubble.y < -10) {
        bubble.y = this.game.canvas.height + 10;
        bubble.x = Math.random() * this.game.canvas.width;
      }
    }
  }
  
  // 🐣 Verificar si debe eclosionar
  checkHatching() {
    if (this.hatchAnimation.active) return;
    
    const progress = this.game.state.getEggProgress();
    
    if (progress >= 1.0) {
      this.startHatchAnimation();
    }
  }
  
  // 🎭 Iniciar animación de eclosión
  startHatchAnimation() {
    console.log('🐣 Iniciando animación de eclosión');
    
    this.hatchAnimation.active = true;
    this.hatchAnimation.startTime = Date.now();
    
    // Disparar evento
    document.dispatchEvent(new CustomEvent('hatchStart'));
  }
  
  // 🔄 Actualizar animación de eclosión
  updateHatchAnimation(deltaTime) {
    if (!this.hatchAnimation.active) return;
    
    const elapsed = Date.now() - this.hatchAnimation.startTime;
    this.hatchAnimation.progress = Math.min(1, elapsed / this.hatchAnimation.duration);
    
    // Calcular efectos de blur y escala
    if (this.hatchAnimation.progress < 0.3) {
      // Primera fase: blur creciente
      this.hatchAnimation.blurAmount = this.hatchAnimation.progress * 33; // 0 a 10px
      this.hatchAnimation.scale = 1 + this.hatchAnimation.progress * 0.13; // 1 a 1.04
    } else if (this.hatchAnimation.progress < 0.6) {
      // Segunda fase: máximo blur
      this.hatchAnimation.blurAmount = 10;
      this.hatchAnimation.scale = 1.04;
    } else {
      // Tercera fase: fade out
      const fadeProgress = (this.hatchAnimation.progress - 0.6) / 0.4;
      this.hatchAnimation.blurAmount = 10;
      this.hatchAnimation.scale = 1.04;
      this.hatchAnimation.opacity = 1 - fadeProgress;
    }
    
    // Completar animación
    if (this.hatchAnimation.progress >= 1) {
      this.completeHatchAnimation();
    }
  }
  
  // ✅ Completar animación de eclosión
  completeHatchAnimation() {
    this.hatchAnimation.active = false;
    
    console.log('✅ Animación de eclosión completada');
    
    // Disparar evento
    document.dispatchEvent(new CustomEvent('hatchComplete'));
  }
  
  // 🎨 Renderizar
  render(ctx) {
    // Renderizar fondo con burbujas
    this.renderBackground(ctx);
    
    // Renderizar huevo (si no está completamente eclosionado)
    if (!this.hatchAnimation.active || this.hatchAnimation.progress < 0.6) {
      this.renderEgg(ctx);
    }
  }
  
  // 🌌 Renderizar fondo
  renderBackground(ctx) {
    // Burbujas de fondo
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#cfe9ff';
    
    for (const bubble of this.backgroundBubbles) {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // 🥚 Renderizar huevo
  renderEgg(ctx) {
    ctx.save();
    
    // Aplicar efectos de eclosión
    if (this.hatchAnimation.active) {
      // Aplicar blur (simulado con sombra)
      if (this.hatchAnimation.blurAmount > 0) {
        ctx.shadowBlur = this.hatchAnimation.blurAmount;
        ctx.shadowColor = 'rgba(244, 242, 231, 0.8)';
      }
      
      // Aplicar escala
      ctx.translate(this.position.x, this.position.y);
      ctx.scale(this.hatchAnimation.scale, this.hatchAnimation.scale);
      ctx.translate(-this.position.x, -this.position.y);
      
      // Aplicar opacidad
      if (this.hatchAnimation.opacity !== undefined) {
        ctx.globalAlpha = this.hatchAnimation.opacity;
      }
    }
    
    // Obtener imagen actual del huevo
    const currentImage = this.game.state.getCurrentEggImage();
    const eggAsset = assetLoader.getAsset(`assets/images/fish/${currentImage}`);
    
    if (eggAsset) {
      // Renderizar imagen del huevo
      const size = 110; // Tamaño base del huevo
      ctx.drawImage(
        eggAsset,
        this.position.x - size/2,
        this.position.y - size/2,
        size,
        size
      );
    } else {
      // Fallback: huevo vectorial
      this.renderVectorEgg(ctx);
    }
    
    // Base/arena
    this.renderEggBase(ctx);
    
    ctx.restore();
  }
  
  // 🎨 Renderizar huevo vectorial (fallback)
  renderVectorEgg(ctx) {
    const w = 110, h = 140;
    
    ctx.translate(this.position.x, this.position.y);
    
    // Cuerpo del huevo
    ctx.fillStyle = '#f4f2e7';
    ctx.strokeStyle = 'rgba(40, 50, 60, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.62, h * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Sombra/volumen
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#c8c2b0';
    ctx.beginPath();
    ctx.ellipse(-15, -20, w * 0.28, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.translate(-this.position.x, -this.position.y);
  }
  
  // 🏖️ Renderizar base del huevo
  renderEggBase(ctx) {
    const baseY = this.position.y + 50;
    const baseWidth = 88;
    const baseHeight = 25;
    
    ctx.fillStyle = '#16324a';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x, 
      baseY, 
      baseWidth, 
      baseHeight, 
      0, 0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // 📐 Redimensionar
  onResize() {
    // Recrear burbujas con nuevas dimensiones
    this.backgroundBubbles = this.createBackgroundBubbles();
  }
  
  // 🎯 Obtener información del huevo
  getInfo() {
    return {
      progress: this.game.state.getEggProgress(),
      timeRemaining: this.game.state.getEggTimeRemaining(),
      currentImage: this.game.state.getCurrentEggImage(),
      isHatching: this.hatchAnimation.active
    };
  }
}

