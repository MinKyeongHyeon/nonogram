/**
 * Hand-designed nonogram puzzles with meaningful pixel art.
 * Each puzzle visually represents its name.
 * Run: npx tsx scripts/buildCuratedPuzzles.ts
 */

// ─── Inline solver (same as generatePuzzles.ts) ────────────────

function generateCluesFromSolution(solution: number[][]): { rows: number[][]; cols: number[][] } {
  const rows = solution.length;
  const cols = solution[0].length;
  const clues: { rows: number[][]; cols: number[][] } = { rows: [], cols: [] };
  for (let r = 0; r < rows; r++) {
    const rc: number[] = [];
    let cnt = 0;
    for (let c = 0; c < cols; c++) {
      if (solution[r][c] === 1) cnt++;
      else if (cnt > 0) {
        rc.push(cnt);
        cnt = 0;
      }
    }
    if (cnt > 0) rc.push(cnt);
    clues.rows.push(rc.length > 0 ? rc : [0]);
  }
  for (let c = 0; c < cols; c++) {
    const cc: number[] = [];
    let cnt = 0;
    for (let r = 0; r < rows; r++) {
      if (solution[r][c] === 1) cnt++;
      else if (cnt > 0) {
        cc.push(cnt);
        cnt = 0;
      }
    }
    if (cnt > 0) cc.push(cnt);
    clues.cols.push(cc.length > 0 ? cc : [0]);
  }
  return clues;
}

const UNKNOWN = -1,
  EMPTY = 0,
  FILLED = 1;
function generateArrangements(clue: number[], length: number): number[][] {
  if (clue.length === 1 && clue[0] === 0) return [new Array(length).fill(0)];
  const results: number[][] = [];
  const totalBlocks = clue.reduce((a, b) => a + b, 0);
  const gaps = clue.length - 1;
  if (length - totalBlocks - gaps < 0) return [];
  function place(bi: number, pos: number, line: number[]) {
    if (bi === clue.length) {
      const r = [...line];
      for (let i = pos; i < length; i++) r[i] = 0;
      results.push(r);
      return;
    }
    const bl = clue[bi],
      rb = clue.slice(bi + 1).reduce((a, b) => a + b, 0),
      rg = clue.length - bi - 1;
    for (let s = pos; s <= length - rb - rg - bl; s++) {
      const nl = [...line];
      for (let i = pos; i < s; i++) nl[i] = 0;
      for (let i = s; i < s + bl; i++) nl[i] = 1;
      if (bi < clue.length - 1) {
        nl[s + bl] = 0;
        place(bi + 1, s + bl + 1, nl);
      } else place(bi + 1, s + bl, nl);
    }
  }
  place(0, 0, new Array(length).fill(0));
  return results;
}
function filterArr(arrs: number[][], known: number[]) {
  return arrs.filter((a) => known.every((c, i) => c === UNKNOWN || c === a[i]));
}
function solveLine(clue: number[], known: number[]) {
  const arrs = filterArr(generateArrangements(clue, known.length), known);
  if (!arrs.length) return known;
  const r = [...known];
  for (let i = 0; i < known.length; i++) {
    if (r[i] !== UNKNOWN) continue;
    if (arrs.every((a) => a[i] === 1)) r[i] = FILLED;
    else if (arrs.every((a) => a[i] === 0)) r[i] = EMPTY;
  }
  return r;
}
function solve(rowClues: number[][], colClues: number[][]) {
  const R = rowClues.length,
    C = colClues.length;
  const grid = Array.from({ length: R }, () => new Array(C).fill(UNKNOWN));
  let changed = true,
    iter = 0;
  while (changed && iter < 100) {
    changed = false;
    iter++;
    for (let r = 0; r < R; r++) {
      const nr = solveLine(rowClues[r], grid[r]);
      for (let c = 0; c < C; c++)
        if (grid[r][c] === UNKNOWN && nr[c] !== UNKNOWN) {
          grid[r][c] = nr[c];
          changed = true;
        }
    }
    for (let c = 0; c < C; c++) {
      const cs = Array.from({ length: R }, (_, r) => grid[r][c]);
      const nc = solveLine(colClues[c], cs);
      for (let r = 0; r < R; r++)
        if (grid[r][c] === UNKNOWN && nc[r] !== UNKNOWN) {
          grid[r][c] = nc[r];
          changed = true;
        }
    }
  }
  const solved = grid.every((row) => row.every((c) => c !== UNKNOWN));
  return { solved, grid: grid.map((row) => row.map((c) => (c === FILLED ? 1 : 0))) };
}

