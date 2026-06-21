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

function prizeLabel(prize: WheelPrize) {
  const type = prize.type?.toUpperCase?.() ?? prize.type;
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount;
    return amount ? `+${amount}đ` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP';
  return prize.name;
}

function prizeTone(type: string, index: number) {
  const t = type?.toUpperCase?.() ?? type;
  if (t === 'POINT') return index % 2 === 0 ? '#f6e08f' : '#f1c84e';
  if (t === 'SPIN_TICKET') return index % 2 === 0 ? '#a8cfff' : '#81b9ff';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return index % 2 === 0 ? '#f8f4ea' : '#fefcf7';
  return index % 2 === 0 ? '#2e5ec9' : '#f84b2f';
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
  const wheelSize = isMobile ? 420 : 620;
  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'demo-point-10', name: '10đ', type: 'POINT', weight: 4, metadata: { points: 10 } },
        { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
        { id: 'demo-point-25', name: '25đ', type: 'POINT', weight: 2, metadata: { points: 25 } },
        { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
        { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: {} },
      ];
  const segmentAngle = 360 / safePrizes.length;

  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 7.2s cubic-bezier(0.16, 0.88, 0.18, 1)' : 'transform 0.42s ease-out',
    willChange: 'transform',
  } as CSSProperties;

  const sliceStyle = (index: number): CSSProperties => ({
    transform: `rotate(${index * segmentAngle}deg)`,
    clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%)',
  });

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 4, sm: 5 },
        border: '1px solid rgba(88, 142, 84, 0.22)',
        background:
          'radial-gradient(circle at 20% 10%, rgba(73, 118, 76, 0.26), transparent 18%), radial-gradient(circle at 82% 8%, rgba(18, 71, 43, 0.28), transparent 18%), linear-gradient(180deg, rgba(8, 30, 17, 0.98) 0%, rgba(5, 16, 11, 1) 100%)',
        boxShadow: '0 28px 64px rgba(0,0,0,0.38)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.20,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#f8f3e6', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.6rem', sm: '2.25rem' }, lineHeight: 0.95 }}>
              {campaignName ?? 'Lucky Wheel'}
            </Typography>
            <Typography sx={{ mt: 0.7, color: 'rgba(240,241,230,0.72)', maxWidth: 640, lineHeight: 1.45, fontSize: { xs: '0.95rem', sm: '1.03rem' } }}>
              {campaignDescription ?? 'Minimal dark-lobby game UI với cảm giác premium, sạch và rõ.'}
            </Typography>
          </Box>
          <Chip
            label={`${spins} spins`}
            sx={{
              bgcolor: 'rgba(234, 193, 94, 0.14)',
              color: '#f7e7b2',
              border: '1px solid rgba(234,193,94,0.18)',
              fontWeight: 800,
              flexShrink: 0,
            }}
          />
        </Stack>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 440, sm: 540 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 2 : 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: isMobile ? '22px solid transparent' : '28px solid transparent',
              borderRight: isMobile ? '22px solid transparent' : '28px solid transparent',
              borderTop: isMobile ? '60px solid rgba(236, 199, 82, 0.96)' : '74px solid rgba(236, 199, 82, 0.96)',
              filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.22))',
              zIndex: 4,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: wheelSize,
              aspectRatio: '1 / 1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 18 : 34,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 46%, rgba(0,0,0,0.22) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 28 : 48,
                borderRadius: '50%',
                ...wheelStyle,
                boxShadow:
                  'inset 0 0 0 6px rgba(235, 200, 87, 0.96), inset 0 0 0 14px rgba(255,255,255,0.02), 0 18px 36px rgba(0,0,0,0.22)',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(247,231,170,0.18) 0%, rgba(0,0,0,0) 100%)',
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 0 12px rgba(0,0,0,0.18)' }} />
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
                {safePrizes.map((prize, index) => (
                  <Box
                    key={prize.id}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: `conic-gradient(from ${index * segmentAngle}deg, ${prizeTone(prize.type, index)} 0 ${segmentAngle}deg, transparent ${segmentAngle}deg 360deg)`,
                      ...sliceStyle(index),
                      opacity: 0.98,
                    }}
                  />
                ))}
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.10) 0 0.5deg, transparent 0.5deg 24deg)' }} />
              </Box>

              {safePrizes.map((prize, index) => {
                const angle = index * segmentAngle + segmentAngle / 2;
                const tilt = angle - 90;
                const isDark = prize.type.toUpperCase() === 'VOUCHER' || prize.type.toUpperCase() === 'VIP_CODE';
                return (
                  <Box
                    key={`${prize.id}-label`}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: isMobile ? '18%' : '17%',
                        transform: `translateX(-50%) rotate(${tilt}deg)`,
                        transformOrigin: 'center',
                        textAlign: 'center',
                        maxWidth: isMobile ? 82 : 100,
                        color: isDark ? '#f8f5ec' : '#102142',
                        fontWeight: 900,
                        fontSize: { xs: '0.7rem', sm: '0.88rem' },
                        lineHeight: 1.06,
                        textShadow: isDark ? '0 1px 6px rgba(0,0,0,0.22)' : '0 1px 0 rgba(255,255,255,0.28)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {prizeLabel(prize)}
                    </Typography>
                  </Box>
                );
              })}

              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '36%', sm: '37%' },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 26%, #fffdf7 0%, #f8ebc8 34%, #d8c387 72%, #b68e3d 100%)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Stack spacing={0.15} alignItems="center" sx={{ px: 1 }}>
                  <Typography sx={{ color: '#794a0f', fontWeight: 900, letterSpacing: '0.28em', fontSize: { xs: '0.56rem', sm: '0.68rem' } }}>
                    REVEAL
                  </Typography>
                  <Typography sx={{ color: '#2b1a05', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '0.9rem', sm: '1.1rem' }, lineHeight: 1 }}>
                    {spinning ? 'Đang quay' : resultName ?? 'Sẵn sàng'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={onSpin}
            disabled={disabled || spinning || spins <= 0}
            sx={{
              mt: 2.2,
              px: { xs: 4.2, sm: 6 },
              py: { xs: 1.35, sm: 1.7 },
              minWidth: { xs: 220, sm: 280 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '0.92rem', sm: '1rem' },
              letterSpacing: '0.08em',
              color: '#f6fbff',
              background: 'linear-gradient(180deg, rgba(38,86,214,0.98) 0%, rgba(23,61,171,1) 100%)',
              boxShadow: '0 14px 24px rgba(26,61,172,0.28)',
              '&:hover': { background: 'linear-gradient(180deg, rgba(56,113,255,0.98) 0%, rgba(23,61,171,1) 100%)' },
            }}
          >
            {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'SPIN TO REVEAL' : 'HẾT LƯỢT QUAY'}
          </Button>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.8, opacity: 0.95 }}>
          {safePrizes.map((prize) => (
            <Chip
              key={prize.id}
              label={prizeLabel(prize)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.035)',
                color: '#eaf1ea',
                border: '1px solid rgba(255,255,255,0.08)',
                fontWeight: 700,
                mb: 1,
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
