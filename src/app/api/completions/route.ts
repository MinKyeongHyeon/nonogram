import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  // Authorization 헤더에서 Bearer 토큰 추출
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  // 토큰으로 유저 검증
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

  const { puzzle_id, time_sec, stars } = body as Record<string, unknown>;

  if (
    typeof puzzle_id !== "string" ||
    typeof time_sec !== "number" ||
    typeof stars !== "number" ||
    time_sec < 0 ||
    stars < 0 ||
    stars > 3
  ) {
    return NextResponse.json({ ok: false, message: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { error } = await supabase.from("puzzle_completions").insert({
    user_id: user.id,
    puzzle_id,
    time_sec,
    stars,
  });

  if (error) {
    console.error("[completions] insert error:", error.message);
    return NextResponse.json({ ok: false, message: "기록 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
