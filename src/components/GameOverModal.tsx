"use client";

import React from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export default function GameOverModal() {
  const { currentPuzzle, reset } = usePuzzleStore();
  const { t } = useTranslation();
  const go = t.gameOverModal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-8 mx-4 max-w-sm w-full shadow-pudding-lg text-center space-y-6 animate-in">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-error-container/30 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            heart_broken
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface">{go.title}</h2>
          <p className="text-on-surface-variant">
            {go.desc} <span className="font-semibold">{currentPuzzle?.name ?? "this puzzle"}</span>
          </p>
        </div>

        {/* Heart display */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3].map((heart) => (
            <span
              key={heart}
              className="material-symbols-outlined text-3xl text-outline-variant/40"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              favorite
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-on-primary py-3.5 rounded-full font-headline font-bold shadow-soft-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {go.tryAgain}
          </button>
          <Link
            href="/"
            className="w-full bg-surface-container-low text-on-surface py-3.5 rounded-full font-headline font-semibold hover:bg-surface-container transition-colors text-center"
          >
            {go.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
