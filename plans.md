# Pudding Puzzles - 개발 계획

## 디자인 시스템 요약

| 항목                | 값                                |
| ------------------- | --------------------------------- |
| Primary             | `#9f3069` (딥 핑크)               |
| Primary Container   | `#fe7db8` (라이트 핑크)           |
| Secondary           | `#6a45b2` (퍼플)                  |
| Secondary Container | `#dcc9ff` (라이트 퍼플)           |
| Tertiary            | `#00684f` (그린)                  |
| Tertiary Container  | `#98ffd9` (민트)                  |
| Surface             | `#fff4f8` (소프트 핑크 배경)      |
| On Surface          | `#46223e` (다크 퍼플 브라운)      |
| Headline Font       | Plus Jakarta Sans (700, 800)      |
| Body Font           | Be Vietnam Pro (400, 500, 600)    |
| Icons               | Material Symbols Outlined         |
| Border Radius       | DEFAULT: 1rem, lg: 2rem, xl: 3rem |

---

## Phase 0: 디자인 시스템 기반 셋업

> 모든 화면의 토대. 가장 먼저 한다.

- [x] **0-1. Tailwind 테마 구성**
  - tailwind.config.ts에 Stitch 디자인 토큰 적용
  - 색상 (Material Design 3 전체 토큰), 폰트 패밀리, border-radius
  - globals.css에 CSS 변수 및 기본 스타일 업데이트

- [x] **0-2. 웹 폰트 추가**
  - Plus Jakarta Sans (400, 500, 600, 700, 800)
  - Be Vietnam Pro (400, 500, 600)
  - Material Symbols Outlined
  - next/font/google 또는 layout.tsx에서 로드

- [x] **0-3. 공통 레이아웃 컴포넌트**
  - `TopNavBar` — 데스크탑: 로고 + 메뉴 + 검색/알림, 모바일: 로고 + 백버튼
  - `BottomNavBar` — 모바일 전용 (Home, Rank, Me, Settings)
  - `SideNavBar` — 데스크탑 전용 (w-72, rounded-r-[3rem])
  - 반응형 분기: md 기준으로 사이드바/바텀바 토글

- [x] **0-4. App Router 라우팅 구조**
  - `/` → Puzzle Home (레벨 팩, 히어로, 데일리)
  - `/puzzle/[id]` → Nonogram Gameplay
  - `/profile` → User Profile
  - `/settings` → Settings
  - `/leaderboard` → Leaderboard
  - `/calendar` → Daily Challenge Calendar
  - `/admin/editor` → Puzzle Admin Editor (나중에)

- [x] **0-5. metadata 업데이트**
  - layout.tsx 의 title/description을 "Pudding Puzzles"로 변경
  - lang="ko" 설정

---

## Phase 1: 핵심 화면 리디자인

> 기존 동작하는 로직을 새 디자인에 입히기

- [x] **1-1. Nonogram Gameplay 리디자인**
  - 기존 PuzzleGrid.tsx + Header.tsx → Stitch 디자인 적용
  - 데스크탑: SideNavBar에 Fill/Mark/Hint/Reset 버튼
  - 모바일: BottomNavBar에 Fill/Mark X/Hint 액션
  - 그리드 셀: rounded-md, primary-container 색상, hover 스케일
  - 힌트(clue) 영역: font-headline, 색상 대비
  - 타이머: tertiary-container 뱃지 스타일
  - 라이프: 하트 아이콘 (filled/outline)
  - 레벨 정보 "스티커" 스타일 표시
  - 클리어/게임오버 모달 추가

- [x] **1-2. Puzzle Home**
  - 히어로 섹션: 3D 일러스트 영역 + "Play Now" CTA
  - 스탯 그리드: Stars Won, Global Rank 카드
  - Daily Treats: 오늘의 챌린지 카드
  - Level Packs: 난이도별 카드 (Easy/Medium/Hard) + 진행률 바
  - 퍼즐 데이터에 difficulty, pack 메타데이터 추가

