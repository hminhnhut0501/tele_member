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

export function FixedWheelIcon({ kind, size = 44 }: { kind: WheelIconKind; size?: number }) {
  if (kind === 'gift') {
    return (
      <svg {...sharedProps} width={size} height={size}>
        <defs>
          <linearGradient id="wheel-gift-box" x1="10" y1="16" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFDF68" />
            <stop offset="0.48" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="wheel-gift-ribbon" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B7A" />
            <stop offset="1" stopColor="#E11D48" />
          </linearGradient>
        </defs>
        <path d="M8 18.5C8 17.12 9.12 16 10.5 16H37.5C38.88 16 40 17.12 40 18.5V36.5C40 38.43 38.43 40 36.5 40H11.5C9.57 40 8 38.43 8 36.5V18.5Z" fill="url(#wheel-gift-box)" stroke="#8B4A0B" strokeWidth="1.6" />
        <path d="M7 15.5C7 14.12 8.12 13 9.5 13H38.5C39.88 13 41 14.12 41 15.5V19H7V15.5Z" fill="#FBBF24" stroke="#8B4A0B" strokeWidth="1.6" />
        <path d="M21.5 13H26.5V40H21.5V13Z" fill="url(#wheel-gift-ribbon)" />
        <path d="M8 19H40" stroke="#FFE58A" strokeWidth="1.2" opacity="0.8" />
        <path d="M24 13C20.1 13 15.5 11.05 15.5 8.3C15.5 6.76 16.78 6 18.2 6C20.9 6 23.13 9.33 24 13Z" fill="#FB7185" stroke="#9F1239" strokeWidth="1.4" />
        <path d="M24 13C27.9 13 32.5 11.05 32.5 8.3C32.5 6.76 31.22 6 29.8 6C27.1 6 24.87 9.33 24 13Z" fill="#F43F5E" stroke="#9F1239" strokeWidth="1.4" />
        <path d="M24 12V16" stroke="#FFF1B2" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'peach') {
    return (
      <svg {...sharedProps} width={size} height={size}>
        <defs>
          <linearGradient id="wheel-peach-body" x1="14" y1="12" x2="34" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD39B" />
            <stop offset="0.42" stopColor="#FF996B" />
            <stop offset="1" stopColor="#EF5B4D" />
          </linearGradient>
          <linearGradient id="wheel-peach-leaf" x1="30" y1="6" x2="39" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B8F27D" />
            <stop offset="1" stopColor="#42A85F" />
          </linearGradient>
        </defs>
        <path d="M24 13C19.3 9.5 12.5 12.6 11.1 20.4C9.5 29.3 15 39.5 23.3 41C31.4 39.6 38.5 30 36.9 20.6C35.6 12.7 28.7 9.5 24 13Z" fill="url(#wheel-peach-body)" stroke="#C84D43" strokeWidth="1.5" />
        <path d="M24 13C24.1 20.1 23.9 28.4 23.3 40.5" stroke="#E85E51" strokeWidth="1.2" strokeLinecap="round" opacity="0.72" />
        <path d="M25 12C27.7 5.8 34.1 5.2 39 8.5C37.2 14.6 32.3 17 25 14.2" fill="url(#wheel-peach-leaf)" stroke="#2F7E4A" strokeWidth="1.4" />
        <path d="M25 13C29 11.5 33.4 10.1 37.3 9.1" stroke="#D8FFAD" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="17" cy="20" rx="3.5" ry="5.5" fill="#FFE8CF" opacity="0.58" transform="rotate(25 17 20)" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps} width={size} height={size}>
      <defs>
        <linearGradient id="wheel-sparkle" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#B7D4FF" />
          <stop offset="1" stopColor="#6C9FFF" />
        </linearGradient>
      </defs>
      <path d="M24 4L28.2 19.8L44 24L28.2 28.2L24 44L19.8 28.2L4 24L19.8 19.8L24 4Z" fill="url(#wheel-sparkle)" stroke="#7EA9F7" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M37 7L38.4 11.6L43 13L38.4 14.4L37 19L35.6 14.4L31 13L35.6 11.6L37 7Z" fill="#FFFFFF" opacity="0.92" />
      <circle cx="12" cy="35" r="2.2" fill="#BBD8FF" opacity="0.8" />
    </svg>
  );
}
