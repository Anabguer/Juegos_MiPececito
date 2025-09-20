// 🐟 RENDERIZADOR DE PEZ
// ====================
// Dibuja el pez dinámicamente en canvas con todas las etapas

import { getFishConfig, getFishColors } from '../../config/fishConfig.js';

export class FishRenderer {
  constructor(game) {
    this.game = game;
    
    // 🐟 Estado del pez
    this.fish = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      
      // 🎯 Movimiento
      baseSpeed: 120,
      followSpeed: 260,
      wobbleT: Math.random() * 10,
      target: null,
      turbo: false,
      
      // ⏰ Timers
      bubbleTimer: this.randomBetween(0.2, 0.8),
      
      // 🎭 Animación
      birthAnimation: {
        active: false,
        progress: 0,
        duration: 2000
      }
    };
    
    // 🎨 Configuración visual
    this.stage = 'baby';
    this.config = getFishConfig(this.stage);
    this.colors = getFishColors(this.stage);
    this.visible = false;
    
    // 🫧 Sistema de burbujas
    this.mouthBubbles = [];
    
    // 📐 Límites y colisiones
    this.updateBounds();
  }
  
  // 🔄 Actualizar
  update(deltaTime) {
    if (!this.visible) return;
    
    // Actualizar configuración si cambió la etapa
    this.updateConfig();
    
    // Actualizar animación de nacimiento
    this.updateBirthAnimation(deltaTime);
    
    // Actualizar física del pez
    this.updatePhysics(deltaTime);
    
    // Actualizar burbujas
    this.updateBubbles(deltaTime);
    
    // Actualizar límites
    this.updateBounds();
  }
  
  // ⚙️ Actualizar configuración
  updateConfig() {
    const currentStage = this.game.state.getCurrentStage();
    if (currentStage !== this.stage && currentStage !== 'egg') {
      this.setStage(currentStage);
    }
  }
  
  // 🎭 Actualizar animación de nacimiento
  updateBirthAnimation(deltaTime) {
    if (!this.fish.birthAnimation.active) return;
    
    const elapsed = Date.now() - this.fish.birthAnimation.startTime;
    this.fish.birthAnimation.progress = Math.min(1, elapsed / this.fish.birthAnimation.duration);
    
    if (this.fish.birthAnimation.progress >= 1) {
      this.fish.birthAnimation.active = false;
      console.log('✅ Animación de nacimiento completada');
    }
  }
  
  // 🏊 Actualizar física del pez
  updatePhysics(deltaTime) {
    // Velocidad deseada
    let desiredVx = (Math.sign(this.fish.vx) || 1) * this.config.baseSpeed;
    let desiredVy = this.fish.vy;
    
    // Seguir objetivo (turbo mode)
    if (this.fish.target) {
      const dx = this.fish.target.x - this.fish.x;
      const dy = this.fish.target.y - this.fish.y;
      const len = Math.hypot(dx, dy) || 1;
      const spd = (this.fish.turbo ? (this.config.followSpeed * this.config.turboMultiplier) : this.config.followSpeed);
      
      desiredVx = (dx / len) * spd;
      desiredVy = (dy / len) * spd;
      // ARRIVAL
      if (len < Math.max(12, this.config.size*0.28)) {
        this.fish.target = null; // clear target when close
      }
      // facing
      this.fish.facing = (dx >= 0) ? 1 : -1; /* ARRIVAL CLEAR */
    } else {
      // Movimiento natural con wobble
      this.fish.wobbleT += deltaTime;
      desiredVy = this.fish.vy + Math.sin(this.fish.wobbleT * 1.6) * 10 * deltaTime;
    }
    
    // Suavizar movimiento
    this.fish.vx = this.lerp(this.fish.vx, desiredVx, Math.min(1, deltaTime * 3.0));
    this.fish.vy = this.lerp(this.fish.vy, desiredVy, Math.min(1, deltaTime * 3.0));
    
    // Actualizar posición
    this.fish.x += this.fish.vx * deltaTime;
    this.fish.y += this.fish.vy * deltaTime;
    
    // Colisiones con bordes
    this.handleBoundaryCollisions();
    
    // Calcular ángulo (nunca boca abajo)
    this.fish.angle = this.clampAngle(Math.atan2(this.fish.vy, Math.abs(this.fish.vx)));
  }
  
  // 🫧 Actualizar burbujas
  updateBubbles(deltaTime) {
    // Generar nuevas burbujas
    this.fish.bubbleTimer -= deltaTime * (this.fish.target ? 2.6 : 1.0);
    
    if (this.fish.bubbleTimer <= 0) {
      this.addMouthBubble(!!this.fish.target);
      
      // Burbujas extra en modo turbo
      if (this.fish.target) {
        if (Math.random() < 0.8) this.addMouthBubble(true);
        if (Math.random() < 0.55) this.addMouthBubble(true);
      }
      
      this.fish.bubbleTimer = this.randomBetween(0.45, 1.1);
    }
    
    // Actualizar burbujas existentes
    for (let i = this.mouthBubbles.length - 1; i >= 0; i--) {
      const bubble = this.mouthBubbles[i];
      bubble.y -= bubble.v * deltaTime;
      bubble.life -= deltaTime;
      
      if (bubble.life <= 0) {
        this.mouthBubbles.splice(i, 1);
      }
    }
  }
  
  // 🫧 Agregar burbuja de la boca
  addMouthBubble(turboMul) {
    const dir = Math.sign(this.fish.vx) || 1;
    const mouthX = this.fish.x + (dir > 0 ? this.config.size * 0.70 : -this.config.size * 0.70);
    
    this.mouthBubbles.push({
      x: mouthX,
      y: this.fish.y,
      v: this.randomBetween(22, 34) * (turboMul ? 1.25 : 1),
      r: this.randomBetween(1.2, 2.4) * (turboMul ? 1.15 : 1),
      life: this.randomBetween(0.9, 1.4) * (turboMul ? 1.2 : 1)
    });
  }
  
  // 🚧 Manejar colisiones con bordes
  handleBoundaryCollisions() {
    const pad = this.config.padding;
    
    if (this.fish.x < pad) {
      this.fish.x = pad;
      this.fish.vx = Math.abs(this.fish.vx);
    }
    if (this.fish.x > this.game.canvas.width - pad) {
      this.fish.x = this.game.canvas.width - pad;
      this.fish.vx = -Math.abs(this.fish.vx);
    }
    if (this.fish.y < pad * 0.7) {
      this.fish.y = pad * 0.7;
      this.fish.vy = Math.abs(this.fish.vy);
    }
    if (this.fish.y > this.game.canvas.height - pad * 0.7) {
      this.fish.y = this.game.canvas.height - pad * 0.7;
      this.fish.vy = -Math.abs(this.fish.vy);
    }
  }
  
  // 🎨 Renderizar
  render(ctx) {
    if (!this.visible) return;
    
    // Renderizar burbujas de la boca
    this.renderBubbles(ctx);
    
    // Renderizar pez
    this.renderFish(ctx, performance.now() / 1000);
  }
  
  // 🫧 Renderizar burbujas
  renderBubbles(ctx) {
    ctx.save();
    
    for (const bubble of this.mouthBubbles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, bubble.life));
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // 🐟 Renderizar pez
  renderFish(ctx, time) {
    const s = this.config.size;
    const flip = this.fish.vx < 0 ? -1 : 1;
    
    ctx.save();
    ctx.translate(this.fish.x, this.fish.y);
    ctx.scale(flip, 1);
    ctx.rotate(this.clampAngle(this.fish.angle));
    
    // Aplicar animación de nacimiento
    if (this.fish.birthAnimation.active) {
      const scale = 0.3 + this.fish.birthAnimation.progress * 0.7;
      const alpha = this.fish.birthAnimation.progress;
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
    }
    
    // Dimensiones del cuerpo
    const rx = s * this.config.bodyScale.x;
    const ry = s * this.config.bodyScale.y;
    
    // 🎨 Cuerpo principal
    ctx.fillStyle = this.colors.body;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 🌈 Franja vertical (barriga)
    this.drawStripeVertical(ctx, rx, ry, this.colors.stripeColor, this.config.stripeWidth);
    
    // 🐠 Cola con aleteo
    this.drawTail(ctx, s, time);
    
    // 🐟 Aleta lateral
    this.drawFin(ctx, s, time);
    
    // 👁️ Ojo
    this.drawEye(ctx, s);
    
    // 🍼 Chupete (solo bebé)
    if (this.config.hasChupete) {
      this.drawChupete(ctx, rx, s);
    }
    
    ctx.restore();
  }
  
  // 🌈 Dibujar franja vertical
  drawStripeVertical(ctx, rx, ry, color, widthRatio) {
    const halfW = rx * widthRatio;
    const margin = 2;
    const rxIn = rx - margin;
    const ryIn = ry - margin;
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    
    const steps = 48;
    
    // Parte superior de la franja
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = -halfW + t * (2 * halfW);
      const y = ryIn * Math.sqrt(Math.max(0, 1 - (x * x) / (rxIn * rxIn)));
      
      if (i === 0) {
        ctx.moveTo(x, -y);
      } else {
        ctx.lineTo(x, -y);
      }
    }
    
    // Parte inferior de la franja
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const x = -halfW + t * (2 * halfW);
      const y = ryIn * Math.sqrt(Math.max(0, 1 - (x * x) / (rxIn * rxIn)));
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  // 🐠 Dibujar cola
  drawTail(ctx, s, time) {
    const flap = Math.sin(time * this.config.wobbleFreq + this.fish.wobbleT) * 0.38;
    
    ctx.save();
    ctx.translate(-s * this.config.bodyScale.x, 0);
    ctx.rotate(flap);
    ctx.fillStyle = this.colors.tail;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    // Forma de la cola según la etapa
    if (this.stage === 'adult') {
      // Cola más grande para adulto
      ctx.quadraticCurveTo(-s * 0.58, -s * 0.70, s * 0.18, -s * 0.28);
      ctx.quadraticCurveTo(-s * 0.58, s * 0.70, 0, 0);
    } else if (this.stage === 'young') {
      // Cola mediana para joven
      ctx.quadraticCurveTo(-s * 0.5, -s * 0.6, s * 0.14, -s * 0.24);
      ctx.quadraticCurveTo(-s * 0.5, s * 0.6, 0, 0);
    } else {
      // Cola pequeña para bebé
      ctx.quadraticCurveTo(-s * 0.48, -s * 0.58, s * 0.12, -s * 0.22);
      ctx.quadraticCurveTo(-s * 0.48, s * 0.58, 0, 0);
    }
    
    ctx.fill();
    ctx.restore();
  }
  
  // 🐟 Dibujar aleta lateral
  drawFin(ctx, s, time) {
    const finFlap = Math.sin(time * (this.config.wobbleFreq + 2.5) + this.fish.wobbleT) * 0.27;
    
    ctx.save();
    
    // Posición según la etapa
    if (this.stage === 'adult') {
      ctx.translate(-s * 0.02, s * 0.10);
    } else if (this.stage === 'young') {
      ctx.translate(-s * 0.05, s * 0.12);
    } else {
      ctx.translate(-s * 0.1, s * 0.16);
    }
    
    ctx.rotate(finFlap);
    ctx.fillStyle = this.colors.fin;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    // Forma de la aleta según la etapa
    if (this.stage === 'adult') {
      // Aleta grande y elegante
      ctx.quadraticCurveTo(s * 0.14, s * 0.95, s * 0.34, s * 0.26);
      ctx.quadraticCurveTo(s * 0.10, s * 0.34, 0, 0);
    } else if (this.stage === 'young') {
      // Aleta alargada
      ctx.quadraticCurveTo(s * 0.10, s * 0.80, s * 0.28, s * 0.22);
      ctx.quadraticCurveTo(s * 0.08, s * 0.30, 0, 0);
    } else {
      // Aleta pequeña de bebé
      ctx.quadraticCurveTo(s * 0.06, s * 0.58, s * 0.2, s * 0.13);
      ctx.quadraticCurveTo(s * 0.06, s * 0.25, 0, 0);
    }
    
    ctx.fill();
    ctx.restore();
  }
  
  // 👁️ Dibujar ojo
  drawEye(ctx, s) {
    const e = 0.22 * this.config.eyeScale;
    const p = 0.11 * this.config.eyeScale;
    
    // Ojo blanco
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.46, 0, s * e, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupila
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(s * 0.53, 0, s * p, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 🍼 Dibujar chupete (solo bebé)
  drawChupete(ctx, rx, s) {
    const mouthTipX = rx + s * 0.06;
    const mouthTipY = 0;
    
    // Borde del chupete
    ctx.strokeStyle = '#ff78c2';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(mouthTipX, mouthTipY, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    
    // Interior del chupete
    ctx.fillStyle = '#ffb5de';
    ctx.beginPath();
    ctx.ellipse(mouthTipX - s * 0.09, mouthTipY, s * 0.17, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 🎯 API pública
  
  // Establecer etapa
  setStage(stage) {
    if (this.stage !== stage) {
      console.log(`🐟 Cambiando etapa: ${this.stage} → ${stage}`);
      this.stage = stage;
      this.config = getFishConfig(stage);
      this.colors = getFishColors(stage);
      
      // Actualizar propiedades del pez
      this.fish.baseSpeed = this.config.baseSpeed;
      this.fish.followSpeed = this.config.followSpeed;
    }
  }
  
  // Establecer visibilidad
  setVisible(visible) {
    this.visible = visible;
    
    if (visible && !this.fish.x) {
      // Posicionar en el centro al hacerse visible
      this.fish.x = this.game.canvas.width * 0.5;
      this.fish.y = this.game.canvas.height * 0.55;
      this.fish.vx = this.randomBetween(80, 120);
      this.fish.vy = this.randomBetween(-20, 20);
    }
  }
  
  // Establecer objetivo
  setTarget(target) {
    this.fish.target = target;
  }
  
  // Activar turbo
  setTurbo(active) {
    this.fish.turbo = active;
  }
  
  // Reproducir animación de nacimiento
  playBirthAnimation() {
    this.fish.birthAnimation.active = true;
    this.fish.birthAnimation.startTime = Date.now();
    this.fish.birthAnimation.progress = 0;
    
    console.log('🎭 Iniciando animación de nacimiento');
  }
  
  // Iniciar animación de alimentación
  startFeedingAnimation() {
    // TODO: Implementar animación de alimentación
    console.log('🍎 Animación de alimentación');
  }
  
  // 📐 Actualizar límites
  updateBounds() {
    // Actualizar límites según el tamaño de pantalla
  }
  
  // Redimensionar
  onResize() {
    this.updateBounds();
  }
  
  // 🎯 Obtener información
  getInfo() {
    return {
      stage: this.stage,
      position: { x: this.fish.x, y: this.fish.y },
      velocity: { x: this.fish.vx, y: this.fish.vy },
      turbo: this.fish.turbo,
      target: this.fish.target,
      bubbles: this.mouthBubbles.length
    };
  }
  
  // 🔧 Funciones auxiliares
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  clampAngle(angle) {
    const maxAngle = this.config.angleLimit;
    return Math.max(-maxAngle, Math.min(maxAngle, angle));
  }
  
  randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
}

