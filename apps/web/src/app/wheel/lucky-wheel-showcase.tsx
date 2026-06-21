'use client';

import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import type { CSSProperties } from 'react';

type WheelPrize = {
  id: string;
  name: string;
  type: string;
  weight: number;
  metadata?: Record<string, unknown> | null;
};

function fallbackLabel(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `+${amount}đ` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP';
  if (type === 'CUSTOM') return prize.name || 'Không trúng';
  return prize.name || type || 'Prize';
}

function wheelTone(type: string, index: number) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT') return index % 2 === 0 ? '#ecce67' : '#f5df8d';
  if (t === 'SPIN_TICKET') return index % 2 === 0 ? '#9ec9ff' : '#6fa4ff';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return index % 2 === 0 ? '#0f1a33' : '#152547';
  return index % 2 === 0 ? '#2958cf' : '#3f74eb';
}

function prizeBadgeTone(type: string) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT') return { fg: '#f7e4a0', bg: 'rgba(239,196,73,0.12)', border: 'rgba(239,196,73,0.20)' };
  if (t === 'SPIN_TICKET') return { fg: '#d7ecff', bg: 'rgba(82,147,255,0.12)', border: 'rgba(82,147,255,0.18)' };
  if (t === 'VOUCHER' || t === 'VIP_CODE') return { fg: '#f6f2e8', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)' };
  return { fg: '#dbe6ff', bg: 'rgba(74,118,228,0.12)', border: 'rgba(74,118,228,0.20)' };
}

