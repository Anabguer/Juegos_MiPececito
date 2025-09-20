// 🍞 GESTOR DE NOTIFICACIONES TOAST
// =================================
// Sistema de notificaciones no intrusivas

export class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.createContainer();
    this.setupEvents();
  }
  
  // 📦 Crear contenedor de toasts
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toastContainer';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }
  
  // ⚙️ Configurar eventos
  setupEvents() {
    // Escuchar eventos de toast personalizados
    document.addEventListener('showToast', (e) => {
      this.show(e.detail.message, e.detail.duration || 3000, e.detail.type || 'info');
    });
    
    document.addEventListener('evolutionComplete', (e) => {
      const messages = {
        baby: '¡Nació tu pececito! 🐣',
        young: '¡Tu pez está creciendo! 🐟',
        adult: '¡Tu pez es ahora adulto! 🐠'
      };
      
      this.show(messages[e.detail.to] || '¡Evolución completada!', 3000, 'success');
    });
    
    document.addEventListener('dailyReward', (e) => {
      this.show(`¡Día ${e.detail.day}! +${e.detail.reward.bubbles} burbujas 🎁`, 4000, 'reward');
    });
    
    document.addEventListener('fishNamed', (e) => {
      this.show(`¡Tu pez se llama ${e.detail.name}! 🐟`, 3000, 'success');
    });
  }
  
  // 📢 Mostrar toast
  show(message, duration = 3000, type = 'info') {
    const toast = this.createToast(message, type);
    this.toasts.push(toast);
    
    // Agregar al DOM
    this.container.appendChild(toast.element);
    
    // Animar entrada
    setTimeout(() => {
      toast.element.classList.add('show');
    }, 10);
    
    // Auto-ocultar
    setTimeout(() => {
      this.hide(toast);
    }, duration);
    
    return toast;
  }
  
  // 🎨 Crear elemento toast
  createToast(message, type) {
    const element = document.createElement('div');
    element.className = `toast toast-${type}`;
    
    // Estilos según tipo
    const styles = {
      info: 'background: rgba(0, 0, 0, 0.8);',
      success: 'background: rgba(76, 175, 80, 0.9);',
      warning: 'background: rgba(255, 152, 0, 0.9);',
      error: 'background: rgba(244, 67, 54, 0.9);',
      reward: 'background: linear-gradient(45deg, rgba(255, 215, 0, 0.9), rgba(255, 152, 0, 0.9));'
    };
    
    element.style.cssText = `
      ${styles[type] || styles.info}
      backdrop-filter: blur(4px);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      margin: 4px 0;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    element.textContent = message;
    
    return {
      element,
      type,
      message,
      createdAt: Date.now()
    };
  }
  
  // 👻 Ocultar toast
  hide(toast) {
    if (!toast.element.parentNode) return;
    
    toast.element.classList.remove('show');
    
    setTimeout(() => {
      if (toast.element.parentNode) {
        this.container.removeChild(toast.element);
      }
      
      // Remover de la lista
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }
  
  // 🧹 Limpiar todos los toasts
  clear() {
    this.toasts.forEach(toast => this.hide(toast));
  }
  
  // 📊 Obtener información
  getInfo() {
    return {
      active: this.toasts.length,
      toasts: this.toasts.map(t => ({
        message: t.message,
        type: t.type,
        age: Date.now() - t.createdAt
      }))
    };
  }
}

// 🌟 INSTANCIA GLOBAL
export const toastManager = new ToastManager();

// 🚀 FUNCIONES DE CONVENIENCIA
export function showToast(message, duration, type) {
  return toastManager.show(message, duration, type);
}

export function showSuccess(message, duration = 3000) {
  return toastManager.show(message, duration, 'success');
}

export function showError(message, duration = 4000) {
  return toastManager.show(message, duration, 'error');
}

export function showWarning(message, duration = 3000) {
  return toastManager.show(message, duration, 'warning');
}

export function showReward(message, duration = 4000) {
  return toastManager.show(message, duration, 'reward');
}

