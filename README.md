# 🎮 Nonogram (네모네모 로직) 고도화 프로젝트

기존의 바닐라 JS 노노그램 게임을 Next.js 기반의 모던 웹 애플리케이션으로 마이그레이션하고, 상용 레벨의 기능을 추가한 프로젝트입니다.

## 🚀 주요 기능 (Features)

- **Next.js & TypeScript:** App Router를 활용한 안정적이고 확장성 있는 아키텍처.
- **Zustand를 이용한 상태 관리:** 
  - 게임의 모든 로직(그리드 상태, 라이프, 타이머 등)을 통합 관리.
  - **Local Storage 연동:** 새로고침이나 브라우저 종료 후에도 진행 상황 완벽 보존.
- **모바일 최적화 (Mobile First):**
  - 터치 환경을 고려한 칠하기/X표시 토글 UI 적용.
  - 마우스 우클릭을 통한 쾌적한 마스킹 지원.
- **도전 요소 (Gameplay & Challenges):**
  - **라이프 시스템:** 오답 클릭 시 라이프 차감 및 정답 공개 (최대 3회).
  - **타이머:** 클리어까지의 소요 시간 측정.
- **편의성 기능 (QoL):**
  - **Smart Complete:** 한 줄의 정답을 모두 채우면 남은 칸을 자동으로 X 표시.
  - **Undo/Redo:** 실수했을 때 이전 상태로 손쉽게 복구 가능.
  - **Clue Visual Feedback:** 해결된 줄(Row/Col)의 힌트 숫자를 자동으로 흐릿하게 변경.
- **데이터 유틸리티 (Data Utils):**
  - 정답 데이터로부터 힌트를 자동 생성하는 알고리즘 탑재.
  - **이미지 파싱:** 1-bit 이미지를 업로드하면 즉시 퍼즐 JSON 데이터를 생성하는 유틸리티 포함.
- **테스트 주도 개발 (Testing):**
  - Jest를 이용한 코어 게임 로직 및 유틸리티 함수 테스트 완료.

## 🛠 기술 스택 (Tech Stack)

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **State Management:** Zustand (with Persist middleware)
- **Testing:** Jest, React Testing Library

## 📦 시작하기 (Getting Started)

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 개발 서버 실행:
   ```bash
   npm run dev
   ```

3. 테스트 실행:
   ```bash
   npm run test
   ```

## 📂 프로젝트 구조 (Structure)

- `src/app`: 페이지 레이아웃 및 메인 페이지
- `src/components`: UI 컴포넌트 (Grid, Header 등)
- `src/store`: Zustand 게임 상태 관리 로직
- `src/lib`: 유틸리티 함수 (이미지 파서, 힌트 수집기 등)
- `src/data`: 퍼즐 데이터셋 관리

---
이 프로젝트는 "프로덕션 수준의 게임 경험"을 목표로 개발되었습니다.
