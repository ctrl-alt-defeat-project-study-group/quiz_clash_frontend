import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatCard } from '../components/common';

export const DashboardPage: React.FC = () => {
  const {
    quizzes,
    history,
    activeQuiz,
    practice,
    setActiveQuizId,
    deleteQuiz,
    openModal,
    t
  } = useApp();
  const navigate = useNavigate();

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.scorePct, 0) / history.length)
    : 0;
  const savedCount = quizzes.length;
  const completedCount = history.length;
  const isResumingActiveQuiz = Boolean(activeQuiz && practice.quizId === activeQuiz.id);
  const answeredCount = isResumingActiveQuiz ? Object.keys(practice.answers).length : 0;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.dashboard') }
        ]}
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      <section
        className="stat-grid-3"
        data-name="Study overview"
        aria-label={t('dashboard.studyOverviewAria')}
      >
        <StatCard value={savedCount} label={t('dashboard.savedQuizzes')} to="/quizzes" />
        <StatCard value={completedCount} label={t('dashboard.completedAttempts')} to="/history" />
        <StatCard value={`${avgScore}%`} label={t('dashboard.averageScore')} />
      </section>

      <SectionCard className="banner-row" dataName="Start from a document">
        <div>
          <h2>{t('dashboard.bannerTitle')}</h2>
          <p>{t('dashboard.bannerBody')}</p>
        </div>
        <Link to="/generate" className="btn btn-primary">
          {t('dashboard.createQuizBtn')}
        </Link>
      </SectionCard>

      <SectionCard
        title={t('dashboard.recentQuizzes')}
        headerRight={
          <Link to="/quizzes" className="text-link">
            {t('dashboard.viewAllQuizzes')}
          </Link>
        }
        dataName="Recent quizzes"
      >
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('dashboard.colQuizName')}</th>
                <th>{t('dashboard.colQuestions')}</th>
                <th>{t('dashboard.colLastScore')}</th>
                <th>{t('dashboard.colUpdated')}</th>
                <th>{t('dashboard.colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="helper-text" style={{ textAlign: 'center', padding: 24 }}>
                    <Link to="/generate" className="text-link">
                      {t('dashboard.createQuizBtn')}
                    </Link>
                  </td>
                </tr>
              ) : (
                quizzes.slice(0, 5).map((q) => (
                  <tr key={q.id}>
                    <td>
                      <strong>{q.title}</strong>
                    </td>
                    <td>
                      {t('common.questionsCount', {
                        count: q.questionCount ?? q.questions.length
                      })}
                    </td>
                    <td>
                      <span className="score-badge">{q.lastScore ?? 0}%</span>
                    </td>
                    <td>{q.updated || t('common.today')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => {
                            setActiveQuizId(q.id);
                            navigate(`/quizzes/${encodeURIComponent(q.id)}`);
                          }}
                        >
                          {t('dashboard.openQuiz')}
                        </button>
                        <button
                          type="button"
                          className="text-link"
                          style={{ color: 'var(--danger, #dc2626)' }}
                          onClick={() => {
                            openModal({
                              title: t('review.deleteQuizConfirmTitle'),
                              message: t('review.deleteQuizConfirmMsg', { title: q.title }),
                              confirmLabel: t('review.deleteQuiz'),
                              onConfirm: () => {
                                void deleteQuiz(q.id);
                              }
                            });
                          }}
                        >
                          {t('review.deleteQuiz')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <section className="grid-2-equal" data-name="Continue learning">
        <div className="box-card continue-card" data-name="Resume studying">
          {activeQuiz ? (
            <>
              <div>
                <div className="eyebrow">{t('dashboard.resumeEyebrow')}</div>
                <h3>{activeQuiz.title}</h3>
                <p className="page-subtitle">
                  {t('dashboard.resumeProgress', {
                    current: isResumingActiveQuiz
                      ? Math.min(
                          practice.questionIndex + 1,
                          Math.max(1, activeQuiz.questionCount ?? activeQuiz.questions.length)
                        )
                      : 1,
                    total: activeQuiz.questionCount ?? activeQuiz.questions.length,
                    status: answeredCount
                      ? t('dashboard.statusInProgress')
                      : t('dashboard.statusReady')
                  })}
                </p>
              </div>
              <div className="btn-row">
                <Link to="/play" className="btn btn-primary">
                  {t('dashboard.continueQuiz')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="eyebrow">{t('dashboard.resumeEyebrow')}</div>
                <h3>{t('dashboard.bannerTitle')}</h3>
                <p className="page-subtitle">{t('dashboard.bannerBody')}</p>
              </div>
              <div className="btn-row">
                <Link to="/generate" className="btn btn-primary">
                  {t('dashboard.createQuizBtn')}
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="box-card continue-card" data-name="Multiplayer shortcut">
          <div>
            <div className="eyebrow">{t('dashboard.multiplayerEyebrow')}</div>
            <h3>{t('dashboard.multiplayerTitle')}</h3>
            <p className="page-subtitle">{t('dashboard.multiplayerSubtitle')}</p>
          </div>
          <div className="btn-row">
            <Link to="/lobby" className="btn btn-primary">
              {t('dashboard.hostGame')}
            </Link>
            <Link to="/lobby" className="btn">
              {t('dashboard.joinWithPin')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
