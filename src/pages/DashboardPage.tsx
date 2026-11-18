import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatCard } from '../components/common';

export const DashboardPage: React.FC = () => {
  const { quizzes, history, activeQuiz, practice, setActiveQuizId } = useApp();
  const navigate = useNavigate();

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.scorePct, 0) / history.length)
    : 82;
  const savedCount = Math.max(12, quizzes.length);
  const completedCount = Math.max(28, history.length);
  const answeredCount = Object.keys(practice.answers).length;

  return (
    <>
      <PageHeader
        eyebrow="YOUR STUDY SPACE / 01"
        title="Turn your notes into knowledge."
        subtitle="Generate a quiz, practice at your pace, or challenge your friends."
        actions={
          <Link to="/generate" className="btn btn-primary">
            + Create a quiz
          </Link>
        }
      />

      <section className="stat-grid-3" data-name="Study overview" aria-label="Study overview">
        <StatCard value={savedCount} label="Saved quizzes" />
        <StatCard value={completedCount} label="Completed attempts" />
        <StatCard value={`${avgScore}%`} label="Average score" />
      </section>

      <SectionCard className="banner-row" dataName="Start from a document">
        <div>
          <h2>Your next quiz starts with your notes.</h2>
          <p>
            Upload a PDF, Word, CSV, or text file. Get multiple-choice questions ready to study
            or print.
          </p>
        </div>
        <Link to="/generate" className="btn btn-primary">
          Upload study material
        </Link>
      </SectionCard>

      <SectionCard
        title="Recent quizzes"
        headerRight={
          <Link to="/quizzes" className="text-link">
            View all quizzes →
          </Link>
        }
        dataName="Recent quizzes"
      >
        <div className="table-wrap">
          <table className="data-table">
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
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td>
                    <strong>{q.title}</strong>
                  </td>
                  <td>{q.questions.length} questions</td>
                  <td>
                    <span className="score-badge">{q.lastScore ?? 80}%</span>
                  </td>
                  <td>{q.updated || 'Today'}</td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setActiveQuizId(q.id);
                        navigate(`/quizzes/${encodeURIComponent(q.id)}`);
                      }}
                    >
                      Open quiz →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <section className="grid-2-equal" data-name="Continue learning">
        <div className="box-card continue-card" data-name="Resume studying">
          <div>
            <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
            <h3>{activeQuiz.title}</h3>
            <p className="page-subtitle">
              Question {Math.min(practice.questionIndex + 1, activeQuiz.questions.length)} of{' '}
              {activeQuiz.questions.length} ·{' '}
              {answeredCount ? 'Practice in progress' : 'Ready to start'}
            </p>
          </div>
          <div className="btn-row">
            <Link to="/play" className="btn btn-primary">
              Continue quiz →
            </Link>
          </div>
        </div>

        <div className="box-card continue-card" data-name="Multiplayer shortcut">
          <div>
            <div className="eyebrow">STUDY TOGETHER</div>
            <h3>Make revision a friendly competition.</h3>
            <p className="page-subtitle">
              Host a room or enter a PIN to join your friends.
            </p>
          </div>
          <div className="btn-row">
            <Link to="/lobby" className="btn btn-primary">
              Host a game
            </Link>
            <Link to="/lobby" className="btn">
              Join with PIN
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
