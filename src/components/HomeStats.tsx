"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { puzzles } from "@/data/puzzles";

export function StarsWon() {
  const getTotalStars = useProgressStore((s) => s.getTotalStars);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? getTotalStars() : 0}</>;
}

export function PackProgress({ difficulty }: { difficulty: string }) {
  const records = useProgressStore((s) => s.records);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const packPuzzles = puzzles.filter((p) => p.difficulty === difficulty.toLowerCase());
  const total = packPuzzles.length;

  if (!mounted) {
    return (
      <>
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span>Progress</span>
          <span>0/{total}</span>
        </div>
        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: "0%" }} />
        </div>
      </>
    );
  }

  const clearedIds = new Set(records.map((r) => r.puzzleId));
  const cleared = packPuzzles.filter((p) => clearedIds.has(p.id)).length;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

  const colorMap: Record<string, string> = {
    easy: "bg-tertiary-container",
    medium: "bg-secondary-container",
    hard: "bg-primary-container",
  };
  const barColor = colorMap[difficulty.toLowerCase()] ?? "bg-primary-container";

  return (
    <>
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>Progress</span>
        <span>
          {cleared}/{total}
        </span>
      </div>
      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}
