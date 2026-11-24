import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttemptDetailsSkeleton, PageHeader, SectionCard, StatCard } from '../components/common';

export const AttemptDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    history,
    activeAttemptId,
    setActiveAttemptId,
    loadAttemptDetails,
    activeQuiz,
    settings,
    startPractice,
    exportStudySheet,
    exportingKind,
    t
  } = useApp();

  const navigate = useNavigate();
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);

  useEffect(() => {
    if (id && history.some((h) => h.id === id)) {
      setActiveAttemptId(id);
    }
  }, [id, history, setActiveAttemptId]);

  const attempt =
    (id && history.find((h) => h.id === id)) ||
    history.find((h) => h.id === activeAttemptId) ||
    history[0] ||
    null;

  useEffect(() => {
    if (attempt?.backendId && !attempt.detailsLoaded) {
      void loadAttemptDetails(attempt.id);
    }
  }, [attempt, loadAttemptDetails]);

  if (!attempt) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.attemptHistory'), to: '/history' }
          ]}
          title={t('nav.attemptHistory')}
          subtitle={t('results.scoreTrendSubtitle')}
        />
        <SectionCard>
          <Link to="/history" className="btn btn-primary">
            {t('common.back')}
          </Link>
        </SectionCard>
      </>
    );
  }

  const quiz = quizzes.find((q) => q.id === attempt.quizId) ?? activeQuiz;
  const missedList = attempt.missed || [];
  const isLoadingDetails = Boolean(attempt.backendId && !attempt.detailsLoaded);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.attemptHistory'), to: '/history' },
          {
            label: `${attempt.quizTitle} · ${attempt.dateLabel}`,
            siblingRoutes: history.map((h) => ({
              label: `${h.quizTitle} · ${h.dateLabel}`,
              active: h.id === attempt.id,
              onClick: () => {
                setActiveAttemptId(h.id);
                setShowAllAnswers(false);
                navigate(`/attempts/${encodeURIComponent(h.id)}`);
              }
            }))
          }
        ]}
        title={attempt.quizTitle}
        subtitle={t('results.detailSubtitle', { date: attempt.dateLabel })}
        actions={
          <Link to="/history" className="btn">
            {t('common.back')}
          </Link>
        }
      />

      <section
        className="stat-grid-4"
        data-name="Attempt summary"
        aria-label={t('results.attemptSummaryAria')}
      >
        <StatCard value={`${attempt.scorePct}%`} label={t('results.yourScore')} />
        <StatCard
          value={`${attempt.correct} / ${attempt.total}`}
          label={t('results.correctAnswers')}
        />
        <StatCard value={attempt.duration} label={t('results.timeTaken')} />
        <StatCard value={attempt.deltaPts} label={t('results.fromLastAttempt')} />
      </section>

      <SectionCard
        title={
          isLoadingDetails
            ? t('results.loadingDetails')
            : showAllAnswers
            ? t('results.allQuestionsTitle', {
                count: attempt.questionResults?.length ?? quiz?.questions.length ?? attempt.total,
                title: quiz?.title ?? attempt.quizTitle
              })
            : missedList.length === 1
            ? t('results.missedSingleTitle')
            : missedList.length > 1
            ? t('results.missedPluralTitle', { count: missedList.length })
            : t('results.perfectScoreTitle')
        }
        headerRight={
          !isLoadingDetails ? (
            <button
              type="button"
              className="text-link"
              onClick={() => setShowAllAnswers((prev) => !prev)}
            >
              {showAllAnswers
                ? t('results.showMissedOnly')
                : t('results.viewAllAnswers')}
            </button>
          ) : undefined
        }
        dataName="Missed question review"
      >
        {isLoadingDetails ? (
          <AttemptDetailsSkeleton />
        ) : (
        <div className="missed-grid">
          {showAllAnswers
            ? attempt.questionResults && attempt.questionResults.length > 0
              ? attempt.questionResults.map((qr, idx) => (
                  <article
                    key={qr.question_id || idx}
                    className={`feedback-card ${qr.is_correct ? 'is-right' : 'is-wrong'}`}
                  >
                    <div className="eyebrow">
                      {t('results.questionEyebrow', {
                        num: String(idx + 1).padStart(2, '0')
                      })}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{qr.question_prompt}</h3>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <div>
                        {t('results.yourAnswerLabel')}{' '}
                        <strong>{qr.selected_choice_text}</strong>
                      </div>
                      <div>
                        {t('results.correctAnswerLabel')}{' '}
                        <strong>{qr.correct_choice_text}</strong>
                      </div>
                    </div>
                    {settings.showExplanations && (
                      <p className="helper-text">
                        {qr.explanation || t('results.verifiedExplanation')}
                      </p>
                    )}
                  </article>
                ))
              : (quiz?.questions ?? []).map((q, idx) => (
                  <article key={idx} className="feedback-card is-right">
                    <div className="eyebrow">
                      {t('results.questionEyebrow', {
                        num: String(idx + 1).padStart(2, '0')
                      })}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{q.prompt}</h3>
                    <p style={{ fontSize: 13 }}>
                      <strong>{t('results.correctAnswerLabel')}</strong> {q.choices[q.answer]}
                    </p>
                    {settings.showExplanations && (
                      <p className="helper-text">
                        {q.explanation || t('results.verifiedExplanation')}
                      </p>
                    )}
                  </article>
                ))
            : missedList.map((m, idx) => (
                <article key={idx} className="feedback-card is-wrong">
                  <div className="eyebrow">
                    {t('results.questionEyebrow', {
                      num: String(m.number).padStart(2, '0')
                    })}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{m.prompt}</h3>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <div>
                      {t('results.yourAnswerLabel')} <strong>{m.yourAnswer}</strong>
                    </div>
                    <div>
                      {t('results.correctAnswerLabel')} <strong>{m.correctAnswer}</strong>
                    </div>
                  </div>
                  {settings.showExplanations && (
                    <p className="helper-text">{m.explanation}</p>
                  )}
                </article>
              ))}
        </div>
        )}
      </SectionCard>

      <div className="btn-row" data-name="Results actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(attempt.quizId);
            navigate(`/quizzes/${encodeURIComponent(attempt.quizId)}/play`);
          }}
        >
          {t('results.retakeQuiz')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void exportStudySheet('answers', 'pdf', attempt.quizId)}
          disabled={exportingKind !== null}
          aria-busy={exportingKind === 'answers'}
          style={{ gap: 8 }}
        >
          {exportingKind === 'answers' ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          <span>
            {exportingKind === 'answers'
              ? t('review.downloadingAnswerKey')
              : t('results.downloadAnswerKey')}
          </span>
        </button>
        <Link to="/lobby" className="btn">
          {t('results.challengeFriends')}
        </Link>
      </div>
    </>
  );
};
