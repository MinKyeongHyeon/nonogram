import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClearRecord {
  puzzleId: number;
  time: number; // seconds
  stars: number; // 1-3
  clearedAt: string; // ISO date string
}

interface ProgressState {
  records: ClearRecord[];
  dailyCompleted: string[]; // ISO date strings of completed daily challenges
  streak: number;

  // Actions
  recordClear: (puzzleId: number, time: number) => void;
  completeDailyChallenge: (date: string) => void;
  getBestRecord: (puzzleId: number) => ClearRecord | undefined;
  getTotalStars: () => number;
  getTotalCleared: () => number;
}

function calcStars(time: number): number {
  if (time < 60) return 3;
  if (time < 180) return 2;
  return 1;
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      records: [],
      dailyCompleted: [],
      streak: 0,

      recordClear: (puzzleId, time) => {
        const stars = calcStars(time);
        const existing = get().records.find((r) => r.puzzleId === puzzleId);
        if (existing && existing.stars >= stars && existing.time <= time) return; // No improvement

        set((s) => ({
          records: [
            ...s.records.filter((r) => r.puzzleId !== puzzleId),
            { puzzleId, time, stars, clearedAt: new Date().toISOString() },
          ],
        }));
      },

      completeDailyChallenge: (date) => {
        set((s) => {
          if (s.dailyCompleted.includes(date)) return s;
          const newDates = [...s.dailyCompleted, date];
          return {
            dailyCompleted: newDates,
            streak: calcStreak(newDates),
          };
        });
      },

      getBestRecord: (puzzleId) => {
        return get().records.find((r) => r.puzzleId === puzzleId);
      },

      getTotalStars: () => {
        return get().records.reduce((sum, r) => sum + r.stars, 0);
      },

      getTotalCleared: () => {
        return get().records.length;
      },
    }),
    { name: "pudding-progress" },
  ),
);
