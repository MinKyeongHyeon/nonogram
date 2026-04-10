import { fetchPuzzles, fetchPuzzleById, puzzles } from "./puzzles";
import { solveNonogram } from "../lib/nonogramSolver";

describe("Puzzle Data and Fetching", () => {
  it("should fetch all puzzles", async () => {
    const fetched = await fetchPuzzles();
    expect(fetched.length).toBe(puzzles.length);
    expect(fetched.length).toBeGreaterThanOrEqual(40);
  });

  it("should have all necessary fields after dynamic completion", async () => {
    const fetched = await fetchPuzzles();
    const firstPuzzle = fetched[0];

    expect(firstPuzzle).toHaveProperty("id");
    expect(firstPuzzle).toHaveProperty("name");
    expect(firstPuzzle).toHaveProperty("solution");
    expect(firstPuzzle).toHaveProperty("rows");
    expect(firstPuzzle).toHaveProperty("cols");
    expect(firstPuzzle).toHaveProperty("clues");
    expect(firstPuzzle).toHaveProperty("difficulty");

    expect(firstPuzzle.rows).toBeGreaterThan(0);
    expect(firstPuzzle.cols).toBeGreaterThan(0);
    expect(firstPuzzle.clues.rows).toHaveLength(firstPuzzle.rows);
    expect(firstPuzzle.clues.cols).toHaveLength(firstPuzzle.cols);
  });

  it("should fetch a specific puzzle by ID correctly", async () => {
    const puzzle = await fetchPuzzleById(1);
    expect(puzzle).not.toBeNull();
    expect(puzzle?.name).toContain("Easy");
    expect(puzzle?.rows).toBe(5);
    expect(puzzle?.cols).toBe(5);
  });

  it("should return null for non-existent puzzle ID", async () => {
    const puzzle = await fetchPuzzleById(999);
    expect(puzzle).toBeNull();
  });

  it("every puzzle should be solvable by logic alone", () => {
    for (const puzzle of puzzles) {
      const result = solveNonogram(puzzle.clues.rows, puzzle.clues.cols);
      expect(result.solved).toBe(true);
      expect(result.grid).toEqual(puzzle.solution);
    }
  });
});