function validate(solution: number[][]): boolean {
  const clues = generateCluesFromSolution(solution);
  const result = solve(clues.rows, clues.cols);
  if (!result.solved) return false;
  for (let r = 0; r < solution.length; r++)
    for (let c = 0; c < solution[0].length; c++) if (result.grid[r][c] !== solution[r][c]) return false;
  return true;
}

// Helper: parse compact string format into solution grid
function p(rows: string[]): number[][] {
  return rows.map((r) => r.split("").map((c) => (c === "#" ? 1 : 0)));
}

// ─── 5×5 Puzzles (Easy) ────────────────────────────────────────

const easy5x5: { name: string; solution: number[][] }[] = [
  { name: "Easy - Heart", solution: p([".#.#.", "#####", "#####", ".###.", "..#.."]) },
  { name: "Easy - Cross", solution: p(["..#..", "..#..", "#####", "..#..", "..#.."]) },
  { name: "Easy - Diamond", solution: p(["..#..", ".###.", "#####", ".###.", "..#.."]) },
  { name: "Easy - Arrow Up", solution: p(["..#..", ".###.", "#.#.#", "..#..", "..#.."]) },
  { name: "Easy - T-Shape", solution: p(["#####", "..#..", "..#..", "..#..", "..#.."]) },
  { name: "Easy - Frame", solution: p(["#####", "#...#", "#...#", "#...#", "#####"]) },
  { name: "Easy - Stairs", solution: p(["#....", "##...", "###..", "####.", "#####"]) },
  { name: "Easy - Checkers", solution: p(["#.#.#", ".....", "#.#.#", ".....", "#.#.#"]) },
  { name: "Easy - L-Shape", solution: p(["#....", "#....", "#....", "#....", "#####"]) },
  { name: "Easy - Smile", solution: p([".###.", "#.#.#", "#...#", "#.#.#", ".###."]) },
  { name: "Easy - Flag", solution: p(["#####", "#####", "#####", "#....", "#...."]) },
  { name: "Easy - Cup", solution: p([".....", ".###.", ".###.", ".###.", "..#.."]) },
  { name: "Easy - Umbrella", solution: p([".###.", "#####", "..#..", "..#..", ".#..."]) },
  { name: "Easy - House", solution: p(["..#..", ".###.", "#####", ".#.#.", ".###."]) },
  { name: "Easy - Anchor", solution: p(["..#..", ".###.", "..#..", "#.#.#", ".###."]) },
  { name: "Easy - Tree", solution: p(["..#..", ".###.", "#####", "..#..", "..#.."]) },
  { name: "Easy - Star", solution: p(["..#..", ".###.", "#####", ".#.#.", "#...#"]) },
  { name: "Easy - Ribbon", solution: p(["##.##", ".#.#.", "..#..", ".###.", ".#.#."]) },
  { name: "Easy - Boat", solution: p(["..#..", "..#..", "#####", ".###.", "..#.."]) },
  { name: "Easy - Key", solution: p([".##..", ".##..", "..#..", "..##.", "..#.."]) },
];

// ─── 10×10 Puzzles (Medium) ────────────────────────────────────

