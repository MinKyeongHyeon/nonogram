import { Clues, Puzzle } from "@/types/puzzle";

/**
 * 0과 1로 이루어진 2차원 배열(정답 데이터)을 받아 노노그램의 규칙에 맞는 행(Row), 열(Col) 힌트를 자동 생성합니다.
 * @param solution - 정답 시뮬레이션 배열 (1이 칠해진 곳, 0이 빈 곳)
 * @returns 힌트 객체 (Clues)
 */
export function generateCluesFromSolution(solution: number[][]): Clues {
  if (!solution || solution.length === 0 || solution[0].length === 0) {
    return { rows: [], cols: [] };
  }

  const rows = solution.length;
  const cols = solution[0].length;
  const clues: Clues = { rows: [], cols: [] };

  // 행(Row) 힌트 계산
  for (let r = 0; r < rows; r++) {
    const rowClues: number[] = [];
    let count = 0;
    for (let c = 0; c < cols; c++) {
      if (solution[r][c] === 1) {
        count++;
      } else if (count > 0) {
        rowClues.push(count);
        count = 0;
      }
    }
    if (count > 0) rowClues.push(count);

    // 만약 한 줄이 완전히 비어있다면 [0] 리턴
    clues.rows.push(rowClues.length > 0 ? rowClues : [0]);
  }

  // 열(Col) 힌트 계산
  for (let c = 0; c < cols; c++) {
    const colClues: number[] = [];
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (solution[r][c] === 1) {
        count++;
      } else if (count > 0) {
        colClues.push(count);
        count = 0;
      }
    }
    if (count > 0) colClues.push(count);

    // 만약 한 열이 완전히 비어있다면 [0] 리턴
    clues.cols.push(colClues.length > 0 ? colClues : [0]);
  }

  return clues;
}

/**
 * 브라우저 환경에서 이미지 파일(File 객체)과 이름을 입력받아
 * 픽셀 데이터를 분석한 뒤 즉시 완성된 Puzzle 객체(JSON)를 반환합니다.
 * @param imageFile - 업로드된 이미지 파일 객체
 * @param name - 생성할 퍼즐의 이름
 * @param id - 고유 ID (생략 시 타임스탬프)
 * @returns 완전한 Puzzle 형식의 JSON 객체
 */
export async function generatePuzzleFromImage(imageFile: File, name: string, id: number = Date.now()): Promise<Puzzle> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas is not supported in this environment."));
          return;
        }

        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;

        // 이미지를 캔버스에 그림
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const solution: number[][] = [];

        // 픽셀 단위로 1과 0 판별
        for (let r = 0; r < height; r++) {
          const row: number[] = [];
          for (let c = 0; c < width; c++) {
            const i = (r * width + c) * 4;
            const rVal = data[i];
            const gVal = data[i + 1];
            const bVal = data[i + 2];
            const alpha = data[i + 3];

            // 투명하거나, 컬러 평균값이 128(회색) 이상으로 밝으면 빈 칸(0)
            const rgbAvg = (rVal + gVal + bVal) / 3;
            if (alpha < 128 || rgbAvg > 128) {
              row.push(0);
            } else {
              // 불투명하면서 어두운 색상이면 칠한 칸(1)
              row.push(1);
            }
          }
          solution.push(row);
        }

        // 방금 파싱한 솔루션을 바탕으로 힌트 자동 계산
        const clues = generateCluesFromSolution(solution);

        const puzzle: Puzzle = {
          id,
          name,
          difficulty: "medium",
          rows: height,
          cols: width,
          solution,
          clues,
        };

        resolve(puzzle);
      };

      img.onerror = () => reject(new Error("Failed to load image."));
      if (typeof e.target?.result === "string") {
        img.src = e.target.result;
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(imageFile);
  });
}
