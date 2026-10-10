import React from 'react';
import { isImageAvatar } from '../config';

// Renders an emoji avatar or a selfie (data URL) avatar
export default function Avatar({ avatar, size = 'md', className = '' }) {
  return (
    <span className={`avatar avatar--${size} ${className}`} aria-hidden="true">
      {isImageAvatar(avatar) ? <img src={avatar} alt="" /> : <span>{avatar || '🙂'}</span>}
    </span>
  );
}