const medium10x10: { name: string; solution: number[][] }[] = [
  {
    name: "Medium - Heart",
    solution: p(
      [
        ".##..##..",
        "####.####",
        "#########",
        "#########",
        "#########",
        ".#######.",
        "..#####..",
        "...###...",
        "....#....",
        ".........",
      ].map((r) => r.padEnd(10, ".").slice(0, 10)),
    ),
  },
  {
    name: "Medium - Cat",
    solution: p([
      "#..#......",
      "##.##.....",
      "#####.....",
      "#.#.#.....",
      "#####.....",
      ".###......",
      ".###.####.",
      "..########",
      "..########",
      "...######.",
    ]),
  },
  {
    name: "Medium - Fish",
    solution: p([
      "...#......",
      "..###.....",
      ".#####.#..",
      "########.#",
      "##########",
      "##########",
      ".########.",
      "..######..",
      "...####...",
      "....##....",
    ]),
  },
  {
    name: "Medium - Mushroom",
    solution: p([
      "...####...",
      "..######..",
      ".########.",
      "##########",
      "##########",
      "...####...",
      "...####...",
      "..##..##..",
      "..##..##..",
      ".###..###.",
    ]),
  },
  {
    name: "Medium - Rocket",
    solution: p([
      "....##....",
      "...####...",
      "..######..",
      "..######..",
      "..######..",
      "..######..",
      ".########.",
      ".##.##.##.",
      "..#.##.#..",
      "....##....",
    ]),
  },
  {
    name: "Medium - Bird",
    solution: p([
      "....##....",
      "...####...",
      "..######..",
      ".########.",
      "##########",
      ".########.",
      "..######..",
      "...####...",
      "..##..##..",
      ".##....##.",
    ]),
  },
  {
    name: "Medium - Crown",
    solution: p([
      ".#..#..#..",
      ".#..#..#..",
      "##.###.##.",
      "##########",
      "##########",
      "##########",
      ".########.",
      ".########.",
      ".########.",
      "..######..",
    ]),
  },
  {
    name: "Medium - Ghost",
    solution: p([
      "...####...",
      "..######..",
      ".########.",
      ".#.##.##..",
      ".########.",
      ".########.",
      ".########.",
      ".########.",
      ".#.##.##.#",
      ".#..#..#..",
    ]),
  },
  {
    name: "Medium - Flower",
    solution: p([
      "....##....",
      "...####...",
      "..######..",
      ".########.",
      "####..####",
      "####..####",
      ".########.",
      "..######..",
      "....##....",
      "....##....",
    ]),
  },
  {
    name: "Medium - Skull",
    solution: p([
      "..######..",
      ".########.",
      "##########",
      "##.##.####",
      "##########",
      "##########",
      ".########.",
      ".#.##.##..",
      "..######..",
      "..#.##.#..",
    ]),
  },
  {
    name: "Medium - Cactus",
    solution: p([
      "....##....",
      "....##....",
      ".#..##..#.",
      "##..##..##",
      "##########",
      ".########.",
      "....##....",
      "....##....",
      "...####...",
      "..######..",
    ]),
  },
  {
    name: "Medium - Moon",
    solution: p([
      "..#####...",
      ".######...",
      "###.##....",
      "####.#....",
      "#####.....",
      "#####.....",
      "####.#....",
      "###.##....",
      ".######...",
      "..#####...",
    ]),
  },
  {
    name: "Medium - Bell",
    solution: p([
      "....##....",
      "...####...",
      "..######..",
      ".########.",
      ".########.",
      "##########",
      "##########",
      "##########",
      "..........",
      "....##....",
    ]),
  },
  {
    name: "Medium - Shield",
    solution: p([
      ".########.",
      "##########",
      "##########",
      "##########",
      "##########",
      ".########.",
      ".########.",
      "..######..",
      "...####...",
      "....##....",
    ]),
  },
  {
    name: "Medium - Bunny",
    solution: p([
      ".#....#...",
      ".##..##...",
      ".######...",
      ".######...",
      "..####....",
      "..####.##.",
      "..########",
      "..########",
      "...######.",
      "....####..",
    ]),
  },
];

// ─── 15×15 Puzzles (Hard) ──────────────────────────────────────

