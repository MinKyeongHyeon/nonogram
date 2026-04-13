"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
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

export default function LeaderboardPage() {
  const session = useAuthStore((s) => s.session);
  const [tab, setTab] = useState<"all" | "daily">("all");
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (currentTab: "all" | "daily") => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leaderboard?tab=${currentTab}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        const json = await res.json();
        if (!json.ok) throw new Error(json.message ?? "알 수 없는 오류");

        // API 데이터 → LeaderEntry 변환
        const raw = json.data as Array<{
          user_id: string;
          time_sec?: number;
          stars: number;
          profiles: { nickname: string | null; avatar_url: string | null } | null;
        }>;

        // all-time: user_id별 stars 합산
        if (currentTab === "all") {
          const map = new Map<string, { stars: number; name: string; avatar: string }>();
          for (const row of raw) {
            const existing = map.get(row.user_id);
            const name = row.profiles?.nickname ?? "익명";
            const avatar = row.profiles?.avatar_url ?? "🧩";
            if (existing) {
              existing.stars += row.stars;
            } else {
              map.set(row.user_id, { stars: row.stars, name, avatar });
            }
          }
          const sorted = [...map.entries()]
            .sort((a, b) => b[1].stars - a[1].stars)
            .map(([uid, v], i) => ({
              rank: i + 1,
              name: v.name,
              avatar: v.avatar,
              cleared: 0,
              stars: v.stars,
              bestTime: 999,
              isMe: uid === session?.user?.id,
            }));
          setEntries(sorted);
        } else {
          // daily: time_sec 오름차순
          const sorted = raw.map((row, i) => ({
            rank: i + 1,
            name: row.profiles?.nickname ?? "익명",
            avatar: row.profiles?.avatar_url ?? "🧩",
            cleared: 1,
            stars: row.stars,
            bestTime: row.time_sec ?? 999,
            isMe: row.user_id === session?.user?.id,
          }));
          setEntries(sorted);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "알 수 없는 오류";
        setError(msg);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id],
  );

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab, fetchLeaderboard]);

  if (isLoading)
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

        {/* 비로그인 안내 배너 */}
        {!session && (
          <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm">
            <span className="material-symbols-outlined text-primary text-xl">emoji_events</span>
            <p className="flex-1 text-on-surface-variant">
              랭킹에 등재되려면{" "}
              <Link href="/login" className="text-primary font-semibold underline underline-offset-2">
                로그인
              </Link>
              하세요.
            </p>
          </div>
        )}

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
            <p className="text-sm">불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-error">wifi_off</span>
            <p className="text-sm text-on-surface-variant">{error}</p>
            <button
              onClick={() => fetchLeaderboard(tab)}
              className="mt-1 px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">leaderboard</span>
            <p className="text-sm">아직 랭킹 데이터가 없어요.</p>
          </div>
        )}

        {/* Podium + Rank (로그인 데이터 있을 때) */}
        {!isLoading && !error && entries.length > 0 && (
          <>
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
                  <p
                    className={`text-xs font-headline font-bold truncate max-w-full ${entry.isMe ? "text-primary" : ""}`}
                  >
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
          </>
        )}
      </div>
    </main>
  );
}

function formatTime(s: number) {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