---

## Phase 2: 부가 화면

- [x] **2-1. Settings**
  - Sound 토글 (on/off)
  - Haptics 토글 (on/off)
  - Dark Mode 토글 + Tailwind dark class 시스템 연동
  - Account 섹션 (Profile Details 링크, Logout)
  - Support 섹션 (Contact Us, Privacy)
  - 설정 상태 localStorage/zustand persist로 관리

- [x] **2-2. User Profile**
  - 프로필 히어로: 아바타 + 레벨 뱃지 + 닉네임
  - Stats Bento Grid: 클리어 수, 연속 스트릭, 글로벌 랭크
  - Achievements: 배지 그리드 (잠금/해제 상태)
  - 진행도 데이터 스토어 설계 (클리어 기록, 시간, 스트릭)

- [x] **2-3. Daily Challenge Calendar**
  - 월간 캘린더 뷰 (7열 그리드)
  - 완료된 날: 체크 아이콘, 오늘: 하이라이트, 미래: 잠금
  - 스트릭 카운트 + 보상 카드
  - "Play Today's Challenge" CTA
  - 데일리 퍼즐 로직 (날짜 기반 퍼즐 매핑)

---

## Phase 3: 고급 기능

- [x] **3-1. Leaderboard**
  - Top 3 포디움 (비대칭 레이아웃)
  - 본인 랭크 sticky 카드
  - Daily / All-time 세그먼트 컨트롤
  - 스크롤 가능한 랭킹 리스트
  - 데이터: 클리어 타임 기반 랭킹 (로컬 또는 API)

- [x] **3-2. Puzzle Admin Editor**
  - 10x10+ 그리드 캔버스 (클릭으로 칠하기)
  - 우측 패널: 타이틀, 난이도, 팩, 날짜 설정
  - Undo/Redo/Invert/Clear 툴바
  - 저장 시 puzzle_library에 추가 or JSON 다운로드
  - 기존 `generatePuzzleFromImage` 기능 통합

- [x] **3-3. 사운드 & 햅틱**
  - 셀 클릭 효과음 (correct/wrong/mark)
  - 행/열 완성 효과음
  - 클리어 축하 사운드
  - 모바일 햅틱 피드백 (navigator.vibrate)
  - Settings 토글과 연동

- [x] **3-4. 애니메이션 개선**
  - 셀 클릭 시 스케일/색상 트랜지션
  - 행/열 완성 시 파티클 or 글로우 이펙트
  - 클리어 시 축하 애니메이션 (confetti)
  - 페이지 전환 트랜지션
  - 스켈레톤 로딩 UI

---

## Phase 4: 미구현 기능 완성

### 🔧 4-1. 데이터 바인딩 & 버그 수정 (바로 가능)

> 사용자 개입 불필요 — 기존 스토어 데이터를 UI에 연결하는 작업

- [x] **홈 화면 실제 데이터 연결**
  - `HomeStats.tsx` 클라이언트 컴포넌트 분리 (`StarsWon`, `PackProgress`)
  - Level Packs 진행률 바 난이도별 클리어 수 기반 동적 계산
- [x] **데일리 챌린지 완료 연동**
  - ClearedModal에서 `getDailyPuzzleId` 확인 → `completeDailyChallenge()` 호출
- [x] **리더보드 Daily 탭 분리**
  - Daily 탭: 오늘의 퍼즐 기록 기반 필터링, bestTime 순 정렬
  - All Time 탭: 스타 순 정렬 (기존)
- [x] **레거시 Header.tsx 제거**

### 🎮 4-2. 게임플레이 기능 완성

- [x] **힌트 시스템 구현** → A) 랜덤 정답 셀 1개 공개
  - `usePuzzleStore.useHint()` 액션 추가 (퍼즐당 3회 제한)
  - GameSidebar 힌트 버튼 활성화 + 남은 회수 표시
