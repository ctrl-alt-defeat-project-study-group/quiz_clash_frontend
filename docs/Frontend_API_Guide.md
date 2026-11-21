# QuizClash — Frontend API Guide

What data the frontend can get from the backend, and how to get it.
Generated from the actual code (`app/api/routes/*`, `app/schemas/*`) and the live OpenAPI spec.

> Interactive docs (always up to date): `http://localhost:8000/docs` (Swagger) and `/redoc`.
> Raw spec: `http://localhost:8000/openapi.json`.
> Older design notes: [Backend_API_Data_Contract.md](./Backend_API_Data_Contract.md).

---

## 1. Basics

| Item | Value |
|---|---|
| Base URL | `http://localhost:8000/api/v1` |
| WebSocket base | `ws://localhost:8000/api/v1` |
| Format | JSON (except file upload = `multipart/form-data`, export = file download) |
| Auth | **httpOnly cookies** (`qc_access_token` 15 min, `qc_refresh_token` 7 days) |
| CORS origins | `http://localhost:5173`, `http://localhost:3000` (env `FRONTEND_ORIGINS`) |
| Max upload | 10 MB (`MAX_UPLOAD_SIZE_MB`) |

### 1.1 Always send cookies
The token is stored in an httpOnly cookie, so JS can't read it. Every `fetch` must include credentials:

```ts
const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function api<T>(path: string, init: RequestInit = {}, lang: "en" | "mm" = "en"): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",                       // REQUIRED for auth cookies
    ...init,
    headers: {
      "Accept-Language": lang,
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw await res.json().catch(() => ({ detail: { code: "SERVER_ERROR" } }));
  return res.json();
}
```

### 1.2 CSRF
State-changing requests (POST/PATCH/DELETE) are checked by `Origin`/`Referer`. Browsers add this automatically from an allowed origin — nothing to do, but calls from a non-allowed origin get `403 FORBIDDEN`.

### 1.3 Language
- `Accept-Language: en` or `mm` (`my` is accepted as an alias).
- Upload form field `language` and export query `lang` use `en` | `mm`.
- Canonical Myanmar code is **`mm`**.

### 1.4 Session lifecycle
1. `POST /auth/login` sets both cookies.
2. When a request returns `401 UNAUTHORIZED` (access token expired), call `POST /auth/refresh` once, then retry.
3. If refresh also fails → send the user to the login page.
4. `POST /auth/logout` clears cookies.

---

## 2. Errors

All errors have the same shape:

```json
{ "detail": { "code": "QUIZ_NOT_FOUND", "message": "Quiz not found" } }
```

Switch on `detail.code` (translate it yourself); `message` is English, for debugging only.

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Bad request body/params (message lists the fields) |
| `UNAUTHORIZED` | 401 | Not logged in / token expired |
| `EMAIL_NOT_VERIFIED` | 403 | Login blocked until email verified |
| `ACCOUNT_DISABLED` | 403 | Account deactivated by admin |
| `FORBIDDEN` | 403 | Not owner/admin, or CSRF origin check failed |
| `QUIZ_NOT_FOUND` / `ATTEMPT_NOT_FOUND` / `ROOM_NOT_FOUND` | 404 | Resource missing |
| `INVALID_ROOM_PIN` | 400 | PIN is not 6 digits |
| `UNSUPPORTED_FILE_TYPE` | 400 | Not csv/txt/pdf/docx |
| `FILE_TOO_LARGE` | 413 | Over upload limit |
| `EMPTY_FILE` | 400 | No readable text |
| `GENERATION_FAILED` / `EXPORT_FAILED` | 500 | Quiz generation / export failed |
| `RATE_LIMITED` | 429 | Too many auth attempts |
| `SERVER_ERROR` | 500 | Unhandled error |

---

## 3. Endpoint overview

Auth column: 🌐 public · 🔐 logged-in user · 👑 admin · 🌐/🔐 optional login.

