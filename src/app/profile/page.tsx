"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { puzzles } from "@/data/puzzles";
import Link from "next/link";

type AchievementChecker = (
  cleared: number,
  stars: number,
  streak: number,
  records: { puzzleId: number; time: number }[],
) => boolean;

const easyPuzzleIds = new Set(puzzles.filter((p) => p.difficulty === "easy").map((p) => p.id));

const achievements: { id: string; icon: string; label: string; desc: string; check: AchievementChecker }[] = [
  {
    id: "first-clear",
    icon: "emoji_events",
    label: "First Clear",
    desc: "Clear your first puzzle",
    check: (cleared) => cleared >= 1,
  },
  {
    id: "five-stars",
    icon: "star",
    label: "Star Collector",
    desc: "Earn 5 stars",
    check: (_, stars) => stars >= 5,
  },
  {
    id: "ten-clears",
    icon: "military_tech",
    label: "Puzzle Pro",
    desc: "Clear 10 puzzles",
    check: (cleared) => cleared >= 10,
  },
  {
    id: "speed-demon",
    icon: "bolt",
    label: "Speed Demon",
    desc: "Clear under 30 seconds",
    check: (_c, _s, _st, records) => records.some((r) => r.time < 30),
  },
  {
    id: "streak-3",
    icon: "local_fire_department",
    label: "On Fire",
    desc: "3 day streak",
    check: (_c, _s, streak) => streak >= 3,
  },
  {
    id: "all-easy",
    icon: "cake",
    label: "Easy Peasy",
    desc: "Clear all easy puzzles",
    check: (_c, _s, _st, records) => {
      const clearedIds = new Set(records.map((r) => r.puzzleId));
      return [...easyPuzzleIds].every((id) => clearedIds.has(id));
    },
  },
];

export default function ProfilePage() {
  const { getTotalCleared, getTotalStars, streak, records } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
        {/* Header skeleton */}
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-24 h-6 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Profile hero skeleton */}
          <section className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-surface-container animate-shimmer" />
            <div className="space-y-2">
              <div className="w-36 h-7 rounded-full bg-surface-container animate-shimmer mx-auto" />
              <div className="w-48 h-4 rounded-full bg-surface-container animate-shimmer mx-auto" />
            </div>
          </section>
          {/* Stats skeleton */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-xl shadow-pudding p-4 flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
                <div className="w-12 h-5 rounded bg-surface-container animate-shimmer" />
                <div className="w-16 h-3 rounded bg-surface-container animate-shimmer" />
              </div>
            ))}
          </section>
          {/* Recent activity skeleton */}
          <section className="space-y-3">
            <div className="w-28 h-4 rounded bg-surface-container animate-shimmer" />
            <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container animate-shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-32 h-4 rounded bg-surface-container animate-shimmer" />
                    <div className="w-24 h-3 rounded bg-surface-container animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Achievements skeleton */}
          <section className="space-y-3">
            <div className="w-24 h-4 rounded bg-surface-container animate-shimmer" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-surface-container animate-shimmer" />
                  <div className="w-14 h-3 rounded bg-surface-container animate-shimmer" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );

  const totalCleared = getTotalCleared();
  const totalStars = getTotalStars();

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
          <h1 className="text-xl font-headline font-bold">My Profile</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Profile Hero */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-pudding-lg">
              <span
                className="material-symbols-outlined text-on-primary-container text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person
              </span>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-headline font-bold shadow-sm">
              {Math.floor(totalCleared / 3) + 1}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-headline font-extrabold">Puzzle Lover</h2>
            <p className="text-on-surface-variant text-sm">
              Level {Math.floor(totalCleared / 3) + 1} • {totalCleared} puzzles cleared
            </p>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="extension"
            label="Cleared"
            value={`${totalCleared}/${puzzles.length}`}
            color="bg-tertiary-container"
            iconColor="text-tertiary"
          />
          <StatCard
            icon="star"
            label="Stars"
            value={String(totalStars)}
            color="bg-secondary-container"
            iconColor="text-secondary"
          />
          <StatCard
            icon="local_fire_department"
            label="Streak"
            value={`${streak}d`}
            color="bg-primary-container"
            iconColor="text-primary"
          />
          <StatCard
            icon="leaderboard"
            label="Rank"
            value="—"
            color="bg-surface-container"
            iconColor="text-on-surface-variant"
          />
        </section>

        {/* Recent Activity */}
        <section className="space-y-3">
          <h3 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest px-1">
            Recent Activity
          </h3>
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
            {records.length === 0 ? (
              <div className="px-5 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl text-outline-variant block mb-2">history</span>
                No puzzles cleared yet. Start playing!
              </div>
            ) : (
              [...records]
                .sort((a, b) => new Date(b.clearedAt).getTime() - new Date(a.clearedAt).getTime())
                .slice(0, 5)
                .map((record) => {
                  const puzzle = puzzles.find((p) => p.id === record.puzzleId);
                  return (
                    <div key={record.puzzleId} className="flex items-center gap-4 px-5 py-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-container/40 flex items-center justify-center shrink-0">
                        <span
                          className="material-symbols-outlined text-primary text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{puzzle?.name ?? `Puzzle #${record.puzzleId}`}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatTime(record.time)} • {"★".repeat(record.stars)}
                          {"☆".repeat(3 - record.stars)}
                        </p>
                      </div>
                      <span className="text-xs text-on-surface-variant/60">{timeAgo(record.clearedAt)}</span>
                    </div>
                  );
                })
            )}
          </div>
        </section>

        {/* Achievements */}
        <section className="space-y-3">
          <h3 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest px-1">
            Achievements
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {achievements.map((a) => {
              const unlocked = a.check(totalCleared, totalStars, streak, records);
              return (
                <div
                  key={a.id}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all ${
                    unlocked ? "bg-surface-container-lowest shadow-pudding" : "bg-surface-container/50 opacity-40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      unlocked ? "bg-primary-container" : "bg-outline-variant/20"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${unlocked ? "text-primary" : "text-outline-variant"}`}
                      style={{ fontVariationSettings: unlocked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {unlocked ? a.icon : "lock"}
                    </span>
                  </div>
                  <p className="text-[10px] font-headline font-bold leading-tight">{a.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-pudding p-4 flex flex-col items-center gap-2 text-center">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <p className="text-xl font-headline font-extrabold">{value}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}

function formatTime(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
