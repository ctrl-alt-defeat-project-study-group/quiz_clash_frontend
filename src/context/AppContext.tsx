/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import Swal, { type SweetAlertIcon } from 'sweetalert2';
import type {
  AppLanguage,
  AttemptRecord,
  ExportKind,
  LiveGameState,
  MissedQuestionItem,
  QuestionItem,
  QuizItem,
  ResolvedTheme,
  ThemeMode,
  UserSettings
} from '../types/quiz';
import {
  DEFAULT_SETTINGS,
  INITIAL_LIVE_PLAYERS,
  SEED_HISTORY,
  SEED_QUIZZES
} from '../data/seedData';
import * as api from '../services/api';
import {
  getErrorByCode,
  getLocalizedErrorMessage,
  translate,
  type TranslationKey
} from '../i18n';

const STORAGE_KEY = 'quiz-clash-react-v2-state';

interface PracticeState {
  quizId: string;
  questionIndex: number;
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
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  uiLanguage: AppLanguage;
  setUiLanguage: (lang: AppLanguage) => void;
  toggleUiLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  getErrorMessage: (error: unknown) => string;

  quizzes: QuizItem[];
  activeQuizId: string;
  activeQuiz: QuizItem;
  setActiveQuizId: (id: string) => void;
  updateQuizQuestion: (quizId: string, qIndex: number, updated: Partial<QuestionItem>) => void;
  saveQuizChanges: (quizId: string) => Promise<void>;

  history: AttemptRecord[];
  activeAttemptId: string;
  setActiveAttemptId: (id: string) => void;

  practice: PracticeState;
  startPractice: (quizId?: string) => void;
  selectPracticeAnswer: (questionIndex: number, choiceIndex: number) => void;
  setPracticeQuestionIndex: (index: number) => void;
  finishPractice: () => Promise<AttemptRecord>;

  generateQuiz: (params: {
    file?: File | null;
    fileName: string;
    title: string;
    questionCount: number;
  }) => Promise<QuizItem>;

  exportStudySheet: (kind: ExportKind) => Promise<void>;
  printKind: ExportKind;

