"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";

export function StarsWon() {
  const getTotalStars = useProgressStore((s) => s.getTotalStars);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? getTotalStars() : 0}</>;
}

/**
 * puzzleIds: Supabase에서 받은 패키지 소속 퍼즐 ID 목록
 * barColor:  Tailwind 클래스 (예: "bg-tertiary-container")
 */
export function PackProgress({ puzzleIds, barColor }: { puzzleIds: number[]; barColor: string }) {
  const records = useProgressStore((s) => s.records);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = puzzleIds.length;

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
  const cleared = puzzleIds.filter((id) => clearedIds.has(id)).length;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

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
