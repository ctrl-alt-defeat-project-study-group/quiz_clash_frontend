import React, { useId } from 'react';
import { useApp } from '@/context/AppContext';

interface LanguageSwitchProps {
  className?: string;
}

export const UkFlagIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 18,
  height = 13
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
  width = 18,
  height = 13
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
  const { uiLanguage, toggleUiLanguage, resolvedTheme, t } = useApp();
  const isMyanmar = uiLanguage === 'mm';
  const dark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isMyanmar}
      aria-label={t('nav.languageSwitchAria')}
      title={isMyanmar ? t('nav.switchToEnglish') : t('nav.switchToMyanmar')}
      data-name="Language toggle"
      onClick={toggleUiLanguage}
      className={`relative h-9 w-[72px] shrink-0 rounded-[10px] border p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
        dark
          ? 'border-indigo-400/30 bg-indigo-950/90 ring-offset-slate-900 focus-visible:ring-indigo-300'
          : 'border-slate-300 bg-slate-100 ring-offset-white focus-visible:ring-indigo-500'
      } ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 grid w-7 place-items-center rounded-[7px] shadow-sm transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none ${
          isMyanmar
            ? 'translate-x-9 bg-indigo-500 text-white'
            : dark
            ? 'translate-x-0 bg-indigo-500 text-white'
            : 'translate-x-0 bg-white border border-slate-200'
        }`}
      >
        {isMyanmar ? <MyanmarFlagIcon /> : <UkFlagIcon />}
      </span>
    </button>
  );
};
