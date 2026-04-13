"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => setMounted(true), []);

  // Drag state
  const dragRef = useRef<{
    active: boolean;
    action: "fill" | "mark-add" | "mark-remove" | null;
    painted: Set<string>;
  }>({ active: false, action: null, painted: new Set() });

  // End drag on mouseup anywhere
  useEffect(() => {
    const onMouseUp = () => {
      dragRef.current.active = false;
      dragRef.current.action = null;
      dragRef.current.painted.clear();
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  // Track container width for responsive cell sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);
    return () => observer.disconnect();
  }, [mounted]);

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

  // Start drag on first cell
  const startDrag = useCallback(
    (rIdx: number, cIdx: number) => {
      const cell = grid[rIdx][cIdx];
      let action: "fill" | "mark-add" | "mark-remove" | null = null;
      if (touchMode === "fill") {
        if (cell === 0) action = "fill";
      } else {
        if (cell === 0) action = "mark-add";
        else if (cell === -1) action = "mark-remove";
      }
      dragRef.current = { active: true, action, painted: new Set([`${rIdx}-${cIdx}`]) };
      if (action) onCellClick(rIdx, cIdx, false, touchMode);
    },
    [grid, touchMode, onCellClick],
  );

  // Apply drag action to a cell during move
  const applyDragToCell = useCallback(
    (rIdx: number, cIdx: number) => {
      const { active, action, painted } = dragRef.current;
      if (!active || !action) return;
      const key = `${rIdx}-${cIdx}`;
      if (painted.has(key)) return;
      painted.add(key);
      const cell = grid[rIdx][cIdx];
      if (action === "fill" && cell === 0) {
        onCellClick(rIdx, cIdx, false, "fill");
      } else if (action === "mark-add" && cell === 0) {
        onCellClick(rIdx, cIdx, false, "mark");
      } else if (action === "mark-remove" && cell === -1) {
        onCellClick(rIdx, cIdx, false, "mark");
      }
    },
    [grid, onCellClick],
  );

  // Touch handlers for the grid container
  const getCellFromTouch = (touch: React.Touch) => {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return null;
    const row = el.getAttribute("data-row");
    const col = el.getAttribute("data-col");
    if (row === null || col === null) return null;
    return { rIdx: Number(row), cIdx: Number(col) };
  };

  const onGridTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const cell = getCellFromTouch(e.touches[0]);
      if (cell) startDrag(cell.rIdx, cell.cIdx);
    },
    [startDrag],
  );

  const onGridTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const cell = getCellFromTouch(e.touches[0]);
      if (cell) applyDragToCell(cell.rIdx, cell.cIdx);
    },
    [applyDragToCell],
  );

  const onGridTouchEnd = useCallback(() => {
    dragRef.current.active = false;
    dragRef.current.action = null;
    dragRef.current.painted.clear();
  }, []);

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

  // Cell size: responsive based on container width
  const maxDim = Math.max(currentPuzzle.rows, currentPuzzle.cols);
  const idealCellSize = maxDim >= 10 ? 36 : maxDim >= 8 ? 44 : maxDim >= 6 ? 48 : 56;
  const gapSize = 4;
  const gridPaddingPx = 32; // 2rem = 32px

  // Clue area sizing
  const maxRowClueLen = Math.max(...currentPuzzle.clues.rows.map((r) => r.length), 1);
  const maxColClueLen = Math.max(...currentPuzzle.clues.cols.map((c) => c.length), 1);
  const idealRowClueWidth = maxRowClueLen * 24 + 32;
  const colClueHeight = maxColClueLen * 24 + 48;

  // Fit cell size to available width
  const containerPadding = 48; // p-6 = 24px * 2
  const availableForGrid = containerWidth - idealRowClueWidth - containerPadding;
  const maxCellFromWidth =
    availableForGrid > 0
      ? Math.floor((availableForGrid - gridPaddingPx * 2 - gapSize * (currentPuzzle.cols - 1)) / currentPuzzle.cols)
      : idealCellSize;
  const cellSize = Math.max(24, Math.min(idealCellSize, maxCellFromWidth));
  const rowClueWidth = Math.min(idealRowClueWidth, maxRowClueLen * (cellSize < 36 ? 18 : 24) + 24);
  const clueFontClass = cellSize < 32 ? "text-[10px]" : cellSize < 40 ? "text-xs" : "text-sm sm:text-lg";

  const gridPadding = `${gridPaddingPx}px`;

  return (
    <div ref={containerRef} className="select-none touch-none w-full max-w-full">
      <div className="relative bg-white/40 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 shadow-[0px_40px_80px_rgba(70,34,62,0.08)] overflow-x-auto">
        <div
          className="grid w-fit mx-auto"
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
                        `font-headline font-extrabold ${clueFontClass} leading-tight transition-all duration-300`,
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
                        `font-headline font-extrabold ${clueFontClass} transition-all duration-300`,
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
            onTouchStart={onGridTouchStart}
            onTouchMove={onGridTouchMove}
            onTouchEnd={onGridTouchEnd}
          >
            {grid.flatMap((row, rIdx) =>
              row.map((cellState, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  data-row={rIdx}
                  data-col={cIdx}
                  onMouseDown={(e) => {
                    if (e.button === 2) return; // 우클릭은 onContextMenu에서 처리
                    e.preventDefault();
                    startDrag(rIdx, cIdx);
                  }}
                  onMouseEnter={() => applyDragToCell(rIdx, cIdx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onCellClick(rIdx, cIdx, true);
                  }}
                  className={cn(
                    "rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center",
                    cellState === 1 && "bg-primary-container",
                    cellState === -1 && "bg-surface-container",
                    cellState === 2 && "bg-error-container/30",
                    cellState === 0 && "bg-surface-container-lowest hover:bg-primary-container/30 hover:scale-95",
                  )}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {cellState === -1 && (
                    <span
                      className="material-symbols-outlined text-on-surface-variant text-xs sm:text-sm"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
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
