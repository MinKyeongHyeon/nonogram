/**
 * Script to generate validated nonogram puzzles and output them as puzzle_library format.
 * Run: npx tsx scripts/generatePuzzles.ts
 */

// Inline the necessary functions to avoid path alias issues in script context

function generateCluesFromSolution(solution: number[][]): { rows: number[][]; cols: number[][] } {
  const rows = solution.length;
  const cols = solution[0].length;
  const clues: { rows: number[][]; cols: number[][] } = { rows: [], cols: [] };

  for (let r = 0; r < rows; r++) {
    const rowClues: number[] = [];
    let count = 0;
    for (let c = 0; c < cols; c++) {
      if (solution[r][c] === 1) { count++; }
      else if (count > 0) { rowClues.push(count); count = 0; }
    }
    if (count > 0) rowClues.push(count);
    clues.rows.push(rowClues.length > 0 ? rowClues : [0]);
  }

  for (let c = 0; c < cols; c++) {
    const colClues: number[] = [];
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (solution[r][c] === 1) { count++; }
      else if (count > 0) { colClues.push(count); count = 0; }
    }
    if (count > 0) colClues.push(count);
    clues.cols.push(colClues.length > 0 ? colClues : [0]);
  }

  return clues;
}

const UNKNOWN = -1;
const EMPTY = 0;
const FILLED = 1;

function generateArrangements(clue: number[], length: number): number[][] {
  if (clue.length === 1 && clue[0] === 0) return [new Array(length).fill(0)];
  const results: number[][] = [];
  const totalBlocks = clue.reduce((a, b) => a + b, 0);
  const gaps = clue.length - 1;
  const slack = length - totalBlocks - gaps;
  if (slack < 0) return [];

  function place(blockIdx: number, pos: number, line: number[]): void {
    if (blockIdx === clue.length) {
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
      for (let i = pos; i < start; i++) newLine[i] = 0;
      for (let i = start; i < start + blockLen; i++) newLine[i] = 1;
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

function filterArrangements(arrangements: number[][], known: number[]): number[][] {
  return arrangements.filter((arr) => known.every((cell, i) => cell === UNKNOWN || cell === arr[i]));
}

function solveLine(clue: number[], known: number[]): number[] {
  const length = known.length;
  const arrangements = filterArrangements(generateArrangements(clue, length), known);
  if (arrangements.length === 0) return known;
  const result = [...known];
  for (let i = 0; i < length; i++) {
    if (result[i] !== UNKNOWN) continue;
    if (arrangements.every((arr) => arr[i] === 1)) result[i] = FILLED;
    else if (arrangements.every((arr) => arr[i] === 0)) result[i] = EMPTY;
  }
  return result;
}

function solveNonogram(rowClues: number[][], colClues: number[][]): { solved: boolean; grid: number[][] } {
  const rows = rowClues.length;
  const cols = colClues.length;
  const grid: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(UNKNOWN));
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 100) {
    changed = false;
    iterations++;
    for (let r = 0; r < rows; r++) {
      const newRow = solveLine(rowClues[r], grid[r]);
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === UNKNOWN && newRow[c] !== UNKNOWN) { grid[r][c] = newRow[c]; changed = true; }
      }
    }
    for (let c = 0; c < cols; c++) {
      const colState = Array.from({ length: rows }, (_, r) => grid[r][c]);
      const newCol = solveLine(colClues[c], colState);
      for (let r = 0; r < rows; r++) {
        if (grid[r][c] === UNKNOWN && newCol[r] !== UNKNOWN) { grid[r][c] = newCol[r]; changed = true; }
      }
    }
  }
  const solved = grid.every((row) => row.every((cell) => cell !== UNKNOWN));
  const finalGrid = grid.map((row) => row.map((cell) => (cell === FILLED ? 1 : 0)));
  return { solved, grid: finalGrid };
}