  live: LiveGameState;
  setLiveQuizId: (quizId: string) => void;
  setLiveTimer: (seconds: number) => void;
  createLiveRoom: (quizId?: string, timerSeconds?: number) => void;
  joinLiveRoom: (pin: string, name: string) => { ok: boolean; error?: string };
  closeLiveRoom: () => void;
  advanceLiveRound: () => void;

  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetAllData: () => void;

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

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = loadStoredState();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (
      stored?.theme === 'dark' ||
      stored?.theme === 'light' ||
      stored?.theme === 'system'
    ) {
      return stored.theme;
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [uiLanguage, setUiLanguageState] = useState<AppLanguage>(() => {
    if (stored?.uiLanguage === 'mm' || stored?.uiLanguage === 'en') {
      return stored.uiLanguage;
    }
    return 'en';
  });

  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;
  const [quizzes, setQuizzes] = useState<QuizItem[]>(
    Array.isArray(stored?.quizzes) && stored.quizzes.length
      ? stored.quizzes
      : structuredClone(SEED_QUIZZES)
  );
  const [history, setHistory] = useState<AttemptRecord[]>(
    Array.isArray(stored?.history) && stored.history.length
      ? stored.history
      : structuredClone(SEED_HISTORY)
  );
  const [activeQuizId, setActiveQuizIdState] = useState<string>(
    stored?.activeQuizId || 'biology'
  );
  const [activeAttemptId, setActiveAttemptId] = useState<string>(
    stored?.history?.[0]?.id || SEED_HISTORY[0].id
  );
  const [settings, setSettings] = useState<UserSettings>(
    stored?.settings ? { ...DEFAULT_SETTINGS, ...stored.settings } : DEFAULT_SETTINGS
  );

  // Pre-populated 4 answers matching wireframe "Question 4 of 10 · Practice in progress"
  const [practice, setPractice] = useState<PracticeState>(() => ({
    quizId: 'biology',
    questionIndex: 3,
    answers: { 0: 1, 1: 0, 2: 0, 3: 1 },
    startedAt: Date.now() - 180000
  }));

  const [live, setLive] = useState<LiveGameState>({
    status: 'idle',
    pin: '482 619',
    quizId: 'biology',
    timerSeconds: 20,
    round: 3,
    players: structuredClone(INITIAL_LIVE_PLAYERS)
  });

  const [printKind, setPrintKind] = useState<ExportKind>('questions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    title: '',
    message: ''
  });

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
        STORAGE_KEY,
        JSON.stringify({
          theme,
          uiLanguage,
          quizzes,
          history,
          activeQuizId,
          settings
        })
      );
    } catch {
      /* Ignore storage quota errors */
    }
  }, [theme, uiLanguage, quizzes, history, activeQuizId, settings]);

  const showToast = (msg: string, icon?: SweetAlertIcon) => {
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
      closeButtonAriaLabel: translate(uiLanguage, 'toasts.closeNotificationAria')
    });
  };

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  const setUiLanguage = (next: AppLanguage) => {
    setUiLanguageState(next);
  };

  const toggleUiLanguage = () => {
    setUiLanguageState((prev) => (prev === 'en' ? 'mm' : 'en'));
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return translate(uiLanguage, key, params);
  };

  const getErrorMessage = (error: unknown): string => {
    return getLocalizedErrorMessage(error, uiLanguage);
  };

  const activeQuiz =
    quizzes.find((q) => q.id === activeQuizId) || quizzes[0] || SEED_QUIZZES[0];

  const setActiveQuizId = (id: string) => {
    setActiveQuizIdState(id);
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
        return { ...q, questions: nextQuestions, updated: 'Today' };
      })
    );
  };

  const saveQuizChanges = async (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return;

    if (target.backendId) {
      try {
        await api.updateQuiz(
          target.backendId,
          {
            title: target.title,
            source_type: target.source.endsWith('.csv') ? 'csv' : 'txt',
            questions: target.questions.map((q, idx) => ({
              prompt: q.prompt,
              position: idx,
              choices: q.choices.map((cText, cIdx) => ({
                text: cText,
                position: cIdx,
                is_correct: q.answer === cIdx
              }))
            }))
          },
          uiLanguage
        );
      } catch {
        /* Saved locally when backend is unavailable */
      }
    }
    showToast(t('toasts.quizSaved'));
  };

  const generateQuiz = async (params: {
    file?: File | null;
    fileName: string;
    title: string;
    questionCount: number;
  }): Promise<QuizItem> => {
    const cleanTitle = params.title.trim() || 'Cell structure';
    const count = params.questionCount || 10;

    // Attempt backend upload if a CSV or TXT file is provided
    if (params.file && /\.(csv|txt)$/i.test(params.file.name)) {
      try {
        const apiQuiz = await api.createQuizFromFile({
          file: params.file,
          title: cleanTitle,
          questionCount: count,
          useLlm: false,
          language: uiLanguage
        });

        let previewQuestions = apiQuiz.questions;
        try {
          const preview = await api.getQuizPreview(apiQuiz.id, uiLanguage);
          previewQuestions = preview.questions;
        } catch {
          /* Use initial response if preview fails */
        }

        const mappedQuestions: QuestionItem[] = previewQuestions.map((aq) => {
          const sortedChoices = [...aq.choices].sort((a, b) => a.position - b.position);
          const correctIdx = sortedChoices.findIndex((c) => c.is_correct);
          return {
            id: aq.id,
            prompt: aq.prompt,
            choices: sortedChoices.map((c) => c.text),
            answer: correctIdx >= 0 ? correctIdx : 0,
            explanation: t('toasts.generatedExplanation')
          };
        });

        if (mappedQuestions.length > 0) {
          const newQuiz: QuizItem = {
            id: apiQuiz.id,
            backendId: apiQuiz.id,
            title: apiQuiz.title || cleanTitle,
            sidebarTitle: apiQuiz.title || cleanTitle,
            category: 'Uploaded',
            source: params.file.name,
            updated: t('common.justNow'),
            lastScore: 100,
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
        }
      } catch {
        /* Fall back to local generation when backend is offline */
      }
    }

    // Local deterministic generation fallback
    const templateQuestions = SEED_QUIZZES[0].questions;
    const generatedQuestions: QuestionItem[] = Array.from({ length: count }, (_, idx) => {
      const base = templateQuestions[idx % templateQuestions.length];
      return {
        ...structuredClone(base),
        id: `q_${idx + 1}`
      };
    });

    const existing = quizzes.find(
      (q) => q.title.toLowerCase() === cleanTitle.toLowerCase()
    );
    const quizId = existing ? existing.id : `quiz_${Date.now()}`;

    const createdQuiz: QuizItem = {
      id: quizId,
      title: cleanTitle,
      sidebarTitle: cleanTitle,
      category: 'Custom',
      source: params.fileName || 'Cell_Biology_Notes.pdf',
      updated: t('common.justNow'),
      lastScore: existing?.lastScore ?? 100,
      questions: generatedQuestions
    };

    setQuizzes((prev) =>
      existing
        ? prev.map((q) => (q.id === existing.id ? createdQuiz : q))
        : [createdQuiz, ...prev]
    );
    setActiveQuizIdState(createdQuiz.id);
    showToast(t('toasts.quizCreated', { title: cleanTitle, count }));
    return createdQuiz;
  };

  const startPractice = (quizId?: string) => {
    const targetId = quizId || activeQuiz.id;
    setActiveQuizIdState(targetId);
    setPractice({
      quizId: targetId,
      questionIndex: 0,
      answers: {},
      startedAt: Date.now()
    });
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

  const finishPractice = async (): Promise<AttemptRecord> => {
    const quiz = quizzes.find((q) => q.id === practice.quizId) || activeQuiz;
    const total = quiz.questions.length;

    // Try server-side grading if quiz exists in backend
    if (quiz.backendId) {
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
        await api.submitAttempt(quiz.backendId, payload, uiLanguage);
      } catch {
        /* Fallback to local grading calculation */
      }
    }

    let correct = 0;
    const missed: MissedQuestionItem[] = [];

    quiz.questions.forEach((q, idx) => {
      const chosen = practice.answers[idx];
      if (chosen === q.answer) {
        correct++;
      } else {
        missed.push({
          number: idx + 1,
          prompt: q.prompt,
          yourAnswer: chosen !== undefined ? q.choices[chosen] : t('common.notAnswered'),
          correctAnswer: q.choices[q.answer],
          explanation: q.explanation || t('toasts.reviewConceptExplanation')
        });
      }
    });

    const scorePct = Math.round((correct / total) * 100);
    const elapsedSec = Math.max(
      45,
      Math.round((Date.now() - (practice.startedAt || Date.now())) / 1000)
    );
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const ss = String(elapsedSec % 60).padStart(2, '0');
    const prevAttempt = history.find((h) => h.quizId === quiz.id);
    const diff = prevAttempt ? scorePct - prevAttempt.scorePct : 20;
    const deltaPts = `${diff >= 0 ? '+' : ''}${diff} pts`;

    const newRecord: AttemptRecord = {
      id: `att_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      dateLabel: t('common.justNow'),
      scorePct,
      correct,
      total,
      duration: `${mm}:${ss}`,
      deltaPts,
      missed
    };

    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quiz.id ? { ...q, lastScore: scorePct, updated: t('common.today') } : q
      )
    );
    setHistory((prev) => [newRecord, ...prev]);
    setActiveAttemptId(newRecord.id);
    showToast(
      t('toasts.assessmentCompleted', {
        score: scorePct,
        correct,
        total
      })
    );
    return newRecord;
  };

  const exportStudySheet = async (kind: ExportKind) => {
    setPrintKind(kind);

    if (activeQuiz.backendId) {
      try {
        await api.downloadQuizPdf(activeQuiz.backendId, kind, activeQuiz.title, uiLanguage);
        showToast(
          kind === 'answers'
            ? t('toasts.answerKeyDownloaded')
            : t('toasts.questionsSheetDownloaded')
        );
        return;
      } catch {
        /* Fall back to browser print/save-as-PDF sheet */
      }
    }

    showToast(
      kind === 'answers'
        ? t('toasts.preparingAnswerKey')
        : t('toasts.preparingQuestionsSheet'),
      'info'
    );
    window.setTimeout(() => window.print(), 120);
  };

  const setLiveQuizId = (quizId: string) => {
    setLive((prev) => ({ ...prev, quizId }));
  };

  const setLiveTimer = (seconds: number) => {
    setLive((prev) => ({ ...prev, timerSeconds: seconds }));
  };

  const formatPin = (raw: string): string => {
    const clean = raw.replace(/\s+/g, '');
    if (clean.length === 6) {
      return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    }
    return clean;
  };

  const createLiveRoom = (quizId?: string, timerSeconds?: number) => {
    const randomPin = String(Math.floor(100000 + Math.random() * 900000));
    const formattedPin = formatPin(randomPin);
    setLive((prev) => ({
      ...prev,
      status: 'hosting',
      pin: formattedPin,
      quizId: quizId || prev.quizId,
      timerSeconds: timerSeconds || prev.timerSeconds,
      round: 1,
      players: structuredClone(INITIAL_LIVE_PLAYERS),
      joinedPlayerName: undefined
    }));
    showToast(t('toasts.roomCreated', { pin: formattedPin }));
  };

  const joinLiveRoom = (pin: string, name: string): { ok: boolean; error?: string } => {
    const cleanPin = pin.replace(/\s+/g, '');
    if (!cleanPin || cleanPin.length < 4) {
      return {
        ok: false,
        error: getErrorByCode('INVALID_ROOM_PIN', uiLanguage)
      };
    }
    const formattedPin = formatPin(cleanPin);
    const playerName = name.trim() || settings.displayName || 'Alex M.';
    setLive((prev) => {
      const exists = prev.players.some(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );
      return {
        ...prev,
        status: 'joined',
        pin: formattedPin,
        joinedPlayerName: playerName,
        players: exists
          ? prev.players
          : [
              ...prev.players,
              { name: playerName, status: 'Ready', correct: 3, total: 3, points: 2350 }
            ]
      };
    });
    showToast(t('toasts.joinedRoom', { pin: formattedPin, name: playerName }));
    return { ok: true };
  };

  const closeLiveRoom = () => {
    setLive((prev) => ({
      ...prev,
      status: 'idle',
      joinedPlayerName: undefined
    }));
    showToast(t('toasts.roomClosed'), 'info');
  };

  const advanceLiveRound = () => {
    const liveQuiz = quizzes.find((q) => q.id === live.quizId) || activeQuiz;
    const totalRounds = liveQuiz.questions.length;

    setLive((prev) => {
      if (prev.round < totalRounds) {
        const nextRound = prev.round + 1;
        const updatedPlayers = prev.players.map((p, idx) => {
          const gotIt = (nextRound + idx) % 4 !== 0;
          return gotIt
            ? {
                ...p,
                correct: Math.min(nextRound, p.correct + 1),
                points: p.points + 650 + (3 - (idx % 3)) * 90
              }
            : p;
        });
        showToast(
          t('toasts.proceededRound', { round: nextRound, total: totalRounds }),
          'info'
        );
        return { ...prev, round: nextRound, players: updatedPlayers };
      } else {
        const resetPlayers = prev.players.map((p, idx) => ({
          ...p,
          correct: 1,
          points: 850 - idx * 60
        }));
        showToast(t('toasts.restartedRounds'), 'info');
        return { ...prev, round: 1, players: resetPlayers };
      }
    });
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setQuizzes(structuredClone(SEED_QUIZZES));
    setHistory(structuredClone(SEED_HISTORY));
    setActiveQuizIdState('biology');
    setSettings(DEFAULT_SETTINGS);
    showToast(t('toasts.workspaceRestored'));
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
        updateQuizQuestion,
        saveQuizChanges,
        history,
        activeAttemptId,
        setActiveAttemptId,
        practice,
        startPractice,
        selectPracticeAnswer,
        setPracticeQuestionIndex,
        finishPractice,
        generateQuiz,
        exportStudySheet,
        printKind,
        live,
        setLiveQuizId,
        setLiveTimer,
        createLiveRoom,
        joinLiveRoom,
        closeLiveRoom,
        advanceLiveRound,
        settings,
        updateSettings,
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
