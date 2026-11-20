/* ==========================================================================
   QuizClash / QuizClash TypeScript Domain & API Models
   ========================================================================== */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type AppLanguage = 'en' | 'mm';
export type ExportFormat = 'pdf' | 'word';
export type ExportKind = 'questions' | 'answers';

/* Backend API Schemas (/api/v1/*) */
export interface ApiChoice {
  id: string; // 'a' | 'b' | 'c' | 'd'
  text: string;
  position: number;
  is_correct?: boolean;
}

export interface ApiQuestion {
  id: string; // e.g. 'q_1'
  prompt: string;
  position: number;
  choices: ApiChoice[];
}

export interface ApiQuizResponse {
  id: string; // e.g. 'quiz_1'
  title: string;
  source_type: string;
  status: string;
  created_at: string;
  questions: ApiQuestion[];
}

export interface ApiAnswerSubmission {
  question_id: string;
  choice_id: string;
}

export interface ApiQuestionResult {
  question_id: string;
  question_prompt: string;
  selected_choice_id: string;
  selected_choice_text: string;
  correct_choice_id: string;
  correct_choice_text: string;
  is_correct: boolean;
}

export interface ApiAttemptResponse {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  questions: ApiQuestionResult[];
}

/* Frontend Workspace Models */
export interface QuestionItem {
  id?: string;
  prompt: string;
  choices: [string, string, string, string] | string[];
  answer: number; // 0 | 1 | 2 | 3
  explanation?: string;
}

export interface QuizItem {
  id: string;
  backendId?: string;
  title: string;
  sidebarTitle: string;
  category: string;
  source: string;
  updated: string;
  lastScore: number;
  questions: QuestionItem[];
}

export interface MissedQuestionItem {
  number: number;
  prompt: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface AttemptRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  dateLabel: string;
  scorePct: number;
  correct: number;
  total: number;
  duration: string;
  deltaPts: string;
  missed: MissedQuestionItem[];
}

export interface LivePlayer {
  name: string;
  status: string;
  correct: number;
  total: number;
  points: number;
}

export interface LiveGameState {
  pin: string;
  quizId: string;
  timerSeconds: number;
  round: number;
  players: LivePlayer[];
}

export interface UserSettings {
  tab: 'Profile' | 'Quiz defaults' | 'Notifications' | 'Privacy & account';
  displayName: string;
  email: string;
  defaultQuestions: number;
  difficulty: string;
  language: string;
  shuffleQuestions: boolean;
  showExplanations: boolean;
  studyReminders: boolean;
  weeklySummary: boolean;
}
