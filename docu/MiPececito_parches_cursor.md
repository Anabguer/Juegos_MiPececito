# Mi Pececito — Plan de Parche (para Cursor)

> **Propósito:** dejar el juego coherente y fácil de mantener.  
> **Formato:** lista de tareas para Cursor + bloques de código “pegar y listo”.  
> **Ámbito:** `Mi pececito/index.html` (el “todo‑en‑uno” que manda ahora mismo).

---

## ✅ Problemas detectados (resumen corto)

1. **Limpieza desincronizada:** la barra baja antes de ver burbujas.
2. **Comida a media pecera:** pez y pellets usan suelos distintos.
3. **El pez no persigue/comedor siempre:** condiciones y prioridades compiten.
4. **Suciedad incoherente al tirar 5 pellets:** ensucias al tirar en lugar de comer/pudrirse.
5. **Reset al poner huevo incompleto:** quedan partículas, estrellas/monedas vivas.
6. **Tiempos por etapa (bebé/joven/adulto) dispersos y difíciles de cambiar.**

---

## 🗺️ Plan (visión general)

- **Unificar “suelo”** para pez y comida.
- **Perseguir y comer siempre** si hay pellet (el dedo tiene prioridad configurable).
- **Suciedad realista:** solo al *comer* o *pudrirse*, no al *tirar*.
- **Limpieza con máquina de estados:** *emit → fade → settle* (primero ves la ráfaga, luego baja la barra).
- **Config central por etapa** (bebé/joven/adulto) con horas y magnitudes en un objeto.
- **Reset limpio al poner huevo** que apaga spawners/arrays/timers.

---

## 🧩 Tarea 1 — Añadir utilidades y configuración global

> **Objetivo:** tener un **suelo único** y **rates por etapa** en un único lugar.

1. **Añade** (cerca de `viewW`/`viewH`) esta función para un **suelo único** coherente con la barra inferior:

```js
// ——— SUELO ÚNICO COHERENTE CON LA BARRA INFERIOR ———
getFloorY() {
  // Si quieres medir la barra real:
  // const bar = document.querySelector('.bottom-bar');
  // const uiBottom = bar ? bar.getBoundingClientRect().height : 100;

  const uiBottom = 100;  // ← ajusta si tu barra real es otra
  const safeGap  = 12;   // margen para no pisar la UI
  return this.viewH() - (uiBottom + safeGap);
}
```

2. **Añade** (una sola vez, por ejemplo encima de `updateAutoNeeds`) la **config por etapa**:

```js
// ——— CONFIG POR ETAPA ———
const STAGE_RATES = {
  baby:  { hungerHours: 4, dirtHours: 6, funHours: 3, eatReduce: 30, dirtPerPellet: 3, dirtPerRotten: 6 },
  young: { hungerHours: 6, dirtHours: 8, funHours: 4, eatReduce: 25, dirtPerPellet: 2, dirtPerRotten: 5 },
  adult: { hungerHours: 8, dirtHours:10, funHours: 5, eatReduce: 20, dirtPerPellet: 1, dirtPerRotten: 4 },
};

function getStageCfg(state) {
  const st = state?.stage || 'baby';
  return STAGE_RATES[st] || STAGE_RATES.baby;
}
```

---

## 🍽️ Tarea 2 — Comida: caída, suelo y consumo

> **Objetivo:** pellets y pez comparten el mismo **suelo**, y el pez **come siempre**.

1. **En `updateFood(deltaTime)`**, usa **getFloorY()** para fijar el suelo del pellet:

```js
const floorY = this.getFloorY();
if (f.y > floorY) {
  f.y = floorY;
  f.vy = 0;
  f.vx = 0;
  f.bottomT = Math.max(0.001, f.bottomT || 0.001);
}
```

2. **Comer y ensuciar de forma coherente por etapa** (reemplaza el bloque de “comer”):

```js
const cfg = getStageCfg(this.gameState);
this.gameState.needs.hunger = this.clamp(this.gameState.needs.hunger - cfg.eatReduce, 0, 100);
this.gameState.needs.dirt   = this.clamp(this.gameState.needs.dirt + cfg.dirtPerPellet, 0, 100);
this.addLabel(this.fish.x, this.fish.y - 30, 'Ñam', '#ffff00', 1.2);
window.audioManager?.playSound('eat');
this.updateNeedBars();
```

3. **Pudrir pellet** (cuando `f.bottomT` supere el umbral que ya tengas, añade):

```js
const cfg = getStageCfg(this.gameState);
this.gameState.needs.dirt = this.clamp(this.gameState.needs.dirt + cfg.dirtPerRotten, 0, 100);
```

> Nota: **No** sumes suciedad al **tirar** comida. Solo al **comer** o **pudrirse**.

---

## 🐟 Tarea 3 — Persecución y prioridades del pez

