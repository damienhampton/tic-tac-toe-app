/**
 * game.js — Tic Tac Toe game logic and DOM interaction
 */

"use strict";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WIN_LINES = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left → bottom-right
  [2, 4, 6], // diagonal top-right → bottom-left
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/**
 * @typedef {'X'|'O'|null} Mark
 * @typedef {{ board: Mark[], currentPlayer: 'X'|'O', winner: 'X'|'O'|'draw'|null, winningLine: number[]|null }} GameState
 */

/** @type {GameState} */
let state = createInitialState();

function createInitialState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    winningLine: null,
  };
}

// ---------------------------------------------------------------------------
// Pure game-logic functions (exported for tests via module pattern)
// ---------------------------------------------------------------------------

/**
 * Check whether the given board has a winner.
 * @param {Mark[]} board
 * @returns {{ winner: 'X'|'O', winningLine: number[] } | null}
 */
function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }
  return null;
}

/**
 * Check whether the board is a draw (all cells filled, no winner).
 * @param {Mark[]} board
 * @returns {boolean}
 */
function checkDraw(board) {
  if (checkWinner(board) !== null) return false;
  return board.every((cell) => cell !== null);
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

/** @returns {HTMLElement} */
function getBoard() {
  return document.getElementById("board");
}

/** @returns {HTMLElement} */
function getStatusMessage() {
  return document.getElementById("status-message");
}

/** @returns {HTMLElement} */
function getResultBanner() {
  return document.getElementById("result-banner");
}

/** @returns {HTMLElement} */
function getResultText() {
  return document.getElementById("result-text");
}

/** @param {number} index @returns {HTMLButtonElement} */
function getCellElement(index) {
  return document.getElementById(`cell-${index}`);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Synchronise the entire DOM to the current state.
 */
function render() {
  const boardEl = getBoard();
  const statusEl = getStatusMessage();
  const resultBanner = getResultBanner();
  const resultText = getResultText();

  // Render each cell
  for (let i = 0; i < 9; i++) {
    const cellEl = getCellElement(i);
    const mark = state.board[i];

    // Set data-mark attribute — CSS uses this for content + colour
    if (mark) {
      cellEl.setAttribute("data-mark", mark);
      cellEl.setAttribute(
        "aria-label",
        `${cellEl.getAttribute("aria-label").split(":")[0]}: ${mark}`
      );
    } else {
      cellEl.removeAttribute("data-mark");
    }

    // Winning highlight — keep 'winning' class for test compatibility,
    // add Tailwind animation and colour utility classes alongside it
    if (state.winningLine && state.winningLine.includes(i)) {
      cellEl.classList.add("winning", "animate-win-pulse");
      if (state.winner === "X") {
        cellEl.classList.add("cell-winning-x");
        cellEl.classList.remove("cell-winning-o");
      } else {
        cellEl.classList.add("cell-winning-o");
        cellEl.classList.remove("cell-winning-x");
      }
    } else {
      cellEl.classList.remove(
        "winning",
        "animate-win-pulse",
        "cell-winning-x",
        "cell-winning-o"
      );
    }

    // Disable occupied or game-over cells
    cellEl.disabled = mark !== null || state.winner !== null;
  }

  // Board-level game-over class (CSS pointer-events guard)
  // Keep 'game-over' class for test compatibility
  if (state.winner !== null) {
    boardEl.classList.add("game-over");
  } else {
    boardEl.classList.remove("game-over");
  }

  // Status message (turn indicator)
  if (state.winner === null) {
    statusEl.textContent = `Player ${state.currentPlayer}'s turn`;
    // Update colour classes for current player
    statusEl.classList.remove("status-player-x", "status-player-o", "text-slate-400");
    if (state.currentPlayer === "X") {
      statusEl.classList.add("status-player-x");
    } else {
      statusEl.classList.add("status-player-o");
    }
    resultBanner.hidden = true;
    resultText.textContent = "";
  } else {
    // Hide turn indicator while result is shown
    statusEl.textContent = "";
    statusEl.classList.remove("status-player-x", "status-player-o");
    statusEl.classList.add("text-slate-400");

    // Result banner
    if (state.winner === "draw") {
      resultText.textContent = "It's a draw! 🤝";
    } else {
      resultText.textContent = `Player ${state.winner} wins! 🎉`;
    }
    resultBanner.hidden = false;
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * Handle a click on cell at the given index.
 * @param {number} index
 */
function handleCellClick(index) {
  // Guard: ignore if cell is occupied or game is over
  if (state.board[index] !== null || state.winner !== null) {
    return;
  }

  // Place the current player's mark
  state.board[index] = state.currentPlayer;

  // Check for a winner
  const winResult = checkWinner(state.board);
  if (winResult) {
    state.winner = winResult.winner;
    state.winningLine = winResult.winningLine;
  } else if (checkDraw(state.board)) {
    state.winner = "draw";
    state.winningLine = null;
  } else {
    // Switch player
    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";
  }

  render();
}

/**
 * Reset the game to its initial state.
 */
function resetGame() {
  state = createInitialState();

  // Re-attach aria-labels (render removes the appended mark text)
  const rows = ["Row 1", "Row 1", "Row 1", "Row 2", "Row 2", "Row 2", "Row 3", "Row 3", "Row 3"];
  const cols = ["Column 1", "Column 2", "Column 3", "Column 1", "Column 2", "Column 3", "Column 1", "Column 2", "Column 3"];
  for (let i = 0; i < 9; i++) {
    const cellEl = getCellElement(i);
    cellEl.setAttribute("aria-label", `${rows[i]}, ${cols[i]}`);
  }

  render();
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

function init() {
  // Attach cell click listeners
  const boardEl = getBoard();
  boardEl.addEventListener("click", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const index = parseInt(cell.dataset.index, 10);
    handleCellClick(index);
  });

  // Attach restart button listener
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.addEventListener("click", resetGame);

  // Initial render
  render();
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// ---------------------------------------------------------------------------
// Export for test environment (Node / Jest)
// ---------------------------------------------------------------------------

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createInitialState,
    checkWinner,
    checkDraw,
    WIN_LINES,
    // Allow tests to inject state and call handlers
    getState: () => state,
    setState: (newState) => { state = newState; },
    handleCellClick,
    resetGame,
    render,
  };
}
