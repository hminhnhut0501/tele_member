'use client';

import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { getWheelSpinTransition, type WheelMotionPhase } from './wheel-motion';
import { buildWheelPlan } from './wheel-plan';
import type { WheelPrize } from './wheel-model';
import { FixedWheelIcon, WheelHubIcon } from './wheel-icons';

function isFixedGroupIcon(value: string): value is 'gift' | 'peach' | 'nothing' {
  return value === 'gift' || value === 'peach' || value === 'nothing';
}

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
  const arcStartAngle = plan.segments.length === 3 ? -90 - (plan.segments[0]?.sweepAngle ?? segmentAngle) / 2 : -90;
  const getSegmentGradient = (segment: (typeof plan.segments)[number]) => {
    if (segment.id === 'gift') return ['#E6F1FF', '#A9C9FF', '#638FE8'];
    if (segment.id === 'peach') return ['#DCEBFF', '#96BCFA', '#527FD9'];
    if (segment.id === 'nothing') return ['#F5F9FF', '#C7DBFF', '#82A8F1'];
    return [segment.tone, segment.tone, segment.tone];
  };
  const arcStops = plan.segments.flatMap((segment, index) => {
    const start = segment.startAngle ?? index * segmentAngle;
    const end = start + (segment.sweepAngle ?? segmentAngle);
    const [light, mid, deep] = getSegmentGradient(segment);
    return [
      `${light} ${start}deg`,
      `${mid} ${start + segmentAngle * 0.48}deg`,
      `${deep} ${end - segmentAngle * 0.08}deg`,
      `${deep} ${end}deg`,
    ];
  });
  const arc = `conic-gradient(from ${arcStartAngle}deg, ${arcStops.join(', ')})`;

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
            backgroundImage: `${arc}, radial-gradient(circle at 34% 24%, rgba(255,255,255,0.34), transparent 32%), radial-gradient(circle at 72% 82%, rgba(5,18,50,0.18), transparent 42%)`,
            backgroundBlendMode: 'normal, screen, multiply',
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
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {plan.tokenPlacements.map((token) => {
              const tokenSize = token.size;
              const finalX = token.x + token.offsetX;
              const finalY = token.y + token.offsetY;
              const fixedIconKind = isFixedGroupIcon(token.prizeId) ? token.prizeId : null;
              const fixedIcon = fixedIconKind !== null;
              const shouldUseLabel = token.renderMode === 'label-only';
              const iconSize = fixedIcon ? tokenSize * 0.76 : shouldUseLabel ? tokenSize * 0.5 : tokenSize * 0.58;
              const fallbackFontSize = Math.max(15, tokenSize * 0.34);
              return (
                <Box
                  key={token.prizeId}
                  sx={{
                    position: 'absolute',
                    left: `${finalX / 10}%`,
                    top: `${finalY / 10}%`,
                    transform: `translate(-50%, -50%) rotate(${token.counterRotate - rotation}deg)`,
                    width: `${tokenSize}px`,
                    height: `${tokenSize}px`,
                    display: 'grid',
                    placeItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {fixedIcon ? (
                    <Box
                      sx={{
                        width: `${tokenSize}px`,
                        height: `${tokenSize}px`,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        background: token.prizeId === 'gift'
                          ? 'radial-gradient(circle at 32% 28%, rgba(255,246,190,0.98), rgba(255,184,72,0.8) 58%, rgba(208,105,22,0.7))'
                          : token.prizeId === 'peach'
                            ? 'radial-gradient(circle at 32% 28%, rgba(255,235,196,0.98), rgba(255,143,107,0.82) 58%, rgba(197,66,70,0.74))'
                            : 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.96), rgba(174,207,255,0.82) 58%, rgba(78,126,218,0.7))',
                        border: '1px solid rgba(255,255,255,0.72)',
                        boxShadow: '0 5px 14px rgba(8,24,62,0.2), inset 0 1px 0 rgba(255,255,255,0.62)',
                      }}
                    >
                      <FixedWheelIcon kind={fixedIconKind!} size={iconSize} />
                    </Box>
                  ) : token.assetUrl && !shouldUseLabel ? (
                    <Box
                      component="img"
                      src={token.assetUrl}
                      alt=""
                      sx={{
                        position: 'relative',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                        imageRendering: 'auto',
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.14))',
                      }}
                    />
                  ) : (
                    <Typography
                      component="span"
                      sx={{
                        position: 'relative',
                        fontSize: `${fallbackFontSize}px`,
                        lineHeight: 1,
                        fontWeight: 900,
                        color: token.textTone,
                        fontFamily: shouldUseLabel
                          ? 'Inter, ui-sans-serif, system-ui, sans-serif'
                          : '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                        textShadow: '0 1px 1px rgba(0,0,0,0.14)',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.01em',
                        transform: shouldUseLabel ? 'translateY(-1px)' : 'translateY(0)',
                      }}
                    >
                      {shouldUseLabel ? token.label : token.token}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              inset: { xs: isCompactHeight ? '42%' : '40%', sm: '39%' },
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
            <WheelHubIcon size={isCompactHeight ? 42 : 48} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
