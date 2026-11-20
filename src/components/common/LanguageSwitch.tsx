import React, { useId } from 'react';
import { useApp } from '@/context/AppContext';

interface LanguageSwitchProps {
  className?: string;
}

export const UkFlagIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 20,
  height = 15
}) => {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 24 18"
      width={width}
      height={height}
      aria-hidden="true"
      className="lang-flag-icon"
    >
      <clipPath id={clipId}>
        <rect width="24" height="18" rx="2.5" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="24" height="18" fill="#012169" />
        <path d="M0 0L24 18M24 0L0 18" stroke="#FFFFFF" strokeWidth="3.6" />
        <path d="M0 0L24 18M24 0L0 18" stroke="#C8102E" strokeWidth="1.8" />
        <path d="M12 0V18M0 9H24" stroke="#FFFFFF" strokeWidth="5.4" />
        <path d="M12 0V18M0 9H24" stroke="#C8102E" strokeWidth="3.2" />
      </g>
    </svg>
  );
};

export const MyanmarFlagIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 20,
  height = 15
}) => {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 24 18"
      width={width}
      height={height}
      aria-hidden="true"
      className="lang-flag-icon"
    >
      <clipPath id={clipId}>
        <rect width="24" height="18" rx="2.5" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="24" height="6" y="0" fill="#FECB00" />
        <rect width="24" height="6" y="6" fill="#34B233" />
        <rect width="24" height="6" y="12" fill="#EA2839" />
        <polygon
          fill="#FFFFFF"
          points="12,3.4 13.35,7.55 17.7,7.55 14.18,10.1 15.52,14.25 12,11.7 8.48,14.25 9.82,10.1 6.3,7.55 10.65,7.55"
        />
      </g>
    </svg>
  );
};

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  className = ''
}) => {
  const { uiLanguage, setUiLanguage, t } = useApp();
  const isMyanmar = uiLanguage === 'mm';

  return (
    <div
      className={`lang-toggle ${isMyanmar ? 'is-mm' : 'is-en'} ${className}`.trim()}
      role="group"
      aria-label={t('nav.languageSwitchAria')}
      data-name="Language toggle"
    >
      <span className="lang-toggle-thumb" aria-hidden="true" />
      <button
        type="button"
        className={`lang-toggle-btn ${!isMyanmar ? 'active' : ''}`}
        aria-pressed={!isMyanmar}
        aria-label="English"
        title={t('nav.switchToEnglish')}
        onClick={() => setUiLanguage('en')}
      >
        <UkFlagIcon />
      </button>
      <button
        type="button"
        className={`lang-toggle-btn ${isMyanmar ? 'active' : ''}`}
        aria-pressed={isMyanmar}
        aria-label="Myanmar"
        title={t('nav.switchToMyanmar')}
        onClick={() => setUiLanguage('mm')}
      >
        <MyanmarFlagIcon />
      </button>
    </div>
  );
};
