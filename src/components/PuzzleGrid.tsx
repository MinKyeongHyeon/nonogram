"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";
import { playFill, playWrong, playMark, playLineComplete, haptic } from "@/lib/sound";

/**
 * Per-clue-number matching: returns which clue indices are confirmed/settled.
 * A group of filled cells (state=1) is "closed" if bounded on both sides by
 * edge / X(-1) / penalty(2) — NOT by empty(0) which is ambiguous.
 * Matches from left→right and right→left independently.
 */
function getMatchedClueIndices(cells: number[], clue: number[]): Set<number> {
  const matched = new Set<number>();
  if (clue.length === 0) return matched;

  // Forward matching (left → right)
  let ci = 0;
  let i = 0;
  while (i < cells.length && ci < clue.length) {
    const cell = cells[i];
    if (cell === 1) {
      let len = 0;
      while (i < cells.length && cells[i] === 1) {
        len++;
        i++;
      }
      const closed = i >= cells.length || cells[i] !== 0;
      if (closed && len === clue[ci]) {
        matched.add(ci);
        ci++;
      } else {
        break;
      }
    } else if (cell === 0) {
      break;
    } else {
      i++;
    }
  }

  // Backward matching (right → left)
  ci = clue.length - 1;
  i = cells.length - 1;
  while (i >= 0 && ci >= 0 && !matched.has(ci)) {
    const cell = cells[i];
    if (cell === 1) {
      let len = 0;
      while (i >= 0 && cells[i] === 1) {
        len++;
        i--;
      }
      const closed = i < 0 || cells[i] !== 0;
      if (closed && len === clue[ci]) {
        matched.add(ci);
        ci--;
      } else {
        break;
      }
    } else if (cell === 0) {
      break;
    } else {
      i--;
    }
  }

  return matched;
}

