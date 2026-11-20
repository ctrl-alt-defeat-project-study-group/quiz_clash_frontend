import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ExportFormat } from '../types/quiz';
import { AppPagination, PageHeader, SectionCard } from '../components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
    showToast,
    t
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
        title: t('modals.wordExportTitle'),
        message: t('modals.wordExportMessage')
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
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.yourLibrary'), to: '/quizzes' },
          {
            label: activeQuiz.sidebarTitle || activeQuiz.title,
            siblingRoutes: quizzes.map((q) => ({
              label: q.sidebarTitle || q.title,
              active: q.id === activeQuiz.id,
              onClick: () => {
                setActiveQuizId(q.id);
                setQuestionIndex(0);
                navigate(`/quizzes/${encodeURIComponent(q.id)}`);
              }
            }))
          }
        ]}
        title={activeQuiz.title}
        subtitle={t('review.subtitle', {
          count: total,
          source: activeQuiz.source || 'Uploaded_Notes.txt'
        })}
        actions={
          <div className="field-group" style={{ margin: 0, minWidth: 220 }}>
            <label className="field-label-caps" htmlFor="switch-quiz-select">
              {t('review.switchQuizLabel')}
            </label>
            <Select
              value={activeQuiz.id}
              onValueChange={(nextId) => {
                setActiveQuizId(nextId);
                setQuestionIndex(0);
                setEditing(false);
                navigate(`/quizzes/${encodeURIComponent(nextId)}`);
              }}
            >
              <SelectTrigger id="switch-quiz-select" className="w-full">
                <SelectValue placeholder={t('review.switchQuizPlaceholder')} />
              </SelectTrigger>
              <SelectContent position="popper">
                {quizzes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title} ({t('common.questionsShort', { count: item.questions.length })})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="btn-row" data-name="Study actions">
        <Link to="/dashboard" className="btn">
          {t('review.backToQuizzes')}
        </Link>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(false);
            void saveQuizChanges(activeQuiz.id);
          }}
        >
          {t('common.saveChanges')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            startPractice(activeQuiz.id);
            navigate(`/quizzes/${encodeURIComponent(activeQuiz.id)}/play`);
          }}
        >
          {t('review.startSoloQuiz')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLiveQuizId(activeQuiz.id);
            navigate('/lobby');
          }}
        >
          {t('review.hostLiveGame')}
        </button>
      </div>

      <div className="review-columns" data-name="Review columns">
        {/* Left Column: Question Editor */}
        <div data-name="Question editor">
          <div className="question-nav-bar" data-name="Question navigation">
            <strong className="question-nav-label">
              {t('review.questionOf', { current: safeIdx + 1, total })}
            </strong>
            <AppPagination
              currentPage={safeIdx + 1}
              totalPages={total}
              onPageChange={(page) => setQuestionIndex(page - 1)}
              className="mx-0 w-full justify-center"
              ariaLabel={t('review.questionSelectorAria')}
            />
          </div>

          <SectionCard
            title={
              <span className="eyebrow" style={{ margin: 0 }}>
                {t('review.questionEyebrow', { num: String(safeIdx + 1).padStart(2, '0') })}
              </span>
            }
            headerRight={
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  const nextState = !editing;
                  setEditing(nextState);
                  if (!nextState) showToast(t('toasts.questionSaved'));
                }}
              >
                {editing ? t('review.doneEditing') : t('review.editQuestion')}
              </button>
            }
            headerStyle={{ marginBottom: 8 }}
            dataName="Question one"
          >

            {editing ? (
              <>
                <div className="field-group">
                  <label className="field-label" htmlFor="edit-question-prompt">
                    {t('review.questionPromptLabel')}
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
                        title={t('review.markCorrectTitle')}
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
                    {t('review.selectCorrectHelper')}
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
                            {isCorrect
                              ? t('review.choiceCorrect')
                              : t('review.choiceSetCorrect')}
                          </QuestionnaireChoiceDescription>
                        </QuestionnaireChoice>
                      );
                    })}
                  </QuestionnaireChoices>
                </QuestionnaireItem>
              </Questionnaire>
            )}

            <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700 }}>
              {t('review.correctAnswerValue', { letter: letters[currentQ.answer] })}
            </div>
          </SectionCard>

          <SectionCard
            style={{ marginTop: 16 }}
            dataName="Next question preview"
          >
            <div className="eyebrow">
              {t('review.upNextEyebrow', {
                num: String(((safeIdx + 1) % total) + 1).padStart(2, '0')
              })}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{nextQ.prompt}</div>
          </SectionCard>

          <div style={{ marginTop: 16 }} data-name="Editor pagination">
            <AppPagination
              currentPage={safeIdx + 1}
              totalPages={total}
              onPageChange={(page) => setQuestionIndex(page - 1)}
              ariaLabel={t('review.editorPaginationAria')}
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
              {t('review.printTitle')}
            </h2>
            <p className="helper-text" style={{ marginBottom: 16 }}>
              {t('review.printSubtitle')}
            </p>

            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="field-label-caps" htmlFor="export-document-format">
                {t('review.documentFormatLabel')}
              </label>
              <Select
                value={exportFormat}
                onValueChange={(val) => setExportFormat(val as ExportFormat)}
              >
                <SelectTrigger id="export-document-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="pdf">{t('review.formatPdf')}</SelectItem>
                  <SelectItem value="word">{t('review.formatWord')}</SelectItem>
                </SelectContent>
              </Select>
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
                {t('review.worksheetName')}
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
                {t('review.downloadQuestions')}
              </button>
              <button type="button" className="btn" onClick={handleDownloadAnswers}>
                {t('review.downloadAnswerKey')}
              </button>
            </div>
          </section>

          <section className="box-card" data-name="Review reminder">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              {t('review.beforeStudyTitle')}
            </h3>
            <p className="helper-text">{t('review.beforeStudyBody')}</p>
          </section>
        </aside>
      </div>
    </>
  );
};