> **Objetivo:** el pez **SIEMPRE** persigue comida si hay pellets, y decides si el **dedo** tiene prioridad.

1. En `updateFishMovement(deltaTime)`, quita la condición `this.gameState.needs.hunger > 1` y deja:

```js
// — Perseguir comida sin check de hambre —
if (this.food.length > 0) {
  let closest = null, closestDist = Infinity;
  for (const f of this.food) {
    const d = this.dist(fish.x, fish.y, f.x, f.y);
    if (d < closestDist) { closest = f; closestDist = d; }
  }
  if (closest) {
    const dx = closest.x - fish.x, dy = closest.y - fish.y;
    const len = Math.hypot(dx, dy) || 1;
    targetV.vx = (dx / len) * 140; // más rápido hacia comida
    targetV.vy = (dy / len) * 140;
  }
}
```

2. **Unifica el suelo del pez** (sustituye el `bottomLimit` por):

```js
const bottomLimit = this.getFloorY();
```

3. **Prioridad dedo vs comida**: el **bloque que vaya más tarde “gana”**.  
   - Si quieres que **dedo gane siempre**, procesa **dedo después** de comida.  
   - Si quieres que **comida gane**, mueve el bloque de comida **después** del dedo.

---

## 🧼 Tarea 4 — Limpieza sincronizada (máquina de estados)

> **Objetivo:** primero **ves** la ráfaga, luego **baja** la barra con easing, y termina en 0 cuando se van las burbujas.

1. **Reemplaza `startCleaning()`** por:

```js
startCleaning() {
  window.audioManager?.playSound('clean');
  this.cleanBubbles = [];
  this.cleaning = { phase: 'emit', t: 0, dur: 2.6, dirtStart: this.gameState.needs.dirt };
  this.emitCleanBubblesBurst?.(3); // ráfaga inicial (añadimos helper abajo)

  if (this.fish) { this.fish.happyBurst = 3.2; this.fish.spinKind = "clean"; }
}
```

2. **Añade** la helper de ráfagas discretas (si no existe):

```js
emitCleanBubblesBurst(bursts = 2) {
  const W = this.viewW(), H = this.viewH();
  const vents = Math.max(16, Math.floor(W / 24));
  for (let b = 0; b < bursts; b++) {
    for (let i = 0; i < vents; i++) {
      const baseX = (i + 0.5) * (W / vents) + (Math.random() - 0.5) * 8;
      for (let k = 0; k < 2; k++) {
        const vy  = 260 + Math.random() * 120;
        const y0  = H - 1 + Math.random() * 0.5;
        const dur = (H + 24) / vy;
        const x0  = this.clamp(baseX + (Math.random() - 0.5) * 6, 2, W - 2);
        this.cleanBubbles.push({ x0, y0, vy, dur, t:0, r: 3 + Math.random()*4, opacity:0.6 + Math.random()*0.4 });
      }
    }
  }
  if (this.cleanBubbles.length > 1400) {
    this.cleanBubbles.splice(0, this.cleanBubbles.length - 1400);
  }
}
```

3. **Reemplaza `updateCleaning(deltaTime)`** por:

```js
updateCleaning(deltaTime) {
  // mover burbujas
  const H = this.viewH();
  for (const b of (this.cleanBubbles || [])) {
    b.t += deltaTime;
    const p = Math.min(1, b.t / (b.dur || 1));
    b.y = b.y0 - p * (H + 24);
  }
  if (this.cleanBubbles) {
    for (let i = this.cleanBubbles.length - 1; i >= 0; i--) {
      const b = this.cleanBubbles[i];
      if (b.t >= (b.dur || 1) || b.y < -12) this.cleanBubbles.splice(i, 1);
    }
  }

  if (!this.cleaning) return;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  if (this.cleaning.phase === 'emit') {
    this.cleaning.t += deltaTime;
    if (this.cleaning.t >= 0.35) {
      this.cleaning.phase = 'fade';
      this.cleaning.t = 0;
    }
    return; // aún no bajamos la suciedad
  }

  if (this.cleaning.phase === 'fade') {
    this.cleaning.t += deltaTime;
    const t = this.clamp(this.cleaning.t / this.cleaning.dur, 0, 1);
    const p = easeOutCubic(t);
    this.gameState.needs.dirt = this.clamp((1 - p) * this.cleaning.dirtStart, 0, 100);
    this.updateNeedBars();

    // ráfagas discretas durante el fade
    this.cleaning._tick = (this.cleaning._tick || 0) + deltaTime;
    if (this.cleaning._tick > 0.5) {
      this.emitCleanBubblesBurst(1);
      this.cleaning._tick = 0;
    }

    if (t >= 1) {
      this.cleaning.phase = 'settle';
      this.cleaning.t = 0;
    }
    return;
  }

  if (this.cleaning.phase === 'settle') {
    if (!this.cleanBubbles || this.cleanBubbles.length === 0) {
      this.gameState.needs.dirt = 0;
      this.updateNeedBars();
      this.cleaning = null; // fin
    }
  }
}
```

