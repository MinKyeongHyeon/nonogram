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

export const puzzles: Puzzle[] = [
  {
    id: 1,
    name: 'Easy - 십자가',
    rows: 5,
    cols: 5,
    solution: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ],
    clues: {
      rows: [[1], [1], [5], [1], [1]],
      cols: [[1], [1], [5], [1], [1]]
    }
  },
  {
    id: 2,
    name: 'Easy - 하트',
    rows: 5,
    cols: 5,
    solution: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ],
    clues: {
      rows: [[1, 1], [5], [5], [3], [1]],
      cols: [[2], [4], [4], [4], [2]]
    }
  },
  {
    id: 3,
    name: 'Medium - 집',
    rows: 6,
    cols: 5,
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ],
    clues: {
      rows: [[1], [3], [5], [1, 1], [1, 1], [5]],
      cols: [[4], [2, 1], [3, 1], [2, 1], [4]]
    }
  },
  {
    id: 4,
    name: 'Medium - 나무',
    rows: 7,
    cols: 5,
    solution: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ],
    clues: {
      rows: [[1], [3], [5], [3], [1], [1], [1]],
      cols: [[1], [3], [7], [3], [1]]
    }
  },
  {
    id: 5,
    name: 'Hard - 스마일',
    rows: 7,
    cols: 7,
    solution: [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 0]
    ],
    clues: {
      rows: [[5], [1, 1], [1, 1, 1, 1], [1, 1], [1, 3, 1], [1, 1], [5]],
      cols: [[5], [1, 1], [1, 1, 1, 1], [1, 1, 1], [1, 1, 1, 1], [1, 1], [5]]
    }
  }
];

export async function fetchPuzzles(): Promise<Puzzle[]> {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(puzzles);
    }, 500);
  });
}

export async function fetchPuzzleById(id: number): Promise<Puzzle | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const puzzle = puzzles.find(p => p.id === id);
      resolve(puzzle || null);
    }, 500);
  });
}
