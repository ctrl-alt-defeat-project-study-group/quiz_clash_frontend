import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppPagination, PageHeader, SectionCard } from '../components/common';
import {
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireItem,
  QuestionnaireTitle,
} from '@/components/ui/questionnaire';

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

  const handleFinish = async () => {
    const attempt = await finishPractice();
    navigate(`/attempts/${encodeURIComponent(attempt.id)}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="SOLO PRACTICE / 04"
        title={quiz.title}
        subtitle="Take your time. Your progress is saved as you go."
        actions={
          <Link to="/dashboard" className="btn" data-name="Save & exit">
            Save &amp; exit
          </Link>
        }
      />

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
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            QUESTION {String(idx + 1).padStart(2, '0')} / MULTIPLE CHOICE
          </div>

          <Questionnaire
            key={`${quiz.id}-${idx}`}
            shortcuts="letters"
            onSubmit={(e) => e.preventDefault()}
          >
            <QuestionnaireItem name={`solo-q-${idx}`}>
              <QuestionnaireTitle className="question-prompt-lg m-0">
                {currentQ.prompt}
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Select one answer.
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {currentQ.choices.map((choiceText, cIdx) => {
                  const isSelected = selectedChoice === cIdx;
                  return (
                    <QuestionnaireChoice
                      key={cIdx}
                      value={String(cIdx)}
                      checked={isSelected}
                      onChange={() => selectPracticeAnswer(idx, cIdx)}
                    >
                      <span className="font-medium text-foreground">{choiceText}</span>
                      {isSelected && (
                        <QuestionnaireChoiceDescription className="text-xs">
                          Selected
                        </QuestionnaireChoiceDescription>
                      )}
                    </QuestionnaireChoice>
                  );
                })}
              </QuestionnaireChoices>
            </QuestionnaireItem>
          </Questionnaire>

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
        <AppPagination
          currentPage={idx + 1}
          totalPages={total}
          onPageChange={(page) => setPracticeQuestionIndex(page - 1)}
          ariaLabel="Practice navigation"
        />
      </div>

      <SectionCard className="banner-row" dataName="Finish quiz panel">
        <span className="helper-text" style={{ fontSize: 13 }}>
          Ready to submit? You can review any question before finishing.
        </span>
        <button type="button" className="btn btn-primary" onClick={handleFinish}>
          Finish quiz
        </button>
      </SectionCard>
    </>
  );
};
