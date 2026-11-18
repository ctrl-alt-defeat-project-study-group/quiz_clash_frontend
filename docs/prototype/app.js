/* ==========================================================================
   QuizClash / AutoQuiz Interactive Prototype (Screens 01–08)
   Matches /home/user/Downloads/QuizClash.html with Light (Option A + Platinum)
   and Dark (Option D + Jet Black) themes.
   ========================================================================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const escapeHTML = (str) =>
  String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

/* --------------------------------------------------------------------------
   Seed Quizzes (10 questions for Cell structure, plus World history & Chemistry)
   -------------------------------------------------------------------------- */
const SEED_QUIZZES = [
  {
    id: 'biology',
    title: 'Cell structure',
    sidebarTitle: 'Biology · Cell structure',
    category: 'Biology',
    source: 'Cell_Biology_Notes.pdf',
    updated: 'Today',
    lastScore: 80,
    questions: [
      {
        prompt: 'What is the primary function of the cell membrane?',
        choices: [
          'Produce energy for the cell',
          'Regulate movement of substances',
          'Synthesize proteins',
          'Store genetic information'
        ],
        answer: 1,
        explanation: 'The cell membrane is selectively permeable and regulates what enters and leaves the cell.'
      },
      {
        prompt: 'Which organelle is responsible for producing most of the cell’s ATP?',
        choices: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'],
        answer: 1,
        explanation: 'Mitochondria generate ATP through cellular respiration.'
      },
      {
        prompt: 'Which cell structure synthesizes proteins?',
        choices: ['Ribosome', 'Vacuole', 'Cell wall', 'Chloroplast'],
        answer: 0,
        explanation: 'Ribosomes translate mRNA into polypeptide chains (proteins).'
      },
      {
        prompt: 'Which structure contains most of a cell’s genetic material?',
        choices: ['Cell membrane', 'Nucleus', 'Ribosome', 'Cytoplasm'],
        answer: 1,
        explanation: 'The nucleus houses the cell’s DNA and coordinates cellular activities.'
      },
      {
        prompt: 'Where does photosynthesis take place in plant cells?',
        choices: ['Mitochondria', 'Chloroplasts', 'Nucleolus', 'Endoplasmic reticulum'],
        answer: 1,
        explanation: 'Chloroplasts capture light energy to convert carbon dioxide and water into glucose.'
      },
      {
        prompt: 'Which organelle modifies, sorts, and packages proteins for secretion?',
        choices: ['Golgi apparatus', 'Peroxisome', 'Centrosome', 'Cytoskeleton'],
        answer: 0,
        explanation: 'The Golgi apparatus processes proteins received from the endoplasmic reticulum.'
      },
      {
        prompt: 'What gives a plant cell structural support?',
        choices: ['Cell membrane', 'Cell wall', 'Cytoplasm', 'Nucleoplasm'],
        answer: 1,
        explanation: 'The rigid cellulose cell wall provides strength and structural support.'
      },
      {
        prompt: 'Which organelle contains digestive enzymes to break down waste?',
        choices: ['Lysosome', 'Ribosome', 'Centriole', 'Plastid'],
        answer: 0,
        explanation: 'Lysosomes contain hydrolytic enzymes for intracellular digestion.'
      },
      {
        prompt: 'What jelly-like fluid fills the cell and suspends organelles?',
        choices: ['Cytosol / Cytoplasm', 'Matrix', 'Stroma', 'Nucleoplasm'],
        answer: 0,
        explanation: 'Cytoplasm (cytosol) surrounds organelles and is the site of many metabolic reactions.'
      },
      {
        prompt: 'Which network of membranes assists in lipid and protein synthesis?',
        choices: ['Endoplasmic reticulum', 'Golgi body', 'Microtubules', 'Plasma membrane'],
        answer: 0,
        explanation: 'Rough ER synthesizes proteins while Smooth ER synthesizes lipids.'
      }
    ]
  },
  {
    id: 'history',
    title: 'World history',
    sidebarTitle: 'World history',
    category: 'History',
    source: 'World_History_Review.docx',
    updated: 'Yesterday',
    lastScore: 87,
    questions: [
      {
        prompt: 'Where did the European Renaissance begin in the 14th century?',
        choices: ['Italy', 'Norway', 'Portugal', 'Scotland'],
        answer: 0,
        explanation: 'Italian city-states such as Florence and Venice were centers of Renaissance trade and art.'
      },
      {
        prompt: 'Which invention by Johannes Gutenberg accelerated the spread of knowledge?',
        choices: ['Steam engine', 'Movable-type printing press', 'Telegraph', 'Compass'],
        answer: 1,
        explanation: 'The movable-type printing press (c. 1440) made books widely accessible across Europe.'
      },
      {
        prompt: 'Which ancient civilization built Machu Picchu in the Andes?',
        choices: ['Maya', 'Aztec', 'Inca', 'Olmec'],
        answer: 2,
        explanation: 'Machu Picchu was built by the Inca Empire in the 15th century.'
      },
      {
        prompt: 'The Magna Carta (1215) established the principle that:',
        choices: [
          'The monarch is subject to the rule of law',
          'All trade must pass through London',
          'Parliament is dissolved permanently',
          'Paper currency replaces gold'
        ],
        answer: 0,
        explanation: 'The Magna Carta limited royal authority and established legal protections.'
      },
      {
        prompt: 'Which trade network connected China with the Mediterranean world?',
        choices: ['Amber Road', 'Silk Road', 'Spice Route', 'Trans-Saharan Trail'],
        answer: 1,
        explanation: 'The Silk Road facilitated overland trade and cultural exchange across Eurasia.'
      }
    ]
  },
  {
    id: 'chemistry',
    title: 'Chemistry basics',
    sidebarTitle: 'Chemistry basics',
    category: 'Chemistry',
    source: 'Chemistry_Basics.csv',
    updated: 'Nov 15',
    lastScore: 75,
    questions: [
      {
        prompt: 'What subatomic particles are shared in a covalent bond?',
        choices: ['Protons', 'Electrons', 'Neutrons', 'Positrons'],
        answer: 1,
        explanation: 'Covalent bonds form when atoms share pairs of valence electrons.'
      },
      {
        prompt: 'What is the atomic number of Carbon?',
        choices: ['4', '6', '8', '12'],
        answer: 1,
        explanation: 'Carbon has 6 protons in its nucleus, giving it atomic number 6.'
      },
      {
        prompt: 'A solution with a pH of 3 is considered:',
        choices: ['Neutral', 'Acidic', 'Basic / Alkaline', 'Amphoteric'],
        answer: 1,
        explanation: 'Solutions with pH below 7 are acidic; above 7 are basic.'
      },
      {
        prompt: 'Which gas makes up approximately 78% of Earth’s atmosphere?',
        choices: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'],
        answer: 2,
        explanation: 'Dry air is roughly 78% nitrogen (N₂) and 21% oxygen (O₂).'
      },
      {
        prompt: 'An ionic bond typically forms between:',
        choices: ['Two noble gases', 'A metal and a nonmetal', 'Two identical nonmetals', 'Two neutrons'],
        answer: 1,
        explanation: 'Metals transfer electrons to nonmetals, creating oppositely charged ions.'
      }
    ]
  }
];

const SEED_HISTORY = [
  {
    id: 'att-1',
    quizId: 'biology',
    quizTitle: 'Cell structure',
    dateLabel: 'Today, 10:24',
    scorePct: 80,
    correct: 8,
    total: 10,
    duration: '04:32',
    deltaPts: '+20 pts',
    missed: [
      {
        number: 2,
        prompt: 'Which organelle produces most of the cell’s ATP?',
        yourAnswer: 'Ribosome',
        correctAnswer: 'Mitochondrion',
        explanation: 'Mitochondria generate ATP through cellular respiration.'
      },
      {
        number: 7,
        prompt: 'What gives a plant cell structural support?',
        yourAnswer: 'Cell membrane',
        correctAnswer: 'Cell wall',
        explanation: 'The rigid cell wall provides strength and structural support.'
      }
    ]
  },
  {
    id: 'att-2',
    quizId: 'biology',
    quizTitle: 'Cell structure',
    dateLabel: 'Nov 17, 16:10',
    scorePct: 60,
    correct: 6,
    total: 10,
    duration: '05:18',
    deltaPts: '+10 pts',
    missed: []
  },
  {
    id: 'att-3',
    quizId: 'biology',
    quizTitle: 'Cell structure',
    dateLabel: 'Nov 16, 09:42',
    scorePct: 50,
    correct: 5,
    total: 10,
    duration: '06:05',
    deltaPts: 'First attempt',
    missed: []
  }
];

/* --------------------------------------------------------------------------
   Application State & Storage
   -------------------------------------------------------------------------- */
const STORAGE_KEY = 'quiz-clash-v2-state';
let savedState = null;
try {
  savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
} catch {
  savedState = null;
}

