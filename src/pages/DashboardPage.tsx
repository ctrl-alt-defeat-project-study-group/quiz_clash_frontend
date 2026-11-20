import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatCard } from '../components/common';

export const DashboardPage: React.FC = () => {
  const { quizzes, history, activeQuiz, practice, setActiveQuizId, t } = useApp();
  const navigate = useNavigate();

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.scorePct, 0) / history.length)
    : 82;
  const savedCount = Math.max(12, quizzes.length);
  const completedCount = Math.max(28, history.length);
  const answeredCount = Object.keys(practice.answers).length;

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
        <StatCard value={savedCount} label={t('dashboard.savedQuizzes')} />
        <StatCard value={completedCount} label={t('dashboard.completedAttempts')} />
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
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td>
                    <strong>{q.title}</strong>
                  </td>
                  <td>{t('common.questionsCount', { count: q.questions.length })}</td>
                  <td>
                    <span className="score-badge">{q.lastScore ?? 80}%</span>
                  </td>
                  <td>{q.updated || t('common.today')}</td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <section className="grid-2-equal" data-name="Continue learning">
        <div className="box-card continue-card" data-name="Resume studying">
          <div>
            <div className="eyebrow">{t('dashboard.resumeEyebrow')}</div>
            <h3>{activeQuiz.title}</h3>
            <p className="page-subtitle">
              {t('dashboard.resumeProgress', {
                current: Math.min(practice.questionIndex + 1, activeQuiz.questions.length),
                total: activeQuiz.questions.length,
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
