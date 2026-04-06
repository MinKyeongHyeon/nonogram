import React, { useEffect, useRef, useState } from "react";
import data from "../../data.json";

type Puzzle = (typeof data)[number];

export default function Game() {
  const [puzzles] = useState<Puzzle[]>(data as Puzzle[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gridData, setGridData] = useState<number[][]>([]);
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initPuzzle(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initPuzzle(index: number) {
    const puzzle = puzzles[index];
    setCurrentIndex(index);
    const rows = puzzle.rows;
    const cols = puzzle.cols;
    setGridData(
      Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0))
    );
    showMessage(`퍼즐 ${index + 1}: ${puzzle.name}`, "info");
  }

  function showMessage(msg: string, type: string = "info") {
    if (!messageRef.current) return;
    messageRef.current.textContent = msg;
    messageRef.current.className = `message ${type}`;
    messageRef.current.style.display = "block";
    setTimeout(() => {
      if (messageRef.current) messageRef.current.style.display = "none";
    }, 4000);
  }

  const handleCellClick = (r: number, c: number, right: boolean) => {
    setGridData((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = right ? (next[r][c] === -1 ? 0 : -1) : next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  const checkPuzzle = () => {
    const puzzle = puzzles[currentIndex];
    let correct = 0;
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const userVal = gridData[r][c];
        const correctVal = puzzle.solution[r][c];
        if ((userVal === 1 && correctVal === 1) || (userVal !== 1 && correctVal === 0)) correct++;
      }
    }
    const total = puzzle.rows * puzzle.cols;
    const acc = Math.round((correct / total) * 100);
    if (acc === 100) showMessage("🎉 완전 정복! 퍼즐을 해결했습니다!", "success");
    else showMessage(`정확도: ${acc}% (틀린 칸: ${total - correct}개)`, "error");
  };

  const resetGrid = () => {
    const puzzle = puzzles[currentIndex];
    setGridData(
      Array(puzzle.rows)
        .fill(0)
        .map(() => Array(puzzle.cols).fill(0))
    );
    showMessage("그리드를 초기화했습니다.", "info");
  };

  const puzzle = puzzles[currentIndex];

  return (
    <div>
      <div className="top-space" />
      <div className="clues-top" id="top-clues">
        {puzzle.clues.cols.map((col, idx) => (
          <div className="clue-column" key={idx}>
            {col.map((c, i) => (
              <div className="clue-cell" key={i}>
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="clues-left" id="left-clues">
        {puzzle.clues.rows.map((row, rIdx) => (
          <div className="clue-row" key={rIdx}>
            {row.map((c, i) => (
              <div className="clue-cell" key={i}>
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid-container">
        <div className="grid-wrapper" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, 32px)` }}>
          {gridData.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`grid-cell ${cell === 1 ? "filled" : ""} ${cell === -1 ? "marked" : ""}`}
                onClick={(e) => handleCellClick(r, c, e.type === "contextmenu")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleCellClick(r, c, true);
                }}
              >
                {cell === 1 ? "■" : cell === -1 ? "✕" : ""}
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="controls">
        <button className="btn btn-primary" onClick={() => resetGrid()}>
          ✏️ 지우기
        </button>
        <button className="btn btn-secondary" id="flip-mode">
          🔄 양면 보기
        </button>
        <button className="btn btn-secondary" onClick={() => checkPuzzle()}>
          ✅ 확인
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm("정말 초기화하시겠습니까?")) resetGrid();
          }}
        >
          🔄 초기화
        </button>
        <select
          className="btn btn-select"
          value={currentIndex + 1}
          onChange={(e) => initPuzzle(parseInt(e.target.value) - 1)}
        >
          {puzzles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id}. {p.name}
            </option>
          ))}
        </select>
      </footer>

      <div className="message" id="message" ref={messageRef} />
    </div>
  );
}
