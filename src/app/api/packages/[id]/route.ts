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
  const { data: pkg, error } = await supabaseAdmin
    .from("packages")
    .select("id, slug, title, description, cover_emoji, price, difficulty, is_published, sort_order, created_at")
    .eq("id", id)
    .single();

  if (error || !pkg) {
    return NextResponse.json({ ok: false, message: "패키지를 찾을 수 없어요." }, { status: 404 });
  }

  // 패키지 내 퍼즐 목록 (grid_data 제외 — 게임 플레이 시 개별 fetch)
  const { data: puzzles } = await supabaseAdmin
    .from("puzzles")
    .select("id, title, difficulty, sort_order, is_published")
    .eq("package_id", id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ ok: true, data: { ...pkg, puzzles: puzzles ?? [] } });
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

  const { slug, title, description, cover_emoji, price, difficulty, is_published, sort_order } = body as Record<
    string,
    unknown
  >;

  if (typeof slug !== "string" || !slug.trim() || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ ok: false, message: "slug와 title은 필수입니다." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("packages")
    .update({
      slug: (slug as string).trim(),
      title: (title as string).trim(),
      description: typeof description === "string" ? description : null,
      cover_emoji: typeof cover_emoji === "string" && cover_emoji ? cover_emoji : "🧩",
      price: typeof price === "number" && price >= 0 ? price : 0,
      difficulty: ["easy", "medium", "hard", "mixed"].includes(difficulty as string) ? difficulty : null,
      is_published: is_published === true,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })
    .eq("id", id);

  if (error) {
    console.error("[packages] update error:", error.message);
    return NextResponse.json({ ok: false, message: "패키지 수정에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
