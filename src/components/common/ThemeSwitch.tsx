import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface ThemeSwitchProps {
  variant?: 'header' | 'card';
  className?: string;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  variant = 'card',
  className = '',
}) => {
  const { resolvedTheme, toggleTheme } = useApp();
  const dark = resolvedTheme === 'dark';
  const [hasToggled, setHasToggled] = useState(false);

  const isHeader = variant === 'header';
  const shiftPx = isHeader ? 32 : 36;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onClick={() => {
        setHasToggled(true);
        toggleTheme();
      }}
      className={`relative ${
        isHeader ? 'h-9 w-[68px]' : 'h-9 w-[72px]'
      } shrink-0 rounded-[10px] border p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
        dark
          ? 'border-indigo-400/30 bg-indigo-950/90 ring-offset-slate-900 focus-visible:ring-indigo-300'
          : 'border-slate-300 bg-slate-100 ring-offset-white focus-visible:ring-indigo-500'
      } ${className}`.trim()}
    >
      <span
        key={hasToggled ? (dark ? 'to-dark' : 'to-light') : 'initial'}
        style={
          {
            '--ts-shift': `${shiftPx}px`,
            transform: dark ? `translateX(${shiftPx}px)` : 'translateX(0px)'
          } as React.CSSProperties
        }
        className={`absolute inset-y-1 left-1 grid w-7 place-items-center rounded-[7px] shadow-sm ${
          hasToggled ? (dark ? 'ts-shake-dark' : 'ts-shake-light') : ''
        } ${
          dark
            ? 'bg-indigo-500 text-white'
            : 'bg-white text-amber-500 border border-slate-200'
        }`}
      >
        {dark ? (
          <svg
            viewBox="0 0 20 20"
            width="15"
            height="15"
            aria-hidden="true"
            className="fill-current"
          >
            <path d="M15.5 13.2A7 7 0 0 1 6.8 4.5 7 7 0 1 0 15.5 13.2z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            width="16"
            height="16"
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
