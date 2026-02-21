# Tic Tac Toe

## Description

A browser-based, two-player Tic Tac Toe game built with plain HTML5, CSS3, and vanilla JavaScript — no frameworks, no build step required.

## Features

- **Turn-based play** — players alternate between X and O on a shared device.
- **Win detection** — all 8 winning lines are checked after every move.
- **Draw detection** — a draw is declared when all 9 cells are filled with no winner.
- **Winning-cell highlight** — the three cells that form the winning line receive a distinct visual style.
- **Result banner** — a prominent banner announces the winner or a draw at the end of each game.
- **Restart functionality** — a "Restart Game" button resets the board and all state to their initial values.
- **Accessible markup** — the board uses ARIA `role="grid"` / `role="gridcell"` attributes and an `aria-live` region so screen readers announce turn changes and results.
- **Responsive design** — the layout adapts to different viewport sizes via CSS custom properties and a fluid grid.
- **Reduced-motion support** — CSS animations respect the user's `prefers-reduced-motion` media preference.

---

## Technical Design

### Stack

| Layer | Technology |
|---|---|
| Markup | Plain HTML5 |
| Styling | CSS3 — custom properties, CSS animations |
| Logic | Vanilla JavaScript (ES5 strict mode, ES6 features such as `const`, `let`, arrow functions, template literals, and `Array` methods) |
| Tests | [Jest](https://jestjs.io/) with the `jsdom` environment |
| Dev server | [live-server](https://github.com/tapio/live-server) |

There is no bundler, transpiler, or framework involved.

### File Structure

```
tic-tac-toe-app/
├── index.html        # Static markup and DOM structure
├── style.css         # All visual styling
├── game.js           # Game state, logic, and DOM rendering
├── game.test.js      # Jest test suite
├── package.json
└── package-lock.json
```

| File | Responsibility |
|---|---|
| `index.html` | Declares the static DOM — the 3 × 3 button grid, status bar, result banner, and restart button. No logic lives here. |
| `style.css` | Contains every visual rule: layout, colour scheme, animation keyframes, winning-cell highlight, reduced-motion overrides. |
| `game.js` | Owns the game state object, all pure logic functions, the render cycle, and event-listener setup. Conditionally exports symbols for the Jest test environment. |
| `game.test.js` | Jest test suite covering pure functions, state mutations via `handleCellClick`, `resetGame`, and DOM-integration assertions. |

### Architecture / State Model

All mutable data lives in a single `GameState` object:

```js
/**
 * @typedef {'X'|'O'|null} Mark
 * @typedef {{
 *   board:         Mark[],          // 9-element flat array, index 0 = top-left
 *   currentPlayer: 'X'|'O',        // whose turn it is
 *   winner:        'X'|'O'|'draw'|null,
 *   winningLine:   number[]|null    // e.g. [0, 1, 2] or null
 * }} GameState
 */
```

Win detection uses the `WIN_LINES` constant — an array of all 8 possible winning index-triples:

```js
const WIN_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal ↘
  [2, 4, 6], // diagonal ↙
];
```

Every time `handleCellClick(index)` is called, all 8 lines are iterated to determine whether a winner has been produced.

### Key Functions

| Function | Type | Description |
|---|---|---|
| `checkWinner(board)` | Pure | Returns `{ winner, winningLine }` if a winning line exists, otherwise `null`. |
| `checkDraw(board)` | Pure | Returns `true` when all cells are filled and `checkWinner` returns `null`. |
| `handleCellClick(index)` | Side-effecting | Guards against occupied cells and game-over state, places the current player's mark, updates `state`, then calls `render()`. |
| `resetGame()` | Side-effecting | Replaces `state` with a fresh initial state and calls `render()`. |
| `render()` | Side-effecting | Reads the current `state` and synchronises the entire DOM — cell marks, winning classes, disabled states, status text, and result banner. |

### Module / Test Bridge

`game.js` detects whether it is running under Node.js / Jest and conditionally exports its symbols:

```js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { checkWinner, checkDraw, handleCellClick, resetGame, /* … */ };
}
```

This means the same file works as a plain `<script>` in the browser and as a CommonJS module under Jest — no separate build required.

---

## Getting Started (Local Development Setup)

### Prerequisites

- **Node.js** — any current LTS release
- **npm** — bundled with Node.js

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/damienhampton/tic-tac-toe-app.git
   cd tic-tac-toe-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

> **No bundler or build tool is involved.** `live-server` watches the project directory and automatically reloads the browser whenever `game.js`, `style.css`, or `index.html` is saved — edits are reflected immediately.

---

## Running the App

### Option A — with `live-server` (recommended for development)

```bash
npm install   # only needed once
npm start
```

`live-server` starts and opens the app in your default browser. It defaults to `http://127.0.0.1:8080`; if port 8080 is already occupied it will increment to the next available port.

### Option B — open directly in a browser

Open `index.html` in any modern browser — no installation or build step is required.

> **Note:** when opening the file directly, `live-server`'s auto-reload will not be available. You will need to refresh the browser manually after making changes.

---

## Running the Tests

```bash
npm install   # only needed if you haven't done so already
npm test
```

Jest runs with the `jsdom` environment (`--testEnvironment=jsdom`), so no real browser is required.

### What the test suite covers

| Describe block | What is tested |
|---|---|
| `checkWinner` | All 8 win lines for both X and O; empty board; in-progress board; draw board. |
| `checkDraw` | Empty board, partially filled board, full draw board, full board with a winner. |
| `handleCellClick` | First-turn assignment; mark placement; player switching; occupied-cell guard; game-over guard; win detection; draw detection; timing of draw declaration. |
| `resetGame` | State restoration after partial game, win, and draw; cells re-enabled; X goes first again. |
| DOM integration | Status message updates; `data-mark` attributes; `.winning` class application; result banner visibility and text; `game-over` class on the board; cell `disabled` state; full restart cycle. |
