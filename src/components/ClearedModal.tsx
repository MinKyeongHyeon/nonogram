"use client";

import React, { useEffect, useRef } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { playClear, haptic } from "@/lib/sound";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/hooks/useTranslation";
import { calcStars } from "@/lib/puzzleUtils";
import { puzzles } from "@/data/puzzles";
import Link from "next/link";

function getDailyPuzzleId(dateStr: string): number {
  // djb2-like multiplicative hash — prevents collisions from simple charCode sum
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (((hash << 5) + hash) ^ dateStr.charCodeAt(i)) >>> 0;
  }
  return puzzles[hash % puzzles.length].id;
}

function localDateStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ClearedModal() {
  const { currentPuzzle, sourcePackDifficulty, timer, reset } = usePuzzleStore();
  const sound = useSettingsStore((s) => s.sound);
  const hapticsOn = useSettingsStore((s) => s.haptics);
  const recordClear = useProgressStore((s) => s.recordClear);
  const completeDailyChallenge = useProgressStore((s) => s.completeDailyChallenge);
  const session = useAuthStore((s) => s.session);
  const showToast = useToast((s) => s.show);
  const { t } = useTranslation();
  const cm = t.clearedModal;
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
      const today = localDateStr();
      if (currentPuzzle.id === getDailyPuzzleId(today)) {
        completeDailyChallenge(today);
      }

      // 로그인 상태면 서버에도 기록 저장
      if (session) {
        const stars = currentPuzzle ? calcStars(timer, currentPuzzle.rows, currentPuzzle.cols) : 1;
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
  }, [currentPuzzle, timer, recordClear, completeDailyChallenge, session, showToast]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (!currentPuzzle) return;

    const stars = calcStars(timer, currentPuzzle.rows, currentPuzzle.cols);
    const timeStr = formatTimer(timer);
    const puzzleName = currentPuzzle.name ?? "Puzzle";

    const W = 400;
    const H = 520;
    const dpr = 2;

    const canvas = document.createElement("canvas");
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#fdf8ff");
    grad.addColorStop(1, "#f3e8ff");
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(0, 0, W, H, 24);
    } else {
      ctx.rect(0, 0, W, H);
    }
    ctx.fill();

    // Celebration circle
    ctx.beginPath();
    ctx.arc(W / 2, 56, 36, 0, Math.PI * 2);
    ctx.fillStyle = "#a8edde";
    ctx.fill();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "32px sans-serif";
    ctx.fillText("🎉", W / 2, 56);

    // Grid preview
    const gridSize = 160;
    const gridX = (W - gridSize) / 2;
    const gridY = 110;
    const { cols, rows } = currentPuzzle;
    const cellTotal = (gridSize - 8) / Math.max(cols, rows);
    const gap = Math.max(1, Math.floor(cellTotal * 0.12));
    const cellDraw = cellTotal - gap;
    const offX = gridX + 4 + (gridSize - 8 - cols * cellTotal) / 2;
    const offY = gridY + 4 + (gridSize - 8 - rows * cellTotal) / 2;

    ctx.fillStyle = "#ede9f3";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(gridX, gridY, gridSize, gridSize, 10);
    } else {
      ctx.rect(gridX, gridY, gridSize, gridSize);
    }
    ctx.fill();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = currentPuzzle.solution[r][c];
        const x = offX + c * cellTotal;
        const y = offY + r * cellTotal;
        ctx.fillStyle = cell === 1 ? "#6a45b2" : "#fdf8ff";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, cellDraw, cellDraw, 2);
        } else {
          ctx.rect(x, y, cellDraw, cellDraw);
        }
        ctx.fill();
      }
    }

    // Title
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "center";
    ctx.fillStyle = "#3d3248";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.fillText(cm.title, W / 2, 300);

    ctx.fillStyle = "#7b6f87";
    ctx.font = "15px system-ui, sans-serif";
    ctx.fillText(`${puzzleName} ${cm.completed}`, W / 2, 322);

    // Divider
    ctx.strokeStyle = "#e8e0f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48, 342);
    ctx.lineTo(W - 48, 342);
    ctx.stroke();

    // Stats — time (left) / stars (right)
    const leftX = W / 2 - 64;
    const rightX = W / 2 + 64;

    ctx.textAlign = "center";
    ctx.fillStyle = "#3d3248";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(timeStr, leftX, 382);
    ctx.fillStyle = "#7b6f87";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(cm.time, leftX, 402);

    ctx.fillStyle = "#6a45b2";
    ctx.font = "bold 26px system-ui, sans-serif";
    ctx.fillText("★".repeat(stars) + "☆".repeat(3 - stars), rightX, 382);
    ctx.fillStyle = "#7b6f87";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(cm.stars, rightX, 402);

    // Branding
    ctx.fillStyle = "#c5b8d9";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("nonogram", W / 2, H - 22);

    // Share
    canvas.toBlob(async (blob) => {
      if (!blob) {
        showToast(cm.shareFailed, "error");
        return;
      }
      const shareText = `${puzzleName} ${cm.completed} ⏱ ${timeStr}  ${"★".repeat(stars)}`;
      const file = new File([blob], "nonogram-cleared.png", { type: "image/png" });

      const canNativeShare =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canNativeShare) {
        try {
          await navigator.share({ title: cm.shareTitle, text: shareText, files: [file] });
        } catch (e) {
          if ((e as DOMException).name !== "AbortError") {
            showToast(cm.shareFailed, "error");
          }
        }
        return;
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast(cm.shareCopied, "success");
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nonogram-cleared.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
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
          <h2 className="text-2xl font-headline font-extrabold text-on-surface">{cm.title}</h2>
          <p className="text-on-surface-variant">
            {currentPuzzle?.name ?? "Puzzle"} {cm.completed}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-tertiary text-xl">timer</span>
            <p className="text-lg font-headline font-bold text-on-surface">{formatTimer(timer)}</p>
            <p className="text-xs text-on-surface-variant">{cm.time}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3].map((n) => {
                const earned = currentPuzzle ? calcStars(timer, currentPuzzle.rows, currentPuzzle.cols) : 1;
                return (
                  <span
                    key={n}
                    className="material-symbols-outlined text-xl"
                    style={{
                      fontVariationSettings: n <= earned ? "'FILL' 1" : "'FILL' 0",
                      color: n <= earned ? "var(--color-primary)" : undefined,
                      opacity: n <= earned ? 1 : 0.25,
                    }}
                  >
                    star
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{cm.stars}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-on-primary py-3.5 rounded-full font-headline font-bold shadow-soft-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {cm.playAgain}
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0" }}>
              share
            </span>
            {cm.share}
          </button>
          {(sourcePackDifficulty ?? currentPuzzle?.difficulty) && (
            <Link
              href={`/pack/${sourcePackDifficulty ?? currentPuzzle?.difficulty}`}
              className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors text-center"
            >
              {cm.backToPackage}
            </Link>
          )}
          <Link
            href="/"
            className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors text-center"
          >
            {cm.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
