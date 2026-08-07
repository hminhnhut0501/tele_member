'use client';

import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { CSSProperties } from 'react';
import { getWheelSegmentAngle } from './wheel-engine';
import type { WheelRenderSegment } from './wheel-contract';

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function getWheelLayout(segmentCount: number, isMobile: boolean) {
  const compact = segmentCount >= 8;
  const dense = segmentCount >= 10;

  return {
    wheelSize: isMobile
      ? compact
        ? 'min(82vw, 370px)'
        : 'min(80vw, 400px)'
      : compact
        ? 'min(76vw, 560px)'
        : 'min(72vw, 520px)',
    labelRadius: isMobile
      ? dense
        ? 332
        : compact
          ? 352
          : 368
      : dense
        ? 320
        : compact
          ? 340
          : 384,
    labelInset: isMobile
      ? dense
        ? 4
        : compact
          ? 6
          : 8
      : dense
        ? 8
        : compact
          ? 10
          : 12,
    maxEmojiTokens: isMobile ? 1 : dense ? 1 : compact ? 1 : 2,
    labelChipSize: isMobile ? (dense ? 30 : compact ? 34 : 38) : (dense ? 36 : compact ? 42 : 46),
    maxLabelWidth: isMobile ? (dense ? 38 : compact ? 42 : 46) : (dense ? 44 : compact ? 50 : 56),
    labelArcRadius: isMobile ? (dense ? 334 : compact ? 352 : 372) : (dense ? 332 : compact ? 354 : 390),
    labelArcFontSize: isMobile ? (dense ? 20 : compact ? 22 : 24) : (dense ? 22 : compact ? 24 : 28),
    emojiBaseSize: isMobile
      ? dense
        ? 0.86
        : compact
          ? 0.96
          : 1.02
      : dense
        ? 0.98
        : compact
          ? 1.04
          : 1.12,
  };
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isShortPortrait = useMediaQuery('(max-height: 780px)');
  const isPortraitCompact = isMobile && isShortPortrait;
  const segmentAngle = getWheelSegmentAngle(segments.length);
  const layout = getWheelLayout(segments.length, isMobile);
  const resolvedLabelRadius = labelRadius ?? layout.labelRadius;
  const resolvedLabelInset = Math.max(labelInset, layout.labelInset);
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
          width: layout.wheelSize,
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

          <Box
            component="svg"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              pointerEvents: 'none',
            }}
          >
            <defs>
              {segments.map((segment, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                const kindBias =
                  segment.labelPolicy.kind === 'value'
                    ? 8
                    : segment.labelPolicy.kind === 'badge'
                      ? 4
                      : segment.labelPolicy.kind === 'phrase'
                        ? -2
                        : 0;
                const arcRadius = layout.labelArcRadius + segment.labelPolicy.radiusShift + kindBias + segment.slotBias;
                const pathId = `wheel-label-${segment.id.replace(/[^a-z0-9_-]/gi, '-')}`;
                return (
                  <path
                    key={pathId}
                    id={pathId}
                    d={describeArc(500, 500, arcRadius, startAngle + 10, endAngle - 10)}
                    fill="none"
                  />
                );
              })}
            </defs>

            {segments.map((segment, index) => {
              if (!segment.showLabelOnWheel) return null;
              const glyph = segment.glyph || segment.labelPolicy.glyph || '✦';
              const mode = segment.labelPolicy.renderMode;
              const tokenCount = Math.max(
                1,
                Math.min(
                  Number((segment.metadata as any)?.emojiCount ?? segment.emojiCount ?? (segment.metadata as any)?.tokenCount ?? 1),
                  layout.maxEmojiTokens,
                ),
              );
              const tokenRow = mode === 'label-only' ? segment.displayLabel : Array.from({ length: tokenCount }).map(() => glyph).join(' ');
              const labelPathId = `wheel-label-${segment.id.replace(/[^a-z0-9_-]/gi, '-')}`;
              const labelFontSize =
                layout.labelArcFontSize *
                wheelLabelScale *
                segment.labelPolicy.fontScale *
                (mode === 'label-only'
                  ? segment.labelPolicy.kind === 'value'
                    ? 0.9
                    : segment.labelPolicy.kind === 'badge'
                      ? 0.88
                      : 0.84
                  : segment.labelPolicy.kind === 'value'
                    ? 1.16
                    : segment.labelPolicy.kind === 'badge'
                      ? 1.08
                      : 1.0);
              const labelDy = isPortraitCompact
                ? segment.labelPolicy.kind === 'value'
                  ? '-0.04em'
                  : segment.labelPolicy.kind === 'badge'
                    ? '-0.03em'
                    : '0.00em'
                : segment.labelPolicy.kind === 'value'
                  ? '-0.02em'
                  : segment.labelPolicy.kind === 'badge'
                    ? '-0.01em'
                    : '0.01em';
              return (
                <text
                  key={`${segment.id}-svg-label`}
                  fill={segment.textTone}
                  fontFamily='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
                  fontWeight={900}
                  fontSize={labelFontSize}
                  letterSpacing={mode === 'label-only' ? 0.06 : segment.labelPolicy.kind === 'value' ? 0.4 : 0.2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  filter={isSpinning ? 'drop-shadow(0 0 6px rgba(255,255,255,0.16))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.14))'}
                >
                  <textPath href={`#${labelPathId}`} startOffset="50%" method="align" spacing="auto" dy={labelDy}>
                    {tokenRow}
                  </textPath>
                </text>
              );
            })}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              inset: { xs: isPortraitCompact ? '38%' : '36%', sm: '37%' },
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
            {centerLabel ? (
              <Stack spacing={0.2} alignItems="center" sx={{ color: '#3d2a05', px: 1, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.62rem', sm: '0.72rem' }, letterSpacing: '0.32em', lineHeight: 1 }}>
                  SPIN
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.94rem', sm: '1.08rem' }, lineHeight: 1.05 }}>
                  {centerLabel}
                </Typography>
              </Stack>
            ) : null}
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: { xs: isPortraitCompact ? 6 : 8, sm: 12 },
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: isPortraitCompact ? 24 : 28, sm: 36 },
              height: { xs: isPortraitCompact ? 24 : 28, sm: 36 },
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
