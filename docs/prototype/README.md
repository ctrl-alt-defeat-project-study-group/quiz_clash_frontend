# Quiz Clash interactive prototype

Open `index.html` directly in a modern browser, or run `npm run dev` from the repository and visit `/docs/prototype/`. No build or backend service is needed.

## Figma design reference

Reference: https://www.figma.com/design/7FNoWOT0KYh7K18ZiwosID/Untitled?node-id=0-1

The redesign follows the detailed Figma context and screenshots retrieved for:

- My quizzes (`2:26125`): horizontal navigation, purple continuation banner, compact subject cards, activity panel, PIN form, and study-tip sidebar.
- Solo practice (`2:26546`): segmented progress, selectable answer rows, submit state, session map, and reassurance panel.
- Host lobby (`2:26981`): dark PIN invitation, host controls, participant roster, and room guidance.

Figma's Starter-plan tool limit prevented retrieving detailed context for the remaining screens. Those retain their existing flows with the verified shared palette, typography scale, forms, and surfaces; they are not claimed as exact reproductions of the remaining frames. Authentication remains a demo-identity dialog.

Design tokens: purple `#6947ce`, plum `#302544`, lavender `#eee8fa`, warm background `#f6f4ef`, text `#292635`, muted text `#797580`, and borders `#e5e1e9`. Font stacks prefer Inter and Lora when available and fall back to local system sans-serif and Georgia. Original Figma SVG assets are saved in `assets/`, keep their intrinsic dimensions, and need no network requests at runtime.

The sample quiz names follow the reference: Cell foundations, Bonding basics, and The Renaissance. Each contains five working questions rather than the larger illustrative counts in Figma. Counts and results reflect actual prototype data. Earlier quizzes/history remain in localStorage; no prior user data is cleared.

## Responsive behavior

- Wide desktop: three quiz cards with a 316 px study sidebar; practice uses a 258 px session sidebar.
- Tablet: dashboard sidebar becomes two panels below the quiz area; cards remain compact.
- Small tablet: navigation wraps to a second row, quiz cards use two columns, lobby and upload panels stack.
- Phone: cards, study panels, and practice panels use one column. Navigation, actions, inputs, and answer choices remain accessible; long titles wrap.
- Print: only the selected study sheet prints; navigation and controls are hidden.

Responsive boundaries are 1200, 960, 720, and 480 px. Verified dashboard, upload, quiz detail, lobby, export, and result screens at 320, 390, 768, 1024, and 1440 px without page-level horizontal overflow.

## Walkthrough

1. **My quizzes:** open a sample quiz, use its options menu, or sort the cards.
2. **Create a quiz:** choose or drop PDF, DOCX, CSV, or TXT; use the sample to explore without a file. Unsupported, empty, and over-10-MB files show validation. Enter a title and select three or five questions.
3. **Solo practice:** select an answer, submit it, and advance. Review accuracy and all answers at the end. Completed results persist when browser storage is available.
4. **Clash:** host from a quiz or join with demo PIN `482916`. Copy the PIN, view the local roster, and complete a simulated clash.
5. **Offline study:** switch between a question sheet and separate answer key. Print or save as PDF through the browser. The Word button explains the planned export.
6. **My results:** inspect saved results. Empty states are provided for new browsers.

## Implementation boundaries

This is a client-side UI prototype. Uploaded content is not read or transmitted. Demo generation uses the curated biology set. Full file parsing (CSV/TXT), deterministic rule-based generation, optional LLM generation, server-side scoring, ReportLab PDF downloads, and native WebSocket live rooms are implemented in the production backend as specified in [QuizClash Technical Plan](../../../QuizClash_Technical_Plan.md). The local opponent uses deterministic scoring and rounds are untimed. Demo results are not represented as live multiplayer data.

Production adheres to the technical plan:
- **Backend:** Python + FastAPI with Pydantic validation.
- **Database:** PostgreSQL with SQLAlchemy 2.x and Alembic migrations.
- **PDF Generation:** Server-side ReportLab with Japanese/Unicode font embedding.
- **Realtime:** Native FastAPI WebSockets for Challenge Mode.
- **Security:** Answers and scores remain strictly server-owned and are never exposed in playable client payloads.

## Files and checks

- `index.html`: semantic shell, navigation, dialog, and live notifications.
- `styles.css`: shared tokens, responsive layouts, keyboard focus, reduced motion, and print styles.
- `app.js`: routes, sample questions, validation, scoring, history, exports, and room simulation.
- `assets/`: original reference SVGs.
- `preview.jpg` and `preview-mobile.jpg`: current desktop and phone previews.

Browser checks cover an incorrect answer followed by four correct answers (4/5), PIN validation, generated quizzes, persistence, and responsive image loading. JS syntax and whitespace checks also pass. Use the browser print dialog to choose page size and PDF output.
