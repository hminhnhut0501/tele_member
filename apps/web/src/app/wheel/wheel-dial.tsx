'use client';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { getWheelSegmentAngle } from './wheel-engine';
import type { WheelRenderSegment } from './wheel-contract';

function polarToViewBox(angleDeg: number, radius: number, center = 50) {
  const radians = (angleDeg * Math.PI) / 180;
  const x = center + Math.cos(radians) * radius;
  const y = center + Math.sin(radians) * radius;
  return { x, y };
}

function svgArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToViewBox(startAngle, radius, cx);
  const end = polarToViewBox(endAngle, radius, cx);
  const sweep = endAngle > startAngle ? 1 : 0;
  const delta = Math.abs(endAngle - startAngle);
  const largeArc = delta > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

export function WheelDial({
  segments,
  spins,
  spinning,
  rotation,
  resultName,
  onSpin,
  disabled,
  chipLabelLimit = segments.length,
  labelRadius = segments.length <= 5 ? 32 : segments.length <= 8 ? 30 : 28,
  wheelLabelScale = 1,
}: {
  segments: WheelRenderSegment[];
  spins: number;
  spinning: boolean;
  rotation: number;
  resultName?: string | null;
  onSpin: () => void;
  disabled?: boolean;
  chipLabelLimit?: number;
  labelRadius?: number;
  wheelLabelScale?: number;
}) {
  const segmentAngle = getWheelSegmentAngle(segments.length);
  const svgId = useId();
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 6.6s cubic-bezier(0.16, 0.84, 0.18, 1)' : 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  } as CSSProperties;

  const arc = `conic-gradient(from -90deg, ${segments.map((segment, index) => `${segment.tone} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(', ')})`;
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 0.5, sm: 1 },
        py: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 14 },
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: { xs: '18px solid transparent', sm: '23px solid transparent' },
          borderRight: { xs: '18px solid transparent', sm: '23px solid transparent' },
          borderTop: { xs: '48px solid rgba(244, 209, 96, 0.98)', sm: '60px solid rgba(244, 209, 96, 0.98)' },
          filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.24))',
          zIndex: 3,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          width: 'min(84vw, 520px)',
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
            inset: { xs: 8, sm: 14 },
            borderRadius: '50%',
            ...wheelStyle,
            overflow: 'hidden',
            background: arc,
            boxShadow:
              'inset 0 0 0 8px rgba(255, 214, 107, 0.80), inset 0 0 0 18px rgba(5,10,22,0.52), 0 18px 42px rgba(0,0,0,0.30)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.10) 0 0.5deg, transparent 0.5deg 30deg)',
              opacity: 0.45,
            }}
          />

          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
            {segments.map((segment, index) => {
              if (!segment.showLabelOnWheel) return null;
              const start = index * segmentAngle - 90 + 7;
              const end = (index + 1) * segmentAngle - 90 - 7;
              const pathId = `${svgId}-label-${segment.id}`;
              return (
                <Box
                  key={`${segment.id}-label`}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }} aria-hidden="true">
                    <defs>
                      <path id={pathId} d={svgArcPath(50, 50, labelRadius + segment.labelPolicy.radiusShift * 2, start, end)} />
                    </defs>
                    <text
                      fill={segment.textTone}
                      fontWeight={900}
                      fontSize={`${0.62 * segment.labelPolicy.fontScale * wheelLabelScale}rem`}
                      letterSpacing="-0.02em"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      paintOrder="stroke"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="1.25"
                      style={{ textShadow: '0 1px 5px rgba(0,0,0,0.24)' }}
                    >
                      <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                        {segment.displayLabel}
                      </textPath>
                    </text>
                  </svg>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              inset: { xs: '34%', sm: '35%' },
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 32% 28%, #fffefb 0%, #f7e6b8 36%, #d7b95f 72%, #af8836 100%)',
              border: '1px solid rgba(255,255,255,0.26)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.22)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
            }}
          >
            <Stack spacing={0.15} alignItems="center" sx={{ px: 1 }}>
              <Typography sx={{ color: '#7a4910', fontWeight: 900, letterSpacing: '0.24em', fontSize: { xs: '0.55rem', sm: '0.66rem' } }}>
                REVEAL
              </Typography>
              <Typography sx={{ color: '#2a1704', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '0.9rem', sm: '1.04rem' }, lineHeight: 1 }}>
                {spinning ? 'Đang quay' : resultName ?? 'Sẵn sàng'}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Button
        onClick={onSpin}
        disabled={disabled || spinning || spins <= 0}
        variant="contained"
        sx={{
          mt: 2,
          minWidth: { xs: 220, sm: 280 },
          px: { xs: 4, sm: 6 },
          py: { xs: 1.25, sm: 1.5 },
          borderRadius: 999,
          fontWeight: 900,
          fontSize: { xs: '0.95rem', sm: '1rem' },
          letterSpacing: '0.08em',
          color: '#f7fbff',
          background: 'linear-gradient(180deg, rgba(63,105,236,1) 0%, rgba(28,56,168,1) 100%)',
          boxShadow: '0 14px 28px rgba(33,69,191,0.24)',
          '&:hover': {
            background: 'linear-gradient(180deg, rgba(88,131,255,1) 0%, rgba(28,56,168,1) 100%)',
          },
        }}
      >
        {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT QUAY'}
      </Button>

      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.75, maxWidth: 520 }}>
        {segments.slice(0, chipLabelLimit).map((segment) => (
          <Chip
            key={segment.id}
            label={segment.railLabel}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              color: '#ecf2ff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontWeight: 700,
            }}
          />
        ))}
        {segments.length > chipLabelLimit ? (
          <Chip
            label={`+${segments.length - chipLabelLimit} more`}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              color: '#ecf2ff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontWeight: 700,
            }}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
