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
    loadQuizDetails,
    practice,
    startPractice,
    selectPracticeAnswer,
    setPracticeQuestionIndex,
    finishPractice,
    t
  } = useApp();

  const navigate = useNavigate();

  useEffect(() => {
    if (id && id !== practice.quizId && quizzes.some((q) => q.id === id)) {
      startPractice(id);
    }
  }, [id, practice.quizId, quizzes, startPractice]);

  const quiz = quizzes.find((q) => q.id === practice.quizId) ?? activeQuiz;

  useEffect(() => {
    if (quiz?.backendId && !quiz.questionsLoaded) {
      void loadQuizDetails(quiz.id, 'play');
    }
  }, [quiz, loadQuizDetails]);

  if (!quiz) {
    return (
      <>
        <PageHeader
          breadcrumbs={[
            { label: 'QuizClash', to: '/' },
            { label: t('nav.yourLibrary'), to: '/quizzes' }
          ]}
          title={t('nav.myQuizzes')}
          subtitle={t('solo.subtitle')}
        />
        <SectionCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <p className="helper-text">{t('dashboard.bannerTitle')}</p>
            <Link to="/generate" className="btn btn-primary">
              {t('dashboard.createQuizBtn')}
            </Link>
          </div>
        </SectionCard>
      </>
    );
  }

  const total = quiz.questions.length;
  const idx = Math.min(Math.max(0, practice.questionIndex), Math.max(0, total - 1));
  const currentQ = quiz.questions[idx] ||
    quiz.questions[0] || {
      prompt: 'Loading question…',
      choices: ['—', '—', '—', '—'],
      answer: 0
    };
  const selectedChoice = practice.answers[idx];
  const answeredCount = Object.keys(practice.answers).filter(
    (k) => Number(k) < total
  ).length;
  const remainingCount = Math.max(0, total - answeredCount);
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const handleFinish = async () => {
    const attempt = await finishPractice();
    if (attempt) {
      navigate(`/attempts/${encodeURIComponent(attempt.id)}`);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.yourLibrary'), to: '/quizzes' },
          {
            label: quiz.sidebarTitle || quiz.title,
            siblingRoutes: quizzes.map((q) => ({
              label: q.sidebarTitle || q.title,
              active: q.id === quiz.id,
              onClick: () => {
                startPractice(q.id);
                navigate(`/quizzes/${encodeURIComponent(q.id)}/play`);
              }
            }))
          }
        ]}
        title={quiz.title}
        subtitle={t('solo.subtitle')}
        actions={
          <Link to="/dashboard" className="btn" data-name="Save & exit">
            {t('solo.saveAndExit')}
          </Link>
        }
      />

      <section
        className="progress-card"
        data-name="Quiz progress"
        aria-label={t('solo.progressAria')}
      >
        <div className="progress-labels">
          <strong>{t('solo.questionOf', { current: idx + 1, total })}</strong>
          <span className="helper-text">
            {t('solo.answeredRemaining', {
              answered: answeredCount,
              remaining: remainingCount
            })}
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
            {t('solo.questionEyebrow', { num: String(idx + 1).padStart(2, '0') })}
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
                {t('solo.selectOneAnswer')}
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
                          {t('solo.selected')}
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
              ? t('solo.answerSaved')
              : t('solo.noAnswerYet')}
          </div>
        </section>

        {/* Right: Question Navigator */}
        <aside className="box-card" data-name="Question navigator">
          <h2 className="section-title">{t('solo.yourProgress')}</h2>
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
              <strong>●</strong> {t('solo.legendAnswered', { count: answeredCount })}
            </div>
            <div>
              <strong>■</strong>{' '}
              {t('solo.legendCurrent', { num: String(idx + 1).padStart(2, '0') })}
            </div>
            <div>
              <strong>○</strong> {t('solo.legendNotAnswered', { count: remainingCount })}
            </div>
          </div>
          <p className="helper-text">{t('solo.gradedOnFinish')}</p>
        </aside>
      </div>

      <div className="action-footer-bar" data-name="Practice navigation">
        <AppPagination
          currentPage={idx + 1}
          totalPages={total}
          onPageChange={(page) => setPracticeQuestionIndex(page - 1)}
          ariaLabel={t('solo.practiceNavAria')}
        />
      </div>

      <SectionCard className="banner-row" dataName="Finish quiz panel">
        <span className="helper-text" style={{ fontSize: 13 }}>
          {t('solo.finishPrompt')}
        </span>
        <button type="button" className="btn btn-primary" onClick={handleFinish}>
          {t('solo.finishQuizBtn')}
        </button>
      </SectionCard>
    </>
  );
};
