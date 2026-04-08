"use client";

import React, { useEffect, useState } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { cn } from "@/lib/utils";

export default function PuzzleGrid() {
  const { currentPuzzle, grid, handleClick, status } = usePuzzleStore();
  const [touchMode, setTouchMode] = useState<"fill" | "mark">("fill");

  // To prevent hydration errors, we can just return null initially if not mounted,
  // but since we initialize currentPuzzle to null, we can just return a loading state or nothing.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !currentPuzzle) return <div className="text-center p-8">No puzzle loaded</div>;

  const isRowSolved = (rIdx: number) => {
    let required = 0;
    let filled = 0;
    for (let c = 0; c < currentPuzzle.cols; c++) {
      if (currentPuzzle.solution[rIdx][c] === 1) required++;
      if (grid[rIdx][c] === 1) filled++;
    }
    return required === filled;
  };

  const isColSolved = (cIdx: number) => {
    let required = 0;
    let filled = 0;
    for (let r = 0; r < currentPuzzle.rows; r++) {
      if (currentPuzzle.solution[r][cIdx] === 1) required++;
      if (grid[r][cIdx] === 1) filled++;
    }
    return required === filled;
  };

  return (
    <div className="flex flex-col items-center select-none max-w-full overflow-auto touch-none">
      {/* Game controls for mobile (Touch mode toggle) */}
      <div className="flex gap-4 mb-6">
        <button
          className={cn(
            "px-6 py-2 rounded-full font-bold shadow transition-all",
            touchMode === "fill" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          )}
          onClick={() => setTouchMode("fill")}
        >
          칠하기 (Fill)
        </button>
        <button
          className={cn(
            "px-6 py-2 rounded-full font-bold shadow transition-all",
            touchMode === "mark" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
          )}
          onClick={() => setTouchMode("mark")}
        >
          X 표시 (Mark)
        </button>
      </div>

      <div className="inline-grid bg-gray-50 border-2 border-gray-300 rounded p-2 shadow-lg">
        {/* Top Clues Row */}
        <div className="flex">
          <div className="w-16 sm:w-24 shrink-0 bg-transparent flex items-end justify-end p-2 border-r border-b border-gray-300 text-xs sm:text-sm text-gray-500 text-right">
            {status === "gameover" && <span className="text-red-500 font-bold">GAME OVER</span>}
            {status === "cleared" && <span className="text-green-500 font-bold">CLEARED!</span>}
          </div>
          <div className="flex">
            {currentPuzzle.clues.cols.map((colClue, cIdx) => {
              const solved = isColSolved(cIdx);
              return (
                <div
                  key={`top-clue-${cIdx}`}
                  className="w-8 sm:w-10 flex flex-col items-center justify-end border-b border-r border-gray-300 pb-1"
                >
                  {colClue.map((clue, idx) => (
                    <span 
                      key={idx} 
                      className={cn(
                        "text-xs sm:text-sm font-semibold leading-tight transition-colors duration-300",
                        solved ? "text-gray-300" : "text-gray-800"
                      )}
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows with Left Clues and Grid Cells */}
        {currentPuzzle.clues.rows.map((rowClue, rIdx) => {
          const solved = isRowSolved(rIdx);
          return (
            <div key={`row-${rIdx}`} className="flex">
              {/* Left Clue */}
              <div className="w-16 sm:w-24 shrink-0 flex items-center justify-end pr-2 border-r border-b border-gray-300">
                <div className="flex gap-1.5">
                  {rowClue.map((clue, idx) => (
                    <span 
                      key={idx} 
                      className={cn(
                        "text-xs sm:text-sm font-semibold transition-colors duration-300",
                        solved ? "text-gray-300" : "text-gray-800"
                      )}
                    >
                      {clue}
                    </span>
                  ))}
                </div>
              </div>

            {/* Grid Cells */}
            <div className="flex border-b border-gray-300">
              {grid[rIdx].map((cellState, cIdx) => (
                <div
                  key={`cell-${rIdx}-${cIdx}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleClick(rIdx, cIdx, true);
                  }}
                  onClick={() => handleClick(rIdx, cIdx, false, touchMode)}
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 border-r border-gray-300 flex items-center justify-center cursor-pointer transition-colors",
                    cellState === 1 && "bg-blue-600",
                    cellState === -1 && "bg-gray-200",
                    cellState === 2 && "bg-red-100", // Penalty
                    cellState === 0 && "bg-white hover:bg-blue-50"
                  )}
                >
                  {cellState === -1 && <span className="text-gray-500 font-medium text-xs">✕</span>}
                  {cellState === 2 && <span className="text-red-500 font-bold text-sm">✕</span>}
                </div>
              ))}
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
