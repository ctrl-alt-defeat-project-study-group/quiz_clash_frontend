import React from 'react';

export interface PresetAvatarItem {
  id: string;
  label: string;
  bg: string;
  accent: string;
  svg: React.ReactNode;
}

export const PRESET_AVATARS: PresetAvatarItem[] = [
  {
    id: 'preset:scholar',
    label: 'Scholar',
    bg: '#4f46e5',
    accent: '#c7d2fe',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#4f46e5" />
        <circle cx="32" cy="36" r="14" fill="#fde68a" />
        <path d="M12 24 32 14l20 10-20 9-20-9Z" fill="#1e1b4b" />
        <path d="M46 26v10" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="27" cy="35" r="2.2" fill="#1e1b4b" />
        <circle cx="37" cy="35" r="2.2" fill="#1e1b4b" />
        <path d="M27 42c2.5 2.4 7.5 2.4 10 0" stroke="#1e1b4b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'preset:fox',
    label: 'Fox',
    bg: '#ea580c',
    accent: '#fed7aa',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#ffedd5" />
        <path d="M16 16l10 12h12l10-12 2 22c0 10-8 16-18 16s-18-6-18-16l2-22Z" fill="#ea580c" />
        <path d="M20 38c4-3 8 2 12 8 4-6 8-11 12-8 0 8-5 14-12 14s-12-6-12-14Z" fill="#fff7ed" />
        <circle cx="25" cy="35" r="2.4" fill="#1c1917" />
        <circle cx="39" cy="35" r="2.4" fill="#1c1917" />
        <circle cx="32" cy="43" r="3" fill="#1c1917" />
      </svg>
    )
  },
  {
    id: 'preset:owl',
    label: 'Owl',
    bg: '#0f766e',
    accent: '#99f6e4',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#0f766e" />
        <ellipse cx="32" cy="37" rx="18" ry="17" fill="#5eead4" />
        <circle cx="24" cy="32" r="7" fill="#ffffff" />
        <circle cx="40" cy="32" r="7" fill="#ffffff" />
        <circle cx="24" cy="32" r="3.4" fill="#134e4a" />
        <circle cx="40" cy="32" r="3.4" fill="#134e4a" />
        <path d="M29 38h6l-3 6-3-6Z" fill="#f59e0b" />
      </svg>
    )
  },
  {
    id: 'preset:astronaut',
    label: 'Astronaut',
    bg: '#1d4ed8',
    accent: '#bfdbfe',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#1e3a8a" />
        <circle cx="32" cy="34" r="18" fill="#f8fafc" />
        <rect x="20" y="25" width="24" height="16" rx="8" fill="#0f172a" />
        <path d="M24 29h6" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="14" cy="18" r="2" fill="#fde047" />
        <circle cx="50" cy="16" r="1.8" fill="#fde047" />
      </svg>
    )
  },
  {
    id: 'preset:cat',
    label: 'Cat',
    bg: '#db2777',
    accent: '#fbcfe8',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#fce7f3" />
        <path d="M18 18l8 8h12l8-8v20c0 9-6 15-14 15s-14-6-14-15V18Z" fill="#ec4899" />
        <circle cx="26" cy="35" r="2.4" fill="#1f2937" />
        <circle cx="38" cy="35" r="2.4" fill="#1f2937" />
        <path d="M30 40h4l-2 2.5L30 40Z" fill="#fdf2f8" />
        <path d="M28 44c2 1.8 6 1.8 8 0" stroke="#fdf2f8" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'preset:robot',
    label: 'Robot',
    bg: '#0284c7',
    accent: '#bae6fd',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#0369a1" />
        <line x1="32" y1="12" x2="32" y2="20" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="11" r="3" fill="#38bdf8" />
        <rect x="16" y="20" width="32" height="28" rx="8" fill="#e0f2fe" />
        <circle cx="25" cy="33" r="3.5" fill="#0284c7" />
        <circle cx="39" cy="33" r="3.5" fill="#0284c7" />
        <rect x="24" y="41" width="16" height="3.2" rx="1.6" fill="#0369a1" />
      </svg>
    )
  },
  {
    id: 'preset:panda',
    label: 'Panda',
    bg: '#16a34a',
    accent: '#bbf7d0',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#dcfce7" />
        <circle cx="20" cy="21" r="7" fill="#18181b" />
        <circle cx="44" cy="21" r="7" fill="#18181b" />
        <circle cx="32" cy="35" r="17" fill="#ffffff" />
        <ellipse cx="25" cy="34" rx="5" ry="6" fill="#18181b" />
        <ellipse cx="39" cy="34" rx="5" ry="6" fill="#18181b" />
        <circle cx="26" cy="33" r="1.8" fill="#ffffff" />
        <circle cx="38" cy="33" r="1.8" fill="#ffffff" />
        <ellipse cx="32" cy="41" rx="3.2" ry="2.2" fill="#18181b" />
      </svg>
    )
  },
  {
    id: 'preset:wizard',
    label: 'Wizard',
    bg: '#7c3aed',
    accent: '#ddd6fe',
    svg: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#4c1d95" />
        <path d="M14 31h36l-8-4-10-18-10 18-8 4Z" fill="#7c3aed" />
        <circle cx="32" cy="40" r="11" fill="#fde68a" />
        <circle cx="28" cy="39" r="2" fill="#1e1b4b" />
        <circle cx="36" cy="39" r="2" fill="#1e1b4b" />
        <circle cx="32" cy="21" r="2.2" fill="#fde047" />
      </svg>
    )
  }
];
