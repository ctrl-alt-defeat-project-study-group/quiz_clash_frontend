# QuizClash (QuizClash) — Frontend

React 19 + TypeScript + Vite web application for **QuizClash (QuizClash)** — turning personal study notes into active-recall multiple-choice quizzes, printable worksheets, solo practice sessions, and live multiplayer games.

---

## Features

- **Fixed Workspace Shell:** Sticky top application header (`64px`) and fixed, non-scrolling left navigation sidebar (`WORKSPACE`, `YOUR LIBRARY`, and `Help & settings`) with independent right-page scrolling.
- **Dual High-Contrast Theme System (Light & Dark Mode):**
  - **☀️ Light Mode (Option A + Platinum):** Platinum (`#E5E5E5`) workspace canvas, Pure White (`#FFFFFF`) cards, Cold Grey (`#B0B0B0`) borders, Jet Black (`#1A1A1A`) text, and Electric Indigo (`#4F46E5`) actions.
  - **🌙 Dark Mode (Option D + Jet Black):** Jet Black (`#1A1A1A`) workspace canvas, Elevated Charcoal (`#242424`) cards, Platinum (`#E5E5E5`) primary text, Cold Grey (`#B0B0B0`) secondary text, Neon Indigo (`#6366F1`), and Electric Cyan (`#22D3EE`) highlights.
- **8 Complete Application Screens:**
  1. **01 Dashboard (`/`):** Study overview statistics (`Saved quizzes`, `Completed attempts`, `Average score`), quick upload callout, recent quizzes table, and continue-learning shortcuts.
  2. **02 Generate Quiz (`/generate`):** Drag-and-drop file upload (`.csv`, `.txt`, `.pdf`, `.docx`), client-side validation, live extracted text preview, and quiz settings (`title`, `question count`, `format`).
  3. **03 Review & Export / My Quizzes (`/quizzes`, `/quizzes/:id`):** Question navigation pills, inline prompt/choice editor, correct answer selector, and offline export panel (`Questions Only` and `Separate Answer Key` PDF downloads + print worksheet).
  4. **04 Solo Quiz (`/play`, `/quizzes/:id/play`):** Progress tracker, multiple-choice option cards, 10-question status navigator (`Answered`, `Current`, `Not answered`), and attempt grading.
  5. **05 Results & History (`/history`, `/attempts/:id`):** Attempt summary cards (`Score`, `Correct answers`, `Time taken`, `Delta from last attempt`), missed-question review cards with explanations, and full attempt history table.
  6. **06 Live Game Lobby (`/lobby`):** Host room invitation with 6-digit Room PIN (`482 619`), connected players grid, round timer configuration, and participant PIN join form.
  7. **07 Live Leaderboard (`/leaderboard`):** Round status bar, ranked player standings (`Rank`, `Player`, `Correct`, `Points`), last-round accuracy/time summary, and next-question controls.
  8. **08 Settings (`/settings`):** Profile & Light/Dark appearance switch, default quiz preferences, notification toggles, JSON data export, and workspace reset.
- **FastAPI Backend Integration (`src/services/api.ts`):** Connects to the QuizClash FastAPI backend (`/api/v1/quizzes`, `/api/v1/attempts`, `/api/v1/exports`) with automatic local fallback when running standalone.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v7 (`react-router-dom`) |
| Styling | Custom CSS Variables (`src/index.css`) with Light/Dark themes & `@media print` |
| API Layer | Native `fetch` service client (`src/services/api.ts`) |

---

## Project Structure

```text
quiz_clash_frontend/
├── docs/
│   ├── Frontend_Implementation_Tasks.md  # Implementation task checklist
│   ├── Quiz_Clash_System_Design.md       # System design specification
│   └── prototype/                        # Standalone HTML/CSS/JS interactive prototype
├── public/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.tsx             # Sticky header, fixed sidebar, print sheet, modal & toast
│   ├── context/
│   │   └── AppContext.tsx                # Global state, theme switcher, and API orchestration
│   ├── data/
│   │   └── seedData.ts                   # Curated initial quizzes & attempt history
│   ├── pages/
│   │   ├── DashboardPage.tsx             # Screen 01: Dashboard
│   │   ├── GenerateQuizPage.tsx          # Screen 02: Generate quiz
│   │   ├── ReviewExportPage.tsx          # Screen 03: Review and export / My quizzes
│   │   ├── SoloQuizPage.tsx              # Screen 04: Solo quiz
│   │   ├── ResultsHistoryPage.tsx        # Screen 05: Results and history
│   │   ├── LiveLobbyPage.tsx             # Screen 06: Live game lobby
│   │   ├── LiveLeaderboardPage.tsx       # Screen 07: Live leaderboard
│   │   └── SettingsPage.tsx              # Screen 08: Settings
│   ├── services/
│   │   └── api.ts                        # FastAPI HTTP client (/api/v1/*)
│   ├── types/
│   │   └── quiz.ts                       # TypeScript domain & API interfaces
│   ├── App.tsx                           # Application router
│   ├── index.css                         # Global design tokens & responsive styles
│   └── main.tsx                          # React entry point
├── .env.example                          # Environment variable template
├── index.html
├── package.json
└── vite.config.ts
```

---

## Getting Started

### 1. Prerequisites

- **Node.js** 18+ and **npm**
- *(Optional)* **QuizClash FastAPI Backend** running on `http://localhost:8000`

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Environment Configuration (`.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Run in Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 5. Build & Lint for Production

```bash
# Run ESLint
npm run lint

# Type-check and build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Interactive Prototype

A standalone HTML/CSS/JS prototype is also available in [`docs/prototype/index.html`](./docs/prototype/index.html) and can be opened directly in any browser without a build step.
