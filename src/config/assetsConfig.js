// 📁 CONFIGURACIÓN DE ASSETS
// ==========================
// Rutas centralizadas para todos los assets

export const ASSETS_CONFIG = {
  // 📁 Rutas base (CORREGIDAS)
  basePaths: {
    images: './images/',
    backgrounds: './images/backgrounds/',
    fish: './images/fish/',
    ui: './images/ui/',
    effects: './images/effects/',
    games: './images/games/'
  },
  
  // 🏞️ FONDOS
  backgrounds: {
    basic: 'bg_basic.png',
    cartoon: 'bg_cartoon.png', 
    coral: 'bg_coral.png',
    demonslayer: 'bg_demonslayer.png',
    mario: 'bg_mario.png',
    minecraft: 'bg_minecraft.png',
    minecraft2: 'bg_minecraft2.png',
    minecraft_clouds: 'bg_minecraft_clouds.png',
    peppapig: 'bg_peppapig.png',
    volcano: 'bg_volcano.png'
  },
  
  // 🥚 HUEVOS
  eggs: {
    cracked: 'egg_00_cracked.png',    // Nuevo - huevo agrietado
    stage1: 'egg_01_clean.png',       // 0-6h
    stage2: 'egg_02_clean.png',       // 6-12h
    stage3: 'egg_03_clean.png',       // 12-18h
    stage4: 'egg_04_clean.png'        // 18-24h
  },
  
  // 🎮 BADGES DE ESTADO
  badges: {
    hunger: 'badge_hunger.png',
    medicine: 'badge_medicine.png', 
    play: 'badge_play.png',
    dirty: 'badge_dirty.png',        // Nuevo
    food: 'badge_food.png'           // Nuevo - para burbujas de necesidad
  },
  
  // 🔘 BOTONES DE UI
  buttons: {
    food: 'btn_food.png',            // Nuevo
    reset: 'btn_reset.png'           // Nuevo
  },
  
  // 🌿 EFECTOS Y DECORACIÓN
  effects: {
    algae: {
      small: 'algae_small.png',      // Nuevo
      medium: 'algae_medium.png',    // Nuevo
      large: 'algae_large.png'       // Nuevo
    },
    bubbles: {
      need: 'bubble_need.png',       // Nuevo - burbuja de necesidad
      good: 'bubble_good.png',       // Nuevo - juego burbujas
      bad: 'bubble_bad.png'          // Nuevo - juego burbujas
    }
  },
  
  // 🍎 COMIDA
  food: {
    normal: 'pellet_normal.png',     // Nuevo - pellet normal
    premium: 'food_premium.png'     // Nuevo - comida día 7
  },
  
  // 🎮 ELEMENTOS DE JUEGO
  games: {
    icons: {
      star: 'star_icon.png',         // Nuevo - estrella de juego
      heart: 'heart_icon.png',       // Nuevo - objeto bueno
      banana: 'banana_icon.png',     // Nuevo - objeto bueno
      skull: 'skull_icon.png',       // Nuevo - objeto malo
      spikeBall: 'spike_ball.png'    // Nuevo - objeto malo
    }
  }
};

// 🎯 FUNCIONES HELPER

// Obtener ruta completa de un asset
export function getAssetPath(category, item, subcategory = null) {
  const basePath = ASSETS_CONFIG.basePaths[category] || ASSETS_CONFIG.basePaths.images;
  
  if (subcategory) {
    return basePath + ASSETS_CONFIG[category][subcategory][item];
  }
  
  return basePath + ASSETS_CONFIG[category][item];
}

// Obtener fondo por nombre
export function getBackgroundPath(name) {
  return getAssetPath('backgrounds', name);
}

// Obtener huevo por etapa
export function getEggPath(stage) {
  return getAssetPath('fish', stage, 'eggs');
}

// Obtener badge por tipo
export function getBadgePath(type) {
  return getAssetPath('ui', type, 'badges');
}

// Precargar todos los assets críticos
export function getCriticalAssets() {
  return [
    // Huevos (todos)
    ...Object.values(ASSETS_CONFIG.eggs).map(egg => 
      ASSETS_CONFIG.basePaths.fish + egg
    ),
    
    // Badges existentes
    ASSETS_CONFIG.basePaths.ui + ASSETS_CONFIG.badges.hunger,
    ASSETS_CONFIG.basePaths.ui + ASSETS_CONFIG.badges.medicine,
    ASSETS_CONFIG.basePaths.ui + ASSETS_CONFIG.badges.play,
    
    // Fondo básico
    ASSETS_CONFIG.basePaths.backgrounds + ASSETS_CONFIG.backgrounds.basic
  ];
}

// Lista de assets que faltan por crear
export function getMissingAssets() {
  return [
    // Assets críticos nuevos
    { path: 'fish/egg_00_cracked.png', priority: 'high' },
    { path: 'ui/badge_dirty.png', priority: 'high' },
    { path: 'ui/badge_food.png', priority: 'high' },
    { path: 'ui/btn_food.png', priority: 'high' },
    { path: 'ui/btn_reset.png', priority: 'high' },
    { path: 'backgrounds/bg_basic.png', priority: 'high' },
    
    // Decoración y efectos
    { path: 'effects/algae_small.png', priority: 'medium' },
    { path: 'effects/algae_medium.png', priority: 'medium' },
    { path: 'effects/algae_large.png', priority: 'medium' },
    { path: 'effects/bubble_need.png', priority: 'medium' },
    { path: 'ui/pellet_normal.png', priority: 'medium' },
    { path: 'ui/food_premium.png', priority: 'medium' },
    { path: 'ui/star_icon.png', priority: 'medium' },
    
    // Juegos
    { path: 'games/bubble_good.png', priority: 'low' },
    { path: 'games/bubble_bad.png', priority: 'low' },
    { path: 'games/heart_icon.png', priority: 'low' },
    { path: 'games/banana_icon.png', priority: 'low' },
    { path: 'games/skull_icon.png', priority: 'low' },
    { path: 'games/spike_ball.png', priority: 'low' }
  ];
}
