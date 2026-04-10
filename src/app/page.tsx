import Link from "next/link";
import { puzzles } from "@/data/puzzles";
import { StarsWon, PackProgress } from "@/components/HomeStats";

export default function Home() {
  // 난이도별 그룹
  const easyPuzzles = puzzles.filter((p) => p.difficulty === "easy");
  const mediumPuzzles = puzzles.filter((p) => p.difficulty === "medium");
  const hardPuzzles = puzzles.filter((p) => p.difficulty === "hard");

  const packs = [
    {
      title: "Starter 5×5",
      difficulty: "Easy",
      color: "bg-tertiary-container",
      textColor: "text-tertiary",
      count: easyPuzzles.length,
      puzzles: easyPuzzles,
    },
    {
      title: "Sweet 5×5",
      difficulty: "Medium",
      color: "bg-secondary-container",
      textColor: "text-secondary",
      count: mediumPuzzles.length,
      puzzles: mediumPuzzles,
    },
    {
      title: "Challenge Mix",
      difficulty: "Hard",
      color: "bg-primary-container",
      textColor: "text-primary",
      count: hardPuzzles.length,
      puzzles: hardPuzzles,
    },
  ];

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      {/* Top Nav */}
      <nav className="w-full sticky top-0 z-50 bg-surface/70 backdrop-blur-xl shadow-pudding">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1440px] mx-auto">
          <span className="text-2xl font-headline font-black italic text-primary">Pudding Puzzles</span>
          <div className="hidden md:flex gap-10">
            <Link
              href="/"
              className="text-primary font-headline font-bold border-b-4 border-primary-container pb-1 text-base tracking-tight"
            >
              Games
            </Link>
            <Link
              href="/calendar"
              className="text-on-surface-variant font-headline font-medium text-base tracking-tight hover:text-primary transition-colors"
            >
              Daily Challenge
            </Link>
            <Link
              href="/leaderboard"
              className="text-on-surface-variant font-headline font-medium text-base tracking-tight hover:text-primary transition-colors"
            >
              Leaderboard
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-primary hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">settings</span>
            </Link>
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-primary-container">person</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-dim text-primary rounded-full -rotate-2 font-bold text-sm shadow-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              Hot!
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold leading-tight tracking-tighter">
              Ready to solve <br /> something <span className="text-primary italic">sweet?</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Dive into our collection of candy-coated logic puzzles. Sharp brain, soft aesthetic.
            </p>
            <div className="flex gap-4">
              <Link
                href={`/puzzle/${puzzles[0]?.id ?? 1}`}
                className="bg-primary text-on-primary px-10 py-5 rounded-full text-lg font-bold shadow-pudding-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                Play Now
                <span className="material-symbols-outlined">play_circle</span>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-tr from-primary-container/30 to-tertiary-container/30 rounded-full blur-3xl absolute" />
            <div className="relative bg-surface-container-low rounded-xl p-8 shadow-pudding">
              <div className="grid grid-cols-5 gap-1">
                {/* 미니 퍼즐 미리보기 (하트 모양) */}
                {[
                  [0, 1, 0, 1, 0],
                  [1, 1, 1, 1, 1],
                  [1, 1, 1, 1, 1],
                  [0, 1, 1, 1, 0],
                  [0, 0, 1, 0, 0],
                ].map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-10 h-10 rounded-md ${
                        cell ? "bg-primary-container shadow-sm" : "bg-surface-container-lowest"
                      }`}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats + Daily Challenge Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats cards */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-pudding border border-outline-variant/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                extension
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-on-surface">{puzzles.length}</p>
              <p className="text-sm text-on-surface-variant">Total Puzzles</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-pudding border border-outline-variant/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-on-surface">
                <StarsWon />
              </p>
              <p className="text-sm text-on-surface-variant">Stars Won</p>
            </div>
          </div>
          {/* Daily Challenge Card */}
          <Link
            href="/calendar"
            className="bg-gradient-to-br from-primary-container/60 to-secondary-container/60 p-5 rounded-xl shadow-pudding border border-outline-variant/10 flex items-center gap-4 hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                today
              </span>
            </div>
            <div>
              <p className="text-lg font-headline font-bold text-on-surface">Daily Challenge</p>
              <p className="text-sm text-on-surface-variant">Today&apos;s puzzle awaits!</p>
            </div>
            <span className="material-symbols-outlined text-primary ml-auto">arrow_forward</span>
          </Link>
        </section>

        {/* Level Packs */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-headline font-extrabold tracking-tight">Level Packs</h2>
              <p className="text-on-surface-variant mt-1">Choose your flavor and difficulty</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packs.map((pack) => (
              <div
                key={pack.title}
                className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-pudding border border-outline-variant/10 hover:-translate-y-2 transition-all"
              >
                <div className={`aspect-video ${pack.color} rounded-lg flex items-center justify-center relative`}>
                  <span
                    className={`material-symbols-outlined ${pack.textColor} text-5xl`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    extension
                  </span>
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                    {pack.difficulty}
                  </div>
                </div>
                <h4 className="text-xl font-headline font-bold">{pack.title}</h4>
                <p className="text-on-surface-variant">{pack.count} Puzzles</p>
                {/* Progress Bar */}
                <div className="space-y-1">
                  <PackProgress difficulty={pack.difficulty} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {pack.puzzles.slice(0, 6).map((p) => (
                    <Link
                      key={p.id}
                      href={`/puzzle/${p.id}`}
                      className="px-3 py-1.5 bg-surface-container-low rounded-full text-sm font-medium hover:bg-surface-container transition-colors"
                    >
                      {p.name.replace(/^(Easy|Medium|Hard)\s*-\s*/, "")}
                    </Link>
                  ))}
                  {pack.puzzles.length > 6 && (
                    <span className="px-3 py-1.5 text-on-surface-variant text-sm">+{pack.puzzles.length - 6} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-surface-container-lowest/70 backdrop-blur-xl rounded-t-[3rem] shadow-pudding md:hidden">
        <Link
          href="/"
          className="flex flex-col items-center bg-surface-container-high text-primary rounded-full px-5 py-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Home</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center text-on-surface-variant px-5 py-2">
          <span className="material-symbols-outlined">emoji_events</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Rank</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-on-surface-variant px-5 py-2">
          <span className="material-symbols-outlined">person</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Me</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-on-surface-variant px-5 py-2">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-headline text-[10px] font-bold uppercase tracking-widest">Sets</span>
        </Link>
      </nav>
    </main>
  );
}