| Area | Method & path | Auth | Returns |
|---|---|---|---|
| Health | `GET /health` | 🌐 | `{status, service}` |
| Auth | `POST /auth/register` | 🌐 | `UserProfile` (201) |
| | `POST /auth/verify-email` | 🌐 | `Message` |
| | `POST /auth/resend-verification` | 🌐 | `Message` |
| | `POST /auth/login` | 🌐 | `UserProfile` + sets cookies |
| | `POST /auth/refresh` | cookie | `UserProfile` + new cookies |
| | `POST /auth/logout` | 🌐 | `Message` |
| | `GET /auth/me` | 🔐 | `UserProfile` |
| | `POST /auth/forgot-password` | 🌐 | `Message` |
| | `POST /auth/reset-password` | 🌐 | `Message` |
| Quizzes | `GET /quizzes` | 🔐 | `QuizSummary[]` |
| | `POST /quizzes` (multipart) | 🔐 | `Quiz` (201) |
| | `GET /quizzes/{id}` | 🔐 | `Quiz` (**no** answers) |
| | `GET /quizzes/{id}/preview` | 🔐 | `QuizPreview` (**with** answers) |
| | `PATCH /quizzes/{id}` | 🔐 owner | `QuizPreview` |
| | `GET /quizzes/{id}/exports?kind&format&lang` | 🔐 | file download |
| Attempts | `POST /quizzes/{id}/attempts` | 🔐 | `Attempt` (201) |
| | `GET /attempts` | 🔐 | `AttemptSummary[]` |
| | `GET /attempts/{id}` | 🔐 | `Attempt` |
| Live | `POST /live/rooms` | 🔐 host | `LiveGameState` (201) |
| | `GET /live/rooms/{pin}` | 🌐 | `LiveGameState` |
| | `POST /live/rooms/{pin}/join` | 🌐/🔐 | `LiveJoinResponse` |
| | `POST /live/rooms/{pin}/next` | 🔐 host | `LiveNextResponse` |
| | `WS /live/rooms/{pin}/ws` | 🌐 | real-time events (§6) |
| Settings | `GET /settings`, `PATCH /settings` | 🔐 | `UserSettings` |
| | `GET /account/export` | 🔐 | `AccountExport` |
| | `DELETE /account` | 🔐 | `AccountReset` |
| Admin | `GET /admin/users?q=` | 👑 | `UserProfile[]` |
| | `PATCH /admin/users/{id}` | 👑 | `UserProfile` |
| | `DELETE /admin/users/{id}` | 👑 | `Message` |
| | `GET /admin/quizzes` | 👑 | `AdminQuizSummary[]` |
| | `DELETE /admin/quizzes/{id}` | 👑 | `Message` |
| | `GET /admin/stats` | 👑 | `AdminStats` |

> Non-admins only see/modify **their own** quizzes and attempts (`403 FORBIDDEN` otherwise).

---

## 4. Data shapes (TypeScript)

```ts
type Lang = "en" | "mm";

interface UserProfile {
  id: number; email: string; display_name: string;
  role: "user" | "admin"; is_active: boolean;
  email_verified_at: string | null;           // ISO datetime
}
interface Message { message: string }

// ---- Quizzes
interface Choice        { id: "a"|"b"|"c"|"d"; text: string; position: number }   // 0-3
interface ChoicePreview extends Choice { is_correct: boolean }
interface Question        { id: string; prompt: string; position: number; choices: Choice[] }
interface QuestionPreview { id: string; prompt: string; position: number; explanation: string | null; choices: ChoicePreview[] }

interface QuizSummary {            // GET /quizzes
  id: string; title: string; category: string | null; source_filename: string | null;
  question_count: number; last_score: number | null; updated_at: string;
}
interface Quiz {                   // GET /quizzes/{id}, POST /quizzes
  id: string;                      // "quiz_12"
  title: string; category: string | null;
  source_type: "csv"|"txt"|"pdf"|"docx"|"structured"|"llm";
  source_filename: string | null; status: string;
  created_at: string; updated_at: string;
  questions: Question[];           // NO is_correct here (use preview / attempt result)
}
interface QuizPreview extends Omit<Quiz, "questions"> { questions: QuestionPreview[] }

// ---- Attempts
interface AttemptSummary {
  id: string;                      // "att_5"
  quiz_id: string; quiz_title: string; score: number; total_questions: number;
  percentage: number; duration_seconds: number | null; completed_at: string;
}
interface QuestionResult {
  question_id: string; question_prompt: string;
  selected_choice_id: string; selected_choice_text: string;
  correct_choice_id: string; correct_choice_text: string;
  explanation: string | null; is_correct: boolean;
}
interface Attempt extends AttemptSummary { questions: QuestionResult[] }

// ---- Settings
interface UserSettings {
  display_name: string; email: string;
  theme: "light"|"dark"|"system"; ui_language: Lang;
  default_questions: 5|10|15|20;
  difficulty: "Mixed"|"Foundational"|"Advanced";
  quiz_language: string;
  shuffle_questions: boolean; show_explanations: boolean;
  study_reminders: boolean; weekly_summary: boolean;
}

// ---- Live
interface LivePlayer { id: string; name: string; status: "Ready"|"Answered"; correct: number; total: number; points: number }
interface LiveGameState {
  pin: string; quiz_id: string; timer_seconds: number;
  round: number; total_rounds: number;
  status: "lobby"|"active"|"finished"|"closed";
  players: LivePlayer[];
}
interface LiveQuestion { id: string; prompt: string; position: number; choices: Choice[] }  // no answers
interface LiveJoinResponse extends LiveGameState { player_id: string }
interface LiveNextResponse extends LiveGameState { current_question: LiveQuestion | null }

// ---- Admin
interface AdminQuizSummary { id: string; title: string; owner_id: number|null; owner_email: string|null;
  source_type: string; status: string; question_count: number; created_at: string }
interface AdminStats { total_users: number; active_users: number; verified_users: number;
  admin_users: number; total_quizzes: number; total_attempts: number }
```

