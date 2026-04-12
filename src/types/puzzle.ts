export type Difficulty = "easy" | "medium" | "hard";

export interface Clues {
  rows: number[][];
  cols: number[][];
}

export interface Puzzle {
  id: number;
  name: string;
  rows: number;
  cols: number;
  difficulty: Difficulty;
  solution: number[][];
  clues: Clues;
}

export interface RawPuzzle {
  id: number;
  name: string;
  solution: number[][];
}

// ── Package / Payment types ──────────────────────────────────

export type PurchaseStatus = "pending" | "completed" | "cancelled" | "refunded";

export interface Package {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  /** 0 = 무료, 양수 = KRW 가격 */
  price: number;
  difficulty: Difficulty | "mixed" | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

/** 목록 조회용 패키지 (퍼즐 수 + ID 목록 포함) */
export interface PackageSummary extends Package {
  puzzle_count: number;
  puzzle_ids: number[];
}

export interface UserPurchase {
  id: string;
  user_id: string;
  package_id: number;
  order_id: string;
  payment_key: string | null;
  amount: number;
  status: PurchaseStatus;
  purchased_at: string;
}
