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

## Phase 5: 백엔드 & 인프라 (선택사항)

> 🔴 **사용자 판단 필요**: 아래 항목은 서버/DB가 필요한 기능입니다.
> 현재 프로젝트를 로컬 전용(localStorage)으로 유지할지, 서버를 도입할지 결정 필요.

- [ ] **인증 시스템**
  - 🔴 **사용자 결정 필요**: 도입 여부 + 방식 (NextAuth / Supabase Auth / Firebase 등)
  - 도입 시: 회원가입/로그인 페이지, 세션 관리, 프로필 연동
- [ ] **실제 리더보드 백엔드**
  - 🔴 **사용자 결정 필요**: 서버 선택 (Supabase / PlanetScale / Vercel KV 등)
  - 현재 mock 데이터 → 실제 유저 랭킹 API
  - 클리어 기록 서버 저장 + 랭킹 쿼리
- [ ] **퍼즐 관리 API**
  - Admin Editor에서 만든 퍼즐을 서버에 저장
  - 퍼즐 목록 API (현재는 puzzle_library.ts 하드코딩)
- [ ] **배포**
  - 🟡 **사용자 확인 필요**: 배포 플랫폼 (Vercel / Netlify / self-hosted)
  - 도메인 설정, 환경 변수 관리

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
