"use client";

import { useEffect, useState, use } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { puzzles } from "@/data/puzzles";
import { Difficulty } from "@/types/puzzle";
import Link from "next/link";
import { PackProgress } from "@/components/HomeStats";

const PACK_META: Record<string, { title: string; label: string; color: string; textColor: string; icon: string }> = {
  easy: {
    title: "Starter 5×5",
    label: "Easy",
    color: "bg-tertiary-container",
    textColor: "text-tertiary",
    icon: "sunny",
  },
  medium: {
    title: "Sweet 5×5",
    label: "Medium",
    color: "bg-secondary-container",
    textColor: "text-secondary",
    icon: "local_cafe",
  },
  hard: {
    title: "Challenge Mix",
    label: "Hard",
    color: "bg-primary-container",
    textColor: "text-primary",
    icon: "bolt",
  },
};

export default function PackPage({ params }: { params: Promise<{ difficulty: string }> }) {
  const { difficulty } = use(params);
  const { records, getBestRecord } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const meta = PACK_META[difficulty];
  const packPuzzles = puzzles.filter((p) => p.difficulty === (difficulty as Difficulty));

  if (!meta) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Pack not found.</p>
      </main>
    );
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
        {/* Header skeleton */}
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-28 h-6 rounded-full bg-surface-container animate-shimmer" />
            <div className="ml-auto w-14 h-6 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Stats row skeleton */}
          <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-full bg-surface-container animate-shimmer" />
                <div className="space-y-2">
                  <div className="w-20 h-6 rounded bg-surface-container animate-shimmer" />
                  <div className="w-24 h-3 rounded bg-surface-container animate-shimmer" />
                </div>
              </div>
            ))}
          </section>
          {/* Progress skeleton */}
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-2">
            <div className="w-24 h-4 rounded bg-surface-container animate-shimmer" />
            <div className="w-full h-3 rounded-full bg-surface-container animate-shimmer" />
          </section>
          {/* Puzzle grid skeleton */}
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
            <div className="w-16 h-6 rounded bg-surface-container animate-shimmer mb-4" />
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-surface-container animate-shimmer" style={{ animationDelay: `${(i % 7) * 0.05}s` }} />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  const clearedCount = packPuzzles.filter((p) => records.some((r) => r.puzzleId === p.id)).length;
  const totalStars = packPuzzles.reduce((sum, p) => {
    const rec = getBestRecord(p.id);
    return sum + (rec?.stars ?? 0);
  }, 0);
  const maxStars = packPuzzles.length * 3;

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
      {/* Top Bar — same as calendar */}
      <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-xl font-headline font-bold">{meta.title}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${meta.color} ${meta.textColor}`}>
            {meta.label}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Stats row — mirrors calendar streak section */}
        <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto">
            <div className={`w-12 h-12 ${meta.color} rounded-full flex items-center justify-center shrink-0`}>
              <span
                className={`material-symbols-outlined ${meta.textColor} text-2xl`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold">
                {clearedCount} / {packPuzzles.length}
              </p>
              <p className="text-xs text-on-surface-variant">Puzzles Cleared</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-secondary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold">
                {totalStars} / {maxStars}
              </p>
              <p className="text-xs text-on-surface-variant">Stars Earned</p>
            </div>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-2">
          <p className="text-sm font-headline font-bold text-on-surface-variant">Pack Progress</p>
          <PackProgress difficulty={meta.label} />
        </section>

        {/* Puzzle Grid — calendar-style grid */}
        <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
          <h3 className="text-lg font-headline font-bold mb-4">Puzzles</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {packPuzzles.map((p) => {
              const rec = getBestRecord(p.id);
              const isCleared = !!rec;
              const stars = rec?.stars ?? 0;
              const displayName = p.name.replace(/^(Easy|Medium|Hard)\s*-\s*/, "");

              return (
                <Link
                  key={p.id}
                  href={`/puzzle/${p.id}`}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all hover:-translate-y-1 ${
                    isCleared
                      ? "bg-tertiary-container text-on-tertiary-container"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="font-headline text-xs text-center leading-tight px-1 truncate w-full">
                    {displayName}
                  </span>
                  {isCleared && (
                    <span
                      className="material-symbols-outlined text-[14px] mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                  {isCleared && (
                    <div className="flex gap-px mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={`material-symbols-outlined text-[10px] ${
                            s <= stars ? "text-secondary" : "text-outline-variant/30"
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Encouragement hint — mirrors calendar rewards section */}
        <section className="bg-gradient-to-br from-secondary-container/40 to-primary-container/40 rounded-xl p-5 flex items-center gap-4">
          <div className={`w-12 h-12 ${meta.color} rounded-full flex items-center justify-center shrink-0`}>
            <span
              className={`material-symbols-outlined ${meta.textColor} text-2xl`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {meta.icon}
            </span>
          </div>
          <div>
            <p className="font-headline font-bold">Complete all puzzles!</p>
            <p className="text-sm text-on-surface-variant">
              Clear every puzzle in this pack to earn max stars and master {meta.label.toLowerCase()} difficulty.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
