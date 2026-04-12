import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * GET /api/purchases?packageId=1
 * 로그인한 유저가 특정 패키지를 구매했는지 확인
 */
export async function GET(request: NextRequest) {
  const packageId = Number(request.nextUrl.searchParams.get("packageId"));
  if (!packageId) {
    return NextResponse.json({ ok: false, message: "packageId가 필요합니다." }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ ok: true, purchased: false });
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: true, purchased: false });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("user_purchases")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("package_id", packageId)
    .eq("status", "completed")
    .maybeSingle();

  return NextResponse.json({ ok: true, purchased: !!data });
}
