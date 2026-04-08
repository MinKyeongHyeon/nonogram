export interface Clues {
  rows: number[][];
  cols: number[][];
}

export interface Puzzle {
  id: number;
  name: string;
  rows: number;
  cols: number;
  solution: number[][];
  clues: Clues;
}

export interface RawPuzzle {
  id: number;
  name: string;
  solution: number[][];
}
