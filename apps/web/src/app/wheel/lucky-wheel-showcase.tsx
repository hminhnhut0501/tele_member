'use client';

import Image from 'next/image';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import type { CSSProperties } from 'react';

type WheelPrize = {
  id: string;
  name: string;
  type: string;
  weight: number;
  metadata?: Record<string, unknown> | null;
};

function prizeAccent(prize: WheelPrize, index: number) {
  const type = prize.type?.toUpperCase?.() ?? prize.type;
  if (type === 'POINT') return index % 2 === 0 ? '#ffe08a' : '#d4a433';
  if (type === 'SPIN_TICKET') return index % 2 === 0 ? '#8fd0ff' : '#2563eb';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return index % 2 === 0 ? '#f59e0b' : '#b45309';
  return index % 2 === 0 ? '#1e3a8a' : '#111827';
}

function prizeShortLabel(prize: WheelPrize) {
  const type = prize.type?.toUpperCase?.() ?? prize.type;
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount;
    return amount ? `+${amount}đ` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP Code';
  return prize.name;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function LuckyWheelShowcase({
  prizes,
  spins,
  spinning,
  rotation,
  resultName,
  campaignName,
  campaignDescription,
  onSpin,
  disabled,
}: {
  prizes: WheelPrize[];
  spins: number;
  spinning: boolean;
  rotation: number;
  resultName?: string | null;
  campaignName?: string | null;
  campaignDescription?: string | null;
  onSpin: () => void;
  disabled?: boolean;
}) {
  const slice = Math.max(prizes.length, 1);
  const segmentAngle = 360 / slice;
  const size = 1000;
  const center = size / 2;
  const outerR = 430;
  const innerR = 172;
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 7.6s cubic-bezier(0.16, 0.84, 0.16, 1) 0s' : 'transform 0.55s cubic-bezier(0.2, 0.95, 0.2, 1)',
    willChange: 'transform',
    filter: spinning ? 'drop-shadow(0 0 36px rgba(255,214,102,0.25))' : 'drop-shadow(0 0 18px rgba(255,214,102,0.18))',
  } as CSSProperties;

  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'p1', name: 'Điểm', type: 'POINT', weight: 1, metadata: { points: 10 } },
        { id: 'p2', name: 'Spin', type: 'SPIN_TICKET', weight: 1, metadata: {} },
        { id: 'p3', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
        { id: 'p4', name: 'Lucky', type: 'CUSTOM', weight: 1, metadata: {} },
      ];

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 5, md: 6 },
        border: '1px solid rgba(255, 219, 143, 0.18)',
        bgcolor: '#07160f',
        boxShadow: '0 34px 90px rgba(3, 8, 20, 0.55)',
        backgroundImage:
          'radial-gradient(circle at 20% 15%, rgba(244, 208, 111, 0.18), transparent 20%), radial-gradient(circle at 80% 0%, rgba(49, 196, 141, 0.14), transparent 18%), linear-gradient(180deg, rgba(9, 30, 20, 0.98) 0%, rgba(6, 18, 12, 1) 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.23,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 0%, black 58%, transparent 100%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.98)', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.65rem', sm: '2rem' } }}>
              {campaignName ?? 'Lucky Wheel'}
            </Typography>
            <Typography sx={{ color: 'rgba(245, 231, 194, 0.75)', maxWidth: 560, mt: 0.5, lineHeight: 1.5 }}>
              {campaignDescription ?? 'Vòng quay phần thưởng theo phong cách game, lấy cảm hứng branding Hang Cú.'}
            </Typography>
          </Box>
          <Chip
            label={`${spins} spins`}
            sx={{
              bgcolor: 'rgba(255, 214, 102, 0.18)',
              color: '#ffe7a3',
              border: '1px solid rgba(255, 214, 102, 0.35)',
              fontWeight: 800,
            }}
          />
        </Stack>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 620, sm: 690 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '44px solid transparent',
              borderRight: '44px solid transparent',
              borderTop: '118px solid rgba(255, 213, 109, 0.96)',
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.4))',
              zIndex: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '-34px',
                top: '-112px',
                width: 68,
                height: 68,
                background: 'linear-gradient(180deg, #fffbe6 0%, #ffd55e 55%, #be862a 100%)',
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                opacity: 0.95,
              },
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: { xs: 520, sm: 620, md: 700 },
              maxWidth: '94vw',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              p: { xs: 1.5, sm: 2 },
              background: 'linear-gradient(180deg, #ffe97d 0%, #c69a31 50%, #6e4e11 100%)',
              boxShadow:
                'inset 0 0 0 4px rgba(255,255,255,0.26), inset 0 0 0 18px rgba(8, 22, 14, 0.86), 0 0 0 1px rgba(255,255,255,0.12), 0 34px 68px rgba(0,0,0,0.48)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 10, sm: 14 },
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255, 255, 255, 0.08), rgba(255,255,255,0.02) 58%, rgba(0,0,0,0.2) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
              }}
            />

            <Box sx={{ position: 'absolute', inset: { xs: 18, sm: 22 }, borderRadius: '50%', overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={wheelStyle as any}>
                <defs>
                  <radialGradient id="hubGlow" cx="35%" cy="25%" r="75%">
                    <stop offset="0%" stopColor="#fff8d8" />
                    <stop offset="38%" stopColor="#ffe28a" />
                    <stop offset="70%" stopColor="#cfa23d" />
                    <stop offset="100%" stopColor="#7a5716" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {safePrizes.map((_, index) => {
                    const start = index * segmentAngle;
                    const end = (index + 1) * segmentAngle;
                    return <path key={`arc-${index}`} id={`arc-${index}`} d={describeArc(center, center, outerR - 72, start, end)} />;
                  })}
                </defs>

                <circle cx={center} cy={center} r={outerR} fill="url(#hubGlow)" opacity="0.9" />
                <circle cx={center} cy={center} r={outerR - 2} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="10" />
                <circle cx={center} cy={center} r={outerR - 22} fill="none" stroke="rgba(35,24,8,0.82)" strokeWidth="2" />
                <circle cx={center} cy={center} r={outerR - 38} fill="#fef8eb" />

                {safePrizes.map((prize, index) => {
                  const start = index * segmentAngle;
                  const end = (index + 1) * segmentAngle;
                  const mid = start + segmentAngle / 2;
                  return (
                    <g key={prize.id}>
                      <path
                        d={describeArc(center, center, outerR - 38, start, end) + ` L ${center} ${center} Z`}
                        fill={prizeAccent(prize, index)}
                        opacity="0.96"
                      />
                      <path
                        d={describeArc(center, center, outerR - 38, start, end)}
                        fill="none"
                        stroke="rgba(45, 30, 10, 0.92)"
                        strokeWidth="3"
                      />
                      <path
                        d={describeArc(center, center, outerR - 38, start, end)}
                        fill="none"
                        stroke="rgba(255,255,255,0.28)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        opacity="0.35"
                      />
                      <text
                        fill={prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#111827' : '#0b1220'}
                        fontSize="30"
                        fontWeight="900"
                        textAnchor="middle"
                        style={{ letterSpacing: '0.06em', paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.45)', strokeWidth: 2 }}
                      >
                        <textPath href={`#arc-${index}`} startOffset="50%" textAnchor="middle">
                          {prizeShortLabel(prize)}
                        </textPath>
                      </text>
                      <g transform={`translate(${polarToCartesian(center, center, outerR - 106, mid).x}, ${polarToCartesian(center, center, outerR - 106, mid).y}) rotate(${mid + 90})`}>
                        <circle r="20" fill="rgba(255,255,255,0.25)" />
                      </g>
                    </g>
                  );
                })}

                <circle cx={center} cy={center} r={innerR + 18} fill="rgba(14, 22, 32, 0.1)" />
                <circle cx={center} cy={center} r={innerR} fill="url(#hubGlow)" stroke="rgba(80,58,20,0.82)" strokeWidth="10" />
                <circle cx={center} cy={center} r={innerR - 28} fill="#09202c" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              </svg>

              <Box
                sx={{
                  position: 'absolute',
                  inset: '28%',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ width: { xs: 118, sm: 136 }, height: { xs: 118, sm: 136 }, borderRadius: '50%', overflow: 'hidden', border: '6px solid rgba(76,55,15,0.72)', boxShadow: '0 18px 30px rgba(0,0,0,0.28)' }}>
                    <Image src="/hang-cu-mark.jpg" alt="Hang Cú" width={136} height={136} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
                  </Box>
                  <Typography sx={{ color: '#ffe7a3', fontWeight: 900, letterSpacing: '0.32em', fontSize: '0.72rem' }}>SPIN WHEEL</Typography>
                  <Typography sx={{ color: '#fff5d1', fontWeight: 900, fontSize: { xs: '1.5rem', sm: '1.9rem' }, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.28)' }}>
                    {spinning ? 'ĐANG QUAY' : resultName ?? 'SẴN SÀNG'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(247,245,235,0.75)', fontWeight: 700 }}>
                    {spins > 0 ? `Lượt quay hiện có: ${spins}` : 'Hết lượt quay'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2, width: '100%', display: 'grid', placeItems: 'center' }}>
            <Button
              variant="contained"
              onClick={onSpin}
              disabled={disabled || spinning || spins <= 0}
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1.5, sm: 1.9 },
                minWidth: { xs: 220, sm: 280 },
                borderRadius: 999,
                fontWeight: 900,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                letterSpacing: '0.12em',
                color: '#fff5cc',
                background: 'linear-gradient(180deg, rgba(28,73,244,0.98) 0%, rgba(20,58,207,1) 100%)',
                boxShadow: '0 18px 36px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(255,255,255,0.12)',
                '&:hover': { background: 'linear-gradient(180deg, rgba(46,95,255,0.98) 0%, rgba(20,58,207,1) 100%)' },
              }}
            >
              {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT'}
            </Button>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Chip label="Hang Cú branding" sx={{ bgcolor: 'rgba(255, 230, 163, 0.13)', color: '#ffe7a3', border: '1px solid rgba(255, 230, 163, 0.18)' }} />
          <Chip label="Game UI style" sx={{ bgcolor: 'rgba(29, 78, 216, 0.16)', color: '#c7ddff', border: '1px solid rgba(29, 78, 216, 0.2)' }} />
          <Chip label={`${safePrizes.length} phần thưởng`} sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#c9f7e8', border: '1px solid rgba(16, 185, 129, 0.18)' }} />
        </Stack>
      </Box>
    </Box>
  );
}