- [x] **키보드 단축키 연결**
  - `Ctrl/Cmd+Z` (Undo), `Ctrl/Cmd+Y` or `Ctrl/Cmd+Shift+Z` (Redo), `R` (Reset)
  - puzzle/[id] 페이지에 keydown 이벤트 리스너 추가

### 🏆 4-3. 프로필 & 업적 완성

- [x] **업적 로직 구현 (3개 완성)**
  - "Speed Demon": 30초 이내 클리어 기록 존재 여부
  - "On Fire": 스트릭 3일 이상
  - "Easy Peasy": easy 난이도 전체 클리어
- [ ] **프로필 정보 개선** → 인증 도입 후 Phase 5에서 처리 예정

### ⚙️ 4-4. 설정 페이지 연결

- [x] **Settings 비활성 메뉴 처리** → 플레이스홀더 유지
  - Log Out / Contact Us / Privacy Policy에 "Coming Soon" 배지 추가
  - 인증 도입 후 Phase 5에서 실제 연결 예정

---

## Phase 5: 백엔드 & 인프라

> **확정된 방향**
>
> - 스택: **Supabase** (Auth + PostgreSQL) + **Toss Payments** + **Vercel** (이미 배포됨)
> - 인증: 카카오/네이버 OAuth (Supabase Auth)
> - 비로그인 사용자: localStorage 전용으로 플레이 가능, 로그인 후 새로 시작 (기록 마이그레이션 없음)
> - 보일러플레이트 레포 `MinKyeongHyeon/boilerPlates`의 인프라 코드를 이식

---

### ⚙️ 5-1. 환경 셋업

- [ ] `@supabase/supabase-js` 패키지 설치
- [ ] `.env.local` 환경 변수 구성
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- [ ] Vercel Dashboard에 동일 환경 변수 등록
- [ ] `lib/env.ts` — 보일러플레이트에서 이식
- [ ] `lib/supabase-client.ts` — 보일러플레이트에서 이식

---

### 🗄️ 5-2. Supabase DB 스키마

```sql
-- 유저 프로필
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 퍼즐 클리어 기록
create table puzzle_completions (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  puzzle_id text not null,
  time_sec int not null,
  stars int not null,
  completed_at timestamptz default now()
);

-- 퍼즐 관리 (Admin)
create table puzzles (
  id bigserial primary key,
  title text not null,
  difficulty text not null,
  grid_data jsonb not null,
  clues jsonb not null,
  created_by uuid references profiles(id),
  is_published boolean default false,
  created_at timestamptz default now()
);
```

- RLS 정책: `profiles` 본인만 UPDATE, `puzzle_completions` 본인만 INSERT/SELECT
- `puzzles` 테이블: SELECT는 공개, INSERT/UPDATE는 admin 역할만

---

### 🔐 5-3. 인증 시스템 이식

- [ ] `store/auth-store.ts` — 보일러플레이트에서 이식 (session, isLoading Zustand 스토어)
- [ ] `components/AuthProvider.tsx` — 보일러플레이트 `auth-provider.tsx` 이식 (`layout.tsx`에 추가)
- [ ] `components/ProtectedRoute.tsx` — 보일러플레이트 `protected-route.tsx` 이식
  - 정책 동의 확인 로직 제거, 비로그인 시 `/login?returnTo=현재경로` 리다이렉트로 단순화
- [ ] `app/auth/callback/route.ts` — OAuth 콜백 처리 (PKCE 코드 교환 → 세션 설정)
- [ ] `middleware.ts` — 보일러플레이트 `proxy.ts` 기반 보안 헤더 + Rate Limit 이식
  - CSP에 Supabase 도메인 추가
  - 서버 측 보호 라우트(`/profile`, `/leaderboard`, `/admin/**`): 쿠키 없을 시 `/login?returnTo=...` 리다이렉트

