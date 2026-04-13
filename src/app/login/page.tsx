"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Provider } from "@supabase/supabase-js";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo") ?? "/";
  const needsLogin = searchParams.get("needsLogin") === "1";

  const [isLoading, setIsLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: Provider) {
    setIsLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
    if (error) {
      setError("로그인 중 문제가 발생했어요. 다시 시도해주세요.");
      setIsLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface font-body flex flex-col items-center justify-center px-4">
      {/* 로고 + 타이틀 */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-primary-container flex items-center justify-center mx-auto mb-4 shadow-pudding">
          <span className="text-4xl">🍮</span>
        </div>
        <h1 className="text-3xl font-headline font-extrabold text-on-surface">Pudding Puzzles</h1>
        <p className="text-sm text-on-surface-variant mt-1">귀여운 노노그램 퍼즐 게임</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-[2rem] shadow-pudding p-8 space-y-4">
        {needsLogin && (
          <div className="bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 text-sm text-center">
            계속하려면 로그인이 필요합니다
          </div>
        )}

        <h2 className="text-xl font-headline font-bold text-center">시작하기</h2>

        {error && <div className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm text-center">{error}</div>}

        {/* 구글 로그인 */}
        <button
          onClick={() => handleOAuth("google")}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-bold text-[#1F1F1F] bg-white border border-outline-variant/40 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading === "google" ? (
            <div className="w-5 h-5 border-2 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google로 시작하기
        </button>

        {/* 카카오 로그인 (준비 중) */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-bold text-[#3C1E1E]/40 bg-[#FEE500]/30 cursor-not-allowed opacity-60"
        >
          <KakaoIcon />
          카카오로 시작하기
          <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full ml-1">
            준비 중
          </span>
        </button>

        {/* 비로그인 안내 */}
        <div className="pt-2 border-t border-outline-variant/30">
          <p className="text-xs text-on-surface-variant text-center leading-relaxed">
            로그인 없이도 플레이할 수 있어요.
            <br />
            단, 기록은 이 기기에만 저장돼요.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-3 text-sm text-primary font-semibold hover:underline"
          >
            로그인 없이 계속하기
          </button>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2C5.58 2 2 4.92 2 8.5c0 2.3 1.52 4.32 3.82 5.48L4.9 17.1a.3.3 0 0 0 .44.34l4.02-2.68c.21.02.43.04.64.04 4.42 0 8-2.92 8-6.5S14.42 2 10 2z"
        fill="#3C1E1E99"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
