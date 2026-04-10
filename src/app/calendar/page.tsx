"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { puzzles } from "@/data/puzzles";
import Link from "next/link";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDailyPuzzleId(dateStr: string): number {
  // Deterministic puzzle mapping from date
  const hash = dateStr.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return puzzles[hash % puzzles.length].id;
}

export default function CalendarPage() {
  const { dailyCompleted, streak } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  useEffect(() => setMounted(true), []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthLabel = new Date(year, month).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  if (!mounted)
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
        {/* Header skeleton */}
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-32 h-6 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Streak + CTA skeleton */}
          <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-surface-container animate-shimmer" />
              <div className="space-y-2">
                <div className="w-20 h-6 rounded-full bg-surface-container animate-shimmer" />
                <div className="w-16 h-3 rounded-full bg-surface-container animate-shimmer" />
              </div>
            </div>
            <div className="w-full sm:w-48 h-14 rounded-full bg-surface-container animate-shimmer" />
          </section>
          {/* Calendar skeleton */}
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="w-9 h-9 rounded-full bg-surface-container animate-shimmer" />
              <div className="w-32 h-6 rounded-full bg-surface-container animate-shimmer" />
              <div className="w-9 h-9 rounded-full bg-surface-container animate-shimmer" />
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-surface-container animate-shimmer" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-surface-container animate-shimmer" style={{ animationDelay: `${(i % 7) * 0.05}s` }} />
              ))}
            </div>
          </section>
        </div>
      </main>
    );

  const completedSet = new Set(dailyCompleted);

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
      {/* Top Bar */}
      <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-xl font-headline font-bold">Daily Challenge</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Streak + Today CTA */}
        <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto">
            <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold">
                {streak} Day{streak !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-on-surface-variant">Current Streak</p>
            </div>
          </div>
          <Link
            href={`/puzzle/${getDailyPuzzleId(today)}`}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold shadow-soft-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_circle
            </span>
            Play Today&apos;s Challenge
          </Link>
        </section>

        {/* Calendar */}
        <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
            </button>
            <h3 className="text-lg font-headline font-bold">{monthLabel}</h3>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              const isCompleted = completedSet.has(dateStr);
              const isFuture = dateStr > today;

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                    isToday
                      ? "bg-primary text-on-primary font-bold shadow-soft-glow"
                      : isCompleted
                        ? "bg-tertiary-container text-on-tertiary-container"
                        : isFuture
                          ? "text-outline-variant/40"
                          : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="font-headline">{day}</span>
                  {isCompleted && (
                    <span
                      className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  )}
                  {isFuture && <span className="material-symbols-outlined text-[10px] opacity-30">lock</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Rewards hint */}
        <section className="bg-gradient-to-br from-secondary-container/40 to-primary-container/40 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-on-secondary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              redeem
            </span>
          </div>
          <div>
            <p className="font-headline font-bold">Keep your streak going!</p>
            <p className="text-sm text-on-surface-variant">Complete daily challenges to earn bonus rewards.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
