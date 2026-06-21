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

function segmentTone(type: string, index: number) {
  const normalized = type?.toUpperCase?.() ?? type;
  if (normalized === 'POINT') return index % 2 === 0 ? '#5fa2ff' : '#2c66dc';
  if (normalized === 'SPIN_TICKET') return index % 2 === 0 ? '#8bc7ff' : '#4d8ef6';
  if (normalized === 'VOUCHER' || normalized === 'VIP_CODE') return index % 2 === 0 ? '#14213d' : '#223b7a';
  return index % 2 === 0 ? '#1d3b82' : '#0f1830';
}

function prizeLabel(prize: WheelPrize) {
  const normalized = prize.type?.toUpperCase?.() ?? prize.type;
  if (normalized === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount;
    return amount ? `+${amount} điểm` : 'Điểm';
  }
  if (normalized === 'SPIN_TICKET') return '+1 spin';
  if (normalized === 'VOUCHER') return 'Voucher';
  if (normalized === 'VIP_CODE') return 'VIP';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const safePrizes = prizes.length
    ? prizes
    : [
        { id: 'p1', name: '10 điểm', type: 'POINT', weight: 1, metadata: { points: 10 } },
        { id: 'p2', name: '+1 spin', type: 'SPIN_TICKET', weight: 1, metadata: {} },
        { id: 'p3', name: '25 điểm', type: 'POINT', weight: 1, metadata: { points: 25 } },
        { id: 'p4', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
      ];
  const segments = safePrizes.length;
  const wheelStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: spinning ? 'transform 7.2s cubic-bezier(0.16, 0.88, 0.18, 1)' : 'transform 0.38s ease-out',
    willChange: 'transform',
  } as CSSProperties;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 28, sm: 36 },
        border: '1px solid rgba(91, 140, 255, 0.14)',
        background:
          'radial-gradient(circle at 15% 12%, rgba(59,130,246,0.16), transparent 18%), radial-gradient(circle at 82% 10%, rgba(14,165,233,0.10), transparent 16%), linear-gradient(180deg, rgba(8,15,30,0.98) 0%, rgba(6,10,20,1) 100%)',
        boxShadow: '0 26px 60px rgba(3,8,20,0.42)',
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
          backgroundSize: '52px 52px',
        }}
      />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={1.1} sx={{ mb: 2.25 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#f6f9ff', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.5rem', sm: '2rem' }, lineHeight: 1.05 }}>
                {campaignName ?? 'Lucky Wheel'}
              </Typography>
              <Typography sx={{ color: 'rgba(227,236,255,0.72)', mt: 0.45, maxWidth: 620, lineHeight: 1.5, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                {campaignDescription ?? 'Minimal reveal game dành cho Telegram, tối giản nhưng vẫn có nhịp điệu và cảm giác premium.'}
              </Typography>
            </Box>
            <Chip
              label={`${spins} spins`}
              sx={{
                bgcolor: 'rgba(59,130,246,0.14)',
                color: '#dbeafe',
                border: '1px solid rgba(96,165,250,0.18)',
                fontWeight: 800,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Minimal" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.14)' }} />
            <Chip label="Blue / bronze" sx={{ bgcolor: 'rgba(96,165,250,0.12)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.14)' }} />
            <Chip label={`${segments} prizes`} sx={{ bgcolor: 'rgba(14,165,233,0.10)', color: '#cffafe', border: '1px solid rgba(14,165,233,0.12)' }} />
          </Stack>
        </Stack>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 420, sm: 540 },
            display: 'grid',
            placeItems: 'center',
            py: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 10 : 18,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: isMobile ? '20px solid transparent' : '28px solid transparent',
              borderRight: isMobile ? '20px solid transparent' : '28px solid transparent',
              borderTop: isMobile ? '54px solid rgba(96,165,250,0.90)' : '70px solid rgba(96,165,250,0.90)',
              filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.26))',
              zIndex: 4,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: isMobile ? 380 : 560,
              aspectRatio: '1 / 1',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 18 : 36,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 46%, rgba(4,9,18,0.18) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: isMobile ? 28 : 48,
                borderRadius: '50%',
                ...wheelStyle,
                overflow: 'hidden',
                background: `conic-gradient(
                  from -90deg,
                  ${safePrizes
                    .map((prize, index) => `${segmentTone(prize.type, index)} ${(index / segments) * 100}% ${((index + 1) / segments) * 100}%`)
                    .join(', ')}
                )`,
                boxShadow:
                  'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -24px 36px rgba(0,0,0,0.18)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(255,255,255,0.06) 58% 59%, transparent 59% 100%)',
                  opacity: 0.85,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.16) 0 0.5deg, transparent 0.5deg 18deg)',
                  opacity: 0.52,
                }}
              />
              {safePrizes.map((prize, index) => {
                const angle = (360 / segments) * index;
                return (
                  <Box
                    key={prize.id}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: isMobile ? 8 : 10,
                        height: '42%',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0.08), transparent)',
                        borderRadius: 999,
                        opacity: 0.22,
                      }}
                    />
                  </Box>
                );
              })}

              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '34%', sm: '36%' },
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 26%, #fffdf7 0%, #eff6ff 34%, #d7e6ff 72%, #9dbbf8 100%)',
                  border: '1px solid rgba(255,255,255,0.34)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Stack spacing={0.2} alignItems="center" sx={{ px: 1 }}>
                  <Typography sx={{ color: '#5370bd', fontWeight: 800, letterSpacing: '0.28em', fontSize: { xs: '0.58rem', sm: '0.68rem' } }}>
                    REVEAL
                  </Typography>
                  <Typography sx={{ color: '#091227', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '0.95rem', sm: '1.1rem' }, lineHeight: 1 }}>
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
              mt: 2.25,
              px: { xs: 4.4, sm: 6.2 },
              py: { xs: 1.35, sm: 1.7 },
              minWidth: { xs: 220, sm: 280 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '0.92rem', sm: '1rem' },
              letterSpacing: '0.08em',
              color: '#f7fbff',
              background: 'linear-gradient(180deg, rgba(37,99,235,0.98) 0%, rgba(30,64,175,1) 100%)',
              boxShadow: '0 14px 24px rgba(37,99,235,0.24)',
              '&:hover': { background: 'linear-gradient(180deg, rgba(59,130,246,0.98) 0%, rgba(30,64,175,1) 100%)' },
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
          sx={{ mt: 1.5, opacity: 0.96 }}
        >
          {safePrizes.slice(0, 5).map((prize) => (
            <Chip
              key={prize.id}
              label={prizeLabel(prize)}
              sx={{
                bgcolor: 'rgba(59,130,246,0.10)',
                color: '#eff6ff',
                border: '1px solid rgba(96,165,250,0.14)',
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
