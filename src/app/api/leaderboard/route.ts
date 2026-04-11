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
      // All-time: 유저별 총 stars 집계
      const { data, error } = await supabaseAdmin
        .from("puzzle_completions")
        .select("user_id, stars, profiles(nickname, avatar_url)")
        .order("stars", { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ ok: true, data });
    }
  } catch (e) {
    console.error("[leaderboard] error:", e);
    return NextResponse.json({ ok: false, message: "랭킹 데이터를 불러오지 못했어요." }, { status: 500 });
  }
}
