"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Difficulty } from "@/types/puzzle";
import { generateCluesFromSolution } from "@/lib/puzzleUtils";
import { validatePuzzle } from "@/lib/nonogramSolver";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";

interface PuzzleListItem {
  id: number;
  title: string;
  difficulty: Difficulty;
  is_published: boolean;
  created_at: string;
  package_id: number | null;
}

interface PackageOption {
  id: number;
  slug: string;
  title: string;
  price: number;
  is_published: boolean;
}

export default function AdminEditorPage() {
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState(5);
  const [grid, setGrid] = useState<number[][]>(() => makeEmptyGrid(5));
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isPublished, setIsPublished] = useState(false);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [painting, setPainting] = useState<boolean | null>(null);
  const [history, setHistory] = useState<number[][][]>(() => [makeEmptyGrid(5)]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [validation, setValidation] = useState<{ valid: boolean; reason?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [puzzleList, setPuzzleList] = useState<PuzzleListItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showPuzzleList, setShowPuzzleList] = useState(false);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [newPkgSlug, setNewPkgSlug] = useState("");
  const [newPkgTitle, setNewPkgTitle] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState(0);
  const [newPkgEmoji, setNewPkgEmoji] = useState("🧩");
  const [isSavingPkg, setIsSavingPkg] = useState(false);
  const showToast = useToast((s) => s.show);

  useEffect(() => setMounted(true), []);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/packages?admin=1");
      const json = await res.json();
      if (json.ok) setPackages(json.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const fetchPuzzleList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/puzzles");
      const json = await res.json();
      if (json.ok) setPuzzleList(json.data);
    } catch {
      // ignore
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const loadPuzzleForEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/puzzles/${id}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      const p = json.data;
      const loadedGrid: number[][] = p.grid_data;
      const loadedSize = loadedGrid.length;
      setEditingId(p.id);
      setTitle(p.title);
      setDifficulty(p.difficulty);
      setIsPublished(p.is_published ?? false);
      setPackageId(p.package_id ?? null);
      setSize(loadedSize);
      setGrid(loadedGrid);
      setHistory([loadedGrid]);
      setHistoryIdx(0);
      setValidation(null);
      setShowPuzzleList(false);
      showToast(`퍼즐 #${p.id} "${p.title}" 불러왔어요.`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "불러오기 실패", "error");
    }
  };

  const resetToNew = () => {
    const newGrid = makeEmptyGrid(5);
    setEditingId(null);
    setTitle("");
    setDifficulty("easy");
    setIsPublished(false);
    setPackageId(null);
    setSize(5);
    setGrid(newGrid);
    setHistory([newGrid]);
    setHistoryIdx(0);
    setValidation(null);
  };

  const createPackage = async () => {
    if (!newPkgSlug.trim() || !newPkgTitle.trim()) {
      showToast("slug와 이름을 입력해주세요.", "error");
      return;
    }
    setIsSavingPkg(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        showToast("로그인 필요", "error");
        return;
      }
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          slug: newPkgSlug.trim(),
          title: newPkgTitle.trim(),
          cover_emoji: newPkgEmoji || "🧩",
          price: newPkgPrice,
          is_published: false,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      showToast(`패키지 "${newPkgTitle}" 생성됐어요.`, "success");
      setNewPkgSlug("");
      setNewPkgTitle("");
      setNewPkgPrice(0);
      setNewPkgEmoji("🧩");
      setShowPackageForm(false);
      await fetchPackages();
      setPackageId(json.id);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "패키지 생성 실패", "error");
    } finally {
      setIsSavingPkg(false);
    }
  };

  const pushHistory = useCallback(
    (newGrid: number[][]) => {
      const newHistory = history.slice(0, historyIdx + 1);
      newHistory.push(newGrid);
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
    },
    [history, historyIdx],
  );

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setGrid(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setGrid(history[historyIdx + 1]);
    }
  };

  const invert = () => {
    const newGrid = grid.map((row) => row.map((c) => (c === 1 ? 0 : 1)));
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  const clearGrid = () => {
    const newGrid = makeEmptyGrid(size);
    setGrid(newGrid);
    pushHistory(newGrid);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    const newGrid = makeEmptyGrid(newSize);
    setGrid(newGrid);
    setHistory([newGrid]);
    setHistoryIdx(0);
    setValidation(null);
  };

  const handleCellDown = (r: number, c: number) => {
    const newVal = grid[r][c] === 1 ? 0 : 1;
    setPainting(newVal === 1);
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = newVal;
    setGrid(newGrid);
    setValidation(null);
  };

  const handleCellEnter = (r: number, c: number) => {
    if (painting === null) return;
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = painting ? 1 : 0;
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    if (painting !== null) {
      setPainting(null);
      pushHistory(grid);
    }
  };

  const exportJSON = () => {
    const clues = generateCluesFromSolution(grid);
    const puzzle = {
      id: Date.now(),
      name: title || "Untitled",
      difficulty,
      rows: size,
      cols: size,
      solution: grid,
      clues,
    };
    const blob = new Blob([JSON.stringify(puzzle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `puzzle-${puzzle.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clues = generateCluesFromSolution(grid);
  const filledCount = grid.flat().filter((c) => c === 1).length;

  const saveToSupabase = async () => {
    if (!title.trim()) {
      showToast("제목을 입력해주세요.", "error");
      return;
    }
    if (filledCount === 0) {
      showToast("퍼즐이 비어있어요.", "error");
      return;
    }
    if (!validation?.valid) {
      showToast("먼저 Validate를 통과해야 합니다.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        showToast("로그인이 필요합니다.", "error");
        return;
      }

      if (editingId !== null) {
        // 수정 모드: PUT
        const res = await fetch(`/api/puzzles/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            difficulty,
            grid_data: grid,
            clues,
            is_published: isPublished,
            package_id: packageId,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.message);
        showToast(`퍼즐 #${editingId} 수정됐어요.`, "success");
      } else {
        // 새 퍼즐: POST
        const res = await fetch("/api/puzzles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            difficulty,
            grid_data: grid,
            clues,
            is_published: isPublished,
            package_id: packageId,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.message);
        showToast(`퍼즐 #${json.id}가 저장됐어요.`, "success");
        setEditingId(json.id);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "저장에 실패했어요.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = () => {
    if (filledCount === 0) {
      setValidation({ valid: false, reason: "Grid is empty" });
      return;
    }
    const result = validatePuzzle(grid, clues.rows, clues.cols);
    setValidation(result);
  };

  if (!mounted)
    return (
      <main className="min-h-screen bg-surface text-on-surface font-body">
        {/* Header skeleton */}
        <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-6xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container animate-shimmer" />
            <div className="w-28 h-6 rounded-full bg-surface-container animate-shimmer" />
            <div className="flex-1" />
            <div className="w-32 h-10 rounded-full bg-surface-container animate-shimmer" />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
          {/* Grid canvas skeleton */}
          <div className="flex-1 flex flex-col items-center gap-6">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-lg bg-surface-container animate-shimmer" />
              ))}
            </div>
            {/* Grid */}
            <div className="inline-grid bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl p-3 shadow-pudding">
              <div className="grid grid-cols-5 gap-px">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-sm bg-surface-container animate-shimmer"
                    style={{ animationDelay: `${(i % 5) * 0.08}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Right panel skeleton */}
          <div className="w-full md:w-72 shrink-0 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-5">
              <div className="w-20 h-4 rounded bg-surface-container animate-shimmer" />
              <div className="space-y-1">
                <div className="w-12 h-3 rounded bg-surface-container animate-shimmer" />
                <div className="w-full h-9 rounded-lg bg-surface-container animate-shimmer" />
              </div>
              <div className="space-y-1">
                <div className="w-16 h-3 rounded bg-surface-container animate-shimmer" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex-1 h-9 rounded-lg bg-surface-container animate-shimmer" />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="w-16 h-3 rounded bg-surface-container animate-shimmer" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 h-9 rounded-lg bg-surface-container animate-shimmer" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body" onMouseUp={handleMouseUp}>
      {/* Top Bar */}
      <header className="w-full bg-surface/70 backdrop-blur-xl shadow-pudding sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-6xl mx-auto">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <h1 className="text-xl font-headline font-bold">Puzzle Editor</h1>
          {editingId !== null && (
            <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full">
              Edit #{editingId}
            </span>
          )}
          <div className="flex-1" />
          {editingId !== null && (
            <button
              onClick={resetToNew}
              className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-full text-sm font-headline font-bold hover:bg-surface-container-high transition-all flex items-center gap-2 mr-1"
            >
              <span className="material-symbols-outlined text-base">add</span>
              New
            </button>
          )}
          <button
            onClick={saveToSupabase}
            disabled={isSaving}
            className="bg-tertiary text-on-tertiary px-5 py-2 rounded-full text-sm font-headline font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 mr-2"
          >
            <span className="material-symbols-outlined text-base">cloud_upload</span>
            {isSaving ? "저장 중…" : editingId !== null ? "Update" : "Save"}
          </button>
          <button
            onClick={exportJSON}
            className="bg-primary text-on-primary px-5 py-2 rounded-full text-sm font-headline font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export JSON
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Grid Canvas */}
        <div className="flex-1 flex flex-col items-center gap-6">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <ToolBtn icon="undo" label="Undo" onClick={undo} disabled={historyIdx <= 0} />
            <ToolBtn icon="redo" label="Redo" onClick={redo} disabled={historyIdx >= history.length - 1} />
            <ToolBtn icon="swap_horiz" label="Invert" onClick={invert} />
            <ToolBtn icon="delete" label="Clear" onClick={clearGrid} variant="danger" />
          </div>

          {/* Grid */}
          <div
            className="inline-grid bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl p-3 shadow-pudding select-none"
            onMouseLeave={() => {
              if (painting !== null) {
                setPainting(null);
                pushHistory(grid);
              }
            }}
          >
            {/* Column clues */}
            <div className="flex">
              <div className="w-12 shrink-0" />
              <div className="flex">
                {clues.cols.map((colClue, cIdx) => (
                  <div
                    key={cIdx}
                    className="w-9 h-16 flex flex-col items-center justify-end pb-1 border-b-2 border-outline-variant/30"
                  >
                    {colClue.map((v, i) => (
                      <span key={i} className="text-[10px] font-headline font-bold leading-tight text-on-surface">
                        {v}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex">
                {/* Row clues */}
                <div className="w-12 shrink-0 flex items-center justify-end pr-1.5 border-r-2 border-outline-variant/30">
                  <div className="flex gap-0.5">
                    {clues.rows[rIdx].map((v, i) => (
                      <span key={i} className="text-[10px] font-headline font-bold text-on-surface">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cells */}
                <div className="flex">
                  {row.map((cell, cIdx) => (
                    <div
                      key={cIdx}
                      onMouseDown={() => handleCellDown(rIdx, cIdx)}
                      onMouseEnter={() => handleCellEnter(rIdx, cIdx)}
                      className={`w-9 h-9 border border-outline-variant/20 cursor-crosshair transition-colors rounded-sm ${
                        cell === 1
                          ? "bg-primary-container shadow-inner"
                          : "bg-surface-container-lowest hover:bg-primary-container/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant">
            {filledCount} cells filled • {size}×{size} grid
          </p>

          {/* Validation */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleValidate}
              className="bg-secondary text-on-secondary px-5 py-2 rounded-full text-sm font-headline font-bold shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">verified</span>
              Validate Puzzle
            </button>
            {validation && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  validation.valid
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-error-container text-on-error-container"
                }`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {validation.valid ? "check_circle" : "error"}
                </span>
                {validation.valid ? "Solvable by logic alone!" : validation.reason}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Metadata */}
        <div className="w-full md:w-72 shrink-0 space-y-6">
          {/* Load Existing Puzzle */}
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest">
                Load Puzzle
              </h3>
              <button
                onClick={() => {
                  if (!showPuzzleList) fetchPuzzleList();
                  setShowPuzzleList((v) => !v);
                }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPuzzleList ? "expand_less" : "expand_more"}
                </span>
                {showPuzzleList ? "접기" : "목록 보기"}
              </button>
            </div>

            {showPuzzleList && (
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {isLoadingList ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">불러오는 중…</p>
                ) : puzzleList.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">퍼즐이 없어요.</p>
                ) : (
                  puzzleList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadPuzzleForEdit(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                        editingId === p.id
                          ? "bg-primary/20 text-primary font-bold"
                          : "hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base shrink-0">
                        {p.is_published ? "public" : "lock"}
                      </span>
                      <span className="flex-1 truncate">{p.title}</span>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                          p.difficulty === "easy"
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : p.difficulty === "medium"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-5">
            <h3 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest">
              Puzzle Info
            </h3>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-headline font-semibold text-on-surface">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Puzzle"
                className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Size */}
            <div className="space-y-1">
              <label className="text-xs font-headline font-semibold text-on-surface">Grid Size</label>
              <div className="flex gap-2">
                {[5, 7, 10, 15].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      size === s
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-xs font-headline font-semibold text-on-surface">Difficulty</label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                      difficulty === d
                        ? "bg-secondary text-on-secondary shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Published */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-headline font-semibold text-on-surface">Published</label>
              <button
                onClick={() => setIsPublished((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isPublished ? "bg-primary" : "bg-surface-container-high"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    isPublished ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Package */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-headline font-semibold text-on-surface">Package</label>
                <button
                  onClick={() => setShowPackageForm((v) => !v)}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-sm">add</span>새 패키지
                </button>
              </div>

              <select
                value={packageId ?? ""}
                onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">— 패키지 없음 —</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.cover_emoji} {pkg.title} {pkg.price > 0 ? `(₩${pkg.price.toLocaleString()})` : "(무료)"}
                    {!pkg.is_published ? " [미공개]" : ""}
                  </option>
                ))}
              </select>

              {/* 패키지 빠른 생성 폼 */}
              {showPackageForm && (
                <div className="bg-surface-container rounded-xl p-3 space-y-2 border border-outline-variant/30">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    새 패키지 생성
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={newPkgEmoji}
                      onChange={(e) => setNewPkgEmoji(e.target.value)}
                      placeholder="🧩"
                      className="w-12 bg-surface rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <input
                      value={newPkgTitle}
                      onChange={(e) => setNewPkgTitle(e.target.value)}
                      placeholder="패키지 이름"
                      className="flex-1 bg-surface rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <input
                    value={newPkgSlug}
                    onChange={(e) => setNewPkgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="slug (예: summer-pack)"
                    className="w-full bg-surface rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">₩</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={newPkgPrice}
                      onChange={(e) => setNewPkgPrice(Math.max(0, Number(e.target.value)))}
                      placeholder="가격 (0 = 무료)"
                      className="flex-1 bg-surface rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <button
                    onClick={createPackage}
                    disabled={isSavingPkg}
                    className="w-full bg-primary text-on-primary py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    {isSavingPkg ? "생성 중…" : "생성"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-surface-container-lowest rounded-xl shadow-pudding p-5 space-y-3">
            <h3 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest">
              Preview
            </h3>
            <div className="flex justify-center">
              <div className="inline-grid gap-px" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
                {grid.flat().map((cell, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-[2px] ${cell === 1 ? "bg-primary-container" : "bg-surface-container"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function makeEmptyGrid(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function ToolBtn({
  icon,
  label,
  onClick,
  disabled,
  variant,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
        disabled ? "opacity-30 pointer-events-none" : ""
      } ${
        variant === "danger"
          ? "bg-error-container/20 text-error hover:bg-error-container/40"
          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
      }`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
  );
}
