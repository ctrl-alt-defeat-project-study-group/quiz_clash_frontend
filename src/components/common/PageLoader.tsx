import React from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PageLoaderProps {
  variant?: 'fullscreen' | 'panel';
  label?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'panel',
  label
}) => {
  const { t } = useApp();

  return (
    <div
      className={`page-loader page-loader--${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="page-loader-inner">
        <span className="page-loader-badge" aria-hidden="true">
          <span className="brand-mark" />
        </span>
        <div className="page-loader-row">
          <Loader2 size={16} className="page-loader-spinner" aria-hidden="true" />
          <span className="page-loader-text">{label || t('common.loading')}</span>
        </div>
      </div>
    </div>
  );
};
