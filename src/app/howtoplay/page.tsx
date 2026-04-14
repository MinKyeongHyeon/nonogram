"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

// 5×5 예시 퍼즐 (숫자 7 모양)
const EXAMPLE_SOLUTION = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
];
const EXAMPLE_ROW_CLUES = [[5], [1], [1], [1], [1]];
const EXAMPLE_COL_CLUES = [[1], [2], [1], [2], [3]];

function ExampleGrid() {
  return (
    <div className="flex gap-3 items-start justify-center">
      {/* Row clues + Grid */}
      <div>
        <div className="flex">
          {/* corner gap */}
          <div className="w-8" />
          {/* col clues */}
          {EXAMPLE_COL_CLUES.map((clue, c) => (
            <div key={c} className="w-8 flex flex-col items-center justify-end pb-1">
              {clue.map((n, i) => (
                <span key={i} className="text-[11px] font-headline font-bold text-primary">
                  {n}
                </span>
              ))}
            </div>
          ))}
        </div>
        {EXAMPLE_SOLUTION.map((row, r) => (
          <div key={r} className="flex items-center">
            {/* row clue */}
            <div className="w-8 flex items-center justify-end pr-1">
              {EXAMPLE_ROW_CLUES[r].map((n, i) => (
                <span key={i} className="text-[11px] font-headline font-bold text-primary">
                  {n}
                </span>
              ))}
            </div>
            {/* cells */}
            {row.map((cell, c) => (
              <div
                key={c}
                className={`w-8 h-8 m-0.5 rounded-md transition-all ${
                  cell ? "bg-primary shadow-sm" : "bg-surface-container border border-outline-variant/30"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({
  stepNumber,
  icon,
  title,
  children,
}: {
  stepNumber: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-pudding border border-outline-variant/10 overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 bg-primary-container/30">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-on-primary text-sm font-headline font-extrabold">{stepNumber}</span>
        </div>
        <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <h2 className="text-lg font-headline font-bold text-on-surface">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function HowToPlayPage() {
  const { t } = useTranslation();
  const h = t.howToPlay;

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body pb-32 md:pb-16">
      {/* Header */}
      <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-3xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-headline font-bold leading-tight">{h.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Hero */}
        <section className="text-center py-6 space-y-3">
          <div className="w-20 h-20 mx-auto bg-primary-container rounded-[2rem] flex items-center justify-center shadow-pudding">
            <span className="text-4xl">🧩</span>
          </div>
          <h2 className="text-3xl font-headline font-extrabold tracking-tight">{h.title}</h2>
          <p className="text-on-surface-variant">{h.subtitle}</p>
        </section>

        {/* Step 1: What is Nonogram */}
        <StepCard stepNumber={1} icon="help_outline" title={h.whatIsTitle}>
          <p className="text-sm text-on-surface-variant leading-relaxed">{h.whatIsDesc}</p>
          <div className="mt-5 flex justify-center">
            <ExampleGrid />
          </div>
          <p className="text-xs text-center text-on-surface-variant/60 mt-3">
            ↑ 숫자 단서를 보고 셀을 채워 그림을 완성하세요
          </p>
        </StepCard>

        {/* Step 2: Reading Clues */}
        <StepCard stepNumber={2} icon="format_list_numbered" title={h.cluesTitle}>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{h.cluesDesc}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="flex flex-col gap-1">
                {[[3], [1, 1], [2]].map((clue, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {clue.map((n, j) => (
                        <span
                          key={j}
                          className="w-6 h-6 bg-primary text-on-primary rounded text-xs font-bold flex items-center justify-center"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, c) => (
                        <div
                          key={c}
                          className="w-5 h-5 rounded-sm bg-surface-container-high border border-outline-variant/20"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-primary mt-1">{h.cluesRowLabel}</span>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="flex gap-1 items-end">
                {[[3], [1], [2, 1]].map((clue, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    {clue.map((n, j) => (
                      <span
                        key={j}
                        className="w-6 h-6 bg-secondary text-on-secondary rounded text-xs font-bold flex items-center justify-center"
                      >
                        {n}
                      </span>
                    ))}
                    <div className="flex flex-col gap-0.5 mt-1">
                      {Array.from({ length: 4 }).map((_, r) => (
                        <div
                          key={r}
                          className="w-5 h-5 rounded-sm bg-surface-container-high border border-outline-variant/20"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-secondary mt-1">{h.cluesColLabel}</span>
            </div>
          </div>
        </StepCard>

        {/* Step 3: Fill vs Mark */}
        <StepCard stepNumber={3} icon="edit_square" title={h.cellsTitle}>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-container/30 rounded-xl p-4 space-y-2">
              <div className="w-10 h-10 bg-primary rounded-lg shadow-sm mx-auto" />
              <p className="text-sm font-headline font-bold text-center text-primary">{h.cellsFillLabel}</p>
              <p className="text-xs text-on-surface-variant text-center leading-relaxed">{h.cellsFillDesc}</p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="w-10 h-10 bg-surface-container-high border-2 border-outline-variant/40 rounded-lg flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-error text-xl font-bold">close</span>
              </div>
              <p className="text-sm font-headline font-bold text-center text-on-surface">{h.cellsMarkLabel}</p>
              <p className="text-xs text-on-surface-variant text-center leading-relaxed">{h.cellsMarkDesc}</p>
            </div>
          </div>
        </StepCard>

        {/* Step 4: Lives */}
        <StepCard stepNumber={4} icon="favorite" title={h.livesTitle}>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{h.livesDesc}</p>
          <div className="flex justify-center gap-3">
            {[true, true, true].map((filled, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{
                    fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
                    color: filled ? "#b41340" : "#d09ec1",
                  }}
                >
                  favorite
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold">Life {i + 1}</span>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Step 5: Stars */}
        <StepCard stepNumber={5} icon="star" title={h.starsTitle}>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{h.starsDesc}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
              <span className="text-lg">★★★</span>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-sm font-headline font-semibold text-on-surface">{h.star3}</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
              <span className="text-lg">★★</span>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-sm font-headline font-semibold text-on-surface">{h.star2}</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
              <span className="text-lg">★</span>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="text-sm font-headline font-semibold text-on-surface">{h.star1}</span>
            </div>
          </div>
        </StepCard>

        {/* Step 6: Hints */}
        <StepCard stepNumber={6} icon="lightbulb" title={h.hintsTitle}>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{h.hintsDesc}</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center shadow-sm"
              >
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
              </div>
            ))}
          </div>
        </StepCard>

        {/* CTA */}
        <div className="pt-4 flex justify-center">
          <Link
            href="/pack/easy"
            className="bg-primary text-on-primary px-12 py-5 rounded-full text-lg font-headline font-extrabold shadow-pudding-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            {h.startPlaying}
            <span className="material-symbols-outlined">play_circle</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
