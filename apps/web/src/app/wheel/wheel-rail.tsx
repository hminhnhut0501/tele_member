'use client';

import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { getWheelPrizeGlyph, type WheelPrize, type WheelSpinHistoryItem } from './wheel-model';

function formatCompactTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function WheelHistoryTicker({ items }: { items: WheelSpinHistoryItem[] }) {
  const tickerItems = useMemo(() => {
    const source = [...items]
      .filter((item) => item.prizeName || item.resultLabel)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    return source.length ? [...source, ...source] : [];
  }, [items]);

  if (!tickerItems.length) return null;

  return (
    <Box
      sx={{
        width: 'min(92vw, 560px)',
        overflow: 'hidden',
        borderRadius: 1,
        border: '1px solid rgba(105, 147, 255, 0.10)',
        background: 'linear-gradient(180deg, rgba(7,14,30,0.88), rgba(9,16,34,0.96))',
        boxShadow: '0 16px 42px rgba(0,0,0,0.18)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, whiteSpace: 'nowrap', position: 'relative' }}>
        <Chip
          label="Trúng gần đây"
          size="small"
          sx={{
            flex: '0 0 auto',
            bgcolor: 'rgba(102,168,255,0.16)',
            color: '#ecf4ff',
            border: '1px solid rgba(102,168,255,0.20)',
            fontWeight: 800,
          }}
        />
        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden', position: 'relative', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'max-content', animation: `wheelTicker ${Math.max(16, tickerItems.length * 2.8)}s linear infinite`, willChange: 'transform', '@keyframes wheelTicker': { '0%': { transform: 'translate3d(0, 0, 0)' }, '100%': { transform: 'translate3d(-50%, 0, 0)' } } }}>
            {tickerItems.map((item, index) => {
            const glyph = item.prizeToken || item.resultLabel || getWheelPrizeGlyph({ type: item.resultType, metadata: item.resultMetadata });
            const prizeText = item.prizeName || item.resultLabel || 'Không trúng';
            const timeText = formatCompactTime(item.createdAt);
            return (
              <Box
                key={`${item.id}-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.7,
                  px: 1,
                  py: 0.55,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#f4f8ff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  flex: '0 0 auto',
                }}
              >
                <Box component="span" sx={{ fontSize: '0.96rem', lineHeight: 1 }}>
                  {glyph}
                </Box>
                <Box component="span" sx={{ color: '#dbeafe' }}>
                  {prizeText}
                </Box>
                <Box component="span" sx={{ color: 'rgba(226,234,255,0.56)' }}>
                  {timeText}
                </Box>
              </Box>
            );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function WheelRewardRail({ prizes }: { prizes: WheelPrize[] }) {
  const groups = [
    { key: 'gift', label: 'Quà', glyph: '🎁', description: 'Voucher và phần thưởng bất ngờ', tone: '#FFD166', soft: 'rgba(255,209,102,0.10)' },
    { key: 'peach', label: 'Đào', glyph: '🍑', description: 'Đào được cộng vào ví', tone: '#FF9A8B', soft: 'rgba(255,154,139,0.10)' },
    { key: 'nothing', label: 'Không trúng', glyph: '✦', description: 'May mắn ở lượt tiếp theo', tone: '#9FC2FF', soft: 'rgba(159,194,255,0.10)' },
  ];
  return (
    <Card
      sx={{
        borderRadius: 1.25,
        border: '1px solid rgba(105, 147, 255, 0.10)',
        background: 'linear-gradient(180deg, rgba(7,14,30,0.90), rgba(9,16,34,0.96))',
        boxShadow: '0 20px 56px rgba(0,0,0,0.22)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.75}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ color: '#eef4ff', fontWeight: 950, letterSpacing: '-0.045em', fontSize: '1.25rem' }}>
                Phần thưởng
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.64)', fontSize: '0.84rem' }}>
                Nhóm được chọn trước, outcome cụ thể được chọn ngẫu nhiên sau đó.
              </Typography>
            </Box>
            <Chip
              label="3 nhóm"
              sx={{ bgcolor: 'rgba(102,168,255,0.14)', color: '#ecf4ff', border: '1px solid rgba(102,168,255,0.18)', fontWeight: 800 }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.1 }}>
            {groups.map((group) => {
              const outcomes = prizes.filter((prize) => (prize.groupKey ?? (String(prize.type).toUpperCase() === 'NOTHING' ? 'nothing' : String(prize.type).toUpperCase() === 'POINT' ? 'peach' : 'gift')) === group.key);
              return (
                <Box key={group.key} sx={{ p: 1.25, borderRadius: 2, bgcolor: group.soft, border: `1px solid ${group.tone}38` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Stack direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', flex: '0 0 auto' }}>{group.glyph}</Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#f4f8ff', fontWeight: 900, fontSize: '0.92rem' }}>{group.label}</Typography>
                        <Typography sx={{ color: 'rgba(226,234,255,0.62)', fontSize: '0.72rem' }}>{outcomes.length} outcome</Typography>
                      </Box>
                    </Stack>
                    <Typography sx={{ color: group.tone, fontSize: '0.72rem', fontWeight: 900, textAlign: 'right' }}>{group.description}</Typography>
                  </Stack>
                  <Stack spacing={0.7} sx={{ mt: 1 }}>
                    {outcomes.length ? outcomes.map((prize) => {
                      const glyph = getWheelPrizeGlyph(prize);
                      const points = Number(prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value ?? 0);
                      const detail = points > 0 ? `+${points} đào` : prize.metadata?.deliveryMode === 'claim_required' ? 'Cần nhận' : 'Đã cấu hình';
                      return (
                        <Box key={prize.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 0.85, py: 0.7, borderRadius: 1.25, bgcolor: 'rgba(4,12,29,0.34)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.10)', fontSize: '0.92rem', flex: '0 0 auto' }}>{glyph}</Box>
                          <Typography noWrap sx={{ minWidth: 0, flex: 1, color: '#eef4ff', fontWeight: 800, fontSize: '0.78rem' }}>{prize.name}</Typography>
                          <Typography noWrap sx={{ color: group.tone, fontSize: '0.7rem', fontWeight: 850 }}>{detail}</Typography>
                        </Box>
                      );
                    }) : (
                      <Typography sx={{ color: 'rgba(226,234,255,0.54)', fontSize: '0.76rem', py: 0.5 }}>Đang chờ cấu hình outcome.</Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WheelHowToPlay({ spins, exchangeCost }: { spins: number; exchangeCost: number }) {
  const steps = [
    { number: '01', title: 'Có lượt quay', description: `${spins} lượt đang có trong ví` },
    { number: '02', title: 'Quay và chờ kết quả', description: 'Wheel chọn nhóm rồi chọn quà con' },
    { number: '03', title: 'Nhận phần thưởng', description: `Đổi thêm lượt với ${exchangeCost} đào` },
  ];
  return (
    <Card sx={{ borderRadius: 1.25, border: '1px solid rgba(94,234,212,0.18)', background: 'linear-gradient(180deg, rgba(5,32,39,0.78), rgba(7,20,37,0.94))', boxShadow: '0 18px 48px rgba(0,0,0,0.18)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.25}>
          <Typography sx={{ color: '#5EEAD4', fontWeight: 950, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>💡 Cách nhận lượt quay</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
            {steps.map((step) => (
              <Stack key={step.number} direction="row" spacing={1} alignItems="flex-start">
                <Typography sx={{ color: '#5EEAD4', fontWeight: 950, fontSize: '0.72rem', letterSpacing: '0.08em' }}>{step.number}</Typography>
                <Box>
                  <Typography sx={{ color: '#effffb', fontWeight: 850, fontSize: '0.8rem' }}>{step.title}</Typography>
                  <Typography sx={{ color: 'rgba(226,234,255,0.58)', fontSize: '0.72rem', lineHeight: 1.35 }}>{step.description}</Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WheelHistoryRail({ items }: { items: WheelSpinHistoryItem[] }) {
  return (
    <Card
      sx={{
        borderRadius: 1.25,
        border: '1px solid rgba(105, 147, 255, 0.10)',
        background: 'linear-gradient(180deg, rgba(7,14,30,0.90), rgba(9,16,34,0.96))',
        boxShadow: '0 20px 56px rgba(0,0,0,0.22)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ color: '#eef4ff', fontWeight: 900, letterSpacing: '-0.04em', fontSize: '1.1rem' }}>
                Lịch sử trúng của bạn
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.64)', fontSize: '0.84rem' }}>
                Mỗi dòng ưu tiên tên quà trước, người nhận và thời gian ở sau.
              </Typography>
            </Box>
            <Chip
              label={`${items.length} mục`}
              sx={{ bgcolor: 'rgba(102,168,255,0.14)', color: '#ecf4ff', border: '1px solid rgba(102,168,255,0.18)', fontWeight: 800 }}
            />
          </Box>

          <Stack spacing={1}>
            {items.length ? items.map((item) => {
              const createdAt = item.createdAt ?? '';
              const prizeName = item.prizeName || item.resultLabel || 'Không trúng';
              const glyph = item.prizeToken || item.resultLabel || getWheelPrizeGlyph({ type: item.resultType, metadata: item.resultMetadata });
              const statusLabel =
                item.status === 'won' ? 'Đã trúng' :
                item.status === 'claimed' ? 'Đã nhận' :
                item.status === 'pending' ? 'Chờ xử lý' :
                'Chưa trúng';
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(102,168,255,0.14)',
                        color: '#eff6ff',
                        flex: '0 0 auto',
                        fontSize: '1rem',
                        fontWeight: 900,
                      }}
                    >
                      {glyph}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: '#f4f8ff', fontWeight: 900, lineHeight: 1.1 }} noWrap>
                        {prizeName}
                      </Typography>
                      <Typography sx={{ color: 'rgba(226,234,255,0.72)', fontSize: '0.83rem' }} noWrap>
                        {item.displayName ? `${item.displayName} • ` : ''}
                        {item.status === 'won' ? 'Đã trúng' : item.status === 'claimed' ? 'Đã nhận' : item.status === 'pending' ? 'Chờ xử lý' : 'Không trúng'}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusLabel}
                      size="small"
                      sx={{
                        bgcolor: item.status === 'won' ? 'rgba(52,211,153,0.16)' : 'rgba(255,255,255,0.06)',
                        color: '#ecf4ff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontWeight: 800,
                      }}
                    />
                  </Stack>
                  <Typography sx={{ color: 'rgba(226,234,255,0.56)', fontSize: '0.78rem', flex: '0 0 auto', alignSelf: 'flex-end' }}>
                    {createdAt ? new Date(createdAt).toLocaleString('vi-VN') : '—'}
                  </Typography>
                </Box>
              );
            }) : (
              <Box
                sx={{
                  px: 2,
                  py: 2.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  color: 'rgba(226,234,255,0.72)',
                  textAlign: 'center',
                }}
              >
                Chưa có lịch sử trúng.
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
