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
  /** 서버에서 가져온 records를 로컬과 병합 (각 퍼즐별 최고 기록 유지) */
  mergeRecords: (incoming: ClearRecord[]) => void;
}

function calcStars(time: number): number {
  if (time < 60) return 3;
  if (time < 180) return 2;
  return 1;
}

function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = localDateStr();
  const yesterday = localDateStr(new Date(Date.now() - 86400000));

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    // Use noon to avoid DST edge cases
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const curr = new Date(sorted[i] + "T12:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) {
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

      mergeRecords: (incoming) => {
        set((s) => {
          const merged = [...s.records];
          for (const inc of incoming) {
            const idx = merged.findIndex((r) => r.puzzleId === inc.puzzleId);
            if (idx === -1) {
              merged.push(inc);
            } else {
              // 더 높은 stars, 같은 stars면 더 짧은 시간 우선
              const cur = merged[idx];
              if (inc.stars > cur.stars || (inc.stars === cur.stars && inc.time < cur.time)) {
                merged[idx] = inc;
              }
            }
          }
          return { records: merged };
        });
      },
    }),
    { name: "pudding-progress" },
  ),
);
