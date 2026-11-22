import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  Copy,
  Crown,
  Gamepad2,
  Layers,
  Link2,
  LogOut,
  Play,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingToggleRow, UserAvatar } from '../components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

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
    joinAsHostPlayer,
    leaveAsHostPlayer,
    markLivePlayerReady,
    closeLiveRoom,
    advanceLiveRound,
    showToast,
    t
  } = useApp();

  const [joinPin, setJoinPin] = useState<string | null>(null);
  const [joinName, setJoinName] = useState<string>(settings.displayName || '');
  const [joinError, setJoinError] = useState<string>('');
  const [participateAsHost, setParticipateAsHost] = useState<boolean>(true);
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
      await createLiveRoom(live.quizId, live.timerSeconds, { participateAsHost });
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

  const cleanLivePin = live.pin.replace(/\s+/g, '');
  const livePlayPath = cleanLivePin
    ? `/rooms/${encodeURIComponent(cleanLivePin)}/play`
    : '/rooms/play';

  const handleEnterLiveGame = async () => {
    await markLivePlayerReady();
    navigate(livePlayPath);
  };

  const handleStartLiveGame = async () => {
    if (live.playerId) {
      await markLivePlayerReady();
    }
    if (live.isLiveBackend && live.backendStatus === 'lobby') {
      await advanceLiveRound();
    }
    navigate(livePlayPath);
  };

  // Entry Screen: Host a Game OR Join a Game
  if (live.status === 'idle') {
    return (
      <div className="qp-workspace" data-name="Live game entry">
        <section className="qp-hero qg-arena-hero" aria-labelledby="lobby-entry-title">
          <div className="qp-hero-text">
            <div className="qp-eyeline">
              <span className="qg-live-dot" aria-hidden="true" />
              <span>{t('lobby.eyebrow')}</span>
            </div>
            <h1 id="lobby-entry-title">{t('lobby.title')}</h1>
            <div className="qp-hero-meta">
              <span>{t('lobby.entrySubtitle')}</span>
            </div>
          </div>

          <div className="qp-hero-art" aria-hidden="true">
            <div className="qp-mesh" />
            <i className="qp-star s1">✦</i>
            <div className="qp-deck">
              <div className="qp-tile back" />
              <div className="qp-tile mid" />
              <div className="qp-tile front">
                <Gamepad2 size={42} strokeWidth={2.1} />
              </div>
            </div>
            <i className="qp-star s2">✦</i>
          </div>
        </section>

        <div className="qg-lobby-grid">
          {/* Card 1: Host a Game */}
          <form
            className="qg-entry-card"
            onSubmit={handleCreateRoom}
            data-name="Create room panel"
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}
              >
                <Crown size={18} style={{ color: 'var(--qp-accent)' }} aria-hidden="true" />
                <span className="eyebrow" style={{ margin: 0 }}>
                  {t('lobby.createRoomEyebrow')}
                </span>
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

              <SettingToggleRow
                label={t('leaderboard.participateAsHostLabel')}
                description={t('leaderboard.participateAsHostDesc')}
                checked={participateAsHost}
                onToggle={() => setParticipateAsHost((prev) => !prev)}
              />
            </div>

            <div className="btn-row">
              {user ? (
                <button
                  type="submit"
                  className="qp-btn primary"
                  style={{ width: '100%' }}
                  disabled={submitting || quizzes.length === 0}
                >
                  <Play size={16} aria-hidden="true" />
                  <span>{t('lobby.createRoomBtn')}</span>
                </button>
              ) : (
                <Link to="/login" className="qp-btn primary" style={{ width: '100%' }}>
                  {t('lobby.signInToHostBtn')}
                </Link>
              )}
            </div>
          </form>

          {/* Card 2: Join a Game */}
          <form
            className="qg-entry-card is-join"
            onSubmit={handleJoinSubmit}
            data-name="Join room panel"
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8
                }}
              >
                <Gamepad2 size={18} style={{ color: '#10b981' }} aria-hidden="true" />
                <span className="eyebrow" style={{ margin: 0 }}>
                  {t('lobby.joinRoomEyebrow')}
                </span>
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
                  className="input qg-pin-input"
                  type="text"
                  maxLength={14}
                  placeholder="ADBI 482"
                  value={displayedJoinPin}
                  onChange={(e) => {
                    setJoinPin(e.target.value.toUpperCase());
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
              <button
                type="submit"
                className="qp-btn primary"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {t('lobby.joinRoomBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Joined Player Waiting Room
  if (live.status === 'joined') {
    return (
      <div className="qp-workspace" data-name="Joined player lobby">
        <section className="qp-hero qg-arena-hero" aria-labelledby="joined-lobby-title">
          <div className="qp-hero-text">
            <div className="qp-eyeline">
              <span className="qg-live-dot" aria-hidden="true" />
              <span>{t('lobby.joinedRoomEyebrow')}</span>
            </div>
            <h1 id="joined-lobby-title">{liveQuizTitle}</h1>
            <div className="qp-hero-meta">
              <span className="qg-pin-pill">PIN {live.pin}</span>
              <span>
                <Users size={15} aria-hidden="true" />
                {t('lobby.playersJoined', { count: live.players.length })}
              </span>
            </div>
          </div>

          <div className="qp-hero-actions">
            <button type="button" className="qp-hero-btn" onClick={closeLiveRoom}>
              <LogOut size={15} aria-hidden="true" />
              <span>{t('lobby.leaveRoom')}</span>
            </button>
          </div>

          <div className="qp-hero-art" aria-hidden="true">
            <div className="qp-mesh" />
            <i className="qp-star s1">✦</i>
            <div className="qp-deck">
              <div className="qp-tile back" />
              <div className="qp-tile mid" />
              <div className="qp-tile front">
                <Gamepad2 size={42} strokeWidth={2.1} />
              </div>
            </div>
            <i className="qp-star s2">✦</i>
          </div>
        </section>

        <section className="qp-card qp-card-body" data-name="Connected players">
          <div className="qp-card-heading" style={{ marginBottom: 6 }}>
            <h2>{t('lobby.playersJoined', { count: live.players.length })}</h2>
            <span className="qp-q-tag">{t('lobby.waitingForHost')}</span>
          </div>
          <p className="helper-text" style={{ marginBottom: 14 }}>
            {t('lobby.joinedAsHelper', {
              name: live.joinedPlayerName || settings.displayName || '—'
            })}
          </p>

          <div className="qg-player-roster">
            {live.players.map((p, idx) => {
              const isReady = p.status === 'Ready' || p.status === 'Answered';
              const statusLabel =
                p.status === 'Ready'
                  ? t('lobby.playerStatusReady')
                  : p.status === 'Waiting'
                  ? t('lobby.playerStatusWaiting')
                  : p.status;
              return (
                <div
                  key={p.id || idx}
                  className={`qg-player-chip ${isReady ? 'is-ready' : ''}`}
                >
                  {p.avatar_url ? (
                    <UserAvatar
                      avatarUrl={p.avatar_url}
                      alt={p.name}
                      className="qg-player-avatar-img"
                    />
                  ) : (
                    <span className={`qg-player-avatar av-${idx % 5}`}>
                      {getInitials(p.name)}
                    </span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 650,
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      className={`helper-text ${isReady ? 'qg-player-status-ready' : ''}`}
                      style={{ fontSize: 11.5 }}
                    >
                      {statusLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="btn-row" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="qp-btn primary"
              onClick={() => void handleEnterLiveGame()}
            >
              <Play size={15} aria-hidden="true" />
              <span>{t('lobby.enterLiveGame')}</span>
            </button>
            <button type="button" className="qp-btn" onClick={closeLiveRoom}>
              {t('lobby.leaveRoom')}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Active Host Lobby View
  return (
    <div className="qp-workspace" data-name="Host lobby">
      {/* Giant Glowing PIN Invitation Ticket */}
      <section className="qg-pin-ticket" data-name="Room invitation">
        <div className="qp-eyeline">
          <span className="qg-live-dot" aria-hidden="true" />
          <span>{t('lobby.inviteEyebrow')}</span>
        </div>
        <div className="qg-pin-code">{live.pin}</div>
        <p style={{ margin: 0, color: '#e4dff8', fontSize: 14 }}>
          {t('lobby.inviteSteps')}
        </p>
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button type="button" className="qp-hero-btn" onClick={handleCopyPin}>
            <Copy size={15} aria-hidden="true" />
            <span>{t('lobby.copyPin')}</span>
          </button>
          <button type="button" className="qp-hero-btn" onClick={handleCopyInviteLink}>
            <Link2 size={15} aria-hidden="true" />
            <span>{t('lobby.copyInviteLink')}</span>
          </button>
          <button type="button" className="qp-hero-btn" onClick={closeLiveRoom}>
            <LogOut size={15} aria-hidden="true" />
            <span>{t('lobby.closeRoom')}</span>
          </button>
        </div>
      </section>

      <div
        className="qp-layout"
        style={{ alignItems: 'stretch' }}
        data-name="Lobby columns"
      >
        {/* Left: Connected Players Roster + Launch */}
        <article
          className="qp-card qp-play-card"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          data-name="Connected players"
        >
          <div className="qp-card-body" style={{ flex: 1 }}>
            <div className="qp-card-heading" style={{ marginBottom: 4 }}>
              <h2>{t('lobby.playersJoined', { count: live.players.length })}</h2>
              <span className="qp-q-tag">
                <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
                {live.players.length}
              </span>
            </div>
            <p className="helper-text">{t('lobby.playersAppearHelper')}</p>

            <div className="qg-player-roster">
              {live.players.map((p, idx) => {
                const isReady = p.status === 'Ready' || p.status === 'Answered';
                const statusLabel =
                  p.status === 'Ready'
                    ? t('lobby.playerStatusReady')
                    : p.status === 'Waiting'
                    ? t('lobby.playerStatusWaiting')
                    : p.status;
                return (
                  <div
                    key={p.id || idx}
                    className={`qg-player-chip ${isReady ? 'is-ready' : ''}`}
                  >
                    {p.avatar_url ? (
                      <UserAvatar
                        avatarUrl={p.avatar_url}
                        alt={p.name}
                        className="qg-player-avatar-img"
                      />
                    ) : (
                      <span className={`qg-player-avatar av-${idx % 5}`}>
                        {getInitials(p.name)}
                      </span>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 650,
                          fontSize: 14,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        className={`helper-text ${isReady ? 'qg-player-status-ready' : ''}`}
                        style={{ fontSize: 11.5 }}
                      >
                        {statusLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="qp-card-nav" data-name="Host controls">
            <span className="helper-text" style={{ fontSize: 13.5 }}>
              {t('lobby.allPlayersConnected', { count: live.players.length })}
            </span>
            <div className="btn-row">
              {live.playerId ? (
                <button
                  type="button"
                  className="qp-btn"
                  onClick={() => void leaveAsHostPlayer()}
                >
                  {t('leaderboard.leaveAsPlayerBtn')}
                </button>
              ) : (
                <button
                  type="button"
                  className="qp-btn"
                  onClick={() => void joinAsHostPlayer()}
                >
                  {t('leaderboard.joinAsPlayerBtn')}
                </button>
              )}
              <button
                type="button"
                className="qp-btn primary"
                onClick={() => void handleStartLiveGame()}
              >
                <Play size={16} aria-hidden="true" />
                <span>{t('lobby.startGame')}</span>
              </button>
            </div>
          </footer>
        </article>

        {/* Right: Game Setup */}
        <aside className="qp-card qp-side-card" data-name="Game setup">
          <div className="qp-card-heading" style={{ marginBottom: 14 }}>
            <h2>{t('lobby.gameSetupTitle')}</h2>
            <Layers size={18} aria-hidden="true" />
          </div>

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

          <SettingToggleRow
            label={t('leaderboard.participateAsHostLabel')}
            description={t('leaderboard.participateAsHostDesc')}
            checked={Boolean(live.playerId)}
            onToggle={() => {
              if (live.playerId) {
                void leaveAsHostPlayer();
              } else {
                void joinAsHostPlayer();
              }
            }}
          />

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--qp-line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div
              className="helper-text"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
            >
              <Clock size={14} aria-hidden="true" />
              <span>{t('lobby.scoringNote')}</span>
            </div>
            <div className="helper-text" style={{ fontSize: 12.5 }}>
              {t('lobby.leaderboardNote')}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
