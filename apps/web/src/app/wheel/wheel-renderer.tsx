'use client';

import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { getWheelSpinTransition, type WheelMotionPhase } from './wheel-motion';
import { buildWheelPlan } from './wheel-plan';
import type { WheelPrize } from './wheel-model';
import { FixedWheelIcon, WheelHubIcon } from './wheel-icons';
import { describeWheelSegmentPath } from './wheel-geometry';

function getFixedGroupKind(value: string): 'gift' | 'peach' | 'nothing' | null {
  if (value.startsWith('gift-')) return 'gift';
  if (value.startsWith('peach-')) return 'peach';
  if (value.startsWith('nothing-')) return 'nothing';
  return null;
}

export function WheelRenderer({
  prizes,
  rotation,
  phase,
  spinning = false,
  noSpins = false,
}: {
  prizes: WheelPrize[];
  rotation: number;
  phase: WheelMotionPhase;
  spinning?: boolean;
  noSpins?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompactHeight = useMediaQuery('(max-height: 780px)');
  const isSpinning = spinning || phase === 'spinning';
  const isSettling = phase === 'settling' || phase === 'slowing';
  const plan = useMemo(() => buildWheelPlan(prizes, isMobile, isCompactHeight), [prizes, isCompactHeight, isMobile]);
  const wheelRotationStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: getWheelSpinTransition(phase),
    willChange: 'transform',
  } as CSSProperties;

  const getSegmentGradient = (segment: (typeof plan.segments)[number]) => {
    if (segment.id === 'gift') return ['#A9C9FF', '#5D8CF2', '#2348B5'];
    if (segment.id === 'peach') return ['#8BB6FF', '#4777E4', '#1D3E9F'];
    if (segment.id === 'nothing') return ['#DCEAFF', '#8DB4FA', '#4A74D0'];
    return [segment.tone, segment.tone, segment.tone];
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 0.5, sm: 1 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: { xs: plan.pointerInset, sm: 12 },
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 34, sm: 42 },
          height: { xs: 40, sm: 50 },
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          background: 'linear-gradient(180deg, #B9D9FF 0%, #5B9AF7 42%, #2162D5 100%)',
          zIndex: 3,
          filter: isSpinning ? 'drop-shadow(0 12px 18px rgba(53,103,255,0.26))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.24))',
          animation: isSpinning ? 'wheelPointer 0.72s ease-in-out infinite' : isSettling ? 'wheelPointerSettle 0.42s ease-out' : 'none',
          '@keyframes wheelPointer': {
            '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
            '50%': { transform: 'translateX(-50%) translateY(4px)' },
          },
          '@keyframes wheelPointerSettle': {
            '0%': { transform: 'translateX(-50%) translateY(5px)' },
            '100%': { transform: 'translateX(-50%) translateY(0)' },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />

      {isSpinning ? (
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            width: { xs: 330, sm: 470 },
            height: { xs: 330, sm: 470 },
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 4,
            background: 'radial-gradient(circle, transparent 66%, rgba(255,214,126,0.18) 67%, transparent 69%), conic-gradient(from 20deg, transparent, rgba(255,214,126,0.42), transparent 10%, transparent 55%, rgba(126,190,255,0.38), transparent 65%)',
            animation: 'wheelAura 1.6s ease-in-out infinite',
            '@keyframes wheelAura': {
              '0%, 100%': { transform: 'scale(0.96) rotate(0deg)', opacity: 0.45 },
              '50%': { transform: 'scale(1.03) rotate(12deg)', opacity: 0.9 },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.55 },
          }}
        />
      ) : null}

      <Box
        sx={{
          position: 'relative',
          width: plan.wheelSize,
          maxWidth: '100%',
          aspectRatio: '1 / 1',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {(isSpinning || isSettling) ? (
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: { xs: -18, sm: -28 },
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 5,
              '@keyframes wheelParticle': {
                '0%': { opacity: 0, transform: 'rotate(var(--particle-angle)) translateX(34%) scale(0.35)' },
                '18%': { opacity: 0.9 },
                '100%': { opacity: 0, transform: 'rotate(var(--particle-angle)) translateX(50%) scale(0.05)' },
              },
              '@keyframes wheelParticleSettling': {
                '0%': { opacity: 0, transform: 'rotate(var(--particle-angle)) translateX(16%) scale(0.2)' },
                '35%': { opacity: 1 },
                '100%': { opacity: 0, transform: 'rotate(var(--particle-angle)) translateX(44%) scale(0.02)' },
              },
              '@media (prefers-reduced-motion: reduce)': { display: 'none' },
            }}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <Box
                key={index}
                component="span"
                sx={{
                  '--particle-angle': `${index * 30}deg`,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: { xs: 4, sm: 5 },
                  height: { xs: 4, sm: 5 },
                  borderRadius: '50%',
                  bgcolor: index % 3 === 0 ? '#FFE09A' : index % 3 === 1 ? '#A7CCFF' : '#FFFFFF',
                  boxShadow: '0 0 10px currentColor',
                  animation: `${isSettling ? 'wheelParticleSettling' : 'wheelParticle'} ${isSettling ? 0.72 : 1.55}s cubic-bezier(0.2, 0.8, 0.25, 1) ${index * -0.09}s infinite`,
                }}
              />
            ))}
          </Box>
        ) : null}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 52%, rgba(0,0,0,0.28) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 0 14px rgba(255,255,255,0.02)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: { xs: 4, sm: 8 },
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 42%, rgba(147,190,255,0.18) 0%, rgba(96,139,255,0.08) 32%, transparent 64%)',
            opacity: isSpinning ? 0.9 : 0.55,
            filter: 'blur(8px)',
            transform: 'scale(1.01)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: { xs: 8, sm: 12 },
            borderRadius: '50%',
            ...wheelRotationStyle,
            overflow: 'hidden',
            background: 'transparent',
            transform: `rotate(${rotation}deg) scale(${isSpinning ? 1.01 : 1})`,
            boxShadow:
              isSpinning
                ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.82), inset 0 0 0 18px rgba(5,10,22,0.52), 0 0 0 1px rgba(114,172,255,0.18), 0 22px 58px rgba(0,0,0,0.36)'
                : isSettling
                  ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.90), inset 0 0 0 18px rgba(5,10,22,0.50), 0 0 34px rgba(114,172,255,0.22), 0 18px 42px rgba(0,0,0,0.30)'
                  : 'inset 0 0 0 8px rgba(114, 172, 255, 0.74), inset 0 0 0 18px rgba(5,10,22,0.52), 0 18px 42px rgba(0,0,0,0.30)',
          }}
        >
          <svg
            viewBox="0 0 1000 1000"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <filter id="wheel-token-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#081B52" floodOpacity="0.28" />
              </filter>
              <linearGradient id="wheel-rim-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#CDE2FF" />
                <stop offset="38%" stopColor="#5F98F4" />
                <stop offset="68%" stopColor="#244BAF" />
                <stop offset="100%" stopColor="#8FBBFF" />
              </linearGradient>
              <radialGradient id="wheel-token-gift" cx="32%" cy="28%" r="78%">
                <stop offset="0%" stopColor="#FFF6BE" />
                <stop offset="58%" stopColor="#FFB848" />
                <stop offset="100%" stopColor="#D06916" />
              </radialGradient>
              <radialGradient id="wheel-token-nothing" cx="32%" cy="28%" r="78%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="58%" stopColor="#AECFFF" />
                <stop offset="100%" stopColor="#4E7EDA" />
              </radialGradient>
              {plan.segments.map((segment) => {
                const [light, mid, deep] = getSegmentGradient(segment);
                return (
                  <linearGradient key={`gradient-${segment.id}`} id={`wheel-gradient-${segment.id}`} x1="18%" y1="8%" x2="82%" y2="92%">
                    <stop offset="0%" stopColor={light} />
                    <stop offset="48%" stopColor={mid} />
                    <stop offset="100%" stopColor={deep} />
                  </linearGradient>
                );
              })}
            </defs>
            {plan.segments.map((segment) => (
              <path
                key={`segment-${segment.id}`}
                d={describeWheelSegmentPath(segment)}
                fill={`url(#wheel-gradient-${segment.id})`}
                stroke="rgba(23,55,125,0.68)"
                strokeWidth="6"
                strokeLinejoin="round"
              />
            ))}
            <circle cx="500" cy="500" r="492" fill="none" stroke="url(#wheel-rim-gradient)" strokeWidth="18" opacity="0.96" />
            <circle cx="500" cy="500" r="466" fill="none" stroke="rgba(7,24,72,0.46)" strokeWidth="14" />
            <circle cx="500" cy="500" r="445" fill="none" stroke="rgba(226,240,255,0.20)" strokeWidth="3" />
            {plan.tokenPlacements.map((token) => {
              const fixedIconKind = getFixedGroupKind(token.prizeId);
              if (!fixedIconKind) return null;
              const tokenSize = token.size;
              const fill = fixedIconKind === 'gift'
                ? 'url(#wheel-token-gift)'
                : fixedIconKind === 'peach'
                  ? 'rgba(76,130,232,0.24)'
                  : 'url(#wheel-token-nothing)';
              const iconScale = fixedIconKind === 'peach' ? 0.9 : 0.76;
              const iconVariant = Number((plan.segments.find((segment) => segment.id === token.prizeId)?.metadata as Record<string, unknown> | undefined)?.iconVariant) === 2 ? 2 : 1;
              const tokenLabel = fixedIconKind === 'nothing' ? 'MAY MẮN' : fixedIconKind === 'gift' ? 'QUÀ' : 'ĐÀO';
              return (
                <g key={`token-${token.prizeId}`} transform={`translate(${token.x} ${token.y}) rotate(${-rotation})`}>
                  {fixedIconKind !== 'peach' ? (
                    <>
                      <circle r={tokenSize / 2} fill={fill} stroke="rgba(255,255,255,0.86)" strokeWidth="4" filter="url(#wheel-token-shadow)" />
                      <circle r={tokenSize / 2 - 5} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                    </>
                  ) : null}
                  <g transform={`translate(${-(tokenSize * iconScale) / 2} ${-(tokenSize * iconScale) / 2})`}>
                    <FixedWheelIcon kind={fixedIconKind} variant={iconVariant} size={tokenSize * iconScale} />
                  </g>
                  <text
                    x="0"
                    y={tokenSize * 0.76}
                    textAnchor="middle"
                    fill="#F5F9FF"
                    fontSize={fixedIconKind === 'nothing' ? 18 : 22}
                    fontWeight="800"
                    letterSpacing="1.5"
                    style={{ paintOrder: 'stroke', stroke: 'rgba(8,25,70,0.5)', strokeWidth: 6 }}
                  >
                    {tokenLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'linear-gradient(140deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 74%, rgba(255,255,255,0.12) 100%)',
              mixBlendMode: 'screen',
              opacity: isSpinning ? 0.34 : 0.22,
              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              inset: { xs: isCompactHeight ? '42%' : '40%', sm: '39%' },
              borderRadius: '50%',
              background:
                noSpins
                  ? 'radial-gradient(circle at 32% 28%, #56647D 0%, #293750 48%, #121D35 100%)'
                  : isSpinning
                  ? 'radial-gradient(circle at 32% 28%, #f5fbff 0%, #d6e9ff 32%, #7eb0ff 68%, #2b5cd9 100%)'
                  : 'radial-gradient(circle at 32% 28%, #f8fbff 0%, #e0ecff 36%, #90bcff 74%, #305ee0 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow:
                noSpins
                  ? '0 0 0 1px rgba(255,255,255,0.10), 0 12px 26px rgba(0,0,0,0.32)'
                  : isSpinning
                  ? '0 0 0 1px rgba(255,255,255,0.12), 0 0 34px rgba(95,145,255,0.20), 0 14px 26px rgba(0,0,0,0.22)'
                  : isSettling
                    ? '0 0 0 1px rgba(255,255,255,0.14), 0 0 42px rgba(95,145,255,0.28), 0 14px 26px rgba(0,0,0,0.22)'
                    : '0 12px 24px rgba(0,0,0,0.22)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              animation: isSpinning ? 'wheelHubPulse 1.5s ease-in-out infinite' : isSettling ? 'wheelHubSettle 0.42s ease-out' : 'none',
              '@keyframes wheelHubPulse': {
                '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
                '50%': { transform: 'scale(1.035)', filter: 'brightness(1.08)' },
              },
              '@keyframes wheelHubSettle': {
                '0%': { transform: 'scale(1.08)', filter: 'brightness(1.14)' },
                '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            {noSpins ? (
              <Stack spacing={0.1} alignItems="center">
                <Box component="span" sx={{ color: '#D7E4FF', fontSize: { xs: '1.15rem', sm: '1.35rem' }, lineHeight: 1 }}>🔒</Box>
                <Box component="span" sx={{ color: '#F4F7FF', fontSize: { xs: '0.64rem', sm: '0.72rem' }, fontWeight: 950, letterSpacing: '0.08em', lineHeight: 1.1, textAlign: 'center' }}>HẾT<br />LƯỢT</Box>
              </Stack>
            ) : (
              <WheelHubIcon size={isCompactHeight ? 42 : 48} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
