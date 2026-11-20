import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export const LiveLobbyPage: React.FC = () => {
  const {
    quizzes,
    activeQuiz,
    live,
    setLiveQuizId,
    setLiveTimer,
    joinLiveRoom,
    showToast,
    t
  } = useApp();

  const [joinPin, setJoinPin] = useState<string>('');
  const [joinName, setJoinName] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) || activeQuiz;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(live.pin.replace(/\s+/g, '')).catch(() => {});
    showToast(t('toasts.pinCopied', { pin: live.pin }));
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/lobby`).catch(() => {});
    showToast(t('toasts.inviteLinkCopied'));
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = joinLiveRoom(joinPin, joinName);
    if (!res.ok) {
      setJoinError(res.error || t('lobby.invalidPinFallback'));
      return;
    }
    setJoinError('');
    setJoinPin('');
    setJoinName('');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.liveGames') }
        ]}
        title={t('lobby.title')}
        subtitle={t('lobby.subtitle', {
          quizTitle: liveQuiz.title,
          count: liveQuiz.questions.length
        })}
        actions={
          <Link to="/dashboard" className="btn">
            {t('lobby.closeRoom')}
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
            <div className="eyebrow">{t('lobby.inviteEyebrow')}</div>
            <div className="pin-display">{live.pin}</div>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              {t('lobby.inviteSteps')}
            </p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={handleCopyPin}>
                {t('lobby.copyPin')}
              </button>
              <button type="button" className="btn" onClick={handleCopyInviteLink}>
                {t('lobby.copyInviteLink')}
              </button>
            </div>
          </section>

          <SectionCard
            title={t('lobby.playersJoined', { count: live.players.length })}
            headerRight={<span className="helper-text">{t('lobby.waitingForHost')}</span>}
            headerStyle={{ marginBottom: 8 }}
            dataName="Connected players"
          >
            <div className="players-grid-2x2">
              {live.players.map((p, idx) => (
                <div key={idx} className="player-tile">
                  <strong>{p.name}</strong>
                  <span className="score-badge">
                    {p.status === 'Ready' ? t('lobby.playerStatusReady') : p.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="helper-text">{t('lobby.playersAppearHelper')}</p>
          </SectionCard>

          <div className="btn-row" data-name="Host controls">
            <Link to="/leaderboard" className="btn btn-primary">
              {t('lobby.startGame')}
            </Link>
            <span className="helper-text">
              {t('lobby.allPlayersConnected', { count: live.players.length })}
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
              {t('lobby.gameSetupTitle')}
            </h2>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="lobby-quiz-select">
                {t('lobby.quizLabel')}
              </label>
              <Select value={live.quizId} onValueChange={setLiveQuizId}>
                <SelectTrigger id="lobby-quiz-select" className="w-full">
                  <SelectValue placeholder={t('lobby.selectQuizPlaceholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {quizzes.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="helper-text">
                {t('lobby.quizMeta', { count: liveQuiz.questions.length })}
              </span>
            </div>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="lobby-timer-select">
                {t('lobby.timerLabel')}
              </label>
              <Select
                value={String(live.timerSeconds)}
                onValueChange={(val) => setLiveTimer(Number(val))}
              >
                <SelectTrigger id="lobby-timer-select" className="w-full">
                  <SelectValue placeholder={t('lobby.selectTimerPlaceholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[15, 20, 30, 45].map((sec) => (
                    <SelectItem key={sec} value={String(sec)}>
                      {t('common.seconds', { count: sec })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="helper-text" style={{ lineHeight: 1.6 }}>
              {t('lobby.scoringNote')}
              <br />
              {t('lobby.leaderboardNote')}
            </p>
          </section>

          <form
            className="box-card"
            onSubmit={handleJoinSubmit}
            data-name="Participant join panel"
          >
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              {t('lobby.joiningTitle')}
            </h2>
            <p className="helper-text" style={{ marginBottom: 14 }}>
              {t('lobby.joiningSubtitle')}
            </p>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="join-pin-input">
                {t('lobby.roomPinLabel')}
              </label>
              <input
                id="join-pin-input"
                className="input"
                type="text"
                maxLength={10}
                placeholder={t('lobby.roomPinPlaceholder')}
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label-caps" htmlFor="join-name-input">
                {t('lobby.displayNameLabel')}
              </label>
              <input
                id="join-name-input"
                className="input"
                type="text"
                maxLength={40}
                placeholder={t('lobby.displayNamePlaceholder')}
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
              {t('lobby.joinGameBtn')}
            </button>
          </form>
        </aside>
      </div>
    </>
  );
};
