# Agent Setup

This file tells the AI agent what tools and commands this repo uses.

## Environment requirements

- **Node.js** 20+
- **npm** 10+

## Dependency installation

```bash
npm install
```

## Commands

| Task | Command |
|---|---|
| Run tests | `npm test` |
| Build for production | `npm run build` |
| Dev server | `npm start` |

## Tech stack

- **Language**: Vanilla JavaScript (no TypeScript, no JSX)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Bundler**: Vite 7
- **Tests**: Jest 30 with jsdom (`testEnvironment: jsdom` set in `package.json`)

## Notes

- No build step needed to run tests — Jest handles it directly
- The Tailwind CSS entry point is `style.css` — it starts with `@import "tailwindcss"`
- `vite.config.js` registers the `@tailwindcss/vite` plugin (no PostCSS config needed)
- `game.js` contains all game logic; `game.test.js` contains all tests
- The `winning` CSS class is added by JS and must be preserved for tests to pass
