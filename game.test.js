/**
 * game.test.js — Jest test suite for Tic Tac Toe
 * @jest-environment jsdom
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Load DOM from index.html before requiring game.js
// ---------------------------------------------------------------------------

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

beforeEach(() => {
  // Reset DOM
  document.documentElement.innerHTML = html;

  // Re-require game module fresh for each test so state is clean
  jest.resetModules();
});

// Helper to load the game module into the current jsdom environment
function loadGame() {
  return require("./game.js");
}

// ---------------------------------------------------------------------------
// Unit tests: checkWinner
// ---------------------------------------------------------------------------

describe("checkWinner", () => {
  let checkWinner;

  beforeEach(() => {
    checkWinner = loadGame().checkWinner;
  });

  test("returns null for an empty board", () => {
    const board = Array(9).fill(null);
    expect(checkWinner(board)).toBeNull();
  });

  test("returns null for an in-progress board with no winner", () => {
    // X _ O
    // _ X _
    // O _ _
    const board = ["X", null, "O", null, "X", null, "O", null, null];
    expect(checkWinner(board)).toBeNull();
  });

  // Test all 8 win lines for X
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  WIN_LINES.forEach((line) => {
    test(`detects X winning line [${line}]`, () => {
      const board = Array(9).fill(null);
      line.forEach((i) => { board[i] = "X"; });
      const result = checkWinner(board);
      expect(result).not.toBeNull();
      expect(result.winner).toBe("X");
      expect(result.winningLine).toEqual(line);
    });

    test(`detects O winning line [${line}]`, () => {
      const board = Array(9).fill(null);
      line.forEach((i) => { board[i] = "O"; });
      const result = checkWinner(board);
      expect(result).not.toBeNull();
      expect(result.winner).toBe("O");
      expect(result.winningLine).toEqual(line);
    });
  });
});

// ---------------------------------------------------------------------------
// Unit tests: checkDraw
// ---------------------------------------------------------------------------

describe("checkDraw", () => {
  let checkDraw;
  let checkWinner;

  beforeEach(() => {
    const game = loadGame();
    checkDraw = game.checkDraw;
    checkWinner = game.checkWinner;
  });

  test("returns false for an empty board", () => {
    expect(checkDraw(Array(9).fill(null))).toBe(false);
  });

  test("returns false for a partially filled board", () => {
    const board = ["X", "O", null, null, null, null, null, null, null];
    expect(checkDraw(board)).toBe(false);
  });

  test("returns true for a full board with no winner", () => {
    // Known draw board:
    // X O X
    // X O O
    // O X X
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(checkWinner(board)).toBeNull();
    expect(checkDraw(board)).toBe(true);
  });

  test("returns false for a full board that has a winner", () => {
    // Fill mostly, but X wins top row
    // X X X
    // O O X
    // O X O
    const board = ["X", "X", "X", "O", "O", "X", "O", "X", "O"];
    expect(checkDraw(board)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unit tests: handleCellClick — state mutations
// ---------------------------------------------------------------------------

describe("handleCellClick", () => {
  let game;

  beforeEach(() => {
    game = loadGame();
  });

  test("clicking an empty cell places the current player's mark", () => {
    game.handleCellClick(0);
    expect(game.getState().board[0]).toBe("X");
  });

  test("clicking an empty cell switches currentPlayer from X to O", () => {
    game.handleCellClick(0);
    expect(game.getState().currentPlayer).toBe("O");
  });

  test("clicking an empty cell then another switches back to X", () => {
    game.handleCellClick(0);
    game.handleCellClick(1);
    expect(game.getState().currentPlayer).toBe("X");
  });

  test("clicking an occupied cell leaves state unchanged", () => {
    game.handleCellClick(4);
    const stateBefore = JSON.stringify(game.getState());
    game.handleCellClick(4); // same cell again
    expect(JSON.stringify(game.getState())).toBe(stateBefore);
  });

  test("clicking after game over (winner) leaves state unchanged", () => {
    // Set up a winning state for X (top row)
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins [0,1,2]

    const stateBefore = JSON.stringify(game.getState());
    game.handleCellClick(5); // should be no-op
    expect(JSON.stringify(game.getState())).toBe(stateBefore);
  });

  test("game ends immediately after winning move", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins

    const s = game.getState();
    expect(s.winner).toBe("X");
    expect(s.winningLine).toEqual([0, 1, 2]);
  });

  test("draw is detected and sets winner to 'draw'", () => {
    // Play out a draw:
    // X O X
    // X O O
    // O X X
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    moves.forEach((i) => game.handleCellClick(i));
    expect(game.getState().winner).toBe("draw");
    expect(game.getState().winningLine).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Unit tests: resetGame
// ---------------------------------------------------------------------------

describe("resetGame", () => {
  let game;

  beforeEach(() => {
    game = loadGame();
  });

  test("resetGame restores all state to initial values after a partial game", () => {
    game.handleCellClick(0);
    game.handleCellClick(1);
    game.resetGame();

    const s = game.getState();
    expect(s.board).toEqual(Array(9).fill(null));
    expect(s.currentPlayer).toBe("X");
    expect(s.winner).toBeNull();
    expect(s.winningLine).toBeNull();
  });

  test("resetGame restores state after a finished game", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins
    game.resetGame();

    const s = game.getState();
    expect(s.board).toEqual(Array(9).fill(null));
    expect(s.currentPlayer).toBe("X");
    expect(s.winner).toBeNull();
    expect(s.winningLine).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Integration tests: DOM reflection
// ---------------------------------------------------------------------------

describe("DOM integration", () => {
  let game;

  beforeEach(() => {
    game = loadGame();
  });

  test("status message shows Player X's turn on load", () => {
    const statusEl = document.getElementById("status-message");
    expect(statusEl.textContent).toBe("Player X's turn");
  });

  test("status message updates to Player O after X moves", () => {
    game.handleCellClick(0);
    const statusEl = document.getElementById("status-message");
    expect(statusEl.textContent).toBe("Player O's turn");
  });

  test("status message updates back to Player X after O moves", () => {
    game.handleCellClick(0);
    game.handleCellClick(1);
    const statusEl = document.getElementById("status-message");
    expect(statusEl.textContent).toBe("Player X's turn");
  });

  test("cell element gets data-mark attribute after click", () => {
    game.handleCellClick(4);
    const cell = document.getElementById("cell-4");
    expect(cell.getAttribute("data-mark")).toBe("X");
  });

  test("winning cells receive .winning CSS class", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins [0,1,2]

    expect(document.getElementById("cell-0").classList.contains("winning")).toBe(true);
    expect(document.getElementById("cell-1").classList.contains("winning")).toBe(true);
    expect(document.getElementById("cell-2").classList.contains("winning")).toBe(true);
    // Non-winning cells should not have the class
    expect(document.getElementById("cell-3").classList.contains("winning")).toBe(false);
    expect(document.getElementById("cell-4").classList.contains("winning")).toBe(false);
  });

  test("result banner is hidden before game ends", () => {
    const banner = document.getElementById("result-banner");
    expect(banner.hidden).toBe(true);
  });

  test("result banner shows win message after X wins", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins

    const banner = document.getElementById("result-banner");
    const resultText = document.getElementById("result-text");
    expect(banner.hidden).toBe(false);
    expect(resultText.textContent).toContain("Player X wins");
  });

  test("result banner shows draw message on draw", () => {
    // X O X / X O O / O X X
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    moves.forEach((i) => game.handleCellClick(i));

    const banner = document.getElementById("result-banner");
    const resultText = document.getElementById("result-text");
    expect(banner.hidden).toBe(false);
    expect(resultText.textContent).toContain("draw");
  });

  test("board has game-over class after game ends", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins

    expect(document.getElementById("board").classList.contains("game-over")).toBe(true);
  });

  test("cells are disabled after game ends", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins

    for (let i = 0; i < 9; i++) {
      expect(document.getElementById(`cell-${i}`).disabled).toBe(true);
    }
  });

  test("restart clears all marks from the DOM", () => {
    game.handleCellClick(0);
    game.handleCellClick(1);
    game.resetGame();

    for (let i = 0; i < 9; i++) {
      const cell = document.getElementById(`cell-${i}`);
      expect(cell.getAttribute("data-mark")).toBeNull();
      expect(cell.classList.contains("winning")).toBe(false);
    }
  });

  test("restart hides result banner", () => {
    game.handleCellClick(0); // X
    game.handleCellClick(3); // O
    game.handleCellClick(1); // X
    game.handleCellClick(4); // O
    game.handleCellClick(2); // X wins
    game.resetGame();

    expect(document.getElementById("result-banner").hidden).toBe(true);
  });

  test("restart resets status to Player X's turn", () => {
    game.handleCellClick(0);
    game.handleCellClick(1);
    game.resetGame();
    expect(document.getElementById("status-message").textContent).toBe("Player X's turn");
  });

  test("full game to draw via simulated clicks leaves board fully marked", () => {
    // X O X
    // X O O
    // O X X  — draw
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    moves.forEach((i) => game.handleCellClick(i));

    const expectedMarks = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    for (let i = 0; i < 9; i++) {
      expect(document.getElementById(`cell-${i}`).getAttribute("data-mark")).toBe(expectedMarks[i]);
    }
    expect(game.getState().winner).toBe("draw");
  });
});
