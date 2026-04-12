import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 로그인이 필요한 경로 (비로그인 유저는 /login으로 리다이렉트)
const PROTECTED_PATHS = ["/profile", "/admin"];

// Upstash Redis가 설정된 경우 사용, 없으면 인메모리 폴백
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: false,
  });
}

// 인메모리 폴백 (Upstash 미설정 시)
type Bucket = { count: number; resetAt: number };
const globalForRL = globalThis as typeof globalThis & { __rlBuckets?: Map<string, Bucket> };
const buckets = globalForRL.__rlBuckets ?? new Map<string, Bucket>();
globalForRL.__rlBuckets = buckets;

function checkRateLimitFallback(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= 60;
}

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API Rate Limit
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const key = `${ip}:${pathname}`;

    let allowed = true;
    if (ratelimit) {
      const result = await ratelimit.limit(key);
      allowed = result.success;
    } else {
      allowed = checkRateLimitFallback(key);
    }

    if (!allowed) {
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, message: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
          { status: 429 },
        ),
      );
    }
  }

  // 보호 경로: 서버 측에서 Supabase 세션 쿠키 확인
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected) {
    // Supabase는 sb-<project>-auth-token 쿠키를 사용
    const hasSession = request.cookies.getAll().some((c) => c.name.includes("sb-") && c.name.includes("auth-token"));
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
