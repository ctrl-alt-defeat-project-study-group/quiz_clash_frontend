import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';

export const LiveLobbyPage: React.FC = () => {
  const {
    quizzes,
    activeQuiz,
    live,
    setLiveQuizId,
    setLiveTimer,
    joinLiveRoom,
    showToast
  } = useApp();

  const [joinPin, setJoinPin] = useState<string>('');
  const [joinName, setJoinName] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) || activeQuiz;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(live.pin.replace(/\s+/g, '')).catch(() => {});
    showToast(`Room PIN ${live.pin} has been copied to the clipboard.`);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/lobby`).catch(() => {});
    showToast('Invitation link has been copied to the clipboard.');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = joinLiveRoom(joinPin, joinName);
    if (!res.ok) {
      setJoinError(res.error || 'Invalid PIN');
      return;
    }
    setJoinError('');
    setJoinPin('');
    setJoinName('');
  };

  return (
    <>
      <PageHeader
        eyebrow="LIVE GAMES / 06"
        title="Better together. Ready to compete?"
        subtitle={`Host view · ${liveQuiz.title} · ${liveQuiz.questions.length} questions`}
        actions={
          <Link to="/" className="btn">
            Close room
          </Link>
        }
      />

      <div className="review-columns" data-name="Lobby columns">
        {/* Left Column: Host Lobby */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          data-name="Host lobby"
        >
          <section className="pin-invitation-card" data-name="Room invitation">
            <div className="eyebrow">INVITE FRIENDS WITH THIS ROOM PIN</div>
            <div className="pin-display">{live.pin}</div>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              Open QuizClash → Join game → Enter the PIN
            </p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={handleCopyPin}>
                Copy PIN
              </button>
              <button type="button" className="btn" onClick={handleCopyInviteLink}>
                Copy invite link
              </button>
            </div>
          </section>

          <SectionCard
            title={`${live.players.length} players joined`}
            headerRight={<span className="helper-text">Waiting for the host</span>}
            headerStyle={{ marginBottom: 8 }}
            dataName="Connected players"
          >
            <div className="players-grid-2x2">
              {live.players.map((p, idx) => (
                <div key={idx} className="player-tile">
                  <strong>{p.name}</strong>
                  <span className="score-badge">{p.status}</span>
                </div>
              ))}
            </div>

            <p className="helper-text">Players appear here as soon as they join.</p>
          </SectionCard>

          <div className="btn-row" data-name="Host controls">
            <Link to="/leaderboard" className="btn btn-primary">
              Start game →
            </Link>
            <span className="helper-text">
              All {live.players.length} players are connected.
            </span>
          </div>
        </div>

        {/* Right Column: Game Setup & Participant Entry */}
        <aside
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          data-name="Game setup and participant entry"
        >
          <section className="box-card" data-name="Session settings">
            <h2 className="panel-heading" style={{ marginBottom: 14 }}>
              Game setup
            </h2>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="lobby-quiz-select">
                QUIZ
              </label>
              <select
                id="lobby-quiz-select"
                className="select"
                value={live.quizId}
                onChange={(e) => setLiveQuizId(e.target.value)}
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
              <span className="helper-text">
                {liveQuiz.questions.length} questions · Multiple choice
              </span>
            </div>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="lobby-timer-select">
                TIME PER QUESTION
              </label>
              <select
                id="lobby-timer-select"
                className="select"
                value={live.timerSeconds}
                onChange={(e) => setLiveTimer(Number(e.target.value))}
              >
                {[15, 20, 30, 45].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} seconds
                  </option>
                ))}
              </select>
            </div>

            <p className="helper-text" style={{ lineHeight: 1.6 }}>
              Scoring: Accuracy + answer speed
              <br />
              Leaderboard: After every round
            </p>
          </section>

          <form
            className="box-card"
            onSubmit={handleJoinSubmit}
            data-name="Participant join panel"
          >
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              Joining someone else?
            </h2>
            <p className="helper-text" style={{ marginBottom: 14 }}>
              Enter a room PIN and your display name.
            </p>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="join-pin-input">
                ROOM PIN
              </label>
              <input
                id="join-pin-input"
                className="input"
                type="text"
                maxLength={10}
                placeholder="Enter 6-digit PIN (e.g. 482 619)"
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="join-name-input">
                DISPLAY NAME
              </label>
              <input
                id="join-name-input"
                className="input"
                type="text"
                maxLength={40}
                placeholder="Your name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>

            {joinError && (
              <p className="error-text" role="alert" style={{ marginBottom: 10 }}>
                {joinError}
              </p>
            )}

            <button type="submit" className="btn btn-primary">
              Join game →
            </button>
          </form>
        </aside>
      </div>
    </>
  );
};