---

## 5. How to use each area

### 5.1 Auth

```ts
// Register  -> user must verify email before login
await api("/auth/register", { method: "POST",
  body: JSON.stringify({ email, password, display_name }) });

// Verify (token comes from the emailed link; in dev it is printed in the backend console)
await api("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });

// Login (sets cookies) -> returns the user
const me = await api<UserProfile>("/auth/login", { method: "POST",
  body: JSON.stringify({ email, password }) });

// Restore session on page load
const me2 = await api<UserProfile>("/auth/me");      // 401 => show login

await api("/auth/logout", { method: "POST" });
```
Forgot password: `POST /auth/forgot-password {email}` → user gets token → `POST /auth/reset-password {token, new_password}`.
Login/register/forgot/resend are rate limited (`429 RATE_LIMITED`).

### 5.2 Create a quiz from a file

```ts
const fd = new FormData();
fd.append("file", file);                 // required: .csv .txt .pdf .docx
fd.append("title", "Cell structure");    // optional
fd.append("category", "Biology");        // optional
fd.append("question_count", "10");       // optional (5/10/15/20)
fd.append("use_llm", "false");           // optional "true"|"false"
fd.append("language", "en");             // optional "en"|"mm"

const quiz = await api<Quiz>("/quizzes", { method: "POST", body: fd });
// Do NOT set Content-Type manually for FormData.
```

### 5.3 List, read, edit quizzes

```ts
const list    = await api<QuizSummary[]>("/quizzes");             // dashboard
const quiz    = await api<Quiz>(`/quizzes/${id}`);                // play screen (hides answers)
const preview = await api<QuizPreview>(`/quizzes/${id}/preview`); // review/edit screen (shows answers)

// Edit: send only the fields to change. If you send `questions` it replaces ALL questions.
await api<QuizPreview>(`/quizzes/${id}`, { method: "PATCH",
  body: JSON.stringify({ title: "New title", category: "Bio" }) });
```
Question rules (validated, `422` otherwise): exactly **4 choices**, exactly **1 `is_correct`**, non-empty text, choice `position` 0–3.

### 5.4 Export a quiz (file download)

`GET /quizzes/{id}/exports?kind=questions|answers&format=pdf|word&lang=en|mm`

Needs cookies, so use `fetch` + blob (a plain `<a href>` works too when same-site cookies are sent):

```ts
const res = await fetch(`${API}/quizzes/${id}/exports?kind=questions&format=pdf&lang=mm`,
  { credentials: "include" });
const blob = await res.blob();
const url = URL.createObjectURL(blob);   // then trigger download via <a download>
```

### 5.5 Solo play → attempt result

```ts
const attempt = await api<Attempt>(`/quizzes/${id}/attempts`, { method: "POST",
  body: JSON.stringify({
    duration_seconds: 84,                         // optional
    answers: [{ question_id: "q_1", choice_id: "b" }, /* ... */],
  }) });
// attempt.questions[] now contains correct answers + explanations -> results screen.

const history = await api<AttemptSummary[]>("/attempts");      // history screen
const detail  = await api<Attempt>(`/attempts/${attemptId}`);  // review a past attempt
```
Grading is server-side only.

