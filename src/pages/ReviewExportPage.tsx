import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ExportFormat } from '../types/quiz';
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

export const ReviewExportPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    quizzes,
    activeQuiz,
    setActiveQuizId,
    updateQuizQuestion,
    saveQuizChanges,
    startPractice,
    setLiveQuizId,
    exportStudySheet,
    openModal,
    showToast
  } = useApp();

  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [editing, setEditing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

  useEffect(() => {
    if (id && quizzes.some((q) => q.id === id)) {
      setActiveQuizId(id);
    }
  }, [id, quizzes, setActiveQuizId]);

  const total = activeQuiz.questions.length;
  const safeIdx = Math.min(Math.max(0, questionIndex), Math.max(0, total - 1));
  const currentQ = activeQuiz.questions[safeIdx] || activeQuiz.questions[0];
  const nextQ = activeQuiz.questions[(safeIdx + 1) % total] || currentQ;
  const letters = ['A', 'B', 'C', 'D'];

  const handleDownloadQuestions = () => {
    if (exportFormat === 'word') {
      openModal({
        title: 'Word (.docx) Export Preview',
        message:
          'Word (.docx) export is a Phase 4 enhancement. Use the PDF format option now to download or print your formatted study sheet.'
      });
      return;
    }
    void exportStudySheet('questions');
  };

  const handleDownloadAnswers = () => {
    void exportStudySheet('answers');
  };

  return (
    <>
      <PageHeader
        eyebrow="MY QUIZZES / 03"
        title={activeQuiz.title}
        subtitle={`${total} multiple-choice questions · Source: ${
          activeQuiz.source || 'Uploaded_Notes.txt'
        }`}
        actions={
          <div className="field-group" style={{ margin: 0, minWidth: 220 }}>
            <label className="field-label-caps" htmlFor="switch-quiz-select">
              Switch Quiz
            </label>
            <select
              id="switch-quiz-select"
              className="select"
              value={activeQuiz.id}
              onChange={(e) => {
                const nextId = e.target.value;
                setActiveQuizId(nextId);
                setQuestionIndex(0);
                setEditing(false);
                navigate(`/quizzes/${encodeURIComponent(nextId)}`);
              }}
            >
              {quizzes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.questions.length} Qs)
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="btn-row" data-name="Study actions">
        <Link to="/dashboard" className="btn">
          ← My quizzes
        </Link>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(false);
            void saveQuizChanges(activeQuiz.id);
          }}
        >
          Save changes
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(activeQuiz.id);
            navigate(`/quizzes/${encodeURIComponent(activeQuiz.id)}/play`);
          }}
        >
          Start solo quiz →
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLiveQuizId(activeQuiz.id);
            navigate('/lobby');
          }}
        >
          Host live game
        </button>
      </div>

      <div className="review-columns" data-name="Review columns">
        {/* Left Column: Question Editor */}
        <div data-name="Question editor">
          <div className="question-nav-bar" data-name="Question navigation">
            <strong style={{ fontSize: 12 }}>
              QUESTION {safeIdx + 1} OF {total}
            </strong>
            <AppPagination
              currentPage={safeIdx + 1}
              totalPages={total}
              onPageChange={(page) => setQuestionIndex(page - 1)}
              className="mx-0 w-auto justify-end"
              ariaLabel="Question selector"
            />
          </div>

          <SectionCard
            title={
              <span className="eyebrow" style={{ margin: 0 }}>
                QUESTION {String(safeIdx + 1).padStart(2, '0')}
              </span>
            }
            headerRight={
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  const nextState = !editing;
                  setEditing(nextState);
                  if (!nextState) showToast('Question updates have been saved.');
                }}
              >
                {editing ? 'Done editing' : 'Edit question'}
              </button>
            }
            headerStyle={{ marginBottom: 8 }}
            dataName="Question one"
          >

            {editing ? (
              <>
                <div className="field-group">
                  <label className="field-label" htmlFor="edit-question-prompt">
                    Question prompt
                  </label>
                  <textarea
                    id="edit-question-prompt"
                    className="textarea"
                    value={currentQ.prompt}
                    onChange={(e) =>
                      updateQuizQuestion(activeQuiz.id, safeIdx, {
                        prompt: e.target.value
                      })
                    }
                  />
                </div>
                <div className="answer-options-list">
                  {currentQ.choices.map((choiceText, cIdx) => (
                    <div
                      key={cIdx}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          currentQ.answer === cIdx ? 'btn-primary' : ''
                        }`}
                        onClick={() =>
                          updateQuizQuestion(activeQuiz.id, safeIdx, { answer: cIdx })
                        }
                        title="Mark as correct answer"
                      >
                        {letters[cIdx]} {currentQ.answer === cIdx ? '✓' : ''}
                      </button>
                      <input
                        type="text"
                        className="input"
                        value={choiceText}
                        onChange={(e) => {
                          const nextChoices = [...currentQ.choices];
                          nextChoices[cIdx] = e.target.value;
                          updateQuizQuestion(activeQuiz.id, safeIdx, {
                            choices: nextChoices
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Questionnaire
                key={`${activeQuiz.id}-${safeIdx}`}
                shortcuts="letters"
                onSubmit={(e) => e.preventDefault()}
              >
                <QuestionnaireItem name={`review-q-${safeIdx}`}>
                  <QuestionnaireTitle className="question-prompt-lg m-0">
                    {currentQ.prompt}
                  </QuestionnaireTitle>
                  <QuestionnaireDescription>
                    Click any option to set it as the correct answer.
                  </QuestionnaireDescription>
                  <QuestionnaireChoices>
                    {currentQ.choices.map((choiceText, cIdx) => {
                      const isCorrect = currentQ.answer === cIdx;
                      return (
                        <QuestionnaireChoice
                          key={cIdx}
                          value={String(cIdx)}
                          checked={isCorrect}
                          onChange={() =>
                            updateQuizQuestion(activeQuiz.id, safeIdx, { answer: cIdx })
                          }
                          className={
                            isCorrect
                              ? 'border-[var(--success-border)] bg-[var(--success-bg)]/60 data-checked:border-[var(--success-border)] data-checked:bg-[var(--success-bg)]/60'
                              : undefined
                          }
                        >
                          <span className="font-medium text-foreground">{choiceText}</span>
                          <QuestionnaireChoiceDescription className="text-xs">
                            {isCorrect ? '✓ Correct' : 'Click to set correct'}
                          </QuestionnaireChoiceDescription>
                        </QuestionnaireChoice>
                      );
                    })}
                  </QuestionnaireChoices>
                </QuestionnaireItem>
              </Questionnaire>
            )}

            <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700 }}>
              Correct answer: {letters[currentQ.answer]}
            </div>
          </SectionCard>

          <SectionCard
            style={{ marginTop: 16 }}
            dataName="Next question preview"
          >
            <div className="eyebrow">
              UP NEXT / QUESTION {String(((safeIdx + 1) % total) + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{nextQ.prompt}</div>
          </SectionCard>

          <div style={{ marginTop: 16 }} data-name="Editor pagination">
            <AppPagination
              currentPage={safeIdx + 1}
              totalPages={total}
              onPageChange={(page) => setQuestionIndex(page - 1)}
              ariaLabel="Editor pagination"
            />
          </div>
        </div>

        {/* Right Column: Offline Export & Reminder */}
        <aside
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          data-name="Quiz options"
        >
          <section className="box-card" data-name="Offline export">
            <h2 className="panel-heading" style={{ marginBottom: 8 }}>
              Print or study offline
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              Download questions and a separate answer key.
            </p>

            <div className="field-label-caps" style={{ marginBottom: 8 }}>
              DOCUMENT FORMAT
            </div>
            <div className="btn-row" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${exportFormat === 'pdf' ? 'btn-primary' : ''}`}
                onClick={() => setExportFormat('pdf')}
              >
                ({exportFormat === 'pdf' ? '●' : ' '}) PDF
              </button>
              <button
                type="button"
                className={`btn btn-sm ${exportFormat === 'word' ? 'btn-primary' : ''}`}
                onClick={() => setExportFormat('word')}
              >
                ({exportFormat === 'word' ? '●' : ' '}) Word
              </button>
            </div>

            <div className="doc-mini-preview" data-name="Document preview">
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  marginBottom: 6
                }}
              >
                {activeQuiz.title}
              </div>
              <div className="helper-text" style={{ fontSize: 11, marginBottom: 10 }}>
                Name: __________________
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {safeIdx + 1}. {currentQ.prompt}
              </div>
              <div>
                {currentQ.choices.map((c, idx) => (
                  <div key={idx}>
                    {letters[idx]}. {c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadQuestions}
              >
                Download questions
              </button>
              <button type="button" className="btn" onClick={handleDownloadAnswers}>
                Download answer key
              </button>
            </div>
          </section>

          <section className="box-card" data-name="Review reminder">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              Before you study
            </h3>
            <p className="helper-text">
              AI-generated questions may need adjustments. Review the wording and correct
              answers against your source material.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
};
