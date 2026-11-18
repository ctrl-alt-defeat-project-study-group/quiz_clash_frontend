import type { QuizItem, AttemptRecord, LivePlayer, UserSettings } from '../types/quiz';

export const SEED_QUIZZES: QuizItem[] = [
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
        id: 'q_1',
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
        id: 'q_2',
        prompt: 'Which organelle is responsible for producing most of the cell’s ATP?',
        choices: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'],
        answer: 1,
        explanation: 'Mitochondria generate ATP through cellular respiration.'
      },
      {
        id: 'q_3',
        prompt: 'Which cell structure synthesizes proteins?',
        choices: ['Ribosome', 'Vacuole', 'Cell wall', 'Chloroplast'],
        answer: 0,
        explanation: 'Ribosomes translate mRNA into polypeptide chains (proteins).'
      },
      {
        id: 'q_4',
        prompt: 'Which structure contains most of a cell’s genetic material?',
        choices: ['Cell membrane', 'Nucleus', 'Ribosome', 'Cytoplasm'],
        answer: 1,
        explanation: 'The nucleus houses the cell’s DNA and coordinates cellular activities.'
      },
      {
        id: 'q_5',
        prompt: 'Where does photosynthesis take place in plant cells?',
        choices: ['Mitochondria', 'Chloroplasts', 'Nucleolus', 'Endoplasmic reticulum'],
        answer: 1,
        explanation: 'Chloroplasts capture light energy to convert carbon dioxide and water into glucose.'
      },
      {
        id: 'q_6',
        prompt: 'Which organelle modifies, sorts, and packages proteins for secretion?',
        choices: ['Golgi apparatus', 'Peroxisome', 'Centrosome', 'Cytoskeleton'],
        answer: 0,
        explanation: 'The Golgi apparatus processes proteins received from the endoplasmic reticulum.'
      },
      {
        id: 'q_7',
        prompt: 'What gives a plant cell structural support?',
        choices: ['Cell membrane', 'Cell wall', 'Cytoplasm', 'Nucleoplasm'],
        answer: 1,
        explanation: 'The rigid cellulose cell wall provides strength and structural support.'
      },
      {
        id: 'q_8',
        prompt: 'Which organelle contains digestive enzymes to break down waste?',
        choices: ['Lysosome', 'Ribosome', 'Centriole', 'Plastid'],
        answer: 0,
        explanation: 'Lysosomes contain hydrolytic enzymes for intracellular digestion.'
      },
      {
        id: 'q_9',
        prompt: 'What jelly-like fluid fills the cell and suspends organelles?',
        choices: ['Cytosol / Cytoplasm', 'Matrix', 'Stroma', 'Nucleoplasm'],
        answer: 0,
        explanation: 'Cytoplasm (cytosol) surrounds organelles and is the site of many metabolic reactions.'
      },
      {
        id: 'q_10',
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
        id: 'q_1',
        prompt: 'Where did the European Renaissance begin in the 14th century?',
        choices: ['Italy', 'Norway', 'Portugal', 'Scotland'],
        answer: 0,
        explanation: 'Italian city-states such as Florence and Venice were centers of Renaissance trade and art.'
      },
      {
        id: 'q_2',
        prompt: 'Which invention by Johannes Gutenberg accelerated the spread of knowledge?',
        choices: ['Steam engine', 'Movable-type printing press', 'Telegraph', 'Compass'],
        answer: 1,
        explanation: 'The movable-type printing press (c. 1440) made books widely accessible across Europe.'
      },
      {
        id: 'q_3',
        prompt: 'Which ancient civilization built Machu Picchu in the Andes?',
        choices: ['Maya', 'Aztec', 'Inca', 'Olmec'],
        answer: 2,
        explanation: 'Machu Picchu was built by the Inca Empire in the 15th century.'
      },
      {
        id: 'q_4',
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
        id: 'q_5',
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
        id: 'q_1',
        prompt: 'What subatomic particles are shared in a covalent bond?',
        choices: ['Protons', 'Electrons', 'Neutrons', 'Positrons'],
        answer: 1,
        explanation: 'Covalent bonds form when atoms share pairs of valence electrons.'
      },
      {
        id: 'q_2',
        prompt: 'What is the atomic number of Carbon?',
        choices: ['4', '6', '8', '12'],
        answer: 1,
        explanation: 'Carbon has 6 protons in its nucleus, giving it atomic number 6.'
      },
      {
        id: 'q_3',
        prompt: 'A solution with a pH of 3 is considered:',
        choices: ['Neutral', 'Acidic', 'Basic / Alkaline', 'Amphoteric'],
        answer: 1,
        explanation: 'Solutions with pH below 7 are acidic; above 7 are basic.'
      },
      {
        id: 'q_4',
        prompt: 'Which gas makes up approximately 78% of Earth’s atmosphere?',
        choices: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'],
        answer: 2,
        explanation: 'Dry air is roughly 78% nitrogen (N₂) and 21% oxygen (O₂).'
      },
      {
        id: 'q_5',
        prompt: 'An ionic bond typically forms between:',
        choices: ['Two noble gases', 'A metal and a nonmetal', 'Two identical nonmetals', 'Two neutrons'],
        answer: 1,
        explanation: 'Metals transfer electrons to nonmetals, creating oppositely charged ions.'
      }
    ]
  }
];

export const SEED_HISTORY: AttemptRecord[] = [
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

export const INITIAL_LIVE_PLAYERS: LivePlayer[] = [
  { name: 'Maya', status: 'Ready', correct: 3, total: 3, points: 2480 },
  { name: 'Leo', status: 'Ready', correct: 3, total: 3, points: 2210 },
  { name: 'Nina', status: 'Ready', correct: 2, total: 3, points: 2050 },
  { name: 'Sam', status: 'Ready', correct: 2, total: 3, points: 1840 }
];

export const DEFAULT_SETTINGS: UserSettings = {
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
};

export const SAMPLE_CSV_CONTENT = `term,definition
Cell membrane,Regulates movement of substances into and out of the cell
Mitochondrion,Produces most of the cell's ATP through cellular respiration
Ribosome,Synthesizes proteins from mRNA instructions
Nucleus,Contains most of a cell's genetic material (DNA)
Chloroplast,Captures light energy for photosynthesis in plant cells
Golgi apparatus,Modifies sorts and packages proteins for secretion
Cell wall,Provides rigid structural support to plant cells
Lysosome,Contains digestive enzymes to break down cellular waste
Cytoplasm,Jelly-like fluid that fills the cell and suspends organelles
Endoplasmic reticulum,Network of membranes assisting in protein and lipid synthesis`;
