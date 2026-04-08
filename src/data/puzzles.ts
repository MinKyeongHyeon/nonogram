import { generateCluesFromSolution } from '@/lib/puzzleUtils';
import { Puzzle, RawPuzzle } from '@/types/puzzle';
export type { Clues, Puzzle, RawPuzzle } from '@/types/puzzle';

export function completePuzzle(raw: RawPuzzle): Puzzle {
  return {
    ...raw,
    rows: raw.solution.length,
    cols: raw.solution[0].length,
    clues: generateCluesFromSolution(raw.solution),
  };
}

import { puzzleLibrary } from './puzzle_library';

export const puzzles: Puzzle[] = puzzleLibrary.map(completePuzzle);


export async function fetchPuzzles(): Promise<Puzzle[]> {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(puzzleLibrary.map(p => completePuzzle(p)));
    }, 500);
  });
}

export async function fetchPuzzleById(id: number): Promise<Puzzle | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const puzzle = puzzleLibrary.find(p => p.id === id);
      resolve(puzzle ? completePuzzle(puzzle) : null);
    }, 500);
  });
}
