import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "ko" | "en";

interface SettingsState {
  sound: boolean;
  haptics: boolean;
  darkMode: boolean;
  language: Language;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sound: true,
      haptics: true,
      darkMode: false,
      language: "ko",
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: "pudding-settings" },
  ),
);
