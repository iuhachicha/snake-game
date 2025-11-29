# TypeScript Snake Game

A classic snake game implemented with **Preact** and TypeScript, bundled by Vite for a quick development workflow. The snake can be controlled via the keyboard (Arrow keys or WASD) and the game speeds up slightly every time you eat food.

## Prerequisites

- Node.js 18 or newer
- npm (comes with Node.js)

## Getting Started

```bash
npm install        # install dependencies
npm run dev        # start the local dev server (defaults to http://localhost:5173)
```

When the dev server is running, open the printed URL in your browser and start playing.

## Available Scripts

- `npm run dev` – start Vite in development mode with hot module replacement.
- `npm run build` – create a production build in the `dist/` directory.
- `npm run preview` – serve the production build locally to verify the output.

## Gameplay

- Use `Arrow` keys or `WASD` to steer the snake.
- Eat the red food to grow and increase your score.
- Avoid running into the walls or your own body – that ends the game.
- Click *Play Again* or press `Space` / `Enter` to restart after a game over.
