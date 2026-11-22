import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, History, Trash2 } from 'lucide-react';
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

  const renderLiveHistoryCard = () => {
    if (!user || liveHistory.length === 0) return null;
    return (
      <SectionCard dataName="Live games history">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          {t('results.liveHistoryTitle')}
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          {t('results.liveHistorySubtitle')}
        </p>

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
                  <td>{formatLiveDate(item.finished_at || item.created_at)}</td>
                  <td>
                    <span className="score-badge" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                      {item.pin}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.quiz_title}</td>
                  <td>
                    {item.role === 'host'
                      ? t('results.roleHost')
                      : t('results.rolePlayer')}
                  </td>
                  <td>{item.player_count}</td>
                  <td>
                    {item.winner_name
                      ? `${item.winner_name} (${item.winner_points.toLocaleString()} pts)`
                      : t('results.noWinner')}
                  </td>
                  <td>
                    {item.my_points !== null
                      ? `#${item.my_rank ?? '—'} · ${item.my_points.toLocaleString()} pts (${item.my_correct ?? 0}/${item.total_rounds || item.my_total || 0})`
                      : t('results.noWinner')}
                  </td>
                  <td>
                    {item.role === 'host' ? (
                      <button
                        type="button"
                        className="text-link"
                        style={{ color: 'var(--danger, #dc2626)' }}
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
                        {t('results.deleteAttempt')}
                      </button>
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

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.attemptHistory') }
        ]}
        title={t('results.title')}
        subtitle={t('results.subtitle', { quizTitle: latest.quizTitle })}
      />

      <section
        className="stat-grid-4"
        data-name="Attempt summary"
        aria-label={t('results.attemptSummaryAria')}
      >
        <StatCard value={`${latest.scorePct}%`} label={t('results.yourScore')} />
        <StatCard
          value={`${latest.correct} / ${latest.total}`}
          label={t('results.correctAnswers')}
        />
        <StatCard value={latest.duration} label={t('results.timeTaken')} />
        <StatCard value={latest.deltaPts} label={t('results.fromLastAttempt')} />
      </section>

      <SectionCard dataName="Score progress chart">
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

      <SectionCard dataName="Attempt history">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16
          }}
        >
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
                  <td style={{ fontWeight: 600 }}>{h.quizTitle}</td>
                  <td>{h.dateLabel}</td>
                  <td>
                    <span className="score-badge">{h.scorePct}%</span>
                  </td>
                  <td>
                    {h.correct} / {h.total}
                  </td>
                  <td>{h.duration}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => {
                          setActiveAttemptId(h.id);
                          navigate(`/attempts/${encodeURIComponent(h.id)}`);
                        }}
                      >
                        {t('results.viewAttempt')}
                      </button>
                      <button
                        type="button"
                        className="text-link"
                        style={{ color: 'var(--danger, #dc2626)' }}
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
                        {t('results.deleteAttempt')}
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

      {renderLiveHistoryCard()}

      <div className="btn-row" data-name="Results actions">
        <Link to="/lobby" className="btn btn-primary">
          {t('results.challengeFriends')}
        </Link>
      </div>
    </>
  );
};
