import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  Bookmark,
  Clock,
  Flag,
  Layers,
  LogOut,
  Terminal,
  User,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';

const LETTERS = ['A', 'B', 'C', 'D'];
const pad2 = (n: number) => String(n).padStart(2, '0');

export const SoloQuizPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    activeQuiz,
    loadQuizDetails,
    practice,
    startPractice,
    resetPractice,
    selectPracticeAnswer,
    setPracticeQuestionIndex,
    finishPractice,
    openModal,
    showToast,
    t
  } = useApp();

  const navigate = useNavigate();
  const [bookmarksByQuiz, setBookmarksByQuiz] = useState<Record<string, number[]>>({});
  const [exitModalOpen, setExitModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!exitModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExitModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exitModalOpen]);

  useEffect(() => {
    if (id && id !== practice.quizId && quizzes.some((q) => q.id === id)) {
      startPractice(id);
    }
  }, [id, practice.quizId, quizzes, startPractice]);

  const quiz = quizzes.find((q) => q.id === practice.quizId) ?? activeQuiz;

  useEffect(() => {
    if (quiz?.backendId && !quiz.questionsLoaded) {
      void loadQuizDetails(quiz.id, 'play');
    }
  }, [quiz, loadQuizDetails]);

  const total = quiz?.questions.length ?? 0;
  const idx = Math.min(Math.max(0, practice.questionIndex), Math.max(0, total - 1));
  const questionOrder =
    practice.quizId === quiz?.id && practice.questionOrder.length === total
      ? practice.questionOrder
      : Array.from({ length: total }, (_, i) => i);
  const origIdx = questionOrder[idx] ?? idx;
  const quizId = quiz?.id ?? '';
  const bookmarks = bookmarksByQuiz[quizId] ?? [];
  const isBookmarked = bookmarks.includes(idx);

  const toggleBookmark = useCallback(() => {
    if (!quizId) return;
    setBookmarksByQuiz((prev) => {
      const current = prev[quizId] ?? [];
      const exists = current.includes(idx);
      const next = exists ? current.filter((i) => i !== idx) : [...current, idx];
      return { ...prev, [quizId]: next };
    });
    showToast(
      isBookmarked ? t('solo.removeBookmark') : t('solo.bookmarkQuestion'),
      'info'
    );
  }, [idx, isBookmarked, quizId, showToast, t]);

  useEffect(() => {
    if (!quiz || total === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      const letterIdx = LETTERS.indexOf(key);
      if (letterIdx >= 0 && letterIdx < (quiz.questions[origIdx]?.choices.length ?? 0)) {
        e.preventDefault();
        selectPracticeAnswer(origIdx, letterIdx);
        return;
      }
      if (key === 'M') {
        e.preventDefault();
        toggleBookmark();
        return;
      }
      if (key === 'ARROWLEFT' && idx > 0) {
        e.preventDefault();
        setPracticeQuestionIndex(idx - 1);
      } else if (key === 'ARROWRIGHT' && idx < total - 1) {
        e.preventDefault();
        setPracticeQuestionIndex(idx + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [idx, origIdx, quiz, selectPracticeAnswer, setPracticeQuestionIndex, toggleBookmark, total]);

  if (!quiz) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.yourLibrary'), to: '/quizzes' }
          ]}
          title={t('nav.myQuizzes')}
          subtitle={t('solo.subtitle')}
        />
        <SectionCard>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'flex-start'
            }}
          >
            <p className="helper-text">{t('dashboard.bannerTitle')}</p>
            <Link to="/generate" className="btn btn-primary">
              {t('dashboard.createQuizBtn')}
            </Link>
          </div>
        </SectionCard>
      </>
    );
  }

  const currentQ = quiz.questions[origIdx] ||
    quiz.questions[0] || {
      prompt: 'Loading question…',
      choices: ['—', '—', '—', '—'],
      answer: 0
    };
  const selectedChoice = practice.answers[origIdx];
  const answeredCount = Object.keys(practice.answers).filter(
    (k) => Number(k) < total
  ).length;
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const submitAttemptNow = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const attempt = await finishPractice();
      if (attempt) {
        navigate(`/attempts/${encodeURIComponent(attempt.id)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (submitting) return;
    const remaining = Math.max(0, total - answeredCount);
    if (remaining > 0) {
      openModal({
        title: t('solo.unansweredConfirmTitle'),
        message: t('solo.unansweredConfirmMsg', { count: remaining }),
        confirmLabel: t('solo.submitAnywayBtn'),
        onConfirm: () => {
          void submitAttemptNow();
        }
      });
      return;
    }
    void submitAttemptNow();
  };

  return (
    <div className="qp-workspace" data-name="Solo practice player">
      {/* Indigo Hero Banner */}
      <section className="qp-hero" aria-labelledby="solo-quiz-title">
        <div className="qp-hero-text">
          <div className="qp-eyeline">
            <User size={15} aria-hidden="true" />
            <span>{t('solo.eyebrow')}</span>
          </div>
          <h1 id="solo-quiz-title">{quiz.title}</h1>
          <div className="qp-hero-meta">
            <span>
              <Layers size={15} aria-hidden="true" />
              {t('common.questionsCount', { count: total })}
            </span>
            <i className="qp-sep" aria-hidden="true" />
            <span>
              <Clock size={15} aria-hidden="true" />
              {t('solo.untimed')}
            </span>
          </div>
        </div>

        <div className="qp-hero-actions">
          <button
            type="button"
            className="qp-hero-btn"
            onClick={() => setExitModalOpen(true)}
            data-name="Exit quiz"
          >
            <LogOut size={15} aria-hidden="true" />
            <span>{t('solo.exitBtn')}</span>
          </button>
        </div>

        <div className="qp-hero-art" aria-hidden="true">
          <div className="qp-mesh" />
          <i className="qp-star s1">✦</i>
          <div className="qp-deck">
            <div className="qp-tile back" />
            <div className="qp-tile mid" />
            <div className="qp-tile front">
              <Terminal size={42} strokeWidth={2.2} />
            </div>
          </div>
          <i className="qp-star s2">✦</i>
        </div>
      </section>

      {/* Main Two-Column Play Area */}
      <div className="qp-layout" data-name="Practice columns">
        {/* Left: Active Question Card */}
        <article className="qp-card qp-play-card" data-name="Active question">
          <div className="qp-card-body">
            <div className="qp-question-meta">
              <div className="qp-counter">
                <span className="qp-q-tag">
                  {t('results.questionEyebrow', { num: pad2(idx + 1) })}
                </span>
                <span className="qp-q-total">/ {pad2(total)}</span>
              </div>

              <div className="qp-meta-right">
                <button
                  type="button"
                  className="qp-icon-btn"
                  aria-pressed={isBookmarked}
                  aria-label={
                    isBookmarked ? t('solo.removeBookmark') : t('solo.bookmarkQuestion')
                  }
                  title={
                    isBookmarked ? t('solo.removeBookmark') : t('solo.bookmarkQuestion')
                  }
                  onClick={toggleBookmark}
                >
                  <Bookmark
                    size={18}
                    fill={isBookmarked ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <h2 className="qp-question">{currentQ.prompt}</h2>
            <p className="qp-choice-legend">{t('solo.selectOneAnswer')}</p>

            <div className="qp-choices" role="radiogroup" aria-label={currentQ.prompt}>
              {currentQ.choices.map((choiceText, cIdx) => {
                const isSelected = selectedChoice === cIdx;
                return (
                  <button
                    key={cIdx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`qp-choice ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => selectPracticeAnswer(origIdx, cIdx)}
                  >
                    <span className="qp-letter" aria-hidden="true">
                      {LETTERS[cIdx] ?? String(cIdx + 1)}
                    </span>
                    <span className="qp-choice-text">{choiceText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="qp-card-nav" data-name="Practice navigation">
            <button
              type="button"
              className="qp-btn"
              disabled={idx === 0}
              onClick={() => setPracticeQuestionIndex(idx - 1)}
            >
              {t('solo.previousBtn')}
            </button>

            <button
              type="button"
              className="qp-btn primary"
              disabled={submitting && idx >= total - 1}
              onClick={() => {
                if (idx >= total - 1) {
                  handleFinish();
                } else {
                  setPracticeQuestionIndex(idx + 1);
                }
              }}
            >
              {idx >= total - 1
                ? submitting
                  ? t('solo.submittingBtn')
                  : t('solo.finishQuizBtn')
                : t('solo.nextQuestionBtn')}
            </button>
          </footer>
        </article>

        {/* Right: Progress & Question Map */}
        <div className="qp-side-wrap">
          <aside className="qp-card qp-side-card" data-name="Question navigator">
            <div className="qp-card-heading">
              <h2>{t('solo.yourProgress')}</h2>
              <BarChart3 size={19} aria-hidden="true" />
            </div>

            <div className="qp-progress-copy">
              <span>{t('solo.answeredOf', { answered: answeredCount, total })}</span>
              <span className="qp-percentage">{pct}%</span>
            </div>

            <div
              className="qp-progress-track"
              role="progressbar"
              aria-label={t('solo.progressAria')}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={answeredCount}
            >
              <div className="qp-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            <h3 className="qp-map-title">{t('solo.questionMap')}</h3>
            <div className="qp-map-grid">
              {questionOrder.map((mappedOrigIdx, i) => {
                const isCurrent = i === idx;
                const isDone = practice.answers[mappedOrigIdx] !== undefined;
                const isMarked = bookmarks.includes(i);
                const cls = [
                  'qp-map-button',
                  isCurrent && 'current',
                  isDone && 'done',
                  isMarked && 'marked'
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    aria-current={isCurrent ? 'step' : undefined}
                    onClick={() => setPracticeQuestionIndex(i)}
                  >
                    {pad2(i + 1)}
                  </button>
                );
              })}
            </div>

            <div className="qp-legend">
              <span>
                <i className="qp-sw here" />
                {t('solo.legendCurrent', { num: pad2(idx + 1) })}
              </span>
              <span>
                <i className="qp-sw answered" />
                {t('solo.legendAnswered', { count: answeredCount })}
              </span>
              <span>
                <i className="qp-sw" />
                {t('solo.legendOpen')}
              </span>
              {bookmarks.length > 0 && (
                <span>
                  <i className="qp-sw marked" />
                  {t('solo.legendBookmarked')} ({bookmarks.length})
                </span>
              )}
            </div>

            <div className="qp-side-footer">
              <button
                type="button"
                className="qp-btn"
                disabled={submitting}
                onClick={handleFinish}
              >
                <Flag size={16} aria-hidden="true" />
                <span>{submitting ? t('solo.submittingBtn') : t('solo.finishQuizBtn')}</span>
              </button>
            </div>
          </aside>

          <p className="qp-shortcut-note">
            <kbd>A</kbd>–<kbd>D</kbd> {t('solo.shortcutChoose')} · <kbd>M</kbd>{' '}
            {t('solo.shortcutBookmark')}
          </p>
        </div>
      </div>

      {/* Exit Confirmation Popup Modal */}
      {exitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="solo-exit-modal-title"
          onClick={() => setExitModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 15, 25, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="box-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 100%)',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <h2
                id="solo-exit-modal-title"
                style={{ fontSize: 17, fontWeight: 700, margin: 0 }}
              >
                {t('solo.exitModalTitle')}
              </h2>
              <button
                type="button"
                className="btn btn-sm"
                aria-label={t('review.closePreview')}
                onClick={() => setExitModalOpen(false)}
                style={{ padding: '6px 8px' }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              <p className="helper-text" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
                {t('solo.exitModalDesc')}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '14px 20px',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={() => setExitModalOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  resetPractice();
                  setExitModalOpen(false);
                  navigate('/dashboard');
                }}
              >
                {t('solo.exitWithoutSaving')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setExitModalOpen(false);
                  showToast(t('toasts.practiceProgressSaved'), 'info');
                  navigate('/dashboard');
                }}
              >
                {t('solo.saveAndExit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
