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
  if (type === 'POINT') return index % 2 === 0 ? '#6ea8ff' : '#2563eb';
  if (type === 'SPIN_TICKET') return index % 2 === 0 ? '#9fd7ff' : '#0ea5e9';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return index % 2 === 0 ? '#1d4ed8' : '#0f172a';
  return index % 2 === 0 ? '#1e40af' : '#0b1220';
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
        border: '1px solid rgba(103, 170, 255, 0.14)',
        bgcolor: '#0a1224',
        boxShadow: '0 34px 90px rgba(3, 8, 20, 0.55)',
        backgroundImage:
          'radial-gradient(circle at 20% 15%, rgba(59,130,246,0.22), transparent 20%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.14), transparent 18%), linear-gradient(180deg, rgba(10,18,36,0.98) 0%, rgba(6,10,20,1) 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.23,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 0%, black 58%, transparent 100%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.98)', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}>
              {campaignName ?? 'Lucky Wheel'}
            </Typography>
            <Typography sx={{ color: 'rgba(231, 239, 255, 0.72)', maxWidth: 560, mt: 0.5, lineHeight: 1.45 }}>
              {campaignDescription ?? 'Vòng quay phần thưởng theo phong cách game, lấy cảm hứng branding Hang Cú.'}
            </Typography>
          </Box>
          <Chip
            label={`${spins} spins`}
            sx={{
              bgcolor: 'rgba(37, 99, 235, 0.18)',
              color: '#dbeafe',
              border: '1px solid rgba(96, 165, 250, 0.28)',
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
              borderTop: '118px solid rgba(96, 165, 250, 0.96)',
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.4))',
              zIndex: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '-34px',
                top: '-112px',
                width: 68,
                height: 68,
                background: 'linear-gradient(180deg, #eef6ff 0%, #7fb4ff 55%, #1d4ed8 100%)',
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
              background: 'linear-gradient(180deg, #6ea8ff 0%, #1d4ed8 46%, #081223 100%)',
              boxShadow:
                'inset 0 0 0 4px rgba(255,255,255,0.20), inset 0 0 0 18px rgba(8, 17, 33, 0.92), 0 0 0 1px rgba(255,255,255,0.12), 0 34px 68px rgba(0,0,0,0.48)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 10, sm: 14 },
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255, 255, 255, 0.10), rgba(255,255,255,0.03) 58%, rgba(0,0,0,0.26) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
              }}
            />

            <Box sx={{ position: 'absolute', inset: { xs: 18, sm: 22 }, borderRadius: '50%', overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={wheelStyle as any}>
                <defs>
                  <radialGradient id="hubGlow" cx="35%" cy="25%" r="75%">
                    <stop offset="0%" stopColor="#edf6ff" />
                    <stop offset="38%" stopColor="#8ec0ff" />
                    <stop offset="70%" stopColor="#2b62e6" />
                    <stop offset="100%" stopColor="#07142a" />
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
                <circle cx={center} cy={center} r={outerR - 22} fill="none" stroke="rgba(7,18,44,0.82)" strokeWidth="2" />
                <circle cx={center} cy={center} r={outerR - 38} fill="#f8fbff" />

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
                        fill={prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#0f172a' : '#081223'}
                        fontSize="24"
                        fontWeight="900"
                        textAnchor="middle"
                        style={{ letterSpacing: '0.04em', paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }}
                      >
                        <textPath href={`#arc-${index}`} startOffset="50%" textAnchor="middle">
                          {prizeShortLabel(prize)}
                        </textPath>
                      </text>
                      <g transform={`translate(${polarToCartesian(center, center, outerR - 106, mid).x}, ${polarToCartesian(center, center, outerR - 106, mid).y}) rotate(${mid + 90})`}>
                        <circle r="18" fill="rgba(255,255,255,0.22)" />
                      </g>
                    </g>
                  );
                })}

                <circle cx={center} cy={center} r={innerR + 18} fill="rgba(14, 22, 32, 0.1)" />
                <circle cx={center} cy={center} r={innerR} fill="url(#hubGlow)" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
                <circle cx={center} cy={center} r={innerR - 28} fill="#081223" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
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
                  <Box sx={{ width: { xs: 118, sm: 136 }, height: { xs: 118, sm: 136 }, borderRadius: '50%', overflow: 'hidden', border: '6px solid rgba(8,18,35,0.72)', boxShadow: '0 18px 30px rgba(0,0,0,0.28)' }}>
                    <Image src="/hang-cu-mark.jpg" alt="Hang Cú" width={136} height={136} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
                  </Box>
                  <Typography sx={{ color: '#9cc7ff', fontWeight: 900, letterSpacing: '0.32em', fontSize: '0.72rem' }}>SPIN WHEEL</Typography>
                  <Typography sx={{ color: '#f6fbff', fontWeight: 900, fontSize: { xs: '1.42rem', sm: '1.82rem' }, lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,0.28)' }}>
                    {spinning ? 'ĐANG QUAY' : resultName ?? 'SẴN SÀNG'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(229,239,255,0.72)', fontWeight: 700 }}>
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
                color: '#f8fbff',
                background: 'linear-gradient(180deg, rgba(37,99,235,0.98) 0%, rgba(30,64,175,1) 100%)',
                boxShadow: '0 18px 36px rgba(37,99,235,0.44), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(255,255,255,0.12)',
                '&:hover': { background: 'linear-gradient(180deg, rgba(59,130,246,0.98) 0%, rgba(30,64,175,1) 100%)' },
              }}
            >
              {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT'}
            </Button>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Chip label="Hang Cú branding" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)' }} />
          <Chip label="Game UI style" sx={{ bgcolor: 'rgba(96,165,250,0.16)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.2)' }} />
          <Chip label={`${safePrizes.length} phần thưởng`} sx={{ bgcolor: 'rgba(14,165,233,0.14)', color: '#cffafe', border: '1px solid rgba(14,165,233,0.18)' }} />
        </Stack>
      </Box>
    </Box>
  );
}
