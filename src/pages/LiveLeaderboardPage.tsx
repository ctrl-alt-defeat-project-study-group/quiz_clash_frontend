import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';

export const LiveLeaderboardPage: React.FC = () => {
  const { quizzes, activeQuiz, live, advanceLiveRound, submitLiveAnswer, t } = useApp();

  const activeQuestionKey = `${live.currentQuestion?.id || ''}:${live.round}:${live.timerSeconds}`;
  const [prevQuestionKey, setPrevQuestionKey] = useState<string>(activeQuestionKey);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(live.timerSeconds || 20);

  if (prevQuestionKey !== activeQuestionKey) {
    setPrevQuestionKey(activeQuestionKey);
    setRemainingSeconds(live.timerSeconds || 20);
  }

  useEffect(() => {
    if (!live.currentQuestion?.id) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeQuestionKey, live.currentQuestion?.id]);

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) ?? activeQuiz;
  const liveQuizTitle = liveQuiz?.title || t('nav.liveGames');
  const liveQuestions = liveQuiz?.questions ?? [];
  const totalRounds = Math.max(1, live.totalRounds || liveQuestions.length || 1);
  const round = Math.min(Math.max(1, live.round || 1), totalRounds);
  const fallbackQ = {
    prompt: live.currentQuestion?.prompt || 'Waiting for next question…',
    choices: live.currentQuestion?.choices.map((c) => c.text) || ['—', '—', '—', '—'],
    answer: 0
  };
  const currentQ =
    liveQuestions.length > 0
      ? liveQuestions[(round - 1) % liveQuestions.length] || fallbackQ
      : fallbackQ;
  const nextQ =
    liveQuestions.length > 0
      ? liveQuestions[round % liveQuestions.length] || currentQ
      : currentQ;
  const sortedPlayers = [...live.players].sort((a, b) => b.points - a.points);
  const answeredCount = live.players.filter((p) => p.status === 'Answered').length;

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
        subtitle={t(
          live.status === 'joined' ? 'leaderboard.playerSubtitle' : 'leaderboard.subtitle',
          {
            quizTitle: liveQuizTitle,
            pin: live.pin || '—'
          }
        )}
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

      {live.status === 'joined' && live.currentQuestion && (
        <SectionCard dataName="Active live question">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6
            }}
          >
            <div className="eyebrow">
              {t('leaderboard.questionEyebrow', {
                num: String(round).padStart(2, '0')
              })}
            </div>
            <span className="score-badge">
              {t('leaderboard.timeRemaining', { seconds: remainingSeconds })}
            </span>
          </div>
          <h2 className="panel-heading" style={{ marginBottom: 14 }}>
            {live.currentQuestion.prompt}
          </h2>
          <div className="grid-2-equal" style={{ gap: 10 }}>
            {[...live.currentQuestion.choices]
              .sort((a, b) => a.position - b.position)
              .map((choice) => {
                const isSelected = live.selectedChoiceId === choice.id;
                const revealedCorrectId =
                  live.lastAnswerResult?.correct_choice_id ||
                  live.lastRoundCorrectChoiceId;
                const isRevealedCorrect =
                  Boolean(revealedCorrectId) && revealedCorrectId === choice.id;
                const locked = Boolean(live.selectedChoiceId) || remainingSeconds === 0;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={`btn ${isSelected ? 'btn-primary' : ''}`}
                    style={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      ...(isRevealedCorrect
                        ? {
                            borderColor: 'var(--success-border)',
                            background: 'var(--success-bg)'
                          }
                        : {})
                    }}
                    disabled={locked}
                    onClick={() => submitLiveAnswer(choice.id)}
                  >
                    <strong>{String(choice.id).toUpperCase()}.</strong> {choice.text}
                  </button>
                );
              })}
          </div>
        </SectionCard>
      )}

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
                {answeredCount} / {live.players.length}
              </div>
              <div className="helper-text">{t('leaderboard.answeredCorrectly')}</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{live.timerSeconds} s</div>
              <div className="helper-text">{t('lobby.timerLabel')}</div>
            </div>
          </div>

          {sortedPlayers[0] && (
            <p className="helper-text">
              {sortedPlayers[0].name} · {sortedPlayers[0].points.toLocaleString()} pts
            </p>
          )}
        </aside>
      </div>

      {live.status !== 'joined' ? (
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void advanceLiveRound()}
          >
            {round < totalRounds
              ? t('leaderboard.nextQuestionBtn')
              : t('leaderboard.restartRoundsBtn')}
          </button>
        </SectionCard>
      ) : (
        <SectionCard dataName="Player waiting note">
          <span className="helper-text">{t('leaderboard.waitingForNextQuestion')}</span>
        </SectionCard>
      )}

      <div className="box-card" style={{ padding: '14px 18px' }} data-name="Player view note">
        <span className="helper-text">{t('leaderboard.playerViewNote')}</span>
      </div>
    </>
  );
};
