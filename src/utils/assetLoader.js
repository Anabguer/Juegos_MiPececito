// 📦 CARGADOR INTELIGENTE DE ASSETS
// =================================
// Sistema de carga optimizado y con fallbacks

import { ASSETS_CONFIG, getCriticalAssets } from '../config/assetsConfig.js';

class AssetLoader {
  constructor() {
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
    this.failedAssets = new Set();
    
    // Estadísticas
    this.stats = {
      total: 0,
      loaded: 0,
      failed: 0
    };
  }
  
  // 🚀 Cargar asset individual
  async loadAsset(path, retries = 2) {
    // Si ya está cargado, devolverlo
    if (this.loadedAssets.has(path)) {
      return this.loadedAssets.get(path);
    }
    
    // Si ya se está cargando, esperar la promesa existente
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }
    
    // Si ya falló, devolver null
    if (this.failedAssets.has(path)) {
      return null;
    }
    
    // Crear nueva promesa de carga
    const loadPromise = this._loadAssetInternal(path, retries);
    this.loadingPromises.set(path, loadPromise);
    
    try {
      const asset = await loadPromise;
      this.loadedAssets.set(path, asset);
      this.stats.loaded++;
      return asset;
    } catch (error) {
      console.warn(`❌ Error cargando asset: ${path}`, error);
      this.failedAssets.add(path);
      this.stats.failed++;
      return null;
    } finally {
      this.loadingPromises.delete(path);
    }
  }
  
  // 🔄 Carga interna con reintentos
  async _loadAssetInternal(path, retries) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const asset = await this._createAssetElement(path);
        return asset;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  // 🖼️ Crear elemento de imagen
  _createAssetElement(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`No se pudo cargar: ${path}`));
      };
      
      // Timeout de 10 segundos
      setTimeout(() => {
        reject(new Error(`Timeout cargando: ${path}`));
      }, 10000);
      
      img.src = path;
    });
  }
  
  // 🎯 Cargar múltiples assets
  async loadAssets(paths) {
    this.stats.total += paths.length;
    
    const promises = paths.map(path => this.loadAsset(path));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      path: paths[index],
      success: result.status === 'fulfilled',
      asset: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
  
  // ⚡ Precargar assets críticos
  async preloadCritical() {
    console.log('🚀 Precargando assets críticos...');
    const criticalAssets = getCriticalAssets();
    const results = await this.loadAssets(criticalAssets);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Assets críticos cargados: ${successful}/${criticalAssets.length}`);
    if (failed > 0) {
      console.warn(`⚠️ Assets críticos fallidos: ${failed}`);
    }
    
    return {
      total: criticalAssets.length,
      successful,
      failed,
      results
    };
  }
  
  // 🎨 Obtener asset o fallback
  getAsset(path, fallback = null) {
    return this.loadedAssets.get(path) || fallback;
  }
  
  // 🔍 Verificar si asset existe
  hasAsset(path) {
    return this.loadedAssets.has(path);
  }
  
  // 📊 Obtener estadísticas
  getStats() {
    return {
      ...this.stats,
      loadedPaths: Array.from(this.loadedAssets.keys()),
      failedPaths: Array.from(this.failedAssets),
      loadingPaths: Array.from(this.loadingPromises.keys())
    };
  }
  
  // 🧹 Limpiar assets no usados
  cleanup(keepPaths = []) {
    let cleaned = 0;
    
    for (const [path, asset] of this.loadedAssets.entries()) {
      if (!keepPaths.includes(path)) {
        this.loadedAssets.delete(path);
        cleaned++;
      }
    }
    
    console.log(`🧹 Assets limpiados: ${cleaned}`);
    return cleaned;
  }
}

// 🌟 FUNCIONES DE CONVENIENCIA

// Instancia global del cargador
export const assetLoader = new AssetLoader();

// Cargar fondo específico
export async function loadBackground(name) {
  const path = ASSETS_CONFIG.basePaths.backgrounds + ASSETS_CONFIG.backgrounds[name];
  return await assetLoader.loadAsset(path);
}

// Cargar huevo por etapa
export async function loadEgg(stage) {
  const path = ASSETS_CONFIG.basePaths.fish + ASSETS_CONFIG.eggs[stage];
  return await assetLoader.loadAsset(path);
}

// Cargar badge por tipo
export async function loadBadge(type) {
  const path = ASSETS_CONFIG.basePaths.ui + ASSETS_CONFIG.badges[type];
  return await assetLoader.loadAsset(path);
}

// Verificar si todos los assets críticos están disponibles
export function checkCriticalAssets() {
  const critical = getCriticalAssets();
  const missing = critical.filter(path => !assetLoader.hasAsset(path));
  
  return {
    allLoaded: missing.length === 0,
    total: critical.length,
    loaded: critical.length - missing.length,
    missing
  };
}

// Inicializar sistema de assets
export async function initializeAssets() {
  console.log('🎮 Inicializando sistema de assets...');
  
  try {
    const result = await assetLoader.preloadCritical();
    
    if (result.failed > 0) {
      console.warn('⚠️ Algunos assets críticos no se pudieron cargar');
      console.warn('🎨 El juego funcionará con fallbacks');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error inicializando assets:', error);
    throw error;
  }
}

