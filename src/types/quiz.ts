/* ==========================================================================
   QuizClash TypeScript Domain & Backend API Models
   Matches docs/Frontend_API_Guide.md (/api/v1/*)
   ========================================================================== */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type AppLanguage = 'en' | 'mm';
export type ExportFormat = 'pdf' | 'word';
export type ExportKind = 'questions' | 'answers';

/* --------------------------------------------------------------------------
   Backend API Schemas (/api/v1/*)
   -------------------------------------------------------------------------- */

export interface ApiMessage {
  message: string;
}

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified_at: string | null; // ISO datetime
}

export type ChoiceLetter = 'a' | 'b' | 'c' | 'd';

export interface ApiChoice {
  id: ChoiceLetter | string;
  text: string;
  position: number; // 0-3
  is_correct?: boolean;
}

export interface ApiChoicePreview extends ApiChoice {
  is_correct: boolean;
}

export interface ApiQuestion {
  id: string; // e.g. 'q_1'
  prompt: string;
  position: number;
  explanation?: string | null;
  choices: ApiChoice[];
}

export interface ApiQuestionPreview {
  id: string;
  prompt: string;
  position: number;
  explanation: string | null;
  choices: ApiChoicePreview[];
}

export interface ApiQuizSummary {
  id: string;
  title: string;
  category: string | null;
  source_filename: string | null;
  question_count: number;
  last_score: number | null;
  updated_at: string;
}

export interface ApiQuizResponse {
  id: string; // e.g. 'quiz_12'
  title: string;
  category: string | null;
  source_type: 'csv' | 'txt' | 'pdf' | 'docx' | 'structured' | 'llm' | string;
  source_filename: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  questions: ApiQuestion[];
}

export interface ApiQuizPreviewResponse extends Omit<ApiQuizResponse, 'questions'> {
  questions: ApiQuestionPreview[];
}

export interface ApiQuizUpdatePayload {
  title?: string;
  category?: string | null;
  questions?: {
    prompt: string;
    position: number;
    explanation?: string | null;
    choices: { text: string; position: number; is_correct: boolean }[];
  }[];
}

export interface ApiAnswerSubmission {
  question_id: string;
  choice_id: string;
}

export interface ApiAttemptSummary {
  id: string; // e.g. 'att_5'
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  duration_seconds: number | null;
  completed_at: string;
}

export interface ApiQuestionResult {
  question_id: string;
  question_prompt: string;
  selected_choice_id: string;
  selected_choice_text: string;
  correct_choice_id: string;
  correct_choice_text: string;
  explanation: string | null;
  is_correct: boolean;
}

export interface ApiAttemptResponse extends ApiAttemptSummary {
  questions: ApiQuestionResult[];
}

export interface ApiUserSettings {
  display_name: string;
  email: string;
  theme: ThemeMode;
  ui_language: AppLanguage;
  default_questions: 5 | 10 | 15 | 20 | number;
  difficulty: 'Mixed' | 'Foundational' | 'Advanced' | string;
  quiz_language: string;
  shuffle_questions: boolean;
  show_explanations: boolean;
  study_reminders: boolean;
  weekly_summary: boolean;
}

export interface ApiAccountReset {
  message?: string;
  deleted_quizzes?: number;
  deleted_attempts?: number;
  deleted_rooms?: number;
  [key: string]: unknown;
}

export interface ApiLivePlayer {
  id: string;
  name: string;
  status: 'Ready' | 'Answered' | string;
  correct: number;
  total: number;
  points: number;
}

export type ApiLiveRoomStatus = 'lobby' | 'active' | 'finished' | 'closed';

export interface ApiLiveGameState {
  pin: string;
  quiz_id: string;
  timer_seconds: number;
  round: number;
  total_rounds: number;
  status: ApiLiveRoomStatus;
  players: ApiLivePlayer[];
}

export interface ApiLiveQuestion {
  id: string;
  prompt: string;
  position: number;
  choices: ApiChoice[];
}

export interface ApiLiveJoinResponse extends ApiLiveGameState {
  player_id: string;
}

export interface ApiLiveNextResponse extends ApiLiveGameState {
  current_question: ApiLiveQuestion | null;
}

export interface ApiLiveAnswerResult {
  is_correct: boolean;
  correct_choice_id: string;
  points_earned: number;
  total_points: number;
  round: number;
}

export type ApiLiveWsEvent =
  | { type: 'pong' }
  | {
      type: 'room_state';
      state: ApiLiveGameState;
      player_id?: string;
      question?: ApiLiveQuestion | null;
    }
  | { type: 'joined'; state: ApiLiveGameState; player_id: string }
  | { type: 'player_joined'; state: ApiLiveGameState; player: ApiLivePlayer }
  | {
      type: 'question';
      state: ApiLiveGameState;
      round: number;
      total_rounds: number;
      timer_seconds: number;
      question: ApiLiveQuestion;
    }
  | ({ type: 'answer_result'; state?: ApiLiveGameState } & ApiLiveAnswerResult)
  | { type: 'leaderboard'; state: ApiLiveGameState }
  | {
      type: 'round_ended';
      state: ApiLiveGameState;
      round: number;
      correct_choice_id: string;
    }
  | { type: 'game_finished'; state: ApiLiveGameState }
  | { type: 'error'; code: string; message: string };

export interface ApiAdminQuizSummary {
  id: string;
  title: string;
  owner_id: number | null;
  owner_email: string | null;
  source_type: string;
  status: string;
  question_count: number;
  created_at: string;
}

export interface ApiAdminStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  admin_users: number;
  total_quizzes: number;
  total_attempts: number;
}

/* --------------------------------------------------------------------------
   Frontend Workspace Models
   -------------------------------------------------------------------------- */

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
  questionCount?: number;
  questionsLoaded?: boolean;
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
  backendId?: string;
  quizId: string;
  quizTitle: string;
  dateLabel: string;
  scorePct: number;
  correct: number;
  total: number;
  duration: string;
  deltaPts: string;
  detailsLoaded?: boolean;
  missed: MissedQuestionItem[];
  questionResults?: ApiQuestionResult[];
}

export interface LivePlayer {
  id?: string;
  name: string;
  status: string;
  correct: number;
  total: number;
  points: number;
}

export type LiveRoomStatus = 'idle' | 'hosting' | 'joined';

export interface LiveGameState {
  status: LiveRoomStatus;
  backendStatus?: ApiLiveRoomStatus;
  isLiveBackend?: boolean;
  pin: string;
  quizId: string;
  timerSeconds: number;
  round: number;
  totalRounds?: number;
  players: LivePlayer[];
  joinedPlayerName?: string;
  playerId?: string;
  currentQuestion?: ApiLiveQuestion | null;
  selectedChoiceId?: string | null;
  lastAnswerResult?: ApiLiveAnswerResult | null;
  lastRoundCorrectChoiceId?: string | null;
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
