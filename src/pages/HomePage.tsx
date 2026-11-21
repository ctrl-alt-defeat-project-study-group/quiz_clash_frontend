import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LanguageSwitch } from '../components/common';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '../components/ui/drawer';

type HomeNavTab = 'overview' | 'features' | 'how-it-works';

const HOME_SECTIONS: { id: HomeNavTab; elementId: string }[] = [
  { id: 'overview', elementId: 'home-overview' },
  { id: 'features', elementId: 'home-features' },
  { id: 'how-it-works', elementId: 'home-how-it-works' }
];

export const HomePage: React.FC = () => {
  const { user, t } = useApp();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<HomeNavTab>('overview');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const frameEl = frameRef.current;

    const handleScroll = () => {
      const isFrameScrolling =
        frameEl &&
        frameEl.scrollHeight > frameEl.clientHeight + 2 &&
        window.getComputedStyle(frameEl).overflowY !== 'visible';

      const scrollTop = isFrameScrolling ? frameEl.scrollTop : window.scrollY;
      const maxScroll = isFrameScrolling
        ? frameEl.scrollHeight - frameEl.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
      setScrollProgress(pct);

      if (pct >= 98) {
        setActiveTab('how-it-works');
        return;
      }

      const threshold = 140;
      let current: HomeNavTab = 'overview';
      for (const sec of HOME_SECTIONS) {
        const el = document.getElementById(sec.elementId);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = sec.id;
        }
      }
      setActiveTab(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    frameEl?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      frameEl?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (tab: HomeNavTab, sectionId: string) => {
    setActiveTab(tab);
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={frameRef} className="home-frame">
      {/* Top Navigation Bar + Page Scroll Progress */}
      <div className="home-sticky-nav">
        <header className="home-header" data-name="Home top navigation">
        <Link className="brand home-mobile-brand" to="/" data-name="QuizClash">
          <span className="brand-mark" aria-hidden="true"></span>
          <span>QuizClash</span>
        </Link>

        <nav className="home-top-tabs" aria-label={t('home.primaryNavAria')}>
          <button
            type="button"
            className={`home-top-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('overview', 'home-overview')}
          >
            {t('home.tabOverview')}
          </button>
          <button
            type="button"
            className={`home-top-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => scrollToSection('features', 'home-features')}
          >
            {t('home.tabFeatures')}
          </button>
          <button
            type="button"
            className={`home-top-tab ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => scrollToSection('how-it-works', 'home-how-it-works')}
          >
            {t('home.tabHowItWorks')}
          </button>
        </nav>

        <div className="home-header-actions">
          <LanguageSwitch />
          {user ? (
            <Link to="/dashboard" className="btn btn-sm btn-primary home-desktop-cta">
              {t('nav.dashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm home-desktop-cta">
                {t('auth.signIn')}
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary home-desktop-cta">
                {t('auth.signUp')}
              </Link>
            </>
          )}
          <Drawer direction="right" open={menuOpen} onOpenChange={setMenuOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="btn btn-sm home-hamburger-btn"
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
                  <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
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
                <nav className="nav-list" aria-label={t('home.mobileNavAria')}>
                  <button
                    type="button"
                    className={`nav-link home-drawer-btn ${
                      activeTab === 'overview' ? 'active' : ''
                    }`}
                    onClick={() => scrollToSection('overview', 'home-overview')}
                  >
                    {t('home.tabOverview')}
                  </button>
                  <button
                    type="button"
                    className={`nav-link home-drawer-btn ${
                      activeTab === 'features' ? 'active' : ''
                    }`}
                    onClick={() => scrollToSection('features', 'home-features')}
                  >
                    {t('home.tabFeatures')}
                  </button>
                  <button
                    type="button"
                    className={`nav-link home-drawer-btn ${
                      activeTab === 'how-it-works' ? 'active' : ''
                    }`}
                    onClick={() => scrollToSection('how-it-works', 'home-how-it-works')}
                  >
                    {t('home.tabHowItWorks')}
                  </button>
                </nav>

                <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="btn btn-primary w-full"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="btn btn-primary w-full"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('auth.signIn')}
                      </Link>
                      <Link
                        to="/register"
                        className="btn w-full"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('auth.signUp')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        </header>
        <Progress
          value={scrollProgress}
          className="home-scroll-progress !h-[3px] !rounded-none bg-transparent"
          aria-label={t('home.scrollProgressAria')}
        />
      </div>

      {/* Main Landing Content */}
      <main className="home-main">
        {/* Hero */}
        <section id="home-overview" className="home-hero box-card">
          <div className="eyebrow">{t('home.heroEyebrow')}</div>
          <h1 className="home-hero-title">
            {t('home.heroTitle')}
          </h1>
          <p className="home-hero-subtitle">
            {t('home.heroSubtitle')}
          </p>
          <div className="btn-row">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary">
                  {t('home.openWorkspaceBtn')}
                </Link>
                <Link to="/generate" className="btn">
                  {t('home.createQuizBtn')}
                </Link>
                <Link to="/lobby" className="btn">
                  {t('home.joinLiveGameBtn')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  {t('auth.signUp')}
                </Link>
                <Link to="/login" className="btn">
                  {t('auth.signIn')}
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section id="home-features" className="home-section">
          <div className="home-section-head">
            <div className="eyebrow">{t('home.featuresEyebrow')}</div>
            <h2 className="section-title">{t('home.featuresTitle')}</h2>
          </div>

          <div className="home-grid-3">
            <article className="box-card home-feature-card">
              <div className="home-step-badge">{t('home.feature01Num')}</div>
              <h3>{t('home.feature01Title')}</h3>
              <p className="helper-text">
                {t('home.feature01Desc')}
              </p>
            </article>

            <article className="box-card home-feature-card">
              <div className="home-step-badge">{t('home.feature02Num')}</div>
              <h3>{t('home.feature02Title')}</h3>
              <p className="helper-text">
                {t('home.feature02Desc')}
              </p>
            </article>

            <article className="box-card home-feature-card">
              <div className="home-step-badge">{t('home.feature03Num')}</div>
              <h3>{t('home.feature03Title')}</h3>
              <p className="helper-text">
                {t('home.feature03Desc')}
              </p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section id="home-how-it-works" className="home-section">
          <div className="home-section-head">
            <div className="eyebrow">{t('home.howItWorksEyebrow')}</div>
            <h2 className="section-title">{t('home.howItWorksTitle')}</h2>
          </div>

          <div className="home-grid-3">
            <article className="box-subtle home-step-card">
              <div className="eyebrow">{t('home.step01Eyebrow')}</div>
              <h3>{t('home.step01Title')}</h3>
              <p className="helper-text">
                {t('home.step01Desc')}
              </p>
            </article>

            <article className="box-subtle home-step-card">
              <div className="eyebrow">{t('home.step02Eyebrow')}</div>
              <h3>{t('home.step02Title')}</h3>
              <p className="helper-text">
                {t('home.step02Desc')}
              </p>
            </article>

            <article className="box-subtle home-step-card">
              <div className="eyebrow">{t('home.step03Eyebrow')}</div>
              <h3>{t('home.step03Title')}</h3>
              <p className="helper-text">
                {t('home.step03Desc')}
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span className="helper-text">{t('home.footerTagline')}</span>
        {user ? (
          <Link to="/dashboard" className="text-link">
            {t('home.goToDashboard')}
          </Link>
        ) : (
          <Link to="/login" className="text-link">
            {t('auth.signIn')} →
          </Link>
        )}
      </footer>
    </div>
  );
};
