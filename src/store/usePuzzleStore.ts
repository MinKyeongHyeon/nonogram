import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puzzle } from '@/data/puzzles';

export type CellState = 0 | 1 | -1 | 2; // 0: empty, 1: filled, -1: marked X, 2: penalty X

interface HistoryStep {
  grid: CellState[][];
}

interface PuzzleState {
  currentPuzzle: Puzzle | null;
  grid: CellState[][];
  lives: number;
  status: 'idle' | 'playing' | 'gameover' | 'cleared';
  timer: number;
  history: HistoryStep[];
  historyIndex: number;

  // Actions
  initPuzzle: (puzzle: Puzzle) => void;
  handleClick: (row: number, col: number, isRightClick?: boolean, modeOverride?: 'fill' | 'mark') => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  tickTimer: () => void;
  clearState: () => void;
}

const MAX_LIVES = 3;

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      currentPuzzle: null,
      grid: [],
      lives: MAX_LIVES,
      status: 'idle',
      timer: 0,
      history: [],
      historyIndex: -1,

      initPuzzle: (puzzle: Puzzle) => {
        const newGrid = Array(puzzle.rows).fill(0).map(() => Array(puzzle.cols).fill(0));
        set({
          currentPuzzle: puzzle,
          grid: newGrid,
          lives: MAX_LIVES,
          status: 'playing',
          timer: 0,
          history: [{ grid: newGrid }],
          historyIndex: 0,
        });
      },

      handleClick: (row, col, isRightClick = false, modeOverride?: 'fill' | 'mark') => {
        const { currentPuzzle, grid, status, lives, history, historyIndex } = get();
        if (status !== 'playing' || !currentPuzzle) return;

        // If it's already definitively solved as filled or penalized, ignore
        if (grid[row][col] === 1 || grid[row][col] === 2) return;

        const isFillMode = modeOverride ? modeOverride === 'fill' : !isRightClick;
        const currentVal = grid[row][col];
        const solutionVal = currentPuzzle.solution[row][col];

        const newGrid = grid.map(r => [...r]);
        let newLives = lives;
        let newStatus: PuzzleState['status'] = status;

        if (isFillMode) {
          // Trying to fill
          if (solutionVal === 1) {
            // Correct
            newGrid[row][col] = 1;
          } else {
            // Mistake
            newLives -= 1;
            newGrid[row][col] = 2; // Fixed as X (penalty)
            if (newLives <= 0) {
              newStatus = 'gameover';
            }
          }
        } else {
          // Toggling mark
          newGrid[row][col] = currentVal === -1 ? 0 : -1;
        }

        // Smart Complete check: auto mark full rows and columns
        if (isFillMode && newGrid[row][col] === 1) {
          // Check Row
          let rowRequired = 0;
          let rowFilled = 0;
          for (let c = 0; c < currentPuzzle.cols; c++) {
            if (currentPuzzle.solution[row][c] === 1) rowRequired++;
            if (newGrid[row][c] === 1) rowFilled++;
          }
          if (rowRequired === rowFilled) {
            for (let c = 0; c < currentPuzzle.cols; c++) {
              if (newGrid[row][c] === 0) newGrid[row][c] = -1;
            }
          }

          // Check Col
          let colRequired = 0;
          let colFilled = 0;
          for (let r = 0; r < currentPuzzle.rows; r++) {
            if (currentPuzzle.solution[r][col] === 1) colRequired++;
            if (newGrid[r][col] === 1) colFilled++;
          }
          if (colRequired === colFilled) {
            for (let r = 0; r < currentPuzzle.rows; r++) {
              if (newGrid[r][col] === 0) newGrid[r][col] = -1;
            }
          }
        }

        // Check if cleared
        let isCleared = false;
        if (newStatus !== 'gameover') {
          isCleared = true;
          for (let r = 0; r < currentPuzzle.rows; r++) {
            for (let c = 0; c < currentPuzzle.cols; c++) {
              if (currentPuzzle.solution[r][c] === 1 && newGrid[r][c] !== 1) {
                isCleared = false;
                break;
              }
            }
            if (!isCleared) break;
          }
          if (isCleared) {
            newStatus = 'cleared';
          }
        }

        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ grid: newGrid });

        set({
          grid: newGrid,
          lives: newLives,
          status: newStatus,
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
      },

      undo: () => {
        const { history, historyIndex, status } = get();
        if (status !== 'playing' || historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        set({
          grid: history[newIndex].grid,
          historyIndex: newIndex
        });
      },

      redo: () => {
        const { history, historyIndex, status } = get();
        if (status !== 'playing' || historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        set({
          grid: history[newIndex].grid,
          historyIndex: newIndex
        });
      },

      reset: () => {
        const { currentPuzzle } = get();
        if (!currentPuzzle) return;
        const emptyGrid = Array(currentPuzzle.rows).fill(0).map(() => Array(currentPuzzle.cols).fill(0));
        set({
          grid: emptyGrid,
          lives: MAX_LIVES,
          status: 'playing',
          timer: 0,
          history: [{ grid: emptyGrid }],
          historyIndex: 0,
        });
      },

      tickTimer: () => {
        const { status } = get();
        if (status === 'playing') {
          set(state => ({ timer: state.timer + 1 }));
        }
      },

      clearState: () => set({
        currentPuzzle: null,
        grid: [],
        lives: MAX_LIVES,
        status: 'idle',
        timer: 0,
        history: [],
        historyIndex: -1,
      })
    }),
    {
      name: 'nonogram-storage',
      partialize: (state) => ({ 
        currentPuzzle: state.currentPuzzle,
        grid: state.grid,
        lives: state.lives,
        status: state.status,
        timer: state.timer,
        history: state.history,
        historyIndex: state.historyIndex
      }),
    }
  )
);
