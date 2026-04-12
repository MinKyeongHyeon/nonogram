import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * GET /api/packages
 * - 어드민: 전체 목록 (is_published 무관)
 * - 일반: published만
 */
export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const isAdmin = request.nextUrl.searchParams.get("admin") === "1";
  const slugFilter = request.nextUrl.searchParams.get("slug");

  const query = supabaseAdmin
    .from("packages")
    .select("id, slug, title, description, cover_emoji, price, difficulty, is_published, sort_order, created_at")
    .order("sort_order", { ascending: true });

  if (!isAdmin) {
    query.eq("is_published", true);
  }
  if (slugFilter) {
    query.eq("slug", slugFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // 패키지별 퍼즐 수 + ID 목록 집계
  const packageIds = (data ?? []).map((p) => p.id);
  const countMap: Record<number, number> = {};
  const idsMap: Record<number, number[]> = {};
  if (packageIds.length > 0) {
    const { data: puzzleRows } = await supabaseAdmin
      .from("puzzles")
      .select("id, package_id")
      .in("package_id", packageIds)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    for (const row of puzzleRows ?? []) {
      if (row.package_id != null) {
        countMap[row.package_id] = (countMap[row.package_id] ?? 0) + 1;
        idsMap[row.package_id] = [...(idsMap[row.package_id] ?? []), row.id];
      }
    }
  }

  const result = (data ?? []).map((p) => ({
    ...p,
    puzzle_count: countMap[p.id] ?? 0,
    puzzle_ids: idsMap[p.id] ?? [],
  }));

  // slug 필터 요청일 경우 단일 객체 반환
  if (slugFilter) {
    if (result.length === 0) {
      return NextResponse.json({ ok: false, message: "패키지를 찾을 수 없어요." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: result[0] });
  }

  return NextResponse.json({ ok: true, data: result });
}

/**
 * POST /api/packages
 * 어드민만 사용. Bearer 토큰 필수.
 */
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

  const { slug, title, description, cover_emoji, price, difficulty, is_published, sort_order } = body as Record<
    string,
    unknown
  >;

  if (typeof slug !== "string" || !slug.trim() || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ ok: false, message: "slug와 title은 필수입니다." }, { status: 400 });
  }
  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    return NextResponse.json({ ok: false, message: "price는 0 이상의 정수여야 합니다." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("packages")
    .insert({
      slug: (slug as string).trim(),
      title: (title as string).trim(),
      description: typeof description === "string" ? description : null,
      cover_emoji: typeof cover_emoji === "string" && cover_emoji ? cover_emoji : "🧩",
      price: typeof price === "number" ? price : 0,
      difficulty: ["easy", "medium", "hard", "mixed"].includes(difficulty as string) ? difficulty : null,
      is_published: is_published === true,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[packages] insert error:", error.message);
    const msg = error.message.includes("unique") ? "이미 사용 중인 slug입니다." : "패키지 저장에 실패했어요.";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
