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
  return puzzleLibrary.map((p) => completePuzzle(p));
}

export async function fetchPuzzleById(id: number): Promise<Puzzle | null> {
  // Supabase 우선 조회
  try {
    const res = await fetch(`/api/puzzles/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data) {
        const p = json.data;
        return {
          id: p.id,
          name: p.title,
          rows: (p.grid_data as number[][]).length,
          cols: (p.grid_data as number[][])[0]?.length ?? 0,
          difficulty: p.difficulty as Difficulty,
          solution: p.grid_data as number[][],
          clues: p.clues as { rows: number[][]; cols: number[][] },
        };
      }
    }
  } catch {
    // Supabase 실패 시 로컬 폴백
  }

  // 로컬 폴백
  const puzzle = puzzleLibrary.find((p) => p.id === id);
  return puzzle ? completePuzzle(puzzle) : null;
}
