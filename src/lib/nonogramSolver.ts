/**
 * Nonogram Logic Solver & Puzzle Generator
 *
 * Solves puzzles using only deterministic line-solving (no guessing/backtracking).
 * A puzzle that this solver can fully solve is guaranteed to be solvable by logic alone.
 */

// Cell states during solving
const UNKNOWN = -1;
const EMPTY = 0;
const FILLED = 1;

// ─── Line Solver ────────────────────────────────────────────────

/**
 * Generate all valid arrangements of a clue within a line of given length.
 * Each arrangement is an array of 0s and 1s.
 */
function generateArrangements(clue: number[], length: number): number[][] {
  if (clue.length === 1 && clue[0] === 0) {
    return [new Array(length).fill(0)];
  }

  const results: number[][] = [];
  const totalBlocks = clue.reduce((a, b) => a + b, 0);
  const gaps = clue.length - 1; // minimum gaps between blocks
  const slack = length - totalBlocks - gaps;

  if (slack < 0) return [];

  // Recursively place blocks
  function place(blockIdx: number, pos: number, line: number[]): void {
    if (blockIdx === clue.length) {
      // Fill remaining with empty
      const result = [...line];
      for (let i = pos; i < length; i++) result[i] = 0;
      results.push(result);
      return;
    }

    const blockLen = clue[blockIdx];
    const remainingBlocks = clue.slice(blockIdx + 1).reduce((a, b) => a + b, 0);
    const remainingGaps = clue.length - blockIdx - 1;
    const maxStart = length - remainingBlocks - remainingGaps - blockLen;

    for (let start = pos; start <= maxStart; start++) {
      const newLine = [...line];
      // Fill gap before block with empty
      for (let i = pos; i < start; i++) newLine[i] = 0;
      // Fill block
      for (let i = start; i < start + blockLen; i++) newLine[i] = 1;
      // Add mandatory gap after block (if not last block)
      if (blockIdx < clue.length - 1) {
        newLine[start + blockLen] = 0;
        place(blockIdx + 1, start + blockLen + 1, newLine);
      } else {
        place(blockIdx + 1, start + blockLen, newLine);
      }
    }
  }

  place(0, 0, new Array(length).fill(0));
  return results;
}

/**
 * Filter arrangements to only those consistent with the current known state of a line.
 */
function filterArrangements(arrangements: number[][], known: number[]): number[][] {
  return arrangements.filter((arr) =>
    known.every((cell, i) => cell === UNKNOWN || cell === arr[i]),
  );
}

/**
 * Determine which cells can be definitively resolved from the remaining valid arrangements.
 * Returns a new line state with any newly determined cells.
 */
function solveLine(clue: number[], known: number[]): number[] {
  const length = known.length;
  const arrangements = filterArrangements(generateArrangements(clue, length), known);

  if (arrangements.length === 0) {
    // Contradiction — no valid arrangement
    return known;
  }

  const result = [...known];
  for (let i = 0; i < length; i++) {
    if (result[i] !== UNKNOWN) continue;

    const allFilled = arrangements.every((arr) => arr[i] === 1);
    const allEmpty = arrangements.every((arr) => arr[i] === 0);

    if (allFilled) result[i] = FILLED;
    else if (allEmpty) result[i] = EMPTY;
  }

  return result;
}

// ─── Grid Solver ────────────────────────────────────────────────

export interface SolveResult {
  solved: boolean;
  grid: number[][];
  iterations: number;
}

/**
 * Solve a nonogram puzzle using iterative line-solving only (no guessing).
 * Returns whether the puzzle was fully solved and the resulting grid.
 */
export function solveNonogram(
  rowClues: number[][],
  colClues: number[][],
  maxIterations = 100,
): SolveResult {
  const rows = rowClues.length;
  const cols = colClues.length;

  // Initialize grid with UNKNOWN
  const grid: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(UNKNOWN),
  );

  let changed = true;
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Solve each row
    for (let r = 0; r < rows; r++) {
      const rowState = grid[r];
      const newRow = solveLine(rowClues[r], rowState);
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === UNKNOWN && newRow[c] !== UNKNOWN) {
          grid[r][c] = newRow[c];
          changed = true;
        }
      }
    }

    // Solve each column
    for (let c = 0; c < cols; c++) {
      const colState = Array.from({ length: rows }, (_, r) => grid[r][c]);
      const newCol = solveLine(colClues[c], colState);
      for (let r = 0; r < rows; r++) {
        if (grid[r][c] === UNKNOWN && newCol[r] !== UNKNOWN) {
          grid[r][c] = newCol[r];
          changed = true;
        }
      }
    }
  }

  // Check if fully solved
  const solved = grid.every((row) => row.every((cell) => cell !== UNKNOWN));

  // Convert to 0/1 grid (any remaining UNKNOWN → 0)
  const finalGrid = grid.map((row) =>
    row.map((cell) => (cell === FILLED ? 1 : 0)),
  );

  return { solved, grid: finalGrid, iterations };
}

