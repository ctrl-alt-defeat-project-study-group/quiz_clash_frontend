/* ==========================================================================
   QuizClash FastAPI Service Client
   Base URL configured via VITE_API_BASE_URL (default: http://localhost:8000/api/v1)
   Uses httpOnly cookie authentication (credentials: 'include') + auto-refresh.
   ========================================================================== */

import type {
  AppLanguage,
  ApiAccountReset,
  ApiAdminQuizSummary,
  ApiAdminStats,
  ApiAnswerSubmission,
  ApiAttemptResponse,
  ApiAttemptSummary,
  ApiLiveGameState,
  ApiLiveJoinResponse,
  ApiLiveNextResponse,
  ApiMessage,
  ApiQuizPreviewResponse,
  ApiQuizResponse,
  ApiQuizSummary,
  ApiQuizUpdatePayload,
  ApiUserSettings,
  ExportFormat,
  ExportKind,
  UserProfile
} from '../types/quiz';

const configuredApiUrl = (
  import.meta.env.VITE_API_BASE_URL || 'https://quizclash-api-rg3m.onrender.com/api/v1'
).replace(/\/+$/, '');

// Route remote HTTPS API calls through same-origin /api/v1 when using Vite dev proxy
// or Vercel rewrites (set VITE_USE_DIRECT_API=true to bypass the same-origin proxy).
const useSameOriginProxy =
  import.meta.env.VITE_USE_DIRECT_API !== 'true' &&
  import.meta.env.VITE_USE_DEV_PROXY !== 'false' &&
  /^https?:\/\//i.test(configuredApiUrl) &&
  !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(configuredApiUrl);

export const API_BASE_URL = useSameOriginProxy ? '/api/v1' : configuredApiUrl;

function resolveWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL.replace(/\/+$/, '');
  }
  // In Vite dev mode, proxy WebSockets through the local Vite server;
  // in production (e.g. Vercel), connect directly to the Render backend wss:// URL.
  if (import.meta.env.DEV && API_BASE_URL.startsWith('/')) {
    if (typeof window !== 'undefined') {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${window.location.host}${API_BASE_URL}`;
    }
  }
  return configuredApiUrl
    .replace(/^https:\/\//i, 'wss://')
    .replace(/^http:\/\//i, 'ws://');
}

export const WS_BASE_URL = resolveWsBaseUrl();

export class ApiError extends Error {
  status: number;
  code?: string;
  localizedMessage?: { en?: string; mm?: string };

  constructor(options: {
    status: number;
    message: string;
    code?: string;
    localizedMessage?: { en?: string; mm?: string };
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.localizedMessage = options.localizedMessage;
  }
}

let unauthorizedListener: (() => void) | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setOnUnauthorized(listener: (() => void) | null): void {
  unauthorizedListener = listener;
}

function buildHeaders(
  language?: AppLanguage,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  if (language) {
    headers['Accept-Language'] = language;
  }
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let code: string | undefined;
  let message = `Request failed with status ${response.status}`;
  let localizedMessage: { en?: string; mm?: string } | undefined;

  try {
    const data = await response.json();
    const detail = data?.detail;

    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      code = 'VALIDATION_ERROR';
      message = detail
        .map((d: { msg?: string }) => d.msg || JSON.stringify(d))
        .join('; ');
    } else if (detail && typeof detail === 'object') {
      if (typeof detail.code === 'string') code = detail.code;
      if (typeof detail.message === 'string') message = detail.message;
      if (
        typeof detail.message_en === 'string' ||
        typeof detail.message_mm === 'string'
      ) {
        localizedMessage = {
          en: typeof detail.message_en === 'string' ? detail.message_en : undefined,
          mm: typeof detail.message_mm === 'string' ? detail.message_mm : undefined
        };
      }
    }

    if (!code && typeof data?.code === 'string') {
      code = data.code;
    }
    if (
      !localizedMessage &&
      (typeof data?.message_en === 'string' || typeof data?.message_mm === 'string')
    ) {
      localizedMessage = {
        en: typeof data.message_en === 'string' ? data.message_en : undefined,
        mm: typeof data.message_mm === 'string' ? data.message_mm : undefined
      };
    }
  } catch {
    /* Non-JSON response: fall back cleanly to HTTP status */
  }

  return new ApiError({
    status: response.status,
    code,
    message,
    localizedMessage
  });
}

const NO_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password'
]);

async function tryRefreshTokens(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

interface RequestOptions {
  method?: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  language?: AppLanguage;
  skipRefresh?: boolean;
}

async function rawFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const { body, headers, language, skipRefresh, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders = buildHeaders(language, {
    ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(headers || {})
  });

  const doFetch = () =>
    fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...rest,
      body,
      headers: finalHeaders
    });

  let res = await doFetch();

  if (
    res.status === 401 &&
    !skipRefresh &&
    !NO_REFRESH_PATHS.has(path.split('?')[0])
  ) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      res = await doFetch();
    } else if (unauthorizedListener) {
      unauthorizedListener();
    }
  }

  return res;
}

async function apiJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await rawFetch(path, options);
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

/* --------------------------------------------------------------------------
   Health
   -------------------------------------------------------------------------- */

export async function checkHealth(): Promise<{ status: string; service: string }> {
  return apiJson('/health', { skipRefresh: true });
}

/* --------------------------------------------------------------------------
   Auth
   -------------------------------------------------------------------------- */

export async function register(params: {
  email: string;
  password: string;
  display_name: string;
  language?: AppLanguage;
}): Promise<UserProfile> {
  return apiJson<UserProfile>('/auth/register', {
    method: 'POST',
    language: params.language,
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      display_name: params.display_name
    })
  });
}

export async function verifyEmail(
  token: string,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>('/auth/verify-email', {
    method: 'POST',
    language,
    body: JSON.stringify({ token })
  });
}

export async function resendVerification(
  email: string,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>('/auth/resend-verification', {
    method: 'POST',
    language,
    body: JSON.stringify({ email })
  });
}

export async function login(params: {
  email: string;
  password: string;
  language?: AppLanguage;
}): Promise<UserProfile> {
  return apiJson<UserProfile>('/auth/login', {
    method: 'POST',
    language: params.language,
    body: JSON.stringify({
      email: params.email,
      password: params.password
    })
  });
}

export async function googleAuth(params: {
  credential: string;
  language?: AppLanguage;
}): Promise<UserProfile> {
  return apiJson<UserProfile>('/auth/google', {
    method: 'POST',
    language: params.language,
    body: JSON.stringify({
      credential: params.credential,
      id_token: params.credential
    })
  });
}

export function getGoogleOAuthRedirectUrl(redirectPath = '/dashboard'): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = `${origin}${redirectPath}`;
  return `${API_BASE_URL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function refreshSession(language?: AppLanguage): Promise<UserProfile> {
  return apiJson<UserProfile>('/auth/refresh', {
    method: 'POST',
    language,
    skipRefresh: true
  });
}

export async function logout(language?: AppLanguage): Promise<ApiMessage> {
  return apiJson<ApiMessage>('/auth/logout', {
    method: 'POST',
    language,
    skipRefresh: true
  });
}

export async function getMe(language?: AppLanguage): Promise<UserProfile> {
  return apiJson<UserProfile>('/auth/me', { language });
}

export async function forgotPassword(
  email: string,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>('/auth/forgot-password', {
    method: 'POST',
    language,
    body: JSON.stringify({ email })
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>('/auth/reset-password', {
    method: 'POST',
    language,
    body: JSON.stringify({ token, new_password: newPassword })
  });
}

/* --------------------------------------------------------------------------
   Quizzes
   -------------------------------------------------------------------------- */

export async function listQuizzes(language?: AppLanguage): Promise<ApiQuizSummary[]> {
  return apiJson<ApiQuizSummary[]>('/quizzes', { language });
}

export async function createQuizFromFile(params: {
  file: File;
  title?: string;
  category?: string;
  questionCount?: number;
  useLlm?: boolean;
  language?: AppLanguage;
}): Promise<ApiQuizResponse> {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.title) formData.append('title', params.title);
  if (params.category) formData.append('category', params.category);
  if (params.questionCount) {
    formData.append('question_count', String(params.questionCount));
  }
  if (params.useLlm !== undefined) formData.append('use_llm', String(params.useLlm));
  if (params.language) formData.append('language', params.language);

  return apiJson<ApiQuizResponse>('/quizzes', {
    method: 'POST',
    language: params.language,
    body: formData
  });
}

export async function getQuiz(
  quizId: string,
  language?: AppLanguage
): Promise<ApiQuizResponse> {
  return apiJson<ApiQuizResponse>(`/quizzes/${encodeURIComponent(quizId)}`, {
    language
  });
}

export async function getQuizPreview(
  quizId: string,
  language?: AppLanguage
): Promise<ApiQuizPreviewResponse> {
  return apiJson<ApiQuizPreviewResponse>(
    `/quizzes/${encodeURIComponent(quizId)}/preview`,
    { language }
  );
}

export async function updateQuiz(
  quizId: string,
  payload: ApiQuizUpdatePayload,
  language?: AppLanguage
): Promise<ApiQuizPreviewResponse> {
  return apiJson<ApiQuizPreviewResponse>(`/quizzes/${encodeURIComponent(quizId)}`, {
    method: 'PATCH',
    language,
    body: JSON.stringify(payload)
  });
}

export function getQuizExportUrl(
  quizId: string,
  kind: ExportKind,
  format: ExportFormat = 'pdf',
  language?: AppLanguage
): string {
  const params = new URLSearchParams({
    kind,
    format
  });
  if (language) params.set('lang', language);
  return `${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/exports?${params.toString()}`;
}

export async function downloadQuizExport(
  quizId: string,
  kind: ExportKind,
  format: ExportFormat,
  title: string,
  language?: AppLanguage
): Promise<void> {
  const params = new URLSearchParams({ kind, format });
  if (language) params.set('lang', language);

  const res = await rawFetch(
    `/quizzes/${encodeURIComponent(quizId)}/exports?${params.toString()}`,
    { language }
  );
  if (!res.ok) throw await parseError(res);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = title.replace(/[^a-z0-9_-]+/gi, '_') || 'quiz';
  const ext = format === 'word' ? 'docx' : 'pdf';
  a.download = `quiz_${kind}_${safeTitle}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadQuizPdf(
  quizId: string,
  kind: ExportKind,
  title: string,
  language?: AppLanguage
): Promise<void> {
  return downloadQuizExport(quizId, kind, 'pdf', title, language);
}

/* --------------------------------------------------------------------------
   Attempts
   -------------------------------------------------------------------------- */

export async function submitAttempt(
  quizId: string,
  answers: ApiAnswerSubmission[],
  options?: { durationSeconds?: number; language?: AppLanguage }
): Promise<ApiAttemptResponse> {
  const body: { answers: ApiAnswerSubmission[]; duration_seconds?: number } = {
    answers
  };
  if (typeof options?.durationSeconds === 'number') {
    body.duration_seconds = Math.max(0, Math.round(options.durationSeconds));
  }

  return apiJson<ApiAttemptResponse>(
    `/quizzes/${encodeURIComponent(quizId)}/attempts`,
    {
      method: 'POST',
      language: options?.language,
      body: JSON.stringify(body)
    }
  );
}

export async function listAttempts(
  language?: AppLanguage
): Promise<ApiAttemptSummary[]> {
  return apiJson<ApiAttemptSummary[]>('/attempts', { language });
}

export async function getAttempt(
  attemptId: string,
  language?: AppLanguage
): Promise<ApiAttemptResponse> {
  return apiJson<ApiAttemptResponse>(`/attempts/${encodeURIComponent(attemptId)}`, {
    language
  });
}

/* --------------------------------------------------------------------------
   Live Game Rooms
   -------------------------------------------------------------------------- */

export async function createLiveRoom(params: {
  quizId: string;
  timerSeconds?: number;
  language?: AppLanguage;
}): Promise<ApiLiveGameState> {
  return apiJson<ApiLiveGameState>('/live/rooms', {
    method: 'POST',
    language: params.language,
    body: JSON.stringify({
      quiz_id: params.quizId,
      timer_seconds: params.timerSeconds ?? 20
    })
  });
}

export async function getLiveRoom(
  pin: string,
  language?: AppLanguage
): Promise<ApiLiveGameState> {
  const cleanPin = pin.replace(/\s+/g, '');
  return apiJson<ApiLiveGameState>(`/live/rooms/${encodeURIComponent(cleanPin)}`, {
    language
  });
}

export async function joinLiveRoom(
  pin: string,
  displayName: string,
  language?: AppLanguage
): Promise<ApiLiveJoinResponse> {
  const cleanPin = pin.replace(/\s+/g, '');
  return apiJson<ApiLiveJoinResponse>(
    `/live/rooms/${encodeURIComponent(cleanPin)}/join`,
    {
      method: 'POST',
      language,
      body: JSON.stringify({ display_name: displayName })
    }
  );
}

export async function advanceLiveRoom(
  pin: string,
  language?: AppLanguage
): Promise<ApiLiveNextResponse> {
  const cleanPin = pin.replace(/\s+/g, '');
  return apiJson<ApiLiveNextResponse>(
    `/live/rooms/${encodeURIComponent(cleanPin)}/next`,
    {
      method: 'POST',
      language
    }
  );
}

export function getLiveRoomWsUrl(
  pin: string,
  opts?: { playerId?: string; displayName?: string }
): string {
  const cleanPin = pin.replace(/\s+/g, '');
  const params = new URLSearchParams();
  if (opts?.playerId) params.set('player_id', opts.playerId);
  else if (opts?.displayName) params.set('display_name', opts.displayName);
  const qs = params.toString();
  return `${WS_BASE_URL}/live/rooms/${encodeURIComponent(cleanPin)}/ws${qs ? `?${qs}` : ''}`;
}

/* --------------------------------------------------------------------------
   Settings & Account
   -------------------------------------------------------------------------- */

export async function getSettings(language?: AppLanguage): Promise<ApiUserSettings> {
  return apiJson<ApiUserSettings>('/settings', { language });
}

export async function updateSettings(
  partial: Partial<ApiUserSettings>,
  language?: AppLanguage
): Promise<ApiUserSettings> {
  return apiJson<ApiUserSettings>('/settings', {
    method: 'PATCH',
    language,
    body: JSON.stringify(partial)
  });
}

export async function exportAccountData(
  language?: AppLanguage
): Promise<Record<string, unknown>> {
  return apiJson<Record<string, unknown>>('/account/export', { language });
}

export async function deleteAccountData(
  language?: AppLanguage
): Promise<ApiAccountReset> {
  return apiJson<ApiAccountReset>('/account', {
    method: 'DELETE',
    language
  });
}

/* --------------------------------------------------------------------------
   Admin (role: admin only)
   -------------------------------------------------------------------------- */

export async function getAdminStats(language?: AppLanguage): Promise<ApiAdminStats> {
  return apiJson<ApiAdminStats>('/admin/stats', { language });
}

export async function listAdminUsers(
  query?: string,
  language?: AppLanguage
): Promise<UserProfile[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiJson<UserProfile[]>(`/admin/users${qs}`, { language });
}

export async function updateAdminUser(
  userId: number,
  payload: { role?: 'user' | 'admin'; is_active?: boolean },
  language?: AppLanguage
): Promise<UserProfile> {
  return apiJson<UserProfile>(`/admin/users/${userId}`, {
    method: 'PATCH',
    language,
    body: JSON.stringify(payload)
  });
}

export async function deleteAdminUser(
  userId: number,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>(`/admin/users/${userId}`, {
    method: 'DELETE',
    language
  });
}

export async function listAdminQuizzes(
  language?: AppLanguage
): Promise<ApiAdminQuizSummary[]> {
  return apiJson<ApiAdminQuizSummary[]>('/admin/quizzes', { language });
}

export async function deleteAdminQuiz(
  quizId: string,
  language?: AppLanguage
): Promise<ApiMessage> {
  return apiJson<ApiMessage>(`/admin/quizzes/${encodeURIComponent(quizId)}`, {
    method: 'DELETE',
    language
  });
}
