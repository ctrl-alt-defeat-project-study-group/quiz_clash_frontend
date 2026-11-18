# Project Proposal (Expanded): QuizClash — Auto-Quiz Generator & Interactive Dashboard

**Status:** Updated to align with [QuizClash Technical Plan & System Architecture](../../QuizClash_Technical_Plan.md)  
**Updated:** November 2026  
**Architecture:** Monorepo with React + TypeScript frontend and Python + FastAPI + PostgreSQL backend  

---

## 1. Background & Problem Statement

Transitioning from passive studying (reading notes) to active recall (taking a quiz) involves too much friction. Existing applications require users to manually input flashcards one by one. There is no fast, automated way to instantly convert personal, unstructured or structured study files into ready-to-use quizzes for both offline study (printable documents) and interactive, competitive online review.

## 2. The Solution

**QuizClash** is a full-stack web application where a user uploads raw study documents (CSV or plain text files in Phase 1; PDF and Word .docx documents in Phase 4). The Python + FastAPI backend processes the file, normalizes the text, and utilizes a deterministic rule-based engine (for paired terms/definitions) or an optional AI Large Language Model (LLM) adapter to automatically generate multiple-choice quizzes complete with plausible distractors (wrong answers).

Users are presented with three powerful options:

- **Offline Mode:** Download formatted PDFs generated server-side via ReportLab, containing the questions sheet and an owner-authorized separate answer key, with full UTF-8/CJK Unicode support for complex languages (e.g., Japanese Kanji).
- **Solo Dashboard:** Take the quiz interactively on the web app. Questions are delivered without exposing answer keys; the backend grades attempts server-side, saving results and history to the user's PostgreSQL-backed profile.
- **Live Multiplayer Mode (Challenge Mode):** Host a real-time, interactive game where friends join via a 6-digit room PIN and compete across synchronized rounds powered by native FastAPI WebSockets with dynamic latency-aware scoring and live leaderboards.

---

## 3. Core Features & Architecture Alignment

### 3.1. File Ingestion & Quiz Generation Pipeline
- **CSV & TXT Parsing:** Core MVP supports CSV paired terms (`term,definition`) and delimiter-separated TXT notes (`:`, `-`, `=`, `→`).
- **Rule-Based Distractor Engine:** For structured lists, extracts definitions and deterministically samples 3 unique plausible distractors from the rest of the vocabulary set, eliminating unnecessary LLM cost and latency.
- **LLM Adapter for Unstructured Notes:** For unstructured notes, an optional backend adapter sends bounded text to an LLM provider with strict Pydantic JSON schema validation.
- **Advanced Document Ingestion (Phase 4):** Text-based PDF and DOCX parsing will be integrated after the core generation workflow is stabilized.
- **PDF Generation Service:** Utilizes Python ReportLab on the backend to render questions-only and separate answer-key PDFs with registered Unicode CJK fonts for Japanese language support.

### 3.2. Data Storage & User History
- **Relational PostgreSQL Architecture:** Replaces the initial prototype's single-file JSON model with a robust PostgreSQL schema managed via SQLAlchemy 2.x and Alembic migrations (`users`, `quizzes`, `questions`, `choices`, `attempts`, `attempt_answers`).
- **Data Integrity & Security:** Enforces foreign key relationships, server-side grading, and private answer isolation (choices do not expose `is_correct` to student clients).

### 3.3. Real-Time Multiplayer Engine (Challenge Mode)
- **FastAPI Native WebSockets:** Powers low-latency, two-way communication between host and players without external JavaScript runtime dependencies on the backend.
- **Lobby & Room Management:** Hosts create rooms with 6-digit PINs; guests and users join live lobbies.
- **Authoritative Server Timing & Scoring:** The backend controls round countdowns and strictly rejects late submissions. Calculates points dynamically based on answer correctness and server-measured response time.
- **Live Synchronized Leaderboards:** Game state broadcasts update the player roster and leaderboard in real time after every question.

---

## 4. Phased Implementation Roadmap

### Phase 1: Core MVP & Ingestion Foundation
- Initialize frontend (`quiz_clash_frontend/`: React, TypeScript, Vite, Tailwind CSS) and backend (`backend/`: Python, FastAPI, Pydantic, SQLAlchemy 2.x, Alembic).
- Build file upload UI (drag-and-drop zone) and quiz preview/editor interface.
- Implement CSV/TXT parsing and deterministic rule-based MCQ generation.
- Integrate optional LLM adapter for free-form notes with strict JSON validation.
- Implement ReportLab PDF generation for separate questions and answer-key sheets.

### Phase 2: Solo Dashboard & PostgreSQL Persistence
- Implement user authentication with password hashing (bcrypt) and session/JWT tokens.
- Deploy PostgreSQL database tables for users, quizzes, questions, choices, and attempt history.
- Build interactive solo quiz-taking flow with server-side grading (`POST /api/v1/quizzes/{id}/attempts`).
- Deliver personal dashboard showing saved quizzes and past attempt scores.

### Phase 3: Challenge Mode (Live Multiplayer)
- Build room management service with 6-digit PIN generation and lobby management.
- Implement native FastAPI WebSockets game engine (`/api/v1/ws/rooms/{pin}`).
- Orchestrate synchronized rounds, server-enforced countdown timers, and dynamic latency-aware scoring.
- Stream live leaderboard updates and final winner podium standings.

### Phase 4: Extended Ingestion & Formats
- Add text-based PDF and DOCX ingestion.
- Implement Word (.docx) document exports.
- Richer AI generation settings (difficulty adjustment, topic tags) and longitudinal analytics.
