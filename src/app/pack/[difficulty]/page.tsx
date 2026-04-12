"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

// difficulty → slug 매핑 (현재 무료 기본 팩 기준)
const DIFFICULTY_TO_SLUG: Record<string, string> = {
  easy: "free-easy",
  medium: "free-medium",
  hard: "free-hard",
};

interface SupabasePuzzle {
  id: number;
  title: string;
  difficulty: string;
  sort_order: number;
  is_published: boolean;
}

interface PackData {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  price: number;
  difficulty: string | null;
  is_published: boolean;
  puzzle_count: number;
  puzzles: SupabasePuzzle[];
}

const DIFFICULTY_META: Record<string, { label: string; color: string; textColor: string; icon: string }> = {
  easy: { label: "Easy", color: "bg-tertiary-container", textColor: "text-tertiary", icon: "sunny" },
  medium: { label: "Medium", color: "bg-secondary-container", textColor: "text-secondary", icon: "local_cafe" },
  hard: { label: "Hard", color: "bg-primary-container", textColor: "text-primary", icon: "bolt" },
};

export default function PackPage({ params }: { params: Promise<{ difficulty: string }> }) {
  const { difficulty } = use(params);
  const { records, getBestRecord } = useProgressStore();
  const session = useAuthStore((s) => s.session);
  const [mounted, setMounted] = useState(false);
  const [pack, setPack] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const slug = DIFFICULTY_TO_SLUG[difficulty] ?? null;
  const meta = DIFFICULTY_META[difficulty];

  const fetchPack = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    try {
      // 1) packages 목록 API에서 slug로 단일 패키지 조회
      const r = await fetch(`/api/packages?slug=${slug}`);
      const json = await r.json();
      if (!json.ok) {
        setLoading(false);
        return;
      }
      const pkgBase = json.data as Omit<PackData, "puzzles">;

      // 2) 해당 패키지 ID로 퍼즐 목록 조회
      const pr = await fetch(`/api/packages/${pkgBase.id}`);
      const pj = await pr.json();
      setPack(pj.ok ? { ...pkgBase, puzzles: pj.data.puzzles ?? [] } : { ...pkgBase, puzzles: [] });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPack();
  }, [fetchPack]);

  // 유료 패키지인 경우 구매 여부 확인
  useEffect(() => {
    if (!pack || pack.price === 0) {
      setPurchased(true);
      return;
    }
    if (!session) {
      setPurchased(false);
      return;
    }

    setPurchaseLoading(true);
    fetch(`/api/purchases?packageId=${pack.id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((j) => setPurchased(j.purchased ?? false))
      .finally(() => setPurchaseLoading(false));
  }, [pack, session]);

  // 스켈레톤
  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-12">
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-28 h-6 rounded-full bg-surface-container animate-shimmer" />
            <div className="ml-auto w-14 h-6 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
          <section className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-surface-container-lowest rounded-xl shadow-pudding px-5 py-4 flex-1 w-full sm:w-auto"
              >
                <div className="w-12 h-12 rounded-full bg-surface-container animate-shimmer" />
                <div className="space-y-2">
                  <div className="w-20 h-6 rounded bg-surface-container animate-shimmer" />
                  <div className="w-24 h-3 rounded bg-surface-container animate-shimmer" />
                </div>
              </div>
            ))}
          </section>
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-2">
            <div className="w-24 h-4 rounded bg-surface-container animate-shimmer" />
            <div className="w-full h-3 rounded-full bg-surface-container animate-shimmer" />
          </section>
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
            <div className="w-16 h-6 rounded bg-surface-container animate-shimmer mb-4" />
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-surface-container animate-shimmer"
                  style={{ animationDelay: `${(i % 7) * 0.05}s` }}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!pack || !meta) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Pack not found.</p>
      </main>
    );
  }

  const packPuzzles = pack.puzzles;
  const clearedCount = packPuzzles.filter((p) => records.some((r) => r.puzzleId === p.id)).length;
  const totalStars = packPuzzles.reduce((sum, p) => {
    const rec = getBestRecord(p.id);
    return sum + (rec?.stars ?? 0);
  }, 0);
  const maxStars = packPuzzles.length * 3;
  const pct = packPuzzles.length > 0 ? Math.round((clearedCount / packPuzzles.length) * 100) : 0;

  const barColor: Record<string, string> = {
    easy: "bg-tertiary-container",
    medium: "bg-secondary-container",
    hard: "bg-primary-container",
  };

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
          <span className="text-2xl">{pack.cover_emoji}</span>
          <h1 className="text-xl font-headline font-bold">{pack.title}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${meta.color} ${meta.textColor}`}>
            {meta.label}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* 유료 패키지 잠금 게이트 */}
        {pack.price > 0 && !purchaseLoading && !purchased && (
          <section className="bg-surface-container-lowest rounded-xl shadow-pudding overflow-hidden">
            <div className={`${meta.color} px-5 py-4 flex items-center gap-3`}>
              <span
                className={`material-symbols-outlined ${meta.textColor} text-2xl`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
              <div>
                <p className={`font-headline font-bold ${meta.textColor}`}>유료 패키지</p>
                <p className={`text-xs ${meta.textColor} opacity-80`}>이 팩의 퍼즐을 플레이하려면 구매가 필요해요</p>
              </div>
              <span className={`ml-auto font-headline font-extrabold text-xl ${meta.textColor}`}>
                ₩{pack.price.toLocaleString()}
              </span>
            </div>
            <div className="p-5 space-y-3">
              {pack.description && <p className="text-sm text-on-surface-variant">{pack.description}</p>}
              <p className="text-sm text-on-surface-variant">총 {pack.puzzle_count}개 퍼즐 포함</p>
              {!session ? (
                <Link
                  href="/login"
                  className="block w-full text-center bg-primary text-on-primary py-3 rounded-full font-headline font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  로그인 후 구매하기
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-headline font-bold opacity-50 cursor-not-allowed"
                >
                  구매하기 (준비 중)
                </button>
              )}
            </div>
          </section>
        )}

        {/* Stats row */}
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
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Progress</span>
            <span>
              {clearedCount}/{packPuzzles.length}
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor[difficulty] ?? "bg-primary-container"} rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </section>

        {/* Puzzle Grid */}
        <section className="bg-surface-container-lowest rounded-xl shadow-pudding p-5">
          <h3 className="text-lg font-headline font-bold mb-4">Puzzles</h3>
          {pack.price > 0 && !purchased ? (
            /* 유료 미구매 — 블러 처리된 잠금 그리드 */
            <div className="relative">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 blur-sm pointer-events-none select-none">
                {Array.from({ length: Math.min(pack.puzzle_count, 14) }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-surface-container-low" />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span
                  className="material-symbols-outlined text-on-surface-variant text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                <p className="text-sm font-headline font-bold text-on-surface-variant">구매 후 플레이 가능</p>
              </div>
            </div>
          ) : packPuzzles.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">퍼즐이 없어요.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {packPuzzles.map((p) => {
                const rec = getBestRecord(p.id);
                const isCleared = !!rec;
                const stars = rec?.stars ?? 0;
                const displayName = p.title.replace(/^(Easy|Medium|Hard)\s*-\s*/i, "");

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
                            className={`material-symbols-outlined text-[10px] ${s <= stars ? "text-secondary" : "text-outline-variant/30"}`}
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
          )}
        </section>

        {/* Encouragement */}
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
