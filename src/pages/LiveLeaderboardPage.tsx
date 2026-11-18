import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';

export const LiveLeaderboardPage: React.FC = () => {
  const { quizzes, activeQuiz, live, advanceLiveRound } = useApp();

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
        eyebrow="LIVE GAMES / 07"
        title="The leaderboard is in."
        subtitle={`${liveQuiz.title} · Room ${live.pin} · Host view`}
        actions={
          <Link to="/lobby" className="btn">
            End game
          </Link>
        }
      />

      <div className="status-bar-banner" data-name="Live session state">
        <strong style={{ fontSize: 12, letterSpacing: 0.6 }}>
          ROUND {round} OF {totalRounds} COMPLETE
        </strong>
        <span className="helper-text">
          {live.players.length} / {live.players.length} responses received
        </span>
      </div>

      <div className="review-columns" data-name="Live results columns">
        {/* Left: Current Standings */}
        <section className="box-card" data-name="Live leaderboard">
          <h2 className="panel-heading" style={{ marginBottom: 6 }}>
            Current standings
          </h2>
          <p className="helper-text" style={{ marginBottom: 18 }}>
            Points reward accuracy and faster correct answers.
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
            <span>RANK</span>
            <span>PLAYER</span>
            <span>CORRECT</span>
            <span>POINTS</span>
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
            Standings update after every question.
          </p>
        </section>

        {/* Right: Round Summary */}
        <aside className="box-card" data-name="Round summary">
          <h2 className="panel-heading" style={{ marginBottom: 12 }}>
            Last round
          </h2>
          <div className="eyebrow">QUESTION {String(round).padStart(2, '0')}</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 16px' }}>
            {currentQ.prompt}
          </h3>

          <div className="box-subtle" style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              CORRECT ANSWER
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
              <div className="helper-text">Answered correctly</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>8.4 s</div>
              <div className="helper-text">Average response</div>
            </div>
          </div>

          <p className="helper-text">
            {sortedPlayers[0]?.name || 'Maya'} answered correctly in 4.2 seconds and
            earned 920 points this round.
          </p>
        </aside>
      </div>

      <SectionCard className="banner-row" dataName="Next round controls">
        <div>
          <div className="eyebrow">
            UP NEXT / QUESTION {String((round % totalRounds) + 1).padStart(2, '0')}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            {nextQ.prompt}
          </h3>
          <p className="helper-text">
            {live.timerSeconds}-second timer starts when you continue.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={advanceLiveRound}>
          {round < totalRounds ? 'Next question →' : 'Restart rounds ↻'}
        </button>
      </SectionCard>

      <div className="box-card" style={{ padding: '14px 18px' }} data-name="Player view note">
        <span className="helper-text">
          Players see the same rankings while they wait for the next question.
        </span>
      </div>
    </>
  );
};
