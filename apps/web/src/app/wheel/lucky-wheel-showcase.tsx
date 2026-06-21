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

function prizeHue(type: string, index: number) {
  const normalized = type?.toUpperCase?.() ?? type;
  if (normalized === 'POINT') return index % 2 === 0 ? '#f7e08a' : '#f1d15b';
  if (normalized === 'SPIN_TICKET') return index % 2 === 0 ? '#f3efe5' : '#e7e0d0';
  if (normalized === 'VOUCHER' || normalized === 'VIP_CODE') return index % 2 === 0 ? '#2b4f1d' : '#173118';
  return index % 2 === 0 ? '#234f9f' : '#1c3d7d';
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
  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'p1', name: '10đ', type: 'POINT', weight: 1, metadata: { points: 10 } },
        { id: 'p2', name: '+1 spin', type: 'SPIN_TICKET', weight: 1, metadata: {} },
        { id: 'p3', name: '25đ', type: 'POINT', weight: 1, metadata: { points: 25 } },
        { id: 'p4', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
        { id: 'p5', name: '5đ', type: 'POINT', weight: 1, metadata: { points: 5 } },
      ];

  const segments = safePrizes.length;
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 7s cubic-bezier(0.16, 0.86, 0.14, 1)' : 'transform 0.36s ease-out',
    willChange: 'transform',
  } as CSSProperties;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 5, sm: 6 },
        border: '1px solid rgba(114, 185, 122, 0.12)',
        background:
          'radial-gradient(circle at 16% 12%, rgba(46, 88, 55, 0.22), transparent 20%), radial-gradient(circle at 78% 4%, rgba(26, 105, 61, 0.16), transparent 18%), linear-gradient(180deg, rgba(8, 28, 18, 0.96) 0%, rgba(5, 15, 10, 1) 100%)',
        boxShadow: '0 24px 54px rgba(0,0,0,0.34)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.2,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.2} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#f6f5ea', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.55rem', sm: '2rem' }, lineHeight: 1.02 }}>
                {campaignName ?? 'Lucky Wheel'}
              </Typography>
              <Typography sx={{ mt: 0.5, color: 'rgba(240, 241, 230, 0.72)', maxWidth: 640, lineHeight: 1.45, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                {campaignDescription ?? 'Dark lobby minimal game UI với tông xanh rêu và vàng đồng theo branding Hang Cú.'}
              </Typography>
            </Box>

            <Chip
              label={`${spins} spins`}
              sx={{
                bgcolor: 'rgba(214, 183, 91, 0.12)',
                color: '#f7e7b2',
                border: '1px solid rgba(214,183,91,0.16)',
                fontWeight: 800,
                flexShrink: 0,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Game lobby" sx={{ bgcolor: 'rgba(86, 136, 96, 0.12)', color: '#d8f0db', border: '1px solid rgba(86,136,96,0.16)' }} />
            <Chip label="Blue / bronze" sx={{ bgcolor: 'rgba(58,98,196,0.12)', color: '#dbeafe', border: '1px solid rgba(58,98,196,0.14)' }} />
            <Chip label={`${segments} prizes`} sx={{ bgcolor: 'rgba(214,183,91,0.10)', color: '#f7e7b2', border: '1px solid rgba(214,183,91,0.14)' }} />
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
              top: isMobile ? 10 : 16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: isMobile ? '20px solid transparent' : '28px solid transparent',
              borderRight: isMobile ? '20px solid transparent' : '28px solid transparent',
              borderTop: isMobile ? '56px solid rgba(235, 197, 88, 0.96)' : '72px solid rgba(235, 197, 88, 0.96)',
              filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))',
              zIndex: 4,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: isMobile ? 378 : 580,
              aspectRatio: '1 / 1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 20 : 38,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 48%, rgba(0,0,0,0.14) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 26 : 50,
                borderRadius: '50%',
                background:
                  'linear-gradient(180deg, rgba(234,193,94,0.98) 0%, rgba(200,160,55,0.98) 46%, rgba(150,116,28,0.98) 100%)',
                boxShadow:
                  'inset 0 0 0 4px rgba(255,255,255,0.16), inset 0 0 0 16px rgba(4,16,10,0.82), 0 10px 30px rgba(0,0,0,0.22)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: isMobile ? 14 : 20,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: `conic-gradient(
                    from -90deg,
                    ${safePrizes
                      .map((prize, index) => `${prizeHue(prize.type, index)} ${(index / segments) * 100}% ${((index + 1) / segments) * 100}%`)
                      .join(', ')}
                  )`,
                  boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.22)',
                  ...wheelStyle,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.12) 0 0.45deg, transparent 0.45deg 24deg)',
                    opacity: 0.6,
                  }}
                />

                {safePrizes.map((prize, index) => {
                  const angle = (360 / segments) * index + 180 / segments;
                  const isDark = prize.type.toUpperCase() === 'VOUCHER' || prize.type.toUpperCase() === 'VIP_CODE';
                  return (
                    <Box
                      key={prize.id}
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
                          top: isMobile ? '16%' : '14%',
                          transform: 'translateX(-50%)',
                          maxWidth: isMobile ? 74 : 96,
                          textAlign: 'center',
                          fontSize: { xs: '0.68rem', sm: '0.84rem' },
                          lineHeight: 1.05,
                          fontWeight: 900,
                          color: isDark ? '#f4f6fa' : '#091227',
                          textShadow: isDark ? '0 1px 6px rgba(0,0,0,0.22)' : '0 1px 0 rgba(255,255,255,0.40)',
                          opacity: 0.96,
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
                    inset: { xs: '34%', sm: '36%' },
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 32% 28%, #fffdf7 0%, #f8ecd0 28%, #d5c08a 70%, #b48d3d 100%)',
                    border: '1px solid rgba(255,255,255,0.24)',
                    boxShadow: '0 10px 22px rgba(0,0,0,0.20)',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Stack spacing={0.25} alignItems="center" sx={{ px: 1 }}>
                    <Typography sx={{ color: '#7a4d0f', fontWeight: 900, letterSpacing: '0.26em', fontSize: { xs: '0.56rem', sm: '0.68rem' } }}>
                      REVEAL
                    </Typography>
                    <Typography sx={{ color: '#2b1a05', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '0.92rem', sm: '1.08rem' }, lineHeight: 1 }}>
                      {spinning ? 'Đang quay' : resultName ?? 'Sẵn sàng'}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={onSpin}
            disabled={disabled || spinning || spins <= 0}
            sx={{
              mt: 2.25,
              px: { xs: 4.4, sm: 6 },
              py: { xs: 1.35, sm: 1.7 },
              minWidth: { xs: 220, sm: 280 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '0.92rem', sm: '1rem' },
              letterSpacing: '0.08em',
              color: '#f7fbff',
              background: 'linear-gradient(180deg, rgba(38,86,214,0.98) 0%, rgba(23,61,171,1) 100%)',
              boxShadow: '0 14px 24px rgba(26,61,172,0.28)',
              '&:hover': { background: 'linear-gradient(180deg, rgba(56,113,255,0.98) 0%, rgba(23,61,171,1) 100%)' },
            }}
          >
            {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'SPIN TO REVEAL' : 'HẾT LƯỢT QUAY'}
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ mt: 1.8, opacity: 0.95 }}
        >
          {safePrizes.slice(0, 5).map((prize) => (
            <Chip
              key={prize.id}
              label={prizeLabel(prize)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.04)',
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
