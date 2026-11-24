import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Library, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageLoader, ThemeSwitch, UserAvatar } from '../common';
import { Progress } from '@/components/ui/progress';
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
    user,
    quizzes,
    activeQuizId,
    activeQuiz,
    setActiveQuizId,
    settings,
    updateSettings,
    printKind,
    t
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const path = location.pathname;
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [prevPath, setPrevPath] = useState(path);

  if (prevPath !== path) {
    setPrevPath(path);
    if (drawerOpen) setDrawerOpen(false);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.scrollTo(0, 0);
  }, [path]);

  useEffect(() => {
    const mainEl = mainRef.current;

    const updateProgress = () => {
      const isMainScrolling =
        mainEl &&
        mainEl.scrollHeight > mainEl.clientHeight + 2 &&
        window.getComputedStyle(mainEl).overflowY !== 'visible';

      const scrollTop = isMainScrolling ? mainEl.scrollTop : window.scrollY;
      const maxScroll = isMainScrolling
        ? mainEl.scrollHeight - mainEl.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      const pct =
        maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
      setScrollProgress(pct);
    };

    const rafId = window.requestAnimationFrame(updateProgress);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    mainEl?.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      mainEl?.removeEventListener('scroll', updateProgress);
    };
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
        path.startsWith('/rooms') ||
        path.startsWith('/leaderboard') ||
        path === '/s6' ||
        path === '/s7'
      );
    if (section === 's8') return path.startsWith('/settings') || path === '/s8';
    return false;
  };

  const letters = ['A', 'B', 'C', 'D'];

  const renderNavigationSections = (isMobile: boolean) => {
    const idPrefix = isMobile ? 'mobile' : 'desktop';
    const libraryListId = `${idPrefix}-library-list`;

    return (
      <>
        <div className="nav-group">
          <div className="nav-heading" data-name={isMobile ? undefined : 'WORKSPACE'}>
            {t('nav.workspace')}
          </div>
          <nav className="nav-list" aria-label={isMobile ? 'Mobile Primary' : 'Primary'}>
            <Link
              to="/dashboard"
              className={`nav-link ${isNavActive('s1') ? 'active' : ''}`}
              aria-current={isNavActive('s1') ? 'page' : undefined}
              onClick={isMobile ? () => setDrawerOpen(false) : undefined}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              to="/generate"
              className={`nav-link ${isNavActive('s2') ? 'active' : ''}`}
              aria-current={isNavActive('s2') ? 'page' : undefined}
              onClick={isMobile ? () => setDrawerOpen(false) : undefined}
            >
              {t('nav.generateQuiz')}
            </Link>
            <Link
              to="/history"
              className={`nav-link ${isNavActive('s5') ? 'active' : ''}`}
              aria-current={isNavActive('s5') ? 'page' : undefined}
              onClick={isMobile ? () => setDrawerOpen(false) : undefined}
            >
              {t('nav.attemptHistory')}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`nav-link ${path.startsWith('/admin') ? 'active' : ''}`}
                aria-current={path.startsWith('/admin') ? 'page' : undefined}
                onClick={isMobile ? () => setDrawerOpen(false) : undefined}
              >
                {t('nav.adminPanel')}
              </Link>
            )}
          </nav>
        </div>

        <div className="nav-divider" role="separator"></div>

        <div className="nav-group">
          <div className="nav-library-header">
            <button
              type="button"
              className={`nav-dropdown-trigger ${libraryOpen ? 'is-open' : ''}`}
              data-name={isMobile ? undefined : 'YOUR LIBRARY'}
              aria-expanded={libraryOpen}
              aria-controls={libraryListId}
              onClick={() => setLibraryOpen((prev) => !prev)}
            >
              <span>{t('nav.yourLibrary')}</span>
              <ChevronDown size={14} className="nav-dropdown-chevron" aria-hidden="true" />
            </button>
            <Link
              to="/quizzes"
              className={`nav-library-icon-btn ${
                path === '/quizzes' || path === '/s3' ? 'active' : ''
              }`}
              aria-label={t('nav.myQuizzes')}
              aria-current={path === '/quizzes' || path === '/s3' ? 'page' : undefined}
              title={t('nav.myQuizzes')}
              onClick={isMobile ? () => setDrawerOpen(false) : undefined}
            >
              <Library size={15} aria-hidden="true" />
            </Link>
          </div>
          <div id={libraryListId} className={`nav-collapse ${libraryOpen ? 'is-open' : ''}`}>
            <div className="nav-collapse-inner">
              <div className="library-list" aria-label={t('nav.savedQuizzesAria')}>
                {quizzes.slice(0, 4).map((q) => {
                  const isSelected = path.startsWith('/quizzes/') && q.id === activeQuizId;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`library-item ${isSelected ? 'active-quiz' : ''}`}
                      onClick={() => {
                        setActiveQuizId(q.id);
                        navigate(`/quizzes/${encodeURIComponent(q.id)}`);
                        if (isMobile) setDrawerOpen(false);
                      }}
                    >
                      {q.sidebarTitle || q.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <button
              type="button"
              className="sidebar-profile-card"
              onClick={() => {
                updateSettings({ tab: 'Profile' });
                if (!isNavActive('s8')) {
                  navigate('/settings');
                }
                if (isMobile) setDrawerOpen(false);
              }}
            >
              <UserAvatar
                avatarUrl={user?.avatar_url ?? settings.avatarUrl}
                alt={user?.display_name || settings.displayName || t('auth.signIn')}
                className="sidebar-avatar"
              />
              <span className="sidebar-profile-meta">
                <span className="sidebar-profile-name">
                  {user?.display_name || settings.displayName || t('auth.signIn')}
                </span>
                <span className="sidebar-profile-sub">
                  {user ? user.email : t('auth.notSignedInCaption')}
                </span>
              </span>
            </button>

            <Link
              to="/settings"
              className={`sidebar-settings-icon-btn ${isNavActive('s8') ? 'active' : ''}`}
              aria-label={t('nav.helpSettings')}
              aria-current={isNavActive('s8') ? 'page' : undefined}
              title={t('nav.helpSettings')}
              onClick={isMobile ? () => setDrawerOpen(false) : undefined}
            >
              <Settings size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </>
    );
  };

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
        {t('nav.skipToContent')}
      </a>

      <div className="app-frame">
        {/* Sticky Top Application Header */}
        <header className="app-header" data-name="Application header">
          <div className="header-left">
            <Link className="brand" to="/" data-name="QuizClash">
              <span className="brand-mark" aria-hidden="true"></span>
              <span>QuizClash</span>
            </Link>
            <span className="brand-tagline" data-name="Study notes → active recall">
              {t('nav.tagline')}
            </span>
          </div>

          <div className="header-right">
            <ThemeSwitch variant="header" />
            {!user && (
              <Link to="/login" className="btn btn-sm btn-primary">
                {t('auth.signIn')}
              </Link>
            )}
            <Link to="/lobby" className="btn btn-sm header-join-btn" data-name="Quiz game">
              <span className="join-full-text">{t('nav.joinGame')}</span>
              <span className="join-short-text">{t('nav.joinShort')}</span>
            </Link>
            <Link
              to={user ? '/settings' : '/login'}
              className="user-badge"
              data-name="User profile"
              title={user?.display_name || settings.displayName || t('auth.signIn')}
              aria-label={user?.display_name || settings.displayName || t('auth.signIn')}
            >
              <UserAvatar
                avatarUrl={user?.avatar_url ?? settings.avatarUrl}
                alt={user?.display_name || settings.displayName || t('auth.signIn')}
                className="header-avatar"
              />
            </Link>

            <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  type="button"
                  className="btn btn-sm mobile-hamburger-btn"
                  aria-label={t('nav.openMenuAria')}
                  title={t('nav.openMenuTitle')}
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
                        aria-label={t('nav.closeMenuAria')}
                      >
                        ✕
                      </button>
                    </DrawerClose>
                  </div>
                  <DrawerTitle className="visually-hidden">
                    {t('nav.navigationMenu')}
                  </DrawerTitle>
                  <DrawerDescription className="mobile-drawer-tagline">
                    {t('nav.tagline')}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="mobile-drawer-body">
                  {renderNavigationSections(true)}
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <Progress
            value={scrollProgress}
            className="app-scroll-progress !h-[3px] !rounded-none bg-transparent"
            aria-label="Page scroll progress"
          />
        </header>

        {/* Workspace Container */}
        <div className="workspace" data-name="Workspace">
          {/* Left Sidebar Navigation (Hidden on Mobile) */}
          <aside
            id="workspace-sidebar"
            className="sidebar"
            data-name="Navigation"
            aria-label={t('nav.workspaceNavAria')}
          >
            {renderNavigationSections(false)}
          </aside>

          {/* Right Scrollable Main Panel */}
          <main id="main" ref={mainRef} className="main-panel" data-name="Main panel" tabIndex={-1}>
            <Suspense fallback={<PageLoader variant="panel" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      {/* Printable Study Sheet (Visible only in @media print) */}
      {activeQuiz && (
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
              {printKind === 'answers'
                ? t('print.answerKeyHeader')
                : t('print.studySheetHeader')}
            </div>
            <h1>{activeQuiz.title}</h1>
            {printKind === 'questions' ? (
              <p>{t('print.nameDateLine')}</p>
            ) : (
              <p>
                {t('print.metaSummary', {
                  count: activeQuiz.questions.length,
                  source: activeQuiz.source
                })}
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
                    {t('print.correctAnswerLabel')}{' '}
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
      )}
    </>
  );
};
