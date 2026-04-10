import { generateCluesFromSolution } from "@/lib/puzzleUtils";
import { Difficulty, Puzzle, RawPuzzle } from "@/types/puzzle";
export type { Clues, Puzzle, RawPuzzle, Difficulty } from "@/types/puzzle";

function inferDifficulty(raw: RawPuzzle): Difficulty {
  const name = raw.name.toLowerCase();
  if (name.startsWith("easy")) return "easy";
  if (name.startsWith("medium")) return "medium";
  if (name.startsWith("hard")) return "hard";
  // Fallback: size-based
  const size = raw.solution.length * raw.solution[0].length;
  if (size <= 25) return "easy";
  if (size <= 49) return "medium";
  return "hard";
}

export function completePuzzle(raw: RawPuzzle): Puzzle {
  return {
    ...raw,
    rows: raw.solution.length,
    cols: raw.solution[0].length,
    difficulty: inferDifficulty(raw),
    clues: generateCluesFromSolution(raw.solution),
  };
}

import { puzzleLibrary } from "./puzzle_library";

export const puzzles: Puzzle[] = puzzleLibrary.map(completePuzzle);

export async function fetchPuzzles(): Promise<Puzzle[]> {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(puzzleLibrary.map((p) => completePuzzle(p)));
    }, 500);
  });
}

export async function fetchPuzzleById(id: number): Promise<Puzzle | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const puzzle = puzzleLibrary.find((p) => p.id === id);
      resolve(puzzle ? completePuzzle(puzzle) : null);
    }, 500);
  });
}
