import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SAMPLE_CSV_CONTENT } from '../data/seedData';
import { PageHeader, SectionCard } from '../components/common';

export const GenerateQuizPage: React.FC = () => {
  const { generateQuiz, settings } = useApp();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Cell_Biology_Notes.pdf');
  const [fileMeta, setFileMeta] = useState<string>('12 pages · Ready to process');
  const [previewTitle, setPreviewTitle] = useState<string>('Cell structure and function');
  const [previewText, setPreviewText] = useState<string>(
    'Cells are the basic unit of life. The cell membrane regulates movement into and out of the cell. Mitochondria produce energy, while ribosomes synthesize proteins…'
  );
  const [quizTitle, setQuizTitle] = useState<string>('Cell structure');
  const [questionCount, setQuestionCount] = useState<number>(settings.defaultQuestions || 10);
  const [questionFormat, setQuestionFormat] = useState<string>('Multiple choice');
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);

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
      type: 'text/csv'
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
    setError('');
  };

  const handleGenerate = async () => {
    if (!fileName) {
      setError('Please upload a study file or click "Load sample document" first.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const created = await generateQuiz({
        file: selectedFile,
        fileName,
        title: quizTitle,
        questionCount
      });
      navigate(`/quizzes/${encodeURIComponent(created.id)}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="CREATE / 02"
        title="From study notes to a ready-to-use quiz."
        subtitle="Upload your material and choose how you want to practice."
      />

      <div className="steps-bar" data-name="Generation steps" role="list">
        <div className="step-item active" role="listitem">
          1 &nbsp; Upload material
        </div>
        <div className={`step-item ${fileName ? 'active' : ''}`} role="listitem">
          2 &nbsp; Configure quiz
        </div>
        <div className="step-item" role="listitem">
          3 &nbsp; Review questions
        </div>
      </div>

      <div className="generator-columns" data-name="Generator columns">
        {/* Left Column: 01 / Study material */}
        <SectionCard dataName="Study material">
          <h2 className="panel-heading">01 / Study material</h2>

          <label
            className={`dropzone ${dragging ? 'dragging' : ''}`}
            htmlFor="file-upload-input"
            data-name="Upload drop zone"
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
            <span className="doc-badge">[ DOCUMENT ]</span>
            <strong style={{ fontSize: 17 }}>Drag and drop your study file here</strong>
            <span className="helper-text">PDF, Word (.docx), CSV, or TXT</span>
            <span className="btn" style={{ marginTop: 6 }}>
              Browse files
            </span>
          </label>
          <input
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

          <div style={{ marginTop: 18 }}>
            <div className="field-label">Extracted text preview</div>
            <div className="text-preview-box" data-name="Text preview">
              <h4>{previewTitle || 'No document loaded'}</h4>
              <p>
                {previewText ||
                  'Select a study file above to preview the extracted concepts and definitions.'}
              </p>
            </div>
            <p className="helper-text" style={{ marginTop: 10 }}>
              Formatting and broken line breaks will be cleaned automatically.
            </p>
          </div>
        </SectionCard>

        {/* Right Column: 02 / Quiz settings */}
        <SectionCard dataName="Quiz configuration">
          <h2 className="panel-heading">02 / Quiz settings</h2>

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
              {fileName ? '1 document' : '0 documents'} → {questionCount} questions
            </h4>
            <p className="helper-text">
              Review and edit every question before you save or share.
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="action-footer-bar" data-name="Generation actions">
        <span className="helper-text">Your original document stays unchanged.</span>
        <div className="btn-row">
          <Link to="/" className="btn">
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating quiz…' : 'Generate quiz →'}
          </button>
        </div>
      </div>
    </>
  );
};
