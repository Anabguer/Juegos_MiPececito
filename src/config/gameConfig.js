// 🎮 CONFIGURACIÓN PRINCIPAL DEL JUEGO
// ====================================
// TODOS LOS VALORES CENTRALIZADOS AQUÍ

export const GAME_CONFIG = {
  // 🎯 CONFIGURACIÓN GENERAL
  canvas: {
    targetFPS: 60,
    alpha: false,
    antialias: true
  },
  
  // ⏰ TIEMPOS DE EVOLUCIÓN (en milisegundos)
  evolution: {
    eggDuration: 24 * 60 * 60 * 1000,    // 24 horas
    babyDuration: 7 * 24 * 60 * 60 * 1000,  // 7 días
    youngDuration: 7 * 24 * 60 * 60 * 1000, // 7 días más
    // Adulto = permanente
  },
  
  // 🥚 PROGRESIÓN VISUAL DEL HUEVO
  eggStages: {
    stage1: { time: 0,    image: 'egg_01_clean.png' },    // 0-6h
    stage2: { time: 0.25, image: 'egg_02_clean.png' },    // 6-12h  
    stage3: { time: 0.5,  image: 'egg_03_clean.png' },    // 12-18h
    stage4: { time: 0.75, image: 'egg_04_clean.png' },    // 18-24h
    final:  { time: 1.0,  image: 'egg_00_cracked.png' }   // 24h (eclosión)
  },
  
  // 📊 NECESIDADES DEL PEZ (en milisegundos)
  needs: {
    baby: {
      hunger: 4 * 60 * 60 * 1000,      // 4 horas
      play: 5 * 60 * 60 * 1000,        // 5 horas  
      clean: 24 * 60 * 60 * 1000,      // 1 día
      medicine: 8 * 60 * 60 * 1000     // 8 horas de descuido
    },
    young: {
      hunger: 6 * 60 * 60 * 1000,      // 6 horas
      play: 8 * 60 * 60 * 1000,        // 8 horas
      clean: 2 * 24 * 60 * 60 * 1000,  // 2 días  
      medicine: 14 * 60 * 60 * 1000    // 14 horas de descuido
    },
    adult: {
      hunger: 8 * 60 * 60 * 1000,      // 8 horas
      play: 10 * 60 * 60 * 1000,       // 10 horas
      clean: 3 * 24 * 60 * 60 * 1000,  // 3 días
      medicine: 26 * 60 * 60 * 1000    // 26 horas de descuido
    }
  },
  
  // 😢 ESTADOS DE DESCUIDO
  neglectStates: {
    normal: { threshold: 0, speedMultiplier: 1.0 },
    mild: { threshold: 4 * 60 * 60 * 1000, speedMultiplier: 0.8 },    // 4h
    moderate: { threshold: 6 * 60 * 60 * 1000, speedMultiplier: 0.6 }, // 6h  
    critical: { threshold: 8 * 60 * 60 * 1000, speedMultiplier: 0.3, noResponse: true } // 8h
  },
  
  // 🎁 RECOMPENSAS DIARIAS
  dailyRewards: {
    day1: { bubbles: 2 },
    day2: { bubbles: 3 },
    day3: { bubbles: 4 },
    day4: { bubbles: 5 },
    day5: { bubbles: 6 },
    day6: { bubbles: 7 },
    day7: { bubbles: 10, premium: true } // Comida premium
  },
  
  // 🎮 SISTEMA DE JUEGOS
  games: {
    bubbles: { id: 1, stars: 0, unlocked: true },
    memory: { id: 2, stars: 10, unlocked: false },
    blocks: { id: 3, stars: 25, unlocked: false },
    maze: { id: 4, stars: 50, unlocked: false },
    dodge: { id: 5, stars: 100, unlocked: false },
    swim: { id: 6, stars: 200, unlocked: false }
  },
  
  // 🏆 SISTEMA DE RANKING
  ranks: {
    bronze: { min: 0, max: 49, name: 'Pececito Novato', icon: '🥉' },
    silver: { min: 50, max: 149, name: 'Nadador Experto', icon: '🥈' },
    gold: { min: 150, max: 299, name: 'Maestro Acuático', icon: '🥇' },
    diamond: { min: 300, max: Infinity, name: 'Leyenda del Océano', icon: '💎' }
  },
  
  // 💰 ECONOMÍA DEL JUEGO
  economy: {
    bubbleRate: 30 * 60 * 1000,  // 1 burbuja cada 30 minutos
    prices: {
      backgrounds: 50,    // 50 burbujas por fondo
      decorations: 25,    // 25 burbujas por decoración
      food: 10           // 10 burbujas por comida especial
    }
  },
  
  // 📱 CONFIGURACIÓN MÓVIL
  mobile: {
    touchSensitivity: 1.2,
    vibrationEnabled: true,
    autoSave: 60 * 1000  // Auto-guardar cada minuto
  }
};

// 🎯 FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN POR ETAPA
export function getConfigForStage(stage) {
  return GAME_CONFIG.needs[stage] || GAME_CONFIG.needs.baby;
}

// 🏆 FUNCIÓN HELPER PARA OBTENER RANGO POR ESTRELLAS
export function getRankByStars(stars) {
  for (const [key, rank] of Object.entries(GAME_CONFIG.ranks)) {
    if (stars >= rank.min && stars <= rank.max) {
      return { ...rank, key };
    }
  }
  return GAME_CONFIG.ranks.bronze;
}

