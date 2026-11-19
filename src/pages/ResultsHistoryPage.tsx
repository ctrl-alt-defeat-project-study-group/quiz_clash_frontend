import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SEED_HISTORY } from '../data/seedData';
import { PageHeader, SectionCard, StatCard } from '../components/common';

export const ResultsHistoryPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    history,
    activeAttemptId,
    setActiveAttemptId,
    activeQuiz,
    startPractice,
    exportStudySheet
  } = useApp();

  const navigate = useNavigate();
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);

  useEffect(() => {
    if (id && history.some((h) => h.id === id)) {
      setActiveAttemptId(id);
    }
  }, [id, history, setActiveAttemptId]);

  const latest =
    history.find((h) => h.id === activeAttemptId) || history[0] || SEED_HISTORY[0];
  const quiz = quizzes.find((q) => q.id === latest.quizId) || activeQuiz;
  const missedList =
    latest.missed && latest.missed.length ? latest.missed : SEED_HISTORY[0].missed;

  return (
    <>
      <PageHeader
        eyebrow="RESULTS & HISTORY / 05"
        title="A little practice goes a long way."
        subtitle={`${latest.quizTitle} · Attempt completed · Saved to your profile`}
        actions={
          <Link to="/dashboard" className="btn">
            Back to dashboard
          </Link>
        }
      />

      <section className="stat-grid-4" data-name="Attempt summary" aria-label="Attempt summary">
        <StatCard value={`${latest.scorePct}%`} label="Your score" />
        <StatCard value={`${latest.correct} / ${latest.total}`} label="Correct answers" />
        <StatCard value={latest.duration} label="Time taken" />
        <StatCard value={latest.deltaPts} label="From last attempt" />
      </section>

      <SectionCard
        title={
          showAllAnswers
            ? `All ${quiz.questions.length} questions in ${quiz.title}`
            : missedList.length
            ? `Review the ${missedList.length} question${
                missedList.length === 1 ? '' : 's'
              } you missed`
            : 'Perfect score! Every question answered correctly'
        }
        headerRight={
          <button
            type="button"
            className="text-link"
            onClick={() => setShowAllAnswers((prev) => !prev)}
          >
            {showAllAnswers ? 'Show missed only →' : 'View all answers →'}
          </button>
        }
        dataName="Missed question review"
      >
        <div className="missed-grid">
          {showAllAnswers
            ? quiz.questions.map((q, idx) => (
                <article key={idx} className="feedback-card is-right">
                  <div className="eyebrow">
                    QUESTION {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{q.prompt}</h3>
                  <p style={{ fontSize: 13 }}>
                    <strong>Correct answer:</strong> {q.choices[q.answer]}
                  </p>
                  <p className="helper-text">
                    {q.explanation || 'Verified against your study notes.'}
                  </p>
                </article>
              ))
            : missedList.map((m, idx) => (
                <article key={idx} className="feedback-card is-wrong">
                  <div className="eyebrow">
                    QUESTION {String(m.number).padStart(2, '0')}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{m.prompt}</h3>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <div>
                      Your answer: <strong>{m.yourAnswer}</strong>
                    </div>
                    <div>
                      Correct answer: <strong>{m.correctAnswer}</strong>
                    </div>
                  </div>
                  <p className="helper-text">{m.explanation}</p>
                </article>
              ))}
        </div>
      </SectionCard>

      <SectionCard dataName="Attempt history">
        <h2 className="section-title" style={{ marginBottom: 4 }}>
          Your attempt history
        </h2>
        <p className="helper-text" style={{ marginBottom: 16 }}>
          {latest.quizTitle} · {history.length} completed attempts
        </p>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SCORE</th>
                <th>CORRECT</th>
                <th>DURATION</th>
                <th>REVIEW</th>
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
                        setShowAllAnswers(false);
                        navigate(`/attempts/${encodeURIComponent(h.id)}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      View attempt →
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
          Retake quiz
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => void exportStudySheet('answers')}
        >
          Download answer key
        </button>
        <Link to="/lobby" className="btn">
          Challenge friends
        </Link>
      </div>
    </>
  );
};