/**
 * Validate that a puzzle's solution can be uniquely determined by logic alone.
 * The clues must lead the solver to the exact same solution.
 */
export function validatePuzzle(
  solution: number[][],
  rowClues: number[][],
  colClues: number[][],
): {
  valid: boolean;
  reason?: string;
  invalidRows?: number[];
  invalidCols?: number[];
} {
  const result = solveNonogram(rowClues, colClues);

  const rows = solution.length;
  const cols = solution[0]?.length ?? 0;
  const invalidRows: number[] = [];
  const invalidCols: number[] = [];

  // Collect mismatching rows/cols (if any)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (result.grid[r][c] !== solution[r][c]) {
        if (!invalidRows.includes(r)) invalidRows.push(r);
        if (!invalidCols.includes(c)) invalidCols.push(c);
      }
    }
  }

  if (!result.solved) {
    return {
      valid: false,
      reason: "Puzzle cannot be solved by logic alone (requires guessing)",
      invalidRows,
      invalidCols,
    };
  }

  if (invalidRows.length > 0 || invalidCols.length > 0) {
    return {
      valid: false,
      reason: "Solver found a different solution — puzzle may have multiple solutions",
      invalidRows,
      invalidCols,
    };
  }

  return { valid: true, invalidRows: [], invalidCols: [] };
}

// ─── Puzzle Generator ───────────────────────────────────────────

import { generateCluesFromSolution } from "./puzzleUtils";

interface GenerateOptions {
  rows: number;
  cols: number;
  fillRatio?: number; // target fill ratio 0-1 (default: 0.4-0.6)
  maxAttempts?: number;
}

/**
 * Generate a random puzzle that is guaranteed to be solvable by logic alone.
 * Uses rejection sampling: generate random grids until one passes the solver.
 */
export function generateValidPuzzle(options: GenerateOptions): {
  solution: number[][];
  clues: { rows: number[][]; cols: number[][] };
} | null {
  const { rows, cols, maxAttempts = 500 } = options;
  const minFill = options.fillRatio ?? 0.35;
  const maxFill = options.fillRatio ? options.fillRatio + 0.1 : 0.65;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random grid
    const fillRatio = minFill + Math.random() * (maxFill - minFill);
    const solution: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() < fillRatio ? 1 : 0)),
    );

    const clues = generateCluesFromSolution(solution);
    const result = solveNonogram(clues.rows, clues.cols);

    if (result.solved) {
      // Verify it matches
      let matches = true;
      for (let r = 0; r < rows && matches; r++) {
        for (let c = 0; c < cols && matches; c++) {
          if (result.grid[r][c] !== solution[r][c]) matches = false;
        }
      }

      if (matches) {
        return { solution, clues };
      }
    }
  }

  return null; // Failed to find a valid puzzle in maxAttempts
}

/**
 * Generate multiple validated puzzles in batch.
 */
export function generatePuzzleBatch(
  count: number,
  size: number,
  difficulty: "easy" | "medium" | "hard",
): { solution: number[][]; clues: { rows: number[][]; cols: number[][] } }[] {
  const config: Record<string, GenerateOptions> = {
    easy: { rows: 5, cols: 5, fillRatio: 0.5 },
    medium: { rows: 10, cols: 10, fillRatio: 0.45 },
    hard: { rows: 15, cols: 15, fillRatio: 0.4 },
  };

  const opts = config[difficulty] ?? { rows: size, cols: size };
  const results: { solution: number[][]; clues: { rows: number[][]; cols: number[][] } }[] = [];

  for (let i = 0; i < count; i++) {
    const puzzle = generateValidPuzzle({ ...opts, maxAttempts: 1000 });
    if (puzzle) results.push(puzzle);
  }

  return results;
}
