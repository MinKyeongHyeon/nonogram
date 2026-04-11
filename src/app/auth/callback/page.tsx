"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    const returnTo = searchParams.get("returnTo") ?? "/";
    const safe = returnTo.startsWith("/") ? returnTo : "/";

    if (!code) {
      router.replace("/login?error=missing_code");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error || !data.session) {
        console.error("[auth/callback] exchange error:", error?.message);
        router.replace("/login?error=auth_failed");
        return;
      }
      router.replace(safe);
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
