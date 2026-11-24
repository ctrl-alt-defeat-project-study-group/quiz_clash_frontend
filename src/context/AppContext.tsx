/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Swal, { type SweetAlertIcon } from 'sweetalert2';
import type {
  ApiAttemptResponse,
  ApiAttemptSummary,
  ApiLiveGameState,
  ApiLiveRoomHistoryItem,
  ApiLiveWsEvent,
  ApiQuestion,
  ApiQuizPreviewResponse,
  ApiQuizResponse,
  ApiQuizSummary,
  ApiUserSettings,
  AppLanguage,
  AttemptRecord,
  ExportFormat,
  ExportKind,
  LiveGameState,
  MissedQuestionItem,
  QuestionItem,
  QuizItem,
  RegisterPendingResponse,
  ResolvedTheme,
  ThemeMode,
  UserProfile,
  UserSettings
} from '../types/quiz';
import * as api from '../services/api';
import { isValidRoomPin, normalizeRoomPin } from '../lib/roomPin';
import {
  getErrorByCode,
  getLocalizedErrorMessage,
  translate,
  type TranslationKey
} from '../i18n';

const PREFS_STORAGE_KEY = 'quiz-clash-ui-prefs';

const DEFAULT_SETTINGS: UserSettings = {
  tab: 'Profile',
  displayName: '',
  email: '',
  defaultQuestions: 10,
  difficulty: 'Mixed',
  language: 'English',
  shuffleQuestions: true,
  showExplanations: true,
  studyReminders: true,
  weeklySummary: false
};

const EMPTY_PRACTICE: PracticeState = {
  quizId: '',
  questionIndex: 0,
  questionOrder: [],
  answers: {},
  startedAt: 0
};

function buildQuestionOrder(count: number, shuffle: boolean): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  if (!shuffle || count <= 1) return order;
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

const EMPTY_LIVE: LiveGameState = {
  status: 'idle',
  pin: '',
  quizId: '',
  timerSeconds: 20,
  round: 0,
  totalRounds: 0,
  players: []
};

interface PracticeState {
  quizId: string;
  questionIndex: number;
  questionOrder: number[];
  answers: Record<number, number>;
  startedAt: number;
}

interface ModalState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

