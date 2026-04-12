import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function PATCH(request: NextRequest) {
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

  const { nickname } = body as Record<string, unknown>;

  if (typeof nickname !== "string" || nickname.trim().length === 0 || nickname.trim().length > 20) {
    return NextResponse.json(
      { ok: false, message: "닉네임은 1~20자 사이여야 합니다." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nickname: nickname.trim() })
    .eq("id", user.id);

  if (error) {
    console.error("[profile] update error:", error.message);
    return NextResponse.json({ ok: false, message: "닉네임 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, nickname: nickname.trim() });
}
