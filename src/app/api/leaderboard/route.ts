import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") === "daily" ? "daily" : "alltime";
  const supabaseAdmin = getSupabaseAdmin();

  try {
    if (tab === "daily") {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabaseAdmin
        .from("puzzle_completions")
        .select("user_id, time_sec, stars, puzzle_id, profiles(nickname, avatar_url)")
        .gte("completed_at", `${today}T00:00:00Z`)
        .lte("completed_at", `${today}T23:59:59Z`)
        .order("time_sec", { ascending: true })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    } else {
      // All-time: leaderboard_alltime 뷰 사용 (DB 서버에서 집계)
      // 뷰가 없으면 raw completions 집계로 폴백
      const { data: viewData, error: viewError } = await supabaseAdmin
        .from("leaderboard_alltime")
        .select("user_id, total_stars, cleared_count, nickname, avatar_url")
        .order("total_stars", { ascending: false })
        .limit(100);

      if (!viewError && viewData) {
        // 뷰 응답을 프론트 호환 포맷으로 변환
        const formatted = viewData.map((row) => ({
          user_id: row.user_id,
          stars: row.total_stars,
          cleared_count: row.cleared_count,
          profiles: { nickname: row.nickname, avatar_url: row.avatar_url },
        }));
        return NextResponse.json({ ok: true, data: formatted });
      }

      // 뷰 미존재 시 폴백: raw completions (최대 500건)
      const { data, error } = await supabaseAdmin
        .from("puzzle_completions")
        .select("user_id, stars, profiles(nickname, avatar_url)")
        .order("stars", { ascending: false })
        .limit(500);

      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }
  } catch (e) {
    console.error("[leaderboard] error:", e);
    return NextResponse.json({ ok: false, message: "랭킹 데이터를 불러오지 못했어요." }, { status: 500 });
  }
}
