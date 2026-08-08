'use client';

import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { getWheelPrizeGlyph, getWheelPrizeShortLabel, type WheelPrize, type WheelSpinHistoryItem } from './wheel-model';

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
      .slice(0, 10);
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
      <Box
        sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 'max-content',
            animation: `wheelTicker ${Math.max(18, tickerItems.length * 3.2)}s linear infinite`,
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)',
            '@keyframes wheelTicker': {
              '0%': { transform: 'translate3d(0, 0, 0)' },
              '100%': { transform: 'translate3d(-50%, 0, 0)' },
            },
          }}
        >
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
                  gap: 0.85,
                  px: 1.2,
                  py: 0.6,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#f4f8ff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  flex: '0 0 auto',
                }}
              >
                <Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
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
  );
}

export function WheelRewardRail({ prizes }: { prizes: WheelPrize[] }) {
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
                Quà trên wheel
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.64)', fontSize: '0.84rem' }}>
                Icon-first, quà ngắn, có thể đổi số lượng và glyph trong CP.
              </Typography>
            </Box>
            <Chip
              label={`${prizes.length} prize${prizes.length === 1 ? '' : 's'}`}
              sx={{ bgcolor: 'rgba(102,168,255,0.14)', color: '#ecf4ff', border: '1px solid rgba(102,168,255,0.18)', fontWeight: 800 }}
            />
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {prizes.map((prize) => (
              <Chip
                key={prize.id}
                icon={<Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>{getWheelPrizeGlyph(prize)}</Box>}
                label={getWheelPrizeShortLabel(prize)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: '#eef4ff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontWeight: 700,
                  '& .MuiChip-icon': { ml: 1 },
                }}
              />
            ))}
          </Stack>
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
                Hiển thị các quà đã trúng gần nhất, ưu tiên làm rõ phần thưởng.
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
                    justifyContent: 'space-between',
                    gap: 1.5,
                    alignItems: 'center',
                    px: 1.5,
                    py: 1.2,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
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
                      <Typography sx={{ color: 'rgba(226,234,255,0.72)', fontSize: '0.84rem' }} noWrap>
                        {item.displayName ? `${item.displayName} • ` : ''}
                        {item.resultLabel || item.resultType}
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
                  <Typography sx={{ color: 'rgba(226,234,255,0.56)', fontSize: '0.8rem', flex: '0 0 auto' }}>
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
