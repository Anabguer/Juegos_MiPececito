console.log('🫧 BURBUJAS JS CARGADO - VERSIÓN OPTIMIZADA CON NIVELES');
console.log('🫧 TIMESTAMP: v=20250127v - FORZANDO RECARGA');
console.log('🫧 SISTEMA DE NIVELES ACTIVADO: 20 perlas → nivel 2, 30 perlas → nivel 3');

(function () {
  // ---------- ELEMENTOS ----------
  const playBtn = document.getElementById("playButton");
  const gameStage = document.getElementById("gameStage");
  const gameOverlay = document.getElementById("gameOverlay");
  const closeGame = document.getElementById("closeGame");

  const scoreEl = document.getElementById("gameScore");
  const bestEl = document.getElementById("bestScore");
  const levelEl = document.getElementById("gameLevel");

  const resultsModal = document.getElementById("resultsModal");
  const closeResults = document.getElementById("closeResults");
  const continueButton = document.getElementById("continueButton");

  const resultsTitle = document.getElementById("resultsTitle");
  const finalLevel = document.getElementById("finalLevel");
  const finalScore = document.getElementById("finalScore");
  const finalBest = document.getElementById("finalBest");
  const finalStars = document.getElementById("finalStars");
  const motivationMessage = document.getElementById("motivationMessage");
  const rewardReasons = document.getElementById("rewardReasons");

  // Elementos de sonido
  const soundToggle = document.getElementById("soundToggle");

  // ---------- ESTADO ----------
  let playing = false;
  let spawnTimer = null;
  let rafId = null;
  let bubbles = [];
  let score = 0;
  let best = Number(localStorage.getItem("bubbles_best") || "0");
  let level = 1;
  let pearlsNeeded = 20; // Perlas necesarias para el siguiente nivel

  bestEl.textContent = best;

  // Emojis: buenas (clicar) / malas (no tocar)
  const GOOD_EMOJIS = ["🐟", "🐠", "🐚", "🪸", "⭐"];
  const BAD_EMOJIS  = ["💀", "🦈", "⚠️", "🧨", "🪝"];

  // Config básica (ajusta a gusto)
  const CONFIG = {
    spawnEveryMs: 650,        // cada 0.65s una nueva
    speedMin: 90,             // px/s
    speedMax: 180,            // px/s
    sizeMin: 40,              // px
    sizeMax: 70,              // px
    badProb: 0.25,            // 25% malas
    scorePerGood: 1,          // +1 por buena
    levelSpeedMultiplier: 1.1, // 10% más rápido por nivel
  };

  // Función para calcular velocidad basada en nivel
  function getLevelSpeed() {
    const multiplier = Math.pow(CONFIG.levelSpeedMultiplier, level - 1);
    return {
      spawnEveryMs: Math.max(200, CONFIG.spawnEveryMs / multiplier), // Mínimo 200ms
      speedMin: CONFIG.speedMin * multiplier,
      speedMax: CONFIG.speedMax * multiplier,
    };
  }

  console.log('🫧 CONFIGURACIÓN CARGADA:', CONFIG);

  // ---------- UTILIDADES ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- SONIDO ----------
  function toggleSound() {
    if (window.parent && window.parent.audioManager) {
      // Si estamos en iframe, usar el audioManager del padre
      window.parent.audioManager.toggleMute();
      updateSoundButton();
    } else if (window.audioManager) {
      // Si estamos en la ventana principal
      window.audioManager.toggleMute();
      updateSoundButton();
    }
  }

  function updateSoundButton() {
    if (!soundToggle) return;
    
    const isMuted = (window.parent && window.parent.audioManager) 
      ? window.parent.audioManager.isMuted 
      : (window.audioManager ? window.audioManager.isMuted : false);
    
    const svg = soundToggle.querySelector('svg');
    if (svg) {
      if (isMuted) {
        // Icono de sonido silenciado
        svg.innerHTML = `
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
      } else {
        // Icono de sonido normal
        svg.innerHTML = `
          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
      }
    }
  }

  function playSound(soundName) {
    if (window.parent && window.parent.audioManager) {
      // Si estamos en iframe, usar el audioManager del padre
      window.parent.audioManager.playSound(soundName);
    } else if (window.audioManager) {
      // Si estamos en la ventana principal
      window.audioManager.playSound(soundName);
    }
  }

  function stageRect() {
    return gameStage.getBoundingClientRect();
  }

  // ---------- BUBBLES ----------
  function spawnBubble() {
    if (!playing) return;

    const rect = stageRect();
    if (!rect || rect.height < 10) {
      // Si el stage no tiene altura aún, reintenta en breve
      setTimeout(spawnBubble, 100);
      return;
    }

    const levelSpeed = getLevelSpeed();
    const isBad = Math.random() < CONFIG.badProb;
    const size = rand(CONFIG.sizeMin, CONFIG.sizeMax);
    const x = rand(0, Math.max(0, rect.width - size));
    const y = rect.height - size - 2; // un pelín por encima del borde
    const speed = rand(levelSpeed.speedMin, levelSpeed.speedMax); // px/s

    // DOM
    const el = document.createElement("div");
    el.className = `game-bubble ${isBad ? "bad" : "good"}`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.willChange = "transform";

    const emoji = document.createElement("div");
    emoji.className = "bubble-emoji";
    emoji.textContent = isBad ? choice(BAD_EMOJIS) : choice(GOOD_EMOJIS);
    el.appendChild(emoji);

    gameStage.appendChild(el);

    const bubble = {
      el,
      isBad,
      x,
      y,
      size,
      speed,   // px/s hacia arriba
      alive: true,
    };

    // Click handler
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (!bubble.alive || !playing) return;

    if (bubble.isBad) {
      // clicaste una mala → pierdes
      playSound('fail');
      lose("Has tocado una burbuja peligrosa.");
    } else {
      // buena → sumas y desaparece
      score += CONFIG.scorePerGood;
      scoreEl.textContent = score;
      playSound('acierto');
      
      // Verificar si se puede subir de nivel ANTES de hacer pop
      console.log(`🫧 SCORE: ${score}, PEARLS NEEDED: ${pearlsNeeded}`);
      if (score >= pearlsNeeded) {
        console.log('🎉 ¡SUBIENDO DE NIVEL!');
        levelUp();
      }
      
      pop(bubble);
    }
    });

    bubbles.push(bubble);
  }

  function pop(bubble) {
    if (!bubble.alive) return;
    console.log('💥 EXPLOTANDO BURBUJA:', bubble);
    bubble.alive = false;
    
    // Capturar el translateY actual para mantener la posición
    const rect = stageRect();
    const currentTranslateY = bubble.y - (rect.height - bubble.size - 2);
    
    bubble.el.style.transition = "transform 0.2s ease, opacity 0.2s ease";
    bubble.el.style.opacity = "0";
    // Mantener el translateY actual y aplicar scale
    bubble.el.style.transform = `translateY(${currentTranslateY}px) scale(1.5)`;
    console.log('💥 ESTILOS APLICADOS:', {
      transition: bubble.el.style.transition,
      opacity: bubble.el.style.opacity,
      transform: bubble.el.style.transform,
      currentTranslateY: currentTranslateY
    });
    setTimeout(() => {
      if (bubble.el && bubble.el.parentNode) {
        bubble.el.parentNode.removeChild(bubble.el);
        console.log('💥 BURBUJA ELIMINADA');
      }
    }, 200);
  }

  function clearBubbles() {
    bubbles.forEach(b => {
      if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
    });
    bubbles = [];
  }

  // ---------- GAME LOOP ----------
  let lastTs = 0;
  function loop(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000; // segundos
    lastTs = ts;

    const rect = stageRect();
    const topLimit = -80; // cuando y < esto, consideramos "salió por arriba"

    // mover
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      if (!b.alive) continue;
      b.y -= b.speed * dt; // subir

      // aplicar transform
      b.el.style.transform = `translateY(${b.y - (rect.height - b.size - 2)}px)`;

    // ¿se escapó por arriba?
    if (b.y <= topLimit) {
      if (!b.isBad) {
        // se escapó una buena → pierdes
        playSound('fail');
        lose("¡Se escapó una burbuja buena!");
        return; // paramos el loop al perder
      } else {
        // mala que se va por arriba: simplemente desaparece
        pop(b);
      }
    }
    }

    // limpiar muertas del array
    bubbles = bubbles.filter(b => b.alive);

    rafId = requestAnimationFrame(loop);
  }

  // ---------- NIVELES ----------
  function levelUp() {
    console.log(`🎉 LEVEL UP! Nivel anterior: ${level}`);
    level++;
    pearlsNeeded = 20 + (level - 1) * 10; // 20, 30, 40, 50...
    levelEl.textContent = `NIVEL ${level}`;
    console.log(`🎉 NUEVO NIVEL: ${level}, PEARLS NEEDED: ${pearlsNeeded}`);
    
    // Actualizar velocidad del spawner
    if (spawnTimer) {
      clearInterval(spawnTimer);
      const levelSpeed = getLevelSpeed();
      console.log(`🎉 NUEVA VELOCIDAD: spawnEveryMs=${levelSpeed.spawnEveryMs}, speedMin=${levelSpeed.speedMin}, speedMax=${levelSpeed.speedMax}`);
      spawnTimer = setInterval(spawnBubble, levelSpeed.spawnEveryMs);
    }
    
    playSound('levelComplete');
    console.log(`🎉 ¡NIVEL ${level}! Necesitas ${pearlsNeeded} perlas para el siguiente nivel`);
  }

  // ---------- CONTROL ----------
  function startGame() {
    if (playing) return; // evitar dobles inicios
    playing = true;
    score = 0;
    level = 1;
    pearlsNeeded = 20; // Reiniciar perlas necesarias
    scoreEl.textContent = score;
    levelEl.textContent = `NIVEL ${level}`;
    lastTs = 0;

    clearBubbles();

    // Reproducir sonido de inicio
    playSound('jugar');

    // Spawner independiente del loop de animación
    const levelSpeed = getLevelSpeed();
    spawnBubble();
    spawnTimer = setInterval(spawnBubble, levelSpeed.spawnEveryMs);

    // Animación
    rafId = requestAnimationFrame(loop);
  }

  function stopGame() {
    playing = false;
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function lose(reason) {
    stopGame();

    // actualizar récord
    if (score > best) {
      best = score;
      localStorage.setItem("bubbles_best", String(best));
    }

    // 🎉 ACTUALIZAR DIVERSIÓN DEL PEZ PRINCIPAL
    updateFishFun(score, level);

    // Modal de resultados
    resultsTitle.textContent = "¡Fin de partida!";
    resultsTitle.classList.remove("win");
    resultsTitle.classList.add("lose");
    finalLevel.textContent = String(level);
    finalScore.textContent = String(score);
    finalBest.textContent = String(best);
    finalStars.textContent = String(Math.max(0, Math.floor(score / 5)));
    motivationMessage.textContent = "¡Sigue intentándolo! Cada partida te acerca más a la victoria 🎯";
    rewardReasons.textContent = `Motivo: ${reason}`;

    bestEl.textContent = best;

    resultsModal.style.display = "flex";
  }

  function closeResultsModal() {
    resultsModal.style.display = "none";
    // Limpieza visual de burbujas por si quedó alguna
    clearBubbles();
  }

  // ---------- EVENTOS UI ----------
  playBtn?.addEventListener("click", () => {
    closeResultsModal();
    startGame();
  });

  closeGame?.addEventListener("click", () => {
    console.log('🫧 CERRANDO JUEGO DE BURBUJAS...');
    stopGame();
    clearBubbles();
    
    // Usar postMessage para comunicarse con el padre
    console.log('🫧 Enviando mensaje closeBubblesGame al padre...');
    window.parent.postMessage('closeBubblesGame', '*');
  });

  closeResults?.addEventListener("click", closeResultsModal);
  continueButton?.addEventListener("click", () => {
    closeResultsModal();
    startGame();
  });

  // Clic vacío en el stage: no hace nada, pero evitamos bubbling raro
  gameStage?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Event listener para el botón de sonido
  soundToggle?.addEventListener("click", toggleSound);

  // Actualizar el botón de sonido al cargar
  updateSoundButton();

  // Opcional: abrir overlay si venías de otro flujo
  // 🎉 FUNCIÓN PARA ACTUALIZAR DIVERSIÓN DEL PEZ PRINCIPAL
  function updateFishFun(score, level) {
    try {
      // Calcular diversión basada en puntuación y nivel
      // Fórmula: 1 punto de diversión por cada 2 puntos de score + bonus por nivel
      let funIncrease = Math.floor(score / 2);
      
      // Bonus por nivel alcanzado
      const levelBonus = (level - 1) * 5; // +5 diversión por cada nivel extra
      funIncrease += levelBonus;
      
      // Mínimo de diversión (aunque pierdas)
      funIncrease = Math.max(3, funIncrease);
      
      // Máximo de diversión por partida
      funIncrease = Math.min(30, funIncrease);
      
      console.log(`🎉 ACTUALIZANDO DIVERSIÓN DEL PEZ:`, {
        score: score,
        level: level,
        funIncrease: funIncrease,
        levelBonus: levelBonus
      });
      
      // Intentar acceder al juego principal
      if (window.parent && window.parent.game) {
        const parentGame = window.parent.game;
        
        // Aumentar diversión del pez
        const oldFun = parentGame.gameState.needs.fun;
        parentGame.gameState.needs.fun = Math.min(100, parentGame.gameState.needs.fun + funIncrease);
        
        // Actualizar UI
        parentGame.updateCrisisFlags();
        parentGame.updateNeedBars();
        parentGame.saveGame();
        
        console.log(`🎉 DIVERSIÓN ACTUALIZADA: ${oldFun}% → ${parentGame.gameState.needs.fun}% (+${funIncrease})`);
        
        // Mostrar mensaje de diversión
        const messages = [
          `¡Me divertí mucho! +${funIncrease} diversión`,
          `¡Qué juego tan divertido! +${funIncrease} diversión`,
          `¡Me encanta jugar contigo! +${funIncrease} diversión`,
          `¡Eso fue genial! +${funIncrease} diversión`
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        parentGame.showFishMessage(randomMessage, '#4CAF50');
        
      } else {
        console.warn('⚠️ No se pudo acceder al juego principal para actualizar diversión');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando diversión del pez:', error);
    }
  }

  gameOverlay.style.display = "flex";
})();
