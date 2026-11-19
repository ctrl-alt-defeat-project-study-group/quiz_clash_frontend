import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from 'cn';
import { IconCloud } from '@tabler/icons-react';
import { CheckIcon, CircleIcon, PlayIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { QuizItem } from '../types/quiz';
import { SAMPLE_CSV_CONTENT } from '../data/seedData';
import { PageHeader, SectionCard } from '../components/common';
import { Button } from '@/components/ui/button';
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
  const { generateQuiz, startPractice, settings } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileMeta, setFileMeta] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(settings.defaultQuestions || 10);
  const [questionFormat, setQuestionFormat] = useState<string>('Multiple choice');
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [createdQuiz, setCreatedQuiz] = useState<QuizItem | null>(null);

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(pdf|docx|csv|txt)$/i.test(file.name)) {
      setError('Unsupported file format. Please choose a PDF, DOCX, CSV, or TXT file.');
      return;
    }
    if (file.size === 0) {
      setError('This file is empty. Please choose a file with study material.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds the 10 MB limit. Please choose a smaller study file.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setFileName(file.name);
    const kb = Math.max(1, Math.round(file.size / 1024));
    setFileMeta(`${kb} KB · Ready to process`);
    const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    setQuizTitle(cleanTitle);
    setPreviewTitle(`${cleanTitle} — Extracted notes`);

    if (/\.(csv|txt)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '').trim();
        setPreviewText(
          text
            ? text.slice(0, 320) + (text.length > 320 ? '…' : '')
            : 'Structured vocabulary and study terms ready for multiple-choice generation.'
        );
      };
      reader.readAsText(file);
    } else {
      setPreviewText(
        'Key concepts and definitions extracted from your document. Ready to generate multiple-choice questions.'
      );
    }
  };

  const handleLoadSample = () => {
    const sampleFile = new File([SAMPLE_CSV_CONTENT], 'Cell_Biology_Notes.csv', {
      type: 'text/csv',
    });
    setSelectedFile(sampleFile);
    setFileName('Cell_Biology_Notes.pdf');
    setFileMeta('12 pages · Ready to process');
    setPreviewTitle('Cell structure and function');
    setPreviewText(
      'Cells are the basic unit of life. The cell membrane regulates movement into and out of the cell. Mitochondria produce energy, while ribosomes synthesize proteins…'
    );
    setQuizTitle('Cell structure');
    setError('');
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
    if (!fileName) {
      setError('Please upload a study file or click "Load sample document" first.');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleGenerate = async () => {
    if (!fileName) {
      setError('Please upload a study file or click "Load sample document" first.');
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
        questionCount,
      });
      setCreatedQuiz(created);
      setCurrentStep(3);
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
      stepLabel: 'Step 01',
      title: 'Upload material',
      description: fileName || 'PDF, DOCX, CSV, or TXT',
      status: getStepStatus(1),
    },
    {
      id: 2 as const,
      stepLabel: 'Step 02',
      title: 'Configure quiz',
      description: `${questionCount} questions · ${questionFormat}`,
      status: getStepStatus(2),
    },
    {
      id: 3 as const,
      stepLabel: 'Step 03',
      title: 'Review questions',
      description: createdQuiz
        ? `${createdQuiz.questions.length} questions ready`
        : 'Edit, practice or export',
      status: getStepStatus(3),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="CREATE / 02"
        title="From study notes to a ready-to-use quiz."
        subtitle="Upload your material and choose how you want to practice."
      />

      <div
        className="box-card overflow-x-auto"
        data-name="Generation steps"
        style={{ padding: '18px 22px' }}
      >
        <Timeline
          value={currentStep}
          orientation="horizontal"
          className="w-full min-w-[520px]"
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
                  <TimelineSeparator className="bg-input! group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:left-2.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-2.25rem)]" />
                  <TimelineDate>{step.stepLabel}</TimelineDate>
                  <TimelineTitle className="flex items-center gap-2">
                    {step.title}
                    {step.status === 'current' && (
                      <Badge variant="primary-light" size="sm">
                        Current
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
                <TimelineContent className="text-xs truncate">
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
          <h2 className="panel-heading">01 / Study material</h2>

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
              <EmptyTitle>Drag and drop your study file here</EmptyTitle>
              <EmptyDescription>
                Upload a PDF, Word (.docx), CSV, or TXT file (max 10 MB) to generate your quiz.
              </EmptyDescription>
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
                Upload Files
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

          {fileName ? (
            <div className="uploaded-source-bar" data-name="Uploaded source">
              <div>
                <div className="source-name">{fileName}</div>
                <div className="source-meta">{fileMeta}</div>
              </div>
              <button type="button" className="btn btn-sm" onClick={handleRemoveFile}>
                Remove
              </button>
            </div>
          ) : (
            <div className="uploaded-source-bar">
              <span className="helper-text">
                No file selected yet. Upload a file or load sample notes.
              </span>
              <button type="button" className="btn btn-sm" onClick={handleLoadSample}>
                Load sample document
              </button>
            </div>
          )}

          {fileName && (
            <div style={{ marginTop: 18 }}>
              <div className="field-label">Extracted text preview</div>
              <div className="text-preview-box" data-name="Text preview">
                <h4>{previewTitle || 'Document loaded'}</h4>
                <p>
                  {previewText ||
                    'Select a study file above to preview the extracted concepts and definitions.'}
                </p>
              </div>
              <p className="helper-text" style={{ marginTop: 10 }}>
                Formatting and broken line breaks will be cleaned automatically.
              </p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Step 02: Configure quiz */}
      {currentStep === 2 && (
        <SectionCard dataName="Quiz configuration">
          <h2 className="panel-heading">02 / Quiz settings</h2>

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
              Change file
            </button>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gen-quiz-title">
              Quiz title
            </label>
            <input
              id="gen-quiz-title"
              className="input"
              type="text"
              maxLength={100}
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Cell structure"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gen-question-count">
              Number of questions
            </label>
            <select
              id="gen-question-count"
              className="select"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="gen-question-format">
              Question format
            </label>
            <select
              id="gen-question-format"
              className="select"
              value={questionFormat}
              onChange={(e) => setQuestionFormat(e.target.value)}
            >
              <option value="Multiple choice">Multiple choice</option>
              <option value="Term & definition">Term &amp; definition (4 choices)</option>
            </select>
          </div>

          <p className="helper-text">
            Each question includes one correct answer and three plausible distractors.
          </p>

          <div className="summary-callout" data-name="Generation summary">
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              READY TO GENERATE
            </div>
            <h4>
              1 document → {questionCount} questions
            </h4>
            <p className="helper-text">
              Review and edit every question before you save or share.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Step 03: Review questions */}
      {currentStep === 3 && createdQuiz && (
        <SectionCard dataName="Generated quiz review">
          <h2 className="panel-heading">03 / Review questions</h2>
          <p className="helper-text" style={{ marginBottom: 16 }}>
            <strong>{createdQuiz.title}</strong> is ready with {createdQuiz.questions.length}{' '}
            questions from {fileName}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {createdQuiz.questions.slice(0, 3).map((q, idx) => (
              <div key={idx} className="text-preview-box">
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  QUESTION {String(idx + 1).padStart(2, '0')}
                </div>
                <h4 style={{ marginBottom: 6 }}>{q.prompt}</h4>
                <p className="helper-text">
                  Correct answer: <strong>{q.choices[q.answer]}</strong>
                </p>
              </div>
            ))}
            {createdQuiz.questions.length > 3 && (
              <p className="helper-text">
                + {createdQuiz.questions.length - 3} more questions ready in the quiz editor.
              </p>
            )}
          </div>
        </SectionCard>
      )}

      <div className="action-footer-bar" data-name="Generation actions">
        <span className="helper-text">
          {currentStep === 1
            ? 'Step 1 of 3 · Your original document stays unchanged.'
            : currentStep === 2
              ? 'Step 2 of 3 · Customize your quiz settings before generating.'
              : 'Step 3 of 3 · Your quiz has been saved to My Quizzes.'}
        </span>

        <div className="btn-row">
          {currentStep === 1 && (
            <>
              <Link to="/dashboard" className="btn">
                Cancel
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextToConfigure}
              >
                Continue to settings →
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
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? 'Generating quiz…' : 'Generate quiz →'}
              </button>
            </>
          )}

          {currentStep === 3 && createdQuiz && (
            <>
              <button type="button" className="btn" onClick={handleResetWizard}>
                Create another quiz
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  startPractice(createdQuiz.id);
                  navigate(`/quizzes/${encodeURIComponent(createdQuiz.id)}/play`);
                }}
              >
                Start solo quiz
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/quizzes/${encodeURIComponent(createdQuiz.id)}`)}
              >
                Review &amp; edit quiz →
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