const state = {
  theme: savedState?.theme === 'dark' ? 'dark' : 'light',
  quizzes: Array.isArray(savedState?.quizzes) && savedState.quizzes.length
    ? savedState.quizzes
    : structuredClone(SEED_QUIZZES),
  history: Array.isArray(savedState?.history) && savedState.history.length
    ? savedState.history
    : structuredClone(SEED_HISTORY),
  activeQuizId: savedState?.activeQuizId || 'biology',

  // Screen 02 (Generate quiz) state
  upload: {
    fileName: 'Cell_Biology_Notes.pdf',
    fileMeta: '12 pages · Ready to process',
    previewTitle: 'Cell structure and function',
    previewText:
      'Cells are the basic unit of life. The cell membrane regulates movement into and out of the cell. Mitochondria produce energy, while ribosomes synthesize proteins…',
    quizTitle: 'Cell structure',
    questionCount: 10,
    questionFormat: 'Multiple choice',
    error: ''
  },

  // Screen 03 (Review and export) state
  review: {
    questionIndex: 0,
    editing: false,
    exportFormat: 'pdf' // 'pdf' | 'word'
  },

  // Screen 04 (Solo quiz) state
  practice: {
    quizId: 'biology',
    questionIndex: 3, // Starts at Question 4 of 10 like wireframe, or 0 on fresh start
    answers: { 0: 1, 1: 0, 2: 0, 3: 1 }, // Pre-populated 4 answers matching wireframe "Question 4 of 10 · 4 answered"
    startedAt: Date.now() - 180000
  },

  // Screen 05 (Results) state
  results: {
    showAllAnswers: false,
    activeAttemptId: 'att-1'
  },

  // Screen 06 & 07 (Live game lobby & leaderboard) state
  live: {
    pin: '482 619',
    quizId: 'biology',
    timerSeconds: 20,
    round: 3,
    totalRounds: 10,
    joinPinInput: '',
    joinNameInput: '',
    joinError: '',
    players: [
      { name: 'Maya', status: 'Ready', correct: 3, total: 3, points: 2480 },
      { name: 'Leo', status: 'Ready', correct: 3, total: 3, points: 2210 },
      { name: 'Nina', status: 'Ready', correct: 2, total: 3, points: 2050 },
      { name: 'Sam', status: 'Ready', correct: 2, total: 3, points: 1840 }
    ]
  },

  // Screen 08 (Settings) state
  settings: savedState?.settings || {
    tab: 'Profile',
    displayName: 'Alex M.',
    email: 'alex.m@example.com',
    defaultQuestions: 10,
    difficulty: 'Mixed',
    language: 'English',
    shuffleQuestions: true,
    showExplanations: true,
    studyReminders: false,
    weeklySummary: true
  }
};

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: state.theme,
        quizzes: state.quizzes,
        history: state.history,
        activeQuizId: state.activeQuizId,
        settings: state.settings
      })
    );
  } catch {
    /* Ignore storage errors in private mode */
  }
}

let toastTimer = null;
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.display = 'none';
  }, 3600);
}

function openModal(title, htmlContent) {
  const dlg = $('#dialog');
  const content = $('#dialog-content');
  if (!dlg || !content) return;
  content.innerHTML = `
    <div class="dialog-head">
      <h2 class="section-title">${escapeHTML(title)}</h2>
      <button type="button" class="btn btn-sm" data-action="close-modal" aria-label="Close dialog">✕</button>
    </div>
    <div>${htmlContent}</div>
  `;
  dlg.showModal();
}

function closeModal() {
  const dlg = $('#dialog');
  if (dlg && dlg.open) dlg.close();
}

function getActiveQuiz() {
  return state.quizzes.find((q) => q.id === state.activeQuizId) || state.quizzes[0];
}

/* --------------------------------------------------------------------------
   Theme Management (Light Mode Option A + Platinum / Dark Mode Option D + Jet Black)
   -------------------------------------------------------------------------- */
function applyTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  const label = $('#theme-toggle-label');
  if (label) {
    label.textContent = state.theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode';
  }
  persist();
}

/* --------------------------------------------------------------------------
   Route Normalization (Supports #s1..#s8 and semantic aliases)
   -------------------------------------------------------------------------- */
const ROUTE_MAP = {
  s1: 's1',
  dashboard: 's1',
  s2: 's2',
  create: 's2',
  generate: 's2',
  s3: 's3',
  review: 's3',
  library: 's3',
  quizzes: 's3',
  s4: 's4',
  play: 's4',
  solo: 's4',
  s5: 's5',
  results: 's5',
  history: 's5',
  s6: 's6',
  lobby: 's6',
  battle: 's6',
  s7: 's7',
  leaderboard: 's7',
  s8: 's8',
  settings: 's8'
};

function getCurrentScreen() {
  const raw = location.hash.slice(1).split('/')[0] || 's1';
  return ROUTE_MAP[raw] || 's1';
}

/* --------------------------------------------------------------------------
   Screen 01: Dashboard
   -------------------------------------------------------------------------- */
