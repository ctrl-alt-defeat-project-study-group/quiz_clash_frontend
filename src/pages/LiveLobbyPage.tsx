import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Crown,
  Gamepad2,
  Layers,
  Link2,
  LogOut,
  Play,
  Users,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingToggleRow, ThemeSwitch, UserAvatar } from '../components/common';
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
  const [joinName, setJoinName] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string>('');
  const [participateAsHost, setParticipateAsHost] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [markingReady, setMarkingReady] = useState<boolean>(false);
  const [dismissedInvitePin, setDismissedInvitePin] = useState<string | null>(null);
  const inviteNameInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedRoutePin = routePin ? routePin.trim().toUpperCase() : '';
  const displayedJoinPin = joinPin ?? normalizedRoutePin;
  const displayedJoinName = joinName ?? settings.displayName ?? user?.display_name ?? '';
  const showInvitePopup =
    live.status === 'idle' &&
    Boolean(normalizedRoutePin) &&
    dismissedInvitePin !== normalizedRoutePin;

  useEffect(() => {
    if (!showInvitePopup) return;
    inviteNameInputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        setDismissedInvitePin(normalizedRoutePin);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInvitePopup, submitting, normalizedRoutePin]);

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
      const res = await joinLiveRoom(displayedJoinPin, displayedJoinName);
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

  const handleInviteJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayedJoinName.trim();
    if (!trimmedName) {
      setJoinError(t('lobby.enterNameRequired'));
      inviteNameInputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await joinLiveRoom(normalizedRoutePin, trimmedName);
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

  const prevLiveStatusRef = useRef(live.status);

  // If the user leaves or the host closes the room while on /rooms/:pin, clear the URL PIN
  useEffect(() => {
    const prev = prevLiveStatusRef.current;
    prevLiveStatusRef.current = live.status;
    if (prev !== 'idle' && live.status === 'idle' && normalizedRoutePin) {
      navigate('/lobby', { replace: true });
    }
  }, [live.status, normalizedRoutePin, navigate]);

  // Auto-route joined participants to the live game screen as soon as the host starts the game
  useEffect(() => {
    if (
      live.status === 'joined' &&
      (live.backendStatus === 'active' ||
        live.backendStatus === 'finished' ||
        Boolean(live.currentQuestion))
    ) {
      navigate(livePlayPath, { replace: true });
    }
  }, [live.status, live.backendStatus, live.currentQuestion, livePlayPath, navigate]);

  const selfLobbyPlayer = live.players.find(
    (p) =>
      (live.playerId && p.id === live.playerId) ||
      (live.joinedPlayerName &&
        p.name.toLowerCase() === live.joinedPlayerName.toLowerCase())
  );
  const isSelfReady =
    selfLobbyPlayer?.status === 'Ready' || selfLobbyPlayer?.status === 'Answered';

  const handleMarkReady = async () => {
    if (isSelfReady || markingReady) return;
    setMarkingReady(true);
    try {
      await markLivePlayerReady();
    } finally {
      setMarkingReady(false);
    }
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

  const renderStandaloneHeader = () => (
    <header className="qlg-header">
      <div className="qlg-wrap qlg-header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true"></span>
          <span>QuizClash</span>
        </Link>
        <div className="qlg-header-actions">
          {user ? (
            <Link className="qlg-dashboard-link" to="/dashboard">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>{t('nav.dashboard')}</span>
            </Link>
          ) : (
            <Link className="qlg-dashboard-link" to="/login">
              <span>{t('auth.signIn')}</span>
            </Link>
          )}
          <ThemeSwitch variant="header" />
        </div>
      </div>
    </header>
  );

  // Entry Screen: Full-Page QuizClash-Live-Games Design
  // Signed-in users see Create + Join cards; Guests see ONLY the Join a room card.
  if (live.status === 'idle') {
    return (
      <div className="qlg-page" data-name="Live game entry">
        {renderStandaloneHeader()}

        <main className="qlg-main" aria-labelledby="lobby-entry-title">
          <div className="qlg-page-art" aria-hidden="true">
            <div className="qlg-page-mesh" />
            <div className="qlg-art-figure">
              <div className="qlg-art-deck">
                <div className="qlg-art-card qlg-art-back" />
                <div className="qlg-art-card qlg-art-middle" />
                <div className="qlg-art-card qlg-art-front">
                  <Gamepad2 size={50} strokeWidth={2} />
                </div>
              </div>
              <span className="qlg-spark qlg-spark-one">✦</span>
              <span className="qlg-spark qlg-spark-two">✦</span>
            </div>
          </div>

          <div className="qlg-wrap">
            <div className="qlg-page-heading">
              <h1 id="lobby-entry-title">{t('nav.liveGames')}</h1>
              <p>
                {user ? t('lobby.entrySubtitle') : t('lobby.guestEntrySubtitle')}
              </p>
            </div>

            <div className={`qlg-entry ${!user ? 'is-guest' : ''}`}>
              {/* Card 1: Host a Game (Signed-in users only) */}
              {user && (
                <form
                  className="qlg-card qlg-entry-card"
                  onSubmit={handleCreateRoom}
                  data-name="Create room panel"
                >
                  <div className="qlg-entry-heading">
                    <div className="qlg-entry-label">
                      <Crown size={20} aria-hidden="true" />
                      <span>{t('lobby.createRoomEyebrow')}</span>
                    </div>
                    <h2>{t('lobby.createRoomTitle')}</h2>
                    <p>{t('lobby.createRoomSubtitle')}</p>
                  </div>

                  <div className="qlg-field">
                    <label htmlFor="entry-quiz-select">{t('lobby.quizLabel')}</label>
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

                  <fieldset className="qlg-fieldset">
                    <legend>{t('lobby.timerLabel')}</legend>
                    <div className="qlg-time-options">
                      {[15, 20, 30, 45].map((sec) => (
                        <React.Fragment key={sec}>
                          <input
                            id={`qlg-timer-${sec}`}
                            type="radio"
                            name="qlg-timer"
                            value={sec}
                            checked={live.timerSeconds === sec}
                            onChange={() => setLiveTimer(sec)}
                          />
                          <label htmlFor={`qlg-timer-${sec}`}>
                            {t('lobby.shortSeconds', { count: sec })}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </fieldset>

                  <label className="qlg-note">
                    <span>
                      <strong>{t('leaderboard.participateAsHostLabel')}</strong>
                      {t('leaderboard.participateAsHostDesc')}
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      className="qlg-switch-input"
                      checked={participateAsHost}
                      onChange={() => setParticipateAsHost((prev) => !prev)}
                    />
                    <span className="qlg-switch" aria-hidden="true" />
                  </label>

                  <button
                    type="submit"
                    className="qlg-btn qlg-primary-btn"
                    disabled={submitting || quizzes.length === 0}
                  >
                    <span>{t('lobby.createRoomTitle')}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </form>
              )}

              {/* Card 2: Join a Game (Shown to everyone; sole card for guests) */}
              <form
                className="qlg-card qlg-entry-card"
                onSubmit={handleJoinSubmit}
                data-name="Join room panel"
              >
                <div className="qlg-entry-heading">
                  <div className="qlg-entry-label is-join">
                    <Gamepad2 size={20} aria-hidden="true" />
                    <span>{t('lobby.joinRoomEyebrow')}</span>
                  </div>
                  <h2>{t('lobby.joinRoomTitle')}</h2>
                  <p>{t('lobby.joinRoomSubtitle')}</p>
                </div>

                <div className="qlg-field">
                  <label htmlFor="join-pin-input">{t('lobby.roomPinLabel')}</label>
                  <input
                    id="join-pin-input"
                    className="qlg-control qlg-pin-input"
                    type="text"
                    maxLength={14}
                    placeholder="ADBI 482"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    value={displayedJoinPin}
                    onChange={(e) => {
                      setJoinPin(e.target.value.toUpperCase());
                      if (joinError) setJoinError('');
                    }}
                  />
                  {joinError && (
                    <p className="qlg-error" role="alert">
                      {joinError}
                    </p>
                  )}
                </div>

                <div className="qlg-field">
                  <label htmlFor="join-name-input">{t('lobby.displayNameLabel')}</label>
                  <input
                    id="join-name-input"
                    className="qlg-control"
                    type="text"
                    maxLength={40}
                    autoComplete="nickname"
                    placeholder={t('lobby.displayNamePlaceholder')}
                    value={displayedJoinName}
                    onChange={(e) => {
                      setJoinName(e.target.value);
                      if (joinError) setJoinError('');
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="qlg-btn qlg-join-btn"
                  disabled={submitting}
                >
                  <span>{t('lobby.joinRoomTitle')}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>

          {showInvitePopup && (
            <div
              className="modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-join-title"
              data-name="Invite join modal"
              onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                  setDismissedInvitePin(normalizedRoutePin);
                }
              }}
            >
              <form className="modal-box" onSubmit={handleInviteJoinSubmit}>
                <div className="dialog-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Gamepad2 size={20} style={{ color: '#10b981' }} aria-hidden="true" />
                    <h2 id="invite-join-title" className="panel-heading" style={{ margin: 0 }}>
                      {t('lobby.invitePopupTitle')}
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    aria-label={t('common.cancel')}
                    disabled={submitting}
                    onClick={() => setDismissedInvitePin(normalizedRoutePin)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <span className="qg-pin-pill">PIN {normalizedRoutePin}</span>
                </div>

                <p className="helper-text" style={{ marginBottom: 16 }}>
                  {t('lobby.invitePopupSubtitle', { pin: normalizedRoutePin })}
                </p>

                <div className="field-group">
                  <label className="field-label-caps" htmlFor="invite-join-name-input">
                    {t('lobby.displayNameLabel')}
                  </label>
                  <input
                    ref={inviteNameInputRef}
                    id="invite-join-name-input"
                    className="input"
                    type="text"
                    maxLength={40}
                    autoFocus
                    placeholder={t('lobby.displayNamePlaceholder')}
                    value={displayedJoinName}
                    onChange={(e) => {
                      setJoinName(e.target.value);
                      if (joinError) setJoinError('');
                    }}
                  />
                </div>

                {joinError && (
                  <p className="error-text" role="alert" style={{ marginBottom: 12 }}>
                    {joinError}
                  </p>
                )}

                <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    type="button"
                    className="qp-btn"
                    disabled={submitting}
                    onClick={() => setDismissedInvitePin(normalizedRoutePin)}
                  >
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="qp-btn primary" disabled={submitting}>
                    {t('lobby.joinRoomBtn')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Joined Player Waiting Room
  if (live.status === 'joined') {
    return (
      <div className="qlg-page" data-name="Joined player lobby">
        {renderStandaloneHeader()}
        <main className="qlg-main is-arena">
          <div className="qlg-wrap">
            <div className="qp-workspace">
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
                    disabled={isSelfReady || markingReady}
                    onClick={() => void handleMarkReady()}
                  >
                    <Check size={15} aria-hidden="true" />
                    <span>{isSelfReady ? t('lobby.readyDoneBtn') : t('lobby.readyBtn')}</span>
                  </button>
                  <button type="button" className="qp-btn" onClick={closeLiveRoom}>
                    {t('lobby.leaveRoom')}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Host Lobby View
  return (
    <div className="qlg-page" data-name="Host lobby">
      {renderStandaloneHeader()}
      <main className="qlg-main is-arena">
        <div className="qlg-wrap">
          <div className="qp-workspace">
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
                  <Select
                    value={live.quizId}
                    onValueChange={setLiveQuizId}
                    disabled={Boolean(live.isLiveBackend)}
                  >
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
                    disabled={Boolean(live.isLiveBackend)}
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
        </div>
      </main>
    </div>
  );
};
