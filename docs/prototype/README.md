# QuizClash / AutoQuiz Interactive Prototype

Open `index.html` directly in any modern browser, or run `npm run dev` from the repository root and visit `/docs/prototype/index.html`. No external build step or network connection is required.

## Design Reference & 8-Screen Architecture

This prototype implements the 8-screen workspace layout from `QuizClash.html`:

1. **`01 Dashboard` (`#s1`):**
   - Top application header (`AUTOQUIZ · Study notes → active recall`, Light/Dark theme switch, `Join game`, user profile badge).
   - Left sidebar navigation (`WORKSPACE`: Dashboard, Generate quiz, My quizzes, Attempt history, Live games; `YOUR LIBRARY` saved quizzes; `Help & settings`).
   - 3 Study overview stat cards (`Saved quizzes`, `Completed attempts`, `Average score`).
   - `Start from a document` callout banner, `Recent quizzes` table, and 2-column `Continue learning` section (`Pick up where you left off` + `Study together`).
2. **`02 Generate quiz` (`#s2`):**
   - 3-step progress bar (`1 Upload material`, `2 Configure quiz`, `3 Review questions`).
   - `01 / Study material`: Drag-and-drop file upload (`PDF, Word (.docx), CSV, or TXT`), uploaded source card with `Remove` action, and live `Extracted text preview`.
   - `02 / Quiz settings`: Quiz title, question count (`5 / 10 / 15 / 20`), question format, and `READY TO GENERATE` summary box.
3. **`03 Review and export` (`#s3`):**
   - Study actions toolbar (`← My quizzes`, `Save changes`, `Start solo quiz →`, `Host live game`).
   - Left `Question editor`: Question navigation pills (`[1] 2 3 ... 10`), inline question/choice editor, correct answer selector, `UP NEXT` preview, and pagination.
   - Right `Quiz options`: `Print or study offline` panel with `(●) PDF` and `( ) Word` selector, miniature worksheet preview, `Download questions` & `Download answer key` print sheets, and `Before you study` reminder.
4. **`04 Solo quiz` (`#s4`):**
   - Progress bar (`Question X of N`, `X answered · Y remaining`).
   - Left `Active question` with `( ) A / B / C / D` options and saved status.
   - Right `Your progress` numbered grid (`01`–`10`) with Answered, Current, and Not answered states, plus `Finish quiz` submission panel.
5. **`05 Results and history` (`#s5`):**
   - 4 Attempt summary cards (`Your score`, `Correct answers`, `Time taken`, `From last attempt`).
   - `Review the questions you missed` 2-column feedback cards (with `View all answers →` toggle).
   - `Your attempt history` table and actions (`Retake quiz`, `Download answer key`, `Challenge friends`).
6. **`06 Live game lobby` (`#s6`):**
   - Host room invitation with PIN `482 619`, `Copy PIN` / `Copy invite link`, 2x2 connected players grid (`Maya`, `Leo`, `Nina`, `Sam`), `Game setup` controls, and participant PIN join form.
7. **`07 Live leaderboard` (`#s7`):**
   - Round completion banner (`ROUND 3 OF 10 COMPLETE`), ranked `Current standings` table, `Last round` accuracy & response time summary, and `UP NEXT` round advancement.
8. **`08 Settings` (`#s8`):**
   - Profile & Appearance (Light/Dark theme toggle, display name, email), `Quiz defaults` (question count, difficulty, language, shuffle & explanation switches), `Notifications`, and `Privacy & account`.

## Dual Color Palette

Built around **Jet Black (`#1A1A1A`)**, **Platinum (`#E5E5E5`)**, and **Cold Grey (`#B0B0B0`)**:

- **☀️ Light Mode (Option A + Platinum):**
  - Canvas background: `#E5E5E5` (Platinum)
  - Card / Header surface: `#FFFFFF` (Pure White)
  - Sidebar surface: `#DCDCDC`
  - Structural borders: `#B0B0B0` (Cold Grey)
  - Primary text: `#1A1A1A` (Jet Black) · Muted text: `#525252`
  - Primary accent: `#4F46E5` (Electric Indigo) · Soft highlight: `#EEF2FF`
- **🌙 Dark Mode (Option D + Jet Black):**
  - Canvas background: `#1A1A1A` (Jet Black)
  - Card / Header surface: `#242424`
  - Sidebar surface: `#141414`
  - Structural borders: `#4D4D4D`
  - Primary text: `#E5E5E5` (Platinum) · Muted text: `#B0B0B0` (Cold Grey)
  - Primary accent: `#6366F1` (Neon Indigo) · Secondary accent: `#22D3EE` (Electric Cyan)
