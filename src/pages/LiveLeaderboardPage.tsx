import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  Eye,
  EyeOff,
  Layers,
  LogOut,
  Pause,
  Play,
  Trophy,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Progress } from '@/components/ui/progress';

const LETTERS = ['A', 'B', 'C', 'D'];
const pad2 = (n: number) => String(n).padStart(2, '0');

interface RecordedRound {
  round: number;
  prompt: string;
  choices: { id: string; text: string }[];
  selectedChoiceId: string | null;
  correctChoiceId: string | null;
}

export const LiveLeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    quizzes,
    activeQuiz,
    live,
    settings,
    closeLiveRoom,
    joinAsHostPlayer,
    advanceLiveRound,
    submitLiveAnswer,
    t
  } = useApp();

  const isPlayer = live.status === 'joined';
  const canParticipate = isPlayer || Boolean(live.playerId);
  const totalSeconds = Math.max(1, live.timerSeconds || 20);
  const activeQuestionKey = `${live.currentQuestion?.id || ''}:${live.round}:${totalSeconds}`;
  const [prevQuestionKey, setPrevQuestionKey] = useState<string>(activeQuestionKey);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [hostShowAnswer, setHostShowAnswer] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [recordedRounds, setRecordedRounds] = useState<Record<number, RecordedRound>>({});
  const [prevRevealKey, setPrevRevealKey] = useState<string>('');

  if (prevQuestionKey !== activeQuestionKey) {
    setPrevQuestionKey(activeQuestionKey);
    setRemainingSeconds(totalSeconds);
    setHostShowAnswer(false);
    setIsPaused(false);
    if (live.currentQuestion && live.round > 0) {
      const sorted = [...live.currentQuestion.choices].sort((a, b) => a.position - b.position);
      setRecordedRounds((prev) => ({
        ...prev,
        [live.round]: {
          round: live.round,
          prompt: live.currentQuestion!.prompt,
          choices: sorted.map((c) => ({ id: c.id, text: c.text })),
          selectedChoiceId: prev[live.round]?.selectedChoiceId ?? null,
          correctChoiceId: prev[live.round]?.correctChoiceId ?? null
        }
      }));
    }
  }

  useEffect(() => {
    if ((!live.currentQuestion?.id && live.status === 'idle') || isPaused) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeQuestionKey, isPaused, live.currentQuestion?.id, live.status]);

  const liveQuiz = quizzes.find((q) => q.id === live.quizId) ?? activeQuiz;
  const liveQuizTitle = liveQuiz?.title || t('nav.liveGames');
  const liveQuestions = liveQuiz?.questions ?? [];
  const totalRounds = Math.max(1, live.totalRounds || liveQuestions.length || 1);
  const round = Math.min(Math.max(1, live.round || 1), totalRounds);
  const roundPct = Math.round((round / totalRounds) * 100);
  const timerPct = Math.max(0, Math.min(100, Math.round((remainingSeconds / totalSeconds) * 100)));

  // Auto-advance to the next question in Host mode when the countdown hits 0
  useEffect(() => {
    if (isPlayer || isPaused || live.status === 'idle' || remainingSeconds > 0) return;
    if (round >= totalRounds) return;
    const timeoutId = window.setTimeout(() => {
      void advanceLiveRound();
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [advanceLiveRound, isPaused, isPlayer, live.status, remainingSeconds, round, totalRounds]);

  const fallbackQ = {
    prompt: live.currentQuestion?.prompt || t('leaderboard.waitingForNextQuestion'),
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
  const topScore = Math.max(1, sortedPlayers[0]?.points ?? 1);
  const answeredCount = live.players.filter((p) => p.status === 'Answered').length;

  const playerName = live.joinedPlayerName || settings.displayName || '';
  const selfPlayer = sortedPlayers.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );

  const activeChoices: { id: string; text: string; isCorrect?: boolean }[] =
    live.currentQuestion && live.currentQuestion.choices.length > 0
      ? [...live.currentQuestion.choices]
          .sort((a, b) => a.position - b.position)
          .map((c, idx) => ({
            id: c.id,
            text: c.text,
            isCorrect: idx === currentQ.answer
          }))
      : currentQ.choices.map((text, idx) => ({
          id: LETTERS[idx]?.toLowerCase() ?? String(idx),
          text,
          isCorrect: idx === currentQ.answer
        }));

  const activePrompt = live.currentQuestion?.prompt || currentQ.prompt;
  const revealedCorrectId =
    live.lastAnswerResult?.correct_choice_id || live.lastRoundCorrectChoiceId;

  const revealSyncKey = `${round}:${live.selectedChoiceId || ''}:${revealedCorrectId || ''}`;
  if (revealSyncKey !== prevRevealKey && live.currentQuestion && round > 0) {
    setPrevRevealKey(revealSyncKey);
    const sorted = [...live.currentQuestion.choices].sort((a, b) => a.position - b.position);
    setRecordedRounds((prev) => ({
      ...prev,
      [round]: {
        round,
        prompt: live.currentQuestion!.prompt,
        choices: sorted.map((c) => ({ id: c.id, text: c.text })),
        selectedChoiceId: live.selectedChoiceId ?? prev[round]?.selectedChoiceId ?? null,
        correctChoiceId: revealedCorrectId ?? prev[round]?.correctChoiceId ?? null
      }
    }));
  }

  const showHostCorrect = canParticipate
    ? Boolean(revealedCorrectId) || remainingSeconds === 0
    : hostShowAnswer || remainingSeconds === 0;
  const hasReveal = isPlayer ? Boolean(revealedCorrectId) : showHostCorrect;
  const answerLocked =
    !canParticipate ||
    !live.currentQuestion ||
    Boolean(live.selectedChoiceId) ||
    remainingSeconds === 0;

  // Redirect back to lobby when the live session ends or the host closes the room
  useEffect(() => {
    if (live.status === 'idle') {
      navigate('/lobby', { replace: true });
    }
  }, [live.status, navigate]);

  const handleLeaveOrEnd = () => {
    closeLiveRoom();
    navigate('/lobby');
  };

  useEffect(() => {
    if (!canParticipate || answerLocked) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const idx = LETTERS.indexOf(e.key.toUpperCase());
      if (idx >= 0 && activeChoices[idx]) {
        e.preventDefault();
        submitLiveAnswer(activeChoices[idx].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeChoices, answerLocked, canParticipate, submitLiveAnswer]);

  // All participants (joined players + participating hosts) see the QuizClash-Live-Player view.
  // Only a non-participating spectator host sees the 2-column Host Arena below.
  if (canParticipate) {
    const reviewItems =
      Object.keys(recordedRounds).length > 0
        ? Object.values(recordedRounds)
            .sort((a, b) => a.round - b.round)
            .map((rec) => {
              const selectedText =
                rec.choices.find((c) => c.id === rec.selectedChoiceId)?.text ?? null;
              const fallbackQuizQ = liveQuestions[rec.round - 1];
              const correctText =
                rec.choices.find((c) => c.id === rec.correctChoiceId)?.text ??
                (fallbackQuizQ ? fallbackQuizQ.choices[fallbackQuizQ.answer] : null);
              return {
                num: rec.round,
                prompt: rec.prompt,
                yourAnswer: selectedText,
                correctAnswer: correctText
              };
            })
        : liveQuestions.map((q, qIdx) => ({
            num: qIdx + 1,
            prompt: q.prompt,
            yourAnswer: null as string | null,
            correctAnswer: q.choices[q.answer] ?? null
          }));

    const feedbackText = live.selectedChoiceId
      ? t('leaderboard.answerLocked')
      : remainingSeconds === 0
      ? t('leaderboard.timesUp')
      : !live.currentQuestion
      ? t('leaderboard.waitingForNextQuestion')
      : '';

    return (
      <div className="qlp-shell" data-name="Live quiz player">
        <section className="qlp-banner" aria-labelledby="live-player-title">
          <div>
            <h1 id="live-player-title">{liveQuizTitle}</h1>
            <p>
              {t('lobby.breadcrumbRoom', { pin: live.pin || '—' })} ·{' '}
              {t('leaderboard.yourScore', {
                points: (selfPlayer?.points ?? 0).toLocaleString()
              })}
            </p>
          </div>
          <div className="qlp-banner-right">
            {playerName && <span className="qlp-badge">{playerName}</span>}
            <button type="button" className="qp-hero-btn" onClick={handleLeaveOrEnd}>
              <LogOut size={15} aria-hidden="true" />
              <span>{isPlayer ? t('lobby.leaveRoom') : t('leaderboard.endGame')}</span>
            </button>
          </div>
        </section>

        <section className="qlp-stage" aria-label={t('nav.liveGames')}>
          {live.backendStatus === 'finished' ? (
            <div>
              <h2 className="qlp-question">{t('leaderboard.finalLeaderboardTitle')}</h2>
              <p className="qlp-muted">
                {liveQuizTitle} · {t('lobby.breadcrumbRoom', { pin: live.pin || '—' })}
              </p>

              <ol className="qlp-leaderboard">
                {sortedPlayers.map((p, idx) => {
                  const rank =
                    sortedPlayers.findIndex((other) => other.points === p.points) + 1;
                  const isSelf =
                    Boolean(playerName) &&
                    p.name.toLowerCase() === playerName.toLowerCase();
                  return (
                    <li key={p.id || p.name || idx} className={isSelf ? 'is-you' : undefined}>
                      <span>{rank}</span>
                      <strong>
                        {p.name}
                        {isSelf ? ' (YOU)' : ''}
                      </strong>
                      <span>{p.points.toLocaleString()} pts</span>
                    </li>
                  );
                })}
              </ol>

              <div className="qlp-results-actions">
                {reviewItems.length > 0 && (
                  <button
                    type="button"
                    className="qp-btn primary"
                    aria-expanded={showReview}
                    aria-controls="qlp-answer-review"
                    onClick={() => setShowReview((prev) => !prev)}
                  >
                    {showReview
                      ? t('leaderboard.hideAnswerReviewBtn')
                      : t('leaderboard.reviewAnswersBtn')}
                  </button>
                )}
                <button type="button" className="qp-btn" onClick={handleLeaveOrEnd}>
                  {isPlayer ? t('lobby.leaveRoom') : t('leaderboard.endGame')}
                </button>
              </div>

              {showReview && reviewItems.length > 0 && (
                <section id="qlp-answer-review" className="qlp-review">
                  <h3>{t('leaderboard.yourAnswersHeading')}</h3>
                  {reviewItems.map((item) => (
                    <article key={item.num}>
                      <h4>
                        {item.num}. {item.prompt}
                      </h4>
                      <p>
                        {t('results.yourAnswerLabel')}{' '}
                        {item.yourAnswer || t('leaderboard.unanswered')}
                      </p>
                      {item.correctAnswer && (
                        <p>
                          {t('results.correctAnswerLabel')} {item.correctAnswer}
                        </p>
                      )}
                    </article>
                  ))}
                </section>
              )}
            </div>
          ) : (
            <>
              <div className="qlp-round">
                <span>
                  {t('leaderboard.roundOf', { round, total: totalRounds })}
                </span>
                <div className="qlp-round-right">
                  {!isPlayer && (
                    <button
                      type="button"
                      className="qp-btn"
                      style={{ minHeight: 30, padding: '4px 10px', fontSize: 12.5 }}
                      onClick={() => setIsPaused((prev) => !prev)}
                      aria-pressed={isPaused}
                    >
                      {isPaused ? (
                        <>
                          <Play size={13} aria-hidden="true" />
                          <span>{t('leaderboard.resumeBtn')}</span>
                        </>
                      ) : (
                        <>
                          <Pause size={13} aria-hidden="true" />
                          <span>{t('leaderboard.pauseBtn')}</span>
                        </>
                      )}
                    </button>
                  )}
                  <span
                    role="timer"
                    className={`qlp-timer ${remainingSeconds <= 5 ? 'is-urgent' : ''}`}
                  >
                    <Clock size={14} aria-hidden="true" />
                    <span>
                      {t('leaderboard.timeRemaining', { seconds: remainingSeconds })}
                    </span>
                  </span>
                </div>
              </div>

              <Progress
                value={timerPct}
                aria-label={t('leaderboard.timeRemaining', { seconds: remainingSeconds })}
                className={`h-2 w-full rounded-full mb-4 ${
                  remainingSeconds <= 5
                    ? '[&>div]:bg-red-500'
                    : remainingSeconds <= 10
                    ? '[&>div]:bg-amber-500'
                    : '[&>div]:bg-primary'
                } [&>div]:transition-[width] [&>div]:duration-700 [&>div]:ease-linear`}
              />

              <h2 className="qlp-question">{activePrompt}</h2>

              <div className="qlp-answers" aria-label="Answer choices">
                {activeChoices.map((choice, cIdx) => {
                  const isSelected = live.selectedChoiceId === choice.id;
                  const isRevealedCorrect =
                    Boolean(revealedCorrectId) && revealedCorrectId === choice.id;
                  const isWrongSelected =
                    isSelected &&
                    Boolean(revealedCorrectId) &&
                    revealedCorrectId !== choice.id;
                  const isDimmed =
                    (Boolean(revealedCorrectId) && !isRevealedCorrect && !isSelected) ||
                    (Boolean(live.selectedChoiceId) && !isSelected && !isRevealedCorrect);

                  const cls = [
                    'qg-answer-tile',
                    isSelected && 'is-selected',
                    isRevealedCorrect && 'is-correct',
                    isWrongSelected && 'is-wrong',
                    isDimmed && 'is-dimmed'
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className={cls}
                      disabled={answerLocked}
                      onClick={() => {
                        if (!answerLocked) {
                          submitLiveAnswer(choice.id);
                        }
                      }}
                    >
                      <span className="qg-tile-badge" aria-hidden="true">
                        {LETTERS[cIdx] ?? String(choice.id).toUpperCase()}
                      </span>
                      <span className="qg-tile-label">{choice.text}</span>
                      {isRevealedCorrect && (
                        <span className="qg-tile-status" aria-hidden="true">
                          <Check size={15} strokeWidth={3} />
                        </span>
                      )}
                      {isWrongSelected && (
                        <span className="qg-tile-status" aria-hidden="true">
                          <X size={15} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {feedbackText && (
                <p className="qlp-feedback" role="status">
                  {feedbackText}
                </p>
              )}

              {!isPlayer && (
                <div className="qlp-host-bar">
                  <button type="button" className="qp-btn" onClick={handleLeaveOrEnd}>
                    {t('leaderboard.endGame')}
                  </button>
                  <button
                    type="button"
                    className="qp-btn primary"
                    onClick={() => void advanceLiveRound()}
                  >
                    {round < totalRounds ? (
                      <>
                        <Play size={15} aria-hidden="true" />
                        <span>{t('leaderboard.nextQuestionBtn')}</span>
                      </>
                    ) : (
                      <>
                        <Trophy size={15} aria-hidden="true" />
                        <span>{t('leaderboard.showLeaderboardBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="qp-workspace" data-name="Live quiz arena">
      {/* Live Game Arena Hero */}
      <section className="qp-hero qg-arena-hero" aria-labelledby="live-quiz-title">
        <div className="qp-hero-text">
          <div className="qp-eyeline">
            <span className="qg-live-dot" aria-hidden="true" />
            <span>
              {t(
                isPlayer ? 'leaderboard.livePlayerBadge' : 'leaderboard.liveHostBadge',
                { pin: live.pin || '—' }
              )}
            </span>
          </div>
          <h1 id="live-quiz-title">{liveQuizTitle}</h1>
          <div className="qp-hero-meta">
            <span className="qg-pin-pill">PIN {live.pin || '—'}</span>
            <span>
              <Layers size={15} aria-hidden="true" />
              {t('leaderboard.roundOf', { round, total: totalRounds })}
            </span>
            <i className="qp-sep" aria-hidden="true" />
            {canParticipate ? (
              <span>
                <Trophy size={15} aria-hidden="true" />
                {t('leaderboard.yourScore', {
                  points: (selfPlayer?.points ?? 0).toLocaleString()
                })}
              </span>
            ) : (
              <span>
                <Users size={15} aria-hidden="true" />
                {t('leaderboard.playersCount', { count: live.players.length })}
              </span>
            )}
          </div>
        </div>

        <div className="qp-hero-actions">
          <button type="button" className="qp-hero-btn" onClick={handleLeaveOrEnd}>
            <LogOut size={15} aria-hidden="true" />
            <span>{isPlayer ? t('lobby.leaveRoom') : t('leaderboard.endGame')}</span>
          </button>
        </div>

        <div className="qp-hero-art" aria-hidden="true">
          <div className="qp-mesh" />
          <i className="qp-star s1">✦</i>
          <div className="qp-deck">
            <div className="qp-tile back" />
            <div className="qp-tile mid" />
            <div className="qp-tile front">
              <Trophy size={40} strokeWidth={2.2} />
            </div>
          </div>
          <i className="qp-star s2">✦</i>
        </div>
      </section>

      {/* Main Arena Columns */}
      <div
        className="qp-layout"
        style={{ alignItems: 'stretch' }}
        data-name="Live results columns"
      >
        {/* Left: Active Game Question Stage (QuizClash-Live-Player style + Progress timeline) */}
        <article
          className="qp-card qp-play-card"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          data-name="Active live question"
        >
          <div className="qp-card-body" style={{ flex: 1 }}>
            {live.backendStatus === 'finished' ? (
              <div>
                <div className="qp-question-meta" style={{ marginBottom: 12 }}>
                  <span className="qp-q-tag">{t('leaderboard.currentStandings')}</span>
                  <span className="qp-q-total">
                    {t('leaderboard.roundOf', { round: totalRounds, total: totalRounds })}
                  </span>
                </div>
                <h2 className="qp-question" style={{ marginTop: 8, marginBottom: 8 }}>
                  {t('leaderboard.title')}
                </h2>
                <p className="qp-choice-legend" style={{ marginBottom: 16 }}>
                  {t('leaderboard.pointsHelper')}
                </p>

                {/* Final Leaderboard inside Main Stage (for Host & Players) */}
                <div className="qp-standings-list" style={{ marginBottom: 18 }}>
                  {sortedPlayers.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '18px 14px',
                        borderRadius: 12,
                        border: '1px dashed var(--qp-line)',
                        color: 'var(--qp-sub)',
                        fontSize: 13.5
                      }}
                    >
                      <Users size={18} aria-hidden="true" />
                      <span>{t('leaderboard.noPlayersYet')}</span>
                    </div>
                  ) : (
                    sortedPlayers.map((p, idx) => {
                      const isSelf =
                        canParticipate &&
                        Boolean(playerName) &&
                        p.name.toLowerCase() === playerName.toLowerCase();
                      const barWidth = Math.max(8, Math.round((p.points / topScore) * 100));
                      const medalCls =
                        idx === 0
                          ? 'rank-1'
                          : idx === 1
                          ? 'rank-2'
                          : idx === 2
                          ? 'rank-3'
                          : '';
                      return (
                        <div
                          key={p.name}
                          className={`qg-rank-row ${isSelf ? 'is-self' : ''}`}
                        >
                          <div
                            className="qg-rank-bar"
                            style={{ width: `${barWidth}%` }}
                            aria-hidden="true"
                          />
                          <span className={`qg-rank-medal ${medalCls}`}>{idx + 1}</span>
                          <div className="qg-rank-info">
                            <span className="qg-rank-name">
                              <span>{p.name}</span>
                              {isSelf && <span className="qg-you-tag">YOU</span>}
                            </span>
                            <span className="qg-rank-sub">
                              {p.correct} / {totalRounds}
                            </span>
                          </div>
                          <span className="qg-rank-score">
                            {p.points.toLocaleString()} pts
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="btn-row" style={{ marginBottom: 16 }}>
                  {liveQuestions.length > 0 && (
                    <button
                      type="button"
                      className="qp-btn primary"
                      aria-expanded={showReview}
                      onClick={() => setShowReview((prev) => !prev)}
                    >
                      {showReview
                        ? t('leaderboard.hideAnswer')
                        : t('leaderboard.showAnswer')}
                    </button>
                  )}
                  <button type="button" className="qp-btn" onClick={handleLeaveOrEnd}>
                    {isPlayer ? t('lobby.leaveRoom') : t('leaderboard.endGame')}
                  </button>
                </div>

                {showReview && liveQuestions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      marginTop: 12
                    }}
                  >
                    {liveQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 11,
                          border: '1px solid var(--qp-line)',
                          background: 'var(--qp-soft)'
                        }}
                      >
                        <div style={{ fontWeight: 650, fontSize: 14, marginBottom: 4 }}>
                          {qIdx + 1}. {q.prompt}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--qp-green)',
                            fontWeight: 600
                          }}
                        >
                          {t('leaderboard.correctAnswerEyebrow')}:{' '}
                          {q.choices[q.answer]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="qp-question-meta" style={{ marginBottom: 12 }}>
                  <div className="qp-counter">
                    <span className="qp-q-tag">
                      {t('leaderboard.roundOf', { round, total: totalRounds })}
                    </span>
                    <span className="qp-q-total">
                      {pad2(round)} / {pad2(totalRounds)}
                    </span>
                  </div>

                  <div className="qp-meta-right">
                    <span
                      role="timer"
                      className={`qp-timer-pill ${
                        remainingSeconds <= 5 ? 'is-urgent' : ''
                      }`}
                    >
                      <Clock size={14} aria-hidden="true" />
                      <span>
                        {t('leaderboard.timeRemaining', { seconds: remainingSeconds })}
                      </span>
                    </span>

                    {!isPlayer && (
                      <>
                        {!live.playerId && (
                          <button
                            type="button"
                            className="qp-btn"
                            style={{ minHeight: 34, padding: '5px 11px', fontSize: 12.5 }}
                            onClick={() => void joinAsHostPlayer()}
                          >
                            <UserPlus size={14} aria-hidden="true" />
                            <span>{t('leaderboard.joinAsPlayerBtn')}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="qp-btn"
                          style={{ minHeight: 34, padding: '5px 11px', fontSize: 12.5 }}
                          onClick={() => setIsPaused((prev) => !prev)}
                          aria-pressed={isPaused}
                        >
                          {isPaused ? (
                            <>
                              <Play size={14} aria-hidden="true" />
                              <span>{t('leaderboard.resumeBtn')}</span>
                            </>
                          ) : (
                            <>
                              <Pause size={14} aria-hidden="true" />
                              <span>{t('leaderboard.pauseBtn')}</span>
                            </>
                          )}
                        </button>
                        {!canParticipate && (
                          <button
                            type="button"
                            className="qp-btn"
                            style={{ minHeight: 34, padding: '5px 11px', fontSize: 12.5 }}
                            onClick={() => setHostShowAnswer((prev) => !prev)}
                          >
                            {hostShowAnswer ? (
                              <>
                                <EyeOff size={14} aria-hidden="true" />
                                <span>{t('leaderboard.hideAnswer')}</span>
                              </>
                            ) : (
                              <>
                                <Eye size={14} aria-hidden="true" />
                                <span>{t('leaderboard.showAnswer')}</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Round Timeline Progress Bar (QuizClash-Live-Player style) */}
                <Progress
                  value={timerPct}
                  aria-label={t('leaderboard.timeRemaining', { seconds: remainingSeconds })}
                  className={`h-2 w-full rounded-full mb-4 ${
                    remainingSeconds <= 5
                      ? '[&>div]:bg-red-500'
                      : remainingSeconds <= 10
                      ? '[&>div]:bg-amber-500'
                      : '[&>div]:bg-primary'
                  } [&>div]:transition-[width] [&>div]:duration-700 [&>div]:ease-linear`}
                />

                <h2 className="qp-question">{activePrompt}</h2>

                <p className="qp-choice-legend">
                  {canParticipate
                    ? live.selectedChoiceId
                      ? t('leaderboard.answerSubmitted')
                      : live.currentQuestion
                      ? t('leaderboard.selectBeforeTimer')
                      : t('leaderboard.waitingForNextQuestion')
                    : t('leaderboard.responsesReceived', {
                        received: answeredCount,
                        total: live.players.length
                      })}
                </p>

                {/* Answer Tiles (interactive for Players & Participating Hosts) */}
                <div className="qg-answer-grid">
                  {activeChoices.map((choice, cIdx) => {
                    const isSelected =
                      canParticipate && live.selectedChoiceId === choice.id;
                    const isRevealedCorrect = isPlayer
                      ? Boolean(revealedCorrectId) && revealedCorrectId === choice.id
                      : showHostCorrect &&
                        (revealedCorrectId
                          ? revealedCorrectId === choice.id
                          : Boolean(choice.isCorrect));
                    const isWrongSelected =
                      canParticipate &&
                      isSelected &&
                      Boolean(revealedCorrectId) &&
                      revealedCorrectId !== choice.id;
                    const isDimmed =
                      (hasReveal && !isRevealedCorrect && !isSelected) ||
                      (canParticipate &&
                        Boolean(live.selectedChoiceId) &&
                        !isSelected &&
                        !isRevealedCorrect);

                    const cls = [
                      'qg-answer-tile',
                      isSelected && 'is-selected',
                      isRevealedCorrect && 'is-correct',
                      isWrongSelected && 'is-wrong',
                      isDimmed && 'is-dimmed'
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={choice.id}
                        type="button"
                        className={cls}
                        disabled={answerLocked}
                        onClick={() => {
                          if (canParticipate && !answerLocked) {
                            submitLiveAnswer(choice.id);
                          }
                        }}
                      >
                        <span className="qg-tile-badge" aria-hidden="true">
                          {LETTERS[cIdx] ?? String(choice.id).toUpperCase()}
                        </span>
                        <span className="qg-tile-label">{choice.text}</span>
                        {isRevealedCorrect && (
                          <span className="qg-tile-status" aria-hidden="true">
                            <Check size={15} strokeWidth={3} />
                          </span>
                        )}
                        {isWrongSelected && (
                          <span className="qg-tile-status" aria-hidden="true">
                            <X size={15} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <footer className="qp-card-nav" data-name="Live navigation">
            {isPlayer ? (
              <span className="helper-text" style={{ fontSize: 13.5 }}>
                {live.selectedChoiceId
                  ? t('leaderboard.answerSubmitted')
                  : t('leaderboard.waitingForNextQuestion')}
              </span>
            ) : (
              <>
                <button type="button" className="qp-btn" onClick={handleLeaveOrEnd}>
                  {t('leaderboard.endGame')}
                </button>
                {live.backendStatus !== 'finished' && (
                  <button
                    type="button"
                    className="qp-btn primary"
                    onClick={() => void advanceLiveRound()}
                  >
                    {round < totalRounds ? (
                      <>
                        <Play size={15} aria-hidden="true" />
                        <span>{t('leaderboard.nextQuestionBtn')}</span>
                      </>
                    ) : (
                      <>
                        <Trophy size={15} aria-hidden="true" />
                        <span>{t('leaderboard.showLeaderboardBtn')}</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </footer>
        </article>

        {/* Right: Game Leaderboard & Podium */}
        <div className="qp-side-wrap" style={{ height: '100%' }}>
          <aside
            className="qp-card qp-side-card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
            data-name="Live leaderboard"
          >
            <div className="qp-card-heading">
              <h2>{t('leaderboard.currentStandings')}</h2>
              <Trophy size={19} aria-hidden="true" />
            </div>

            <div className="qp-progress-copy">
              <span>{t('leaderboard.roundOf', { round, total: totalRounds })}</span>
              <span className="qp-percentage">{roundPct}%</span>
            </div>

            <div className="qp-progress-track">
              <div className="qp-progress-fill" style={{ width: `${roundPct}%` }} />
            </div>

            {!canParticipate && (
              <div className="qp-host-stats">
                <div className="qp-stat-tile">
                  <div className="qp-stat-value">
                    {answeredCount} / {live.players.length}
                  </div>
                  <div className="qp-stat-label">{t('leaderboard.answeredCorrectly')}</div>
                </div>
                <div className="qp-stat-tile">
                  <div className="qp-stat-value">{remainingSeconds}s</div>
                  <div className="qp-stat-label">{t('lobby.timerLabel')}</div>
                </div>
              </div>
            )}

            <div className="qp-standings-list" style={{ flex: 1 }}>
              {sortedPlayers.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '22px 14px',
                    borderRadius: 12,
                    border: '1px dashed var(--qp-line)',
                    color: 'var(--qp-sub)',
                    textAlign: 'center',
                    fontSize: 13
                  }}
                >
                  <Users size={20} aria-hidden="true" />
                  <span>{t('leaderboard.noPlayersYet')}</span>
                </div>
              ) : (
                sortedPlayers.map((p, idx) => {
                  const isSelf =
                    canParticipate &&
                    Boolean(playerName) &&
                    p.name.toLowerCase() === playerName.toLowerCase();
                  const barWidth = Math.max(8, Math.round((p.points / topScore) * 100));
                  const medalCls =
                    idx === 0
                      ? 'rank-1'
                      : idx === 1
                      ? 'rank-2'
                      : idx === 2
                      ? 'rank-3'
                      : '';
                  return (
                    <div
                      key={p.name}
                      className={`qg-rank-row ${isSelf ? 'is-self' : ''}`}
                    >
                      <div
                        className="qg-rank-bar"
                        style={{ width: `${barWidth}%` }}
                        aria-hidden="true"
                      />
                      <span className={`qg-rank-medal ${medalCls}`}>
                        {idx + 1}
                      </span>
                      <div className="qg-rank-info">
                        <span className="qg-rank-name">
                          <span>{p.name}</span>
                          {isSelf && <span className="qg-you-tag">YOU</span>}
                        </span>
                        <span className="qg-rank-sub">
                          {p.correct} / {round}
                        </span>
                      </div>
                      <span className="qg-rank-score">
                        {p.points.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {!canParticipate && round < totalRounds && (
              <div className="qp-up-next" style={{ marginTop: 'auto' }}>
                <div className="qp-up-next-label">
                  {t('leaderboard.upNextEyebrow', {
                    num: pad2((round % totalRounds) + 1)
                  })}
                </div>
                <div className="qp-up-next-prompt">{nextQ.prompt}</div>
              </div>
            )}
          </aside>

          {canParticipate && (
            <p className="qp-shortcut-note">
              <kbd>A</kbd>–<kbd>D</kbd> {t('solo.shortcutChoose')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
