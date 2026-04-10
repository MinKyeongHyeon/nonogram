import { solveNonogram, validatePuzzle, generateValidPuzzle } from "./nonogramSolver";
import { generateCluesFromSolution } from "./puzzleUtils";

describe("solveNonogram", () => {
  it("solves a simple 5×5 cross pattern", () => {
    const solution = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ];
    const clues = generateCluesFromSolution(solution);
    const result = solveNonogram(clues.rows, clues.cols);

    expect(result.solved).toBe(true);
    expect(result.grid).toEqual(solution);
  });

  it("solves a 5×5 heart pattern", () => {
    const solution = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ];
    const clues = generateCluesFromSolution(solution);
    const result = solveNonogram(clues.rows, clues.cols);

    expect(result.solved).toBe(true);
    expect(result.grid).toEqual(solution);
  });

  it("returns solved=false for ambiguous puzzles", () => {
    // Checkerboard-like pattern: clues [1,1] for every row and column
    // This has multiple solutions
    const rowClues = [[1, 1], [1, 1]];
    const colClues = [[1, 1], [1, 1]];
    const result = solveNonogram(rowClues, colClues);

    // The solver should not be able to fully determine this
    // (two valid solutions: diagonal and anti-diagonal)
    expect(result.solved).toBe(false);
  });
});

describe("validatePuzzle", () => {
  it("validates a solvable puzzle", () => {
    const solution = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    const clues = generateCluesFromSolution(solution);
    const result = validatePuzzle(solution, clues.rows, clues.cols);

    expect(result.valid).toBe(true);
  });

  it("rejects an ambiguous puzzle", () => {
    // 2×2 with one cell filled in each row/col → ambiguous
    const solution = [
      [1, 0],
      [0, 1],
    ];
    const clues = generateCluesFromSolution(solution);
    const result = validatePuzzle(solution, clues.rows, clues.cols);

    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });
});

describe("generateValidPuzzle", () => {
  it("generates a valid 5×5 puzzle", () => {
    const result = generateValidPuzzle({ rows: 5, cols: 5 });
    expect(result).not.toBeNull();

    if (result) {
      expect(result.solution).toHaveLength(5);
      expect(result.solution[0]).toHaveLength(5);
      expect(result.clues.rows).toHaveLength(5);
      expect(result.clues.cols).toHaveLength(5);

      // Verify solved matches
      const solveResult = solveNonogram(result.clues.rows, result.clues.cols);
      expect(solveResult.solved).toBe(true);
      expect(solveResult.grid).toEqual(result.solution);
    }
  });

  it("generates a valid 10×10 puzzle", () => {
    const result = generateValidPuzzle({ rows: 10, cols: 10, maxAttempts: 2000 });
    expect(result).not.toBeNull();

    if (result) {
      expect(result.solution).toHaveLength(10);
      const solveResult = solveNonogram(result.clues.rows, result.clues.cols);
      expect(solveResult.solved).toBe(true);
    }
  });
});
