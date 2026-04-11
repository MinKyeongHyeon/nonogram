"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // supabaseClient의 detectSessionInUrl: true 설정이
    // URL의 code를 자동으로 감지해 PKCE 교환을 처리함
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const returnTo = searchParams.get("returnTo") ?? "/";
        // 안전한 내부 경로만 허용
        const safe = returnTo.startsWith("/") ? returnTo : "/";
        router.replace(safe);
      } else {
        // 세션이 없으면 잠시 기다렸다가 재시도 (교환 중일 수 있음)
        const timer = setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession();
          const returnTo = searchParams.get("returnTo") ?? "/";
          const safe = returnTo.startsWith("/") ? returnTo : "/";
          if (retryData.session) {
            router.replace(safe);
          } else {
            router.replace("/login?error=auth_failed");
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3 text-on-surface-variant">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-body">로그인 처리 중...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
