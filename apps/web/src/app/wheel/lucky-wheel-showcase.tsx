'use client';

import { Box, Button, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
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
  if (type === 'POINT') return index % 2 === 0 ? '#71a9ff' : '#2f6df1';
  if (type === 'SPIN_TICKET') return index % 2 === 0 ? '#8ccfff' : '#249be8';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return index % 2 === 0 ? '#233d96' : '#101a36';
  return index % 2 === 0 ? '#1b4db8' : '#0d1630';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const slice = Math.max(prizes.length, 1);
  const segmentAngle = 360 / slice;
  const size = 1000;
  const center = size / 2;
  const outerR = isMobile ? 376 : 424;
  const innerR = isMobile ? 130 : 150;
  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'p1', name: 'Điểm', type: 'POINT', weight: 1, metadata: { points: 10 } },
        { id: 'p2', name: 'Spin', type: 'SPIN_TICKET', weight: 1, metadata: {} },
        { id: 'p3', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
        { id: 'p4', name: 'Lucky', type: 'CUSTOM', weight: 1, metadata: {} },
      ];
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 8s cubic-bezier(0.12, 0.8, 0.16, 1) 0s' : 'transform 0.55s cubic-bezier(0.2, 0.95, 0.2, 1)',
    willChange: 'transform',
  } as CSSProperties;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 4, md: 6 },
        border: '1px solid rgba(103,170,255,0.14)',
        bgcolor: '#0a1224',
        boxShadow: '0 32px 80px rgba(3, 8, 20, 0.54)',
        backgroundImage:
          'radial-gradient(circle at 18% 14%, rgba(59,130,246,0.20), transparent 18%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.12), transparent 16%), linear-gradient(180deg, rgba(10,18,36,0.98) 0%, rgba(6,10,20,1) 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(circle at center, black 0%, black 60%, transparent 100%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 1.5, sm: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#f5f9ff', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '1.2rem', sm: '1.6rem' }, lineHeight: 1.08 }}>
              {campaignName ?? 'Lucky Wheel'}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(229,239,255,0.72)',
                maxWidth: 600,
                mt: 0.5,
                lineHeight: 1.4,
                fontSize: { xs: '0.92rem', sm: '1rem' },
              }}
            >
              {campaignDescription ?? 'Vòng quay phần thưởng theo phong cách game, lấy cảm hứng branding Hang Cú.'}
            </Typography>
          </Box>
          <Chip
            label={`${spins} spins`}
            sx={{
              bgcolor: 'rgba(37,99,235,0.18)',
              color: '#dbeafe',
              border: '1px solid rgba(96,165,250,0.28)',
              fontWeight: 800,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 440, sm: 560 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 0.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 0 : 2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: isMobile ? '28px solid transparent' : '38px solid transparent',
              borderRight: isMobile ? '28px solid transparent' : '38px solid transparent',
              borderTop: isMobile ? '82px solid rgba(96,165,250,0.94)' : '104px solid rgba(96,165,250,0.94)',
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.4))',
              zIndex: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: isMobile ? '-20px' : '-28px',
                top: isMobile ? '-77px' : '-98px',
                width: isMobile ? 40 : 56,
                height: isMobile ? 40 : 56,
                background: 'linear-gradient(180deg, #eef6ff 0%, #7fb4ff 55%, #1d4ed8 100%)',
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                opacity: 0.96,
              },
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: isMobile ? 408 : 600,
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              p: { xs: 1, sm: 1.5 },
              background: 'linear-gradient(180deg, #67a2ff 0%, #1d4ed8 46%, #081223 100%)',
              boxShadow:
                'inset 0 0 0 4px rgba(255,255,255,0.16), inset 0 0 0 14px rgba(8,17,33,0.92), 0 0 0 1px rgba(255,255,255,0.10), 0 24px 44px rgba(0,0,0,0.36)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 12, sm: 16 },
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 58%, rgba(0,0,0,0.20) 100%)',
              }}
            />

            <Box sx={{ position: 'absolute', inset: { xs: 16, sm: 20 }, borderRadius: '50%', overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={wheelStyle}>
                <defs>
                  <radialGradient id="hubGlow" cx="35%" cy="25%" r="75%">
                    <stop offset="0%" stopColor="#edf6ff" />
                    <stop offset="38%" stopColor="#8ec0ff" />
                    <stop offset="70%" stopColor="#2b62e6" />
                    <stop offset="100%" stopColor="#07142a" />
                  </radialGradient>
                  {safePrizes.map((_, index) => {
                    const start = index * segmentAngle;
                    const end = (index + 1) * segmentAngle;
                    return <path key={`arc-${index}`} id={`arc-${index}`} d={describeArc(center, center, outerR - 74, start, end)} />;
                  })}
                </defs>

                <circle cx={center} cy={center} r={outerR} fill="url(#hubGlow)" opacity="0.9" />
                <circle cx={center} cy={center} r={outerR - 24} fill="none" stroke="rgba(255,255,255,0.56)" strokeWidth="4" />
                <circle cx={center} cy={center} r={outerR - 40} fill="#f8fbff" />

                {safePrizes.map((prize, index) => {
                  const start = index * segmentAngle;
                  const end = (index + 1) * segmentAngle;
                  const mid = start + segmentAngle / 2;
                  const labelPoint = polarToCartesian(center, center, outerR - 110, mid);
                  return (
                    <g key={prize.id}>
                      <path d={describeArc(center, center, outerR - 38, start, end) + ` L ${center} ${center} Z`} fill={prizeAccent(prize, index)} opacity="0.97" />
                      <path
                        d={describeArc(center, center, outerR - 38, start, end)}
                        fill="none"
                        stroke="rgba(255,255,255,0.20)"
                        strokeWidth={isMobile ? 5 : 6}
                        strokeLinecap="round"
                        opacity="0.18"
                      />
                      <g transform={`translate(${labelPoint.x}, ${labelPoint.y}) rotate(${mid + 90})`}>
                        <text
                          x="0"
                          y="0"
                          fill={prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#10192f' : '#071424'}
                          fontSize={isMobile ? '16' : '21'}
                          fontWeight="800"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ letterSpacing: '0.02em', paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.45)', strokeWidth: 2 }}
                        >
                          {prizeShortLabel(prize)}
                        </text>
                      </g>
                    </g>
                  );
                })}

                <circle cx={center} cy={center} r={innerR + 20} fill="rgba(8, 17, 33, 0.18)" />
                <circle cx={center} cy={center} r={innerR} fill="#f6f9ff" stroke="rgba(255,255,255,0.24)" strokeWidth="8" />
                <circle cx={center} cy={center} r={innerR - 30} fill="rgba(37,99,235,0.12)" />
              </svg>

              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '36% 18%', sm: '31% 17%' },
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Stack spacing={0.35} alignItems="center" sx={{ px: 1 }}>
                  <Typography
                    sx={{
                      color: '#f6fbff',
                      fontWeight: 900,
                      fontSize: { xs: '0.98rem', sm: '1.45rem' },
                      lineHeight: 1,
                      textShadow: '0 2px 14px rgba(0,0,0,0.28)',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {spinning ? 'ĐANG QUAY' : resultName ?? 'SẴN SÀNG'}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(229,239,255,0.82)',
                      fontWeight: 700,
                      fontSize: { xs: '0.76rem', sm: '0.92rem' },
                      textAlign: 'center',
                    }}
                  >
                    {spins > 0 ? `Lượt quay hiện có: ${spins}` : 'Hết lượt quay'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 1.75, width: '100%', display: 'grid', placeItems: 'center' }}>
            <Button
              variant="contained"
              onClick={onSpin}
              disabled={disabled || spinning || spins <= 0}
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1.35, sm: 1.8 },
                minWidth: { xs: 200, sm: 260 },
                borderRadius: 999,
                fontWeight: 900,
                fontSize: { xs: '0.92rem', sm: '1.02rem' },
                letterSpacing: '0.08em',
                color: '#f8fbff',
                background: 'linear-gradient(180deg, rgba(37,99,235,0.98) 0%, rgba(30,64,175,1) 100%)',
                boxShadow: '0 14px 28px rgba(37,99,235,0.32)',
                '&:hover': { background: 'linear-gradient(180deg, rgba(59,130,246,0.98) 0%, rgba(30,64,175,1) 100%)' },
              }}
            >
              {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT'}
            </Button>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1.25 }}>
          <Chip label="Hang Cú branding" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.14)' }} />
          <Chip label="Minimal game UI" sx={{ bgcolor: 'rgba(96,165,250,0.14)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.16)' }} />
          <Chip label={`${safePrizes.length} phần thưởng`} sx={{ bgcolor: 'rgba(14,165,233,0.12)', color: '#cffafe', border: '1px solid rgba(14,165,233,0.14)' }} />
        </Stack>
      </Box>
    </Box>
  );
}
