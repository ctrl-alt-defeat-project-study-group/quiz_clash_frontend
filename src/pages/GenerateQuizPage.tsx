import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from 'cn';
import { IconCloud } from '@tabler/icons-react';
import { CheckIcon, CircleIcon, PlayIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { QuizItem } from '../types/quiz';
import { PageHeader, SectionCard, SettingToggleRow } from '../components/common';
import { QuizReviewWorkspace } from '../components/quiz/QuizReviewWorkspace';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Badge } from '../components/reui/badge';
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '../components/reui/timeline';

export const GenerateQuizPage: React.FC = () => {
  const {
    quizzes,
    generateQuiz,
    saveQuizChanges,
    setLiveQuizId,
    startPractice,
    settings,
    getErrorMessage,
    t
  } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isCompactTimeline, setIsCompactTimeline] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = (e: MediaQueryListEvent) => setIsCompactTimeline(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const [sourceMode, setSourceMode] = useState<'paste' | 'upload'>('paste');
  const [pastedNotes, setPastedNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileMeta, setFileMeta] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizCategory, setQuizCategory] = useState<string>('');
  const [useLlm, setUseLlm] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(settings.defaultQuestions || 10);
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [createdQuiz, setCreatedQuiz] = useState<QuizItem | null>(null);

  const liveCreatedQuiz = createdQuiz
    ? quizzes.find((q) => q.id === createdQuiz.id) ?? createdQuiz
    : null;

  const formatLabel = t('generate.formatMultipleChoice');
  const trimmedNotes = pastedNotes.trim();
  const notesExcerpt =
    trimmedNotes.replace(/\s+/g, ' ').slice(0, 180) +
    (trimmedNotes.replace(/\s+/g, ' ').length > 180 ? '…' : '');
  const notesLineCount = trimmedNotes
    ? trimmedNotes.split(/\r?\n/).filter((line) => line.trim()).length
    : 0;
  const hasMaterial = sourceMode === 'paste' ? Boolean(trimmedNotes) : Boolean(selectedFile);

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(pdf|docx|csv|txt)$/i.test(file.name)) {
      setError(t('generate.errUnsupportedFormat'));
      return;
    }
    if (file.size === 0) {
      setError(t('generate.errEmptyFile'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('generate.errFileTooLarge'));
      return;
    }

    setError('');
    setSelectedFile(file);
    setFileName(file.name);
    const kb = Math.max(1, Math.round(file.size / 1024));
    setFileMeta(t('generate.fileMetaKb', { kb }));
    const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    setQuizTitle(cleanTitle);
    setPreviewTitle(t('generate.extractedNotesTitle', { title: cleanTitle }));

    if (/\.(csv|txt)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '').trim();
        setPreviewText(
          text
            ? text.slice(0, 320) + (text.length > 320 ? '…' : '')
            : t('generate.csvEmptyPreview')
        );
      };
      reader.readAsText(file);
    } else {
      setPreviewText(t('generate.docPreviewFallback'));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    setFileMeta('');
    setPreviewTitle('');
    setPreviewText('');
    setQuizTitle('');
    setError('');
  };

  const deriveNotesTitle = (notes: string): string => {
    const firstLine =
      notes
        .split(/\r?\n/)
        .find((line) => line.trim())
        ?.trim() || 'Study notes';
    const cleaned = firstLine.replace(/[:\-–—].*$/, '').trim();
    return (cleaned || firstLine).slice(0, 60);
  };

  const handleNextToConfigure = () => {
    if (sourceMode === 'paste') {
      if (!trimmedNotes) {
        setError(t('generate.errBlankNotes'));
        return;
      }
      if (!quizTitle.trim()) {
        setQuizTitle(deriveNotesTitle(trimmedNotes));
      }
    } else if (!selectedFile) {
      setError(t('generate.errNoFileSelected'));
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    let sourceFile: File;
    let sourceFileName: string;
    let fallbackTitle: string;

    if (sourceMode === 'paste') {
      if (!trimmedNotes) {
        setError(t('generate.errBlankNotes'));
        setCurrentStep(1);
        return;
      }
      sourceFile = new File([trimmedNotes], 'study-notes.txt', {
        type: 'text/plain;charset=utf-8'
      });
      sourceFileName = 'study-notes.txt';
      fallbackTitle = deriveNotesTitle(trimmedNotes);
    } else {
      if (!selectedFile) {
        setError(t('generate.errNoFileSelected'));
        setCurrentStep(1);
        return;
      }
      sourceFile = selectedFile;
      sourceFileName = fileName;
      fallbackTitle = fileName.replace(/\.[^.]+$/, '');
    }

    setError('');
    setGenerating(true);
    try {
      const created = await generateQuiz({
        file: sourceFile,
        fileName: sourceFileName,
        title: quizTitle.trim() || fallbackTitle,
        category: quizCategory.trim() || undefined,
        questionCount,
        useLlm,
      });
      setCreatedQuiz(created);
      setCurrentStep(3);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleResetWizard = () => {
    handleRemoveFile();
    setPastedNotes('');
    setSourceMode('paste');
    setQuizCategory('');
    setCreatedQuiz(null);
    setCurrentStep(1);
  };

  const getStepStatus = (stepId: 1 | 2 | 3) => {
    if (stepId < currentStep) return 'completed' as const;
    if (stepId === currentStep) return 'current' as const;
    return 'upcoming' as const;
  };

  const generationSteps = [
    {
      id: 1 as const,
      stepLabel: t('generate.step01Label'),
      title: t('generate.step01Title'),
      description:
        sourceMode === 'paste' && trimmedNotes
          ? t('generate.pastedNotesSourceTitle')
          : sourceMode === 'upload' && fileName
          ? fileName
          : t('generate.step01FallbackDesc'),
      status: getStepStatus(1),
    },
    {
      id: 2 as const,
      stepLabel: t('generate.step02Label'),
      title: t('generate.step02Title'),
      description: t('generate.step02Desc', {
        count: questionCount,
        format: formatLabel,
      }),
      status: getStepStatus(2),
    },
    {
      id: 3 as const,
      stepLabel: t('generate.step03Label'),
      title: t('generate.step03Title'),
      description: createdQuiz
        ? t('generate.step03ReadyDesc', { count: createdQuiz.questions.length })
        : t('generate.step03FallbackDesc'),
      status: getStepStatus(3),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'QuizClash', to: '/' },
          { label: t('nav.generateQuiz') }
        ]}
        title={t('generate.title')}
        subtitle={t('generate.subtitle')}
      />

      <div
        className="box-card"
        data-name="Generation steps"
        style={{ padding: isCompactTimeline ? '16px 18px' : '18px 22px' }}
      >
        <Timeline
          value={currentStep}
          orientation={isCompactTimeline ? 'vertical' : 'horizontal'}
          className="w-full"
        >
          {generationSteps.map((step) => {
            const canClick =
              (step.id === 1 && currentStep > 1 && !generating) ||
              (step.id === 2 && hasMaterial && currentStep === 1 && !generating);

            return (
              <TimelineItem
                key={step.id}
                step={step.id}
                className={cn(canClick && 'cursor-pointer')}
                onClick={() => {
                  if (step.id === 1 && currentStep > 1 && !generating) {
                    setError('');
                    setCurrentStep(1);
                  } else if (step.id === 2 && hasMaterial && currentStep === 1 && !generating) {
                    handleNextToConfigure();
                  }
                }}
              >
                <TimelineHeader>
                  <TimelineSeparator className="bg-input! group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:left-2.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-2.25rem)] group-data-[orientation=vertical]/timeline:top-2 group-data-[orientation=vertical]/timeline:h-[calc(100%-0.5rem)]" />
                  <TimelineDate>{step.stepLabel}</TimelineDate>
                  <TimelineTitle className="flex flex-wrap items-center gap-2">
                    {step.title}
                    {step.status === 'current' && (
                      <Badge variant="primary-light" size="sm">
                        {t('generate.currentBadge')}
                      </Badge>
                    )}
                  </TimelineTitle>
                  <TimelineIndicator
                    className={cn(
                      'flex size-6 items-center justify-center border-none',
                      step.status === 'completed' && 'bg-emerald-500 text-white',
                      step.status === 'current' &&
                        'bg-primary text-primary-foreground',
                      step.status === 'upcoming' &&
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.status === 'completed' ? (
                      <CheckIcon className="size-3.5" />
                    ) : step.status === 'current' ? (
                      <PlayIcon className="size-3" />
                    ) : (
                      <CircleIcon className="size-3" />
                    )}
                  </TimelineIndicator>
                </TimelineHeader>
                <TimelineContent className="text-xs break-words">
                  {step.description}
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </div>

      {/* Step 01: Add your material */}
      {currentStep === 1 && (
        <SectionCard dataName="Study material">
          <h2 className="panel-heading">{t('generate.panel01Heading')}</h2>

          <div
            className="qg-source-tabs"
            role="tablist"
            aria-label={t('generate.sourceTabsAria')}
          >
            <button
              type="button"
              role="tab"
              id="source-tab-paste"
              aria-selected={sourceMode === 'paste'}
              aria-controls="source-panel-paste"
              className={cn('qg-source-tab', sourceMode === 'paste' && 'is-active')}
              onClick={() => {
                setSourceMode('paste');
                setError('');
              }}
            >
              {t('generate.tabPasteNotes')}
            </button>
            <button
              type="button"
              role="tab"
              id="source-tab-upload"
              aria-selected={sourceMode === 'upload'}
              aria-controls="source-panel-upload"
              className={cn('qg-source-tab', sourceMode === 'upload' && 'is-active')}
              onClick={() => {
                setSourceMode('upload');
                setError('');
              }}
            >
              {t('generate.tabUploadFile')}
            </button>
          </div>

          {sourceMode === 'paste' ? (
            <div
              id="source-panel-paste"
              role="tabpanel"
              aria-labelledby="source-tab-paste"
              className="field-group"
              style={{ marginBottom: 0 }}
            >
              <label className="field-label" htmlFor="study-notes-input">
                {t('generate.studyNotesLabel')}
              </label>
              <textarea
                id="study-notes-input"
                className="input qg-notes-textarea"
                rows={9}
                placeholder={t('generate.studyNotesPlaceholder')}
                value={pastedNotes}
                aria-invalid={Boolean(error)}
                onChange={(e) => {
                  setPastedNotes(e.target.value);
                  if (error) setError('');
                }}
              />
              <p className="helper-text" style={{ marginTop: 8 }}>
                {trimmedNotes
                  ? t('generate.studyNotesMeta', {
                      chars: trimmedNotes.length,
                      lines: notesLineCount
                    })
                  : t('generate.studyNotesHint')}
              </p>
            </div>
          ) : (
            <div
              id="source-panel-upload"
              role="tabpanel"
              aria-labelledby="source-tab-upload"
            >
              <Empty
                role="button"
                tabIndex={0}
                data-name="Upload drop zone"
                className={cn(
                  'cursor-pointer border border-dashed border-border transition-colors hover:border-primary/60 hover:bg-muted/40',
                  dragging && 'border-primary bg-accent/40'
                )}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFileSelection(e.dataTransfer.files?.[0]);
                }}
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCloud />
                  </EmptyMedia>
                  <EmptyTitle>{t('generate.dropzoneTitle')}</EmptyTitle>
                  <EmptyDescription>{t('generate.dropzoneDesc')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {t('generate.uploadFilesBtn')}
                  </Button>
                </EmptyContent>
              </Empty>
              <input
                ref={fileInputRef}
                id="file-upload-input"
                type="file"
                className="visually-hidden"
                accept=".pdf,.docx,.csv,.txt"
                onChange={(e) => handleFileSelection(e.target.files?.[0])}
              />

              {fileName && (
                <div className="uploaded-source-bar" data-name="Uploaded source">
                  <div>
                    <div className="source-name">{fileName}</div>
                    <div className="source-meta">{fileMeta}</div>
                  </div>
                  <button type="button" className="btn btn-sm" onClick={handleRemoveFile}>
                    {t('common.remove')}
                  </button>
                </div>
              )}

              {fileName && (
                <div style={{ marginTop: 18 }}>
                  <div className="field-label">{t('generate.extractedPreviewLabel')}</div>
                  <div className="text-preview-box" data-name="Text preview">
                    <h4>{previewTitle || t('generate.documentLoaded')}</h4>
                    <p>{previewText || t('generate.previewPlaceholder')}</p>
                  </div>
                  <p className="helper-text" style={{ marginTop: 10 }}>
                    {t('generate.cleaningNote')}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="error-text" role="alert" style={{ marginTop: 10 }}>
              {error}
            </p>
          )}
        </SectionCard>
      )}

      {/* Step 02: Configure your quiz */}
      {currentStep === 2 && (
        <SectionCard dataName="Quiz configuration">
          <h2 className="panel-heading">{t('generate.panel02Heading')}</h2>

          {sourceMode === 'paste' ? (
            <div className="uploaded-source-bar" style={{ marginTop: 0, marginBottom: 18 }}>
              <div style={{ minWidth: 0 }}>
                <div className="source-name">{t('generate.pastedNotesSourceTitle')}</div>
                <div className="source-meta qg-notes-excerpt">{notesExcerpt}</div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setError('');
                  setCurrentStep(1);
                }}
              >
                {t('generate.editNotesBtn')}
              </button>
            </div>
          ) : (
            <div className="uploaded-source-bar" style={{ marginTop: 0, marginBottom: 18 }}>
              <div>
                <div className="source-name">{fileName}</div>
                <div className="source-meta">{fileMeta}</div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setError('');
                  setCurrentStep(1);
                }}
              >
                {t('generate.changeFileBtn')}
              </button>
            </div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="gen-quiz-title">
              {t('generate.quizTitleLabel')}
            </label>
            <input
              id="gen-quiz-title"
              className="input"
              type="text"
              maxLength={100}
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder={t('generate.quizTitlePlaceholder')}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gen-quiz-category">
              {t('generate.categoryLabel')}
            </label>
            <input
              id="gen-quiz-category"
              className="input"
              type="text"
              maxLength={60}
              value={quizCategory}
              onChange={(e) => setQuizCategory(e.target.value)}
              placeholder={t('generate.categoryPlaceholder')}
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gen-question-count">
              {t('generate.questionCountLabel')}
            </label>
            <Select
              value={String(questionCount)}
              onValueChange={(val) => setQuestionCount(Number(val))}
            >
              <SelectTrigger id="gen-question-count" className="w-full">
                <SelectValue placeholder={t('generate.selectQuestionCount')} />
              </SelectTrigger>
              <SelectContent position="popper">
                {[5, 10, 15, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {t('common.questionsCount', { count: n })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SettingToggleRow
            label={t('generate.useLlmLabel')}
            description={t('generate.useLlmDesc')}
            checked={useLlm}
            onToggle={() => setUseLlm((prev) => !prev)}
          />

          <p className="helper-text">{t('generate.distractorHelper')}</p>

          {error && (
            <p className="error-text" role="alert" style={{ marginTop: 12 }}>
              {error}
            </p>
          )}

          <div className="summary-callout" data-name="Generation summary">
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              {t('generate.readyEyebrow')}
            </div>
            <h4>{t('generate.readySummary', { count: questionCount })}</h4>
            <p className="helper-text">{t('generate.readyHelper')}</p>
          </div>
        </SectionCard>
      )}

      {/* Step 03: Review & Edit + Download (same workspace as Review & Export) */}
      {currentStep === 3 && liveCreatedQuiz && (
        <QuizReviewWorkspace
          key={liveCreatedQuiz.id}
          quiz={liveCreatedQuiz}
          leftFooter={
            <div
              data-name="Generation actions"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <span className="helper-text">{t('generate.footerStep3')}</span>
              <div className="btn-row">
                <button type="button" className="btn" onClick={handleResetWizard}>
                  {t('generate.createAnotherBtn')}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void saveQuizChanges(liveCreatedQuiz.id)}
                >
                  {t('common.saveChanges')}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setLiveQuizId(liveCreatedQuiz.id);
                    navigate('/lobby');
                  }}
                >
                  {t('review.hostLiveGame')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    startPractice(liveCreatedQuiz.id);
                    navigate(`/quizzes/${encodeURIComponent(liveCreatedQuiz.id)}/play`);
                  }}
                >
                  {t('generate.startSoloBtn')}
                </button>
              </div>
            </div>
          }
        />
      )}

      {currentStep !== 3 && (
        <div className="action-footer-bar" data-name="Generation actions">
          <span className="helper-text">
            {currentStep === 1 ? t('generate.footerStep1') : t('generate.footerStep2')}
          </span>

          <div className="btn-row">
            {currentStep === 1 && (
              <>
                <Link to="/dashboard" className="btn">
                  {t('common.cancel')}
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextToConfigure}
                >
                  {t('generate.continueToSettings')}
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setCurrentStep(1)}
                  disabled={generating}
                >
                  {t('common.back')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? t('generate.generatingBtn') : t('generate.generateBtn')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
