"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { fetchPuzzleById } from "@/data/puzzles";
import PuzzleGrid from "@/components/PuzzleGrid";
import GameSidebar from "@/components/GameSidebar";
import GameOverModal from "@/components/GameOverModal";
import ClearedModal from "@/components/ClearedModal";
import Link from "next/link";

export default function PuzzlePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { currentPuzzle, initPuzzle, status, timer, lives, tickTimer } = usePuzzleStore();
  const [loading, setLoading] = useState(true);
  const [touchMode, setTouchMode] = useState<"fill" | "mark">("fill");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchPuzzleById(id).then((puzzle) => {
      if (puzzle) {
        initPuzzle(puzzle);
      }
      setLoading(false);
    });
  }, [id, initPuzzle]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "playing") {
      interval = setInterval(tickTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = usePuzzleStore.getState();
      if (store.status !== "playing") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        store.redo();
      } else if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
        store.reset();
      } else if (e.key === " ") {
        e.preventDefault();
        setTouchMode((m) => (m === "fill" ? "mark" : "fill"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body overflow-hidden">
        {/* Desktop Nav Skeleton */}
        <header className="w-full px-8 py-4 bg-surface hidden md:block">
          <nav className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
            <div className="w-48 h-8 rounded-full bg-surface-container animate-shimmer" />
            <div className="flex items-center gap-8">
              <div className="w-16 h-5 rounded-full bg-surface-container animate-shimmer" />
              <div className="w-28 h-5 rounded-full bg-surface-container animate-shimmer" />
              <div className="w-24 h-5 rounded-full bg-surface-container animate-shimmer" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-surface-container animate-shimmer" />
              <div className="w-8 h-8 rounded-full bg-surface-container animate-shimmer" />
            </div>
          </nav>
        </header>

        {/* Mobile Header Skeleton */}
        <header className="md:hidden w-full px-4 py-3 bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-20 h-7 rounded-full bg-surface-container animate-shimmer" />
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-surface-container animate-shimmer" />
              ))}
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)] w-full max-w-[1440px] mx-auto px-4 gap-6">
          {/* Desktop Sidebar Skeleton */}
          <div className="hidden md:flex flex-col gap-3 mt-2 ml-4 w-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-xl bg-surface-container animate-shimmer" />
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-grow flex flex-col items-center justify-center py-4">
            {/* Game Info Bar (desktop) */}
            <div className="hidden md:flex w-full max-w-4xl justify-between items-center mb-8 px-4">
              <div className="w-56 h-12 rounded-xl bg-surface-container animate-shimmer" />
              <div className="flex items-center gap-4">
                <div className="w-28 h-10 rounded-full bg-surface-container animate-shimmer" />
                <div className="w-20 h-10 rounded-full bg-surface-container animate-shimmer" />
              </div>
            </div>

            {/* Puzzle Grid Skeleton */}
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-md bg-surface-container animate-shimmer"
                  style={{ animationDelay: `${(i % 5) * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar Skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest/70 backdrop-blur-xl px-4 pb-8 pt-3 rounded-t-[2rem]">
          <div className="flex justify-around items-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-surface-container animate-shimmer" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body overflow-hidden">
      {/* Desktop: Global Nav */}
      <header className="w-full px-8 py-4 bg-surface hidden md:block">
        <nav className="flex justify-between items-center w-full max-w-[1440px] mx-auto">
          <Link href="/" className="text-3xl font-headline font-black text-primary tracking-tighter italic">
            Pudding Puzzles
          </Link>
          <div className="flex items-center gap-8 font-headline text-lg font-bold tracking-tight">
            <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors duration-300">
              Gallery
            </Link>
            <Link
              href="/calendar"
              className="text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              Daily Challenge
            </Link>
            <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors duration-300">
              Achievements
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity">help</button>
            <Link
              href="/settings"
              className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity"
            >
              settings
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile: Compact Header */}
      <header className="md:hidden w-full px-4 py-3 bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          {mounted && (
            <>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-tertiary-container text-on-tertiary-container rounded-full font-mono font-semibold text-sm">
                <span className="material-symbols-outlined text-base">timer</span>
                {formatTimer(timer)}
              </div>
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
            </>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] w-full max-w-[1440px] mx-auto px-4 gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block mt-2 ml-4">
          <GameSidebar touchMode={touchMode} setTouchMode={setTouchMode} />
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center py-4 overflow-auto pb-36 md:pb-4">
          {/* Game Info Bar (desktop) */}
          {mounted && (
            <div className="hidden md:flex w-full max-w-4xl justify-between items-center mb-8 px-4">
              <div className="bg-surface-container-high px-8 py-3 rounded-xl border-4 border-primary-container/30">
                <h1 className="font-headline text-2xl font-black text-primary tracking-tight">
                  Level {currentPuzzle?.id}: {currentPuzzle?.name}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-tertiary-container px-6 py-3 rounded-full text-on-tertiary-container font-black">
                  <span className="material-symbols-outlined">timer</span>
                  <span className="text-xl">{formatTimer(timer)}</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest px-4 py-3 rounded-full">
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
              </div>
            </div>
          )}

          {/* Puzzle Grid */}
          <PuzzleGrid touchMode={touchMode} />

          {/* Interaction Tips (desktop) */}
          <div className="hidden md:flex mt-10 gap-10">
            <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm">
              <kbd className="bg-surface-container-highest px-3 py-1 rounded-md border-b-4 border-outline-variant font-mono text-xs">
                Left Click
              </kbd>
              <span>Fill Cell</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm">
              <kbd className="bg-surface-container-highest px-3 py-1 rounded-md border-b-4 border-outline-variant font-mono text-xs">
                Right Click
              </kbd>
              <span>Mark with X</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm">
              <kbd className="bg-surface-container-highest px-3 py-1 rounded-md border-b-4 border-outline-variant font-mono text-xs">
                Space
              </kbd>
              <span>Toggle Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <GameSidebar mobile touchMode={touchMode} setTouchMode={setTouchMode} />
      </div>

      {/* Modals */}
      {status === "gameover" && <GameOverModal />}
      {status === "cleared" && <ClearedModal />}

      {/* Decorative Background Shapes */}
      <div className="fixed -bottom-20 -left-20 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] -z-10" />
      <div className="fixed top-40 -right-20 w-80 h-80 bg-secondary-container/20 rounded-full blur-[80px] -z-10" />
    </main>
  );
}
