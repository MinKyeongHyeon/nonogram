"use client";

import React from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GameSidebarProps {
  mobile?: boolean;
  touchMode: "fill" | "mark";
  setTouchMode: (mode: "fill" | "mark") => void;
}

export default function GameSidebar({ mobile, touchMode, setTouchMode }: GameSidebarProps) {
  const { currentPuzzle, status, useHint, hints, reset } = usePuzzleStore();
  const { sound, toggleSound } = useSettingsStore();
  const { t } = useTranslation();
  const g = t.game;
  const router = useRouter();
  const disabled = status !== "playing";

  const difficultyLabel =
    currentPuzzle?.difficulty === "easy"
      ? g.starterPack
      : currentPuzzle?.difficulty === "medium"
        ? g.sweetPack
        : g.challengePack;

  if (mobile) {
    return (
      <div className="flex justify-around items-center px-4 pb-8 pt-3 bg-surface-container-lowest/70 backdrop-blur-xl rounded-t-[3rem] shadow-pudding">
        <button
          onClick={() => setTouchMode("fill")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all active:scale-95",
            touchMode === "fill" ? "text-primary" : "text-on-surface-variant",
          )}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: touchMode === "fill" ? "'FILL' 1" : "'FILL' 0" }}
          >
            edit
          </span>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest">{g.fill}</span>
        </button>
        <button
          onClick={() => setTouchMode("mark")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all active:scale-95",
            touchMode === "mark" ? "text-secondary" : "text-on-surface-variant",
          )}
        >
          <span className="material-symbols-outlined text-xl">close</span>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest">{g.markX}</span>
        </button>
        <button
          onClick={useHint}
          disabled={disabled || hints <= 0}
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all active:scale-95 text-on-surface-variant",
            (disabled || hints <= 0) && "opacity-30",
          )}
        >
          <span className="material-symbols-outlined text-xl">lightbulb</span>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest">
            {g.hint} ({hints})
          </span>
        </button>
        <button
          onClick={reset}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all active:scale-95 text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-xl">restart_alt</span>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest">{g.reset}</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="flex flex-col py-8 bg-surface-container-low rounded-r-[3rem] h-[calc(100vh-80px)] w-72 shadow-[0px_20px_40px_rgba(70,34,62,0.06)]">
      {/* Character & Level Info */}
      <div className="px-8 mb-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary-container bg-gradient-to-br from-primary-container/60 to-tertiary-container/60 flex items-center justify-center text-4xl">
            🍓
          </div>
          <div className="absolute -bottom-1 -right-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            LVL {currentPuzzle?.id ?? 1}
          </div>
        </div>
        <h2 className="font-headline text-xl font-black text-primary">Level {currentPuzzle?.id ?? 1}</h2>
        <p className="font-body text-sm font-semibold text-on-surface-variant">{difficultyLabel}</p>
      </div>

      {/* Mode & Action Buttons */}
      <div className="flex-grow space-y-2">
        {/* Fill Mode */}
        <button
          onClick={() => setTouchMode("fill")}
          className={cn(
            "w-full flex items-center gap-4 rounded-full mx-4 my-1 p-4 font-headline text-sm font-semibold transition-all active:scale-90",
            touchMode === "fill"
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:bg-surface-variant",
          )}
          style={{ width: "calc(100% - 2rem)" }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit
          </span>
          <span>{g.fillMode}</span>
        </button>

        {/* Mark X */}
        <button
          onClick={() => setTouchMode("mark")}
          className={cn(
            "w-full flex items-center gap-4 rounded-full mx-4 my-1 p-4 font-headline text-sm font-semibold transition-all active:scale-90",
            touchMode === "mark"
              ? "bg-secondary text-on-secondary shadow-lg"
              : "text-on-surface-variant hover:bg-surface-variant",
          )}
          style={{ width: "calc(100% - 2rem)" }}
        >
          <span className="material-symbols-outlined">close</span>
          <span>{g.markMode}</span>
        </button>

        {/* Hint */}
        <button
          onClick={useHint}
          disabled={disabled || hints <= 0}
          className={cn(
            "w-full flex items-center gap-4 rounded-full mx-4 my-1 p-4 font-headline text-sm font-semibold transition-all active:scale-90",
            "text-on-surface-variant hover:bg-surface-variant",
            (disabled || hints <= 0) && "opacity-40 pointer-events-none",
          )}
          style={{ width: "calc(100% - 2rem)" }}
        >
          <span className="material-symbols-outlined">lightbulb</span>
          <span>{g.hint}</span>
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          className="w-full flex items-center gap-4 rounded-full mx-4 my-1 p-4 font-headline text-sm font-semibold text-on-surface-variant hover:bg-surface-variant transition-all active:scale-90"
          style={{ width: "calc(100% - 2rem)" }}
        >
          <span className="material-symbols-outlined">restart_alt</span>
          <span>{g.reset}</span>
        </button>
      </div>

      {/* Sound/Music + Quit Game */}
      <div className="mt-auto border-t border-outline-variant/15 pt-6 pb-4">
        <div className="flex justify-around mb-6">
          <button
            onClick={toggleSound}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              sound ? "text-on-surface-variant hover:text-primary" : "text-outline-variant",
            )}
          >
            <span className="material-symbols-outlined">{sound ? "volume_up" : "volume_off"}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{g.sound}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">music_note</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{g.music}</span>
          </button>
        </div>
        <div className="px-4">
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-full bg-error text-on-error font-headline font-extrabold tracking-tight active:scale-95 transition-transform"
          >
            {g.quitGame}
          </button>
        </div>
      </div>
    </aside>
  );
}