---

### 🚪 5-4. 로그인 유도 페이지 (`/login`)

- [ ] Pudding Puzzles 디자인 시스템 적용 (primary 컬러, 폰트)
- [ ] 카카오 OAuth 버튼 (카카오 브랜드 색상)
- [ ] 네이버 OAuth 버튼 (네이버 브랜드 색상)
- [ ] 비로그인 안내 문구: "로그인 없이도 플레이할 수 있어요. 단, 기록은 이 기기에만 저장돼요."
- [ ] 로그인 성공 후 `returnTo` 파라미터로 원래 페이지 복귀
- [ ] 보호 라우트에서 진입 시 "계속하려면 로그인이 필요합니다" 컨텍스트 메시지 표시

---

### 🏆 5-5. 실제 리더보드 백엔드

- [ ] `/api/leaderboard/route.ts` — `puzzle_completions` 기반 랭킹 쿼리
  - `?tab=daily`: 오늘 날짜 completions, time_sec 오름차순
  - `?tab=alltime`: 유저별 total stars 내림차순
- [ ] `/api/completions/route.ts` — 클리어 시 POST (세션 필수, RLS로 본인만 INSERT)
  - Rate Limit: IP당 분당 30회 (보일러플레이트 `proxy.ts` 활용)
- [ ] `leaderboard/page.tsx` — mock 데이터 → 실제 API 교체
- [ ] `ClearedModal.tsx` — 로그인 상태면 completions API 호출, 비로그인이면 로컬 스토어만 업데이트

---

### 🧩 5-6. 퍼즐 관리 API

- [ ] `/api/puzzles/route.ts` — GET(공개 목록), POST(저장, admin only)
- [ ] `app/admin/editor/page.tsx` — 저장 버튼 → Supabase `puzzles` 테이블 INSERT
- [ ] `scripts/seedPuzzles.ts` — 기존 `puzzle_library.ts` 55개 퍼즐 → Supabase 마이그레이션 스크립트

---

### 👤 5-7. 프로필 연동

- [ ] `profile/page.tsx` — 닉네임/아바타 Supabase `profiles` 테이블에서 로드
- [ ] 닉네임 인라인 편집 (입력 필드 + 저장 버튼)
- [ ] `settings/page.tsx` — Log Out 실제 연결 (`supabase.auth.signOut()` 후 `/` 이동)

---

### � 5-9. 보안 강화 (Phase 5 완료 후 우선 처리)

> Phase 5 구현 과정에서 확인된 보안/안정성 미흡 사항

#### Rate Limit — 인메모리 버킷 한계

- **문제**: `middleware.ts`의 Rate Limit이 `Map<string, Bucket>` 인메모리 구조  
  → Vercel Serverless 환경에서 인스턴스 재시작 시 카운터 초기화됨  
  → 실질적으로 우회 가능 (콜드 스타트마다 새 카운터)
