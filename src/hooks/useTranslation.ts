"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { ko } from "@/locales/ko";
import { en } from "@/locales/en";

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const t = language === "ko" ? ko : en;
  return { t, language };
}
