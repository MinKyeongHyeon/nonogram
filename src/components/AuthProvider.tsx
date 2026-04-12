"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";

async function syncCompletionsToLocal(accessToken: string) {
  const mergeRecords = useProgressStore.getState().mergeRecords;

  const { data, error } = await supabase
    .from("puzzle_completions")
    .select("puzzle_id, time_sec, stars, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return;

  // 퍼즐별 최고 기록만 추출 (서버에 중복 저장된 경우 대비)
  const bestMap = new Map<number, { time: number; stars: number; clearedAt: string }>();
  for (const row of data) {
    const pid = Number(row.puzzle_id);
    const existing = bestMap.get(pid);
    if (!existing || row.stars > existing.stars || (row.stars === existing.stars && row.time_sec < existing.time)) {
      bestMap.set(pid, { time: row.time_sec, stars: row.stars, clearedAt: row.created_at });
    }
  }

  const incoming = Array.from(bestMap.entries()).map(([puzzleId, v]) => ({
    puzzleId,
    time: v.time,
    stars: v.stars,
    clearedAt: v.clearedAt,
  }));

  mergeRecords(incoming);
}

export default function AuthProvider() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      // 앱 로드 시 이미 로그인 상태면 동기화
      if (data.session) {
        syncCompletionsToLocal(data.session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      // 로그인 시 서버 기록을 로컬에 병합
      if (event === "SIGNED_IN" && session) {
        syncCompletionsToLocal(session.access_token);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return null;
}