function generateValidPuzzle(rows: number, cols: number, fillRatio: number, maxAttempts = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ratio = fillRatio + (Math.random() - 0.5) * 0.15;
    const solution: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() < ratio ? 1 : 0)),
    );
    // Skip boring puzzles (all empty row/col or too sparse/dense)
    const filled = solution.flat().filter((c) => c === 1).length;
    const total = rows * cols;
    if (filled < total * 0.2 || filled > total * 0.8) continue;

    const clues = generateCluesFromSolution(solution);
    const result = solveNonogram(clues.rows, clues.cols);
    if (!result.solved) continue;

    // Verify match
    let matches = true;
    for (let r = 0; r < rows && matches; r++) {
      for (let c = 0; c < cols && matches; c++) {
        if (result.grid[r][c] !== solution[r][c]) matches = false;
      }
    }
    if (matches) return { solution, clues };
  }
  return null;
}

// ─── Generate puzzles ───────────────────────────────────────────

interface PuzzleEntry {
  id: number;
  name: string;
  solution: number[][];
}

const EASY_NAMES = [
  "Star", "Moon", "Sun", "Drop", "Leaf", "Bell", "Flag", "Gem",
  "Heart", "Arrow", "Crown", "Flame", "Cloud", "Ring", "Bolt",
  "Wave", "Petal", "Spark", "Shell", "Candy",
];

const MEDIUM_NAMES = [
  "Lighthouse", "Butterfly", "Mushroom", "Snowflake", "Anchor",
  "Compass", "Lantern", "Feather", "Crystal", "Blossom",
  "Windmill", "Hourglass", "Seashell", "Stardust", "Raindrop",
];

const HARD_NAMES = [
  "Phoenix", "Galaxy", "Carousel", "Labyrinth", "Cathedral",
  "Constellation", "Mandala", "Kaleidoscope", "Dreamcatcher", "Aurora",
];

function generate() {
  const puzzles: PuzzleEntry[] = [];
  let id = 1;

  console.log("Generating Easy 5×5 puzzles...");
  for (let i = 0; i < 20; i++) {
    const result = generateValidPuzzle(5, 5, 0.5);
    if (result) {
      puzzles.push({ id: id++, name: `Easy - ${EASY_NAMES[i] ?? `Puzzle ${i + 1}`}`, solution: result.solution });
      process.stdout.write(".");
    } else {
      console.warn(`\nFailed to generate easy puzzle ${i + 1}`);
    }
  }
  console.log(` ${puzzles.length} generated`);

  const mediumStart = puzzles.length;
  console.log("Generating Medium 10×10 puzzles...");
  for (let i = 0; i < 15; i++) {
    const result = generateValidPuzzle(10, 10, 0.45);
    if (result) {
      puzzles.push({ id: id++, name: `Medium - ${MEDIUM_NAMES[i] ?? `Puzzle ${i + 1}`}`, solution: result.solution });
      process.stdout.write(".");
    } else {
      console.warn(`\nFailed to generate medium puzzle ${i + 1}`);
    }
  }
  console.log(` ${puzzles.length - mediumStart} generated`);

  const hardStart = puzzles.length;
  console.log("Generating Hard 15×15 puzzles...");
  for (let i = 0; i < 10; i++) {
    const result = generateValidPuzzle(15, 15, 0.4);
    if (result) {
      puzzles.push({ id: id++, name: `Hard - ${HARD_NAMES[i] ?? `Puzzle ${i + 1}`}`, solution: result.solution });
      process.stdout.write(".");
    } else {
      console.warn(`\nFailed to generate hard puzzle ${i + 1}`);
    }
  }
  console.log(` ${puzzles.length - hardStart} generated`);

  // Output as TypeScript
  const output = `import { RawPuzzle } from '@/types/puzzle';

export const puzzleLibrary: RawPuzzle[] = ${JSON.stringify(puzzles, null, 2)};
`;

  const fs = require("fs");
  const path = require("path");
  const outPath = path.join(__dirname, "..", "src", "data", "puzzle_library.ts");
  fs.writeFileSync(outPath, output, "utf-8");
  console.log(`\n✅ Total ${puzzles.length} validated puzzles written to src/data/puzzle_library.ts`);
}

generate();
