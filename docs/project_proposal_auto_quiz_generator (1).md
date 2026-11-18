# Project Proposal: QuizClash — Auto-Quiz Generator & Interactive Dashboard

**Status:** Updated to align with [QuizClash Technical Plan & System Architecture](../../QuizClash_Technical_Plan.md)  
**Updated:** November 2026  
**Architecture:** Monorepo with React + TypeScript frontend and Python + FastAPI + PostgreSQL backend

---

## 1. Hook & Background

Imagine you and your friend are grinding through a massive text file of N2 Japanese vocabulary or technical coding terms. You've spent hours compiling these notes, but just staring at a `.txt` or `.csv` file is passive and doesn't test your active memory. You want to test yourselves immediately, but manually crafting a 50-question multiple-choice quiz with plausible distractors takes hours of tedious manual effort.

## 2. Problem Statement

Transitioning from passive studying (reading notes) to active recall (taking a quiz) involves excessive friction. Existing flashcard tools require manual, one-by-one card entry. There is no streamlined, automated way to instantly convert personal, structured or unstructured study files into ready-to-use quizzes for both offline study (printable PDFs) and interactive, competitive online review.

## 3. Solution

**QuizClash** is a full-stack web application that converts raw study documents (CSV, TXT) into reusable multiple-choice quizzes. The Python FastAPI backend validates and extracts source text, generates questions and distractors (using a deterministic rule-based engine for paired vocabulary, and an optional LLM adapter for unstructured notes), validates the quiz structure, and saves it in a PostgreSQL database.

Users are presented with three distinct modes:

1. **Offline Mode:** Download two neatly formatted PDFs generated server-side via ReportLab:
   - A **Questions-Only PDF** for pen-and-paper test taking.
   - An owner-authorized separate **Answer Key PDF** for grading.
2. **Solo Dashboard Mode:** Take the quiz interactively in the React web application. Questions are rendered **without exposing the answer key**. Answers are graded on the server, saving attempt history and performance metrics to the user's dashboard.
3. **Challenge Mode (Phase 3):** Host or join a synchronized multiplayer game room via a short PIN. Compete in real-time rounds powered by native FastAPI WebSockets with server-controlled round timers, dynamic scoring (accuracy + response latency), and live leaderboards.

---

## 4. Technical Stack

| Layer | Selected Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Fast, typed, component-based user interface |
| **Styling** | Tailwind CSS | Responsive utility-first layouts and accessible components |
| **Client Networking** | Fetch API / Axios | Strongly-typed REST calls to `/api/v1` and WebSocket client |
| **Backend** | Python 3.12+, FastAPI | High-performance asynchronous HTTP API and native WebSockets |
| **Data Validation** | Pydantic v2 | Strict request/response schemas and quiz validation invariants |
| **Database & ORM** | PostgreSQL, SQLAlchemy 2.x, Alembic | Relational storage for users, quizzes, questions, choices, and attempts |
| **Parsing Engine** | Python `csv` & text parsing utilities | Normalizes tabular vocabulary and structured key-value notes (PDF/DOCX in Phase 4) |
| **Quiz Generation** | Deterministic rule engine + optional LLM adapter | Fast distractor sampling from vocabulary sets; bounded LLM calls for free-form text |
| **PDF Generation** | ReportLab | Server-side questions and answer-key PDFs with Japanese CJK font support |
| **Realtime Engine** | FastAPI WebSockets | Low-latency room state synchronization and live multiplayer rounds |
| **Environment** | Docker Compose | Local PostgreSQL container and orchestrated service development |

---

## 5. Phased Implementation Roadmap

### Phase 1: Core MVP (Sprint 1)
- [x] Configure monorepo structure with `quiz_clash_frontend/` and `backend/`.
- [x] Configure Tailwind CSS, Vite, FastAPI, Pydantic, SQLAlchemy 2.x, and Alembic migrations.
- [x] Implement backend health check endpoint (`GET /api/v1/health`) and frontend API client.
- [x] Build drag-and-drop file upload UI for `.csv` and `.txt` files with client-side validation.
- [x] Implement backend parsing service for CSV (paired terms/definitions) and delimiter-separated TXT notes (`:`, `-`, `=`, `→`).
- [x] Implement deterministic rule-based MCQ generation engine (samples 3 unique distractors per question from vocabulary pools).
- [x] Integrate optional LLM adapter for unstructured notes with strict JSON schema validation.
- [x] Provide a quiz preview and edit workflow (allowing users to edit prompts and choices before publishing).
- [x] Implement server-side PDF generation via ReportLab (separate question sheet and answer key with Unicode/Japanese font support).

### Phase 2: Solo Dashboard & PostgreSQL Persistence (Sprint 2)
- [ ] Implement user authentication, secure password hashing (bcrypt), and session/JWT token authorization.
- [ ] Set up PostgreSQL relational tables (`users`, `quizzes`, `questions`, `choices`, `attempts`, `attempt_answers`).
- [ ] Build interactive solo quiz interface with question progress indicators.
- [ ] Implement secure server-side grading (`POST /api/v1/quizzes/{id}/attempts`) ensuring answers and scores cannot be manipulated on the client.
- [ ] Implement duplicate-submission prevention and attempt auditing.
- [ ] Build user dashboard displaying saved quizzes, previous attempt scores, and detailed answer review.

### Phase 3: Challenge Mode / Live Multiplayer (Sprint 3)
- [ ] Implement room management service with 6-digit room PIN generation and host permissions.
- [ ] Build native FastAPI WebSocket game manager (`/api/v1/ws/rooms/{pin}`) for lobby and round events.
- [ ] Implement server-controlled round timers, question broadcasting, and submission deadlines.
- [ ] Implement dynamic scoring algorithm based on answer correctness and server-measured response time.
- [ ] Synchronize real-time round results and live leaderboards across all connected players.
- [ ] Handle player disconnects, reconnects to room snapshot, and graceful game teardown.

### Phase 4: Optional Enhancements (Future)
- [ ] Add PDF (`pypdf` / `pdfplumber`) and DOCX (`python-docx`) text-based ingestion.
- [ ] Add Word (.docx) document export options.
- [ ] Advanced AI controls (difficulty settings, custom distractor styles, study topic tagging).
- [ ] Longitudinal analytics, study streaks, and quiz sharing.
