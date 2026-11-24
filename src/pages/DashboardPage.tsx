import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatCard } from '../components/common';

export const DashboardPage: React.FC = () => {
  const {
    quizzes,
    history,
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
  const avgScoreDisplay = completedCount === 0 ? '—' : `${avgScore}%`;
  const practiceQuiz = practice.quizId
    ? quizzes.find((q) => q.id === practice.quizId) ?? null
    : null;
  const hasPracticeInProgress = Boolean(practiceQuiz);
  const answeredCount = hasPracticeInProgress ? Object.keys(practice.answers).length : 0;

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

      {savedCount === 0 && (
        <SectionCard className="banner-row" dataName="Create your first quiz">
          <div>
            <h2>{t('dashboard.firstQuizTitle')}</h2>
            <p>{t('dashboard.firstQuizBody')}</p>
          </div>
          <Link to="/generate" className="btn btn-primary">
            {t('dashboard.firstQuizBtn')}
          </Link>
        </SectionCard>
      )}

      <section
        className="stat-grid-3"
        data-name="Study overview"
        aria-label={t('dashboard.studyOverviewAria')}
      >
        <StatCard value={savedCount} label={t('dashboard.savedQuizzes')} to="/quizzes" />
        <StatCard value={completedCount} label={t('dashboard.completedAttempts')} to="/history" />
        <StatCard value={avgScoreDisplay} label={t('dashboard.averageScore')} />
      </section>

      {savedCount > 0 && (
        <SectionCard className="banner-row" dataName="Start from a document">
          <div>
            <h2>{t('dashboard.bannerTitle')}</h2>
            <p>{t('dashboard.bannerBody')}</p>
          </div>
          <Link to="/generate" className="btn btn-primary">
            {t('dashboard.createQuizBtn')}
          </Link>
        </SectionCard>
      )}

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
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-btn is-primary"
                          title={t('dashboard.openQuiz')}
                          aria-label={t('dashboard.openQuiz')}
                          onClick={() => {
                            setActiveQuizId(q.id);
                            navigate(`/quizzes/${encodeURIComponent(q.id)}`);
                          }}
                        >
                          <FolderOpen size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn is-danger"
                          title={t('review.deleteQuiz')}
                          aria-label={t('review.deleteQuiz')}
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
                          <Trash2 size={15} aria-hidden="true" />
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

      <section
        className={hasPracticeInProgress ? 'grid-2-equal' : undefined}
        data-name="Continue learning"
      >
        {hasPracticeInProgress && practiceQuiz && (
          <div className="box-card continue-card" data-name="Resume studying">
            <div>
              <div className="eyebrow">{t('dashboard.resumeEyebrow')}</div>
              <h3>{practiceQuiz.title}</h3>
              <p className="page-subtitle">
                {t('dashboard.resumeProgress', {
                  current: Math.min(
                    practice.questionIndex + 1,
                    Math.max(1, practiceQuiz.questionCount ?? practiceQuiz.questions.length)
                  ),
                  total: practiceQuiz.questionCount ?? practiceQuiz.questions.length,
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
          </div>
        )}

        <div className="box-card continue-card" data-name="Multiplayer shortcut">
          <div>
            <div className="eyebrow">{t('dashboard.multiplayerEyebrow')}</div>
            <h3>{t('dashboard.multiplayerTitle')}</h3>
            <p className="page-subtitle">{t('dashboard.multiplayerSubtitle')}</p>
          </div>
          <div className="btn-row">
            <Link to="/lobby?mode=host" className="btn btn-primary">
              {t('dashboard.hostGame')}
            </Link>
            <Link to="/lobby?mode=join" className="btn">
              {t('dashboard.joinWithPin')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
