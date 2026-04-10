export type Difficulty = "easy" | "medium" | "hard";

export interface Clues {
  rows: number[][];
  cols: number[][];
}

export interface Puzzle {
  id: number;
  name: string;
  rows: number;
  cols: number;
  difficulty: Difficulty;
  solution: number[][];
  clues: Clues;
}

export interface RawPuzzle {
  id: number;
  name: string;
  solution: number[][];
}
