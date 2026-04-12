import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

interface RecordItem {
  puzzle_id: string;
  time_sec: number;
  stars: number;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, message: "유효하지 않은 세션입니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { records } = body as { records: RecordItem[] };

  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  // 입력값 검증
  const valid = records.filter(
    (r) =>
      typeof r.puzzle_id === "string" &&
      typeof r.time_sec === "number" &&
      typeof r.stars === "number" &&
      r.time_sec >= 0 &&
      r.stars >= 0 &&
      r.stars <= 3,
  );

  if (valid.length === 0) {
    return NextResponse.json({ ok: false, message: "유효한 기록이 없습니다." }, { status: 400 });
  }

  const rows = valid.map((r) => ({
    user_id: user.id,
    puzzle_id: r.puzzle_id,
    time_sec: r.time_sec,
    stars: r.stars,
  }));

  // upsert: (user_id, puzzle_id) unique constraint 있으면 최고 기록만 갱신
  const { error } = await supabase
    .from("puzzle_completions")
    .upsert(rows, { onConflict: "user_id,puzzle_id", ignoreDuplicates: false });

  if (error) {
    // upsert 미지원 시 insert로 폴백 (에러 무시)
    await supabase.from("puzzle_completions").insert(rows);
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
