"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";

async function syncCompletionsToLocal(accessToken: string) {
  const mergeRecords = useProgressStore.getState().mergeRecords;

  const { data, error } = await supabase
    .from("puzzle_completions")
    .select("puzzle_id, time_sec, stars, completed_at")
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("[syncCompletionsToLocal] failed:", error.code, error.message);
    return;
  }
  if (!data) return;

  // 퍼즐별 최고 기록만 추출 (서버에 중복 저장된 경우 대비)
  const bestMap = new Map<number, { time: number; stars: number; clearedAt: string }>();
  for (const row of data) {
    const pid = Number(row.puzzle_id);
    const existing = bestMap.get(pid);
    if (!existing || row.stars > existing.stars || (row.stars === existing.stars && row.time_sec < existing.time)) {
      bestMap.set(pid, { time: row.time_sec, stars: row.stars, clearedAt: row.completed_at });
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

/** 로컬에만 있는 기록을 서버에 업로드 */
async function uploadLocalToServer(accessToken: string) {
  const localRecords = useProgressStore.getState().records;
  if (localRecords.length === 0) return;

  // 서버에 이미 있는 puzzle_id 목록 조회
  const { data: existing } = await supabase.from("puzzle_completions").select("puzzle_id");

  const existingIds = new Set((existing ?? []).map((r) => Number(r.puzzle_id)));

  // 서버에 없는 기록만 업로드
  const missing = localRecords.filter((r) => !existingIds.has(r.puzzleId));
  if (missing.length === 0) return;

  await fetch("/api/completions/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      records: missing.map((r) => ({
        puzzle_id: String(r.puzzleId),
        time_sec: r.time,
        stars: r.stars,
      })),
    }),
  });
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
        uploadLocalToServer(data.session.access_token).then(() => syncCompletionsToLocal(data.session!.access_token));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
      // 로그인 시 서버 기록을 로컬에 병합
      if (event === "SIGNED_IN" && session) {
        uploadLocalToServer(session.access_token).then(() => syncCompletionsToLocal(session.access_token));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return null;
}
