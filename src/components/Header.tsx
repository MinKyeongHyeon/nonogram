"use client";

import React, { useEffect, useState } from "react";
import { usePuzzleStore } from "@/store/usePuzzleStore";
import { fetchPuzzles, Puzzle } from "@/data/puzzles";
import { Heart, Timer, RotateCcw, Undo2, Redo2 } from "lucide-react";

export default function Header() {
  const { lives, status, timer, tickTimer, currentPuzzle, initPuzzle, undo, redo, reset } = usePuzzleStore();
  const [mounted, setMounted] = useState(false);
  const [puzzlesList, setPuzzlesList] = useState<Puzzle[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchPuzzles().then(puzzles => {
      const sorted = [...puzzles].sort((a, b) => a.id - b.id);
      setPuzzlesList(sorted);
      // Auto load first puzzle if null
      if (!currentPuzzle && sorted.length > 0) {
        initPuzzle(sorted[0]);
      }
    });
  }, [currentPuzzle, initPuzzle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'playing') {
      interval = setInterval(tickTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const puzzle = puzzlesList.find(p => p.id === id);
    if (puzzle) {
      initPuzzle(puzzle);
    }
  };

  if (!mounted) return <header className="h-16 bg-white shadow-sm mb-6" />; // placeholder

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block shadow-sm text-clip">Nonogram</h1>
          
          <select 
            onChange={handleLevelChange} 
            value={currentPuzzle?.id || ""}
            className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
          >
            {puzzlesList.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-gray-700 font-mono font-medium bg-gray-100 px-3 py-1.5 rounded-full">
            <Timer className="w-4 h-4 text-gray-500" />
            {formatTimer(timer)}
          </div>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart 
                key={heart} 
                className={`w-5 h-5 ${heart <= lives ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
            <button onClick={undo} disabled={status !== 'playing'} className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors">
              <Undo2 className="w-5 h-5" />
            </button>
            <button onClick={redo} disabled={status !== 'playing'} className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors">
              <Redo2 className="w-5 h-5" />
            </button>
            <button onClick={reset} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
