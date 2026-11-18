/* ==========================================================================
   QuizClash / AutoQuiz FastAPI Service Client
   Base URL configured via VITE_API_BASE_URL (default: http://localhost:8000/api/v1)
   ========================================================================== */

import type {
  ApiQuizResponse,
  ApiAnswerSubmission,
  ApiAttemptResponse,
  ExportKind
} from '../types/quiz';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join('; ');
    }
  } catch {
    /* Fall back to statusText */
  }
  return `Request failed with status ${response.status}`;
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createQuizFromFile(params: {
  file: File;
  title?: string;
  questionCount?: number;
  useLlm?: boolean;
}): Promise<ApiQuizResponse> {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.title) formData.append('title', params.title);
  if (params.questionCount) formData.append('question_count', String(params.questionCount));
  if (params.useLlm !== undefined) formData.append('use_llm', String(params.useLlm));

  const res = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getQuiz(quizId: string): Promise<ApiQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getQuizPreview(quizId: string): Promise<ApiQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/preview`);
  if (!res.ok) throw new Error(await parseError(res));
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
  }
): Promise<ApiQuizResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitAttempt(
  quizId: string,
  answers: ApiAnswerSubmission[]
): Promise<ApiAttemptResponse> {
  const res = await fetch(`${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAttempt(attemptId: string): Promise<ApiAttemptResponse> {
  const res = await fetch(`${API_BASE_URL}/attempts/${encodeURIComponent(attemptId)}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function getQuizExportUrl(quizId: string, kind: ExportKind): string {
  return `${API_BASE_URL}/quizzes/${encodeURIComponent(quizId)}/exports?kind=${encodeURIComponent(kind)}`;
}

export async function downloadQuizPdf(quizId: string, kind: ExportKind, title: string): Promise<void> {
  const res = await fetch(getQuizExportUrl(quizId, kind));
  if (!res.ok) throw new Error(await parseError(res));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = title.replace(/[^a-z0-9_-]+/gi, '_');
  a.download = `quiz_${kind}_${safeTitle}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
