"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { puzzles } from "@/data/puzzles";
import Link from "next/link";

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  cleared: number;
  stars: number;
  bestTime: number;
  isMe: boolean;
}

// Generate mock leaderboard data + inject the real user
function generateLeaderboard(
  userCleared: number,
  userStars: number,
  userBestTime: number,
  mode: "all" | "daily",
): LeaderEntry[] {
  const names = [
    "PuzzleMaster",
    "StarGazer",
    "NonogramNinja",
    "PixelPro",
    "GridWizard",
    "BrainStorm",
    "LogicLion",
    "PuddingFan",
    "MintChoco",
    "CosmicCat",
    "NeonByte",
    "SilkThread",
    "CrystalEye",
    "DawnBreak",
    "FrostPetal",
  ];
  const avatars = ["🧩", "⭐", "🥷", "🎨", "🧙", "⚡", "🦁", "🍮", "🍫", "🐱", "💜", "🧵", "🔮", "🌅", "❄️"];

  // For daily mode, use fewer participants with tighter time ranges
  const count = mode === "daily" ? 8 : names.length;
  const entries: LeaderEntry[] = names.slice(0, count).map((name, i) => ({
    rank: 0,
    name,
    avatar: avatars[i],
    cleared: mode === "daily" ? 1 : Math.max(1, Math.floor(Math.random() * puzzles.length)),
    stars: mode === "daily" ? 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * puzzles.length * 3),
    bestTime: mode === "daily" ? 15 + Math.floor(Math.random() * 120) : 20 + Math.floor(Math.random() * 300),
    isMe: false,
  }));

  // Only add user if they have data (for daily, need today's record)
  if (mode === "daily") {
    if (userBestTime > 0 && userBestTime < 999) {
      entries.push({
        rank: 0,
        name: "You",
        avatar: "🧑",
        cleared: 1,
        stars: userStars,
        bestTime: userBestTime,
        isMe: true,
      });
    }
  } else {
    entries.push({
      rank: 0,
      name: "You",
      avatar: "🧑",
      cleared: userCleared,
      stars: userStars,
      bestTime: userBestTime || 999,
      isMe: true,
    });
  }

  // Sort: daily by bestTime, all-time by stars then bestTime
  if (mode === "daily") {
    entries.sort((a, b) => a.bestTime - b.bestTime);
  } else {
    entries.sort((a, b) => b.stars - a.stars || a.bestTime - b.bestTime);
  }
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries;
}

export default function LeaderboardPage() {
  const { getTotalCleared, getTotalStars, records } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"all" | "daily">("all");
  useEffect(() => setMounted(true), []);

  const bestTime = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.min(...records.map((r) => r.time));
  }, [records]);

  // For daily tab, find today's record specifically
  const todayRecord = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const hash = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const dailyPuzzleId = puzzles[hash % puzzles.length].id;
    return records.find((r) => r.puzzleId === dailyPuzzleId);
  }, [records]);

  const entries = useMemo(() => {
    if (!mounted) return [];
    if (tab === "daily") {
      return generateLeaderboard(todayRecord ? 1 : 0, todayRecord?.stars ?? 0, todayRecord?.time ?? 999, "daily");
    }
    return generateLeaderboard(getTotalCleared(), getTotalStars(), bestTime, "all");
  }, [mounted, tab, getTotalCleared, getTotalStars, bestTime, todayRecord]);

  if (!mounted)
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
        {/* Header skeleton */}
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-28 h-6 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Tabs skeleton */}
          <div className="flex bg-surface-container-lowest rounded-full p-1 shadow-pudding">
            <div className="flex-1 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="flex-1 h-10 rounded-full bg-surface-container animate-shimmer ml-1" />
          </div>
          {/* Podium skeleton */}
          <section className="flex items-end justify-center gap-3 pt-8">
            {["h-24", "h-32", "h-20"].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
                <div className="w-14 h-14 rounded-full bg-surface-container animate-shimmer" />
                <div className="w-16 h-3 rounded-full bg-surface-container animate-shimmer" />
                <div className={`w-full ${h} rounded-t-xl bg-surface-container animate-shimmer`} />
              </div>
            ))}
          </section>
          {/* Rank list skeleton */}
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-4 rounded bg-surface-container animate-shimmer" />
                <div className="w-9 h-9 rounded-full bg-surface-container animate-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-4 rounded bg-surface-container animate-shimmer" />
                  <div className="w-32 h-3 rounded bg-surface-container animate-shimmer" />
                </div>
                <div className="w-12 h-4 rounded bg-surface-container animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myEntry = entries.find((e) => e.isMe);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumColors = ["bg-secondary-container", "bg-primary-container", "bg-tertiary-container"];
  const podiumTextColors = ["text-secondary", "text-primary", "text-tertiary"];

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
          <h1 className="text-xl font-headline font-bold">Leaderboard</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex bg-surface-container-lowest rounded-full p-1 shadow-pudding">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
              tab === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTab("daily")}
            className={`flex-1 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
              tab === "daily" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant"
            }`}
          >
            Daily
          </button>
        </div>

        {/* Podium */}
        <section className="flex items-end justify-center gap-3 pt-8">
          {podiumOrder.map((entry, i) => (
            <div key={entry.rank} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
              <div className="relative">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${podiumColors[i]} flex items-center justify-center text-2xl md:text-3xl shadow-pudding ${
                    entry.isMe ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {entry.avatar}
                </div>
                {i === 1 && (
                  <span
                    className="material-symbols-outlined absolute -top-3 left-1/2 -translate-x-1/2 text-primary text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    emoji_events
                  </span>
                )}
              </div>
              <p className={`text-xs font-headline font-bold truncate max-w-full ${entry.isMe ? "text-primary" : ""}`}>
                {entry.name}
              </p>
              <p className="text-[10px] text-on-surface-variant">{entry.stars}★</p>
              <div
                className={`w-full ${podiumHeights[i]} ${podiumColors[i]} rounded-t-xl flex items-start justify-center pt-2`}
              >
                <span className={`text-lg font-headline font-extrabold ${podiumTextColors[i]}`}>{entry.rank}</span>
              </div>
            </div>
          ))}
        </section>

        {/* My Rank Card (sticky) */}
        {myEntry && (
          <div className="sticky top-20 z-40 bg-primary-container/20 backdrop-blur-xl border border-primary-container/40 rounded-xl px-5 py-3 flex items-center gap-4 shadow-pudding">
            <span className="text-lg font-headline font-extrabold text-primary w-8">#{myEntry.rank}</span>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-xl">
              {myEntry.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-primary">You</p>
              <p className="text-xs text-on-surface-variant">
                {myEntry.cleared} cleared • {myEntry.stars}★
              </p>
            </div>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
        )}

        {/* Ranking List */}
        <div className="bg-surface-container-lowest rounded-xl shadow-pudding divide-y divide-outline-variant/20">
          {rest.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 px-5 py-3 ${entry.isMe ? "bg-primary-container/10" : ""}`}
            >
              <span className="text-sm font-headline font-bold text-on-surface-variant w-8">{entry.rank}</span>
              <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-lg">
                {entry.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${entry.isMe ? "text-primary font-bold" : ""}`}>
                  {entry.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {entry.cleared} cleared • {entry.stars}★
                </p>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">{formatTime(entry.bestTime)}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function formatTime(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
