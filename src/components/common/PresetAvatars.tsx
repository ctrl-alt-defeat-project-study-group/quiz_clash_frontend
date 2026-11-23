import React from 'react';
import { PRESET_AVATARS } from './presetAvatarList';

interface UserAvatarProps {
  avatarUrl?: string | null;
  alt: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  alt,
  className = ''
}) => {
  const preset =
    (avatarUrl ? PRESET_AVATARS.find((item) => item.id === avatarUrl) : undefined) ??
    PRESET_AVATARS[0];

  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: '999px'
      }}
    >
      {preset.svg}
    </span>
  );
};
