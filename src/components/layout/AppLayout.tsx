import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ThemeSwitch } from '../common';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../ui/drawer';

export const AppLayout: React.FC = () => {
  const {
    quizzes,
    activeQuizId,
    activeQuiz,
    setActiveQuizId,
    settings,
    printKind
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const path = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.scrollTo(0, 0);
    setDrawerOpen(false);
  }, [path]);

  const isNavActive = (section: 's1' | 's2' | 's3' | 's5' | 's6' | 's8'): boolean => {
    if (section === 's1') return path === '/dashboard' || path === '/' || path === '/s1';
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
            <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="btn btn-sm mobile-hamburger-btn"
                  aria-label="Open navigation menu"
                  title="Open menu"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </DrawerTrigger>

              <DrawerContent className="mobile-drawer-content">
                <DrawerHeader className="mobile-drawer-header">
                  <div className="mobile-drawer-brand-row">
                    <Link
                      className="brand"
                      to="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span className="brand-mark" aria-hidden="true"></span>
                      <span>QuizClash</span>
                    </Link>
                    <DrawerClose asChild>
                      <button
                        type="button"
                        className="btn btn-sm mobile-drawer-close-btn"
                        aria-label="Close navigation menu"
                      >
                        ✕
                      </button>
                    </DrawerClose>
                  </div>
                  <DrawerTitle className="visually-hidden">Navigation Menu</DrawerTitle>
                  <DrawerDescription className="mobile-drawer-tagline">
                    Study notes → active recall
                  </DrawerDescription>
                </DrawerHeader>

                <div className="mobile-drawer-body">
                  <div className="nav-group">
                    <div className="nav-heading">WORKSPACE</div>
                    <nav className="nav-list" aria-label="Mobile Primary">
                      <Link
                        to="/dashboard"
                        className={`nav-link ${isNavActive('s1') ? 'active' : ''}`}
                        aria-current={isNavActive('s1') ? 'page' : undefined}
                        onClick={() => setDrawerOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/generate"
                        className={`nav-link ${isNavActive('s2') ? 'active' : ''}`}
                        aria-current={isNavActive('s2') ? 'page' : undefined}
                        onClick={() => setDrawerOpen(false)}
                      >
                        Generate quiz
                      </Link>
                      <Link
                        to="/quizzes"
                        className={`nav-link ${isNavActive('s3') ? 'active' : ''}`}
                        aria-current={isNavActive('s3') ? 'page' : undefined}
                        onClick={() => setDrawerOpen(false)}
                      >
                        My quizzes
                      </Link>
                      <Link
                        to="/history"
                        className={`nav-link ${isNavActive('s5') ? 'active' : ''}`}
                        aria-current={isNavActive('s5') ? 'page' : undefined}
                        onClick={() => setDrawerOpen(false)}
                      >
                        Attempt history
                      </Link>
                      <Link
                        to="/lobby"
                        className={`nav-link ${isNavActive('s6') ? 'active' : ''}`}
                        aria-current={isNavActive('s6') ? 'page' : undefined}
                        onClick={() => setDrawerOpen(false)}
                      >
                        Live games
                      </Link>
                    </nav>
                  </div>

                  <div className="nav-divider" role="separator"></div>

                  <div className="nav-group">
                    <div className="nav-heading">YOUR LIBRARY</div>
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
                              setDrawerOpen(false);
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
                      onClick={() => setDrawerOpen(false)}
                    >
                      Help &amp; settings
                    </Link>
                    <div className="wireframe-caption">QuizClash Workspace</div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <Link className="brand" to="/dashboard" data-name="QuizClash">
              <span className="brand-mark" aria-hidden="true"></span>
              <span>QuizClash</span>
            </Link>
            <span className="brand-tagline" data-name="Study notes → active recall">
              Study notes → active recall
            </span>
          </div>

          <div className="header-right">
            <ThemeSwitch variant="header" />
            <Link to="/lobby" className="btn btn-sm header-join-btn" data-name="Join game">
              <span className="join-full-text">Join game</span>
              <span className="join-short-text">Join</span>
            </Link>
            <Link to="/settings" className="user-badge" data-name="Alex M.">
              {settings.displayName || 'Alex M.'}
            </Link>
          </div>
        </header>

        {/* Workspace Container */}
        <div className="workspace" data-name="Workspace">
          {/* Left Sidebar Navigation (Hidden on Mobile) */}
          <aside
            id="workspace-sidebar"
            className="sidebar"
            data-name="Navigation"
            aria-label="Workspace navigation"
          >
            <div className="nav-group">
              <div className="nav-heading" data-name="WORKSPACE">
                WORKSPACE
              </div>
              <nav className="nav-list" aria-label="Primary">
                <Link
                  to="/dashboard"
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
              <div className="wireframe-caption">QuizClash Workspace</div>
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
            QuizClash ·{' '}
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
    </>
  );
};
