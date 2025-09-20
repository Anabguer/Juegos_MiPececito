// 🐟 CONFIGURACIÓN DE PECES
// ========================
// Todas las características visuales y de comportamiento

export const FISH_CONFIGS = {
  baby: {
    // 📐 Dimensiones
    size: 46,
    bodyScale: { x: 1.05, y: 0.78 },
    
    // 🎨 Colores (usando variables CSS)
    body: 'var(--fish-baby-body)',
    tail: 'var(--fish-baby-tail)', 
    fin: 'var(--fish-baby-fin)',
    stripeColor: 'var(--fish-baby-stripe)',
    
    // 👁️ Características visuales
    eyeScale: 1.6,        // Ojos grandes de bebé
    stripeWidth: 0.32,    // Franja ancha
    hasChupete: true,     // Tiene chupete
    
    // 🏊 Comportamiento
    baseSpeed: 120,
    followSpeed: 260,
    wobbleFreq: 6,
    bubbleRate: 1.0,
    
    // 🍎 Interacciones
    respondsToFood: true,  // Solo el bebé persigue comida
    turboMultiplier: 1.6,
    
    // 🎯 Límites de movimiento
    padding: 70,
    angleLimit: 70 * Math.PI / 180
  },
  
  young: {
    // 📐 Dimensiones  
    size: 52,
    bodyScale: { x: 1.05, y: 0.78 },
    
    // 🎨 Colores
    body: 'var(--fish-young-body)',
    tail: 'var(--fish-young-tail)',
    fin: 'var(--fish-young-fin)', 
    stripeColor: 'var(--fish-young-stripe)',
    
    // 👁️ Características visuales
    eyeScale: 1.25,       // Ojos medianos
    stripeWidth: 0.20,    // Franja más estrecha
    hasChupete: false,    // Sin chupete
    finStyle: 'elongated', // Aleta alargada
    
    // 🏊 Comportamiento
    baseSpeed: 130,
    followSpeed: 270,
    wobbleFreq: 6,
    bubbleRate: 0.8,
    
    // 🍎 Interacciones
    respondsToFood: false, // No persigue comida
    turboMultiplier: 1.65,
    
    // 🎯 Límites de movimiento
    padding: 72,
    angleLimit: 70 * Math.PI / 180
  },
  
  adult: {
    // 📐 Dimensiones
    size: 60,
    bodyScale: { x: 1.06, y: 0.80 },
    
    // 🎨 Colores
    body: 'var(--fish-adult-body)',
    tail: 'var(--fish-adult-tail)',
    fin: 'var(--fish-adult-fin)',
    stripeColor: 'var(--fish-adult-stripe)',
    
    // 👁️ Características visuales
    eyeScale: 0.95,       // Ojos pequeños de adulto
    stripeWidth: 0.12,    // Franja muy fina
    hasChupete: false,    // Sin chupete
    finStyle: 'large',    // Aletas grandes y elegantes
    
    // 🏊 Comportamiento
    baseSpeed: 125,
    followSpeed: 265,
    wobbleFreq: 5.6,      // Aleteo más pausado
    bubbleRate: 0.6,
    
    // 🍎 Interacciones
    respondsToFood: false, // No persigue comida
    turboMultiplier: 1.6,
    
    // 🎯 Límites de movimiento
    padding: 78,
    angleLimit: 70 * Math.PI / 180
  }
};

// 🎯 FUNCIONES HELPER

// Obtener configuración por etapa
export function getFishConfig(stage) {
  return FISH_CONFIGS[stage] || FISH_CONFIGS.baby;
}

// Calcular tamaño responsivo
export function getResponsiveSize(baseSize, screenWidth) {
  if (screenWidth <= 480) return baseSize * 0.85;
  if (screenWidth <= 768) return baseSize * 0.92;
  return baseSize;
}

// Obtener colores para canvas (convierte CSS vars a hex)
export function getFishColors(stage) {
  const config = getFishConfig(stage);
  
  // Mapeo de variables CSS a valores hex
  const colorMap = {
    'var(--fish-baby-body)': '#d9ccff',
    'var(--fish-baby-tail)': '#ff9ecf', 
    'var(--fish-baby-fin)': '#ffd0e2',
    'var(--fish-baby-stripe)': '#ffba7a',
    
    'var(--fish-young-body)': '#b1a1ff',
    'var(--fish-young-tail)': '#f191cd',
    'var(--fish-young-fin)': '#f1c4e4',
    'var(--fish-young-stripe)': '#ffa960',
    
    'var(--fish-adult-body)': '#5a48c8',
    'var(--fish-adult-tail)': '#d073c6',
    'var(--fish-adult-fin)': '#e2a8d6', 
    'var(--fish-adult-stripe)': '#ff9745'
  };
  
  return {
    body: colorMap[config.body] || config.body,
    tail: colorMap[config.tail] || config.tail,
    fin: colorMap[config.fin] || config.fin,
    stripeColor: colorMap[config.stripeColor] || config.stripeColor
  };
}