- **개선**: [Upstash Redis](https://upstash.com) + `@upstash/ratelimit` 패키지로 교체
  ```ts
  // 예시
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";
  const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(60, "1 m") });
  ```
- **환경변수 추가**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

#### 리더보드 집계 — 클라이언트 사이드 집계 위험

- **문제**: `/api/leaderboard?tab=all` 응답에서 raw completions 50건을 프론트에서 `user_id`별 stars 합산  
  → 유저 수 증가 시 50건 초과 데이터 누락, 순위 왜곡
- **현재 상태**: API를 뷰 우선 조회(폴백: raw 500건)로 개선 완료 ✅
- **Supabase SQL Editor에서 실행 필요**:
  ```sql
  create or replace view leaderboard_alltime as
  select
    c.user_id,
    sum(c.stars)::int            as total_stars,
    count(*)::int                as cleared_count,
    p.nickname,
    p.avatar_url
  from puzzle_completions c
  join profiles p on c.user_id = p.id
  group by c.user_id, p.nickname, p.avatar_url
  order by total_stars desc;

  -- 뷰에 대한 RLS (anon도 읽기 가능)
  grant select on leaderboard_alltime to anon, authenticated;
  ```

#### ClearedModal 서버 저장 실패 — 조용한 실패

- **문제**: 로그인 상태에서 `/api/completions` POST 실패 시 콘솔 에러만 출력, 유저에게 알림 없음
- **개선**: 전역 토스트 컴포넌트 도입 → 저장 실패 시 "기록 저장에 실패했어요" 알림 표시

#### 닉네임 편집 기능 미구현

- **문제**: `profiles` 테이블 조회는 됐지만 닉네임 변경 UI 없음
- **개선**: `profile/page.tsx`에 인라인 편집 (입력 필드 + 저장 버튼) + `/api/profile` PATCH 엔드포인트

#### CSP `script-src 'unsafe-inline'` 완화 필요

- **문제**: `middleware.ts` CSP에 `'unsafe-inline'` 허용 — XSS 벡터 존재
- **개선**: Nonce 기반 CSP (`crypto.randomUUID()` per request) 또는 `'strict-dynamic'` 검토  
  Next.js 15의 `experimental.cspHeader` 옵션 활용 가능

---

### �💳 5-8. Toss Payments (Phase 6 검토)

> 현재 퍼즐 앱에 결제가 필요한 기능이 없으므로 Phase 5 완료 후 수익화 방향 결정
> 후보: 힌트 패키지 구매, 프리미엄 퍼즐 팩, 광고 제거 구독
> 보일러플레이트의 `toss-payment-widget.tsx`, `lib/toss-server.ts` 등 재사용 가능

---

### Phase 5 실행 순서

| 순서 | 항목              | 난이도 | 의존성                 |
| ---- | ----------------- | ------ | ---------------------- |
| 1    | 5-1 환경 셋업     | ★☆☆    | Supabase 프로젝트 생성 |
| 2    | 5-2 DB 스키마     | ★☆☆    | 5-1                    |
| 3    | 5-3 인증 이식     | ★★☆    | 5-1, 5-2               |
| 4    | 5-4 /login 페이지 | ★★☆    | 5-3                    |
| 5    | 5-5 리더보드 API  | ★★☆    | 5-3                    |
| 6    | 5-6 퍼즐 관리 API | ★★☆    | 5-3                    |
| 7    | 5-7 프로필 연동   | ★☆☆    | 5-3                    |
| 8    | 5-8 토스페이먼츠  | ★★★    | 수익화 방향 결정 후    |

---

## 우선순위 요약

| 순서 | 항목                   | 난이도 | 사용자 개입        |
| ---- | ---------------------- | ------ | ------------------ |
| 1    | 4-1 데이터 바인딩 수정 | ★☆☆    | 불필요             |
| 2    | 4-3 업적 로직          | ★☆☆    | 불필요             |
| 3    | 4-2 힌트 시스템        | ★★☆    | **힌트 방식 선택** |
| 4    | 4-2 키보드 단축키      | ★☆☆    | 불필요             |
| 5    | 4-4 설정 메뉴 처리     | ★☆☆    | **메뉴 처리 결정** |
| 6    | 4-3 프로필 닉네임      | ★☆☆    | **관리 방식 선택** |
| 7    | 5-x 백엔드 도입        | ★★★    | **전체 방향 결정** |

---

## 기술 참고

- **프레임워크**: Next.js 15 (App Router) + React 19
- **상태 관리**: Zustand (persist 미들웨어)
- **스타일**: Tailwind CSS 3 + clsx + tailwind-merge
- **아이콘**: Material Symbols Outlined (웹폰트) — lucide-react에서 마이그레이션
- **테스트**: Jest + React Testing Library (15개 기존 테스트 유지)
- **퍼즐 데이터**: 55개 (5x5~10x10), puzzle_library.ts 기반
