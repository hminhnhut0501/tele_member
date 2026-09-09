'use client';

import type { SVGProps } from 'react';

type WheelIconKind = 'gift' | 'peach' | 'nothing';

const sharedProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 48 48',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  focusable: 'false',
  'aria-hidden': true,
};

export function PeachCoinIcon({ size = 44, variant = 1 }: { size?: number; variant?: 1 | 2 }) {
  const alternate = variant === 2;
  const prefix = `peach-coin-${variant}`;
  return (
    <svg {...sharedProps} width={size} height={size}>
      <defs>
        <radialGradient id={`${prefix}-outer`} cx="30%" cy="24%" r="78%">
          <stop stopColor={alternate ? '#FFF9C8' : '#FFF4A8'} />
          <stop offset="0.42" stopColor={alternate ? '#FFC95A' : '#F7B83F'} />
          <stop offset="0.78" stopColor={alternate ? '#E89420' : '#D98218'} />
          <stop offset="1" stopColor={alternate ? '#A85A10' : '#9C4D0B'} />
        </radialGradient>
        <linearGradient id={`${prefix}-inner`} x1="8" y1="7" x2="39" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor={alternate ? '#315FBA' : '#4D82E8'} />
          <stop offset="0.52" stopColor={alternate ? '#1D4AA5' : '#2C63D2'} />
          <stop offset="1" stopColor={alternate ? '#102D78' : '#173B99'} />
        </linearGradient>
        <linearGradient id={`${prefix}-peach`} x1="15" y1="13" x2="34" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor={alternate ? '#FFE2B3' : '#FFD9A5'} />
          <stop offset="0.45" stopColor={alternate ? '#FF9C7A' : '#FF8A68'} />
          <stop offset="1" stopColor={alternate ? '#D95350' : '#D9474C'} />
        </linearGradient>
        <linearGradient id={`${prefix}-leaf`} x1="27" y1="8" x2="38" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9F69B" />
          <stop offset="1" stopColor="#3E9D5B" />
        </linearGradient>
        <filter id={`${prefix}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="#5A2B09" floodOpacity="0.38" />
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${prefix}-outer)`} stroke="#FFEAA0" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="18.2" fill={`url(#${prefix}-inner)`} stroke="rgba(255,246,181,0.82)" strokeWidth="1.1" />
      <circle cx="24" cy="24" r="16.1" fill="none" stroke="rgba(174,211,255,0.32)" strokeWidth="0.9" />
      <g filter={`url(#${prefix}-shadow)`}>
        <path d="M24 17.1C20.3 13.9 15.1 16.2 14.8 22.3C14.5 29.5 18.7 35.1 23.8 36.4C29.1 35.2 33.4 29.4 33.1 22.3C32.8 16.2 27.7 13.9 24 17.1Z" fill={`url(#${prefix}-peach)`} stroke="#D34B45" strokeWidth="1.1" />
        <path d="M24 17C23.8 22 23.8 29.4 23.8 35.9" stroke="#EA6656" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        <path d="M24.7 16.5C26.5 11.9 31.2 10.5 35.8 12.7C34.7 17.1 30.9 19.1 24.7 17.8" fill={`url(#${prefix}-leaf)`} stroke="#2E7C4A" strokeWidth="1" />
        <ellipse cx="18.8" cy="22.1" rx="2" ry="3.5" fill="#FFE8CC" opacity="0.62" transform="rotate(24 18.8 22.1)" />
      </g>
      <path d="M9.5 14.2C13.1 9.4 17.2 7.2 22.4 6.4" stroke="rgba(255,255,255,0.58)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function FixedWheelIcon({ kind, size = 44, variant = 1 }: { kind: WheelIconKind; size?: number; variant?: 1 | 2 }) {
  if (kind === 'peach') return <PeachCoinIcon size={size} variant={variant} />;
  if (kind === 'gift') return <GiftWheelIcon size={size} variant={variant} />;
  return <NothingWheelIcon size={size} variant={variant} />;
}

function GiftWheelIcon({ size = 44, variant = 1 }: { size?: number; variant?: 1 | 2 }) {
  const alternate = variant === 2;
  return (
    <svg {...sharedProps} width={size} height={size}>
      <defs>
        <linearGradient id={`wheel-gift-box-${variant}`} x1="10" y1="16" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={alternate ? '#C6E7FF' : '#FFDF68'} />
          <stop offset="0.48" stopColor={alternate ? '#5AA7F2' : '#F59E0B'} />
          <stop offset="1" stopColor={alternate ? '#2563B8' : '#D97706'} />
        </linearGradient>
        <linearGradient id={`wheel-gift-ribbon-${variant}`} x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={alternate ? '#A7F3D0' : '#FF6B7A'} />
          <stop offset="1" stopColor={alternate ? '#0F9F83' : '#E11D48'} />
        </linearGradient>
      </defs>
      <path d="M8 18.5C8 17.12 9.12 16 10.5 16H37.5C38.88 16 40 17.12 40 18.5V36.5C40 38.43 38.43 40 36.5 40H11.5C9.57 40 8 38.43 8 36.5V18.5Z" fill={`url(#wheel-gift-box-${variant})`} stroke="#8B4A0B" strokeWidth="1.6" />
      <path d="M7 15.5C7 14.12 8.12 13 9.5 13H38.5C39.88 13 41 14.12 41 15.5V19H7V15.5Z" fill={alternate ? '#7DD3FC' : '#FBBF24'} stroke={alternate ? '#1E5A9A' : '#8B4A0B'} strokeWidth="1.6" />
      <path d="M21.5 13H26.5V40H21.5V13Z" fill={`url(#wheel-gift-ribbon-${variant})`} />
      <path d="M24 13C20.1 13 15.5 11.05 15.5 8.3C15.5 6.76 16.78 6 18.2 6C20.9 6 23.13 9.33 24 13Z" fill={alternate ? '#A7F3D0' : '#FB7185'} stroke={alternate ? '#087F6B' : '#9F1239'} strokeWidth="1.4" />
      <path d="M24 13C27.9 13 32.5 11.05 32.5 8.3C32.5 6.76 31.22 6 29.8 6C27.1 6 24.87 9.33 24 13Z" fill={alternate ? '#34D399' : '#F43F5E'} stroke={alternate ? '#087F6B' : '#9F1239'} strokeWidth="1.4" />
    </svg>
  );
}

function NothingWheelIcon({ size = 44, variant = 1 }: { size?: number; variant?: 1 | 2 }) {
  const alternate = variant === 2;
  return (
    <svg {...sharedProps} width={size} height={size}>
      <defs>
        <linearGradient id={`wheel-sparkle-${variant}`} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={alternate ? '#FFF7D6' : '#FFFFFF'} />
          <stop offset="0.5" stopColor={alternate ? '#F4D58A' : '#B7D4FF'} />
          <stop offset="1" stopColor={alternate ? '#D48B38' : '#6C9FFF'} />
        </linearGradient>
      </defs>
      <path d="M24 4L28.2 19.8L44 24L28.2 28.2L24 44L19.8 28.2L4 24L19.8 19.8L24 4Z" fill={`url(#wheel-sparkle-${variant})`} stroke={alternate ? '#B87926' : '#7EA9F7'} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M37 7L38.4 11.6L43 13L38.4 14.4L37 19L35.6 14.4L31 13L35.6 11.6L37 7Z" fill={alternate ? '#FFF8D9' : '#FFFFFF'} opacity="0.92" />
      <circle cx="12" cy="35" r="2.2" fill="#BBD8FF" opacity="0.8" />
    </svg>
  );
}

export function WheelHubIcon({ size = 48 }: { size?: number }) {
  return <PeachCoinIcon size={size} variant={1} />;
}
