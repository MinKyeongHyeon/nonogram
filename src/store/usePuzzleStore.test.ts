import { usePuzzleStore, CellState } from './usePuzzleStore';
import type { Puzzle } from '@/data/puzzles';

// Mock Puzzle Data
const mockPuzzle: Puzzle = {
  id: 999,
  name: 'Test Puzzle',
  rows: 2,
  cols: 2,
  solution: [
    [1, 0],
    [0, 1]
  ],
  clues: {
    rows: [[1], [1]],
    cols: [[1], [1]]
  }
};

describe('usePuzzleStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePuzzleStore.getState().clearState();
  });

  describe('Game Initialization', () => {
    it('should initialize a puzzle correctly', () => {
      const store = usePuzzleStore.getState();
      
      store.initPuzzle(mockPuzzle);
      
      const updatedStore = usePuzzleStore.getState();
      expect(updatedStore.status).toBe('playing');
      expect(updatedStore.lives).toBe(3);
      expect(updatedStore.currentPuzzle?.id).toBe(999);
      expect(updatedStore.grid).toEqual([
        [0, 0],
        [0, 0]
      ]);
    });
  });

  describe('Click and Fill Modes', () => {
    beforeEach(() => {
      usePuzzleStore.getState().initPuzzle(mockPuzzle);
    });

    it('should correctly fill a block without penalty if solution is 1', () => {
      let store = usePuzzleStore.getState();
      // Click Top-Left (which is 1 in solution)
      store.handleClick(0, 0, false, 'fill');
      
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(1);
      expect(store.lives).toBe(3); // No lives lost
    });

    it('should penalize and reveal X if user clicks wrong block', () => {
      let store = usePuzzleStore.getState();
      // Click Top-Right (which is 0 in solution)
      store.handleClick(0, 1, false, 'fill');
      
      store = usePuzzleStore.getState();
      expect(store.grid[0][1]).toBe(2); // 2 represents fixed Penalty X
      expect(store.lives).toBe(2); // Lost 1 life
    });

    it('should trigger game over if lives reach 0', () => {
      let store = usePuzzleStore.getState();
      // Lose 3 lives by clicking the same wrong spots (our logic allows if it's not already fixed, wait, clicking fixed block ignores it).
      // Solution zero spots: [0,1], [1,0]. Since puzzle is 2x2, there are only 2 zero spots. 
      // To lose 3 lives, we'd need a bigger puzzle or we force it by mutating the same state if not protected, but it is protected.
      // Let's modify the store state manually for testing game over or just set up a custom puzzle.
      const bigPuzzle: Puzzle = {
        ...mockPuzzle,
        solution: [[0, 0], [0, 1]], // Need at least one 1, else it's immediately "cleared"
        rows: 2, cols: 2
      };
      store.initPuzzle(bigPuzzle);
      store = usePuzzleStore.getState();

      store.handleClick(0, 0, false, 'fill'); // live: 2
      store.handleClick(0, 1, false, 'fill'); // live: 1
      store.handleClick(1, 0, false, 'fill'); // live: 0

      store = usePuzzleStore.getState();
      expect(store.lives).toBe(0);
      expect(store.status).toBe('gameover');
    });

    it('should be able to manually mark with X (-1) without any penalty', () => {
      let store = usePuzzleStore.getState();
      // Mark Top-Left (which is 1 in solution, but it shouldn't matter for marking)
      store.handleClick(0, 0, false, 'mark');
      
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(-1); // Marked internally as -1
      expect(store.lives).toBe(3); // No lives lost
    });
  });

  describe('Undo & Redo System', () => {
    beforeEach(() => {
      usePuzzleStore.getState().initPuzzle(mockPuzzle);
    });

    it('should properly undo and redo actions', () => {
      let store = usePuzzleStore.getState();
      
      store.handleClick(0, 0, false, 'fill'); // Fill Top-Left
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(1);

      // Undo
      store.undo();
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(0);

      // Redo
      store.redo();
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(1);
    });
  });

  describe('Smart Completion & Game Clear', () => {
    beforeEach(() => {
      usePuzzleStore.getState().initPuzzle(mockPuzzle);
    });

    it('should auto-mark empty cells in a completed row', () => {
      let store = usePuzzleStore.getState();
      // Solve row 0 (which needs [0, 0] to be filled)
      store.handleClick(0, 0, false, 'fill');
      
      store = usePuzzleStore.getState();
      expect(store.grid[0][0]).toBe(1);
      // Because row 0 requires exactly one block (col 0), col 1 should be smart-completed to X (-1)
      expect(store.grid[0][1]).toBe(-1);
    });

    it('should change status to cleared when all 1s are found', () => {
      let store = usePuzzleStore.getState();
      store.handleClick(0, 0, false, 'fill');
      store.handleClick(1, 1, false, 'fill');

      store = usePuzzleStore.getState();
      expect(store.status).toBe('cleared');
    });
  });
});