const hard15x15: { name: string; solution: number[][] }[] = [
  {
    name: "Hard - Butterfly",
    solution: p([
      "......#.#......",
      ".....##.##.....",
      "....###.###....",
      "...####.####...",
      "..#####.#####..",
      ".######.######.",
      "#######.#######",
      "...............",
      "#######.#######",
      ".######.######.",
      "..#####.#####..",
      "...####.####...",
      "....###.###....",
      ".....##.##.....",
      "......#.#......",
    ]),
  },
  {
    name: "Hard - Anchor",
    solution: p([
      "......###......",
      ".....#####.....",
      "......###......",
      ".......#.......",
      ".......#.......",
      ".......#.......",
      ".......#.......",
      ".......#.......",
      ".......#.......",
      "##.....#.....##",
      "###...###...###",
      ".###.#####.###.",
      "..###########..",
      "...#########...",
      "....#######....",
    ]),
  },
  {
    name: "Hard - Snowflake",
    solution: p([
      "......###......",
      ".....#####.....",
      "......###......",
      "...#..###..#...",
      "..##..###..##..",
      ".###.#####.###.",
      "..###########..",
      "###############",
      "..###########..",
      ".###.#####.###.",
      "..##..###..##..",
      "...#..###..#...",
      "......###......",
      ".....#####.....",
      "......###......",
    ]),
  },
  {
    name: "Hard - Lighthouse",
    solution: p([
      ".......#.......",
      "......###......",
      ".......#.......",
      "......###......",
      "......###......",
      ".....#####.....",
      ".....#####.....",
      "....#######....",
      "....#######....",
      "...#########...",
      "...#########...",
      "..###########..",
      "..###########..",
      ".#############.",
      "###############",
    ]),
  },
  {
    name: "Hard - Star",
    solution: p([
      ".......#.......",
      "......###......",
      ".....#####.....",
      "....#######....",
      "###############",
      ".#############.",
      "..###########..",
      "...#########...",
      "..###########..",
      ".#############.",
      ".####.###.####.",
      "..###.....###..",
      "..##.......##..",
      "...............",
      "...............",
    ]),
  },
  {
    name: "Hard - Skull",
    solution: p([
      "....#######....",
      "...#########...",
      "..###########..",
      ".#############.",
      "###############",
      "###.###.###.###",
      "###.###.###.###",
      "###############",
      "###############",
      ".#############.",
      "..###########..",
      "..#.##.##.##...",
      "..###########..",
      "...#.#.#.#.#...",
      "...............",
    ]),
  },
  {
    name: "Hard - Sailboat",
    solution: p([
      ".......#.......",
      "......##.......",
      ".....###.......",
      "....####.......",
      "...#####.......",
      "..######.......",
      ".#######.......",
      "########.......",
      ".......########",
      "......#########",
      "###############",
      ".#############.",
      "..###########..",
      "...#########...",
      "....#######....",
    ]),
  },
  {
    name: "Hard - Castle",
    solution: p([
      "#.#.......#.#..",
      "###..###..###..",
      "###..###..###..",
      "###############",
      "###############",
      "###############",
      "#####.#.#####..",
      "#####...#####..",
      "#####.#.#####..",
      "###############",
      "###############",
      "####.....####..",
      "####.....####..",
      "####.###.####..",
      "###############",
    ]),
  },
  {
    name: "Hard - Robot",
    solution: p([
      "...#########...",
      "..###########..",
      "..#.##.##.##...",
      "..###########..",
      "..###########..",
      "...#########...",
      ".....#####.....",
      "...#########...",
      "..###########..",
      "..###########..",
      "..###########..",
      "..###.#.###....",
      "..###...###....",
      "..##.....##....",
      "..##.....##....",
    ]),
  },
  {
    name: "Hard - Tree",
    solution: p([
      ".......#.......",
      "......###......",
      ".....#####.....",
      "....#######....",
      "...#########...",
      "....#######....",
      "...#########...",
      "..###########..",
      ".#############.",
      "..###########..",
      ".#############.",
      "###############",
      ".......#.......",
      ".......#.......",
      "......###......",
    ]),
  },
];

// ─── Validate and output ────────────────────────────────────────

interface PuzzleEntry {
  id: number;
  name: string;
  solution: number[][];
}

