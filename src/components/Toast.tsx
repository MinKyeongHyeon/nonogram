"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";

type ToastType = "error" | "success" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = "info") => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const ICONS: Record<ToastType, string> = {
  error: "wifi_off",
  success: "check_circle",
  info: "info",
};

const COLORS: Record<ToastType, string> = {
  error: "bg-error-container text-on-error-container",
  success: "bg-tertiary-container text-on-tertiary-container",
  info: "bg-surface-container-high text-on-surface",
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-pudding text-sm font-semibold pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200 ${COLORS[t.type]}`}
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            {ICONS[t.type]}
          </span>
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