function renderS1Dashboard() {
  const avgScore = state.history.length
    ? Math.round(state.history.reduce((sum, h) => sum + h.scorePct, 0) / state.history.length)
    : 82;
  const savedCount = Math.max(12, state.quizzes.length);
  const completedCount = Math.max(28, state.history.length);
  const activeQuiz = getActiveQuiz();
  const answeredCount = Object.keys(state.practice.answers).length;

  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy" data-name="Welcome copy">
        <div class="eyebrow">YOUR STUDY SPACE / 01</div>
        <h1 class="page-title">Turn your notes into knowledge.</h1>
        <p class="page-subtitle">Generate a quiz, practice at your pace, or challenge your friends.</p>
      </div>
      <a href="#s2" class="btn btn-primary">+ Create a quiz</a>
    </div>

    <section class="stat-grid-3" data-name="Study overview" aria-label="Study overview">
      <div class="stat-card" data-name="Saved quizzes">
        <div class="stat-value">${savedCount}</div>
        <div class="stat-label">Saved quizzes</div>
      </div>
      <div class="stat-card" data-name="Completed attempts">
        <div class="stat-value">${completedCount}</div>
        <div class="stat-label">Completed attempts</div>
      </div>
      <div class="stat-card" data-name="Average score">
        <div class="stat-value">${avgScore}%</div>
        <div class="stat-label">Average score</div>
      </div>
    </section>

    <section class="box-card banner-row" data-name="Start from a document">
      <div>
        <h2>Your next quiz starts with your notes.</h2>
        <p>Upload a PDF, Word, CSV, or text file. Get multiple-choice questions ready to study or print.</p>
      </div>
      <a href="#s2" class="btn btn-primary">Upload study material</a>
    </section>

    <section class="box-card" data-name="Recent quizzes">
      <div class="section-header">
        <h2 class="section-title">Recent quizzes</h2>
        <a href="#s3" class="text-link">View all quizzes →</a>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>QUIZ NAME</th>
              <th>QUESTIONS</th>
              <th>LAST SCORE</th>
              <th>UPDATED</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${state.quizzes
              .map(
                (q) => `
              <tr>
                <td><strong>${escapeHTML(q.title)}</strong></td>
                <td>${q.questions.length} questions</td>
                <td><span class="score-badge">${q.lastScore ?? 80}%</span></td>
                <td>${escapeHTML(q.updated || 'Today')}</td>
                <td>
                  <button type="button" class="text-link" style="background:none;border:0;padding:0;cursor:pointer" data-action="open-quiz" data-quiz-id="${escapeHTML(q.id)}">
                    Open quiz →
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid-2-equal" data-name="Continue learning">
      <div class="box-card continue-card" data-name="Resume studying">
        <div>
          <div class="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
          <h3>${escapeHTML(activeQuiz.title)}</h3>
          <p class="page-subtitle">Question ${Math.min(state.practice.questionIndex + 1, activeQuiz.questions.length)} of ${activeQuiz.questions.length} · ${answeredCount ? 'Practice in progress' : 'Ready to start'}</p>
        </div>
        <div class="btn-row">
          <a href="#s4" class="btn btn-primary">Continue quiz →</a>
        </div>
      </div>

      <div class="box-card continue-card" data-name="Multiplayer shortcut">
        <div>
          <div class="eyebrow">STUDY TOGETHER</div>
          <h3>Make revision a friendly competition.</h3>
          <p class="page-subtitle">Host a room or enter a PIN to join your friends.</p>
        </div>
        <div class="btn-row">
          <a href="#s6" class="btn btn-primary">Host a game</a>
          <a href="#s6" class="btn">Join with PIN</a>
        </div>
      </div>
    </section>
  `;
}

/* --------------------------------------------------------------------------
   Screen 02: Generate Quiz
   -------------------------------------------------------------------------- */
function renderS2GenerateQuiz() {
  const up = state.upload;
  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">CREATE / 02</div>
        <h1 class="page-title">From study notes to a ready-to-use quiz.</h1>
        <p class="page-subtitle">Upload your material and choose how you want to practice.</p>
      </div>
    </div>

    <div class="steps-bar" data-name="Generation steps" role="list">
      <div class="step-item active" role="listitem">1 &nbsp; Upload material</div>
      <div class="step-item ${up.fileName ? 'active' : ''}" role="listitem">2 &nbsp; Configure quiz</div>
      <div class="step-item" role="listitem">3 &nbsp; Review questions</div>
    </div>

    <div class="generator-columns" data-name="Generator columns">
      <!-- Left Column: 01 / Study material -->
      <section class="box-card" data-name="Study material">
        <h2 class="panel-heading">01 / Study material</h2>

        <label class="dropzone" id="upload-dropzone" for="file-input" data-name="Upload drop zone">
          <span class="doc-badge">[ DOCUMENT ]</span>
          <strong style="font-size:17px">Drag and drop your study file here</strong>
          <span class="helper-text">PDF, Word (.docx), CSV, or TXT</span>
          <span class="btn" style="margin-top:6px">Browse files</span>
        </label>
        <input id="file-input" type="file" class="visually-hidden" accept=".pdf,.docx,.csv,.txt">

        ${up.error ? `<p class="error-text" role="alert" style="margin-top:10px">${escapeHTML(up.error)}</p>` : ''}

        ${
          up.fileName
            ? `
          <div class="uploaded-source-bar" data-name="Uploaded source">
            <div>
              <div class="source-name">${escapeHTML(up.fileName)}</div>
              <div class="source-meta">${escapeHTML(up.fileMeta)}</div>
            </div>
            <button type="button" class="btn btn-sm" data-action="remove-file">Remove</button>
          </div>
        `
            : `
          <div class="uploaded-source-bar">
            <span class="helper-text">No file selected yet. Upload a file or load sample notes.</span>
            <button type="button" class="btn btn-sm" data-action="restore-sample-file">Load sample PDF</button>
          </div>
        `
        }

        <div style="margin-top:18px">
          <div class="field-label">Extracted text preview</div>
          <div class="text-preview-box" data-name="Text preview">
            <h4>${escapeHTML(up.previewTitle || 'No document loaded')}</h4>
            <p>${escapeHTML(up.previewText || 'Select a study file above to preview the extracted concepts and definitions.')}</p>
          </div>
          <p class="helper-text" style="margin-top:10px">Formatting and broken line breaks will be cleaned automatically.</p>
        </div>
      </section>

      <!-- Right Column: 02 / Quiz settings -->
      <section class="box-card" data-name="Quiz configuration">
        <h2 class="panel-heading">02 / Quiz settings</h2>

        <div class="field-group">
          <label class="field-label" for="gen-quiz-title">Quiz title</label>
          <input id="gen-quiz-title" class="input" type="text" maxlength="100" value="${escapeHTML(up.quizTitle)}" placeholder="e.g. Cell structure">
        </div>

        <div class="field-group">
          <label class="field-label" for="gen-question-count">Number of questions</label>
          <select id="gen-question-count" class="select">
            ${[5, 10, 15, 20]
              .map(
                (n) => `<option value="${n}" ${Number(up.questionCount) === n ? 'selected' : ''}>${n} questions</option>`
              )
              .join('')}
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="gen-question-format">Question format</label>
          <select id="gen-question-format" class="select">
            <option value="Multiple choice" ${up.questionFormat === 'Multiple choice' ? 'selected' : ''}>Multiple choice</option>
            <option value="Term & definition" ${up.questionFormat === 'Term & definition' ? 'selected' : ''}>Term &amp; definition (4 choices)</option>
          </select>
        </div>

        <p class="helper-text">Each question includes one correct answer and three plausible distractors.</p>

        <div class="summary-callout" data-name="Generation summary">
          <div class="eyebrow" style="margin-bottom:2px">READY TO GENERATE</div>
          <h4>${up.fileName ? '1 document' : '0 documents'} → ${Number(up.questionCount)} questions</h4>
          <p class="helper-text">Review and edit every question before you save or share.</p>
        </div>
      </section>
    </div>

    <div class="action-footer-bar" data-name="Generation actions">
      <span class="helper-text">Your original document stays unchanged.</span>
      <div class="btn-row">
        <a href="#s1" class="btn">Cancel</a>
        <button type="button" class="btn btn-primary" data-action="generate-quiz">Generate quiz →</button>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Screen 03: Review and Export / My Quizzes
   -------------------------------------------------------------------------- */
function renderS3ReviewAndExport() {
  const quiz = getActiveQuiz();
  const total = quiz.questions.length;
  const idx = Math.min(Math.max(0, state.review.questionIndex), total - 1);
  state.review.questionIndex = idx;
  const q = quiz.questions[idx];
  const nextQ = quiz.questions[(idx + 1) % total];
  const letters = ['A', 'B', 'C', 'D'];

  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">MY QUIZZES / 03</div>
        <h1 class="page-title">${escapeHTML(quiz.title)}</h1>
        <p class="page-subtitle">${total} multiple-choice questions · Source: ${escapeHTML(quiz.source || 'Uploaded_Notes.txt')}</p>
      </div>
      <div class="field-group" style="margin:0;min-width:220px">
        <label class="field-label-caps" for="switch-quiz-select">Switch Quiz</label>
        <select id="switch-quiz-select" class="select">
          ${state.quizzes
            .map(
              (item) =>
                `<option value="${escapeHTML(item.id)}" ${item.id === quiz.id ? 'selected' : ''}>${escapeHTML(item.title)} (${item.questions.length} Qs)</option>`
            )
            .join('')}
        </select>
      </div>
    </div>

    <div class="btn-row" data-name="Study actions">
      <a href="#s1" class="btn">← My quizzes</a>
      <button type="button" class="btn" data-action="save-quiz-changes">Save changes</button>
      <button type="button" class="btn btn-primary" data-action="start-solo-quiz" data-quiz-id="${escapeHTML(quiz.id)}">Start solo quiz →</button>
      <button type="button" class="btn" data-action="host-live-game" data-quiz-id="${escapeHTML(quiz.id)}">Host live game</button>
    </div>

    <div class="review-columns" data-name="Review columns">
      <!-- Left Column: Question Editor -->
      <div data-name="Question editor">
        <div class="question-nav-bar" data-name="Question navigation">
          <strong style="font-size:12px">QUESTION ${idx + 1} OF ${total}</strong>
          <div class="q-num-pills" role="navigation" aria-label="Question selector">
            ${quiz.questions
              .map(
                (_, i) => `
              <button type="button" class="q-pill ${i === idx ? 'active' : ''}" data-action="select-review-q" data-index="${i}">
                ${i === idx ? `[${i + 1}]` : i + 1}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <section class="box-card" data-name="Question one">
          <div class="section-header" style="margin-bottom:8px">
            <span class="eyebrow" style="margin:0">QUESTION ${String(idx + 1).padStart(2, '0')}</span>
            <button type="button" class="btn btn-sm" data-action="toggle-edit-question">
              ${state.review.editing ? 'Done editing' : 'Edit question'}
            </button>
          </div>

          ${
            state.review.editing
              ? `
            <div class="field-group">
              <label class="field-label" for="edit-prompt">Question prompt</label>
              <textarea id="edit-prompt" class="textarea">${escapeHTML(q.prompt)}</textarea>
            </div>
            <div class="answer-options-list">
              ${q.choices
                .map(
                  (choice, cIdx) => `
                <div style="display:flex;align-items:center;gap:8px">
                  <button type="button" class="btn btn-sm ${q.answer === cIdx ? 'btn-primary' : ''}" data-action="set-correct-choice" data-choice-index="${cIdx}" title="Mark as correct answer">
                    ${letters[cIdx]} ${q.answer === cIdx ? '✓' : ''}
                  </button>
                  <input type="text" class="input edit-choice-input" data-choice-index="${cIdx}" value="${escapeHTML(choice)}">
                </div>
              `
                )
                .join('')}
            </div>
          `
              : `
            <h2 class="question-prompt-lg">${escapeHTML(q.prompt)}</h2>
            <div class="answer-options-list">
              ${q.choices
                .map(
                  (choice, cIdx) => `
                <button type="button" class="answer-option-box ${q.answer === cIdx ? 'correct-preview' : ''}" data-action="set-correct-choice" data-choice-index="${cIdx}">
                  <span><strong>${letters[cIdx]}</strong> &nbsp; ${escapeHTML(choice)}</span>
                  ${q.answer === cIdx ? '<span>✓ Correct</span>' : '<span class="helper-text">Click to set correct</span>'}
                </button>
              `
                )
                .join('')}
            </div>
          `
          }

          <div style="margin-top:16px;font-size:12px;font-weight:700">
            Correct answer: ${letters[q.answer]}
          </div>
        </section>

        <section class="box-card" style="margin-top:16px" data-name="Next question preview">
          <div class="eyebrow">UP NEXT / QUESTION ${String(((idx + 1) % total) + 1).padStart(2, '0')}</div>
          <div style="font-size:15px;font-weight:600">${escapeHTML(nextQ.prompt)}</div>
        </section>

        <div class="btn-row" style="margin-top:16px" data-name="Editor pagination">
          <button type="button" class="btn" data-action="review-prev" ${idx === 0 ? 'disabled' : ''}>← Previous</button>
          <button type="button" class="btn" data-action="review-next" ${idx === total - 1 ? 'disabled' : ''}>Next question →</button>
        </div>
      </div>

      <!-- Right Column: Offline Export & Reminder -->
      <aside style="display:flex;flex-direction:column;gap:16px" data-name="Quiz options">
        <section class="box-card" data-name="Offline export">
          <h2 class="panel-heading" style="margin-bottom:8px">Print or study offline</h2>
          <p class="helper-text" style="margin-bottom:16px">Download questions and a separate answer key.</p>

          <div class="field-label-caps" style="margin-bottom:8px">DOCUMENT FORMAT</div>
          <div class="btn-row" style="margin-bottom:16px">
            <button type="button" class="btn btn-sm ${state.review.exportFormat === 'pdf' ? 'btn-primary' : ''}" data-action="set-export-format" data-format="pdf">
              (${state.review.exportFormat === 'pdf' ? '●' : ' '}) PDF
            </button>
            <button type="button" class="btn btn-sm ${state.review.exportFormat === 'word' ? 'btn-primary' : ''}" data-action="set-export-format" data-format="word">
              (${state.review.exportFormat === 'word' ? '●' : ' '}) Word
            </button>
          </div>

          <div class="doc-mini-preview" data-name="Document preview">
            <div style="font-weight:700;font-size:11px;text-transform:uppercase;margin-bottom:6px">${escapeHTML(quiz.title)}</div>
            <div class="helper-text" style="font-size:11px;margin-bottom:10px">Name: __________________</div>
            <div style="font-weight:600;margin-bottom:8px">${idx + 1}. ${escapeHTML(q.prompt)}</div>
            <div>
              ${q.choices.map((c, i) => `<div>${letters[i]}. ${escapeHTML(c)}</div>`).join('')}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px">
            <button type="button" class="btn btn-primary" data-action="download-questions">Download questions</button>
            <button type="button" class="btn" data-action="download-answers">Download answer key</button>
          </div>
        </section>

        <section class="box-card" data-name="Review reminder">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:8px">Before you study</h3>
          <p class="helper-text">AI-generated questions may need adjustments. Review the wording and correct answers against your source material.</p>
        </section>
      </aside>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Screen 04: Solo Quiz
   -------------------------------------------------------------------------- */
function renderS4SoloQuiz() {
  const quiz = state.quizzes.find((q) => q.id === state.practice.quizId) || getActiveQuiz();
  const total = quiz.questions.length;
  const idx = Math.min(Math.max(0, state.practice.questionIndex), total - 1);
  state.practice.questionIndex = idx;
  const q = quiz.questions[idx];
  const selectedChoice = state.practice.answers[idx];
  const answeredCount = Object.keys(state.practice.answers).filter((k) => Number(k) < total).length;
  const remainingCount = Math.max(0, total - answeredCount);
  const pct = Math.round((answeredCount / total) * 100);
  const letters = ['A', 'B', 'C', 'D'];

  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">SOLO PRACTICE / 04</div>
        <h1 class="page-title">${escapeHTML(quiz.title)}</h1>
        <p class="page-subtitle">Take your time. Your progress is saved as you go.</p>
      </div>
      <a href="#s1" class="btn" data-name="Save & exit">Save &amp; exit</a>
    </div>

    <section class="progress-card" data-name="Quiz progress" aria-label="Quiz progress">
      <div class="progress-labels">
        <strong>Question ${idx + 1} of ${total}</strong>
        <span class="helper-text">${answeredCount} answered · ${remainingCount} remaining</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </section>

    <div class="practice-columns" data-name="Practice columns">
      <!-- Left: Active Question -->
      <section class="box-card" data-name="Active question">
        <div class="eyebrow">QUESTION ${String(idx + 1).padStart(2, '0')} / MULTIPLE CHOICE</div>
        <h2 class="question-prompt-lg">${escapeHTML(q.prompt)}</h2>
        <p class="helper-text" style="margin-bottom:16px">Select one answer.</p>

        <div class="answer-options-list" role="radiogroup" aria-label="Answer choices">
          ${q.choices
            .map((choice, cIdx) => {
              const isSelected = selectedChoice === cIdx;
              return `
                <button
                  type="button"
                  class="answer-option-box ${isSelected ? 'selected' : ''}"
                  data-action="select-practice-answer"
                  data-choice-index="${cIdx}"
                  role="radio"
                  aria-checked="${isSelected}"
                >
                  <span>(${isSelected ? '●' : ' '}) &nbsp; <strong>${letters[cIdx]}.</strong> &nbsp; ${escapeHTML(choice)}</span>
                  ${isSelected ? '<span style="font-size:12px">Selected</span>' : ''}
                </button>
              `;
            })
            .join('')}
        </div>

        <div class="helper-text" style="margin-top:16px;font-weight:600">
          ${selectedChoice !== undefined ? 'Answer selected · Saved' : 'No answer selected yet for this question'}
        </div>
      </section>

      <!-- Right: Question Navigator -->
      <aside class="box-card" data-name="Question navigator">
        <h2 class="section-title">Your progress</h2>
        <div class="q-index-grid">
          ${quiz.questions
            .map((_, i) => {
              const isCurrent = i === idx;
              const isAnswered = state.practice.answers[i] !== undefined;
              const cls = isCurrent ? 'current' : isAnswered ? 'answered' : '';
              return `
                <button type="button" class="q-index-btn ${cls}" data-action="jump-practice-q" data-index="${i}">
                  ${String(i + 1).padStart(2, '0')}
                </button>
              `;
            })
            .join('')}
        </div>

        <div class="helper-text" style="line-height:1.7;margin-bottom:14px">
          <div><strong>●</strong> Answered (${answeredCount})</div>
          <div><strong>■</strong> Current question (${String(idx + 1).padStart(2, '0')})</div>
          <div><strong>○</strong> Not answered (${remainingCount})</div>
        </div>
        <p class="helper-text">Answers are graded when you finish the quiz.</p>
      </aside>
    </div>

    <div class="action-footer-bar" data-name="Practice navigation">
      <button type="button" class="btn" data-action="practice-prev" ${idx === 0 ? 'disabled' : ''}>← Previous question</button>
      <button type="button" class="btn" data-action="practice-next" ${idx === total - 1 ? 'disabled' : ''}>Next question →</button>
    </div>

    <section class="box-card banner-row" data-name="Finish quiz panel">
      <span class="helper-text" style="font-size:13px">Ready to submit? You can review any question before finishing.</span>
      <button type="button" class="btn btn-primary" data-action="finish-solo-quiz">Finish quiz</button>
    </section>
  `;
}

/* --------------------------------------------------------------------------
   Screen 05: Results and History
   -------------------------------------------------------------------------- */
function renderS5ResultsAndHistory() {
  const latest =
    state.history.find((h) => h.id === state.results.activeAttemptId) ||
    state.history[0] ||
    SEED_HISTORY[0];

  const quiz = state.quizzes.find((q) => q.id === latest.quizId) || getActiveQuiz();
  const missedList = latest.missed && latest.missed.length ? latest.missed : SEED_HISTORY[0].missed;

  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">RESULTS &amp; HISTORY / 05</div>
        <h1 class="page-title">A little practice goes a long way.</h1>
        <p class="page-subtitle">${escapeHTML(latest.quizTitle)} · Attempt completed · Saved to your profile</p>
      </div>
      <a href="#s1" class="btn">Back to dashboard</a>
    </div>

    <section class="stat-grid-4" data-name="Attempt summary" aria-label="Attempt summary">
      <div class="stat-card" data-name="Your score">
        <div class="stat-value">${latest.scorePct}%</div>
        <div class="stat-label">Your score</div>
      </div>
      <div class="stat-card" data-name="Correct answers">
        <div class="stat-value">${latest.correct} / ${latest.total}</div>
        <div class="stat-label">Correct answers</div>
      </div>
      <div class="stat-card" data-name="Time taken">
        <div class="stat-value">${escapeHTML(latest.duration)}</div>
        <div class="stat-label">Time taken</div>
      </div>
      <div class="stat-card" data-name="From last attempt">
        <div class="stat-value">${escapeHTML(latest.deltaPts)}</div>
        <div class="stat-label">From last attempt</div>
      </div>
    </section>

    <section class="box-card" data-name="Missed question review">
      <div class="section-header">
        <h2 class="section-title">
          ${
            state.results.showAllAnswers
              ? `All ${quiz.questions.length} questions in ${escapeHTML(quiz.title)}`
              : missedList.length
              ? `Review the ${missedList.length} question${missedList.length === 1 ? '' : 's'} you missed`
              : 'Perfect score! Every question answered correctly'
          }
        </h2>
        <button type="button" class="text-link" style="background:none;border:0;cursor:pointer" data-action="toggle-all-answers">
          ${state.results.showAllAnswers ? 'Show missed only →' : 'View all answers →'}
        </button>
      </div>

      <div class="missed-grid">
        ${
          state.results.showAllAnswers
            ? quiz.questions
                .map(
                  (q, i) => `
              <article class="feedback-card is-right">
                <div class="eyebrow">QUESTION ${String(i + 1).padStart(2, '0')}</div>
                <h3 style="font-size:16px;font-weight:600">${escapeHTML(q.prompt)}</h3>
                <p style="font-size:13px"><strong>Correct answer:</strong> ${escapeHTML(q.choices[q.answer])}</p>
                <p class="helper-text">${escapeHTML(q.explanation || 'Verified against your study notes.')}</p>
              </article>
            `
                )
                .join('')
            : missedList
                .map(
                  (m) => `
              <article class="feedback-card is-wrong">
                <div class="eyebrow">QUESTION ${String(m.number).padStart(2, '0')}</div>
                <h3 style="font-size:16px;font-weight:600">${escapeHTML(m.prompt)}</h3>
                <div style="font-size:13px;line-height:1.5">
                  <div>Your answer: <strong>${escapeHTML(m.yourAnswer)}</strong></div>
                  <div>Correct answer: <strong>${escapeHTML(m.correctAnswer)}</strong></div>
                </div>
                <p class="helper-text">${escapeHTML(m.explanation)}</p>
              </article>
            `
                )
                .join('')
        }
      </div>
    </section>

    <section class="box-card" data-name="Attempt history">
      <h2 class="section-title" style="margin-bottom:4px">Your attempt history</h2>
      <p class="helper-text" style="margin-bottom:16px">${escapeHTML(latest.quizTitle)} · ${state.history.length} completed attempts</p>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>SCORE</th>
              <th>CORRECT</th>
              <th>DURATION</th>
              <th>REVIEW</th>
            </tr>
          </thead>
          <tbody>
            ${state.history
              .map(
                (h) => `
              <tr>
                <td>${escapeHTML(h.dateLabel)}</td>
                <td><span class="score-badge">${h.scorePct}%</span></td>
                <td>${h.correct} / ${h.total}</td>
                <td>${escapeHTML(h.duration)}</td>
                <td>
                  <button type="button" class="text-link" style="background:none;border:0;padding:0;cursor:pointer" data-action="view-attempt" data-attempt-id="${escapeHTML(h.id)}">
                    View attempt →
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <div class="btn-row" data-name="Results actions">
      <button type="button" class="btn btn-primary" data-action="retake-quiz" data-quiz-id="${escapeHTML(latest.quizId)}">Retake quiz</button>
      <button type="button" class="btn" data-action="download-answers">Download answer key</button>
      <a href="#s6" class="btn">Challenge friends</a>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Screen 06: Live Game Lobby
   -------------------------------------------------------------------------- */
function renderS6LiveLobby() {
  const liveQuiz = state.quizzes.find((q) => q.id === state.live.quizId) || getActiveQuiz();
  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">LIVE GAMES / 06</div>
        <h1 class="page-title">Better together. Ready to compete?</h1>
        <p class="page-subtitle">Host view · ${escapeHTML(liveQuiz.title)} · ${liveQuiz.questions.length} questions</p>
      </div>
      <a href="#s1" class="btn">Close room</a>
    </div>

    <div class="review-columns" data-name="Lobby columns">
      <!-- Left Column: Host Lobby -->
      <div style="display:flex;flex-direction:column;gap:18px" data-name="Host lobby">
        <section class="pin-invitation-card" data-name="Room invitation">
          <div class="eyebrow">INVITE FRIENDS WITH THIS ROOM PIN</div>
          <div class="pin-display">${escapeHTML(state.live.pin)}</div>
          <p class="helper-text" style="margin-bottom:16px">Open AutoQuiz → Join game → Enter the PIN</p>
          <div class="btn-row">
            <button type="button" class="btn" data-action="copy-pin">Copy PIN</button>
            <button type="button" class="btn" data-action="copy-invite-link">Copy invite link</button>
          </div>
        </section>

        <section class="box-card" data-name="Connected players">
          <div class="section-header" style="margin-bottom:8px">
            <h2 class="section-title">${state.live.players.length} players joined</h2>
            <span class="helper-text">Waiting for the host</span>
          </div>

          <div class="players-grid-2x2">
            ${state.live.players
              .map(
                (p) => `
              <div class="player-tile">
                <strong>${escapeHTML(p.name)}</strong>
                <span class="score-badge">${escapeHTML(p.status)}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <p class="helper-text">Players appear here as soon as they join.</p>
        </section>

        <div class="btn-row" data-name="Host controls">
          <a href="#s7" class="btn btn-primary">Start game →</a>
          <span class="helper-text">All ${state.live.players.length} players are connected.</span>
        </div>
      </div>

      <!-- Right Column: Game Setup & Participant Entry -->
      <aside style="display:flex;flex-direction:column;gap:18px" data-name="Game setup and participant entry">
        <section class="box-card" data-name="Session settings">
          <h2 class="panel-heading" style="margin-bottom:14px">Game setup</h2>

          <div class="field-group">
            <label class="field-label-caps" for="lobby-quiz-select">QUIZ</label>
            <select id="lobby-quiz-select" class="select">
              ${state.quizzes
                .map(
                  (q) =>
                    `<option value="${escapeHTML(q.id)}" ${q.id === state.live.quizId ? 'selected' : ''}>${escapeHTML(q.title)}</option>`
                )
                .join('')}
            </select>
            <span class="helper-text">${liveQuiz.questions.length} questions · Multiple choice</span>
          </div>

          <div class="field-group">
            <label class="field-label-caps" for="lobby-timer-select">TIME PER QUESTION</label>
            <select id="lobby-timer-select" class="select">
              ${[15, 20, 30, 45]
                .map(
                  (sec) =>
                    `<option value="${sec}" ${Number(state.live.timerSeconds) === sec ? 'selected' : ''}>${sec} seconds</option>`
                )
                .join('')}
            </select>
          </div>

          <p class="helper-text" style="line-height:1.6">
            Scoring: Accuracy + answer speed<br>
            Leaderboard: After every round
          </p>
        </section>

        <form class="box-card" id="participant-join-form" data-name="Participant join panel">
          <h2 class="section-title" style="margin-bottom:6px">Joining someone else?</h2>
          <p class="helper-text" style="margin-bottom:14px">Enter a room PIN and your display name.</p>

          <div class="field-group">
            <label class="field-label-caps" for="join-pin-input">ROOM PIN</label>
            <input id="join-pin-input" class="input" type="text" maxlength="10" placeholder="Enter 6-digit PIN (e.g. 482 619)" value="${escapeHTML(state.live.joinPinInput)}">
          </div>

          <div class="field-group">
            <label class="field-label-caps" for="join-name-input">DISPLAY NAME</label>
            <input id="join-name-input" class="input" type="text" maxlength="40" placeholder="Your name" value="${escapeHTML(state.live.joinNameInput)}">
          </div>

          ${state.live.joinError ? `<p class="error-text" role="alert" style="margin-bottom:10px">${escapeHTML(state.live.joinError)}</p>` : ''}

          <button type="submit" class="btn btn-primary">Join game →</button>
        </form>
      </aside>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Screen 07: Live Leaderboard
   -------------------------------------------------------------------------- */
function renderS7LiveLeaderboard() {
  const liveQuiz = state.quizzes.find((q) => q.id === state.live.quizId) || getActiveQuiz();
  const totalRounds = liveQuiz.questions.length;
  const round = Math.min(Math.max(1, state.live.round), totalRounds);
  const currentQ = liveQuiz.questions[(round - 1) % totalRounds];
  const nextQ = liveQuiz.questions[round % totalRounds];
  const sortedPlayers = [...state.live.players].sort((a, b) => b.points - a.points);

  return `
    <div class="page-heading" data-name="Page heading">
      <div class="heading-copy">
        <div class="eyebrow">LIVE GAMES / 07</div>
        <h1 class="page-title">The leaderboard is in.</h1>
        <p class="page-subtitle">${escapeHTML(liveQuiz.title)} · Room ${escapeHTML(state.live.pin)} · Host view</p>
      </div>
      <a href="#s6" class="btn">End game</a>
    </div>

    <div class="status-bar-banner" data-name="Live session state">
      <strong style="font-size:12px;letter-spacing:0.6px">ROUND ${round} OF ${totalRounds} COMPLETE</strong>
      <span class="helper-text">${state.live.players.length} / ${state.live.players.length} responses received</span>
    </div>

    <div class="review-columns" data-name="Live results columns">
      <!-- Left: Current Standings -->
      <section class="box-card" data-name="Live leaderboard">
        <h2 class="panel-heading" style="margin-bottom:6px">Current standings</h2>
        <p class="helper-text" style="margin-bottom:18px">Points reward accuracy and faster correct answers.</p>

        <div class="rank-row" style="background:transparent;border:0;padding:4px 16px;margin-bottom:6px;font-size:11px;font-weight:700;color:var(--text-muted)">
          <span>RANK</span>
          <span>PLAYER</span>
          <span>CORRECT</span>
          <span>POINTS</span>
        </div>

        ${sortedPlayers
          .map(
            (p, idx) => `
          <div class="rank-row ${idx === 0 ? 'rank-1' : ''}">
            <span>${String(idx + 1).padStart(2, '0')}</span>
            <strong>${escapeHTML(p.name)}</strong>
            <span>${p.correct} / ${round}</span>
            <strong>${p.points.toLocaleString()}</strong>
          </div>
        `
          )
          .join('')}

        <p class="helper-text" style="margin-top:14px">Standings update after every question.</p>
      </section>

      <!-- Right: Round Summary -->
      <aside class="box-card" data-name="Round summary">
        <h2 class="panel-heading" style="margin-bottom:12px">Last round</h2>
        <div class="eyebrow">QUESTION ${String(round).padStart(2, '0')}</div>
        <h3 style="font-size:18px;font-weight:600;margin:8px 0 16px">${escapeHTML(currentQ.prompt)}</h3>

        <div class="box-subtle" style="margin-bottom:16px">
          <div class="eyebrow" style="margin-bottom:4px">CORRECT ANSWER</div>
          <div style="font-size:20px;font-weight:700">${escapeHTML(currentQ.choices[currentQ.answer])}</div>
        </div>

        <div class="grid-2-equal" style="margin-bottom:16px">
          <div>
            <div style="font-size:24px;font-weight:700">3 / ${state.live.players.length}</div>
            <div class="helper-text">Answered correctly</div>
          </div>
          <div>
            <div style="font-size:24px;font-weight:700">8.4 s</div>
            <div class="helper-text">Average response</div>
          </div>
        </div>

        <p class="helper-text">${escapeHTML(sortedPlayers[0].name)} answered correctly in 4.2 seconds and earned 920 points this round.</p>
      </aside>
    </div>

    <section class="box-card banner-row" data-name="Next round controls">
      <div>
        <div class="eyebrow">UP NEXT / QUESTION ${String(((round) % totalRounds) + 1).padStart(2, '0')}</div>
        <h3 style="font-size:17px;font-weight:600;margin-bottom:4px">${escapeHTML(nextQ.prompt)}</h3>
        <p class="helper-text">${state.live.timerSeconds}-second timer starts when you continue.</p>
      </div>
      <button type="button" class="btn btn-primary" data-action="advance-live-round">
        ${round < totalRounds ? 'Next question →' : 'Restart rounds ↻'}
      </button>
    </section>

    <div class="box-card" style="padding:14px 18px" data-name="Player view note">
      <span class="helper-text">Players see the same rankings while they wait for the next question.</span>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Screen 08: Settings
   -------------------------------------------------------------------------- */
function renderS8Settings() {
  const s = state.settings;
  const tabs = ['Profile', 'Quiz defaults', 'Notifications', 'Privacy & account'];

  return `
    <div class="page-heading" data-name="Settings heading">
      <div class="heading-copy">
        <div class="eyebrow">YOUR STUDY SPACE / 08</div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Make AutoQuiz work the way you learn.</p>

        <div class="settings-tabs" role="tablist">
          ${tabs
            .map(
              (tab) => `
            <button type="button" class="settings-tab ${s.tab === tab ? 'active' : ''}" data-action="select-settings-tab" data-tab="${escapeHTML(tab)}">
              ${escapeHTML(tab)}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>

    <!-- Profile & Theme Appearance -->
    <section class="box-card" data-name="Profile">
      <div class="section-header" style="margin-bottom:12px">
        <h2 class="section-title">Profile &amp; Appearance</h2>
        <div class="btn-row">
          <button type="button" class="btn btn-sm ${state.theme === 'light' ? 'btn-primary' : ''}" data-action="set-theme" data-theme="light">
            ☀️ Light (Option A · Platinum #E5E5E5)
          </button>
          <button type="button" class="btn btn-sm ${state.theme === 'dark' ? 'btn-primary' : ''}" data-action="set-theme" data-theme="dark">
            🌙 Dark (Option D · Jet Black #1A1A1A)
          </button>
        </div>
      </div>

      <div class="grid-2-equal">
        <div class="field-group" style="margin-bottom:8px">
          <label class="field-label" for="settings-display-name">Display name</label>
          <input id="settings-display-name" class="input" type="text" value="${escapeHTML(s.displayName)}">
        </div>
        <div class="field-group" style="margin-bottom:8px">
          <label class="field-label" for="settings-email">Email address</label>
          <input id="settings-email" class="input" type="email" value="${escapeHTML(s.email)}">
        </div>
      </div>
      <p class="helper-text">Your display name appears in live games and on leaderboards.</p>
    </section>

    <!-- Quiz Defaults -->
    <section class="box-card" data-name="Quiz defaults">
      <h2 class="section-title" style="margin-bottom:4px">Quiz defaults</h2>
      <p class="helper-text" style="margin-bottom:16px">Starting preferences for new quizzes. You can change these each time.</p>

      <div class="stat-grid-3" style="margin-bottom:16px">
        <div class="field-group" style="margin:0">
          <label class="field-label" for="settings-default-q">Number of questions</label>
          <select id="settings-default-q" class="select">
            ${[5, 10, 15, 20]
              .map(
                (n) => `<option value="${n}" ${Number(s.defaultQuestions) === n ? 'selected' : ''}>${n} questions</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="field-group" style="margin:0">
          <label class="field-label" for="settings-difficulty">Difficulty</label>
          <select id="settings-difficulty" class="select">
            ${['Mixed', 'Foundational', 'Advanced']
              .map((d) => `<option value="${d}" ${s.difficulty === d ? 'selected' : ''}>${d}</option>`)
              .join('')}
          </select>
        </div>
        <div class="field-group" style="margin:0">
          <label class="field-label" for="settings-language">Quiz language</label>
          <select id="settings-language" class="select">
            ${['English', 'Japanese (日本語)', 'Spanish']
              .map((lang) => `<option value="${lang}" ${s.language === lang ? 'selected' : ''}>${lang}</option>`)
              .join('')}
          </select>
        </div>
      </div>

      <div class="toggle-row">
        <div>
          <div style="font-size:13px;font-weight:600">Shuffle questions</div>
          <div class="helper-text">Keep each practice session a little different.</div>
        </div>
        <button type="button" class="switch-btn" role="switch" aria-checked="${s.shuffleQuestions}" data-action="toggle-setting" data-key="shuffleQuestions">
          <span>${s.shuffleQuestions ? 'On' : 'Off'}</span>
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </button>
      </div>

      <div class="toggle-row">
        <div>
          <div style="font-size:13px;font-weight:600">Show explanations after each answer</div>
          <div class="helper-text">Learn as you go in solo practice.</div>
        </div>
        <button type="button" class="switch-btn" role="switch" aria-checked="${s.showExplanations}" data-action="toggle-setting" data-key="showExplanations">
          <span>${s.showExplanations ? 'On' : 'Off'}</span>
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </button>
      </div>
    </section>

    <!-- Notifications -->
    <section class="box-card" data-name="Notifications">
      <h2 class="section-title" style="margin-bottom:12px">Notifications</h2>

      <div class="toggle-row" style="border-top:0">
        <div>
          <div style="font-size:13px;font-weight:600">Study reminders</div>
          <div class="helper-text">A gentle email reminder to keep your revision on track.</div>
        </div>
        <button type="button" class="switch-btn" role="switch" aria-checked="${s.studyReminders}" data-action="toggle-setting" data-key="studyReminders">
          <span>${s.studyReminders ? 'On' : 'Off'}</span>
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </button>
      </div>

      <div class="toggle-row">
        <div>
          <div style="font-size:13px;font-weight:600">Weekly progress summary</div>
          <div class="helper-text">Your completed quizzes, scores, and study activity.</div>
        </div>
        <button type="button" class="switch-btn" role="switch" aria-checked="${s.weeklySummary}" data-action="toggle-setting" data-key="weeklySummary">
          <span>${s.weeklySummary ? 'On' : 'Off'}</span>
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </button>
      </div>
    </section>

    <!-- Privacy & Account -->
    <section class="box-card" data-name="Privacy and account">
      <h2 class="section-title" style="margin-bottom:12px">Privacy &amp; account</h2>
      <div class="banner-row">
        <div>
          <div style="font-size:13px;font-weight:600">Your quizzes stay private</div>
          <div class="helper-text">Only people you share a quiz or game PIN with can join.</div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-sm" data-action="export-user-data">Export my data</button>
          <button type="button" class="btn btn-sm btn-danger" data-action="delete-account-prompt">Delete account</button>
        </div>
      </div>
    </section>

    <div class="action-footer-bar" data-name="Save preferences">
      <span class="helper-text">Changes apply to future quizzes, not existing ones.</span>
      <div class="btn-row">
        <a href="#s1" class="btn">Cancel</a>
        <button type="button" class="btn btn-primary" data-action="save-settings">Save changes</button>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Printable Worksheet Builder (Questions Sheet or Answer Key)
   -------------------------------------------------------------------------- */
function triggerPrintSheet(kind) {
  const quiz = getActiveQuiz();
  const printEl = $('#print-sheet');
  const letters = ['A', 'B', 'C', 'D'];
  if (!printEl) return;

  printEl.innerHTML = `
    <div style="border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">
        AUTOQUIZ · ${kind === 'answers' ? 'SEPARATE ANSWER KEY' : 'OFFLINE STUDY SHEET'}
      </div>
      <h1>${escapeHTML(quiz.title)}</h1>
      ${
        kind === 'questions'
          ? '<p>Name: ____________________________ &nbsp;&nbsp;&nbsp; Date: ________________</p>'
          : `<p>${quiz.questions.length} multiple-choice questions · Source: ${escapeHTML(quiz.source)}</p>`
      }
    </div>
    <ol>
      ${quiz.questions
        .map(
          (q) => `
        <li>
          <strong>${escapeHTML(q.prompt)}</strong><br>
          ${
            kind === 'answers'
              ? `<span>Correct Answer: <strong>${letters[q.answer]}. ${escapeHTML(q.choices[q.answer])}</strong></span>`
              : q.choices.map((c, i) => `<div>${letters[i]}. ${escapeHTML(c)}</div>`).join('')
          }
        </li>
      `
        )
        .join('')}
    </ol>
  `;

  toast(
    kind === 'answers'
      ? 'Opening print/PDF dialog for Answer Key…'
      : 'Opening print/PDF dialog for Questions Sheet…'
  );
  setTimeout(() => window.print(), 120);
}

/* --------------------------------------------------------------------------
   Main Render Loop & Sidebar / Header Sync
   -------------------------------------------------------------------------- */
function render(focusMain = false) {
  applyTheme(state.theme);

  const screen = getCurrentScreen();
  const headerUser = $('#header-user');
  if (headerUser) {
    headerUser.textContent = state.settings.displayName || 'Alex M.';
  }

  // Highlight active primary nav item (s4 solo quiz highlights s3 My quizzes, s7 highlights s6 Live games)
  const navHighlight = screen === 's4' ? 's3' : screen === 's7' ? 's6' : screen;
  $$('[data-nav]').forEach((link) => {
    const isActive = link.dataset.nav === navHighlight;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Highlight active footer screen link
  $$('[data-footer-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.footerNav === screen);
  });

  // Render sidebar library items (capped at 4 so the fixed sidebar never overflows)
  const libEl = $('#sidebar-library');
  if (libEl) {
    libEl.innerHTML = state.quizzes
      .slice(0, 4)
      .map(
        (q) => `
      <a
        href="#s3"
        class="library-item ${screen === 's3' && q.id === state.activeQuizId ? 'active-quiz' : ''}"
        data-action="sidebar-select-quiz"
        data-quiz-id="${escapeHTML(q.id)}"
      >
        ${escapeHTML(q.sidebarTitle || q.title)}
      </a>
    `
      )
      .join('');
  }

  const views = {
    s1: renderS1Dashboard,
    s2: renderS2GenerateQuiz,
    s3: renderS3ReviewAndExport,
    s4: renderS4SoloQuiz,
    s5: renderS5ResultsAndHistory,
    s6: renderS6LiveLobby,
    s7: renderS7LiveLeaderboard,
    s8: renderS8Settings
  };

  const mainEl = $('#main');
  if (mainEl) {
    mainEl.innerHTML = (views[screen] || renderS1Dashboard)();
    if (focusMain) {
      mainEl.focus();
      mainEl.scrollTo(0, 0);
      window.scrollTo(0, 0);
    }
  }

  bindScreenEvents(screen);
}

/* --------------------------------------------------------------------------
   Screen-Specific Event Bindings (Upload Dropzone, Inputs, Forms)
   -------------------------------------------------------------------------- */
function handleSelectedFile(file) {
  if (!file) return;
  if (!/\.(pdf|docx|csv|txt)$/i.test(file.name)) {
    state.upload.error = 'Unsupported file format. Please choose a PDF, DOCX, CSV, or TXT file.';
    render();
    return;
  }
  if (file.size === 0) {
    state.upload.error = 'This file is empty. Please choose a file with study material.';
    render();
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    state.upload.error = 'File exceeds the 10 MB limit. Please choose a smaller study file.';
    render();
    return;
  }

  state.upload.error = '';
  state.upload.fileName = file.name;
  const kb = Math.max(1, Math.round(file.size / 1024));
  state.upload.fileMeta = `${kb} KB · Ready to process`;
  const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  state.upload.quizTitle = cleanTitle;
  state.upload.previewTitle = `${cleanTitle} — Extracted notes`;

  if (/\.(csv|txt)$/i.test(file.name) && typeof FileReader !== 'undefined') {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').trim();
      state.upload.previewText = text
        ? text.slice(0, 320) + (text.length > 320 ? '…' : '')
        : 'Structured vocabulary and study terms ready for multiple-choice generation.';
      render();
    };
    reader.readAsText(file);
  } else {
    state.upload.previewText =
      'Key concepts and definitions extracted from your document. Ready to generate multiple-choice questions.';
    render();
  }
}

function bindScreenEvents(screen) {
  if (screen === 's2') {
    const fileInput = $('#file-input');
    const dropzone = $('#upload-dropzone');
    const titleInput = $('#gen-quiz-title');
    const countSelect = $('#gen-question-count');
    const formatSelect = $('#gen-question-format');

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files?.[0]) handleSelectedFile(fileInput.files[0]);
      });
    }
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragging');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
        if (e.dataTransfer?.files?.[0]) handleSelectedFile(e.dataTransfer.files[0]);
      });
    }
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        state.upload.quizTitle = titleInput.value;
      });
    }
    if (countSelect) {
      countSelect.addEventListener('change', () => {
        state.upload.questionCount = Number(countSelect.value);
        render();
      });
    }
    if (formatSelect) {
      formatSelect.addEventListener('change', () => {
        state.upload.questionFormat = formatSelect.value;
      });
    }
  }

  if (screen === 's3') {
    const switchSelect = $('#switch-quiz-select');
    if (switchSelect) {
      switchSelect.addEventListener('change', () => {
        state.activeQuizId = switchSelect.value;
        state.review.questionIndex = 0;
        state.review.editing = false;
        persist();
        render();
      });
    }

    const promptArea = $('#edit-prompt');
    if (promptArea) {
      promptArea.addEventListener('input', () => {
        const quiz = getActiveQuiz();
        quiz.questions[state.review.questionIndex].prompt = promptArea.value;
      });
    }

    $$('.edit-choice-input').forEach((input) => {
      input.addEventListener('input', () => {
        const cIdx = Number(input.dataset.choiceIndex);
        const quiz = getActiveQuiz();
        quiz.questions[state.review.questionIndex].choices[cIdx] = input.value;
      });
    });
  }

  if (screen === 's6') {
    const quizSelect = $('#lobby-quiz-select');
    const timerSelect = $('#lobby-timer-select');
    const joinForm = $('#participant-join-form');

    if (quizSelect) {
      quizSelect.addEventListener('change', () => {
        state.live.quizId = quizSelect.value;
        render();
      });
    }
    if (timerSelect) {
      timerSelect.addEventListener('change', () => {
        state.live.timerSeconds = Number(timerSelect.value);
      });
    }
    if (joinForm) {
      joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pinVal = ($('#join-pin-input')?.value || '').trim();
        const nameVal = ($('#join-name-input')?.value || '').trim();
        state.live.joinPinInput = pinVal;
        state.live.joinNameInput = nameVal;

        const normalizedPin = pinVal.replace(/\s+/g, '');
        if (!normalizedPin || normalizedPin.length < 4) {
          state.live.joinError = 'Please enter a valid 6-digit Room PIN (try 482 619).';
          render();
          return;
        }
        const playerName = nameVal || state.settings.displayName || 'Alex M.';
        state.live.joinError = '';
        if (!state.live.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
          state.live.players.push({
            name: playerName,
            status: 'Ready',
            correct: 3,
            total: 3,
            points: 2350
          });
        }
        toast(`Joined Room ${state.live.pin} as ${playerName}!`);
        render();
      });
    }
  }
}