---

## ⏱️ Tarea 5 — Auto‑necesidades con la config por etapa

> **Objetivo:** tiempos claros y cambiables en un solo sitio.

**Reemplaza `updateAutoNeeds(deltaTime)`** por:

```js
updateAutoNeeds(deltaTime) {
  if (!this.fish || this.gameState.stage === 'egg') return;

  const cfg = getStageCfg(this.gameState);
  const hungerInc = (100 / (cfg.hungerHours * 3600)) * deltaTime;
  const dirtInc   = (100 / (cfg.dirtHours   * 3600)) * deltaTime;
  const funDec    = (100 / (cfg.funHours    * 3600)) * deltaTime;

  this.gameState.needs.hunger = this.clamp(this.gameState.needs.hunger + hungerInc, 0, 100);
  this.gameState.needs.dirt   = this.clamp(this.gameState.needs.dirt   + dirtInc,   0, 100);
  this.gameState.needs.fun    = this.clamp(this.gameState.needs.fun    - funDec,    0, 100);
}
```

---

## 🥚 Tarea 6 — Reset real al poner huevo

> **Objetivo:** apagar todo lo que no debe seguir en modo huevo.

1. **Añade**

```js
resetForEgg() {
  this.food = [];
  this.cleanBubbles = [];
  this.labels = [];
  this.flyers = [];
  this.fingerTarget = null;
  this.cleaning = null;

  this.gameState.needs = { hunger: 15, dirt: 0, fun: 95 };
  this.updateNeedBars?.();
  this.gameState.stage = 'egg';

  // Si tienes contadores de monedas/estrellas, pon sus valores de inicio acordados
  // this.gameState.coins = 0;
  // this.gameState.stars = 0;
}
```

2. **Llama** a `resetForEgg()` dentro de tu flujo de “colocar huevo” (donde antes reiniciabas parcialmente).

---

## 🔁 Tarea 7 — Orden del bucle `update` (opcional pero recomendado)

> **Objetivo:** evitar “saltos visuales” y estados cruzados.

Orden sugerido:

```js
update(deltaTime) {
  // 1) spawns y entradas
  // 2) físicas ligeras
  this.updateFood(deltaTime);
  this.updateCleaning(deltaTime);

  // 3) simulación de necesidades (pausada si limpieza en fade)
  if (!this.cleaning || this.cleaning.phase === 'idle') {
    this.updateAutoNeeds(deltaTime);
  }
  this.updateCrisisFlags();

  // 4) comportamiento del pez
  this.updateFishMovement(deltaTime);

  // 5) partículas/labels
  this.updateTinyBubbles(deltaTime);
  this.updateFlyers(deltaTime);
  this.updateLabels(deltaTime);

  // 6) UI y progresos
  this.updateUI();
  this.checkForAlbumEvents();
  this.checkEvolution();
}
```

---

## 🧪 Checklist de prueba rápida

- [ ] Los pellets **caen** hasta justo encima de la barra inferior.
- [ ] El pez **baja** hasta la misma altura y **come siempre** que toca, con “Ñam” + sonido.
- [ ] Tirar 5 pellets **no** sube media barra de suciedad de golpe; solo sube al **comer** o **pudrirse**.
- [ ] Al pulsar **Limpiar**, primero **ves ráfaga**, luego la **barra baja suave**, termina en **0** cuando se van las burbujas.
- [ ] Cambiar horas por etapa es tocar **`STAGE_RATES`** (una sola línea).
- [ ] Al poner **huevo**, se apagan burbujas, comida, labels, etc. (no quedan cosas vivas).

---

## 📝 Notas útiles

- **Prioridad dedo/comida**: decide con el **orden** de bloques en `updateFishMovement`. El que vaya **después** gana.
- **Tuneo fino**: si ves que la limpieza baja “demasiado rápido”, sube `dur` (p. ej., `3.4`).
- **UI inferior real**: si tu barra mide otra altura, cambia `uiBottom` en `getFloorY()` o calcula el alto real con `getBoundingClientRect()`.

---

## 💬 ¿Qué cambiar a futuro?

- Extraer cada sistema a módulos pequeños (food.js, fish.js, clean.js).
- Mover **constantes** (velocidades, radios, umbrales) a un `config.js`.
- Añadir **tests visuales** sencillos: mini‑escenas que fuerzan casos (pellet podrido, limpieza en curso, etc.).

---

**Listo.** Con estas tareas, el juego vuelve a obedecer y tú recuperas el control sin pelearte 8 horas por un sonido.
