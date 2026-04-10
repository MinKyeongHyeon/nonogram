import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  sound: boolean;
  haptics: boolean;
  darkMode: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sound: true,
      haptics: true,
      darkMode: false,
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "pudding-settings" },
  ),
);
