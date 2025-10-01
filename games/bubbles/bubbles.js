/**
 * 🫧 JUEGO DE BURBUJAS - Mi Pececito
 * Versión modular usando la plantilla base
 */

class BubblesGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            score: 0,
            level: 1,
            bestScore: 0,
            stars: 0,
            bubbles: [],
            gameTime: 0,
            maxTime: 30000, // 30 segundos por nivel
            startTime: 0,
            animationId: null
        };

        this.config = {
            bubbleSpawnRate: 2000, // Cada 2 segundos
            bubbleSpeed: 60,
            bubbleSize: { min: 30, max: 60 },
            goodBubbleChance: 0.7, // 70% de burbujas buenas
            levelMultiplier: 1.2,
            maxLevel: 10
        };

        this.elements = {};
        this.init();
    }

    init() {
        this.getElements();
        this.setupEventListeners();
        this.loadBestScore();
        this.updateUI();
        console.log('🫧 Juego de burbujas inicializado');
    }

    getElements() {
        this.elements = {
            // Contenedores
            gameOverlay: document.getElementById('gameOverlay'),
            gameContainer: document.getElementById('gameContainer'),
            gameStage: document.getElementById('gameStage'),
            
            // UI
            gameTitle: document.getElementById('gameTitle'),
            gameLevel: document.getElementById('gameLevel'),
            gameScore: document.getElementById('gameScore'),
            bestScore: document.getElementById('bestScore'),
            progressFill: document.getElementById('progressFill'),
            playButton: document.getElementById('playButton'),
            
            // Controles
            soundToggle: document.getElementById('soundToggle'),
            closeGame: document.getElementById('closeGame'),
            
            // Modal de resultados
            resultsModal: document.getElementById('resultsModal'),
            closeResults: document.getElementById('closeResults'),
            resultsTitle: document.getElementById('resultsTitle'),
            motivationMessage: document.getElementById('motivationMessage'),
            finalLevel: document.getElementById('finalLevel'),
            finalScore: document.getElementById('finalScore'),
            finalBest: document.getElementById('finalBest'),
            finalStars: document.getElementById('finalStars'),
            rewardReasons: document.getElementById('rewardReasons'),
            continueButton: document.getElementById('continueButton')
        };
    }

    setupEventListeners() {
        // Botón jugar
        this.elements.playButton.addEventListener('click', () => this.startGame());
        
        // Botón cerrar juego
        this.elements.closeGame.addEventListener('click', () => this.closeGame());
        
        // Botón sonido
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Modal de resultados
        this.elements.closeResults.addEventListener('click', () => this.closeResults());
        this.elements.continueButton.addEventListener('click', () => this.closeResults());
        
        // Click en burbujas
        this.elements.gameStage.addEventListener('click', (e) => this.handleBubbleClick(e));
    }

    loadBestScore() {
        const saved = localStorage.getItem('bubblesBestScore');
        if (saved) {
            this.gameState.bestScore = parseInt(saved);
        }
    }

    saveBestScore() {
        if (this.gameState.score > this.gameState.bestScore) {
            this.gameState.bestScore = this.gameState.score;
            localStorage.setItem('bubblesBestScore', this.gameState.bestScore.toString());
        }
    }

    startGame() {
        console.log('🫧 Iniciando juego de burbujas...');
        
        this.gameState.isPlaying = true;
        this.gameState.score = 0;
        this.gameState.level = 1;
        this.gameState.stars = 0;
        this.gameState.bubbles = [];
        this.gameState.startTime = Date.now();
        this.gameState.gameTime = 0;
        
        this.elements.playButton.textContent = 'JUGANDO...';
        this.elements.playButton.disabled = true;
        
        this.updateUI();
        this.startBubbleSpawn();
        this.gameLoop();
        
        // Reproducir sonido de inicio
        this.playSound('jugar');
    }

    startBubbleSpawn() {
        const spawnBubble = () => {
            if (this.gameState.isPlaying) {
                this.createBubble();
                const nextSpawn = this.config.bubbleSpawnRate / (this.gameState.level * this.config.levelMultiplier);
                setTimeout(spawnBubble, Math.max(500, nextSpawn));
            }
        };
        
        spawnBubble();
    }

    createBubble() {
        const stageRect = this.elements.gameStage.getBoundingClientRect();
        const isGood = Math.random() < this.config.goodBubbleChance;
        const size = this.config.bubbleSize.min + Math.random() * (this.config.bubbleSize.max - this.config.bubbleSize.min);
        
        const bubble = {
            id: Date.now() + Math.random(),
            x: Math.random() * (stageRect.width - size),
            y: stageRect.height - size,
            size: size,
            isGood: isGood,
            speed: this.config.bubbleSpeed + Math.random() * 20,
            drift: (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -this.config.bubbleSpeed - Math.random() * 20,
            element: null
        };

        // Crear elemento visual
        const bubbleEl = document.createElement('div');
        bubbleEl.className = `game-bubble ${isGood ? 'good' : 'bad'}`;
        bubbleEl.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${bubble.x}px;
            top: ${bubble.y}px;
            z-index: 999999;
            pointer-events: auto;
            opacity: 1;
        `;

        // Emoji de la burbuja
        const emoji = document.createElement('div');
        emoji.className = 'bubble-emoji';
        emoji.textContent = isGood ? 
            ['🐟', '🐠', '🐚', '🪸', '⭐'][Math.floor(Math.random() * 5)] :
            ['💀', '🦈', '⚠️', '🧨', '🪝'][Math.floor(Math.random() * 5)];
        
        bubbleEl.appendChild(emoji);
        bubble.element = bubbleEl;
        this.elements.gameStage.appendChild(bubbleEl);
        this.gameState.bubbles.push(bubble);

        console.log(`🫧 Burbuja creada: ${isGood ? 'buena' : 'mala'}, tamaño: ${size}px`);
    }

    gameLoop() {
        if (!this.gameState.isPlaying) return;

        const now = Date.now();
        this.gameState.gameTime = now - this.gameState.startTime;
        
        // Actualizar progreso
        const progress = Math.min(this.gameState.gameTime / this.gameState.maxTime, 1);
        this.elements.progressFill.style.width = `${progress * 100}%`;

        // Mover burbujas
        this.gameState.bubbles.forEach(bubble => {
            this.updateBubble(bubble);
        });

        // Verificar fin de nivel
        if (this.gameState.gameTime >= this.gameState.maxTime) {
            this.completeLevel();
            return;
        }

        this.gameState.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    updateBubble(bubble) {
        if (!bubble.element) return;

        const stageRect = this.elements.gameStage.getBoundingClientRect();
        
        // Actualizar posición
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // Aplicar deriva
        bubble.x += bubble.drift * 0.01;
        
        // Limitar X para que no se salga de los lados
        if (bubble.x < 0) {
            bubble.x = 0;
            bubble.vx *= -0.9;
        }
        if (bubble.x + bubble.size > stageRect.width) {
            bubble.x = stageRect.width - bubble.size;
            bubble.vx *= -0.9;
        }
        
        // Limitar Y - Solo por abajo (rebotar), arriba = perder si es buena
        if (bubble.y + bubble.size > stageRect.height) {
            bubble.y = stageRect.height - bubble.size;
            bubble.vy *= -0.9;
        }
        
        // Si llega arriba, perder si es buena
        if (bubble.y < 0) {
            if (bubble.isGood) {
                this.endGame(false, '¡Dejaste escapar una buena!');
                return;
            } else {
                this.removeBubble(bubble);
                return;
            }
        }
        
        // Actualizar posición visual
        bubble.element.style.left = `${bubble.x}px`;
        bubble.element.style.top = `${bubble.y}px`;
    }

    handleBubbleClick(e) {
        if (!this.gameState.isPlaying) return;

        const bubble = this.gameState.bubbles.find(b => 
            b.element && b.element.contains(e.target)
        );

        if (bubble) {
            this.clickBubble(bubble);
        }
    }

    clickBubble(bubble) {
        if (bubble.isGood) {
            this.gameState.score += 10 * this.gameState.level;
            this.playSound('acierto');
            console.log('🫧 Burbuja buena clickeada!');
        } else {
            this.endGame(false, '¡Tocaste una mala!');
            return;
        }

        this.removeBubble(bubble);
        this.updateUI();
    }

    removeBubble(bubble) {
        if (bubble.element) {
            bubble.element.remove();
        }
        const index = this.gameState.bubbles.indexOf(bubble);
        if (index > -1) {
            this.gameState.bubbles.splice(index, 1);
        }
    }

    completeLevel() {
        console.log('🫧 Nivel completado!');
        
        this.gameState.level++;
        this.gameState.stars++;
        
        if (this.gameState.level > this.config.maxLevel) {
            this.endGame(true, '¡Has completado todos los niveles!');
        } else {
            this.gameState.startTime = Date.now();
            this.gameState.gameTime = 0;
            this.updateUI();
            this.playSound('levelComplete');
        }
    }

    endGame(won, reason) {
        console.log(`🫧 Fin del juego: ${won ? 'Victoria' : 'Derrota'} - ${reason}`);
        
        this.gameState.isPlaying = false;
        
        if (this.gameState.animationId) {
            cancelAnimationFrame(this.gameState.animationId);
        }
        
        // Limpiar burbujas
        this.gameState.bubbles.forEach(bubble => this.removeBubble(bubble));
        
        // Guardar mejor puntuación
        this.saveBestScore();
        
        // Calcular estrellas ganadas
        const starsWon = won ? this.gameState.stars : Math.floor(this.gameState.stars / 2);
        
        // Mostrar resultados
        this.showResults(won, reason, starsWon);
        
        // Reproducir sonido
        this.playSound(won ? 'levelComplete' : 'fail');
    }

    showResults(won, reason, starsWon) {
        const title = this.elements.resultsTitle;
        const motivation = this.elements.motivationMessage;
        
        if (won) {
            title.textContent = '¡Perfecto! 🎉';
            title.className = 'results-title win';
            motivation.textContent = '¡Increíble! Has dominado este nivel 🌟';
        } else {
            title.textContent = '¡Fin de partida! 💔';
            title.className = 'results-title lose';
            motivation.textContent = '¡Sigue intentándolo! Cada partida te acerca más a la victoria 🎯';
        }
        
        this.elements.finalLevel.textContent = this.gameState.level;
        this.elements.finalScore.textContent = this.gameState.score;
        this.elements.finalBest.textContent = this.gameState.bestScore;
        this.elements.finalStars.textContent = starsWon;
        
        if (reason) {
            this.elements.rewardReasons.textContent = reason;
        }

        this.elements.resultsModal.style.display = 'flex';
    }

    closeResults() {
        this.elements.resultsModal.style.display = 'none';
        this.elements.playButton.textContent = 'JUGAR';
        this.elements.playButton.disabled = false;
        this.updateUI();
    }

    closeGame() {
        if (this.gameState.isPlaying) {
            this.endGame(false, 'Juego cancelado');
        }
        this.elements.gameOverlay.style.display = 'none';
    }

    toggleSound() {
        // Implementar lógica de sonido
        console.log('🔊 Toggle sonido');
    }

    playSound(soundName) {
        // Implementar reproducción de sonido
        console.log(`🔊 Reproduciendo: ${soundName}`);
    }

    updateUI() {
        this.elements.gameLevel.textContent = `NIVEL ${this.gameState.level}`;
        this.elements.gameScore.textContent = this.gameState.score;
        this.elements.bestScore.textContent = this.gameState.bestScore;
    }
}

// 🚀 INICIALIZAR EL JUEGO
document.addEventListener('DOMContentLoaded', () => {
    window.bubblesGame = new BubblesGame();
    console.log('🫧 Juego de burbujas cargado');
});
