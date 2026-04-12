import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "잘못된 ID입니다." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("puzzles")
    .select("id, title, difficulty, grid_data, clues, is_published, created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: "퍼즐을 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "잘못된 ID입니다." }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, message: "유효하지 않은 세션입니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { title, difficulty, grid_data, clues, is_published, package_id } = body as Record<string, unknown>;

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
  const { error } = await supabaseAdmin
    .from("puzzles")
    .update({
      title: (title as string).trim(),
      difficulty,
      grid_data,
      clues,
      package_id: typeof package_id === "number" ? package_id : null,
      is_published: is_published === true,
    })
    .eq("id", id);

  if (error) {
    console.error("[puzzles] update error:", error.message);
    return NextResponse.json({ ok: false, message: "퍼즐 수정에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
