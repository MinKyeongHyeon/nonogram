"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get("returnTo") ?? "/";
    const safe = returnTo.startsWith("/") ? returnTo : "/";

    // detectSessionInUrl: true 가 code 교환을 자동 처리함
    // → 교환 완료 시 SIGNED_IN 이벤트 발생 → 리다이렉트
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        router.replace(safe);
      }
    });

    // 이미 세션이 있는 경우 (뒤로가기 등)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        subscription.unsubscribe();
        router.replace(safe);
      }
    });

    // 5초 내 SIGNED_IN 없으면 실패 처리
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace("/login?error=auth_failed");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
