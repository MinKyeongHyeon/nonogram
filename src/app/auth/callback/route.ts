import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const returnTo = searchParams.get("returnTo") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] code exchange error:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  // 안전한 returnTo 검증 (외부 URL 리다이렉트 방지)
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  return NextResponse.redirect(new URL(safeReturnTo, request.url));
}
