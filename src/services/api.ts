/* ==========================================================================
   QuizClash FastAPI Service Client
   Base URL configured via VITE_API_BASE_URL (default: http://localhost:8000/api/v1)
   ========================================================================== */

import type {
  AppLanguage,
  ApiQuizResponse,
  ApiAnswerSubmission,
  ApiAttemptResponse,
  ExportKind
} from '../types/quiz';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

function buildHeaders(
  language?: AppLanguage,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  if (language) {
    headers['Accept-Language'] = language === 'mm' ? 'my' : 'en';
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

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function createQuizFromFile(params: {
  file: File;
  title?: string;
  questionCount?: number;
  useLlm?: boolean;
  language?: AppLanguage;
}): Promise<ApiQuizResponse> {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.title) formData.append('title', params.title);
  if (params.questionCount) formData.append('question_count', String(params.questionCount));
  if (params.useLlm !== undefined) formData.append('use_llm', String(params.useLlm));
  if (params.language) formData.append('language', params.language);

  const res = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    headers: buildHeaders(params.language),
    body: formData
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function getQuiz(
  quizId: string,
  language?: AppLanguage
): Promise<ApiQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}`, {
    headers: buildHeaders(language)
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function getQuizPreview(
  quizId: string,
  language?: AppLanguage
): Promise<ApiQuizResponse> {
  const res = await fetch(
    `${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/preview`,
    { headers: buildHeaders(language) }
  );
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function updateQuiz(
  quizId: string,
  payload: {
    title: string;
    source_type: string;
    questions: {
      prompt: string;
      position: number;
      choices: { text: string; position: number; is_correct: boolean }[];
    }[];
  },
  language?: AppLanguage
): Promise<ApiQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}`, {
    method: 'PATCH',
    headers: buildHeaders(language, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function submitAttempt(
  quizId: string,
  answers: ApiAnswerSubmission[],
  language?: AppLanguage
): Promise<ApiAttemptResponse> {
  const res = await fetch(
    `${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/attempts`,
    {
      method: 'POST',
      headers: buildHeaders(language, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ answers })
    }
  );
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function getAttempt(
  attemptId: string,
  language?: AppLanguage
): Promise<ApiAttemptResponse> {
  const res = await fetch(
    `${API_BASE_URL}/attempts/${encodeURIComponent(attemptId)}`,
    { headers: buildHeaders(language) }
  );
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export function getQuizExportUrl(
  quizId: string,
  kind: ExportKind,
  language?: AppLanguage
): string {
  const langParam = language ? `&lang=${encodeURIComponent(language)}` : '';
  return `${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/exports?kind=${encodeURIComponent(kind)}${langParam}`;
}

export async function downloadQuizPdf(
  quizId: string,
  kind: ExportKind,
  title: string,
  language?: AppLanguage
): Promise<void> {
  const res = await fetch(getQuizExportUrl(quizId, kind, language), {
    headers: buildHeaders(language)
  });
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = title.replace(/[^a-z0-9_-]+/gi, '_');
  a.download = `quiz_${kind}_${safeTitle}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
