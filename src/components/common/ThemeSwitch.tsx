import React from 'react';
import { useApp } from '@/context/AppContext';

interface ThemeSwitchProps {
  variant?: 'header' | 'card';
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  variant = 'card',
  className = '',
}) => {
  const { theme, toggleTheme } = useApp();
  const dark = theme === 'dark';

  const isHeader = variant === 'header';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onClick={toggleTheme}
      className={`relative ${
        isHeader ? 'h-9 w-[68px] sm:h-10 sm:w-[76px]' : 'h-10 w-[76px]'
      } shrink-0 rounded-full p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
        dark
          ? 'bg-indigo-950 ring-offset-slate-900 focus-visible:ring-indigo-300'
          : 'bg-sky-200 ring-offset-white focus-visible:ring-sky-600'
      } ${className}`.trim()}
    >
      <span
        className={`absolute inset-y-1 left-1 grid ${
          isHeader ? 'w-7 sm:w-8' : 'w-8'
        } place-items-center rounded-full shadow transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none ${
          dark
            ? `${
                isHeader ? 'translate-x-8 sm:translate-x-9' : 'translate-x-9'
              } bg-slate-200 text-indigo-950`
            : 'translate-x-0 bg-amber-300 text-amber-700'
        }`}
      >
        {dark ? (
          <svg
            viewBox="0 0 20 20"
            width="16"
            height="16"
            aria-hidden="true"
            className="fill-current"
          >
            <path d="M15.5 13.2A7 7 0 0 1 6.8 4.5 7 7 0 1 0 15.5 13.2z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            aria-hidden="true"
            className="fill-current"
          >
            <circle cx="10" cy="10" r="4" />
            <path d="M9 1h2v3H9zm0 15h2v3H9zM1 9h3v2H1zm15 0h3v2h-3zM3.3 4.7l1.4-1.4 2.1 2.1-1.4 1.4zm10 10 1.4-1.4 2.1 2.1-1.4 1.4zM3.3 15.3l2.1-2.1 1.4 1.4-2.1 2.1zm10-10 2.1-2.1 1.4 1.4-2.1 2.1z" />
          </svg>
        )}
      </span>
    </button>
  );
};
