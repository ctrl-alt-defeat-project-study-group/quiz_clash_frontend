import React from 'react';
import { useApp } from '../../context/AppContext';
import { QuizClashLoaderArt } from './QuizClashLogo';

interface PageLoaderProps {
  variant?: 'fullscreen' | 'panel' | 'compact' | 'overlay';
  label?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'panel',
  label
}) => {
  const { t } = useApp();

  const artClass =
    variant === 'compact'
      ? 'loader-art--compact'
      : variant === 'panel'
      ? 'loader-art--panel'
      : undefined;

  return (
    <div
      className={`page-loader page-loader--${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="loader-center">
        <QuizClashLoaderArt className={artClass} />
        <strong>QuizClash</strong>
        <span className="loader-caption">{label || t('common.loading')}</span>
      </div>
    </div>
  );
};
