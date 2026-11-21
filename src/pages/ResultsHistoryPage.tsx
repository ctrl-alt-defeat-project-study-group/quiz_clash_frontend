import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatCard } from '../components/common';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';

export const ResultsHistoryPage: React.FC = () => {
  const {
    history,
    activeAttemptId,
    setActiveAttemptId,
    startPractice,
    exportStudySheet,
    exportingKind,
    t
  } = useApp();

  const navigate = useNavigate();

  const latest =
    history.find((h) => h.id === activeAttemptId) ?? history[0] ?? null;

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
          title={t('results.title')}
          subtitle={t('results.scoreTrendSubtitle')}
        />
        <SectionCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <p className="helper-text">{t('dashboard.bannerBody')}</p>
            <Link to="/dashboard" className="btn btn-primary">
              {t('results.backToDashboard')}
            </Link>
          </div>
        </SectionCard>
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
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          {t('results.attemptHistoryTitle')}
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          {t('results.attemptHistorySubtitle', {
            quizTitle: latest.quizTitle,
            count: history.length
          })}
        </p>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('results.colDate')}</th>
                <th>{t('results.colScore')}</th>
                <th>{t('results.colCorrect')}</th>
                <th>{t('results.colDuration')}</th>
                <th>{t('results.colReview')}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.dateLabel}</td>
                  <td>
                    <span className="score-badge">{h.scorePct}%</span>
                  </td>
                  <td>
                    {h.correct} / {h.total}
                  </td>
                  <td>{h.duration}</td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="btn-row" data-name="Results actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(latest.quizId);
            navigate(`/quizzes/${encodeURIComponent(latest.quizId)}/play`);
          }}
        >
          {t('results.retakeQuiz')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void exportStudySheet('answers')}
          disabled={exportingKind !== null}
          aria-busy={exportingKind === 'answers'}
          style={{ gap: 8 }}
        >
          {exportingKind === 'answers' ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          <span>
            {exportingKind === 'answers'
              ? t('review.downloadingAnswerKey')
              : t('results.downloadAnswerKey')}
          </span>
        </button>
        <Link to="/lobby" className="btn">
          {t('results.challengeFriends')}
        </Link>
      </div>
    </>
  );
};
