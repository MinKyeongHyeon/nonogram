"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PackageRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  price: number;
  difficulty: string | null;
  is_published: boolean;
  sort_order: number;
  puzzle_count: number;
}

interface EditState {
  title: string;
  description: string;
  cover_emoji: string;
  price: number;
  difficulty: string;
  sort_order: number;
}

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    const res = await fetch("/api/packages?admin=1");
    const json = await res.json();
    if (json.ok) setPackages(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  const handleTogglePublish = async (pkg: PackageRow) => {
    const token = await getToken();
    if (!token) { setError("로그인이 필요합니다."); return; }
    const res = await fetch(`/api/packages/${pkg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_published: !pkg.is_published }),
    });
    const json = await res.json();
    if (json.ok) {
      setPackages((prev) => prev.map((p) => p.id === pkg.id ? { ...p, is_published: !pkg.is_published } : p));
    } else {
      setError(json.message);
    }
  };

  const startEdit = (pkg: PackageRow) => {
    setEditingId(pkg.id);
    setEditState({
      title: pkg.title,
      description: pkg.description ?? "",
      cover_emoji: pkg.cover_emoji,
      price: pkg.price,
      difficulty: pkg.difficulty ?? "easy",
      sort_order: pkg.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editState) return;
    setSaving(true);
    setError(null);
    const token = await getToken();
    if (!token) { setError("로그인이 필요합니다."); setSaving(false); return; }
    const res = await fetch(`/api/packages/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editState),
    });
    const json = await res.json();
    if (json.ok) {
      await fetchPackages();
      cancelEdit();
    } else {
      setError(json.message);
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-extrabold">Manage Packages</h1>
            <p className="text-sm text-on-surface-variant mt-1">Toggle visibility and edit package details</p>
          </div>
          <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            ← Admin Home
          </Link>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
            {error}
            <button className="ml-4 underline" onClick={() => setError(null)}>닫기</button>
          </div>
        )}

        {/* Package List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-container rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-surface-container-lowest rounded-xl shadow-pudding border border-outline-variant/10">
                {editingId === pkg.id && editState ? (
                  /* Edit Form */
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Title</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.title}
                          onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Emoji</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.cover_emoji}
                          onChange={(e) => setEditState({ ...editState, cover_emoji: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Difficulty</label>
                        <select
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.difficulty}
                          onChange={(e) => setEditState({ ...editState, difficulty: e.target.value })}
                        >
                          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price (₩)</label>
                        <input
                          type="number"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.price}
                          onChange={(e) => setEditState({ ...editState, price: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.description}
                          onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sort Order</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
                          value={editState.sort_order}
                          onChange={(e) => setEditState({ ...editState, sort_order: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Row View */
                  <div className="p-5 flex items-center gap-4">
                    <span className="text-3xl w-12 text-center">{pkg.cover_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold">{pkg.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant capitalize">{pkg.difficulty}</span>
                        {pkg.price > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-bold">₩{pkg.price.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant">{pkg.puzzle_count} puzzles · slug: {pkg.slug}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(pkg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${pkg.is_published ? "bg-tertiary-container text-tertiary" : "bg-surface-container text-on-surface-variant"}`}
                      >
                        {pkg.is_published ? "Published" : "Hidden"}
                      </button>
                      <button onClick={() => startEdit(pkg)} className="p-2 rounded-lg hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
