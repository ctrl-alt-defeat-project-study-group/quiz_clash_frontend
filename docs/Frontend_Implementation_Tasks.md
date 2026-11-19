# QuizClash Frontend — Implementation Tasks

## Stage 1: Redesign `docs/prototype/` (Completed)
- [x] **Task 1.1:** Updated `docs/prototype/styles.css` with Light Mode (Option A + Platinum `#E5E5E5`, Cold Grey `#B0B0B0`, Jet Black `#1A1A1A`) and Dark Mode (Option D + Jet Black `#1A1A1A`, Platinum `#E5E5E5`, Cold Grey `#B0B0B0`), sticky header, and fixed non-scrolling left sidebar.
- [x] **Task 1.2:** Updated `docs/prototype/index.html` and `docs/prototype/app.js` with all 8 interactive screens from `QuizClash.html`.

---

## Stage 2: React + TypeScript Frontend Foundation (`src/`)
- [x] **Task 2.1: Routing & Environment Configuration**
  - Install `react-router-dom` in `package.json`.
  - Create `.env.example` and `.env` with `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
  - Update `index.html` title and metadata (`QuizClash · QuizClash — Study notes → active recall`).
- [x] **Task 2.2: Global Design System & Fixed Sidebar Styles (`src/index.css`)**
  - Port the approved CSS from `docs/prototype/styles.css` into `src/index.css` (Light Mode `#E5E5E5` Platinum / `#B0B0B0` Cold Grey / `#1A1A1A` Jet Black + Indigo `#4F46E5`; Dark Mode `#1A1A1A` Jet Black / `#E5E5E5` Platinum / `#B0B0B0` Cold Grey + Indigo `#6366F1` & Cyan `#22D3EE`).
  - Preserve the sticky `64px` top header and fixed `calc(100vh - 64px)` non-scrolling left sidebar (`overflow: hidden`) where all navigation buttons remain visible while only the right page scrolls.
- [x] **Task 2.3: TypeScript Interfaces & Seed Data (`src/types/quiz.ts`, `src/data/seedData.ts`)**
  - Define TypeScript models for backend API schemas (`QuizResponse`, `QuestionResponse`, `ChoiceResponse`, `AttemptCreate`, `AttemptResponse`) and frontend workspace state (`QuizItem`, `QuestionItem`, `AttemptRecord`, `UserSettings`, `LiveGameState`).
  - Add curated initial quizzes (`Cell structure`, `World history`, `Chemistry basics`) and attempt history in `src/data/seedData.ts`.
- [x] **Task 2.4: FastAPI Service Client (`src/services/api.ts`)**
  - Implement typed API client functions:
    - `checkHealth()` (`GET /api/v1/health`)
    - `createQuizFromFile(formData)` (`POST /api/v1/quizzes`)
    - `getQuiz(quizId)` (`GET /api/v1/quizzes/{id}`)
    - `getQuizPreview(quizId)` (`GET /api/v1/quizzes/{id}/preview`)
    - `updateQuiz(quizId, payload)` (`PATCH /api/v1/quizzes/{id}`)
    - `submitAttempt(quizId, answers)` (`POST /api/v1/quizzes/{id}/attempts`)
    - `getAttempt(attemptId)` (`GET /api/v1/attempts/{id}`)
    - `downloadQuizPdf(quizId, kind)` (`GET /api/v1/quizzes/{id}/exports?kind=questions|answers`)
- [x] **Task 2.5: Global Workspace & Theme Context (`src/context/AppContext.tsx`)**
  - Manage `theme` (`'light' | 'dark'`), `quizzes`, `activeQuizId`, `history`, `practice`, `live`, `settings`, `toast`, and modal dialog state.
  - Connect actions to `src/services/api.ts` with seamless local fallback when the backend is not running.
- [x] **Task 2.6: Application Shell & Fixed Sidebar (`src/components/layout/AppLayout.tsx`)**
  - Build the sticky Top Application Header (`QuizClash`, `Study notes → active recall`, Light/Dark theme switch, `Join game` button, user profile link).
  - Build the fixed Left Sidebar Navigation (`WORKSPACE` 5 links, `YOUR LIBRARY` top 4 quizzes, `Help & settings` pinned at bottom).
  - Include `<PrintSheet />`, Toast notification banner, and Modal dialog.

---

