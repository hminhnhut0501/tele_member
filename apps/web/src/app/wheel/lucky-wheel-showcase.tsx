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
  if (type === 'POINT') return index % 2 === 0 ? '#ffd86b' : '#f4b942';
  if (type === 'SPIN_TICKET') return index % 2 === 0 ? '#7dd3fc' : '#2563eb';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return index % 2 === 0 ? '#eab308' : '#b45309';
  return index % 2 === 0 ? '#1d4ed8' : '#0f172a';
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
  const wheelStyle = {
    ['--wheel-rotation' as string]: `${rotation}deg`,
    ['--wheel-slice' as string]: `${segmentAngle}deg`,
  } as CSSProperties;
  const palette = ['#fef5da', '#ffd55f', '#fff8e9', '#e7bd40', '#ffffff', '#b8922f'];
  const rotorGradient = prizes.length
    ? `conic-gradient(from -90deg, ${prizes
        .map((prize, index) => `${prizeAccent(prize, index)} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`)
        .join(', ')})`
    : `conic-gradient(from -90deg, ${palette
        .map((color, index) => `${color} ${index * (360 / palette.length)}deg ${(index + 1) * (360 / palette.length)}deg`)
        .join(', ')})`;

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
          opacity: 0.26,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 0%, black 58%, transparent 100%)',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.96)', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '1.65rem', sm: '2rem' } }}>
              {campaignName ?? 'Lucky Wheel'}
            </Typography>
            <Typography sx={{ color: 'rgba(245, 231, 194, 0.75)', maxWidth: 520, mt: 0.5, lineHeight: 1.5 }}>
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
            minHeight: { xs: 580, sm: 640 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '44px solid transparent',
              borderRight: '44px solid transparent',
              borderTop: '108px solid rgba(255, 213, 109, 0.92)',
              filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))',
              zIndex: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '-34px',
                top: '-102px',
                width: 68,
                height: 68,
                background: 'linear-gradient(180deg, #fffbe6 0%, #ffd55e 55%, #be862a 100%)',
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                opacity: 0.9,
              },
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: { xs: 480, sm: 560, md: 620 },
              maxWidth: '92vw',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              p: { xs: 1.5, sm: 2 },
              background: 'linear-gradient(180deg, #ffeb8a 0%, #d3ab43 50%, #8f6a1d 100%)',
              boxShadow:
                'inset 0 0 0 3px rgba(255, 255, 255, 0.22), inset 0 0 0 16px rgba(8, 22, 14, 0.8), 0 0 0 1px rgba(255,255,255,0.12), 0 34px 68px rgba(0,0,0,0.48)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 10, sm: 14 },
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at center, rgba(255, 255, 255, 0.06), rgba(255,255,255,0.01) 58%, rgba(0,0,0,0.2) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: { xs: 18, sm: 22 },
                borderRadius: '50%',
                transform: 'rotate(var(--wheel-rotation))',
                transition: spinning ? 'transform 8s cubic-bezier(0.16, 0.9, 0.18, 1)' : 'transform 0.35s ease-out',
                willChange: 'transform',
                boxShadow:
                  'inset 0 0 0 2px rgba(58, 42, 15, 0.8), inset 0 0 0 16px rgba(255,255,255,0.78), inset 0 0 60px rgba(255, 234, 164, 0.6)',
                overflow: 'hidden',
                background: rotorGradient,
              }}
              style={wheelStyle}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.22) 0 0.8deg, transparent 0.8deg 30deg)',
                  opacity: 0.8,
                }}
              />

              {prizes.map((prize, index) => {
                const angle = index * segmentAngle + segmentAngle / 2;
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
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '12%',
                        transform: 'translateX(-50%)',
                        display: 'grid',
                        placeItems: 'center',
                        width: { xs: 74, sm: 84 },
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '0.72rem', sm: '0.82rem' },
                          color: prize.type === 'VOUCHER' || prize.type === 'VIP_CODE' ? '#111827' : '#0b1220',
                          textShadow: '0 1px 0 rgba(255,255,255,0.45)',
                          lineHeight: 1.05,
                          transform: `rotate(${-angle}deg)`,
                          maxWidth: 72,
                        }}
                      >
                        {prizeShortLabel(prize)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              <Box
                sx={{
                  position: 'absolute',
                  inset: '16%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 30% 26%, #fffce7 0%, #ffe38a 28%, #d2a53a 66%, #8a6417 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  boxShadow:
                    'inset 0 0 0 10px rgba(255,255,255,0.1), 0 14px 32px rgba(0,0,0,0.32), inset 0 0 22px rgba(255, 255, 255, 0.38)',
                }}
              >
                <Stack spacing={1} alignItems="center" sx={{ px: 2 }}>
                  <Box
                    sx={{
                      width: { xs: 116, sm: 132 },
                      height: { xs: 116, sm: 132 },
                      borderRadius: '50%',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '6px solid rgba(76, 55, 15, 0.72)',
                      boxShadow: '0 18px 30px rgba(0,0,0,0.28)',
                      bgcolor: '#081520',
                    }}
                  >
                    <Image
                      src="/hang-cu-mark.jpg"
                      alt="Hang Cú"
                      fill
                      sizes="132px"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </Box>
                  <Typography sx={{ color: '#442f05', fontWeight: 900, letterSpacing: '0.3em', fontSize: '0.76rem' }}>
                    SPIN WHEEL
                  </Typography>
                  <Typography sx={{ color: '#2a1c04', fontWeight: 900, fontSize: { xs: '1.55rem', sm: '1.95rem' }, lineHeight: 1 }}>
                    {spinning ? 'ĐANG QUAY' : resultName ?? 'SẴN SÀNG'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(42, 28, 4, 0.72)', fontWeight: 700 }}>
                    {spins > 0 ? `Lượt quay hiện có: ${spins}` : 'Hết lượt quay'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: { xs: 2, sm: 3 },
              width: '100%',
              display: 'grid',
              placeItems: 'center',
            }}
          >
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
                letterSpacing: '0.08em',
                color: '#fff5cc',
                background:
                  'linear-gradient(180deg, rgba(28,73,244,0.98) 0%, rgba(20, 58, 207, 1) 100%)',
                boxShadow:
                  '0 18px 36px rgba(37, 99, 235, 0.42), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(255,255,255,0.12)',
                '&:hover': {
                  background:
                    'linear-gradient(180deg, rgba(46,95,255,0.98) 0%, rgba(20, 58, 207, 1) 100%)',
                },
              }}
            >
              {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT'}
            </Button>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Chip
            label="Hang Cú branding"
            sx={{ bgcolor: 'rgba(255, 230, 163, 0.13)', color: '#ffe7a3', border: '1px solid rgba(255, 230, 163, 0.18)' }}
          />
          <Chip
            label="Game UI style"
            sx={{ bgcolor: 'rgba(29, 78, 216, 0.16)', color: '#c7ddff', border: '1px solid rgba(29, 78, 216, 0.2)' }}
          />
          <Chip
            label={`${prizes.length} phần thưởng`}
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#c9f7e8', border: '1px solid rgba(16, 185, 129, 0.18)' }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