interface AppContextValue {
  user: UserProfile | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  startGoogleOAuth: (nextPath?: string, mode?: api.GoogleOAuthMode) => void;
  unlinkGoogleOAuth: () => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<RegisterPendingResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;

  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode, opts?: { persist?: boolean }) => void;
  toggleTheme: () => void;

  uiLanguage: AppLanguage;
  setUiLanguage: (lang: AppLanguage, opts?: { persist?: boolean }) => void;
  toggleUiLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getErrorMessage: (error: unknown) => string;

  quizzes: QuizItem[];
  activeQuizId: string;
  activeQuiz: QuizItem | null;
  setActiveQuizId: (id: string) => void;
  loadQuizDetails: (quizId: string, mode?: 'preview' | 'play') => Promise<void>;
  updateQuizQuestion: (quizId: string, qIndex: number, updated: Partial<QuestionItem>) => void;
  deleteQuizQuestion: (quizId: string, qIndex: number) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<boolean>;
  saveQuizChanges: (quizId: string) => Promise<void>;

  history: AttemptRecord[];
  liveHistory: ApiLiveRoomHistoryItem[];
  activeAttemptId: string;
  setActiveAttemptId: (id: string) => void;
  loadAttemptDetails: (attemptId: string) => Promise<void>;
  deleteAttempt: (attemptId: string) => Promise<void>;
  clearAllAttempts: () => Promise<void>;
  deleteLiveHistoryRoom: (roomId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;

  practice: PracticeState;
  startPractice: (quizId?: string) => void;
  resetPractice: () => void;
  selectPracticeAnswer: (questionIndex: number, choiceIndex: number) => void;
  setPracticeQuestionIndex: (index: number) => void;
  finishPractice: () => Promise<AttemptRecord | null>;

  generateQuiz: (params: {
    file: File;
    fileName: string;
    title: string;
    category?: string;
    questionCount: number;
    useLlm?: boolean;
  }) => Promise<QuizItem>;

  exportStudySheet: (
    kind: ExportKind,
    format?: ExportFormat,
    quizId?: string
  ) => Promise<void>;
  exportingKind: ExportKind | null;
  printKind: ExportKind;

  live: LiveGameState;
  setLiveQuizId: (quizId: string) => void;
  setLiveTimer: (seconds: number) => void;
  createLiveRoom: (
    quizId?: string,
    timerSeconds?: number,
    options?: { participateAsHost?: boolean }
  ) => Promise<void>;
  joinLiveRoom: (pin: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  joinAsHostPlayer: () => Promise<void>;
  leaveAsHostPlayer: () => Promise<void>;
  markLivePlayerReady: () => Promise<void>;
  closeLiveRoom: () => void;
  advanceLiveRound: () => Promise<void>;
  submitLiveAnswer: (choiceId: string) => void;

  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>, opts?: { persist?: boolean }) => void;
  saveSettingsToBackend: (
    payload: Partial<UserSettings> & { theme?: ThemeMode; uiLanguage?: AppLanguage }
  ) => Promise<void>;
  exportAccountData: () => Promise<void>;
  resetAllData: () => Promise<void>;

  toastMessage: string | null;
  showToast: (msg: string, icon?: SweetAlertIcon) => void;

  modal: ModalState;
  openModal: (opts: Omit<ModalState, 'open'>) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const swalToast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  showCloseButton: true,
  closeButtonHtml: '&times;',
  closeButtonAriaLabel: 'Close notification',
  timer: 3600,
  timerProgressBar: true,
  customClass: {
    container: 'qc-swal-toast-container',
    popup: 'qc-swal-toast',
    title: 'qc-swal-toast-title',
    closeButton: 'qc-swal-toast-close',
    timerProgressBar: 'qc-swal-toast-progress'
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

function loadStoredPrefs(): { theme?: ThemeMode; uiLanguage?: AppLanguage } | null {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDuration(seconds: number | null | undefined): string {
  const safeSec = Math.max(0, Math.round(seconds ?? 0));
  const mm = String(Math.floor(safeSec / 60)).padStart(2, '0');
  const ss = String(safeSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatShortDate(iso: string | null | undefined, fallback: string): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function mapApiQuestions(
  questions: ApiQuestion[],
  fallbackExplanation: string
): QuestionItem[] {
  return [...questions]
    .sort((a, b) => a.position - b.position)
    .map((aq) => {
      const sortedChoices = [...aq.choices].sort((a, b) => a.position - b.position);
      const correctIdx = sortedChoices.findIndex((c) => c.is_correct);
      return {
        id: aq.id,
        prompt: aq.prompt,
        choices: sortedChoices.map((c) => c.text),
        answer: correctIdx >= 0 ? correctIdx : 0,
        explanation: aq.explanation || fallbackExplanation
      };
    });
}

function mapQuizSummaryToItem(
  summary: ApiQuizSummary,
  todayLabel: string
): QuizItem {
  return {
    id: summary.id,
    backendId: summary.id,
    title: summary.title,
    sidebarTitle: summary.title,
    category: summary.category || 'Uploaded',
    source: summary.source_filename || 'Uploaded study notes',
    updated: formatShortDate(summary.updated_at, todayLabel),
    lastScore: summary.last_score ?? 0,
    questionCount: summary.question_count,
    questionsLoaded: false,
    questions: []
  };
}

function mapAttemptResponseToRecord(
  att: ApiAttemptResponse,
  prevScore: number | null,
  fallbackExplanation: string,
  justNowLabel: string
): AttemptRecord {
  const scorePct = Math.round(att.percentage);
  const diff = prevScore !== null ? scorePct - prevScore : 0;
  const deltaPts = `${diff >= 0 ? '+' : ''}${diff} pts`;

  const missed: MissedQuestionItem[] = att.questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => !q.is_correct)
    .map(({ q, idx }) => ({
      number: idx + 1,
      prompt: q.question_prompt,
      yourAnswer: q.selected_choice_text,
      correctAnswer: q.correct_choice_text,
      explanation: q.explanation || fallbackExplanation
    }));

  return {
    id: att.id,
    backendId: att.id,
    quizId: att.quiz_id,
    quizTitle: att.quiz_title,
    dateLabel: formatShortDate(att.completed_at, justNowLabel),
    scorePct,
    correct: att.score,
    total: att.total_questions,
    duration: formatDuration(att.duration_seconds),
    deltaPts,
    detailsLoaded: true,
    missed,
    questionResults: att.questions
  };
}

function mapAttemptSummariesToRecords(
  summaries: ApiAttemptSummary[],
  fallbackLabel: string
): AttemptRecord[] {
  return summaries.map((att, idx) => {
    const scorePct = Math.round(att.percentage);
    const prev = summaries.slice(idx + 1).find((s) => s.quiz_id === att.quiz_id);
    const diff = prev ? scorePct - Math.round(prev.percentage) : 0;
    const deltaPts = `${diff >= 0 ? '+' : ''}${diff} pts`;
    return {
      id: att.id,
      backendId: att.id,
      quizId: att.quiz_id,
      quizTitle: att.quiz_title,
      dateLabel: formatShortDate(att.completed_at, fallbackLabel),
      scorePct,
      correct: att.score,
      total: att.total_questions,
      duration: formatDuration(att.duration_seconds),
      deltaPts,
      detailsLoaded: false,
      missed: []
    };
  });
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedPrefs = loadStoredPrefs();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (
      storedPrefs?.theme === 'dark' ||
      storedPrefs?.theme === 'light' ||
      storedPrefs?.theme === 'system'
    ) {
      return storedPrefs.theme;
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [uiLanguage, setUiLanguageState] = useState<AppLanguage>(() => {
    if (storedPrefs?.uiLanguage === 'mm' || storedPrefs?.uiLanguage === 'en') {
      return storedPrefs.uiLanguage;
    }
    return 'en';
  });

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [liveHistory, setLiveHistory] = useState<ApiLiveRoomHistoryItem[]>([]);
  const [activeQuizId, setActiveQuizIdState] = useState<string>('');
  const [activeAttemptId, setActiveAttemptId] = useState<string>('');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [practice, setPractice] = useState<PracticeState>(EMPTY_PRACTICE);
  const [live, setLive] = useState<LiveGameState>(EMPTY_LIVE);

  const [printKind, setPrintKind] = useState<ExportKind>('questions');
  const [exportingKind, setExportingKind] = useState<ExportKind | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    message: ''
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const uiLangRef = useRef<AppLanguage>(uiLanguage);

  useEffect(() => {
    uiLangRef.current = uiLanguage;
  }, [uiLanguage]);

  const showToast = useCallback((msg: string, icon?: SweetAlertIcon) => {
    setToastMessage(msg);
    const resolvedIcon: SweetAlertIcon =
      icon ??
      (/^(appearance|preparing|proceeded|live session|switched|opening|advanced|restarted)/i.test(
        msg
      )
        ? 'info'
        : /^(error|failed)/i.test(msg)
        ? 'error'
        : 'success');

    const isMobile =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;

    void swalToast.fire({
      position: isMobile ? 'top' : 'bottom-end',
      icon: resolvedIcon,
      title: msg,
      closeButtonAriaLabel: translate(uiLangRef.current, 'toasts.closeNotificationAria')
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return translate(uiLanguage, key, params);
    },
    [uiLanguage]
  );

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      return getLocalizedErrorMessage(error, uiLanguage);
    },
    [uiLanguage]
  );

  const closeLiveSocket = useCallback(() => {
    if (pingTimerRef.current !== null) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore close errors */
      }
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      closeLiveSocket();
    };
  }, [closeLiveSocket]);

  const refreshHistory = useCallback(async () => {
    const lang = uiLangRef.current;
    const [attemptsRes, liveHistoryRes] = await Promise.allSettled([
      api.listAttempts(lang),
      api.listLiveHistory(lang)
    ]);

    if (attemptsRes.status === 'fulfilled') {
      const mappedAttempts = mapAttemptSummariesToRecords(
        attemptsRes.value,
        translate(lang, 'common.today')
      );
      setHistory(mappedAttempts);
      setActiveAttemptId((prev) => prev || mappedAttempts[0]?.id || '');
    }

    if (liveHistoryRes.status === 'fulfilled') {
      setLiveHistory(liveHistoryRes.value);
    }
  }, []);

  const hydrateFromBackend = useCallback(async (profile: UserProfile) => {
    const lang = uiLangRef.current;
    const [quizzesRes, attemptsRes, settingsRes, liveHistoryRes] = await Promise.allSettled([
      api.listQuizzes(lang),
      api.listAttempts(lang),
      api.getSettings(lang),
      api.listLiveHistory(lang)
    ]);

    if (quizzesRes.status === 'fulfilled') {
      const mapped = quizzesRes.value.map((s) =>
        mapQuizSummaryToItem(s, translate(lang, 'common.today'))
      );
      setQuizzes(mapped);
      setActiveQuizIdState(mapped[0]?.id ?? '');
      setLive((prev) => ({ ...prev, quizId: mapped[0]?.id ?? '' }));
    }

    if (attemptsRes.status === 'fulfilled') {
      const mappedAttempts = mapAttemptSummariesToRecords(
        attemptsRes.value,
        translate(lang, 'common.today')
      );
      setHistory(mappedAttempts);
      setActiveAttemptId(mappedAttempts[0]?.id ?? '');
    }

    if (liveHistoryRes.status === 'fulfilled') {
      setLiveHistory(liveHistoryRes.value);
    }

    if (settingsRes.status === 'fulfilled') {
      const s = settingsRes.value;
      setSettings((prev) => ({
        ...prev,
        displayName: s.display_name || profile.display_name,
        email: s.email || profile.email,
        avatarUrl: s.avatar_url ?? profile.avatar_url ?? null,
        defaultQuestions: s.default_questions ?? prev.defaultQuestions,
        difficulty: s.difficulty || prev.difficulty,
        language: s.quiz_language || prev.language,
        shuffleQuestions: s.shuffle_questions ?? prev.shuffleQuestions,
        showExplanations: s.show_explanations ?? prev.showExplanations,
        studyReminders: s.study_reminders ?? prev.studyReminders,
        weeklySummary: s.weekly_summary ?? prev.weeklySummary
      }));
      if (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system') {
        setThemeState(s.theme);
      }
      if (s.ui_language === 'en' || s.ui_language === 'mm') {
        setUiLanguageState(s.ui_language);
      }
    } else {
      setSettings((prev) => ({
        ...prev,
        displayName: profile.display_name,
        email: profile.email,
        avatarUrl: profile.avatar_url ?? null
      }));
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    setAuthLoading(true);
    try {
      const profile = await api.getMe(uiLangRef.current);
      setUser(profile);
      await hydrateFromBackend(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [hydrateFromBackend]);

  // Restore cookie session on initial load & subscribe to 401 expiry
  useEffect(() => {
    let active = true;
    api.setOnUnauthorized(() => {
      setUser(null);
    });
    void (async () => {
      try {
        const profile = await api.getMe(uiLangRef.current);
        if (!active) return;
        setUser(profile);
        await hydrateFromBackend(profile);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => {
      active = false;
      api.setOnUnauthorized(null);
    };
  }, [hydrateFromBackend]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const profile = await api.login({ email, password, language: uiLanguage });
    setUser(profile);
    await hydrateFromBackend(profile);
    showToast(t('toasts.signedIn', { name: profile.display_name || profile.email }));
    return profile;
  };

  const startGoogleOAuth = (
    nextPath = '/dashboard',
    mode: api.GoogleOAuthMode = 'login'
  ): void => {
    window.location.assign(api.getGoogleOAuthLoginUrl(nextPath, mode));
  };

  const unlinkGoogleOAuth = async (): Promise<void> => {
    await api.unlinkGoogleOAuth(uiLanguage);
    const profile = await api.getMe(uiLanguage);
    setUser(profile);
    showToast(t('toasts.googleUnlinked'));
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<RegisterPendingResponse> => {
    const pending = await api.register({
      email,
      password,
      display_name: displayName,
      language: uiLanguage
    });
    showToast(t('toasts.registeredVerify'), 'info');
    return pending;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout(uiLanguage);
    } catch {
      /* Clear local user session even if network call fails */
    }
    closeLiveSocket();
    setUser(null);
    setQuizzes([]);
    setHistory([]);
    setLiveHistory([]);
    setActiveQuizIdState('');
    setActiveAttemptId('');
    setPractice(EMPTY_PRACTICE);
    setLive(EMPTY_LIVE);
    setSettings(DEFAULT_SETTINGS);
    showToast(t('toasts.signedOut'), 'info');
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.classList.toggle('light', resolvedTheme === 'light');
    root.style.colorScheme = resolvedTheme;
    document.body.setAttribute('data-theme', resolvedTheme);
    document.body.classList.toggle('dark', resolvedTheme === 'dark');
    document.body.classList.toggle('light', resolvedTheme === 'light');
  }, [resolvedTheme]);

  useEffect(() => {
    document.documentElement.lang = uiLanguage === 'mm' ? 'my' : 'en';
  }, [uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ theme, uiLanguage })
      );
    } catch {
      /* Ignore storage quota errors */
    }
  }, [theme, uiLanguage]);

  const syncSettingsPatch = useCallback(
    (patch: Partial<ApiUserSettings>) => {
      if (!user) return;
      void api.updateSettings(patch, uiLangRef.current).catch((err) => {
        showToast(getLocalizedErrorMessage(err, uiLangRef.current), 'error');
      });
    },
    [user, showToast]
  );

  const setTheme = (next: ThemeMode, opts?: { persist?: boolean }) => {
    setThemeState(next);
    if (opts?.persist !== false) {
      syncSettingsPatch({ theme: next });
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  const setUiLanguage = (next: AppLanguage, opts?: { persist?: boolean }) => {
    setUiLanguageState(next);
    if (opts?.persist !== false) {
      syncSettingsPatch({ ui_language: next });
    }
  };

  const toggleUiLanguage = () => {
    const next: AppLanguage = uiLanguage === 'en' ? 'mm' : 'en';
    setUiLanguage(next);
  };

  const activeQuiz: QuizItem | null =
    quizzes.find((q) => q.id === activeQuizId) ?? quizzes[0] ?? null;

  const setActiveQuizId = (id: string) => {
    setActiveQuizIdState(id);
  };

  const loadQuizDetails = useCallback(
    async (quizId: string, mode: 'preview' | 'play' = 'preview') => {
      const target = quizzes.find((q) => q.id === quizId);
      if (!target?.backendId) return;
      if (target.questionsLoaded && target.questions.length > 0 && mode === 'play') {
        return;
      }

      try {
        let data: ApiQuizPreviewResponse | ApiQuizResponse;
        if (mode === 'preview') {
          data = await api.getQuizPreview(target.backendId, uiLangRef.current);
        } else {
          data = await api.getQuiz(target.backendId, uiLangRef.current);
        }

        const mappedQuestions = mapApiQuestions(
          data.questions,
          translate(uiLangRef.current, 'toasts.generatedExplanation')
        );

        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  title: data.title || q.title,
                  sidebarTitle: data.title || q.sidebarTitle,
                  category: data.category || q.category,
                  source: data.source_filename || q.source,
                  questionCount: mappedQuestions.length,
                  questionsLoaded: true,
                  questions: mappedQuestions
                }
              : q
          )
        );
        setPractice((prev) =>
          prev.quizId === quizId && prev.questionOrder.length !== mappedQuestions.length
            ? {
                ...prev,
                questionOrder: buildQuestionOrder(
                  mappedQuestions.length,
                  settings.shuffleQuestions
                )
              }
            : prev
        );
      } catch (err) {
        showToast(getLocalizedErrorMessage(err, uiLangRef.current), 'error');
      }
    },
    [quizzes, settings.shuffleQuestions, showToast]
  );

  const loadAttemptDetails = useCallback(
    async (attemptId: string) => {
      const target = history.find((h) => h.id === attemptId);
      if (!target?.backendId || target.detailsLoaded) return;

      try {
        const detail = await api.getAttempt(target.backendId, uiLangRef.current);
        const mapped = mapAttemptResponseToRecord(
          detail,
          null,
          translate(uiLangRef.current, 'toasts.reviewConceptExplanation'),
          translate(uiLangRef.current, 'common.today')
        );
        setHistory((prev) =>
          prev.map((h) =>
            h.id === attemptId
              ? {
                  ...h,
                  missed: mapped.missed,
                  questionResults: mapped.questionResults,
                  detailsLoaded: true
                }
              : h
          )
        );
      } catch (err) {
        showToast(getLocalizedErrorMessage(err, uiLangRef.current), 'error');
      }
    },
    [history, showToast]
  );

  const deleteAttempt = async (attemptId: string): Promise<void> => {
    const target = history.find((h) => h.id === attemptId);
    if (!target) return;
    try {
      if (target.backendId) {
        await api.deleteAttempt(target.backendId, uiLanguage);
      }
      const remaining = history.filter((h) => h.id !== attemptId);
      setHistory(remaining);
      if (activeAttemptId === attemptId) {
        setActiveAttemptId(remaining[0]?.id ?? '');
      }
      showToast(t('toasts.attemptDeleted'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const clearAllAttempts = async (): Promise<void> => {
    try {
      await api.clearAllAttempts(uiLanguage);
      setHistory([]);
      setActiveAttemptId('');
      showToast(t('toasts.historyCleared'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const deleteLiveHistoryRoom = async (roomId: string): Promise<void> => {
    try {
      await api.deleteLiveHistoryRoom(roomId, uiLanguage);
      setLiveHistory((prev) => prev.filter((item) => item.id !== roomId));
      showToast(t('toasts.attemptDeleted'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const updateQuizQuestion = (
    quizId: string,
    qIndex: number,
    updated: Partial<QuestionItem>
  ) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id !== quizId) return q;
        const nextQuestions = q.questions.map((item, idx) =>
          idx === qIndex ? { ...item, ...updated } : item
        );
        return { ...q, questions: nextQuestions, updated: t('common.today') };
      })
    );
  };

  const saveQuizChanges = async (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target?.backendId) return;

    try {
      await api.updateQuiz(
        target.backendId,
        {
          title: target.title,
          category: target.category || undefined,
          questions: target.questions.map((q, idx) => ({
            prompt: q.prompt,
            position: idx,
            explanation: q.explanation ?? null,
            choices: q.choices.map((cText, cIdx) => ({
              text: cText,
              position: cIdx,
              is_correct: q.answer === cIdx
            }))
          }))
        },
        uiLanguage
      );
      showToast(t('toasts.quizSaved'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const deleteQuizQuestion = async (quizId: string, qIndex: number): Promise<void> => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target || target.questions.length <= 1) return;

    const nextQuestions = target.questions.filter((_, idx) => idx !== qIndex);
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              questions: nextQuestions,
              questionCount: nextQuestions.length,
              updated: t('common.today')
            }
          : q
      )
    );

    if (!target.backendId) {
      showToast(t('toasts.questionDeleted'));
      return;
    }

    try {
      await api.updateQuiz(
        target.backendId,
        {
          title: target.title,
          category: target.category || undefined,
          questions: nextQuestions.map((q, idx) => ({
            prompt: q.prompt,
            position: idx,
            explanation: q.explanation ?? null,
            choices: q.choices.map((cText, cIdx) => ({
              text: cText,
              position: cIdx,
              is_correct: q.answer === cIdx
            }))
          }))
        },
        uiLanguage
      );
      showToast(t('toasts.questionDeleted'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const deleteQuiz = async (quizId: string): Promise<boolean> => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return false;

    try {
      if (target.backendId) {
        await api.deleteQuiz(target.backendId, uiLanguage);
      }
      const remaining = quizzes.filter((q) => q.id !== quizId);
      setQuizzes(remaining);
      if (activeQuizId === quizId) {
        setActiveQuizIdState(remaining[0]?.id ?? '');
      }
      if (live.quizId === quizId) {
        setLive((prev) => ({ ...prev, quizId: remaining[0]?.id ?? '' }));
      }
      showToast(t('toasts.quizDeleted', { title: target.title }));
      return true;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return false;
    }
  };

  const generateQuiz = async (params: {
    file: File;
    fileName: string;
    title: string;
    category?: string;
    questionCount: number;
    useLlm?: boolean;
  }): Promise<QuizItem> => {
    const cleanTitle = params.title.trim() || params.file.name.replace(/\.[^.]+$/, '');
    const count = params.questionCount || 10;

    const apiQuiz = await api.createQuizFromFile({
      file: params.file,
      title: cleanTitle,
      category: params.category,
      questionCount: count,
      useLlm: params.useLlm ?? false,
      language: uiLanguage
    });

    let previewQuestions: ApiQuestion[] = apiQuiz.questions;
    try {
      const preview = await api.getQuizPreview(apiQuiz.id, uiLanguage);
      previewQuestions = preview.questions;
    } catch {
      /* Use initial response if preview fails */
    }

    const mappedQuestions = mapApiQuestions(
      previewQuestions,
      t('toasts.generatedExplanation')
    );

    const newQuiz: QuizItem = {
      id: apiQuiz.id,
      backendId: apiQuiz.id,
      title: apiQuiz.title || cleanTitle,
      sidebarTitle: apiQuiz.title || cleanTitle,
      category: apiQuiz.category || params.category || 'Uploaded',
      source: apiQuiz.source_filename || params.file.name,
      updated: t('common.justNow'),
      lastScore: 0,
      questionCount: mappedQuestions.length,
      questionsLoaded: true,
      questions: mappedQuestions
    };

    setQuizzes((prev) => [newQuiz, ...prev.filter((q) => q.id !== newQuiz.id)]);
    setActiveQuizIdState(newQuiz.id);
    showToast(
      t('toasts.quizCreated', {
        title: newQuiz.title,
        count: mappedQuestions.length
      })
    );
    return newQuiz;
  };

  const startPractice = (quizId?: string) => {
    const targetId = quizId || activeQuiz?.id || '';
    if (!targetId) return;
    const targetQuiz = quizzes.find((q) => q.id === targetId);
    const questionOrder =
      targetQuiz && targetQuiz.questions.length > 0
        ? buildQuestionOrder(targetQuiz.questions.length, settings.shuffleQuestions)
        : [];
    setActiveQuizIdState(targetId);
    setPractice({
      quizId: targetId,
      questionIndex: 0,
      questionOrder,
      answers: {},
      startedAt: Date.now()
    });
  };

  const resetPractice = () => {
    setPractice(EMPTY_PRACTICE);
  };

  const selectPracticeAnswer = (questionIndex: number, choiceIndex: number) => {
    setPractice((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: choiceIndex
      }
    }));
  };

  const setPracticeQuestionIndex = (index: number) => {
    setPractice((prev) => ({ ...prev, questionIndex: index }));
  };

  const finishPractice = async (): Promise<AttemptRecord | null> => {
    const quiz = quizzes.find((q) => q.id === practice.quizId) ?? activeQuiz;
    if (!quiz?.backendId) return null;

    const elapsedSec = Math.max(
      1,
      Math.round((Date.now() - (practice.startedAt || Date.now())) / 1000)
    );
    const prevAttempt = history.find((h) => h.quizId === quiz.id);

    try {
      const letters = ['a', 'b', 'c', 'd'];
      const payload = Object.entries(practice.answers).map(([qIdxStr, cIdx]) => {
        const qIdx = Number(qIdxStr);
        const qObj = quiz.questions[qIdx];
        return {
          question_id: qObj?.id || `q_${qIdx + 1}`,
          choice_id: letters[cIdx] || 'a'
        };
      });

      const serverAttempt = await api.submitAttempt(quiz.backendId, payload, {
        durationSeconds: elapsedSec,
        language: uiLanguage
      });

      const newRecord = mapAttemptResponseToRecord(
        serverAttempt,
        prevAttempt ? prevAttempt.scorePct : null,
        t('toasts.reviewConceptExplanation'),
        t('common.justNow')
      );

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quiz.id
            ? { ...q, lastScore: newRecord.scorePct, updated: t('common.today') }
            : q
        )
      );
      setHistory((prev) => [newRecord, ...prev]);
      setActiveAttemptId(newRecord.id);
      setPractice(EMPTY_PRACTICE);
      showToast(
        t('toasts.assessmentCompleted', {
          score: newRecord.scorePct,
          correct: newRecord.correct,
          total: newRecord.total
        })
      );
      return newRecord;
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      return null;
    }
  };

  const exportStudySheet = async (
    kind: ExportKind,
    format: ExportFormat = 'pdf',
    quizId?: string
  ) => {
    const targetQuiz = (quizId ? quizzes.find((q) => q.id === quizId) : null) ?? activeQuiz;
    if (!targetQuiz?.backendId || exportingKind) return;
    setPrintKind(kind);
    setExportingKind(kind);

    try {
      const minDelay = new Promise((resolve) => window.setTimeout(resolve, 550));
      await Promise.all([
        api.downloadQuizExport(
          targetQuiz.backendId,
          kind,
          format,
          targetQuiz.title,
          uiLanguage
        ),
        minDelay
      ]);
      if (format === 'word') {
        showToast(
          kind === 'answers'
            ? t('toasts.answerKeyWordDownloaded')
            : t('toasts.questionsSheetWordDownloaded')
        );
      } else {
        showToast(
          kind === 'answers'
            ? t('toasts.answerKeyDownloaded')
            : t('toasts.questionsSheetDownloaded')
        );
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setExportingKind(null);
    }
  };

  const setLiveQuizId = (quizId: string) => {
    setLive((prev) => ({ ...prev, quizId }));
  };

  const setLiveTimer = (seconds: number) => {
    setLive((prev) => ({ ...prev, timerSeconds: seconds }));
  };

  const applyBackendLiveState = useCallback(
    (state: ApiLiveGameState, extra?: Partial<LiveGameState>) => {
      setLive((prev) => ({
        ...prev,
        isLiveBackend: true,
        backendStatus: state.status,
        pin: state.pin,
        quizId: state.quiz_id,
        timerSeconds: state.timer_seconds,
        round: state.round,
        totalRounds: state.total_rounds,
        players: state.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatar_url: p.avatar_url ?? null,
          status: p.status,
          correct: p.correct,
          total: p.total,
          points: p.points
        })),
        ...(extra || {})
      }));
    },
    []
  );

  const connectLiveSocket = useCallback(
    (pin: string, opts?: { playerId?: string; displayName?: string }) => {
      closeLiveSocket();
      const wsUrl = api.getLiveRoomWsUrl(pin, opts);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        pingTimerRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data)) as ApiLiveWsEvent;
          switch (msg.type) {
            case 'pong':
              break;
            case 'room_state':
              applyBackendLiveState(msg.state, {
                ...(msg.player_id ? { playerId: msg.player_id } : {}),
                ...(msg.question !== undefined ? { currentQuestion: msg.question } : {})
              });
              break;
            case 'joined':
              applyBackendLiveState(msg.state, { playerId: msg.player_id });
              break;
            case 'player_joined':
            case 'player_left':
            case 'player_ready':
              applyBackendLiveState(msg.state);
              break;
            case 'question':
              applyBackendLiveState(msg.state, {
                currentQuestion: msg.question,
                selectedChoiceId: null,
                lastAnswerResult: null,
                lastRoundCorrectChoiceId: null
              });
              break;
            case 'answer_result':
              setLive((prev) => ({
                ...prev,
                lastAnswerResult: {
                  is_correct: msg.is_correct,
                  correct_choice_id: msg.correct_choice_id,
                  points_earned: msg.points_earned,
                  total_points: msg.total_points,
                  round: msg.round
                }
              }));
              showToast(
                msg.is_correct
                  ? translate(uiLangRef.current, 'toasts.liveAnswerCorrect', {
                      points: msg.points_earned,
                      total: msg.total_points
                    })
                  : translate(uiLangRef.current, 'toasts.liveAnswerIncorrect'),
                msg.is_correct ? 'success' : 'info'
              );
              break;
            case 'leaderboard':
              applyBackendLiveState(msg.state);
              break;
            case 'round_ended':
              applyBackendLiveState(msg.state, {
                lastRoundCorrectChoiceId: msg.correct_choice_id
              });
              break;
            case 'game_finished':
              applyBackendLiveState(msg.state, {
                currentQuestion: null
              });
              showToast(translate(uiLangRef.current, 'toasts.liveGameFinished'), 'info');
              void refreshHistory();
              break;
            case 'room_closed':
              closeLiveSocket();
              setLive((prev) => ({
                ...EMPTY_LIVE,
                quizId: prev.quizId,
                timerSeconds: prev.timerSeconds || 20
              }));
              showToast(translate(uiLangRef.current, 'toasts.roomClosed'), 'info');
              break;
            case 'error':
              showToast(
                getLocalizedErrorMessage(
                  { code: msg.code, message: msg.message },
                  uiLangRef.current
                ),
                'error'
              );
              break;
          }
        } catch {
          /* Ignore malformed WS frames */
        }
      };

      ws.onclose = () => {
        if (pingTimerRef.current !== null) {
          window.clearInterval(pingTimerRef.current);
          pingTimerRef.current = null;
        }
      };
    },
    [applyBackendLiveState, closeLiveSocket, refreshHistory, showToast]
  );

  const createLiveRoom = async (
    quizId?: string,
    timerSeconds?: number,
    options?: { participateAsHost?: boolean }
  ) => {
    const targetQuizId = quizId || live.quizId || activeQuiz?.id || '';
    const targetTimer = timerSeconds || live.timerSeconds || 20;
    const targetQuiz = quizzes.find((q) => q.id === targetQuizId) ?? activeQuiz;

    if (!targetQuiz?.backendId) {
      showToast(getErrorByCode('QUIZ_NOT_FOUND', uiLanguage), 'error');
      return;
    }

    try {
      const room = await api.createLiveRoom({
        quizId: targetQuiz.backendId,
        timerSeconds: targetTimer,
        language: uiLanguage
      });

      const hostParticipates = options?.participateAsHost ?? true;
      if (hostParticipates) {
        const hostName =
          settings.displayName?.trim() ||
          user?.display_name?.trim() ||
          user?.email?.split('@')[0] ||
          'Host';
        try {
          const cleanPin = room.pin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const joined = await api.joinLiveRoom(cleanPin, hostName, uiLanguage);
          applyBackendLiveState(joined, {
            status: 'hosting',
            joinedPlayerName: hostName,
            playerId: joined.player_id,
            currentQuestion: null,
            selectedChoiceId: null,
            lastAnswerResult: null,
            lastRoundCorrectChoiceId: null
          });
          connectLiveSocket(joined.pin, { playerId: joined.player_id });
          showToast(t('toasts.roomCreated', { pin: room.pin }));
          return;
        } catch {
          // Fall back to spectator-host mode if auto-join fails
        }
      }

      applyBackendLiveState(room, {
        status: 'hosting',
        joinedPlayerName: undefined,
        playerId: undefined,
        currentQuestion: null,
        selectedChoiceId: null,
        lastAnswerResult: null,
        lastRoundCorrectChoiceId: null
      });
      connectLiveSocket(room.pin);
      showToast(t('toasts.roomCreated', { pin: room.pin }));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const joinAsHostPlayer = async () => {
    if (!live.pin || live.playerId) return;
    const cleanPin = live.pin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const hostName =
      settings.displayName?.trim() ||
      user?.display_name?.trim() ||
      user?.email?.split('@')[0] ||
      'Host';
    try {
      const joined = await api.joinLiveRoom(cleanPin, hostName, uiLanguage);
      applyBackendLiveState(joined, {
        status: 'hosting',
        joinedPlayerName: hostName,
        playerId: joined.player_id
      });
      connectLiveSocket(joined.pin, { playerId: joined.player_id });
      showToast(t('toasts.joinedRoom', { pin: joined.pin, name: hostName }));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const leaveAsHostPlayer = async () => {
    if (!live.pin || !live.playerId) return;
    const cleanPin = live.pin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    try {
      const updated = await api.leaveLiveRoomPlayer(cleanPin, live.playerId, uiLanguage);
      applyBackendLiveState(updated, {
        status: 'hosting',
        joinedPlayerName: undefined,
        playerId: undefined
      });
      connectLiveSocket(updated.pin);
      showToast(t('toasts.leftAsPlayer'), 'info');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const markLivePlayerReady = async () => {
    if (!live.pin || !live.playerId) return;
    const cleanPin = live.pin.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    try {
      const updated = await api.markLivePlayerReady(cleanPin, live.playerId, uiLanguage);
      applyBackendLiveState(updated);
    } catch {
      /* Non-blocking ready notification */
    }
  };

  const joinLiveRoom = async (
    pin: string,
    name: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanPin = normalizeRoomPin(pin);
    if (!isValidRoomPin(cleanPin)) {
      return {
        ok: false,
        error: getErrorByCode('INVALID_ROOM_PIN', uiLanguage)
      };
    }
    const playerName = name.trim() || settings.displayName || user?.display_name || '';

    try {
      const joined = await api.joinLiveRoom(cleanPin, playerName, uiLanguage);
      applyBackendLiveState(joined, {
        status: 'joined',
        joinedPlayerName: playerName,
        playerId: joined.player_id,
        currentQuestion: null,
        selectedChoiceId: null,
        lastAnswerResult: null,
        lastRoundCorrectChoiceId: null
      });
      connectLiveSocket(joined.pin, { playerId: joined.player_id });
      showToast(t('toasts.joinedRoom', { pin: joined.pin, name: playerName }));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err) };
    }
  };

  const closeLiveRoom = () => {
    const pinToClose = live.status === 'hosting' ? live.pin : '';
    closeLiveSocket();
    if (pinToClose) {
      void api.closeLiveRoom(pinToClose, uiLanguage).catch(() => {});
    }
    setLive((prev) => ({
      ...EMPTY_LIVE,
      quizId: prev.quizId || activeQuiz?.id || '',
      timerSeconds: prev.timerSeconds || 20
    }));
    showToast(t('toasts.roomClosed'), 'info');
  };

  const advanceLiveRound = async () => {
    if (!live.pin) return;
    try {
      const next = await api.advanceLiveRoom(live.pin, uiLanguage);
      applyBackendLiveState(next, {
        currentQuestion: next.current_question,
        selectedChoiceId: null,
        lastAnswerResult: null,
        lastRoundCorrectChoiceId: null
      });
      if (next.status === 'finished') {
        showToast(t('toasts.liveGameFinished'), 'info');
        if (user) {
          void refreshHistory();
        }
      } else {
        showToast(
          t('toasts.proceededRound', {
            round: next.round,
            total: next.total_rounds
          }),
          'info'
        );
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const submitLiveAnswer = (choiceId: string) => {
    setLive((prev) => ({ ...prev, selectedChoiceId: choiceId }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'answer',
          choice_id: choiceId,
          ...(live.playerId ? { player_id: live.playerId } : {})
        })
      );
    }
  };

  const updateSettings = (
    partial: Partial<UserSettings>,
    opts?: { persist?: boolean }
  ) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    if (partial.avatarUrl !== undefined) {
      setUser((prev) => (prev ? { ...prev, avatar_url: partial.avatarUrl } : prev));
    }

    if (user && opts?.persist !== false) {
      const apiPatch: Partial<ApiUserSettings> = {};
      if (partial.displayName !== undefined) apiPatch.display_name = partial.displayName;
      if (partial.avatarUrl !== undefined) apiPatch.avatar_url = partial.avatarUrl;
      if (partial.defaultQuestions !== undefined) {
        apiPatch.default_questions = partial.defaultQuestions;
      }
      if (partial.difficulty !== undefined) apiPatch.difficulty = partial.difficulty;
      if (partial.language !== undefined) apiPatch.quiz_language = partial.language;
      if (partial.shuffleQuestions !== undefined) {
        apiPatch.shuffle_questions = partial.shuffleQuestions;
      }
      if (partial.showExplanations !== undefined) {
        apiPatch.show_explanations = partial.showExplanations;
      }
      if (partial.studyReminders !== undefined) {
        apiPatch.study_reminders = partial.studyReminders;
      }
      if (partial.weeklySummary !== undefined) {
        apiPatch.weekly_summary = partial.weeklySummary;
      }
      if (Object.keys(apiPatch).length > 0) {
        syncSettingsPatch(apiPatch);
      }
    }
  };

  const saveSettingsToBackend = async (
    payload: Partial<UserSettings> & { theme?: ThemeMode; uiLanguage?: AppLanguage }
  ): Promise<void> => {
    const { theme: nextTheme, uiLanguage: nextLang, ...rest } = payload;
    if (nextTheme !== undefined) setThemeState(nextTheme);
    if (nextLang !== undefined) setUiLanguageState(nextLang);
    if (Object.keys(rest).length > 0) {
      setSettings((prev) => ({ ...prev, ...rest }));
    }
    if (rest.avatarUrl !== undefined) {
      setUser((prev) => (prev ? { ...prev, avatar_url: rest.avatarUrl } : prev));
    }
    if (rest.displayName !== undefined) {
      setUser((prev) =>
        prev ? { ...prev, display_name: rest.displayName || prev.display_name } : prev
      );
    }

    if (!user) return;

    const apiPatch: Partial<ApiUserSettings> = {};
    if (rest.displayName !== undefined) apiPatch.display_name = rest.displayName;
    if (rest.avatarUrl !== undefined) apiPatch.avatar_url = rest.avatarUrl;
    if (nextTheme !== undefined) apiPatch.theme = nextTheme;
    if (nextLang !== undefined) apiPatch.ui_language = nextLang;
    if (rest.defaultQuestions !== undefined) {
      apiPatch.default_questions = rest.defaultQuestions;
    }
    if (rest.difficulty !== undefined) apiPatch.difficulty = rest.difficulty;
    if (rest.language !== undefined) apiPatch.quiz_language = rest.language;
    if (rest.shuffleQuestions !== undefined) {
      apiPatch.shuffle_questions = rest.shuffleQuestions;
    }
    if (rest.showExplanations !== undefined) {
      apiPatch.show_explanations = rest.showExplanations;
    }
    if (rest.studyReminders !== undefined) {
      apiPatch.study_reminders = rest.studyReminders;
    }
    if (rest.weeklySummary !== undefined) {
      apiPatch.weekly_summary = rest.weeklySummary;
    }

    if (Object.keys(apiPatch).length > 0) {
      await api.updateSettings(apiPatch, nextLang ?? uiLangRef.current);
    }
  };

  const exportAccountData = async () => {
    try {
      const payload = await api.exportAccountData(uiLanguage);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QuizClash-study-data.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('toasts.dataExported'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const resetAllData = async () => {
    try {
      await api.deleteAccountData(uiLanguage);
      closeLiveSocket();
      setQuizzes([]);
      setHistory([]);
      setLiveHistory([]);
      setActiveQuizIdState('');
      setActiveAttemptId('');
      setPractice(EMPTY_PRACTICE);
      setLive(EMPTY_LIVE);
      showToast(t('toasts.workspaceRestored'));
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const openModal = (opts: Omit<ModalState, 'open'>) => {
    setModal({ ...opts, open: false });
    void Swal.fire({
      title: opts.title,
      text: opts.message,
      icon: opts.onConfirm ? 'warning' : 'info',
      showCancelButton: Boolean(opts.onConfirm),
      confirmButtonText:
        opts.confirmLabel || (opts.onConfirm ? t('common.confirm') : t('common.gotIt')),
      cancelButtonText: t('common.cancel'),
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'qc-swal-modal',
        title: 'qc-swal-modal-title',
        htmlContainer: 'qc-swal-modal-text',
        actions: 'qc-swal-modal-actions',
        confirmButton: opts.onConfirm ? 'btn btn-danger' : 'btn btn-primary',
        cancelButton: 'btn'
      }
    }).then((result) => {
      if (result.isConfirmed && opts.onConfirm) {
        opts.onConfirm();
      }
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    Swal.close();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        startGoogleOAuth,
        unlinkGoogleOAuth,
        register,
        logout,
        refreshUser,
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        uiLanguage,
        setUiLanguage,
        toggleUiLanguage,
        t,
        getErrorMessage,
        quizzes,
        activeQuizId,
        activeQuiz,
        setActiveQuizId,
        loadQuizDetails,
        updateQuizQuestion,
        deleteQuizQuestion,
        deleteQuiz,
        saveQuizChanges,
        history,
        liveHistory,
        activeAttemptId,
        setActiveAttemptId,
        loadAttemptDetails,
        deleteAttempt,
        clearAllAttempts,
        deleteLiveHistoryRoom,
        refreshHistory,
        practice,
        startPractice,
        resetPractice,
        selectPracticeAnswer,
        setPracticeQuestionIndex,
        finishPractice,
        generateQuiz,
        exportStudySheet,
        exportingKind,
        printKind,
        live,
        setLiveQuizId,
        setLiveTimer,
        createLiveRoom,
        joinLiveRoom,
        joinAsHostPlayer,
        leaveAsHostPlayer,
        markLivePlayerReady,
        closeLiveRoom,
        advanceLiveRound,
        submitLiveAnswer,
        settings,
        updateSettings,
        saveSettingsToBackend,
        exportAccountData,
        resetAllData,
        toastMessage,
        showToast,
        modal,
        openModal,
        closeModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