## Stage 3: Implement All 8 Screens (`src/pages/`)
- [x] **Task 3.1: Screen 01 — Dashboard (`src/pages/DashboardPage.tsx`)**
  - Render `YOUR STUDY SPACE / 01` header + `+ Create a quiz` button.
  - Render 3 Study Overview stat cards (`Saved quizzes`, `Completed attempts`, `Average score`).
  - Render `Start from a document` callout banner, `Recent quizzes` table, and 2-column `Continue learning` section (`Pick up where you left off` & `Study together`).
- [x] **Task 3.2: Screen 02 — Generate Quiz (`src/pages/GenerateQuizPage.tsx`)**
  - Render 3-step indicator (`1 Upload material`, `2 Configure quiz`, `3 Review questions`).
  - Implement drag-and-drop file upload (`.csv`, `.txt`, `.pdf`, `.docx`) with validation, source file card, and live `Extracted text preview`.
  - Implement `02 / Quiz settings` (`Quiz title`, `Number of questions`, `Question format`, `READY TO GENERATE` summary).
  - Wire `Generate quiz →` to upload CSV/TXT files to `POST /api/v1/quizzes` (and fallback gracefully to local generation when offline), then navigate to Screen 03.
- [x] **Task 3.3: Screen 03 — Review & Export / My Quizzes (`src/pages/ReviewExportPage.tsx`)**
  - Render quiz selector dropdown and study actions toolbar (`← My quizzes`, `Save changes`, `Start solo quiz →`, `Host live game`).
  - Implement Left `Question editor` (`QUESTION X OF N` pills, inline prompt/choice editor, correct choice selector wired to `PATCH /api/v1/quizzes/{id}`, `UP NEXT` preview, and pagination).
  - Implement Right `Quiz options` (`Print or study offline` with PDF/Word format toggle, live worksheet preview, `Download questions` & `Download answer key` wired to `GET /api/v1/quizzes/{id}/exports?kind=...` + print fallback).
- [x] **Task 3.4: Screen 04 — Solo Quiz (`src/pages/SoloQuizPage.tsx`)**
  - Render `SOLO PRACTICE / 04` header with `Save & exit`, progress bar (`Question X of N`, `X answered · Y remaining`), Left `Active question` with `( ) A / B / C / D` options, Right `Your progress` numbered grid (`01`–`10`), pagination, and `Finish quiz` submission wired to `POST /api/v1/quizzes/{id}/attempts`.
- [x] **Task 3.5: Screen 05 — Results & History (`src/pages/ResultsHistoryPage.tsx`)**
  - Render 4 Attempt Summary stat cards (`Your score`, `Correct answers`, `Time taken`, `From last attempt`).
  - Render `Review the questions you missed` 2-column feedback cards (with `View all answers →` toggle).
  - Render `Your attempt history` table (`DATE`, `SCORE`, `CORRECT`, `DURATION`, `REVIEW: View attempt →`) and bottom actions (`Retake quiz`, `Download answer key`, `Challenge friends`).
- [x] **Task 3.6: Screen 06 — Live Game Lobby (`src/pages/LiveLobbyPage.tsx`)**
  - Render `INVITE FRIENDS WITH THIS ROOM PIN` (`482 619`), `Copy PIN` & `Copy invite link`, `Connected players` 2x2 grid (`Maya`, `Leo`, `Nina`, `Sam`), `Start game →`, `Game setup` controls, and `Joining someone else?` PIN join form.
- [x] **Task 3.7: Screen 07 — Live Leaderboard (`src/pages/LiveLeaderboardPage.tsx`)**
  - Render round completion banner (`ROUND 3 OF 10 COMPLETE`), ranked `Current standings` rows, `Last round` summary (`CORRECT ANSWER`, accuracy, response time), and interactive `Next question →` round progression.
- [x] **Task 3.8: Screen 08 — Settings (`src/pages/SettingsPage.tsx`)**
  - Render section tabs, `Profile & Appearance` (Light/Dark theme buttons, display name, email), `Quiz defaults` (selects + `Shuffle questions` and `Show explanations` switches), `Notifications` switches, `Privacy & account` (`Export my data`, `Delete account`), and `Save changes`.

---

## Stage 4: Routing Integration, Verification & Quality Checks
- [x] **Task 4.1: Application Router & Entry Point (`src/App.tsx`, `src/main.tsx`)**
  - Connect `BrowserRouter`, `AppProvider`, `AppLayout`, and all 8 page routes (`/` through `/settings` plus `/s1`–`/s8` aliases).
- [x] **Task 4.2: TypeScript Build & ESLint Verification**
  - Run `npm run build` (`tsc -b && vite build`) and `npm run lint` (`eslint .`) and resolve any warnings/errors.
