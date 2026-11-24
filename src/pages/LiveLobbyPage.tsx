import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
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
import { formatRoomPin, isValidRoomPin, normalizeRoomPin } from '../lib/roomPin';
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
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
  const [pinError, setPinError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [manualCopy, setManualCopy] = useState<{
    kind: 'pin' | 'link';
    value: string;
    pin: string;
  } | null>(null);
  const [participateAsHost, setParticipateAsHost] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [markingReady, setMarkingReady] = useState<boolean>(false);
  const hostCardRef = useRef<HTMLFormElement | null>(null);
  const joinCardRef = useRef<HTMLFormElement | null>(null);
  const joinPinInputRef = useRef<HTMLInputElement | null>(null);
  const joinNameInputRef = useRef<HTMLInputElement | null>(null);
  const manualCopyInputRef = useRef<HTMLInputElement | null>(null);

  const queryPin = searchParams.get('pin') || '';
  const incomingPinRaw = routePin || queryPin;
  const normalizedRoutePin = incomingPinRaw ? normalizeRoomPin(incomingPinRaw) : '';
  const formattedIncomingPin = normalizedRoutePin ? formatRoomPin(normalizedRoutePin) : '';
  const displayedJoinPin = joinPin ?? formattedIncomingPin;
  const displayedJoinName = joinName ?? settings.displayName ?? user?.display_name ?? '';
  const rawMode = (searchParams.get('mode') || location.hash.replace(/^#/, '')).toLowerCase();
  const routeTargetPanel: 'host' | 'join' | null =
    rawMode === 'host' && user
      ? 'host'
      : rawMode === 'join' || Boolean(normalizedRoutePin)
      ? 'join'
      : null;
  const [highlightedPanel, setHighlightedPanel] = useState<'host' | 'join' | null>(
    routeTargetPanel
  );
  const activeManualCopy =
    manualCopy && live.status === 'hosting' && manualCopy.pin === live.pin
      ? manualCopy
      : null;

  useEffect(() => {
    setHighlightedPanel(routeTargetPanel);
  }, [routeTargetPanel]);

  // When routed to a specific entry box (?mode=host or ?mode=join), scroll to it and focus its primary input
  useEffect(() => {
    if (live.status !== 'idle') return;

    if (normalizedRoutePin) {
      joinCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      joinNameInputRef.current?.focus({ preventScroll: true });
      return;
    }

    if (routeTargetPanel === 'host') {
      hostCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const quizTrigger = hostCardRef.current?.querySelector<HTMLButtonElement>('#entry-quiz-select');
      quizTrigger?.focus({ preventScroll: true });
      return;
    }

    if (routeTargetPanel === 'join') {
      joinCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      joinPinInputRef.current?.focus({ preventScroll: true });
    }
  }, [live.status, normalizedRoutePin, routeTargetPanel]);

  useEffect(() => {
    if (!activeManualCopy) return;
    manualCopyInputRef.current?.focus();
    manualCopyInputRef.current?.select();
  }, [activeManualCopy]);

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) ?? activeQuiz;
  const liveQuizTitle = liveQuiz?.title || t('nav.liveGames');
  const liveQuizCount = liveQuiz?.questionCount ?? liveQuiz?.questions.length ?? 0;

  const copyTextWithFallback = async (
    kind: 'pin' | 'link',
    value: string,
    successMessage: string
  ) => {
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(value);
      setManualCopy(null);
      showToast(successMessage);
    } catch {
      setManualCopy({ kind, value, pin: live.pin });
    }
  };

  const handleCopyPin = () => {
    const cleanPin = normalizeRoomPin(live.pin);
    void copyTextWithFallback(
      'pin',
      cleanPin,
      t('toasts.pinCopied', { pin: live.pin })
    );
  };

  const handleCopyInviteLink = () => {
    const cleanPin = normalizeRoomPin(live.pin);
    const inviteUrl = `${window.location.origin}/rooms/${encodeURIComponent(cleanPin)}`;
    void copyTextWithFallback('link', inviteUrl, t('toasts.inviteLinkCopied'));
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
    setPinError('');
    setNameError('');

    const cleanPin = normalizeRoomPin(displayedJoinPin);
    if (!isValidRoomPin(cleanPin)) {
      setPinError(t('lobby.invalidPinFallback'));
      joinPinInputRef.current?.focus();
      return;
    }

    const trimmedName = displayedJoinName.trim();
    if (!trimmedName) {
      setNameError(t('lobby.enterNameRequired'));
      joinNameInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await joinLiveRoom(cleanPin, trimmedName);
      if (!res.ok) {
        const errMsg = res.error || t('lobby.invalidPinFallback');
        if (/name/i.test(errMsg)) {
          setNameError(errMsg);
          joinNameInputRef.current?.focus();
        } else {
          setPinError(errMsg);
          joinPinInputRef.current?.focus();
        }
        return;
      }
      setPinError('');
      setNameError('');
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
  const normalizedPathPin = routePin ? normalizeRoomPin(routePin) : '';

  // Sync URL to /rooms/:pin when hosting or joined, and back to /lobby when returning to idle
  useEffect(() => {
    const prev = prevLiveStatusRef.current;
    prevLiveStatusRef.current = live.status;

    if (
      (live.status === 'hosting' || live.status === 'joined') &&
      cleanLivePin &&
      normalizedPathPin !== cleanLivePin
    ) {
      navigate(`/rooms/${encodeURIComponent(cleanLivePin)}`);
      return;
    }

    if (prev !== 'idle' && live.status === 'idle' && normalizedPathPin) {
      navigate('/lobby', { replace: true });
    }
  }, [live.status, cleanLivePin, normalizedPathPin, navigate]);

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
    <header className="qlg-header" data-name="Application header">
      <div className="qlg-header-inner">
        <div className="header-left">
          <Link className="brand" to="/" data-name="QuizClash">
            <span className="brand-mark" aria-hidden="true"></span>
            <span>QuizClash</span>
          </Link>
          <span className="brand-tagline" data-name="Study notes → active recall">
            {t('nav.tagline')}
          </span>
        </div>
        <div className="header-right">
          <ThemeSwitch variant="header" />
          {!user && (
            <Link className="btn btn-sm btn-primary" to="/login">
              {t('auth.signIn')}
            </Link>
          )}
          <Link className="btn btn-sm" to={user ? '/dashboard' : '/'}>
            {user ? t('nav.dashboard') : t('nav.home')}
          </Link>
          <Link
            to={user ? '/settings' : '/login'}
            className="user-badge"
            data-name="User profile"
            title={user?.display_name || settings.displayName || t('auth.signIn')}
            aria-label={user?.display_name || settings.displayName || t('auth.signIn')}
          >
            <UserAvatar
              avatarUrl={user?.avatar_url ?? settings.avatarUrl}
              alt={user?.display_name || settings.displayName || t('auth.signIn')}
              className="header-avatar"
            />
          </Link>
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
              <h1 id="lobby-entry-title">
                {user ? t('nav.liveGames') : t('lobby.guestHeading')}
              </h1>
              <p>
                {user ? t('lobby.entrySubtitle') : t('lobby.guestEntrySubtitle')}
              </p>
            </div>

            <div className={`qlg-entry ${!user ? 'is-guest' : ''}`}>
              {/* Card 1: Host a Game (Signed-in users only) */}
              {user && (
                <form
                  ref={hostCardRef}
                  id="host-room-panel"
                  className={`qlg-card qlg-entry-card ${
                    highlightedPanel === 'host' ? 'is-targeted' : ''
                  }`}
                  onSubmit={handleCreateRoom}
                  onFocusCapture={() => {
                    if (highlightedPanel && highlightedPanel !== 'host') {
                      setHighlightedPanel('host');
                    }
                  }}
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
                        {quizzes.length > 0 ? (
                          quizzes.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-center text-sm text-muted-foreground">
                            {t('lobby.noQuizzesAvailable')}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <span className="helper-text">
                      {quizzes.length > 0 ? (
                        t('lobby.quizMeta', { count: liveQuizCount })
                      ) : (
                        <>
                          {t('lobby.noQuizzesAvailable')}{' '}
                          <Link
                            to="/generate"
                            style={{ color: 'var(--primary)', fontWeight: 600 }}
                          >
                            {t('lobby.generateQuizLink')}
                          </Link>
                        </>
                      )}
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
                ref={joinCardRef}
                id="join-room-panel"
                className={`qlg-card qlg-entry-card ${
                  highlightedPanel === 'join' ? 'is-targeted is-targeted-join' : ''
                }`}
                onSubmit={handleJoinSubmit}
                onFocusCapture={() => {
                  if (highlightedPanel && highlightedPanel !== 'join') {
                    setHighlightedPanel('join');
                  }
                }}
                data-name="Join room panel"
                noValidate
              >
                {user && (
                  <div className="qlg-entry-heading">
                    <div className="qlg-entry-label is-join">
                      <Gamepad2 size={20} aria-hidden="true" />
                      <span>{t('lobby.joinRoomEyebrow')}</span>
                    </div>
                    <h2>{t('lobby.joinRoomTitle')}</h2>
                    <p>{t('lobby.joinRoomSubtitle')}</p>
                  </div>
                )}

                <div className="qlg-field">
                  <label htmlFor="join-pin-input">{t('lobby.roomPinLabel')}</label>
                  <input
                    ref={joinPinInputRef}
                    id="join-pin-input"
                    className="qlg-control qlg-pin-input"
                    type="text"
                    maxLength={16}
                    placeholder={t('lobby.roomPinPlaceholder')}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-invalid={Boolean(pinError)}
                    aria-describedby={pinError ? 'join-pin-error' : undefined}
                    value={displayedJoinPin}
                    onChange={(e) => {
                      setJoinPin(e.target.value.toUpperCase());
                      if (pinError) setPinError('');
                    }}
                  />
                  {pinError && (
                    <p id="join-pin-error" className="qlg-error" role="alert">
                      {pinError}
                    </p>
                  )}
                </div>

                <div className="qlg-field">
                  <label htmlFor="join-name-input">{t('lobby.displayNameLabel')}</label>
                  <input
                    ref={joinNameInputRef}
                    id="join-name-input"
                    className="qlg-control"
                    type="text"
                    maxLength={40}
                    autoComplete="nickname"
                    placeholder={t('lobby.displayNamePlaceholder')}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? 'join-name-error' : undefined}
                    value={displayedJoinName}
                    onChange={(e) => {
                      setJoinName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                  />
                  {nameError && (
                    <p id="join-name-error" className="qlg-error" role="alert">
                      {nameError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={user ? 'qlg-btn qlg-join-btn' : 'qlg-btn qlg-primary-btn'}
                  disabled={submitting}
                >
                  <span>{t('lobby.joinGameBtn')}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
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
              {activeManualCopy && (
                <div className="qg-manual-copy" role="region" aria-live="polite">
                  <label htmlFor="manual-copy-input" className="qg-manual-copy-label">
                    {activeManualCopy.kind === 'pin'
                      ? t('lobby.manualCopyPinLabel')
                      : t('lobby.manualCopyLinkLabel')}
                  </label>
                  <div className="qg-manual-copy-row">
                    <input
                      ref={manualCopyInputRef}
                      id="manual-copy-input"
                      type="text"
                      readOnly
                      className="qg-manual-copy-input"
                      value={activeManualCopy.value}
                      onFocus={(e) => e.currentTarget.select()}
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      type="button"
                      className="qp-hero-btn"
                      aria-label={t('common.close')}
                      onClick={() => setManualCopy(null)}
                      style={{ padding: '6px 10px' }}
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
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
                      {quizzes.length > 0 ? (
                        quizzes.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-center text-sm text-muted-foreground">
                          {t('lobby.noQuizzesAvailable')}
                        </div>
                      )}
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
