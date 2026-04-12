/**
 * scripts/seedPuzzles.ts
 * 기존 puzzle_library.ts의 퍼즐 데이터를 Supabase puzzles 테이블에 INSERT 합니다.
 *
 * 실행 방법:
 *   npx tsx scripts/seedPuzzles.ts
 *
 * 환경변수 필요:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { puzzleLibrary } from "../src/data/puzzle_library";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("환경변수 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function inferDifficulty(name: string, rows: number): "easy" | "medium" | "hard" {
  const lower = name.toLowerCase();
  if (lower.startsWith("easy")) return "easy";
  if (lower.startsWith("medium")) return "medium";
  if (lower.startsWith("hard")) return "hard";
  // fallback: size-based
  if (rows <= 5) return "easy";
  if (rows <= 7) return "medium";
  return "hard";
}

function generateClues(solution: number[][]): { rows: number[][]; cols: number[][] } {
  const rows = solution.map((row) => {
    const clues: number[] = [];
    let count = 0;
    for (const cell of row) {
      if (cell === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues.length === 0 ? [0] : clues;
  });

  const cols: number[][] = [];
  const numCols = solution[0].length;
  for (let c = 0; c < numCols; c++) {
    const clues: number[] = [];
    let count = 0;
    for (const row of solution) {
      if (row[c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    cols.push(clues.length === 0 ? [0] : clues);
  }

  return { rows, cols };
}

async function seed() {
  console.log(`총 ${puzzleLibrary.length}개 퍼즐 시드 시작...`);

  // packages 테이블에서 slug → id 매핑 조회
  const { data: pkgs, error: pkgErr } = await supabase
    .from("packages")
    .select("id, slug, difficulty")
    .in("slug", ["free-easy", "free-medium", "free-hard"]);

  if (pkgErr || !pkgs?.length) {
    console.error("packages 테이블 조회 실패 — migrate_packages.sql을 먼저 실행했는지 확인하세요.");
    console.error(pkgErr?.message);
    process.exit(1);
  }

  const pkgByDifficulty: Record<string, number> = {};
  for (const p of pkgs) {
    if (p.difficulty) pkgByDifficulty[p.difficulty] = p.id;
  }

  let succeeded = 0;
  let failed = 0;

  for (const raw of puzzleLibrary) {
    const rows = raw.solution.length;
    const difficulty = inferDifficulty(raw.name, rows);
    const clues = generateClues(raw.solution);

    const { error } = await supabase.from("puzzles").insert({
      title: raw.name,
      difficulty,
      grid_data: raw.solution,
      clues,
      package_id: pkgByDifficulty[difficulty] ?? null,
      is_published: true,
    });

    if (error) {
      console.error(`❌ [${raw.name}] 실패:`, error.message);
      failed++;
    } else {
      console.log(`✅ [${raw.name}] 저장 완료 (${difficulty}, pkg: ${pkgByDifficulty[difficulty] ?? "none"})`);
      succeeded++;
    }
  }

  console.log(`\n완료: ${succeeded}개 성공, ${failed}개 실패`);
}

seed().catch((e) => {
  console.error("seed 실패:", e);
  process.exit(1);
});
