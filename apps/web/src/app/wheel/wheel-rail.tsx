'use client';

import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { WheelPrize, WheelSpinHistoryItem } from './wheel-model';
import { FixedWheelIcon } from './wheel-icons';

type WheelIconKind = 'gift' | 'peach' | 'nothing';

function getHistoryIconKind(item: WheelSpinHistoryItem): WheelIconKind {
  const type = String(item.resultType ?? '').toUpperCase();
  const groupKey = String(item.resultMetadata?.groupKey ?? '').toLowerCase();
  if (groupKey === 'peach' || groupKey === 'nothing' || groupKey === 'gift') return groupKey;
  if (type === 'POINT') return 'peach';
  if (type === 'NOTHING' || item.status === 'missed') return 'nothing';
  return 'gift';
}

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
                <FixedWheelIcon kind={getHistoryIconKind(item)} size={20} variant={index % 2 === 0 ? 1 : 2} />
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
    { key: 'gift', label: 'Quà', tone: '#FFD166', soft: 'rgba(255,209,102,0.10)' },
    { key: 'peach', label: 'Đào', tone: '#FF9A8B', soft: 'rgba(255,154,139,0.10)' },
    { key: 'nothing', label: 'Không trúng', tone: '#9FC2FF', soft: 'rgba(159,194,255,0.10)' },
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
            <Typography sx={{ color: '#eef4ff', fontWeight: 950, letterSpacing: '-0.045em', fontSize: '1.25rem' }}>Phần thưởng</Typography>
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
                      <Box sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.9)', flex: '0 0 auto' }}><FixedWheelIcon kind={group.key as WheelIconKind} size={27} /></Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#f4f8ff', fontWeight: 900, fontSize: '0.92rem' }}>{group.label}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Stack spacing={0.7} sx={{ mt: 1 }}>
                    {outcomes.length ? outcomes.map((prize) => {
                      const points = Number(prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value ?? 0);
                      const type = String(prize.type ?? '').toUpperCase();
                      const rawName = String(prize.metadata?.railLabel ?? prize.name ?? '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
                      const label = points > 0
                        ? `+${points} đào`
                        : type === 'SPIN_TICKET' || type === 'SPIN'
                          ? '+1 lượt quay'
                          : rawName || 'Phần thưởng';
                      return (
                        <Box key={prize.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.8, borderRadius: 1.25, bgcolor: 'rgba(4,12,29,0.34)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <Typography noWrap sx={{ minWidth: 0, color: '#eef4ff', fontWeight: 850, fontSize: '0.8rem' }}>{label}</Typography>
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
            <Typography sx={{ color: '#eef4ff', fontWeight: 900, letterSpacing: '-0.04em', fontSize: '1.1rem' }}>Lịch sử quay</Typography>
            <Chip
              label={`${items.length} mục`}
              sx={{ bgcolor: 'rgba(102,168,255,0.14)', color: '#ecf4ff', border: '1px solid rgba(102,168,255,0.18)', fontWeight: 800 }}
            />
          </Box>

          <Stack spacing={1}>
            {items.length ? items.map((item) => {
              const createdAt = item.createdAt ?? '';
              const rawName = String(item.prizeName || item.resultLabel || 'Không trúng').replace(/^[^\p{L}\p{N}]+/u, '').trim();
              const resultType = String(item.resultType ?? '').toUpperCase();
              const prizeName = resultType === 'POINT'
                ? `+${rawName.replace(/^\+/, '')} đào`
                : resultType === 'SPIN_TICKET' || resultType === 'SPIN'
                  ? '+1 lượt quay'
                  : rawName;
              const compactTime = createdAt
                ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(createdAt))
                : '—';
              return (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.25,
                    py: 0.8,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
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
                      <FixedWheelIcon kind={getHistoryIconKind(item)} size={31} variant={item.status === 'won' ? 1 : 2} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: '#f4f8ff', fontWeight: 900, lineHeight: 1.1, fontSize: '0.9rem' }} noWrap>
                        {prizeName}
                      </Typography>
                      <Typography sx={{ color: 'rgba(226,234,255,0.52)', fontSize: '0.7rem' }} noWrap>{compactTime}</Typography>
                    </Box>
                  </Stack>
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