function DemoCard() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: 5,
        background:
          'radial-gradient(circle at 50% 18%, rgba(255,216,108,0.20), transparent 28%), linear-gradient(180deg, rgba(5,15,32,0.92) 0%, rgba(6,11,24,0.98) 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            'linear-gradient(rgba(114,167,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(114,167,255,0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 5,
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 96px rgba(12,44,105,0.28), 0 24px 56px rgba(0,0,0,0.28)',
        }}
      />
    </Box>
  );
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
    transition: spinning ? 'transform 6.4s cubic-bezier(0.16, 0.86, 0.18, 1)' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    willChange: 'transform',
  } as CSSProperties;

  const wheelSize = 'min(72vw, 440px)';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 4, sm: 5 },
        border: '1px solid rgba(95, 144, 255, 0.16)',
        background:
          'radial-gradient(circle at 20% 8%, rgba(48,89,186,0.20), transparent 18%), radial-gradient(circle at 82% 12%, rgba(255,212,111,0.10), transparent 18%), linear-gradient(180deg, rgba(7,14,31,0.98) 0%, rgba(5,10,22,1) 100%)',
        boxShadow: '0 28px 64px rgba(0,0,0,0.38)',
      }}
    >
      <DemoCard />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.5 }, zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: '#f7f2e7',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                fontSize: { xs: '1.7rem', sm: '2.2rem' },
                lineHeight: 0.94,
              }}
            >
              {campaignName ?? 'Reveal Wheel'}
            </Typography>
            <Typography
              sx={{
                mt: 0.8,
                maxWidth: 620,
                color: 'rgba(231, 238, 255, 0.72)',
                fontSize: { xs: '0.96rem', sm: '1.02rem' },
                lineHeight: 1.45,
              }}
            >
              {campaignDescription ?? 'UI game tối giản, premium và an toàn cho mobile. Không casino, không rối, chỉ tập trung vào reveal và reward.'}
            </Typography>
          </Box>
          <Chip
            label={`${spins} lượt`}
            sx={{
              bgcolor: 'rgba(255, 214, 102, 0.10)',
              color: '#f9e7b7',
              border: '1px solid rgba(255,214,102,0.18)',
              fontWeight: 800,
              letterSpacing: '0.01em',
              flexShrink: 0,
            }}
          />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 2, md: 2.5 },
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 4,
              border: '1px solid rgba(103, 151, 255, 0.14)',
              background: 'linear-gradient(180deg, rgba(11,20,41,0.82), rgba(8,13,26,0.94))',
              overflow: 'hidden',
              p: { xs: 2, sm: 2.5 },
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

            <Stack spacing={1.6} sx={{ position: 'relative' }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Minimal game UI" sx={{ bgcolor: 'rgba(76, 120, 255, 0.12)', color: '#dbe6ff', border: '1px solid rgba(76,120,255,0.16)' }} />
                <Chip label="Blue / bronze" sx={{ bgcolor: 'rgba(255, 212, 111, 0.10)', color: '#f8e6ae', border: '1px solid rgba(255,212,111,0.16)' }} />
                <Chip label={`${safePrizes.length} rewards`} sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#edf3ff', border: '1px solid rgba(255,255,255,0.08)' }} />
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' },
                  gap: 1,
                }}
              >
                <Box sx={{ p: 1.4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography sx={{ color: 'rgba(230,239,255,0.68)', fontSize: '0.75rem', letterSpacing: '0.18em', fontWeight: 800 }}>STATE</Typography>
                  <Typography sx={{ mt: 0.5, color: '#f8f3e6', fontWeight: 900, fontSize: '1.02rem' }}>{spinning ? 'SPINNING' : resultName ? 'REVEALED' : 'READY'}</Typography>
                </Box>
                <Box sx={{ p: 1.4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography sx={{ color: 'rgba(230,239,255,0.68)', fontSize: '0.75rem', letterSpacing: '0.18em', fontWeight: 800 }}>WEIGHT</Typography>
                  <Typography sx={{ mt: 0.5, color: '#f8f3e6', fontWeight: 900, fontSize: '1.02rem' }}>Balanced</Typography>
                </Box>
                <Box sx={{ p: 1.4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography sx={{ color: 'rgba(230,239,255,0.68)', fontSize: '0.75rem', letterSpacing: '0.18em', fontWeight: 800 }}>FEEL</Typography>
                  <Typography sx={{ mt: 0.5, color: '#f8f3e6', fontWeight: 900, fontSize: '1.02rem' }}>Premium</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

              <Box
                sx={{
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 6, sm: 8 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: { xs: '19px solid transparent', sm: '22px solid transparent' },
                    borderRight: { xs: '19px solid transparent', sm: '22px solid transparent' },
                    borderTop: { xs: '48px solid rgba(255, 210, 103, 0.98)', sm: '58px solid rgba(255, 210, 103, 0.98)' },
                    filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.22))',
                    zIndex: 4,
                  }}
                />

                <Box
                  sx={{
                    width: wheelSize,
                    maxWidth: '100%',
                    aspectRatio: '1 / 1',
                    position: 'relative',
                    display: 'grid',
                    placeItems: 'center',
                    my: 1.3,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: { xs: 0, sm: 4 },
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 52%, rgba(0,0,0,0.34) 100%)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 18px rgba(255,255,255,0.02)',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      inset: { xs: 8, sm: 16 },
                      borderRadius: '50%',
                      ...wheelStyle,
                      boxShadow:
                        'inset 0 0 0 8px rgba(255, 214, 107, 0.78), inset 0 0 0 16px rgba(255,255,255,0.03), 0 16px 38px rgba(0,0,0,0.30)',
                      overflow: 'hidden',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.02) 100%)',
                    }}
                  >
                    <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden' }}>
                      {safePrizes.map((prize, index) => (
                        <Box
                          key={prize.id}
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: `conic-gradient(from ${index * segmentAngle}deg, ${wheelTone(prize.type, index)} 0 ${segmentAngle}deg, transparent ${segmentAngle}deg 360deg)`,
                            clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%)',
                            transform: `rotate(${index * segmentAngle}deg)`,
                            opacity: 0.97,
                          }}
                        />
                      ))}

                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background:
                            'repeating-conic-gradient(from -90deg, rgba(255,255,255,0.10) 0 0.45deg, transparent 0.45deg 29deg)',
                        }}
                      />

                      {safePrizes.map((prize, index) => {
                        const angle = index * segmentAngle + segmentAngle / 2;
                        const label = fallbackLabel(prize);
                        const isDark = String(prize.type ?? '').toUpperCase() === 'VOUCHER' || String(prize.type ?? '').toUpperCase() === 'VIP_CODE';
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
                                top: { xs: '15%', sm: '16%' },
                                transform: `translateX(-50%) rotate(${angle - 90}deg)`,
                                transformOrigin: 'center',
                                textAlign: 'center',
                                maxWidth: { xs: 84, sm: 92 },
                                color: isDark ? '#f2f5ff' : '#101b32',
                                fontWeight: 900,
                                fontSize: { xs: '0.68rem', sm: '0.8rem' },
                                lineHeight: 1.04,
                                letterSpacing: '-0.01em',
                                textShadow: isDark ? '0 1px 6px rgba(0,0,0,0.18)' : '0 1px 0 rgba(255,255,255,0.20)',
                              }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        inset: { xs: '34%', sm: '35%' },
                        borderRadius: '50%',
                        background:
                          'radial-gradient(circle at 32% 28%, #fffefb 0%, #f8e8bb 38%, #d5b85f 72%, #af8736 100%)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.22)',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Stack spacing={0.2} alignItems="center" sx={{ px: 1.2 }}>
                        <Typography sx={{ color: '#7a4910', fontWeight: 900, letterSpacing: '0.26em', fontSize: { xs: '0.55rem', sm: '0.66rem' } }}>
                          REVEAL
                        </Typography>
                        <Typography sx={{ color: '#2a1704', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '0.88rem', sm: '1rem' }, lineHeight: 1 }}>
                          {spinning ? 'Đang quay' : resultName ?? 'Sẵn sàng'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', placeItems: 'center', pt: 0.5 }}>
                <Button
                  onClick={onSpin}
                  disabled={disabled || spinning || spins <= 0}
                  variant="contained"
                  sx={{
                    minWidth: { xs: 220, sm: 300 },
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.3, sm: 1.55 },
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    letterSpacing: '0.08em',
                    color: '#f7fbff',
                    background: 'linear-gradient(180deg, rgba(61,106,244,1) 0%, rgba(33,69,191,1) 100%)',
                    boxShadow: '0 14px 28px rgba(33,69,191,0.24)',
                    '&:hover': {
                      background: 'linear-gradient(180deg, rgba(86,128,255,1) 0%, rgba(33,69,191,1) 100%)',
                    },
                  }}
                >
                  {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT QUAY'}
                </Button>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={1.5}>
            <Box
              sx={{
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(180deg, rgba(10,18,36,0.86), rgba(7,11,21,0.96))',
                p: { xs: 2, sm: 2.25 },
              }}
            >
              <Typography sx={{ color: '#f8f4e9', fontWeight: 900, letterSpacing: '-0.04em', fontSize: '1.15rem' }}>
                Cách chơi
              </Typography>
              <Typography sx={{ mt: 0.75, color: 'rgba(230,238,255,0.72)', lineHeight: 1.55, fontSize: '0.96rem' }}>
                Tích lượt quay, bấm quay một lần, chờ reveal rõ ràng và trả về kết quả trực tiếp dưới wheel. Không pop-up lồng nhau, không canvas nặng.
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(180deg, rgba(10,18,36,0.86), rgba(7,11,21,0.96))',
                p: { xs: 2, sm: 2.25 },
              }}
            >
              <Typography sx={{ color: '#f8f4e9', fontWeight: 900, letterSpacing: '-0.04em', fontSize: '1.15rem' }}>
                Reward rail
              </Typography>
              <Typography sx={{ mt: 0.75, color: 'rgba(230,238,255,0.72)', lineHeight: 1.55, fontSize: '0.96rem' }}>
                Mỗi prize là một node riêng, tối giản hoá label, màu phân tách theo nhóm reward.
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.4 }}>
                {safePrizes.map((prize) => {
                  const tone = prizeBadgeTone(prize.type);
                  return (
                    <Box
                      key={prize.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.3,
                        borderRadius: 3,
                        bgcolor: tone.bg,
                        border: `1px solid ${tone.border}`,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#f7f2e7', fontWeight: 800, lineHeight: 1.1 }}>
                          {fallbackLabel(prize)}
                        </Typography>
                        <Typography sx={{ color: 'rgba(230,238,255,0.62)', fontSize: '0.82rem', mt: 0.25 }}>
                          {String(prize.type ?? 'CUSTOM').toUpperCase()}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: tone.fg, fontWeight: 900, letterSpacing: '0.06em' }}>
                        {prize.weight}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
