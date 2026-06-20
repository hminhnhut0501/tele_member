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
  const outerR = isMobile ? 380 : 430;
  const innerR = isMobile ? 148 : 172;
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
            <Typography
              sx={{
                color: '#f5f9ff',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                fontSize: { xs: '1.24rem', sm: '1.7rem' },
                lineHeight: 1.08,
              }}
            >
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
            minHeight: { xs: 470, sm: 590 },
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
              borderLeft: isMobile ? '30px solid transparent' : '42px solid transparent',
              borderRight: isMobile ? '30px solid transparent' : '42px solid transparent',
              borderTop: isMobile ? '88px solid rgba(96,165,250,0.96)' : '112px solid rgba(96,165,250,0.96)',
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.4))',
              zIndex: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: isMobile ? '-22px' : '-31px',
                top: isMobile ? '-83px' : '-106px',
                width: isMobile ? 44 : 62,
                height: isMobile ? 44 : 62,
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
              maxWidth: isMobile ? 420 : 620,
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              p: { xs: 1, sm: 1.5 },
              background: 'linear-gradient(180deg, #67a2ff 0%, #1d4ed8 46%, #081223 100%)',
              boxShadow:
                'inset 0 0 0 4px rgba(255,255,255,0.18), inset 0 0 0 16px rgba(8,17,33,0.92), 0 0 0 1px rgba(255,255,255,0.10), 0 28px 54px rgba(0,0,0,0.42)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 12, sm: 16 },
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 58%, rgba(0,0,0,0.22) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
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
                <circle cx={center} cy={center} r={outerR - 2} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="10" />
                <circle cx={center} cy={center} r={outerR - 22} fill="none" stroke="rgba(7,18,44,0.82)" strokeWidth="2" />
                <circle cx={center} cy={center} r={outerR - 38} fill="#f8fbff" />

                {safePrizes.map((prize, index) => {
                  const start = index * segmentAngle;
                  const end = (index + 1) * segmentAngle;
                  const mid = start + segmentAngle / 2;
                  return (
                    <g key={prize.id}>
                      <path d={describeArc(center, center, outerR - 38, start, end) + ` L ${center} ${center} Z`} fill={prizeAccent(prize, index)} opacity="0.97" />
                      <path d={describeArc(center, center, outerR - 38, start, end)} fill="none" stroke="rgba(14, 23, 48, 0.9)" strokeWidth="3" />
                      <path
                        d={describeArc(center, center, outerR - 38, start, end)}
                        fill="none"
                        stroke="rgba(255,255,255,0.24)"
                        strokeWidth={isMobile ? 7 : 9}
                        strokeLinecap="round"
                        opacity="0.28"
                      />
                      <text
                        fill={prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#10192f' : '#081223'}
                        fontSize={isMobile ? '18' : '23'}
                        fontWeight="900"
                        textAnchor="middle"
                        style={{ letterSpacing: '0.03em', paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }}
                      >
                        <textPath href={`#arc-${index}`} startOffset="50%" textAnchor="middle">
                          {prizeShortLabel(prize)}
                        </textPath>
                      </text>
                      <circle cx={polarToCartesian(center, center, outerR - 110, mid).x} cy={polarToCartesian(center, center, outerR - 110, mid).y} r={isMobile ? 14 : 18} fill="rgba(255,255,255,0.2)" />
                    </g>
                  );
                })}

                <circle cx={center} cy={center} r={innerR + 18} fill="rgba(14,22,32,0.08)" />
                <circle cx={center} cy={center} r={innerR} fill="url(#hubGlow)" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
                <circle cx={center} cy={center} r={innerR - 28} fill="#081223" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              </svg>

              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '36% 19%', sm: '30% 18%' },
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Stack spacing={0.4} alignItems="center" sx={{ px: 1 }}>
                  <Typography sx={{ color: '#9cc7ff', fontWeight: 900, letterSpacing: '0.22em', fontSize: { xs: '0.6rem', sm: '0.72rem' } }}>
                    SPIN WHEEL
                  </Typography>
                  <Typography
                    sx={{
                      color: '#f6fbff',
                      fontWeight: 900,
                      fontSize: { xs: '1rem', sm: '1.55rem' },
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
                      color: 'rgba(229,239,255,0.78)',
                      fontWeight: 700,
                      fontSize: { xs: '0.78rem', sm: '0.95rem' },
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
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
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

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1.25 }}>
          <Chip label="Hang Cú branding" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)' }} />
          <Chip label="Game UI style" sx={{ bgcolor: 'rgba(96,165,250,0.16)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.2)' }} />
          <Chip label={`${safePrizes.length} phần thưởng`} sx={{ bgcolor: 'rgba(14,165,233,0.14)', color: '#cffafe', border: '1px solid rgba(14,165,233,0.18)' }} />
        </Stack>
      </Box>
    </Box>
  );
}
