import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from 'cn';
import { IconCloud } from '@tabler/icons-react';
import { CheckIcon, CircleIcon, PlayIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { QuizItem } from '../types/quiz';
import { PageHeader, SectionCard, SettingToggleRow } from '../components/common';
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
  const { generateQuiz, startPractice, settings, getErrorMessage, t } = useApp();
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileMeta, setFileMeta] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizCategory, setQuizCategory] = useState<string>('');
  const [useLlm, setUseLlm] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(settings.defaultQuestions || 10);
  const [questionFormat, setQuestionFormat] = useState<string>('Multiple choice');
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [createdQuiz, setCreatedQuiz] = useState<QuizItem | null>(null);

  const formatLabel =
    questionFormat === 'Term & definition'
      ? t('generate.formatTermDefinition')
      : t('generate.formatMultipleChoice');

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

  const handleNextToConfigure = () => {
    if (!selectedFile) {
      setError(t('generate.errNoFileSelected'));
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError(t('generate.errNoFileSelected'));
      setCurrentStep(1);
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const created = await generateQuiz({
        file: selectedFile,
        fileName,
        title: quizTitle.trim() || fileName.replace(/\.[^.]+$/, ''),
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
      description: fileName || t('generate.step01FallbackDesc'),
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
              (step.id === 2 && Boolean(fileName) && currentStep === 1 && !generating);

            return (
              <TimelineItem
                key={step.id}
                step={step.id}
                className={cn(canClick && 'cursor-pointer')}
                onClick={() => {
                  if (step.id === 1 && currentStep > 1 && !generating) {
                    setError('');
                    setCurrentStep(1);
                  } else if (step.id === 2 && fileName && currentStep === 1 && !generating) {
                    setError('');
                    setCurrentStep(2);
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

      {/* Step 01: Upload material */}
      {currentStep === 1 && (
        <SectionCard dataName="Study material">
          <h2 className="panel-heading">{t('generate.panel01Heading')}</h2>

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

          {error && (
            <p className="error-text" role="alert" style={{ marginTop: 10 }}>
              {error}
            </p>
          )}

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
        </SectionCard>
      )}

      {/* Step 02: Configure quiz */}
      {currentStep === 2 && (
        <SectionCard dataName="Quiz configuration">
          <h2 className="panel-heading">{t('generate.panel02Heading')}</h2>

          <div className="uploaded-source-bar" style={{ marginTop: 0, marginBottom: 18 }}>
            <div>
              <div className="source-name">{fileName}</div>
              <div className="source-meta">{fileMeta}</div>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setCurrentStep(1)}
            >
              {t('generate.changeFileBtn')}
            </button>
          </div>

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

          <div className="field-group">
            <label className="field-label" htmlFor="gen-question-format">
              {t('generate.questionFormatLabel')}
            </label>
            <Select value={questionFormat} onValueChange={setQuestionFormat}>
              <SelectTrigger id="gen-question-format" className="w-full">
                <SelectValue placeholder={t('generate.selectFormat')} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Multiple choice">
                  {t('generate.formatMultipleChoice')}
                </SelectItem>
                <SelectItem value="Term & definition">
                  {t('generate.formatTermDefinition')}
                </SelectItem>
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

      {/* Step 03: Review questions */}
      {currentStep === 3 && createdQuiz && (
        <SectionCard dataName="Generated quiz review">
          <h2 className="panel-heading">{t('generate.panel03Heading')}</h2>
          <p className="helper-text" style={{ marginBottom: 16 }}>
            {t('generate.step03Summary', {
              title: createdQuiz.title,
              count: createdQuiz.questions.length,
              fileName,
            })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {createdQuiz.questions.slice(0, 3).map((q, idx) => (
              <div key={idx} className="text-preview-box">
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  {t('generate.questionNumberEyebrow', {
                    num: String(idx + 1).padStart(2, '0'),
                  })}
                </div>
                <h4 style={{ marginBottom: 6 }}>{q.prompt}</h4>
                <p className="helper-text">
                  {t('generate.correctAnswerLabel')}{' '}
                  <strong>{q.choices[q.answer]}</strong>
                </p>
              </div>
            ))}
            {createdQuiz.questions.length > 3 && (
              <p className="helper-text">
                {t('generate.moreQuestionsReady', {
                  count: createdQuiz.questions.length - 3,
                })}
              </p>
            )}
          </div>
        </SectionCard>
      )}

      <div className="action-footer-bar" data-name="Generation actions">
        <span className="helper-text">
          {currentStep === 1
            ? t('generate.footerStep1')
            : currentStep === 2
              ? t('generate.footerStep2')
              : t('generate.footerStep3')}
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

          {currentStep === 3 && createdQuiz && (
            <>
              <button type="button" className="btn" onClick={handleResetWizard}>
                {t('generate.createAnotherBtn')}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  startPractice(createdQuiz.id);
                  navigate(`/quizzes/${encodeURIComponent(createdQuiz.id)}/play`);
                }}
              >
                {t('generate.startSoloBtn')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/quizzes/${encodeURIComponent(createdQuiz.id)}`)}
              >
                {t('generate.reviewEditBtn')}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
