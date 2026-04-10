"use client";

import React, { useEffect, useState } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import Link from "next/link";

interface GameHeaderProps {
  onBack?: () => void;
}

export default function GameHeader({ onBack }: GameHeaderProps) {
  const { currentPuzzle, lives, status, timer, tickTimer } = usePuzzleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "playing") {
      interval = setInterval(tickTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!mounted) return <header className="h-16 bg-surface" />;

  return (
    <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-[1440px] mx-auto">
        {/* Left: Back + Level info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>

          {currentPuzzle && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold -rotate-1 shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  extension
                </span>
                {currentPuzzle.rows}×{currentPuzzle.cols}
              </span>
              <span className="text-sm font-headline font-bold text-on-surface hidden sm:inline">
                {currentPuzzle.name}
              </span>
            </div>
          )}
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-tertiary-container text-on-tertiary-container rounded-full font-mono font-semibold text-sm">
          <span className="material-symbols-outlined text-base">timer</span>
          {formatTimer(timer)}
        </div>

        {/* Right: Lives + Home */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className="material-symbols-outlined text-xl"
                style={{
                  fontVariationSettings: heart <= lives ? "'FILL' 1" : "'FILL' 0",
                  color: heart <= lives ? "#b41340" : "#d09ec1",
                }}
              >
                favorite
              </span>
            ))}
          </div>
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">home</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
