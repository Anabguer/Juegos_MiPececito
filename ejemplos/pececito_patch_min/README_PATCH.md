# Patch: Comida que cae + pez que persigue con turbo

Archivos que debes **sobrescribir** en tu repo:

1. `src/core/Game.js` — integra `FoodSystem`, lo actualiza/dibuja y añade lógica de persecución.
2. `src/components/Fish/FishRenderer.js` — respeta el flag `turbo` y limpia el `target` al llegar.

Opcional: si no existía, ya está `src/food-system.js` (no lo toco).

## Qué cambia

- Se importa `FoodSystem` y se instancia: `this.food = new FoodSystem(this)`.
- En el `update(deltaTime)` del `Game` se llama `this.food.update(deltaTime)` y se inyecta una sección **FOOD CHASE** que:
  - Si hay pellets, fija `this.fish.setTarget({x,y})` al pellet más cercano.
  - Activa `this.fish.setTurbo(true)` para que vaya más rápido (puedes condicionar a hambre real cuando tengas `NeedsManager`).
- En `render()`, la comida se dibuja **antes** del pez: `this.food.render(ctx)`.

- En `FishRenderer.updatePhysics()`:
  - La velocidad de seguimiento usa **turbo solo si `this.fish.turbo`**.
  - Limpia `this.fish.target` al llegar cerca (umbral ~ tamaño del pez).
  - Actualiza el `facing` mirando hacia el objetivo.

## Cómo probar rápido

1. Construye o abre `index-working.html` (tiene botones de debug) o cualquier HTML que cree la instancia de `Game`.
2. Desde consola o un botón, llama: `game.dropFood()` (añadí el método en `Game`).
3. Verás los pellets caer despacio; el pez se dirigirá al más cercano. En “modo turbo” se nota más rápido.

Si tu HTML no tiene botón de soltar comida, añade uno:

```html
<button onclick="game.dropFood()">Soltar comida</button>
```

## Nota

Si usas Lottie para el pez, esto no afecta: el “seguimiento” solo cambia la física, no el renderizador.