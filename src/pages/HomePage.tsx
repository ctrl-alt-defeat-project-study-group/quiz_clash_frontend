import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  CheckSquare,
  ChevronDown,
  FileText,
  Gamepad2,
  LayoutDashboard,
  User,
  Users,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSwitch, UserAvatar } from '../components/common';
import { isValidRoomPin, normalizeRoomPin, ROOM_PIN_EXAMPLE } from '../lib/roomPin';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export const HomePage: React.FC = () => {
  const { user, settings, uiLanguage, t } = useApp();
  const navigate = useNavigate();

  const sampleChoices = [
    { letter: 'A', text: t('home.sampleChoiceA'), correct: false },
    { letter: 'B', text: t('home.sampleChoiceB'), correct: true },
    { letter: 'C', text: t('home.sampleChoiceC'), correct: false },
    { letter: 'D', text: t('home.sampleChoiceD'), correct: false }
  ];

  const workflowSteps = [
    {
      title: t('home.workflowStep1Title'),
      subtitle: t('home.workflowStep1Desc'),
      stageTitle: t('home.workflowStep1Stage'),
      items: [
        {
          icon: 'file' as const,
          heading: t('home.workflowStep1DetailTitle'),
          body: t('home.workflowStep1DetailBody')
        }
      ]
    },
    {
      title: t('home.workflowStep2Title'),
      subtitle: t('home.workflowStep2Desc'),
      stageTitle: t('home.workflowStep2Stage'),
      items: [
        {
          icon: 'check' as const,
          heading: t('home.sampleQuestion'),
          body: t('home.workflowStep2DetailBody')
        }
      ]
    },
    {
      title: t('home.workflowStep3Title'),
      subtitle: t('home.workflowStep3Desc'),
      stageTitle: t('home.workflowStep3Stage'),
      items: [
        {
          icon: 'user' as const,
          heading: t('home.workflowStep3SoloTitle'),
          body: t('home.workflowStep3SoloBody')
        },
        {
          icon: 'users' as const,
          heading: t('home.workflowStep3LiveTitle'),
          body: t('home.workflowStep3LiveBody')
        }
      ]
    }
  ];

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeNav, setActiveNav] = useState<'overview' | 'features' | 'how-it-works'>(
    'overview'
  );
  const [navIndicator, setNavIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0
  });
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [revealedFeatures, setRevealedFeatures] = useState<boolean[]>([
    false,
    false,
    false
  ]);
  const [revealedSteps, setRevealedSteps] = useState<boolean[]>([false, false, false]);
  const [trackHeight, setTrackHeight] = useState<number>(0);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [joinOpen, setJoinOpen] = useState<boolean>(false);
  const [joinPin, setJoinPin] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');

  const navBtnRefs = useRef<
    Record<'overview' | 'features' | 'how-it-works', HTMLButtonElement | null>
  >({
    overview: null,
    features: null,
    'how-it-works': null
  });
  const featureRefs = useRef<(HTMLElement | null)[]>([]);
  const workflowRef = useRef<HTMLDivElement | null>(null);
  const stepLiRefs = useRef<(HTMLLIElement | null)[]>([]);
  const manualStepUntilRef = useRef<number>(0);
  const manualNavUntilRef = useRef<number>(0);
  const activeNavRef = useRef<'overview' | 'features' | 'how-it-works'>('overview');

  useEffect(() => {
    document.title = 'QuizClash · Turn notes into quizzes';
    const initialHash = window.location.hash.replace(/^#/, '');
    if (initialHash) {
      const target = document.getElementById(initialHash);
      if (target) {
        window.requestAnimationFrame(() => {
          const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 82);
          window.scrollTo({ top, behavior: 'smooth' });
        });
      }
    }
  }, []);

  // Sync sliding nav underline indicator to the active section button
  useEffect(() => {
    const syncIndicator = () => {
      const btn = navBtnRefs.current[activeNav];
      if (!btn) return;
      setNavIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    syncIndicator();
    window.addEventListener('resize', syncIndicator);
    return () => window.removeEventListener('resize', syncIndicator);
  }, [activeNav, t]);

  // Measure vertical workflow track line & progress ratio
  useEffect(() => {
    const updateTrack = () => {
      const first = stepLiRefs.current[0];
      const last = stepLiRefs.current[workflowSteps.length - 1];
      const active = stepLiRefs.current[activeStep];
      if (!first || !last || !active) return;
      const start = first.offsetTop;
      const height = Math.max(0, last.offsetTop - start);
      setTrackHeight(height);
      setTrackProgress(height > 0 ? (active.offsetTop - start) / height : 0);
    };

    updateTrack();
    window.addEventListener('resize', updateTrack);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateTrack);
      stepLiRefs.current.forEach((el) => {
        if (el) ro?.observe(el);
      });
    }
    return () => {
      window.removeEventListener('resize', updateTrack);
      ro?.disconnect();
    };
  }, [activeStep, workflowSteps.length]);

  // Scroll-reveal for feature cards & workflow steps + scroll-linked active step
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const featureObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = featureRefs.current.indexOf(entry.target as HTMLElement);
          if (idx >= 0) {
            setRevealedFeatures((prev) =>
              prev[idx] ? prev : prev.map((v, i) => (i === idx ? true : v))
            );
            featureObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    featureRefs.current.forEach((el) => {
      if (el) featureObserver.observe(el);
    });

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = stepLiRefs.current.indexOf(entry.target as HTMLLIElement);
          if (idx >= 0) {
            setRevealedSteps((prev) =>
              prev[idx] ? prev : prev.map((v, i) => (i === idx ? true : v))
            );
            stepObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    stepLiRefs.current.forEach((el) => {
      if (el) stepObserver.observe(el);
    });

    let rafId = 0;
    const onWorkflowScroll = () => {
      if (rafId || Date.now() < manualStepUntilRef.current) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const wf = workflowRef.current;
        if (!wf) return;
        const bounds = wf.getBoundingClientRect();
        const anchor = window.innerHeight * 0.68;
        if (bounds.top > anchor || bounds.bottom < 0) return;
        let nextIdx = 0;
        stepLiRefs.current.forEach((el, i) => {
          if (el && el.getBoundingClientRect().top <= anchor) {
            nextIdx = i;
          }
        });
        setActiveStep(nextIdx);
      });
    };

    window.addEventListener('scroll', onWorkflowScroll, { passive: true });
    return () => {
      featureObserver.disconnect();
      stepObserver.disconnect();
      window.removeEventListener('scroll', onWorkflowScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;

    const measure = () => {
      rafId = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
      setScrollProgress(pct);

      // Avoid fighting the nav pill while a clicked smooth-scroll is in flight
      if (Date.now() < manualNavUntilRef.current) return;

      let current: 'overview' | 'features' | 'how-it-works' = 'overview';
      if (pct >= 96) {
        current = 'how-it-works';
      } else {
        const sectionIds: ('overview' | 'features' | 'how-it-works')[] = [
          'overview',
          'features',
          'how-it-works'
        ];
        for (const secId of sectionIds) {
          const el = document.getElementById(secId);
          if (el && el.getBoundingClientRect().top <= 160) {
            current = secId;
          }
        }
      }

      if (activeNavRef.current !== current) {
        activeNavRef.current = current;
        setActiveNav(current);
        const nextHash = `#${current}`;
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, '', nextHash);
        }
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!joinOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setJoinOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [joinOpen]);

  const scrollToSection = (id: string) => {
    if (id === 'overview' || id === 'features' || id === 'how-it-works') {
      manualNavUntilRef.current = Date.now() + 850;
      activeNavRef.current = id;
      setActiveNav(id);
    }
    window.history.pushState(null, '', `#${id}`);
    const el = document.getElementById(id);
    if (el) {
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 82);
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleGuestJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = normalizeRoomPin(joinPin);
    if (!isValidRoomPin(cleanPin)) {
      setJoinError(t('home.guestJoinError'));
      return;
    }
    setJoinError('');
    setJoinOpen(false);
    navigate(`/lobby?pin=${encodeURIComponent(cleanPin)}`, {
      state: { focusDisplayName: true }
    });
  };

  const currentWorkflow = workflowSteps[activeStep] ?? workflowSteps[0];

  return (
    <div className="qh-page">
      {/* Sticky Site Header */}
      <header className="qh-sticky-header" data-name="Home top navigation">
        <div className="qh-header-inner">
          <a
            className="brand"
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('overview');
            }}
          >
            <span className="brand-mark" aria-hidden="true" />
            <span>QuizClash</span>
          </a>

          <nav className="qh-nav" aria-label={t('home.primaryNavAria')}>
            <button
              ref={(el) => {
                navBtnRefs.current.overview = el;
              }}
              type="button"
              className={activeNav === 'overview' ? 'active' : ''}
              aria-current={activeNav === 'overview' ? 'true' : undefined}
              onClick={() => scrollToSection('overview')}
            >
              {t('home.tabOverview')}
            </button>
            <button
              ref={(el) => {
                navBtnRefs.current.features = el;
              }}
              type="button"
              className={activeNav === 'features' ? 'active' : ''}
              aria-current={activeNav === 'features' ? 'true' : undefined}
              onClick={() => scrollToSection('features')}
            >
              {t('home.tabFeatures')}
            </button>
            <button
              ref={(el) => {
                navBtnRefs.current['how-it-works'] = el;
              }}
              type="button"
              className={activeNav === 'how-it-works' ? 'active' : ''}
              aria-current={activeNav === 'how-it-works' ? 'true' : undefined}
              onClick={() => scrollToSection('how-it-works')}
            >
              {t('home.tabHowItWorks')}
            </button>
            <span
              className="qh-nav-indicator"
              aria-hidden="true"
              style={{
                width: navIndicator.width,
                transform: `translate3d(${navIndicator.left}px, 0, 0)`,
                opacity: navIndicator.width > 0 ? 1 : 0
              }}
            />
          </nav>

          <div className="header-right">
            <ThemeSwitch variant="header" />
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="btn btn-sm">
                      <span>{t('nav.portal')}</span>
                      <ChevronDown size={14} aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem
                      onSelect={() => navigate('/dashboard')}
                      className="cursor-pointer"
                    >
                      <LayoutDashboard size={15} aria-hidden="true" />
                      <span>{t('nav.dashboard')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => navigate('/lobby')}
                      className="cursor-pointer"
                    >
                      <Gamepad2 size={15} aria-hidden="true" />
                      <span>{t('nav.joinGame')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  to="/settings"
                  className="user-badge"
                  data-name="User profile"
                  title={user.display_name || settings.displayName || t('auth.signIn')}
                  aria-label={user.display_name || settings.displayName || t('auth.signIn')}
                >
                  <UserAvatar
                    avatarUrl={user.avatar_url ?? settings.avatarUrl}
                    alt={user.display_name || settings.displayName || t('auth.signIn')}
                    className="header-avatar"
                  />
                </Link>
              </>
            ) : (
              <nav className="qh-account-switch" aria-label={t('auth.eyebrow')}>
                <Link to="/login">{t('auth.signIn')}</Link>
                <Link to="/register">
                  {uiLanguage === 'mm' ? t('auth.signUp') : 'Sign up'}
                </Link>
              </nav>
            )}
          </div>
        </div>

        <Progress
          value={scrollProgress}
          className="h-[3px] w-full rounded-none bg-transparent [&>div]:bg-primary"
          aria-label={t('home.scrollProgressAria')}
        />
      </header>

      <main className="qh-container">
        {/* Hero Section + Interactive Sample Quiz */}
        <section className="qh-hero" id="overview">
          <div className="qh-hero-copy">
            <h1>
              {t('home.heroHeadingLead')} <span>{t('home.heroHeadingAccent')}</span>
            </h1>
            <p className="qh-lead">{t('home.heroLeadShort')}</p>
            <div className="qh-actions">
              <Link to={user ? '/generate' : '/register'} className="qh-btn primary">
                {t('home.createQuizBtn')}
              </Link>
              {user ? (
                <Link to="/lobby?mode=join" className="qh-btn">
                  {t('home.joinWithPinBtn')}
                </Link>
              ) : (
                <button
                  type="button"
                  className="qh-btn"
                  onClick={() => {
                    setJoinError('');
                    setJoinOpen(true);
                  }}
                >
                  {t('home.joinWithPinBtn')}
                </button>
              )}
            </div>
          </div>

          <div className="qh-demo" id="sample">
            <section className="qh-sample" aria-labelledby="sample-title">
              <div className="qh-sample-top">
                <strong>{t('home.sampleTopTitle')}</strong>
                <span>{t('home.sampleTopBadge')}</span>
              </div>
              <div className="qh-sample-body">
                <h2 id="sample-title">{t('home.sampleQuestion')}</h2>
                <div className="qh-choices" aria-label={t('home.sampleTopTitle')}>
                  {sampleChoices.map((opt, idx) => {
                    const answered = selectedSample !== null;
                    const isCorrect = answered && opt.correct;
                    const isWrong = answered && selectedSample === idx && !opt.correct;
                    const cls = [
                      'qh-choice',
                      isCorrect && 'correct',
                      isWrong && 'wrong'
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        className={cls}
                        onClick={() => setSelectedSample(idx)}
                      >
                        <span className="qh-choice-letter" aria-hidden="true">
                          {isCorrect ? '✓' : isWrong ? '×' : opt.letter}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="qh-features" id="features">
          <h2 className="qh-section-title">{t('home.bentoTitle')}</h2>
          <div className="qh-feature-grid is-animated">
            <article
              ref={(el) => {
                featureRefs.current[0] = el;
              }}
              style={{ '--qh-delay': '0ms' } as React.CSSProperties}
              className={`qh-feature-tile is-primary ${
                revealedFeatures[0] ? 'is-revealed' : ''
              }`}
            >
              <div>
                <h3>{t('home.bentoGenerateTitle')}</h3>
                <p>{t('home.bentoGenerateDesc')}</p>
              </div>
              <div className="qh-mock" aria-hidden="true">
                <strong>{t('home.bentoMockNotesLabel')}</strong>
                <p>{t('home.bentoMockNotesText')}</p>
                <div style={{ height: 14 }} />
                <strong>{t('home.bentoMockQuestionLabel')}</strong>
                <p>{t('home.sampleQuestion')}</p>
              </div>
            </article>

            <article
              ref={(el) => {
                featureRefs.current[1] = el;
              }}
              style={{ '--qh-delay': '150ms' } as React.CSSProperties}
              className={`qh-feature-tile ${revealedFeatures[1] ? 'is-revealed' : ''}`}
            >
              <div>
                <h3>{t('home.bentoPracticeTitle')}</h3>
                <p>{t('home.bentoPracticeDesc')}</p>
              </div>
              <div className="qh-mock qh-mock-row" aria-hidden="true">
                <span className="qh-mock-chip">A · {t('home.sampleChoiceA')}</span>
                <span className="qh-mock-chip correct">✓ {t('home.sampleChoiceB')}</span>
              </div>
            </article>

            <article
              ref={(el) => {
                featureRefs.current[2] = el;
              }}
              style={{ '--qh-delay': '300ms' } as React.CSSProperties}
              className={`qh-feature-tile is-surface ${
                revealedFeatures[2] ? 'is-revealed' : ''
              }`}
            >
              <div>
                <h3>{t('home.bentoLiveTitle')}</h3>
                <p>{t('home.bentoLiveDesc')}</p>
              </div>
              <div className="qh-mock" aria-hidden="true">
                <strong>{t('home.bentoSamplePinLabel')}</strong>
                <span className="qh-mock-pin">{ROOM_PIN_EXAMPLE}</span>
              </div>
            </article>
          </div>
        </section>

        {/* Interactive How It Works Section */}
        <section className="qh-steps-section" id="how-it-works">
          <h2 className="qh-section-title">{t('home.tabHowItWorks')}</h2>
          <div ref={workflowRef} className="qh-workflow is-animated">
            <ol
              aria-label={t('home.tabHowItWorks')}
              style={
                {
                  '--qh-track-height': `${trackHeight}px`,
                  '--qh-progress': trackProgress
                } as React.CSSProperties
              }
            >
              {workflowSteps.map((step, idx) => {
                const isActive = idx === activeStep;
                const isComplete = idx < activeStep;
                const isInView = revealedSteps[idx];
                return (
                  <li
                    key={step.title}
                    ref={(el) => {
                      stepLiRefs.current[idx] = el;
                    }}
                    className={[
                      isActive && 'active',
                      isComplete && 'complete',
                      isInView && 'in-view'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="qh-step-number" aria-hidden="true">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      className="qh-step-button"
                      aria-pressed={isActive}
                      onClick={() => {
                        manualStepUntilRef.current = Date.now() + 900;
                        setActiveStep(idx);
                      }}
                    >
                      <strong>{step.title}</strong>
                      <span>{step.subtitle}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="qh-workflow-stage" id="workflow-preview">
              <div key={activeStep} className="qh-workflow-preview-body">
                <h3 style={{ marginBottom: 16 }}>{currentWorkflow.stageTitle}</h3>
                <div className="qh-workflow-detail">
                  {currentWorkflow.items.map((item) => (
                    <div key={item.heading} className="qh-workflow-detail-row">
                      <span className="qh-workflow-detail-icon" aria-hidden="true">
                        {item.icon === 'file' ? (
                          <FileText size={18} />
                        ) : item.icon === 'check' ? (
                          <CheckSquare size={18} />
                        ) : item.icon === 'user' ? (
                          <User size={18} />
                        ) : (
                          <Users size={18} />
                        )}
                      </span>
                      <div>
                        <strong>{item.heading}</strong>
                        <p>{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="qh-footer">
        <div className="qh-container qh-footer-grid">
          <div className="qh-footer-brand">
            <a
              className="qh-brand"
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('overview');
              }}
            >
              <span className="qh-brand-mark" aria-hidden="true" />
              <span>QuizClash</span>
            </a>
            <p>{t('home.footerDesc')}</p>
          </div>

          <nav className="qh-footer-nav" aria-labelledby="footer-explore">
            <h2 id="footer-explore">{t('home.footerExplore')}</h2>
            <button type="button" onClick={() => scrollToSection('features')}>
              {t('home.tabFeatures')}
            </button>
            <button type="button" onClick={() => scrollToSection('how-it-works')}>
              {t('home.tabHowItWorks')}
            </button>
            <button type="button" onClick={() => scrollToSection('sample')}>
              {t('home.footerTryQuestion')}
            </button>
          </nav>

          <nav className="qh-footer-nav" aria-labelledby="footer-live">
            <h2 id="footer-live">{t('home.footerLiveGames')}</h2>
            <Link to="/lobby">{t('home.footerOpenLobby')}</Link>
            <button
              type="button"
              onClick={() => {
                setJoinError('');
                setJoinOpen(true);
              }}
            >
              {t('home.footerJoinWithPin')}
            </button>
            {user ? (
              <Link to="/dashboard">{t('nav.dashboard')}</Link>
            ) : (
              <Link to="/login">{t('auth.signIn')}</Link>
            )}
          </nav>
        </div>

        <div className="qh-container qh-footer-inner">
          <span>© 2026 QuizClash</span>
          <button
            type="button"
            className="qh-back-to-top"
            aria-label={t('home.backToTop')}
            title={t('home.backToTop')}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </div>
      </footer>

      {/* Guest Join Room PIN Modal */}
      {joinOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-join-title"
          onClick={() => setJoinOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(33, 25, 71, 0.62)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 100%)',
              background: 'var(--qh-surface)',
              color: 'var(--qh-ink)',
              border: '1px solid var(--qh-line)',
              borderRadius: 16,
              padding: 24
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14
              }}
            >
              <h2
                id="guest-join-title"
                style={{ margin: 0, fontSize: 20, fontWeight: 700 }}
              >
                {t('home.guestJoinTitle')}
              </h2>
              <button
                type="button"
                className="qh-btn sm"
                aria-label={t('review.closePreview')}
                onClick={() => setJoinOpen(false)}
                style={{ padding: '6px 8px', minHeight: 34 }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleGuestJoinSubmit}>
              <label
                htmlFor="home-join-code"
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                {t('home.guestJoinLabel')}
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: 8
                }}
              >
                <input
                  id="home-join-code"
                  type="text"
                  autoComplete="off"
                  maxLength={16}
                  placeholder={t('home.guestJoinPlaceholder')}
                  autoFocus
                  value={joinPin}
                  onChange={(e) => {
                    setJoinPin(e.target.value.toUpperCase());
                    if (joinError) setJoinError('');
                  }}
                  style={{
                    minWidth: 0,
                    padding: '9px 12px',
                    border: '1px solid var(--qh-line)',
                    borderRadius: 10,
                    color: 'var(--qh-ink)',
                    background: 'var(--qh-canvas)',
                    textTransform: 'uppercase'
                  }}
                />
                <button type="submit" className="qh-btn primary">
                  {t('home.guestJoinSubmit')}
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--qh-muted)' }}>
                {t('home.guestJoinHint')}
              </p>
              {joinError && (
                <p
                  role="alert"
                  style={{
                    margin: '8px 0 0',
                    fontSize: 13,
                    color: 'var(--qh-wrong-ink)'
                  }}
                >
                  {joinError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
