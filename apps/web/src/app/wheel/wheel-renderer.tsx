'use client';

import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { getWheelSpinTransition, type WheelMotionPhase } from './wheel-motion';
import { buildWheelPlan } from './wheel-plan';
import type { WheelPrize } from './wheel-model';

export function WheelRenderer({
  prizes,
  rotation,
  phase,
  spinning = false,
}: {
  prizes: WheelPrize[];
  rotation: number;
  phase: WheelMotionPhase;
  spinning?: boolean;
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

  const segmentAngle = plan.segmentAngle;
  const arc = `conic-gradient(from -90deg, ${plan.segments.map((segment, index) => `${segment.tone} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(', ')})`;

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
          width: 0,
          height: 0,
          borderLeft: { xs: '16px solid transparent', sm: '20px solid transparent' },
          borderRight: { xs: '16px solid transparent', sm: '20px solid transparent' },
          borderTop: { xs: '38px solid rgba(102, 168, 255, 0.98)', sm: '52px solid rgba(102, 168, 255, 0.98)' },
          zIndex: 3,
          filter: isSpinning ? 'drop-shadow(0 12px 18px rgba(53,103,255,0.26))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.24))',
        }}
      />

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
            background: arc,
            transform: `rotate(${rotation}deg) scale(${isSpinning ? 1.01 : 1})`,
            boxShadow:
              isSpinning
                ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.82), inset 0 0 0 18px rgba(5,10,22,0.52), 0 0 0 1px rgba(114,172,255,0.18), 0 22px 58px rgba(0,0,0,0.36)'
                : isSettling
                  ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.90), inset 0 0 0 18px rgba(5,10,22,0.50), 0 0 34px rgba(114,172,255,0.22), 0 18px 42px rgba(0,0,0,0.30)'
                  : 'inset 0 0 0 8px rgba(114, 172, 255, 0.74), inset 0 0 0 18px rgba(5,10,22,0.52), 0 18px 42px rgba(0,0,0,0.30)',
          }}
        >
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
            component="svg"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid meet"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            {plan.tokenPlacements.map((token) => {
              const tokenSize = token.size;
              const glyphFontSize = Math.max(18, tokenSize * (token.renderMode === 'label-only' ? 0.46 : 0.58));
              const badgeRadius = token.renderMode === 'label-only' ? tokenSize * 0.46 : tokenSize * 0.5;
              const finalX = token.x + token.offsetX;
              const finalY = token.y + token.offsetY;
              const shouldUseLabel = token.renderMode === 'label-only';
              return (
                <g
                  key={token.prizeId}
                  transform={`translate(${finalX}, ${finalY}) rotate(${token.counterRotate})`}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r={badgeRadius}
                    fill={shouldUseLabel ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.12)'}
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth="1"
                    filter="url(#wheelTokenShadow)"
                  />
                  <foreignObject
                    x={-tokenSize / 2}
                    y={-tokenSize / 2}
                    width={tokenSize}
                    height={tokenSize}
                  >
                    <Box
                      component="div"
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        color: token.textTone,
                        textAlign: 'center',
                        overflow: 'hidden',
                        borderRadius: shouldUseLabel ? 1 : 999,
                        px: shouldUseLabel ? 0.35 : 0,
                        py: shouldUseLabel ? 0.15 : 0,
                        fontWeight: 900,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: `${glyphFontSize}px`,
                          lineHeight: 1,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                          display: 'block',
                          width: '100%',
                          transform: shouldUseLabel ? 'translateY(-1px)' : 'translateY(0)',
                          fontFamily:
                            token.renderMode === 'label-only'
                              ? 'Inter, ui-sans-serif, system-ui, sans-serif'
                              : '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                          textShadow: '0 1px 2px rgba(0,0,0,0.18)',
                        }}
                      >
                        {shouldUseLabel ? token.label : token.token}
                      </Typography>
                    </Box>
                  </foreignObject>
                </g>
              );
            })}
            <defs>
              <filter id="wheelTokenShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.18)" />
              </filter>
            </defs>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              inset: { xs: isCompactHeight ? '36%' : '35%', sm: '34%' },
              borderRadius: '50%',
              background:
                isSpinning
                  ? 'radial-gradient(circle at 32% 28%, #f5fbff 0%, #d6e9ff 32%, #7eb0ff 68%, #2b5cd9 100%)'
                  : 'radial-gradient(circle at 32% 28%, #f8fbff 0%, #e0ecff 36%, #90bcff 74%, #305ee0 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow:
                isSpinning
                  ? '0 0 0 1px rgba(255,255,255,0.12), 0 0 34px rgba(95,145,255,0.20), 0 14px 26px rgba(0,0,0,0.22)'
                  : isSettling
                    ? '0 0 0 1px rgba(255,255,255,0.14), 0 0 42px rgba(95,145,255,0.28), 0 14px 26px rgba(0,0,0,0.22)'
                    : '0 12px 24px rgba(0,0,0,0.22)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
            }}
          >
            <Stack spacing={0.2} alignItems="center" sx={{ color: '#3d2a05', px: 1, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.64rem', sm: '0.72rem' }, letterSpacing: '0.32em', lineHeight: 1 }}>
                SPIN
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.96rem', sm: '1.1rem' }, lineHeight: 1.05 }}>
                Sẵn sàng
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
