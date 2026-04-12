"use client";

import React, { useEffect, useRef } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { playClear, haptic } from "@/lib/sound";
import { useToast } from "@/components/Toast";
import { puzzles } from "@/data/puzzles";
import Link from "next/link";

function getDailyPuzzleId(dateStr: string): number {
  const hash = dateStr.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return puzzles[hash % puzzles.length].id;
}

export default function ClearedModal() {
  const { currentPuzzle, timer, reset } = usePuzzleStore();
  const sound = useSettingsStore((s) => s.sound);
  const hapticsOn = useSettingsStore((s) => s.haptics);
  const recordClear = useProgressStore((s) => s.recordClear);
  const completeDailyChallenge = useProgressStore((s) => s.completeDailyChallenge);
  const session = useAuthStore((s) => s.session);
  const showToast = useToast((s) => s.show);
  const recorded = useRef(false);

  useEffect(() => {
    if (sound) playClear();
    if (hapticsOn) haptic([20, 40, 20, 40, 20]);
  }, [sound, hapticsOn]);

  // Record clear to progress store (once)
  useEffect(() => {
    if (!recorded.current && currentPuzzle) {
      recorded.current = true;
      recordClear(currentPuzzle.id, timer);

      // Check if this is today's daily challenge
      const today = new Date().toISOString().split("T")[0];
      if (currentPuzzle.id === getDailyPuzzleId(today)) {
        completeDailyChallenge(today);
      }

      // 로그인 상태면 서버에도 기록 저장
      if (session) {
        const stars = timer < 60 ? 3 : timer < 180 ? 2 : 1;
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) return;
          fetch("/api/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              puzzle_id: String(currentPuzzle.id),
              time_sec: timer,
              stars,
            }),
          })
            .then(async (res) => {
              if (!res.ok) showToast("기록 저장에 실패했어요. 로컬에는 저장됐어요.", "error");
            })
            .catch(() => {
              showToast("네트워크 오류로 기록 저장에 실패했어요.", "error");
            });
        });
      }
    }
  }, [currentPuzzle, timer, recordClear, completeDailyChallenge, session]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const confettiColors = ["#fe7db8", "#dcc9ff", "#98ffd9", "#f74b6d", "#ffd700", "#6a45b2"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[101]">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: "-8px",
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              backgroundColor: confettiColors[i % confettiColors.length],
              animationDelay: `${Math.random() * 0.8}s`,
              animationDuration: `${2 + Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-8 mx-4 max-w-sm w-full shadow-pudding-lg text-center space-y-6 animate-in z-[102] relative">
        {/* Celebration Icon */}
        <div className="w-20 h-20 mx-auto bg-tertiary-container rounded-full flex items-center justify-center">
          <span
            className="material-symbols-outlined text-tertiary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            celebration
          </span>
        </div>

        {/* Cleared Puzzle Preview */}
        {currentPuzzle && (
          <div className="flex justify-center">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${currentPuzzle.cols}, 1fr)`,
                width: 128,
                height: 128,
                gap: 2,
                borderRadius: 8,
                overflow: "hidden",
                padding: 4,
                background: "var(--color-surface-container-low, #f0eff4)",
              }}
            >
              {currentPuzzle.solution.flatMap((row, rIdx) =>
                row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      borderRadius: 2,
                      backgroundColor:
                        cell === 1 ? "var(--color-primary, #6a45b2)" : "var(--color-surface-container-lowest, #fdf8ff)",
                    }}
                  />
                )),
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface">Puzzle Cleared!</h2>
          <p className="text-on-surface-variant">{currentPuzzle?.name ?? "Puzzle"} completed</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-tertiary text-xl">timer</span>
            <p className="text-lg font-headline font-bold text-on-surface">{formatTimer(timer)}</p>
            <p className="text-xs text-on-surface-variant">Time</p>
          </div>
          <div className="text-center">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <p className="text-lg font-headline font-bold text-on-surface">
              {timer < 60 ? "★★★" : timer < 180 ? "★★" : "★"}
            </p>
            <p className="text-xs text-on-surface-variant">Stars</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-on-primary py-3.5 rounded-full font-headline font-bold shadow-soft-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Play Again
          </button>
          {currentPuzzle?.difficulty && (
            <Link
              href={`/pack/${currentPuzzle.difficulty}`}
              className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors text-center"
            >
              Back to Package
            </Link>
          )}
          <Link
            href="/"
            className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