export default function PuzzleGrid({ touchMode }: { touchMode: "fill" | "mark" }) {
  const { currentPuzzle, grid, handleClick } = usePuzzleStore();
  const sound = useSettingsStore((s) => s.sound);
  const hapticsOn = useSettingsStore((s) => s.haptics);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Track line completions for sound/haptic feedback
  const checkLineCompletion = useCallback(
    (rIdx: number, cIdx: number) => {
      if (!currentPuzzle) return;
      const g = usePuzzleStore.getState().grid;

      // Check row: all clues matched?
      const rowMatched = getMatchedClueIndices(g[rIdx], currentPuzzle.clues.rows[rIdx]);
      const rowComplete = rowMatched.size === currentPuzzle.clues.rows[rIdx].length;

      // Check col: all clues matched?
      const colCells: number[] = [];
      for (let r = 0; r < currentPuzzle.rows; r++) colCells.push(g[r][cIdx]);
      const colMatched = getMatchedClueIndices(colCells, currentPuzzle.clues.cols[cIdx]);
      const colComplete = colMatched.size === currentPuzzle.clues.cols[cIdx].length;

      if (rowComplete || colComplete) {
        if (sound) playLineComplete();
        if (hapticsOn) haptic([10, 30, 10]);
      }
    },
    [currentPuzzle, sound, hapticsOn],
  );

  const onCellClick = useCallback(
    (rIdx: number, cIdx: number, isRightClick: boolean, mode?: "fill" | "mark") => {
      const prevCell = grid[rIdx][cIdx];
      handleClick(rIdx, cIdx, isRightClick, mode);
      const newCell = usePuzzleStore.getState().grid[rIdx][cIdx];

      if (prevCell === newCell) return; // no change

      if (newCell === 1) {
        if (sound) playFill();
        if (hapticsOn) haptic(10);
        checkLineCompletion(rIdx, cIdx);
      } else if (newCell === 2) {
        if (sound) playWrong();
        if (hapticsOn) haptic([30, 20, 30]);
      } else if (newCell === -1) {
        if (sound) playMark();
        if (hapticsOn) haptic(5);
      }
    },
    [grid, handleClick, sound, hapticsOn, checkLineCompletion],
  );

  if (!mounted || !currentPuzzle)
    return (
      <div className="text-center p-12 text-on-surface-variant font-body">
        <span className="material-symbols-outlined text-4xl mb-2 block text-outline-variant">grid_on</span>
        No puzzle loaded
      </div>
    );

  // Helper to extract column cells
  const getColCells = (cIdx: number): number[] => {
    const cells: number[] = [];
    for (let r = 0; r < currentPuzzle.rows; r++) cells.push(grid[r][cIdx]);
    return cells;
  };

  // Cell size based on grid dimensions
  const maxDim = Math.max(currentPuzzle.rows, currentPuzzle.cols);
  const cellSize = maxDim >= 10 ? 36 : maxDim >= 8 ? 44 : maxDim >= 6 ? 48 : 56;
  const gapSize = 4; // gap-1, 4px
  const gridPadding = "2rem"; // padding inside cell grid area

  // Clue area sizing: enough room for the longest clue set + extra breathing space
  const maxRowClueLen = Math.max(...currentPuzzle.clues.rows.map((r) => r.length), 1);
  const maxColClueLen = Math.max(...currentPuzzle.clues.cols.map((c) => c.length), 1);
  const rowClueWidth = maxRowClueLen * 24 + 32; // ~24px per number + 32px padding
  const colClueHeight = maxColClueLen * 24 + 48; // ~24px per number + 48px breathing room

  return (
    <div className="select-none touch-none">
      <div className="relative bg-white/40 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-[0px_40px_80px_rgba(70,34,62,0.08)]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: "auto auto",
            gridTemplateRows: "auto auto",
          }}
        >
          {/* Corner */}
          <div style={{ width: rowClueWidth, minHeight: colClueHeight }} />

          {/* Column Clues (Top) */}
          <div
            className="flex items-end pb-3"
            style={{ paddingLeft: gridPadding, gap: gapSize, minHeight: colClueHeight }}
          >
            {currentPuzzle.clues.cols.map((colClue, cIdx) => {
              const matchedIndices = getMatchedClueIndices(getColCells(cIdx), colClue);
              return (
                <div key={cIdx} className="flex flex-col items-center justify-end gap-0.5" style={{ width: cellSize }}>
                  {colClue.map((clue, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "font-headline font-extrabold text-sm sm:text-lg leading-tight transition-all duration-300",
                        matchedIndices.has(idx)
                          ? "text-outline-variant opacity-40 line-through"
                          : "text-on-surface-variant",
                      )}
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Row Clues (Left) */}
          <div
            className="flex flex-col items-end pr-3"
            style={{ paddingTop: gridPadding, gap: gapSize, width: rowClueWidth }}
          >
            {currentPuzzle.clues.rows.map((rowClue, rIdx) => {
              const matchedIndices = getMatchedClueIndices(grid[rIdx], rowClue);
              return (
                <div key={rIdx} className="flex items-center justify-end gap-1.5 sm:gap-2" style={{ height: cellSize }}>
                  {rowClue.map((clue, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "font-headline font-extrabold text-sm sm:text-lg transition-all duration-300",
                        matchedIndices.has(idx)
                          ? "text-outline-variant opacity-40 line-through"
                          : "text-on-surface-variant",
                      )}
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Cell Grid */}
          <div
            className="bg-surface-container-low rounded-xl"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${currentPuzzle.cols}, ${cellSize}px)`,
              gap: gapSize,
              padding: gridPadding,
            }}
          >
            {grid.flatMap((row, rIdx) =>
              row.map((cellState, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => onCellClick(rIdx, cIdx, false, touchMode)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onCellClick(rIdx, cIdx, true);
                  }}
                  className={cn(
                    "rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center",
                    cellState === 1 && "bg-primary-container",
                    cellState === -1 && "bg-surface-container-lowest",
                    cellState === 2 && "bg-error-container/30",
                    cellState === 0 && "bg-surface-container-lowest hover:bg-primary-container/30 hover:scale-95",
                  )}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {cellState === -1 && (
                    <span className="material-symbols-outlined text-outline-variant opacity-40 text-xs sm:text-sm">
                      close
                    </span>
                  )}
                  {cellState === 2 && (
                    <span className="material-symbols-outlined text-error text-xs sm:text-sm font-bold">close</span>
                  )}
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
