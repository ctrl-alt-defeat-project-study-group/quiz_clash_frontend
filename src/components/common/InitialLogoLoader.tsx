import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { QuizClashLoaderArt } from './QuizClashLogo';

type RouteGroup = 'home' | 'auth' | 'live-entry' | 'live-room' | 'live-play' | 'workspace';

const getRouteGroup = (pathname: string): RouteGroup => {
  if (pathname === '/') return 'home';
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-email' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return 'auth';
  }
  if (pathname === '/lobby' || pathname === '/s6') return 'live-entry';
  if (
    pathname === '/leaderboard' ||
    pathname === '/s7' ||
    pathname === '/rooms/play' ||
    /^\/rooms\/[^/]+\/play\/?$/.test(pathname)
  ) {
    return 'live-play';
  }
  if (pathname.startsWith('/rooms/')) return 'live-room';
  return 'workspace';
};

export const InitialLogoLoader: React.FC = () => {
  const { t } = useApp();
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    runId: number;
    mode: 'intro' | 'route';
  }>({
    visible: true,
    runId: 0,
    mode: 'intro'
  });

  if (prevPath !== location.pathname) {
    const fromGroup = getRouteGroup(prevPath);
    const toGroup = getRouteGroup(location.pathname);
    setPrevPath(location.pathname);
    if (fromGroup !== toGroup) {
      setLoaderState((prev) => ({
        visible: true,
        runId: prev.runId + 1,
        mode: 'route'
      }));
    }
  }

  useEffect(() => {
    if (!loaderState.visible) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration =
      loaderState.mode === 'intro'
        ? prefersReducedMotion
          ? 550
          : 1940
        : prefersReducedMotion
        ? 320
        : 1260;

    const timer = window.setTimeout(() => {
      setLoaderState((prev) =>
        prev.runId === loaderState.runId ? { ...prev, visible: false } : prev
      );
    }, duration);

    return () => window.clearTimeout(timer);
  }, [loaderState.visible, loaderState.runId, loaderState.mode]);

  if (!loaderState.visible) return null;

  return (
    <div
      key={loaderState.runId}
      className={`logo-loader logo-loader--intro${
        loaderState.mode === 'route' ? ' logo-loader--route' : ''
      }`}
      role="status"
      aria-live="polite"
      aria-labelledby="qc-initial-loading-label"
    >
      <div className="loader-center">
        <QuizClashLoaderArt />
        <strong>QuizClash</strong>
        <span className="loader-caption" id="qc-initial-loading-label">
          {t('common.loading')}
        </span>
      </div>
    </div>
  );
};
