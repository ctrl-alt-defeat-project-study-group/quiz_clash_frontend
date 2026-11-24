import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Eye, History, Trash2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useApp } from '../context/AppContext';
import { AppPagination, PageHeader, SectionCard, StatCard } from '../components/common';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';

const HISTORY_PAGE_SIZE = 10;

export const ResultsHistoryPage: React.FC = () => {
  const {
    user,
    history,
    liveHistory,
    activeAttemptId,
    setActiveAttemptId,
    deleteAttempt,
    clearAllAttempts,
    deleteLiveHistoryRoom,
    openModal,
    t
  } = useApp();

  const navigate = useNavigate();
  const [attemptPage, setAttemptPage] = useState<number>(1);
  const [livePage, setLivePage] = useState<number>(1);
  const [mobileHistoryTab, setMobileHistoryTab] = useState<'solo' | 'live'>('solo');

  const attemptTotalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const safeAttemptPage = Math.min(attemptPage, attemptTotalPages);
  const pagedHistory = history.slice(
    (safeAttemptPage - 1) * HISTORY_PAGE_SIZE,
    safeAttemptPage * HISTORY_PAGE_SIZE
  );

  const liveTotalPages = Math.max(1, Math.ceil(liveHistory.length / HISTORY_PAGE_SIZE));
  const safeLivePage = Math.min(livePage, liveTotalPages);
  const pagedLiveHistory = liveHistory.slice(
    (safeLivePage - 1) * HISTORY_PAGE_SIZE,
    safeLivePage * HISTORY_PAGE_SIZE
  );

  const latest =
    history.find((h) => h.id === activeAttemptId) ?? history[0] ?? null;

  const formatLiveDate = (iso: string | null | undefined) => {
    if (!iso) return t('common.today');
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return t('common.today');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderLiveHistoryCard = (showEmptyFallback = false) => {
    if (!user) return null;
    if (liveHistory.length === 0) {
      if (!showEmptyFallback) return null;
      return (
        <SectionCard className="history-empty-live-card" dataName="Live games history">
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            {t('results.noLiveHistoryTitle')}
          </h2>
          <p className="helper-text" style={{ margin: 0 }}>
            {t('results.liveHistorySubtitle')}
          </p>
        </SectionCard>
      );
    }
    return (
      <SectionCard className="history-records history-room-records" dataName="Live games history">
        <div className="history-records-head">
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              {t('results.liveHistoryTitle')}
            </h2>
            <p className="helper-text" style={{ margin: 0 }}>
              {t('results.liveHistorySubtitle')}
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('results.colDate')}</th>
                <th>{t('results.colPin')}</th>
                <th>{t('results.colQuiz')}</th>
                <th>{t('results.colRole')}</th>
                <th>{t('results.colPlayers')}</th>
                <th>{t('results.colWinner')}</th>
                <th>{t('results.colYourResult')}</th>
                <th>{t('dashboard.colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {pagedLiveHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colDate')}
                    </span>
                    <div className="ah-cell-value">
                      {formatLiveDate(item.finished_at || item.created_at)}
                    </div>
                  </td>
                  <td>
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colPin')}
                    </span>
                    <div className="ah-cell-value">
                      <span className="score-badge" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.pin}
                      </span>
                    </div>
                  </td>
                  <td className="ah-room-title" style={{ fontWeight: 600 }}>
                    <div className="ah-cell-value">{item.quiz_title}</div>
                  </td>
                  <td>
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colRole')}
                    </span>
                    <div className="ah-cell-value">
                      {item.role === 'host'
                        ? t('results.roleHost')
                        : t('results.rolePlayer')}
                    </div>
                  </td>
                  <td>
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colPlayers')}
                    </span>
                    <div className="ah-cell-value">{item.player_count}</div>
                  </td>
                  <td className="ah-room-wide">
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colWinner')}
                    </span>
                    <div className="ah-cell-value">
                      {item.winner_name
                        ? `${item.winner_name} (${item.winner_points.toLocaleString()} pts)`
                        : t('results.noWinner')}
                    </div>
                  </td>
                  <td className="ah-room-wide">
                    <span className="ah-mobile-label" aria-hidden="true">
                      {t('results.colYourResult')}
                    </span>
                    <div className="ah-cell-value">
                      {item.my_points !== null
                        ? `#${item.my_rank ?? '—'} · ${item.my_points.toLocaleString()} pts (${item.my_correct ?? 0}/${item.total_rounds || item.my_total || 0})`
                        : t('results.noWinner')}
                    </div>
                  </td>
                  <td className="ah-cell-actions">
                    {item.role === 'host' ? (
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-btn is-danger"
                          title={t('results.deleteAttempt')}
                          aria-label={t('results.deleteAttempt')}
                          onClick={() => {
                            openModal({
                              title: t('results.deleteAttemptConfirmTitle'),
                              message: t('results.deleteAttemptConfirmMsg'),
                              confirmLabel: t('results.deleteAttempt'),
                              onConfirm: () => {
                                void deleteLiveHistoryRoom(item.id);
                              }
                            });
                          }}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <span className="helper-text">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {liveTotalPages > 1 && (
          <div style={{ marginTop: 14 }}>
            <AppPagination
              currentPage={safeLivePage}
              totalPages={liveTotalPages}
              onPageChange={setLivePage}
            />
          </div>
        )}
      </SectionCard>
    );
  };

  const chartData = useMemo(
    () =>
      [...history].reverse().map((h, idx) => ({
        attempt: h.dateLabel,
        label: `#${idx + 1} · ${h.quizTitle}`,
        scorePct: h.scorePct,
        correct: h.correct,
        total: h.total
      })),
    [history]
  );

  const chartConfig = useMemo<ChartConfig>(
    () => ({
      scorePct: {
        label: t('results.scoreSeriesLabel'),
        color: 'var(--primary)'
      }
    }),
    [t]
  );

  if (!latest) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.attemptHistory') }
          ]}
          title={t('nav.attemptHistory')}
          subtitle={t('results.emptySubtitle')}
        />

        <section
          className="ah-empty-state"
          aria-labelledby="empty-history-heading"
          data-name="Empty attempt history"
        >
          <div className="ah-empty-content">
            <div className="ah-empty-icon" aria-hidden="true">
              <History size={24} />
            </div>
            <h2 id="empty-history-heading">{t('results.emptyTitle')}</h2>
            <p className="ah-empty-description">{t('results.emptyDesc')}</p>
            <div className="ah-empty-actions">
              <Link className="ah-primary-action" to="/generate">
                <span>{t('results.emptyGenerateBtn')}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="ah-secondary-action" to="/quizzes">
                {t('results.emptyMyQuizzesBtn')}
              </Link>
            </div>
          </div>

          <div
            className="ah-chart-scene"
            role="img"
            aria-label={t('results.emptyChartTitle')}
          >
            <div className="ah-chart" aria-hidden="true">
              <div className="ah-chart-heading">
                <span>{t('results.emptyChartTitle')}</span>
                <span className="ah-chart-unit">%</span>
              </div>
              <div className="ah-plot">
                <svg
                  className="ah-plot-grid"
                  viewBox="0 0 320 148"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 1H320M0 38H320M0 74H320M0 111H320"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="4 5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M0 1V147H320"
                    fill="none"
                    stroke="currentColor"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="ah-plot-marker">
                  <BarChart3 size={25} />
                </div>
              </div>
              <div className="ah-plot-axis">{t('results.emptyChartAxis')}</div>
            </div>
          </div>
        </section>

        {renderLiveHistoryCard()}
      </>
    );
  }

  const avgScore = history.length
    ? Math.round(history.reduce((sum, item) => sum + item.scorePct, 0) / history.length)
    : 0;
  const bestScore = history.length
    ? Math.max(...history.map((item) => item.scorePct))
    : 0;

  return (
    <div className="history-page" data-history={mobileHistoryTab}>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.attemptHistory') }
        ]}
        title={t('nav.attemptHistory')}
        subtitle={t('results.emptySubtitle')}
      />

      <section
        className="stat-grid-4 history-metrics"
        data-name="Attempt history overview"
        aria-label={t('results.historySummaryAria')}
      >
        <StatCard value={history.length} label={t('results.totalAttempts')} />
        <StatCard value={`${avgScore}%`} label={t('results.averageScore')} />
        <StatCard value={`${bestScore}%`} label={t('results.bestScore')} />
        <StatCard
          value={`${latest.scorePct}%`}
          label={t('results.latestScore')}
          to={`/attempts/${encodeURIComponent(latest.id)}`}
        />
      </section>

      <SectionCard className="history-chart-card" dataName="Score progress chart">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          {t('results.scoreTrendTitle')}
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          {t('results.scoreTrendSubtitle')}
        </p>

        <ChartContainer config={chartConfig} className="attempt-chart-container">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient id="attemptScoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-scorePct)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="var(--color-scorePct)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="attempt"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Area
              dataKey="scorePct"
              type="monotone"
              fill="url(#attemptScoreFill)"
              stroke="var(--color-scorePct)"
              strokeWidth={2.5}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </SectionCard>

      {user && (
        <div
          className="history-switch"
          role="group"
          aria-label={t('results.historyTypeAria')}
        >
          <button
            type="button"
            aria-controls="solo-history-panel"
            aria-pressed={mobileHistoryTab === 'solo'}
            onClick={() => setMobileHistoryTab('solo')}
          >
            {t('results.soloAttemptsTab')}
          </button>
          <button
            type="button"
            aria-controls="live-history-panel"
            aria-pressed={mobileHistoryTab === 'live'}
            onClick={() => setMobileHistoryTab('live')}
          >
            {t('results.liveGamesTab')}
          </button>
        </div>
      )}

      <div id="solo-history-panel" className="history-panel-solo">
        <SectionCard className="history-records history-attempt-records" dataName="Attempt history">
          <div className="history-records-head">
            <div>
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {t('results.attemptHistoryTitle')}
              </h2>
              <p className="helper-text" style={{ margin: 0 }}>
                {t('results.allAttemptsSubtitle', { count: history.length })}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                openModal({
                  title: t('results.clearHistoryConfirmTitle'),
                  message: t('results.clearHistoryConfirmMsg'),
                  confirmLabel: t('results.clearHistory'),
                  onConfirm: () => {
                    void clearAllAttempts();
                  }
                });
              }}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>{t('results.clearHistory')}</span>
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('results.colQuiz')}</th>
                  <th>{t('results.colDate')}</th>
                  <th>{t('results.colScore')}</th>
                  <th>{t('results.colCorrect')}</th>
                  <th>{t('results.colDuration')}</th>
                  <th>{t('results.colReview')}</th>
                </tr>
              </thead>
              <tbody>
                {pagedHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="ah-cell-title" style={{ fontWeight: 600 }}>
                      <div className="ah-cell-value">{h.quizTitle}</div>
                    </td>
                    <td className="ah-cell-date">
                      <div className="ah-cell-value">{h.dateLabel}</div>
                    </td>
                    <td className="ah-cell-score">
                      <span className="ah-mobile-label" aria-hidden="true">
                        {t('results.colScore')}
                      </span>
                      <div className="ah-cell-value">
                        <span className="score-badge">{h.scorePct}%</span>
                      </div>
                    </td>
                    <td className="ah-cell-correct">
                      <span className="ah-mobile-label" aria-hidden="true">
                        {t('results.colCorrect')}
                      </span>
                      <div className="ah-cell-value">
                        {h.correct} / {h.total}
                      </div>
                    </td>
                    <td className="ah-cell-duration">
                      <span className="ah-mobile-label" aria-hidden="true">
                        {t('results.colDuration')}
                      </span>
                      <div className="ah-cell-value">{h.duration}</div>
                    </td>
                    <td className="ah-cell-actions">
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-btn is-primary"
                          title={t('results.viewAttempt')}
                          aria-label={t('results.viewAttempt')}
                          onClick={() => {
                            setActiveAttemptId(h.id);
                            navigate(`/attempts/${encodeURIComponent(h.id)}`);
                          }}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn is-danger"
                          title={t('results.deleteAttempt')}
                          aria-label={t('results.deleteAttempt')}
                          onClick={() => {
                            openModal({
                              title: t('results.deleteAttemptConfirmTitle'),
                              message: t('results.deleteAttemptConfirmMsg'),
                              confirmLabel: t('results.deleteAttempt'),
                              onConfirm: () => {
                                void deleteAttempt(h.id);
                              }
                            });
                          }}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {attemptTotalPages > 1 && (
            <div style={{ marginTop: 14 }}>
              <AppPagination
                currentPage={safeAttemptPage}
                totalPages={attemptTotalPages}
                onPageChange={setAttemptPage}
              />
            </div>
          )}
        </SectionCard>
      </div>

      {user && (
        <div id="live-history-panel" className="history-panel-live">
          {renderLiveHistoryCard(true)}
        </div>
      )}

      <div className="btn-row" data-name="Results actions">
        <Link to="/lobby" className="btn btn-primary">
          {t('results.challengeFriends')}
        </Link>
      </div>
    </div>
  );
};
