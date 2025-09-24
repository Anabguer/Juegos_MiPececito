startMemoryGame() {
    console.log('🧠 Iniciando PezFlip...');
    
    // Crear overlay del juego (igual que los otros)
    const gameOverlay = document.createElement('div');
    gameOverlay.className = 'game-modal-overlay';
    gameOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    gameOverlay.innerHTML = `
        <div class="memory-game-container" style="
            background: linear-gradient(135deg, 
                rgba(30, 60, 114, 0.95) 0%, 
                rgba(42, 82, 152, 0.9) 100%);
            border-radius: 20px;
            padding: 0;
            max-width: 90vw;
            max-height: 90vh;
            width: 400px;
            height: 600px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0,0,0,.6);
            border: 2px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
        ">
            <!-- 🧠 CABECERA DEL JUEGO (igual que los otros) -->
            <div class="memory-game-header" style="
                background: linear-gradient(135deg, 
                    rgba(79, 195, 247, 0.3) 0%, 
                    rgba(129, 212, 250, 0.2) 100%);
                padding: 15px 20px;
                display: flex;
                flex-direction: column;
                border-bottom: 2px solid rgba(255, 255, 255, 0.25);
                gap: 8px;
            ">
                <div class="header-top" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div class="game-title" style="
                        color: white;
                        font-size: 18px;
                        font-weight: bold;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    ">🧠 PezFlip</div>
                    <div class="header-controls" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <button class="game-sound-btn" style="
                            background: rgba(255, 255, 255, 0.2);
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">
                            <img src="images/ui/sonidoOn.png" style="width: 20px; height: 20px;">
                        </button>
                        <button class="game-close-btn" style="
                            background: rgba(255, 82, 82, 0.8);
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-size: 18px;
                            color: white;
                        ">×</button>
                    </div>
                </div>
                <div class="game-stats" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                ">
                    <div class="score">Parejas: <span id="memory-score">0</span>/8</div>
                    <div class="moves">Movimientos: <span id="memory-moves">0</span></div>
                    <div class="time">Tiempo: <span id="memory-time">60</span>s</div>
                </div>
            </div>
            
            <!-- ⏰ BARRA DE TIEMPO -->
            <div class="memory-timer-bar" style="
                height: 6px;
                background: rgba(0, 0, 0, 0.3);
                margin: 0;
            ">
                <div class="memory-timer-fill" id="memory-timer-fill" style="
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #8BC34A);
                    width: 100%;
                    transition: width 1s linear;
                "></div>
            </div>
            
            <!-- 🎮 ÁREA DE JUEGO -->
            <div class="memory-stage-container" style="
                background: linear-gradient(135deg, 
                    rgba(79, 195, 247, 0.1) 0%, 
                    rgba(41, 182, 246, 0.05) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 14px;
                padding: 10px;
                margin: 10px;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div class="memory-board" id="memory-board" style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-template-rows: repeat(4, 1fr);
                    gap: 8px;
                    width: 280px;
                    height: 280px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                "></div>
            </div>
            
            <!-- 🎮 BOTÓN JUGAR -->
            <div class="memory-footer" style="
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <button class="memory-btn" id="memory-restart" style="
                    background: linear-gradient(45deg, #4CAF50, #66BB6A);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                ">JUGAR</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(gameOverlay);
    
    // Variables del juego
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timeLeft = 60;
    let timerId = null;
    let gameActive = false;
    
    // Emojis marinos para las cartas
    const EMOJIS = ['🐚', '🐟', '🐙', '🐠', '🦀', '🐬', '🦑', '🐡'];
    
    // Elementos del DOM
    const board = gameOverlay.querySelector('#memory-board');
    const scoreEl = gameOverlay.querySelector('#memory-score');
    const movesEl = gameOverlay.querySelector('#memory-moves');
    const timeEl = gameOverlay.querySelector('#memory-time');
    const timerFill = gameOverlay.querySelector('#memory-timer-fill');
    const restartBtn = gameOverlay.querySelector('#memory-restart');
    const closeBtn = gameOverlay.querySelector('.game-close-btn');
    const soundBtn = gameOverlay.querySelector('.game-sound-btn');
    
    // Función para crear las cartas
    function createCards() {
        board.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        gameActive = false;
        
        // Crear 8 pares (16 cartas)
        const cardData = [...EMOJIS, ...EMOJIS];
        for(let i = cardData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
        }
        
        cardData.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                opacity: 0;
                transform: scale(0.8);
            `;
            
            // Contenido de la carta (inicialmente oculto)
            card.innerHTML = `
                <div class="card-back" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, 
                        rgba(79, 195, 247, 0.3) 0%, 
                        rgba(41, 182, 246, 0.2) 100%);
                    border-radius: 6px;
                    font-size: 20px;
                ">?</div>
                <div class="card-front" style="
                    width: 100%;
                    height: 100%;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 6px;
                    font-size: 24px;
                ">${emoji}</div>
            `;
            
            card.addEventListener('click', () => flipCard(card));
            board.appendChild(card);
            cards.push(card);
        });
        
        updateUI();
    }
    
    // Función para voltear carta
    function flipCard(card) {
        if (!gameActive || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        flippedCards.push(card);
        
        // Mostrar el emoji
        const cardBack = card.querySelector('.card-back');
        const cardFront = card.querySelector('.card-front');
        cardBack.style.display = 'none';
        cardFront.style.display = 'flex';
        
        // Sonido de voltear
        if (window.audioManager) {
            window.audioManager.playSound('acierto');
        }
        
        if (flippedCards.length === 2) {
            moves++;
            updateUI();
            
            setTimeout(() => {
                checkMatch();
            }, 500);
        }
    }
    
    // Función para verificar coincidencia
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.emoji === card2.dataset.emoji) {
            // ¡Coincidencia!
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            
            // Sonido de acierto
            if (window.audioManager) {
                window.audioManager.playSound('nivelcompletado');
            }
            
            // Efecto de perlas
            createPearlEffect(card1);
            
            if (matchedPairs === 8) {
                // ¡Juego completado!
                setTimeout(() => {
                    endGame(true);
                }, 500);
            }
        } else {
            // No coincide, voltear de vuelta
            setTimeout(() => {
                const cardBack1 = card1.querySelector('.card-back');
                const cardFront1 = card1.querySelector('.card-front');
                const cardBack2 = card2.querySelector('.card-back');
                const cardFront2 = card2.querySelector('.card-front');
                
                cardBack1.style.display = 'flex';
                cardFront1.style.display = 'none';
                cardBack2.style.display = 'flex';
                cardFront2.style.display = 'none';
                
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }
        
        flippedCards = [];
    }
    
    // Función para crear efecto de perlas
    function createPearlEffect(card) {
        const rect = card.getBoundingClientRect();
        const pearl = document.createElement('div');
        pearl.innerHTML = '💎';
        pearl.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width/2}px;
            top: ${rect.top + rect.height/2}px;
            font-size: 20px;
            pointer-events: none;
            z-index: 10001;
            animation: pearlFly 1s ease-out forwards;
        `;
        
        document.body.appendChild(pearl);
        setTimeout(() => pearl.remove(), 1000);
    }
    
    // Función para actualizar UI
    function updateUI() {
        scoreEl.textContent = matchedPairs;
        movesEl.textContent = moves;
        timeEl.textContent = timeLeft;
        timerFill.style.width = `${(timeLeft / 60) * 100}%`;
    }
    
    // Función para iniciar timer
    function startTimer() {
        timerId = setInterval(() => {
            timeLeft--;
            updateUI();
            
            if (timeLeft <= 0) {
                clearInterval(timerId);
                endGame(false);
            }
        }, 1000);
    }
    
    // Función para mostrar cartas con efecto
    function showCardsEffect() {
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 50);
        });
    }
    
    // Función para terminar juego
    function endGame(won) {
        gameActive = false;
        if (timerId) clearInterval(timerId);
        
        // Sonido de fin
        if (window.audioManager) {
            window.audioManager.playSound(won ? 'nivelcompletado' : 'fail');
        }
        
        // Mostrar modal de fin
        const endModal = document.createElement('div');
        endModal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
        `;
        
        endModal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, 
                    rgba(30, 60, 114, 0.95) 0%, 
                    rgba(42, 82, 152, 0.9) 100%);
                border-radius: 20px;
                padding: 30px;
                text-align: center;
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.2);
            ">
                <h2 style="margin: 0 0 20px 0; font-size: 24px;">
                    ${won ? '🎉 ¡Felicidades!' : '⏰ Tiempo agotado'}
                </h2>
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    ${won ? '¡Completaste todas las parejas!' : 'Se acabó el tiempo'}
                </p>
                <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.8;">
                    Parejas: ${matchedPairs}/8<br>
                    Movimientos: ${moves}
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="restart-btn" style="
                        background: linear-gradient(45deg, #4CAF50, #66BB6A);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">JUGAR DE NUEVO</button>
                    <button class="close-btn" style="
                        background: linear-gradient(45deg, #f44336, #e57373);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">CERRAR</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(endModal);
        
        // Event listeners del modal de fin
        endModal.querySelector('.restart-btn').addEventListener('click', () => {
            endModal.remove();
            startGame();
        });
        
        endModal.querySelector('.close-btn').addEventListener('click', () => {
            endModal.remove();
            gameOverlay.remove();
            document.getElementById('gamesModal').style.display = 'flex';
        });
    }
    
    // Función para iniciar juego
    function startGame() {
        timeLeft = 60;
        createCards();
        showCardsEffect();
        
        setTimeout(() => {
            gameActive = true;
            startTimer();
        }, 2000);
        
        // Sonido de inicio
        if (window.audioManager) {
            window.audioManager.playSound('jugar');
        }
    }
    
    // Event listeners
    closeBtn.addEventListener('click', () => {
        if (timerId) clearInterval(timerId);
        gameOverlay.remove();
        document.getElementById('gamesModal').style.display = 'flex';
    });
    
    restartBtn.addEventListener('click', startGame);
    
    // Botón de sonido
    if (soundBtn) {
        const img = soundBtn.querySelector('img');
        if (img && window.audioManager) {
            img.src = window.audioManager.isMuted ? 'images/ui/sonidoOff.png' : 'images/ui/sonidoOn.png';
        }
        
        soundBtn.addEventListener('click', () => {
            if (window.audioManager) {
                window.audioManager.toggleMute();
                const img = soundBtn.querySelector('img');
                if (img) {
                    img.src = window.audioManager.isMuted ? 'images/ui/sonidoOff.png' : 'images/ui/sonidoOn.png';
                }
            }
        });
    }
    
    // Inicializar juego
    createCards();
    console.log('🧠 PezFlip iniciado');
}
