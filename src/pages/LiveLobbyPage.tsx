import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const { pin: routePin } = useParams<{ pin?: string }>();
  const navigate = useNavigate();
  const {
    user,
    quizzes,
    activeQuiz,
    live,
    settings,
    setLiveQuizId,
    setLiveTimer,
    createLiveRoom,
    joinLiveRoom,
    closeLiveRoom,
    advanceLiveRound,
    showToast,
    t
  } = useApp();

  const [joinPin, setJoinPin] = useState<string | null>(null);
  const [joinName, setJoinName] = useState<string>(settings.displayName || '');
  const [joinError, setJoinError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const displayedJoinPin = joinPin ?? routePin ?? '';

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) ?? activeQuiz;
  const liveQuizTitle = liveQuiz?.title || t('nav.liveGames');
  const liveQuizCount = liveQuiz?.questionCount ?? liveQuiz?.questions.length ?? 0;

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(live.pin.replace(/\s+/g, '')).catch(() => {});
    showToast(t('toasts.pinCopied', { pin: live.pin }));
  };

  const handleCopyInviteLink = () => {
    const cleanPin = live.pin.replace(/\s+/g, '');
    navigator.clipboard
      ?.writeText(`${window.location.origin}/rooms/${cleanPin}`)
      .catch(() => {});
    showToast(t('toasts.inviteLinkCopied'));
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createLiveRoom(live.quizId, live.timerSeconds);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await joinLiveRoom(displayedJoinPin, joinName);
      if (!res.ok) {
        setJoinError(res.error || t('lobby.invalidPinFallback'));
        return;
      }
      setJoinError('');
      setJoinPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartLiveGame = async () => {
    if (live.isLiveBackend && live.backendStatus === 'lobby') {
      await advanceLiveRound();
    }
    navigate('/leaderboard');
  };

  // Entry Screen: Create a room OR Join a room
  if (live.status === 'idle') {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.liveGames'), to: '/lobby' },
            { label: t('lobby.breadcrumbEntry') }
          ]}
          title={t('lobby.title')}
          subtitle={t('lobby.entrySubtitle')}
        />

        <div className="lobby-entry-grid" data-name="Live game entry">
          {/* Card 1: Create a Room */}
          <form
            className="box-card lobby-entry-card"
            onSubmit={handleCreateRoom}
            data-name="Create room panel"
          >
            <div className="lobby-entry-card-body">
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                {t('lobby.createRoomEyebrow')}
              </div>
              <h2 className="panel-heading" style={{ marginBottom: 6 }}>
                {t('lobby.createRoomTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 18 }}>
                {t('lobby.createRoomSubtitle')}
              </p>

              <div className="field-group">
                <label className="field-label-caps" htmlFor="entry-quiz-select">
                  {t('lobby.quizLabel')}
                </label>
                <Select value={live.quizId} onValueChange={setLiveQuizId}>
                  <SelectTrigger id="entry-quiz-select" className="w-full">
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
                  {t('lobby.quizMeta', { count: liveQuizCount })}
                </span>
              </div>

              <div className="field-group">
                <label className="field-label-caps" htmlFor="entry-timer-select">
                  {t('lobby.timerLabel')}
                </label>
                <Select
                  value={String(live.timerSeconds)}
                  onValueChange={(val) => setLiveTimer(Number(val))}
                >
                  <SelectTrigger id="entry-timer-select" className="w-full">
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
            </div>

            <div className="btn-row">
              {user ? (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || quizzes.length === 0}
                >
                  {t('lobby.createRoomBtn')}
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  {t('lobby.signInToHostBtn')}
                </Link>
              )}
            </div>
          </form>

          {/* Card 2: Join a Room */}
          <form
            className="box-card lobby-entry-card"
            onSubmit={handleJoinSubmit}
            data-name="Join room panel"
          >
            <div className="lobby-entry-card-body">
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                {t('lobby.joinRoomEyebrow')}
              </div>
              <h2 className="panel-heading" style={{ marginBottom: 6 }}>
                {t('lobby.joinRoomTitle')}
              </h2>
              <p className="helper-text" style={{ marginBottom: 18 }}>
                {t('lobby.joinRoomSubtitle')}
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
                  value={displayedJoinPin}
                  onChange={(e) => {
                    setJoinPin(e.target.value);
                    if (joinError) setJoinError('');
                  }}
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
            </div>

            <div className="btn-row">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {t('lobby.joinRoomBtn')}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Joined Player Lobby View
  if (live.status === 'joined') {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.liveGames'), onClick: closeLiveRoom },
            {
              label: t('lobby.breadcrumbRoom', { pin: live.pin }),
              siblingRoutes: [
                {
                  label: t('lobby.breadcrumbEntry'),
                  onClick: closeLiveRoom,
                  active: false
                },
                {
                  label: t('lobby.breadcrumbRoom', { pin: live.pin }),
                  active: true
                },
                {
                  label: t('leaderboard.title'),
                  to: '/leaderboard',
                  active: false
                }
              ]
            }
          ]}
          title={t('lobby.title')}
          subtitle={t('lobby.playerViewSubtitle', {
            pin: live.pin,
            quizTitle: liveQuizTitle
          })}
          actions={
            <button type="button" className="btn" onClick={closeLiveRoom}>
              {t('lobby.leaveRoom')}
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section className="pin-invitation-card" data-name="Joined room banner">
            <div className="eyebrow">{t('lobby.joinedRoomEyebrow')}</div>
            <div className="pin-display">{live.pin}</div>
            <p className="helper-text">
              {t('lobby.joinedAsHelper', {
                name: live.joinedPlayerName || settings.displayName || '—'
              })}
            </p>
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

          <div className="btn-row">
            <Link to="/leaderboard" className="btn btn-primary">
              {t('lobby.enterLiveGame')}
            </Link>
            <button type="button" className="btn" onClick={closeLiveRoom}>
              {t('lobby.leaveRoom')}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Active Host Lobby View
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.liveGames'), onClick: closeLiveRoom },
          {
            label: t('lobby.breadcrumbRoom', { pin: live.pin }),
            siblingRoutes: [
              {
                label: t('lobby.breadcrumbEntry'),
                onClick: closeLiveRoom,
                active: false
              },
              {
                label: t('lobby.breadcrumbRoom', { pin: live.pin }),
                active: true
              },
              {
                label: t('leaderboard.title'),
                to: '/leaderboard',
                active: false
              }
            ]
          }
        ]}
        title={t('lobby.title')}
        subtitle={t('lobby.subtitle', {
          quizTitle: liveQuizTitle,
          count: liveQuizCount
        })}
        actions={
          <button type="button" className="btn" onClick={closeLiveRoom}>
            {t('lobby.closeRoom')}
          </button>
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleStartLiveGame()}
            >
              {t('lobby.startGame')}
            </button>
            <span className="helper-text">
              {t('lobby.allPlayersConnected', { count: live.players.length })}
            </span>
          </div>
        </div>

        {/* Right Column: Game Setup */}
        <aside
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          data-name="Game setup"
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
                {t('lobby.quizMeta', { count: liveQuizCount })}
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
        </aside>
      </div>
    </>
  );
};