function run() {
  const allDesigns = [
    ...easy5x5.map((d) => ({ ...d, size: "5x5" })),
    ...medium10x10.map((d) => ({ ...d, size: "10x10" })),
    ...hard15x15.map((d) => ({ ...d, size: "15x15" })),
  ];

  const puzzles: PuzzleEntry[] = [];
  let id = 1;
  let failed = 0;

  for (const design of allDesigns) {
    // Verify dimensions
    const rows = design.solution.length;
    const cols = design.solution[0]?.length ?? 0;
    const expectedSize = design.size.split("x").map(Number);

    if (rows !== expectedSize[0] || cols !== expectedSize[1]) {
      console.warn(`⚠ ${design.name}: size mismatch (got ${rows}x${cols}, expected ${design.size}) — fixing...`);
      // Pad or trim to expected size
      while (design.solution.length < expectedSize[0]) design.solution.push(new Array(expectedSize[1]).fill(0));
      design.solution = design.solution.slice(0, expectedSize[0]).map((row) => {
        const r = [...row];
        while (r.length < expectedSize[1]) r.push(0);
        return r.slice(0, expectedSize[1]);
      });
    }

    if (validate(design.solution)) {
      puzzles.push({ id: id++, name: design.name, solution: design.solution });
      console.log(`✅ ${design.name} (${design.size})`);
    } else {
      console.warn(`❌ ${design.name} (${design.size}) — NOT solvable by logic, skipped`);
      failed++;
    }
  }

  console.log(`\n${puzzles.length} passed, ${failed} failed\n`);

  // If we need more to reach minimums, generate random validated ones
  const easyCt = puzzles.filter((p) => p.name.startsWith("Easy")).length;
  const medCt = puzzles.filter((p) => p.name.startsWith("Medium")).length;
  const hardCt = puzzles.filter((p) => p.name.startsWith("Hard")).length;

  console.log(`Easy: ${easyCt}, Medium: ${medCt}, Hard: ${hardCt}`);

  // Generate additional random puzzles to reach targets if needed
  const targets = { easy: 20, medium: 15, hard: 10 };
  const configs: { prefix: string; target: number; current: number; rows: number; cols: number; fill: number }[] = [
    { prefix: "Easy", target: targets.easy, current: easyCt, rows: 5, cols: 5, fill: 0.5 },
    { prefix: "Medium", target: targets.medium, current: medCt, rows: 10, cols: 10, fill: 0.45 },
    { prefix: "Hard", target: targets.hard, current: hardCt, rows: 15, cols: 15, fill: 0.4 },
  ];

  for (const cfg of configs) {
    let need = cfg.target - cfg.current;
    let attempts = 0;
    while (need > 0 && attempts < 5000) {
      attempts++;
      const ratio = cfg.fill + (Math.random() - 0.5) * 0.15;
      const sol: number[][] = Array.from({ length: cfg.rows }, () =>
        Array.from({ length: cfg.cols }, () => (Math.random() < ratio ? 1 : 0)),
      );
      const filled = sol.flat().filter((c) => c === 1).length;
      const total = cfg.rows * cfg.cols;
      if (filled < total * 0.2 || filled > total * 0.8) continue;
      if (validate(sol)) {
        puzzles.push({
          id: id++,
          name: `${cfg.prefix} - Puzzle ${cfg.current + (cfg.target - need) + 1}`,
          solution: sol,
        });
        need--;
        console.log(`🎲 Generated ${cfg.prefix} filler (${need} more needed)`);
      }
    }
  }

  // Sort by difficulty group
  puzzles.sort((a, b) => {
    const order = (n: string) => (n.startsWith("Easy") ? 0 : n.startsWith("Medium") ? 1 : 2);
    return order(a.name) - order(b.name);
  });
  // Re-assign IDs
  puzzles.forEach((p, i) => (p.id = i + 1));

  const output = `import { RawPuzzle } from '@/types/puzzle';

export const puzzleLibrary: RawPuzzle[] = ${JSON.stringify(puzzles, null, 2)};
`;

  const fs = require("fs");
  const path = require("path");
  fs.writeFileSync(path.join(__dirname, "..", "src", "data", "puzzle_library.ts"), output, "utf-8");

  const finalEasy = puzzles.filter((p) => p.name.startsWith("Easy")).length;
  const finalMed = puzzles.filter((p) => p.name.startsWith("Medium")).length;
  const finalHard = puzzles.filter((p) => p.name.startsWith("Hard")).length;
  console.log(`\n✅ Final: ${puzzles.length} puzzles (Easy: ${finalEasy}, Medium: ${finalMed}, Hard: ${finalHard})`);
}

run();
