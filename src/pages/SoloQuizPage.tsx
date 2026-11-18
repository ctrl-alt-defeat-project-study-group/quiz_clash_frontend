import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const SoloQuizPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    activeQuiz,
    practice,
    startPractice,
    selectPracticeAnswer,
    setPracticeQuestionIndex,
    finishPractice
  } = useApp();

  const navigate = useNavigate();

  useEffect(() => {
    if (id && id !== practice.quizId && quizzes.some((q) => q.id === id)) {
      startPractice(id);
    }
  }, [id, practice.quizId, quizzes, startPractice]);

  const quiz = quizzes.find((q) => q.id === practice.quizId) || activeQuiz;
  const total = quiz.questions.length;
  const idx = Math.min(Math.max(0, practice.questionIndex), Math.max(0, total - 1));
  const currentQ = quiz.questions[idx] || quiz.questions[0];
  const selectedChoice = practice.answers[idx];
  const answeredCount = Object.keys(practice.answers).filter(
    (k) => Number(k) < total
  ).length;
  const remainingCount = Math.max(0, total - answeredCount);
  const pct = Math.round((answeredCount / total) * 100);
  const letters = ['A', 'B', 'C', 'D'];

  const handleFinish = async () => {
    const attempt = await finishPractice();
    navigate(`/attempts/${encodeURIComponent(attempt.id)}`);
  };

  return (
    <>
      <div className="page-heading" data-name="Page heading">
        <div className="heading-copy">
          <div className="eyebrow">SOLO PRACTICE / 04</div>
          <h1 className="page-title">{quiz.title}</h1>
          <p className="page-subtitle">
            Take your time. Your progress is saved as you go.
          </p>
        </div>
        <Link to="/" className="btn" data-name="Save & exit">
          Save &amp; exit
        </Link>
      </div>

      <section className="progress-card" data-name="Quiz progress" aria-label="Quiz progress">
        <div className="progress-labels">
          <strong>
            Question {idx + 1} of {total}
          </strong>
          <span className="helper-text">
            {answeredCount} answered · {remainingCount} remaining
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </section>

      <div className="practice-columns" data-name="Practice columns">
        {/* Left: Active Question */}
        <section className="box-card" data-name="Active question">
          <div className="eyebrow">
            QUESTION {String(idx + 1).padStart(2, '0')} / MULTIPLE CHOICE
          </div>
          <h2 className="question-prompt-lg">{currentQ.prompt}</h2>
          <p className="helper-text" style={{ marginBottom: 16 }}>
            Select one answer.
          </p>

          <div
            className="answer-options-list"
            role="radiogroup"
            aria-label="Answer choices"
          >
            {currentQ.choices.map((choiceText, cIdx) => {
              const isSelected = selectedChoice === cIdx;
              return (
                <button
                  key={cIdx}
                  type="button"
                  className={`answer-option-box ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectPracticeAnswer(idx, cIdx)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span>
                    ({isSelected ? '●' : ' '}) &nbsp; <strong>{letters[cIdx]}.</strong>{' '}
                    &nbsp; {choiceText}
                  </span>
                  {isSelected && <span style={{ fontSize: 12 }}>Selected</span>}
                </button>
              );
            })}
          </div>

          <div className="helper-text" style={{ marginTop: 16, fontWeight: 600 }}>
            {selectedChoice !== undefined
              ? 'Answer selected · Saved'
              : 'No answer selected yet for this question'}
          </div>
        </section>

        {/* Right: Question Navigator */}
        <aside className="box-card" data-name="Question navigator">
          <h2 className="section-title">Your progress</h2>
          <div className="q-index-grid">
            {quiz.questions.map((_, i) => {
              const isCurrent = i === idx;
              const isAnswered = practice.answers[i] !== undefined;
              const cls = isCurrent ? 'current' : isAnswered ? 'answered' : '';
              return (
                <button
                  key={i}
                  type="button"
                  className={`q-index-btn ${cls}`}
                  onClick={() => setPracticeQuestionIndex(i)}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              );
            })}
          </div>

          <div className="helper-text" style={{ lineHeight: 1.7, marginBottom: 14 }}>
            <div>
              <strong>●</strong> Answered ({answeredCount})
            </div>
            <div>
              <strong>■</strong> Current question ({String(idx + 1).padStart(2, '0')})
            </div>
            <div>
              <strong>○</strong> Not answered ({remainingCount})
            </div>
          </div>
          <p className="helper-text">Answers are graded when you finish the quiz.</p>
        </aside>
      </div>

      <div className="action-footer-bar" data-name="Practice navigation">
        <button
          type="button"
          className="btn"
          disabled={idx === 0}
          onClick={() => setPracticeQuestionIndex(Math.max(0, idx - 1))}
        >
          ← Previous question
        </button>
        <button
          type="button"
          className="btn"
          disabled={idx === total - 1}
          onClick={() => setPracticeQuestionIndex(Math.min(total - 1, idx + 1))}
        >
          Next question →
        </button>
      </div>

      <section className="box-card banner-row" data-name="Finish quiz panel">
        <span className="helper-text" style={{ fontSize: 13 }}>
          Ready to submit? You can review any question before finishing.
        </span>
        <button type="button" className="btn btn-primary" onClick={handleFinish}>
          Finish quiz
        </button>
      </section>
    </>
  );
};
