// 🍎 SISTEMA DE COMIDA COMPLETO
// Extraído del archivo ejemplos/movimiento_pez_final.html

class FoodSystem {
    constructor(game) {
        this.game = game;
        this.food = [];
        
        // Familias de colores para los pellets
        this.PELLET_FAMILIES = [
            {h:45, s:75, l:60},   // golden-orange  
            {h:25, s:85, l:65},   // orange-red
            {h:15, s:70, l:58},   // red-orange
            {h:35, s:80, l:62},   // yellow-orange
            {h:50, s:65, l:55},   // olive-gold
            {h:60, s:35, l:65},   // olive-muted
            {h:22, s:55, l:54}    // light brown
        ];
    }
    
    // Generar colores realistas para pellets
    pelletColors() {
        const base = this.PELLET_FAMILIES[Math.floor(Math.random() * this.PELLET_FAMILIES.length)];
        const h = this.vary(base.h, 5, 10, 70);
        const s = this.vary(base.s, 10, 20, 95);
        const l = this.vary(base.l, 8, 35, 85);
        const strokeL = Math.max(10, l - 22);
        const strokeS = Math.max(15, s - 15);
        
        return { 
            fill: `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`, 
            stroke: `hsl(${Math.round(h)} ${Math.round(strokeS)}% ${Math.round(strokeL)}%)` 
        };
    }
    
    // Soltar comida
    dropFood() {
        const x = Math.random() * this.game.canvas.width;
        const col = this.pelletColors();
        const r = 2.6 + Math.random() * 1.2;
        
        this.food.push({
            x: x,
            y: 10,
            vx: 0,
            vy: 6 + Math.random() * 6,
            bottomT: 0,
            colorFill: col.fill,
            colorStroke: col.stroke,
            r: r
        });
        
        console.log('🍎 Comida soltada en', x);
    }
    
    // Actualizar física y colisiones
    updateFood(deltaTime) {
        const h = this.game.canvas.height;
        const drag = 0.99;
        
        // Actualizar física de cada pellet
        for (const f of this.food) {
            if (f.bottomT > 0) {
                f.bottomT += deltaTime;
            } else {
                f.vy = Math.min(f.vy + 80 * deltaTime, 90);
                f.y += f.vy * deltaTime;
                f.x += f.vx * deltaTime;
                f.vx *= drag;
                
                if (f.y > h - 12) {
                    f.y = h - 12;
                    f.vy = 0;
                    f.vx = 0;
                    f.bottomT = 0.001;
                }
            }
        }
        
        // Colisiones con el pez
        for (let i = this.food.length - 1; i >= 0; i--) {
            const f = this.food[i];
            
            if (this.game.fish && this.game.dist(this.game.fish.x, this.game.fish.y, f.x, f.y) < 22) {
                this.food.splice(i, 1);
                
                // Reducir hambre significativamente
                this.game.gameState.needs.hunger = this.game.clamp(this.game.gameState.needs.hunger - 35, 0, 100);
                this.game.gameState.needs.dirt = this.game.clamp(this.game.gameState.needs.dirt + 8, 0, 100);
                
                // Efectos visuales
                this.game.labels.push({
                    x: this.game.fish.x,
                    y: this.game.fish.y - 12,
                    text: "¡Ñam!",
                    a: 1,
                    vy: 40,
                    life: 1.4
                });
                
                this.game.fish.happyBurst = Math.max(this.game.fish.happyBurst, 1.2);
                this.game.fish.spinKind = "eat";
                
                // Si está en crisis de hambre, limitar la reducción
                if (this.game.gameState.crisis.hunger) {
                    this.game.gameState.needs.hunger = Math.min(this.game.gameState.needs.hunger, 60);
                }
                
                this.game.updateCrisisFlags();
                this.game.updateNeedBars();
                
                console.log('🍎 ¡Pez comió! Hambre:', this.game.gameState.needs.hunger);
            } 
            // Eliminar comida vieja del fondo
            else if (f.bottomT > 0 && f.bottomT > 8) {
                this.food.splice(i, 1);
            }
        }
    }
    
    // Dibujar comida
    drawFood(ctx) {
        ctx.save();
        
        for (const f of this.food) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r || 3, 0, Math.PI * 2);
            ctx.fillStyle = f.colorFill || '#ffd166';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = f.colorStroke || '#9b7b0b';
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Encontrar comida más cercana
    nearestFood() {
        if (!this.food.length) return null;
        
        let best = null;
        let bestD = 1e9;
        
        for (const f of this.food) {
            const d = this.game.dist(this.game.fish.x, this.game.fish.y, f.x, f.y);
            if (d < bestD) {
                bestD = d;
                best = f;
            }
        }
        
        return best;
    }
    
    // Función helper
    vary(val, amt, min, max) {
        const v = val + (Math.random() * 2 - 1) * amt;
        return this.game.clamp(v, min, max);
    }
}

// Exportar para uso global
window.FoodSystem = FoodSystem;
