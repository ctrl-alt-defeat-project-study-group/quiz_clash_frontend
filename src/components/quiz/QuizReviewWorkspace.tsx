import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, Loader2, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ExportFormat, QuizItem } from '../../types/quiz';
import { AppPagination, SectionCard } from '../common';
import { Progress } from '@/components/ui/progress';
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
  QuestionnaireTitle
} from '@/components/ui/questionnaire';

interface QuizReviewWorkspaceProps {
  quiz: QuizItem;
  leftFooter?: React.ReactNode;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const QuizReviewWorkspace: React.FC<QuizReviewWorkspaceProps> = ({
  quiz,
  leftFooter
}) => {
  const {
    setActiveQuizId,
    updateQuizQuestion,
    deleteQuizQuestion,
    saveQuizChanges,
    exportStudySheet,
    exportingKind,
    openModal,
    t
  } = useApp();

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [editing, setEditing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'questions' | 'answers'>('questions');
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const total = quiz.questions.length;
  const safeIdx = Math.min(Math.max(0, questionIndex), Math.max(0, total - 1));
  const safePreviewIdx = Math.min(Math.max(0, previewIndex), Math.max(0, total - 1));
  const previewProgress = total > 0 ? Math.round(((safePreviewIdx + 1) / total) * 100) : 0;

  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPreviewIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPreviewIndex((prev) => Math.min(Math.max(0, total - 1), prev + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewOpen, total]);

  const currentQ = quiz.questions[safeIdx] ||
    quiz.questions[0] || {
      prompt: 'Loading question…',
      choices: ['—', '—', '—', '—'],
      answer: 0
    };
  const previewQ = quiz.questions[safePreviewIdx] || currentQ;
  const nextQ = total > 0 ? quiz.questions[(safeIdx + 1) % total] || currentQ : currentQ;

  const handleDownloadQuestions = () => {
    setActiveQuizId(quiz.id);
    void exportStudySheet('questions', exportFormat);
  };

  const handleDownloadAnswers = () => {
    setActiveQuizId(quiz.id);
    void exportStudySheet('answers', exportFormat);
  };

  return (
    <div
      className="review-columns"
      style={{ alignItems: 'stretch' }}
      data-name="Review columns"
    >
      {/* Left Column: Question Editor */}
      <div
        data-name="Question editor"
        style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
      >
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
            <div className="btn-row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  const nextState = !editing;
                  setEditing(nextState);
                  if (!nextState) {
                    void saveQuizChanges(quiz.id);
                  }
                }}
              >
                {editing ? t('review.doneEditing') : t('review.editQuestion')}
              </button>
              {total > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    openModal({
                      title: t('review.deleteQuestionConfirmTitle'),
                      message: t('review.deleteQuestionConfirmMsg'),
                      confirmLabel: t('review.deleteQuestion'),
                      onConfirm: () => {
                        void deleteQuizQuestion(quiz.id, safeIdx).then(() => {
                          setEditing(false);
                          setQuestionIndex((prev) => Math.max(0, Math.min(prev, total - 2)));
                        });
                      }
                    });
                  }}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>{t('review.deleteQuestion')}</span>
                </button>
              )}
            </div>
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
                    updateQuizQuestion(quiz.id, safeIdx, {
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
                        updateQuizQuestion(quiz.id, safeIdx, { answer: cIdx })
                      }
                      title={t('review.markCorrectTitle')}
                    >
                      {LETTERS[cIdx]} {currentQ.answer === cIdx ? '✓' : ''}
                    </button>
                    <input
                      type="text"
                      className="input"
                      value={choiceText}
                      onChange={(e) => {
                        const nextChoices = [...currentQ.choices];
                        nextChoices[cIdx] = e.target.value;
                        updateQuizQuestion(quiz.id, safeIdx, {
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
              key={`${quiz.id}-${safeIdx}`}
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
                          updateQuizQuestion(quiz.id, safeIdx, { answer: cIdx })
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
            {t('review.correctAnswerValue', { letter: LETTERS[currentQ.answer] })}
          </div>
        </SectionCard>

        {leftFooter && (
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>{leftFooter}</div>
        )}
      </div>

      {/* Right Column: Up Next / Reminder on top, Offline Export on bottom */}
      <aside
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          height: '100%'
        }}
        data-name="Quiz options"
      >
        <section
          className="box-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
          data-name="Review reminder"
        >
          {total > 1 && (
            <div data-name="Next question preview">
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                {t('review.upNextEyebrow', {
                  num: String(((safeIdx + 1) % total) + 1).padStart(2, '0')
                })}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4 }}>
                {nextQ.prompt}
              </div>
            </div>
          )}

          <div
            style={
              total > 1
                ? {
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-subtle)'
                  }
                : undefined
            }
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
              {t('review.beforeStudyTitle')}
            </h3>
            <p className="helper-text">{t('review.beforeStudyBody')}</p>
          </div>
        </section>

        <section
          className="box-card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          data-name="Offline export"
        >
          <div>
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setPreviewMode('questions');
                setPreviewIndex(safeIdx);
                setPreviewOpen(true);
              }}
              style={{ gap: 8 }}
              data-name="Preview document button"
            >
              <Eye size={16} aria-hidden="true" />
              <span>{t('review.previewBtn')}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadQuestions}
              disabled={exportingKind !== null}
              aria-busy={exportingKind === 'questions'}
              style={{ gap: 8 }}
            >
              {exportingKind === 'questions' ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Download size={16} aria-hidden="true" />
              )}
              <span>
                {exportingKind === 'questions'
                  ? t('review.downloadingQuestions')
                  : t('review.downloadQuestions')}
              </span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleDownloadAnswers}
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
                  : t('review.downloadAnswerKey')}
              </span>
            </button>
          </div>
        </section>
      </aside>

      {/* Document Preview Popup Modal (No Scrollbar — Header Progress Line + Left/Right Navigation) */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-preview-modal-title"
          onClick={() => setPreviewOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(15, 15, 25, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="box-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(680px, 100%)',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            {/* Header Progress Line */}
            <Progress
              value={previewProgress}
              className="h-[3px] w-full rounded-none bg-transparent [&>div]:bg-primary [&>div]:transition-[width] [&>div]:duration-150"
            />

            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '15px 20px',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <h2
                  id="doc-preview-modal-title"
                  style={{ fontSize: 17, fontWeight: 700, margin: 0 }}
                >
                  {t('review.previewModalTitle')} · {exportFormat.toUpperCase()}
                </h2>
                <p className="helper-text" style={{ margin: '2px 0 0', fontSize: 12.5 }}>
                  {quiz.title} ·{' '}
                  {t('review.questionOf', { current: safePreviewIdx + 1, total })}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                aria-label={t('review.closePreview')}
                onClick={() => setPreviewOpen(false)}
                style={{ padding: '6px 8px' }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Questions / Answer Key Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${previewMode === 'questions' ? 'btn-primary' : ''}`}
                  onClick={() => setPreviewMode('questions')}
                >
                  {t('review.previewQuestionsTab')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${previewMode === 'answers' ? 'btn-primary' : ''}`}
                  onClick={() => setPreviewMode('answers')}
                >
                  {t('review.previewAnswersTab')}
                </button>
              </div>
              <span className="helper-text" style={{ fontSize: 12, fontWeight: 600 }}>
                {safePreviewIdx + 1} / {total}
              </span>
            </div>

            {/* Single-Slide Worksheet Preview (No Scroll) */}
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 10
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {quiz.title}
                </div>
                <div className="helper-text" style={{ fontSize: 12, marginTop: 3 }}>
                  {t('review.worksheetName')}
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)'
                }}
              >
                <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 10 }}>
                  {safePreviewIdx + 1}. {previewQ.prompt}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {previewQ.choices.map((c, cIdx) => {
                    const isAns = previewMode === 'answers' && previewQ.answer === cIdx;
                    return (
                      <div
                        key={cIdx}
                        style={{
                          fontSize: 14,
                          padding: '6px 10px',
                          borderRadius: 7,
                          fontWeight: isAns ? 700 : 400,
                          color: isAns ? 'var(--success-text)' : 'var(--text-main)',
                          background: isAns ? 'var(--success-bg)' : 'transparent'
                        }}
                      >
                        {LETTERS[cIdx]}. {c} {isAns ? '✓' : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer: Left / Right Slide Navigation + Download */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '14px 20px',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={safePreviewIdx === 0}
                  onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                  style={{ gap: 4 }}
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                  <span>{t('solo.previousBtn')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={safePreviewIdx >= total - 1}
                  onClick={() =>
                    setPreviewIndex((prev) => Math.min(Math.max(0, total - 1), prev + 1))
                  }
                  style={{ gap: 4 }}
                >
                  <span>{t('solo.nextQuestionBtn')}</span>
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setPreviewOpen(false)}
                >
                  {t('review.closePreview')}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={exportingKind !== null}
                  onClick={
                    previewMode === 'questions'
                      ? handleDownloadQuestions
                      : handleDownloadAnswers
                  }
                  style={{ gap: 6 }}
                >
                  <Download size={14} aria-hidden="true" />
                  <span>
                    {previewMode === 'questions'
                      ? t('review.downloadQuestions')
                      : t('review.downloadAnswerKey')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
