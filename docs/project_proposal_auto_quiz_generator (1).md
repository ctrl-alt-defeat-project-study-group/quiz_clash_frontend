# Project Proposal: Auto-Quiz Generator & Interactive Dashboard // File-to-Quiz Battle

## Hook (Background)

Imagine you and your friend are grinding through a massive text file of N2 Japanese vocabulary or technical coding terms. You've spent hours compiling these notes, but just staring at a `.txt` or `.csv` file is boring and doesn't test your active memory. You want to test yourselves right now, but creating a 50-question multiple-choice quiz manually would take another two hours that you don't have.

## Problem

Transitioning from passive studying (reading notes) to active recall (taking a quiz) involves too much friction. Existing apps require you to manually input flashcards one by one. There is no fast, automated way to instantly convert personal, unstructured study files into ready-to-use quizzes for both offline study (printable PDFs) and interactive, competitive online review.

## Solution

A full-stack web application where a user simply uploads their raw study document (CSV or text file). The backend processes the file (optionally utilizing an AI API for context) and automatically generates a multiple-choice quiz.
The user is then presented with two immediate options:

1. **Offline Mode:** Download two neatly formatted PDFs (one containing only the questions, and a separate answer key).

2. **Dashboard Mode:** Take the quiz interactively directly on the web app. (Bonus: A "Challenge" mode where you and your friend can join a room and race to answer the generated questions).

## List of Tasks

**Phase 1: Setup & UI (Days 1-2)**

* \[ \] Initialize frontend repository (React/Vite or Tailwind/Blade).

* \[ \] Initialize backend repository (Express.js or Laravel) and configure basic routing.

* \[ \] Build the file upload UI (drag-and-drop zone for `.txt` or `.csv` files).

* \[ \] Create the interactive quiz dashboard UI (question cards, multiple-choice buttons, score tracker).

**Phase 2: Core Logic & AI Integration (Days 3-4)**

* \[ \] Implement backend file parsing to extract terms and definitions from the uploaded file.

* \[ \] Integrate an LLM API (like OpenAI or Gemini) to take the parsed terms and generate plausible "wrong" answers (distractors) to create multiple-choice questions.

* \[ \] Return the generated JSON quiz data to the frontend.

**Phase 3: PDF Generation (Day 5)**

* \[ \] Integrate a PDF generation library (`jspdf` on the frontend or `pdfkit` on the backend).

* \[ \] Create a template for the "Questions Only" PDF.

* \[ \] Create a template for the "Answer Key" PDF.

* \[ \] Add download buttons to the UI.

**Phase 4: Interactive Dashboard & Co-op (Days 6-7)**

* \[ \] Wire up the interactive quiz state in the frontend so users can click answers and see their final score.

* \[ \] *Stretch Goal:* Implement WebSockets (Socket.io) or simple database polling so you and your friend can load the same quiz ID and see who finishes first with the highest score.

* \[ \] Final bug fixes and local deployment.