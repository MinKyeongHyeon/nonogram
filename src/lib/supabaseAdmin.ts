import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// 빌드 타임 초기화 방지: 런타임에 클라이언트 생성
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return _admin;
}
