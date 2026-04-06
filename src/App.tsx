import React from "react";
import Game from "./components/Game";

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>🎮 Nonogram 퍼즐</h1>
        <div className="info-bar">
          <span>
            문제 <strong id="puzzle-id">1</strong>: <span id="puzzle-name">...</span>
          </span>
          <span id="progress">진행: 0/0</span>
        </div>
      </header>

      <main className="game-area">
        <div className="top-space" />
        <div className="clues-top" id="top-clues" />
        <div className="clues-left" id="left-clues" />
        <div className="grid-container">
          <div className="grid-wrapper" id="grid" />
        </div>
      </main>

      <footer className="controls">
        <button className="btn btn-primary" id="select-eraser">
          ✏️ 지우기
        </button>
        <button className="btn btn-secondary" id="flip-mode">
          🔄 양면 보기
        </button>
        <button className="btn btn-secondary" id="check-btn">
          ✅ 확인
        </button>
        <button className="btn btn-danger" id="reset-btn">
          🔄 초기화
        </button>
        <select className="btn btn-select" id="puzzle-select">
          <option value="1">1. Easy - 꽃</option>
          <option value="2">2. Medium - 고양이</option>
          <option value="3">3. Hard - 별</option>
        </select>
      </footer>

      <div className="message" id="message" />
    </div>
  );
}
