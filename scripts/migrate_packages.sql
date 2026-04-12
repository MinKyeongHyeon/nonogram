-- ============================================================
-- Migration: Package / Payment System
-- ============================================================
-- 실행 순서: Supabase SQL Editor 또는 psql에서 한 번만 실행

-- ────────────────────────────────────────────────────────────
-- 1. packages 테이블
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id           bigserial    PRIMARY KEY,
  slug         text         UNIQUE NOT NULL,  -- URL에서 사용 (예: starter-5x5)
  title        text         NOT NULL,
  description  text,
  cover_emoji  text         NOT NULL DEFAULT '🧩',
  price        integer      NOT NULL DEFAULT 0,  -- 0 = 무료, 양수 = 원(KRW)
  difficulty   text         CHECK (difficulty IN ('easy','medium','hard','mixed')),
  is_published boolean      NOT NULL DEFAULT false,
  sort_order   integer      NOT NULL DEFAULT 0,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON COLUMN packages.price IS '0이면 무료. 양수값은 KRW 원 단위 가격';

-- ────────────────────────────────────────────────────────────
-- 2. puzzles 테이블에 패키지 컬럼 추가
-- ────────────────────────────────────────────────────────────
ALTER TABLE puzzles
  ADD COLUMN IF NOT EXISTS package_id  bigint REFERENCES packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order  integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_puzzles_package_id ON puzzles(package_id);

-- ────────────────────────────────────────────────────────────
-- 3. user_purchases 테이블 (결제 완료 기록)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_purchases (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id   bigint       NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  order_id     text         NOT NULL,       -- Toss Payments orderId
  payment_key  text,                        -- Toss Payments paymentKey (confirm 후 세팅)
  amount       integer      NOT NULL,       -- 실제 결제 금액 (KRW)
  status       text         NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','completed','cancelled','refunded')),
  purchased_at timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (user_id, package_id)              -- 패키지당 1회 결제
);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);

-- ────────────────────────────────────────────────────────────
-- 4. RLS (Row Level Security)
-- ────────────────────────────────────────────────────────────

-- packages: 누구나 published 패키지 읽기 가능, 쓰기는 service_role만
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_public_read" ON packages
  FOR SELECT USING (is_published = true);

-- user_purchases: 본인 레코드만 읽기 가능
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_own_read" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. 기존 퍼즐 처리 — "Free Pack" 패키지 생성 후 배정
--    (기존에 package_id가 NULL인 퍼즐들을 여기에 묶음)
-- ────────────────────────────────────────────────────────────

-- Free Pack 기본 패키지 삽입 (이미 있으면 무시)
INSERT INTO packages (slug, title, description, cover_emoji, price, difficulty, is_published, sort_order)
VALUES
  ('free-easy',   'Starter Pack',    '입문용 무료 5×5 퍼즐 모음',   '☀️',  0, 'easy',   true, 10),
  ('free-medium', 'Sweet Pack',      '중급 무료 퍼즐 모음',          '🧁',  0, 'medium', true, 20),
  ('free-hard',   'Challenge Pack',  '고급 무료 퍼즐 모음',          '⚡',  0, 'hard',   true, 30)
ON CONFLICT (slug) DO NOTHING;

-- 기존 퍼즐을 난이도에 따라 대응 무료 패키지에 배정
-- (이미 package_id가 있는 퍼즐은 건드리지 않음)
UPDATE puzzles p
SET package_id = pkg.id
FROM packages pkg
WHERE p.package_id IS NULL
  AND p.difficulty = pkg.difficulty
  AND pkg.slug IN ('free-easy', 'free-medium', 'free-hard');

-- difficulty가 없거나 매핑 안 된 기존 퍼즐은 'free-easy'에 넣기 (선택적)
-- UPDATE puzzles SET package_id = (SELECT id FROM packages WHERE slug = 'free-easy')
-- WHERE package_id IS NULL;
