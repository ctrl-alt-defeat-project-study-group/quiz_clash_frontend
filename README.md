<div align="center">

# ⚡ QuizClash — Frontend

**Turn study notes into active-recall quizzes, printable worksheets, solo practice sessions, and live multiplayer games.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## ✨ Key Features

- **Document-to-Quiz Generation** — Drag and drop `.csv`, `.txt`, `.pdf`, or `.docx` study materials with client-side validation, live extracted text preview, configurable question counts, and optional AI (LLM) generation.
- **Review, Edit & Offline Exports** — Inline editor for prompts, choices, and answer keys, plus printable worksheets and downloadable **PDF** & **Word (`.docx`)** files (`Questions Only` and `Answer Key`).
- **Solo Practice & Analytics** — Distraction-free quiz runner with question status navigation, server-graded results, missed-question review, attempt history, and visual performance charts (`Recharts`).
- **Real-Time Live Multiplayer** — Host rooms with a 6-digit Room PIN, let guests join without an account, configure round timers, and compete on a real-time WebSocket-powered leaderboard.
- **Bilingual Support (EN / MM)** — Full **English** and **Myanmar** internationalization (`src/i18n/`) across the UI, error states, and exported study sheets.
- **Authentication & Admin Console** — Email/password sign-up with verification, password recovery, Google OAuth 2.0 (*Continue with Google*), cookie-based sessions, and a role-gated Admin Console.
- **Dual High-Contrast Theme System** — Seamless **Light** and **Dark** modes built on CSS design tokens, Tailwind CSS v4, and accessible Radix / Base UI primitives.

---

## 🗺️ Application Routes

| Section | Routes | Access | Description |
| :--- | :--- | :--- | :--- |
| **Landing** | `/` | Public | Marketing & product overview page |
| **Authentication** | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | Public / Guest | Sign in, register, email OTP verification, and password reset |
| **Live Multiplayer** | `/lobby`, `/rooms/:pin`, `/rooms/:pin/play`, `/leaderboard` | Public & Guest | Host or join live game rooms via 6-digit PIN and view real-time standings |
| **Dashboard** | `/dashboard` | Authenticated | Study KPIs, quick upload callout, and recent quizzes |
| **Generate Quiz** | `/generate`, `/upload` | Authenticated | Upload notes, preview extracted text, and configure quiz generation |
| **Review & Export** | `/quizzes`, `/quizzes/:id` | Authenticated | Manage saved quizzes, edit questions inline, print or export PDF/Word |
| **Solo Quiz** | `/play`, `/quizzes/:id/play` | Authenticated | Interactive solo practice runner and answer submission |
| **Results & History** | `/history`, `/attempts/:id` | Authenticated | Score summaries, missed-question breakdowns, and attempt logs |
| **Settings** | `/settings` | Authenticated | Profile, theme & language preferences, JSON account export, and account reset |
| **Admin Console** | `/admin` | Admin Only | User management, quiz moderation, and platform statistics |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | React 19 (with React Compiler), TypeScript 6 |
| **Build & Tooling** | Vite 8, ESLint 10 |
| **Routing** | React Router v7 (`react-router-dom`) |
| **Styling & UI** | Tailwind CSS v4, shadcn / Radix UI / Base UI, Lucide & Tabler Icons, SweetAlert2 |
| **Data Visualization** | Recharts 3 |
| **Internationalization** | Custom EN / MM dictionary & error mapper (`src/i18n/`) |
| **API & Real-Time** | Native `fetch` HTTP client (`src/services/api.ts`) + WebSockets |

---

## 📁 Project Structure

```text
quiz_clash_frontend/
├── docs/                          # System design, API contracts, i18n plans & prototype
│   └── prototype/                 # Standalone HTML/CSS/JS interactive prototype
├── public/                        # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── common/                # Shared reusable UI helpers
│   │   ├── layout/                # Workspace shell (sticky header, sidebar, modals)
│   │   ├── quiz/                  # Quiz-specific interactive components
│   │   ├── reui/                  # Extended UI primitives
│   │   └── ui/                    # Base shadcn / Radix / Base UI components
│   ├── context/
│   │   └── AppContext.tsx         # Auth state, theme, language, and global actions
│   ├── data/                      # Local seed/fallback data
│   ├── i18n/                      # English (en.ts), Myanmar (mm.ts) & API error maps
│   ├── lib/                       # Utility functions
│   ├── pages/                     # Lazy-loaded route screens (12 pages)
│   ├── services/
│   │   └── api.ts                 # FastAPI client (/api/v1/*)
│   ├── types/
│   │   └── quiz.ts                # Domain & API TypeScript interfaces
│   ├── App.tsx                    # Router & route guards (RequireAuth, GuestOnly, RequireAdmin)
│   ├── index.css                  # Design tokens, Light/Dark themes & print styles
│   └── main.tsx                   # React entry point
├── .env.example                   # Environment variable template
├── vercel.json                    # Vercel API proxy & SPA rewrite config
├── package.json
└── vite.config.ts                 # Vite config with /api/v1 HTTP & WS dev proxy
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `18+` and **npm**
- **QuizClash Backend API** running locally on `http://localhost:8000` (see `quiz_clash_backend/README.md`)

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
cp .env.example .env
```

Configure `.env` if your backend runs on a different host or port:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

> **Note:** During local development, Vite automatically proxies `/api/v1` (including WebSocket connections for live rooms) to the origin parsed from `VITE_API_BASE_URL` so auth cookies work seamlessly across origins.

### Development & Build Scripts

```bash
# Start development server at http://localhost:5173
npm run dev

# Run ESLint across the codebase
npm run lint

# Type-check and build production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## 🌐 Deployment

The repository includes a ready-to-use [`vercel.json`](./vercel.json) configuration for **Vercel**:

- **Framework Preset:** Vite (`npm run build` → `dist`)
- **API Proxy:** Rewrites `/api/v1/:path*` requests to the deployed Render backend API to preserve first-party auth cookies
- **SPA Fallback:** Rewrites all client-side routes (`/(.*)`) to `/index.html`

> **Render Backend Reminder:** Set `FRONTEND_ORIGINS` and `APP_BASE_URL` on Render to your deployed Vercel URL (e.g., `https://your-app.vercel.app`).

---

## 📚 Documentation & Prototype

- **System Design & API Contracts:** Browse the [`docs/`](./docs) folder for architecture specs, database schemas, and the Myanmar/English i18n plan.
- **Interactive Prototype:** Open [`docs/prototype/index.html`](./docs/prototype/index.html) directly in a browser for a zero-build static UI preview.