/* --------------------------------------------------------------------------
   Global Delegated Click Actions
   -------------------------------------------------------------------------- */
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case 'toggle-theme':
      applyTheme(state.theme === 'light' ? 'dark' : 'light');
      toast(`Switched to ${state.theme === 'light' ? 'Light Mode (Platinum #E5E5E5)' : 'Dark Mode (Jet Black #1A1A1A)'}`);
      render();
      break;

    case 'set-theme':
      applyTheme(target.dataset.theme);
      toast(`Theme set to ${state.theme === 'light' ? 'Light Mode' : 'Dark Mode'}`);
      render();
      break;

    case 'close-modal':
      closeModal();
      break;

    case 'sidebar-select-quiz':
    case 'open-quiz': {
      const qId = target.dataset.quizId;
      if (qId) {
        state.activeQuizId = qId;
        state.review.questionIndex = 0;
        state.review.editing = false;
        persist();
      }
      if (location.hash === '#s3') render(true);
      else location.hash = 's3';
      break;
    }

    case 'remove-file':
      state.upload.fileName = '';
      state.upload.fileMeta = '';
      state.upload.previewTitle = '';
      state.upload.previewText = '';
      state.upload.error = '';
      render();
      break;

    case 'restore-sample-file':
      state.upload.fileName = 'Cell_Biology_Notes.pdf';
      state.upload.fileMeta = '12 pages · Ready to process';
      state.upload.previewTitle = 'Cell structure and function';
      state.upload.previewText =
        'Cells are the basic unit of life. The cell membrane regulates movement into and out of the cell. Mitochondria produce energy, while ribosomes synthesize proteins…';
      state.upload.quizTitle = 'Cell structure';
      state.upload.error = '';
      render();
      break;

    case 'generate-quiz': {
      if (!state.upload.fileName) {
        state.upload.error = 'Please upload a study file or click "Load sample PDF" first.';
        render();
        return;
      }
      const title = (state.upload.quizTitle || 'Untitled Quiz').trim();
      const count = Number(state.upload.questionCount) || 10;
      const baseQuestions = SEED_QUIZZES[0].questions;
      const generatedQuestions = Array.from({ length: count }, (_, i) => {
        const template = baseQuestions[i % baseQuestions.length];
        return structuredClone(template);
      });

      const existing = state.quizzes.find((q) => q.title.toLowerCase() === title.toLowerCase());
      if (existing) {
        existing.questions = generatedQuestions;
        existing.source = state.upload.fileName;
        existing.updated = 'Just now';
        state.activeQuizId = existing.id;
      } else {
        const newId = 'quiz-' + Date.now();
        state.quizzes.unshift({
          id: newId,
          title,
          sidebarTitle: title,
          category: 'Custom',
          source: state.upload.fileName,
          updated: 'Just now',
          lastScore: 100,
          questions: generatedQuestions
        });
        state.activeQuizId = newId;
      }

      state.review.questionIndex = 0;
      state.review.editing = false;
      persist();
      toast(`Generated "${title}" with ${count} questions.`);
      location.hash = 's3';
      break;
    }

    case 'select-review-q':
      state.review.questionIndex = Number(target.dataset.index) || 0;
      render();
      break;

    case 'review-prev':
      if (state.review.questionIndex > 0) {
        state.review.questionIndex--;
        render();
      }
      break;

    case 'review-next': {
      const quiz = getActiveQuiz();
      if (state.review.questionIndex < quiz.questions.length - 1) {
        state.review.questionIndex++;
        render();
      }
      break;
    }

    case 'toggle-edit-question':
      state.review.editing = !state.review.editing;
      if (!state.review.editing) {
        persist();
        toast('Question updates saved.');
      }
      render();
      break;

    case 'set-correct-choice': {
      const cIdx = Number(target.dataset.choiceIndex);
      const quiz = getActiveQuiz();
      quiz.questions[state.review.questionIndex].answer = cIdx;
      persist();
      render();
      break;
    }

    case 'save-quiz-changes':
      state.review.editing = false;
      persist();
      toast('All quiz changes saved.');
      render();
      break;

    case 'set-export-format':
      state.review.exportFormat = target.dataset.format === 'word' ? 'word' : 'pdf';
      render();
      break;

    case 'download-questions':
      if (state.review.exportFormat === 'word') {
        openModal(
          'Word (.docx) Export Preview',
          `<p class="page-subtitle" style="margin-bottom:16px">In production, this downloads a formatted <strong>.docx</strong> question worksheet. Use the PDF option or print dialog now to save an offline sheet.</p>
           <div class="btn-row"><button type="button" class="btn btn-primary" data-action="close-modal">Got it</button></div>`
        );
      } else {
        triggerPrintSheet('questions');
      }
      break;

    case 'download-answers':
      triggerPrintSheet('answers');
      break;

    case 'start-solo-quiz':
    case 'retake-quiz': {
      const qId = target.dataset.quizId || state.activeQuizId;
      state.activeQuizId = qId;
      state.practice = {
        quizId: qId,
        questionIndex: 0,
        answers: {},
        startedAt: Date.now()
      };
      if (location.hash === '#s4') render(true);
      else location.hash = 's4';
      break;
    }

    case 'host-live-game': {
      const qId = target.dataset.quizId || state.activeQuizId;
      state.live.quizId = qId;
      location.hash = 's6';
      break;
    }

    case 'select-practice-answer': {
      const cIdx = Number(target.dataset.choiceIndex);
      state.practice.answers[state.practice.questionIndex] = cIdx;
      render();
      break;
    }

    case 'jump-practice-q':
      state.practice.questionIndex = Number(target.dataset.index) || 0;
      render();
      break;

    case 'practice-prev':
      if (state.practice.questionIndex > 0) {
        state.practice.questionIndex--;
        render();
      }
      break;

    case 'practice-next': {
      const quiz = state.quizzes.find((q) => q.id === state.practice.quizId) || getActiveQuiz();
      if (state.practice.questionIndex < quiz.questions.length - 1) {
        state.practice.questionIndex++;
        render();
      }
      break;
    }

    case 'finish-solo-quiz': {
      const quiz = state.quizzes.find((q) => q.id === state.practice.quizId) || getActiveQuiz();
      const total = quiz.questions.length;
      let correct = 0;
      const missed = [];

      quiz.questions.forEach((q, idx) => {
        const chosen = state.practice.answers[idx];
        if (chosen === q.answer) {
          correct++;
        } else {
          missed.push({
            number: idx + 1,
            prompt: q.prompt,
            yourAnswer: chosen !== undefined ? q.choices[chosen] : 'Not answered',
            correctAnswer: q.choices[q.answer],
            explanation: q.explanation || 'Review this concept in your source notes.'
          });
        }
      });

      const scorePct = Math.round((correct / total) * 100);
      const elapsedSec = Math.max(45, Math.round((Date.now() - (state.practice.startedAt || Date.now())) / 1000));
      const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const ss = String(elapsedSec % 60).padStart(2, '0');
      const prevAttempt = state.history.find((h) => h.quizId === quiz.id);
      const diff = prevAttempt ? scorePct - prevAttempt.scorePct : 20;
      const deltaPts = `${diff >= 0 ? '+' : ''}${diff} pts`;

      const newAttempt = {
        id: 'att-' + Date.now(),
        quizId: quiz.id,
        quizTitle: quiz.title,
        dateLabel: 'Just now',
        scorePct,
        correct,
        total,
        duration: `${mm}:${ss}`,
        deltaPts,
        missed
      };

      quiz.lastScore = scorePct;
      quiz.updated = 'Today';
      state.history.unshift(newAttempt);
      state.results.activeAttemptId = newAttempt.id;
      state.results.showAllAnswers = false;
      persist();
      toast(`Quiz completed! Score: ${scorePct}% (${correct}/${total})`);
      location.hash = 's5';
      break;
    }

    case 'toggle-all-answers':
      state.results.showAllAnswers = !state.results.showAllAnswers;
      render();
      break;

    case 'view-attempt':
      state.results.activeAttemptId = target.dataset.attemptId;
      state.results.showAllAnswers = false;
      render();
      $('#main')?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'copy-pin':
      navigator.clipboard?.writeText(state.live.pin.replace(/\s+/g, '')).catch(() => {});
      toast(`Room PIN ${state.live.pin} copied to clipboard.`);
      break;

    case 'copy-invite-link':
      navigator.clipboard?.writeText(location.origin + location.pathname + '#s6').catch(() => {});
      toast('Invite link copied to clipboard.');
      break;

    case 'advance-live-round': {
      const liveQuiz = state.quizzes.find((q) => q.id === state.live.quizId) || getActiveQuiz();
      const totalRounds = liveQuiz.questions.length;
      if (state.live.round < totalRounds) {
        state.live.round++;
        state.live.players.forEach((p, idx) => {
          const gotIt = (state.live.round + idx) % 4 !== 0;
          if (gotIt) {
            p.correct = Math.min(state.live.round, p.correct + 1);
            p.points += 650 + (3 - (idx % 3)) * 90;
          }
        });
        toast(`Advanced to Round ${state.live.round} of ${totalRounds}.`);
      } else {
        state.live.round = 1;
        state.live.players.forEach((p, idx) => {
          p.correct = 1;
          p.points = 850 - idx * 60;
        });
        toast('Restarted live game rounds.');
      }
      render();
      break;
    }

    case 'select-settings-tab':
      state.settings.tab = target.dataset.tab || 'Profile';
      render();
      break;

    case 'toggle-setting': {
      const key = target.dataset.key;
      if (key && key in state.settings) {
        state.settings[key] = !state.settings[key];
        persist();
        render();
      }
      break;
    }

    case 'save-settings': {
      const nameInput = $('#settings-display-name');
      const emailInput = $('#settings-email');
      const qSelect = $('#settings-default-q');
      const diffSelect = $('#settings-difficulty');
      const langSelect = $('#settings-language');

      if (nameInput) state.settings.displayName = nameInput.value.trim() || 'Alex M.';
      if (emailInput) state.settings.email = emailInput.value.trim() || 'alex.m@example.com';
      if (qSelect) {
        state.settings.defaultQuestions = Number(qSelect.value);
        state.upload.questionCount = Number(qSelect.value);
      }
      if (diffSelect) state.settings.difficulty = diffSelect.value;
      if (langSelect) state.settings.language = langSelect.value;

      persist();
      toast('Preferences saved.');
      render();
      break;
    }

    case 'export-user-data': {
      const blob = new Blob([JSON.stringify({ quizzes: state.quizzes, history: state.history, settings: state.settings }, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autoquiz-study-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('Exported study data JSON.');
      break;
    }

    case 'delete-account-prompt':
      openModal(
        'Reset local prototype data?',
        `<p class="page-subtitle" style="margin-bottom:16px">This will reset your saved quizzes, attempt history, and preferences back to the initial demo state.</p>
         <div class="btn-row">
           <button type="button" class="btn" data-action="close-modal">Cancel</button>
           <button type="button" class="btn btn-danger" data-action="confirm-reset-data">Reset data</button>
         </div>`
      );
      break;

    case 'confirm-reset-data':
      localStorage.removeItem(STORAGE_KEY);
      state.quizzes = structuredClone(SEED_QUIZZES);
      state.history = structuredClone(SEED_HISTORY);
      state.activeQuizId = 'biology';
      closeModal();
      toast('Prototype data reset to defaults.');
      location.hash = 's1';
      render();
      break;
  }
});

// Skip link accessibility handler
document.querySelector('.skip')?.addEventListener('click', (e) => {
  e.preventDefault();
  $('#main')?.focus();
});

window.addEventListener('hashchange', () => {
  closeModal();
  render(true);
});

// Initial render
render();
