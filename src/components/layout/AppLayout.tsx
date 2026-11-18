import React, { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const {
    theme,
    toggleTheme,
    quizzes,
    activeQuizId,
    activeQuiz,
    setActiveQuizId,
    settings,
    printKind,
    toastMessage,
    modal,
    closeModal
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const path = location.pathname;

  const isNavActive = (section: 's1' | 's2' | 's3' | 's5' | 's6' | 's8'): boolean => {
    if (section === 's1') return path === '/' || path === '/s1';
    if (section === 's2') return path.startsWith('/generate') || path === '/s2';
    if (section === 's3')
      return (
        path.startsWith('/quizzes') ||
        path.startsWith('/play') ||
        path === '/s3' ||
        path === '/s4'
      );
    if (section === 's5')
      return (
        path.startsWith('/history') ||
        path.startsWith('/results') ||
        path.startsWith('/attempts') ||
        path === '/s5'
      );
    if (section === 's6')
      return (
        path.startsWith('/lobby') ||
        path.startsWith('/leaderboard') ||
        path === '/s6' ||
        path === '/s7'
      );
    if (section === 's8') return path.startsWith('/settings') || path === '/s8';
    return false;
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <div className="app-frame">
        {/* Sticky Top Application Header */}
        <header className="app-header" data-name="Application header">
          <div className="header-left">
            <Link className="brand" to="/" data-name="AUTOQUIZ">
              <span className="brand-mark" aria-hidden="true"></span>
              <span>AUTOQUIZ</span>
            </Link>
            <span className="brand-tagline" data-name="Study notes → active recall">
              Study notes → active recall
            </span>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="btn btn-sm theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
            >
              <span>{theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}</span>
            </button>
            <Link to="/lobby" className="btn btn-sm" data-name="Join game">
              Join game
            </Link>
            <Link to="/settings" className="user-badge" data-name="Alex M.">
              {settings.displayName || 'Alex M.'}
            </Link>
          </div>
        </header>

        {/* Workspace Container */}
        <div className="workspace" data-name="Workspace">
          {/* Fixed Non-Scrolling Left Sidebar Navigation */}
          <aside className="sidebar" data-name="Navigation" aria-label="Workspace navigation">
            <div className="nav-group">
              <div className="nav-heading" data-name="WORKSPACE">
                WORKSPACE
              </div>
              <nav className="nav-list" aria-label="Primary">
                <Link
                  to="/"
                  className={`nav-link ${isNavActive('s1') ? 'active' : ''}`}
                  aria-current={isNavActive('s1') ? 'page' : undefined}
                >
                  Dashboard
                </Link>
                <Link
                  to="/generate"
                  className={`nav-link ${isNavActive('s2') ? 'active' : ''}`}
                  aria-current={isNavActive('s2') ? 'page' : undefined}
                >
                  Generate quiz
                </Link>
                <Link
                  to="/quizzes"
                  className={`nav-link ${isNavActive('s3') ? 'active' : ''}`}
                  aria-current={isNavActive('s3') ? 'page' : undefined}
                >
                  My quizzes
                </Link>
                <Link
                  to="/history"
                  className={`nav-link ${isNavActive('s5') ? 'active' : ''}`}
                  aria-current={isNavActive('s5') ? 'page' : undefined}
                >
                  Attempt history
                </Link>
                <Link
                  to="/lobby"
                  className={`nav-link ${isNavActive('s6') ? 'active' : ''}`}
                  aria-current={isNavActive('s6') ? 'page' : undefined}
                >
                  Live games
                </Link>
              </nav>
            </div>

            <div className="nav-divider" role="separator"></div>

            <div className="nav-group">
              <div className="nav-heading" data-name="YOUR LIBRARY">
                YOUR LIBRARY
              </div>
              <div className="library-list" aria-label="Saved quizzes">
                {quizzes.slice(0, 4).map((q) => {
                  const isSelected =
                    (path.startsWith('/quizzes') || path === '/s3') &&
                    q.id === activeQuizId;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`library-item ${isSelected ? 'active-quiz' : ''}`}
                      onClick={() => {
                        setActiveQuizId(q.id);
                        navigate('/quizzes');
                      }}
                    >
                      {q.sidebarTitle || q.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sidebar-footer">
              <Link
                to="/settings"
                className={`nav-link settings-link ${isNavActive('s8') ? 'active' : ''}`}
                aria-current={isNavActive('s8') ? 'page' : undefined}
              >
                Help &amp; settings
              </Link>
              <div className="wireframe-caption">AutoQuiz Workspace</div>
            </div>
          </aside>

          {/* Right Scrollable Main Panel */}
          <main id="main" ref={mainRef} className="main-panel" data-name="Main panel" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Printable Study Sheet (Visible only in @media print) */}
      <section className="print-sheet" aria-hidden="true">
        <div
          style={{
            borderBottom: '2px solid #000',
            paddingBottom: 12,
            marginBottom: 20
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase'
            }}
          >
            AUTOQUIZ ·{' '}
            {printKind === 'answers' ? 'SEPARATE ANSWER KEY' : 'OFFLINE STUDY SHEET'}
          </div>
          <h1>{activeQuiz.title}</h1>
          {printKind === 'questions' ? (
            <p>Name: ____________________________ &nbsp;&nbsp;&nbsp; Date: ________________</p>
          ) : (
            <p>
              {activeQuiz.questions.length} multiple-choice questions · Source:{' '}
              {activeQuiz.source}
            </p>
          )}
        </div>
        <ol>
          {activeQuiz.questions.map((q, idx) => (
            <li key={idx}>
              <strong>{q.prompt}</strong>
              <br />
              {printKind === 'answers' ? (
                <span>
                  Correct Answer:{' '}
                  <strong>
                    {letters[q.answer]}. {q.choices[q.answer]}
                  </strong>
                </span>
              ) : (
                q.choices.map((c, cIdx) => (
                  <div key={cIdx}>
                    {letters[cIdx]}. {c}
                  </div>
                ))
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Modal Dialog */}
      {modal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="dialog-head">
              <h2 className="section-title">{modal.title}</h2>
              <button
                type="button"
                className="btn btn-sm"
                onClick={closeModal}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <p className="page-subtitle" style={{ marginBottom: 18 }}>
              {modal.message}
            </p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={closeModal}>
                {modal.onConfirm ? 'Cancel' : 'Got it'}
              </button>
              {modal.onConfirm && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal();
                  }}
                >
                  {modal.confirmLabel || 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  );
};
