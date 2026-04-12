import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("puzzles")
    .select("id, title, difficulty, created_at, is_published")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(request: NextRequest) {
  // admin 권한 확인
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

  const { title, difficulty, grid_data, clues, is_published } = body as Record<string, unknown>;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !["easy", "medium", "hard"].includes(difficulty as string) ||
    !grid_data ||
    !clues
  ) {
    return NextResponse.json({ ok: false, message: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("puzzles").insert({
    title: (title as string).trim(),
    difficulty,
    grid_data,
    clues,
    created_by: user.id,
    is_published: is_published === true,
  }).select("id").single();

  if (error) {
    console.error("[puzzles] insert error:", error.message);
    return NextResponse.json({ ok: false, message: "퍼즐 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
