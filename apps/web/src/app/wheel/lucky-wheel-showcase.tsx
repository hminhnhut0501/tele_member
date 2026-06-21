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
    return amount ? `+${amount} điểm` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP';
  return prize.name;
}

function prizeHue(type: string, index: number) {
  const normalized = type?.toUpperCase?.() ?? type;
  if (normalized === 'POINT') return index % 2 === 0 ? 'rgba(64, 123, 255, 0.94)' : 'rgba(108, 171, 255, 0.94)';
  if (normalized === 'SPIN_TICKET') return index % 2 === 0 ? 'rgba(42, 91, 214, 0.96)' : 'rgba(93, 160, 255, 0.94)';
  if (normalized === 'VOUCHER' || normalized === 'VIP_CODE') return index % 2 === 0 ? 'rgba(24, 38, 76, 0.96)' : 'rgba(46, 67, 134, 0.96)';
  return index % 2 === 0 ? 'rgba(19, 36, 74, 0.96)' : 'rgba(36, 64, 143, 0.96)';
}

function wedgePercent(index: number, slice: number) {
  return (index / slice) * 100;
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
  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'p1', name: '10đ', type: 'POINT', weight: 1, metadata: { points: 10 } },
        { id: 'p2', name: '+1 spin', type: 'SPIN_TICKET', weight: 1, metadata: {} },
        { id: 'p3', name: '25đ', type: 'POINT', weight: 1, metadata: { points: 25 } },
        { id: 'p4', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
      ];
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 7.4s cubic-bezier(0.14, 0.9, 0.18, 1)' : 'transform 0.42s ease-out',
    willChange: 'transform',
  } as CSSProperties;
  const size = isMobile ? 420 : 620;
  const labelsRadius = isMobile ? 132 : 192;
  const panelRadius = isMobile ? 28 : 36;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: panelRadius,
        border: '1px solid rgba(96, 165, 250, 0.14)',
        background:
          'radial-gradient(circle at 18% 12%, rgba(59,130,246,0.14), transparent 18%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.12), transparent 18%), linear-gradient(180deg, rgba(9,16,31,0.98) 0%, rgba(6,10,20,1) 100%)',
        boxShadow: '0 30px 70px rgba(3, 8, 20, 0.48)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(circle at center, black 0%, black 68%, transparent 100%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#f5f9ff', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.55rem', sm: '2rem' }, lineHeight: 1.05 }}>
                {campaignName ?? 'Lucky Wheel'}
              </Typography>
              <Typography sx={{ color: 'rgba(225,236,255,0.72)', maxWidth: 620, mt: 0.45, lineHeight: 1.45, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                {campaignDescription ?? 'Một game UI tối giản, hiện đại, tập trung vào trải nghiệm quay và phần thưởng.'}
              </Typography>
            </Box>
            <Chip
              label={`${spins} spins`}
              sx={{
                bgcolor: 'rgba(59,130,246,0.16)',
                color: '#dbeafe',
                border: '1px solid rgba(96,165,250,0.24)',
                fontWeight: 800,
                flexShrink: 0,
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Minimal game UI" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.16)' }} />
            <Chip label="Blue / bronze accent" sx={{ bgcolor: 'rgba(96,165,250,0.12)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.16)' }} />
            <Chip label={`${safePrizes.length} prizes`} sx={{ bgcolor: 'rgba(14,165,233,0.10)', color: '#cffafe', border: '1px solid rgba(14,165,233,0.14)' }} />
          </Stack>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 430, sm: 560 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 6 : 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: isMobile ? '26px solid transparent' : '36px solid transparent',
              borderRight: isMobile ? '26px solid transparent' : '36px solid transparent',
              borderTop: isMobile ? '74px solid rgba(96,165,250,0.92)' : '96px solid rgba(96,165,250,0.92)',
              filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.32))',
              zIndex: 4,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: size,
              aspectRatio: '1 / 1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 20 : 42,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 28% 24%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 20%, rgba(4,9,18,0.08) 58%, rgba(4,9,18,0.18) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 22 : 50,
                borderRadius: '50%',
                transform: 'rotate(-18deg)',
                ...wheelStyle,
                background: `conic-gradient(
                  from -90deg,
                  ${safePrizes
                    .map((prize, index) => `${prizeHue(prize.type, index)} ${wedgePercent(index, slice)}% ${wedgePercent(index + 1, slice)}%`)
                    .join(', ')}
                )`,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.12) 0 0.55deg, transparent 0.55deg 24deg)',
                  opacity: 0.72,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 50% 50%, transparent 0 42%, rgba(255,255,255,0.06) 42% 42.5%, transparent 42.5% 100%)',
                }}
              />

              {safePrizes.map((prize, index) => {
                const angle = (360 / slice) * index + 180 / slice;
                const textRotate = angle - 90;
                return (
                  <Box
                    key={prize.id}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      transform: `rotate(${textRotate}deg)`,
                      transformOrigin: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: `calc(50% - ${labelsRadius}px)`,
                        transform: `translateY(-50%)`,
                        maxWidth: isMobile ? 88 : 120,
                        textAlign: 'center',
                        fontSize: { xs: '0.72rem', sm: '0.92rem' },
                        lineHeight: 1.05,
                        fontWeight: 800,
                        color: prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#f1f5ff' : '#eff6ff',
                        textShadow: '0 1px 8px rgba(0,0,0,0.24)',
                        opacity: 0.98,
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
                  inset: { xs: '34%', sm: '35%' },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 32% 28%, #fffdf7 0%, #eff6ff 28%, #d7e6ff 68%, #9dbbf8 100%)',
                  border: '1px solid rgba(255,255,255,0.34)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Stack spacing={0.25} alignItems="center" sx={{ px: 1 }}>
                  <Typography sx={{ color: '#4868b7', fontSize: { xs: '0.62rem', sm: '0.72rem' }, fontWeight: 800, letterSpacing: '0.24em' }}>
                    REVEAL
                  </Typography>
                  <Typography sx={{ color: '#091227', fontSize: { xs: '0.98rem', sm: '1.2rem' }, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
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
              mt: 2,
              px: { xs: 4.2, sm: 6 },
              py: { xs: 1.35, sm: 1.7 },
              minWidth: { xs: 220, sm: 280 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '0.92rem', sm: '1.02rem' },
              letterSpacing: '0.09em',
              color: '#f7fbff',
              background: 'linear-gradient(180deg, rgba(37,99,235,0.98) 0%, rgba(30,64,175,1) 100%)',
              boxShadow: '0 14px 28px rgba(37,99,235,0.26)',
              '&:hover': { background: 'linear-gradient(180deg, rgba(59,130,246,0.98) 0%, rgba(30,64,175,1) 100%)' },
            }}
          >
            {spinning ? 'Đang quay...' : spins > 0 ? 'Spin to reveal' : 'Hết lượt quay'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
