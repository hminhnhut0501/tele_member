'use client';

import { Box, Typography } from '@mui/material';
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
  spinning,
  spinPhase,
  rotation,
  centerLabel = 'GO',
  labelRadius = segments.length <= 5 ? 32 : segments.length <= 8 ? 30 : 28,
  wheelLabelScale = 1,
  labelInset = 10,
}: {
  segments: WheelRenderSegment[];
  spinning: boolean;
  spinPhase: 'idle' | 'spinning' | 'settling';
  rotation: number;
  centerLabel?: string;
  labelRadius?: number;
  wheelLabelScale?: number;
  labelInset?: number;
}) {
  const segmentAngle = getWheelSegmentAngle(segments.length);
  const svgId = useId();
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition:
      spinPhase === 'spinning'
        ? 'transform 6.6s cubic-bezier(0.14, 0.82, 0.18, 1)'
        : spinPhase === 'settling'
          ? 'transform 0.34s cubic-bezier(0.22, 1.24, 0.36, 1)'
          : 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  } as CSSProperties;

  const arc = `conic-gradient(from -90deg, ${segments.map((segment, index) => `${segment.tone} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(', ')})`;
  const isSpinning = spinPhase === 'spinning';
  const isSettling = spinPhase === 'settling';
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 0.5, sm: 1 },
        py: { xs: 0.5, sm: 1 },
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
          borderTop: { xs: '48px solid rgba(102, 168, 255, 0.98)', sm: '60px solid rgba(102, 168, 255, 0.98)' },
          filter: isSpinning ? 'drop-shadow(0 12px 16px rgba(53,103,255,0.30))' : 'drop-shadow(0 10px 14px rgba(0,0,0,0.24))',
          zIndex: 3,
          animation: isSpinning ? 'pointerBounce 0.86s ease-in-out infinite' : 'none',
          '@keyframes pointerBounce': {
            '0%,100%': { transform: 'translateX(-50%) translateY(0) scale(1)' },
            '50%': { transform: 'translateX(-50%) translateY(-4px) scale(1.04)' },
          },
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
          animation: isSpinning ? 'wheelFloat 1.8s ease-in-out infinite' : isSettling ? 'wheelFloat 2.4s ease-in-out infinite' : 'wheelRest 4.8s ease-in-out infinite',
          '@keyframes wheelFloat': {
            '0%,100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-3px) scale(1.004)' },
          },
          '@keyframes wheelRest': {
            '0%,100%': { transform: 'translateY(0px) scale(1)' },
            '50%': { transform: 'translateY(-1px) scale(1.002)' },
          },
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
            opacity: isSpinning ? 0.92 : 0.6,
            filter: 'blur(8px)',
            transform: 'scale(1.01)',
            pointerEvents: 'none',
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
            transform: `rotate(${rotation}deg) ${isSpinning ? 'scale(1.014)' : isSettling ? 'scale(1.01)' : 'scale(1)'}`,
            boxShadow:
              isSpinning
                ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.78), inset 0 0 0 18px rgba(5,10,22,0.52), 0 0 0 1px rgba(114,172,255,0.18), 0 22px 58px rgba(0,0,0,0.36)'
                : isSettling
                  ? 'inset 0 0 0 8px rgba(114, 172, 255, 0.88), inset 0 0 0 18px rgba(5,10,22,0.50), 0 0 34px rgba(114,172,255,0.22), 0 18px 42px rgba(0,0,0,0.30)'
                  : 'inset 0 0 0 8px rgba(114, 172, 255, 0.74), inset 0 0 0 18px rgba(5,10,22,0.52), 0 18px 42px rgba(0,0,0,0.30)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              background:
                'linear-gradient(140deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 74%, rgba(255,255,255,0.12) 100%)',
              mixBlendMode: 'screen',
              opacity: isSpinning ? 0.42 : 0.24,
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              inset: -18,
              borderRadius: '50%',
              pointerEvents: 'none',
              background:
                isSpinning
                  ? 'radial-gradient(circle at 50% 50%, rgba(109,156,255,0.20) 0%, rgba(109,156,255,0.08) 38%, transparent 68%)'
                  : isSettling
                    ? 'radial-gradient(circle at 50% 50%, rgba(109,156,255,0.14) 0%, rgba(109,156,255,0.05) 40%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 72%)',
              filter: 'blur(2px)',
              animation: isSpinning ? 'wheelGlowPulse 1.1s ease-in-out infinite' : 'none',
              '@keyframes wheelGlowPulse': {
                '0%,100%': { transform: 'scale(0.98)', opacity: 0.55 },
                '50%': { transform: 'scale(1.03)', opacity: 1 },
              },
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
                      fontSize={`${0.6 * segment.labelPolicy.fontScale * wheelLabelScale}rem`}
                      letterSpacing="-0.02em"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      paintOrder="stroke"
                      stroke="rgba(0,0,0,0.28)"
                      strokeWidth="1.5"
                      lengthAdjust="spacingAndGlyphs"
                      textLength={Math.max(12, 32 - labelInset * 1.2)}
                      style={{
                        textShadow: '0 1px 4px rgba(0,0,0,0.18)',
                        filter: isSpinning ? 'drop-shadow(0 0 6px rgba(255,255,255,0.16))' : 'none',
                      }}
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
              inset: { xs: '36%', sm: '37%' },
              borderRadius: '50%',
              background:
                isSpinning
                  ? 'radial-gradient(circle at 32% 28%, #f5fbff 0%, #d6e9ff 32%, #7eb0ff 68%, #2b5cd9 100%)'
                  : 'radial-gradient(circle at 32% 28%, #f8fbff 0%, #e0ecff 36%, #90bcff 74%, #305ee0 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow:
                isSpinning
                  ? '0 0 0 1px rgba(255,255,255,0.12), 0 0 34px rgba(95,145,255,0.22), 0 14px 26px rgba(0,0,0,0.22)'
                  : isSettling
                    ? '0 0 0 1px rgba(255,255,255,0.14), 0 0 42px rgba(95,145,255,0.30), 0 14px 26px rgba(0,0,0,0.22)'
                    : '0 12px 24px rgba(0,0,0,0.22)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              animation: isSpinning ? 'centerPulse 1.05s ease-in-out infinite' : 'none',
              '@keyframes centerPulse': {
                '0%,100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.025)' },
              },
            }}
          >
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 28, sm: 36 },
              height: { xs: 28, sm: 36 },
              borderRadius: '50%',
              bgcolor: isSettling ? 'rgba(102, 168, 255,0.98)' : 'rgba(102, 168, 255,0.88)',
              boxShadow:
                isSpinning
                  ? '0 0 0 8px rgba(102,168,255,0.10), 0 0 24px rgba(102,168,255,0.40)'
                  : '0 0 0 8px rgba(102,168,255,0.08), 0 0 16px rgba(102,168,255,0.28)',
              zIndex: 4,
              clipPath: 'polygon(50% 0%, 100% 55%, 50% 100%, 0% 55%)',
              animation: isSpinning ? 'pointerPulse 0.9s ease-in-out infinite' : 'none',
              '@keyframes pointerPulse': {
                '0%,100%': { transform: 'translateX(-50%) translateY(0) scale(1)' },
                '50%': { transform: 'translateX(-50%) translateY(-2px) scale(1.08)' },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
