import React from 'react';
import defaultAvatar from '../../assets/avatar.svg';
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
  const preset = avatarUrl
    ? PRESET_AVATARS.find((item) => item.id === avatarUrl)
    : undefined;

  if (preset) {
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
  }

  return <img src={defaultAvatar} alt={alt} className={className} />;
};
