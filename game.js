// Nonogram 게임
class NonogramGame {
  constructor() {
    this.grid = document.getElementById("grid");
    this.topClues = document.getElementById("top-clues");
    this.leftClues = document.getElementById("left-clues");
    this.message = document.getElementById("message");

    this.puzzles = [];
    this.currentPuzzle = null;
    this.gridData = [];
    this.puzzleData = null;

    this.loadPuzzles();
    this.bindEvents();
  }

  // 퍼즐 데이터 로드
  async loadPuzzles() {
    try {
      const response = await fetch("data.json");
      this.puzzles = await response.json();
      this.initPuzzle(0);
    } catch (error) {
      console.error("퍼즐 로딩 실패:", error);
      this.showMessage("퍼즐 데이터를 불러올 수 없습니다.", "error");
    }
  }

  // 퍼즐 초기화
  initPuzzle(index) {
    const puzzle = this.puzzles[index];
    this.currentPuzzle = puzzle;
    this.puzzleData = {
      rows: puzzle.rows,
      cols: puzzle.cols,
      solution: puzzle.solution,
      clues: puzzle.clues,
    };

    this.gridData = Array(this.puzzleData.rows)
      .fill()
      .map(() => Array(this.puzzleData.cols).fill(0));

    this.renderGrid();
    this.renderClues();
    this.updateInfo();
    this.showMessage(`퍼즐 ${index + 1}: ${puzzle.name}`, "info");
  }

  // 그리드 렌더링
  renderGrid() {
    this.grid.innerHTML = "";
    this.grid.style.gridTemplateColumns = `repeat(${this.puzzleData.cols}, 32px)`;

    for (let row = 0; row < this.puzzleData.rows; row++) {
      for (let col = 0; col < this.puzzleData.cols; col++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        const value = this.gridData[row][col];
        if (value === 1) {
          cell.classList.add("filled");
          cell.textContent = "■";
        } else if (value === -1) {
          cell.classList.add("marked");
          cell.textContent = "✕";
        }

        cell.addEventListener("click", (e) => this.handleCellClick(row, col, e));
        this.grid.appendChild(cell);
      }
    }
  }
  // 셀 클릭 처리
  handleCellClick(row, col, e) {
    const isRightClick = e.button === 2;

    if (isRightClick) {
      e.preventDefault();
      this.gridData[row][col] = this.gridData[row][col] === -1 ? 0 : -1;
    } else {
      this.gridData[row][col] = this.gridData[row][col] === 1 ? 0 : 1;
    }

    this.renderGrid();
    this.updateInfo();
  }

  // 힌트 렌더링
  renderClues() {
    // 위쪽 힌트 (컬럼)
    this.topClues.innerHTML = "";
    
    for (let col = 0; col < this.puzzleData.cols; col++) {
      const clueDiv = document.createElement("div");
      clueDiv.className = "clue-column";
      
      const clues = this.puzzleData.clues.cols[col];
      clues.forEach((clue) => {
        const clueCell = document.createElement("div");
        clueCell.className = "clue-cell";
        clueCell.textContent = clue;
        clueDiv.appendChild(clueCell);
      });
      
      this.topClues.appendChild(clueDiv);
    }

    // 왼쪽 힌트 (로우)
    this.leftClues.innerHTML = "";
    for (let row = 0; row < this.puzzleData.rows; row++) {
      const clueDiv = document.createElement("div");
      clueDiv.className = "clue-row";
      
      const clues = this.puzzleData.clues.rows[row];
      clues.forEach((clue) => {
        const clueCell = document.createElement("div");
        clueCell.className = "clue-cell";
        clueCell.textContent = clue;
        clueDiv.appendChild(clueCell);
      });
      
      this.leftClues.appendChild(clueDiv);

  // 정보 업데이트
  updateInfo() {
    document.getElementById("puzzle-id").textContent = this.currentPuzzle.id;
    document.getElementById("puzzle-name").textContent = this.currentPuzzle.name;

    const filled = this.gridData.flat().filter((v) => v === 1).length;
    const total = this.puzzleData.rows * this.puzzleData.cols;
    document.getElementById("progress").textContent = `진행: ${filled}/${total}`;
  }

  // 퍼즐 확인
  checkPuzzle() {
    let correct = 0;

    for (let row = 0; row < this.puzzleData.rows; row++) {
      for (let col = 0; col < this.puzzleData.cols; col++) {
        const userVal = this.gridData[row][col];
        const correctVal = this.puzzleData.solution[row][col];

        if ((userVal === 1 && correctVal === 1) || (userVal !== 1 && correctVal === 0)) {
          correct++;
        }
      }
    }

    const total = this.puzzleData.rows * this.puzzleData.cols;
    const accuracy = Math.round((correct / total) * 100);

    if (accuracy === 100) {
      this.showMessage("🎉 완전 정복! 퍼즐을 해결했습니다!", "success");
    } else {
      this.showMessage(`정확도: ${accuracy}% (틀린 칸: ${total - correct}개)`, "error");
    }
  }

  // 초기화
  reset() {
    this.gridData = Array(this.puzzleData.rows)
      .fill()
      .map(() => Array(this.puzzleData.cols).fill(0));
    this.renderGrid();
    this.updateInfo();
    this.showMessage("그리드를 초기화했습니다.", "info");
  }

  // 메시지 표시
  showMessage(msg, type = "info") {
    this.message.textContent = msg;
    this.message.className = "message " + type;
    this.message.style.display = "block";

    setTimeout(() => {
      this.message.style.display = "none";
    }, 4000);
  }

  // 이벤트 바인딩
  bindEvents() {
    document.addEventListener("contextmenu", (e) => {
      if (e.target.classList.contains("grid-cell")) {
        e.preventDefault();
      }
    });

    document.getElementById("puzzle-select").addEventListener("change", (e) => {
      const index = parseInt(e.target.value) - 1;
      this.initPuzzle(index);
    });

    document.getElementById("select-eraser").addEventListener("click", () => {
      this.reset();
    });

    document.getElementById("check-btn").addEventListener("click", () => {
      this.checkPuzzle();
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
      if (confirm("정말 초기화하시겠습니까?")) {
        this.reset();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new NonogramGame();
});