### 5.6 Settings & account

```ts
const s = await api<UserSettings>("/settings");
await api<UserSettings>("/settings", { method: "PATCH",
  body: JSON.stringify({ theme: "dark", default_questions: 15 }) });   // partial update

const data = await api("/account/export");        // JSON dump of account, settings, quizzes, attempts
await api("/account", { method: "DELETE" });      // wipes quizzes/attempts/rooms (AccountReset counts)
```

### 5.7 Admin (role `admin` only)
```ts
await api<AdminStats>("/admin/stats");
await api<UserProfile[]>("/admin/users?q=alice");
await api("/admin/users/3", { method: "PATCH", body: JSON.stringify({ role: "admin", is_active: true }) });
await api("/admin/quizzes");                      // all quizzes with owner
await api("/admin/quizzes/quiz_7", { method: "DELETE" });
```

---

## 6. Live game rooms

PIN is 6 digits; `"482 619"`, `"482-619"` and `"482619"` are all accepted. Responses return `pin` formatted as `"482 619"`.

### 6.1 REST flow
```ts
// HOST (logged in)
const room = await api<LiveGameState>("/live/rooms", { method: "POST",
  body: JSON.stringify({ quiz_id: "quiz_3", timer_seconds: 20 }) });   // 5-120 s, default 20

// PLAYER (guest OK, display name only)
const joined = await api<LiveJoinResponse>(`/live/rooms/${pin}/join`, { method: "POST",
  body: JSON.stringify({ display_name: "Aye" }) });                     // keep joined.player_id

// Lobby / leaderboard snapshot
const state = await api<LiveGameState>(`/live/rooms/${pin}`);

// HOST starts / advances rounds. 1st call starts round 1; after the last round => finished
const next = await api<LiveNextResponse>(`/live/rooms/${pin}/next`, { method: "POST" });
```

### 6.2 WebSocket
`ws://localhost:8000/api/v1/live/rooms/{pin}/ws?player_id=<id>` (or `?display_name=Aye` to auto-join).

**Client → server**

| Message | Purpose |
|---|---|
| `{"type":"ping"}` | keep-alive → `{"type":"pong"}` |
| `{"type":"join","display_name":"Aye"}` | join over WS → `joined` |
| `{"type":"answer","choice_id":"b","player_id":"..."}` | answer the current round (`player_id` optional if already bound) |

**Server → client** (all include `state: LiveGameState` unless noted)

| `type` | When | Extra fields |
|---|---|---|
| `room_state` | right after connect | `player_id?`, `question?` |
| `joined` | after your `join` | `player_id` |
| `player_joined` | someone joined | `player` |
| `question` | host called `/next` | `round`, `total_rounds`, `timer_seconds`, `question` |
| `answer_result` | only to the answerer | `is_correct`, `correct_choice_id`, `points_earned`, `total_points`, `round` |
| `leaderboard` | after any answer | — |
| `round_ended` | timer expired | `round`, `correct_choice_id` |
| `game_finished` | no more questions | — |
| `error` | bad input | `code`, `message` (no `state`) |

Scoring: correct = `BASE_POINTS` + up to **500** latency bonus (faster = more). Each player can answer once per round; late answers are rejected.
Close codes: `4400` invalid PIN, `4404` room not found.

```ts
const ws = new WebSocket(`ws://localhost:8000/api/v1/live/rooms/${pin}/ws?player_id=${playerId}`);
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  switch (msg.type) {
    case "question":     showQuestion(msg.question, msg.timer_seconds); break;
    case "answer_result": showFeedback(msg); break;
    case "leaderboard":
    case "round_ended":
    case "game_finished": setState(msg.state); break;
  }
};
ws.send(JSON.stringify({ type: "answer", choice_id: "b" }));
```

---

## 7. Common pitfalls
- Forgot `credentials: "include"` → every protected call returns `401`.
- Setting `Content-Type` on `FormData` → upload breaks (let the browser set the boundary).
- Using `GET /quizzes/{id}` to show answers — it hides `is_correct`; use `/preview` (owner) or the attempt result.
- Frontend origin not in `FRONTEND_ORIGINS` → CORS/CSRF `403`. Add it to `.env`.
- Access token lives 15 min → implement the refresh-and-retry flow (§1.4).
- Live rooms are held in server memory; a backend restart restores room metadata from DB but connected sockets must reconnect.
