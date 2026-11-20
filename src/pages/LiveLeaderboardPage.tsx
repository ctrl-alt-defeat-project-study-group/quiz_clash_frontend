import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';

export const LiveLeaderboardPage: React.FC = () => {
  const { quizzes, activeQuiz, live, advanceLiveRound, t } = useApp();

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) || activeQuiz;
  const totalRounds = liveQuiz.questions.length;
  const round = Math.min(Math.max(1, live.round), totalRounds);
  const currentQ =
    liveQuiz.questions[(round - 1) % totalRounds] || liveQuiz.questions[0];
  const nextQ = liveQuiz.questions[round % totalRounds] || currentQ;
  const sortedPlayers = [...live.players].sort((a, b) => b.points - a.points);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.liveGames'), to: '/lobby' },
          ...(live.status !== 'idle'
            ? [
                {
                  label: t('lobby.breadcrumbRoom', { pin: live.pin }),
                  to: '/lobby'
                }
              ]
            : []),
          {
            label: t('leaderboard.title'),
            siblingRoutes: [
              {
                label:
                  live.status !== 'idle'
                    ? t('lobby.breadcrumbRoom', { pin: live.pin })
                    : t('lobby.breadcrumbEntry'),
                to: '/lobby',
                active: false
              },
              { label: t('leaderboard.title'), to: '/leaderboard', active: true }
            ]
          }
        ]}
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.subtitle', {
          quizTitle: liveQuiz.title,
          pin: live.pin
        })}
        actions={
          <Link to="/lobby" className="btn">
            {t('leaderboard.endGame')}
          </Link>
        }
      />

      <div className="status-bar-banner" data-name="Live session state">
        <strong style={{ fontSize: 12, letterSpacing: 0.6 }}>
          {t('leaderboard.roundComplete', { round, total: totalRounds })}
        </strong>
        <span className="helper-text">
          {t('leaderboard.responsesReceived', {
            received: live.players.length,
            total: live.players.length
          })}
        </span>
      </div>

      <div className="review-columns" data-name="Live results columns">
        {/* Left: Current Standings */}
        <section className="box-card" data-name="Live leaderboard">
          <h2 className="panel-heading" style={{ marginBottom: 6 }}>
            {t('leaderboard.currentStandings')}
          </h2>
          <p className="helper-text" style={{ marginBottom: 18 }}>
            {t('leaderboard.pointsHelper')}
          </p>

          <div
            className="rank-row"
            style={{
              background: 'transparent',
              border: 0,
              padding: '4px 16px',
              marginBottom: 6,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-muted)'
            }}
          >
            <span>{t('leaderboard.colRank')}</span>
            <span>{t('leaderboard.colPlayer')}</span>
            <span>{t('leaderboard.colCorrect')}</span>
            <span>{t('leaderboard.colPoints')}</span>
          </div>

          {sortedPlayers.map((p, idx) => (
            <div key={p.name} className={`rank-row ${idx === 0 ? 'rank-1' : ''}`}>
              <span>{String(idx + 1).padStart(2, '0')}</span>
              <strong>{p.name}</strong>
              <span>
                {p.correct} / {round}
              </span>
              <strong>{p.points.toLocaleString()}</strong>
            </div>
          ))}

          <p className="helper-text" style={{ marginTop: 14 }}>
            {t('leaderboard.standingsUpdateNote')}
          </p>
        </section>

        {/* Right: Round Summary */}
        <aside className="box-card" data-name="Round summary">
          <h2 className="panel-heading" style={{ marginBottom: 12 }}>
            {t('leaderboard.lastRound')}
          </h2>
          <div className="eyebrow">
            {t('leaderboard.questionEyebrow', {
              num: String(round).padStart(2, '0')
            })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 16px' }}>
            {currentQ.prompt}
          </h3>

          <div className="box-subtle" style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              {t('leaderboard.correctAnswerEyebrow')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {currentQ.choices[currentQ.answer]}
            </div>
          </div>

          <div className="grid-2-equal" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                3 / {live.players.length}
              </div>
              <div className="helper-text">{t('leaderboard.answeredCorrectly')}</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>8.4 s</div>
              <div className="helper-text">{t('leaderboard.averageResponse')}</div>
            </div>
          </div>

          <p className="helper-text">
            {t('leaderboard.topPlayerSummary', {
              name: sortedPlayers[0]?.name || 'Maya'
            })}
          </p>
        </aside>
      </div>

      <SectionCard className="banner-row" dataName="Next round controls">
        <div>
          <div className="eyebrow">
            {t('leaderboard.upNextEyebrow', {
              num: String((round % totalRounds) + 1).padStart(2, '0')
            })}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            {nextQ.prompt}
          </h3>
          <p className="helper-text">
            {t('leaderboard.timerStartsNote', { seconds: live.timerSeconds })}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={advanceLiveRound}>
          {round < totalRounds
            ? t('leaderboard.nextQuestionBtn')
            : t('leaderboard.restartRoundsBtn')}
        </button>
      </SectionCard>

      <div className="box-card" style={{ padding: '14px 18px' }} data-name="Player view note">
        <span className="helper-text">{t('leaderboard.playerViewNote')}</span>
      </div>
    </>
  );
};
