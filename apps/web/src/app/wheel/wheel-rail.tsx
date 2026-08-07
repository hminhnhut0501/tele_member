'use client';

import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { getWheelPrizeGlyph, getWheelPrizeShortLabel, type WheelPrize, type WheelSpinHistoryItem } from './wheel-model';

export function WheelRewardRail({ prizes }: { prizes: WheelPrize[] }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
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
        borderRadius: 4,
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
                Lịch sử trúng gần đây
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.64)', fontSize: '0.84rem' }}>
                Tăng độ tin cậy và cho thấy wheel đang hoạt động thật.
              </Typography>
            </Box>
            <Chip
              label={`${items.length} latest`}
              sx={{ bgcolor: 'rgba(102,168,255,0.14)', color: '#ecf4ff', border: '1px solid rgba(102,168,255,0.18)', fontWeight: 800 }}
            />
          </Box>

          <Stack spacing={1}>
            {items.length ? items.map((item) => {
              const name = item.displayName ?? (item.username ? `@${item.username}` : 'Người chơi');
              const createdAt = item.createdAt ?? '';
              const prizeName = item.prizeName || 'Không trúng';
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
                    gap: 2,
                    alignItems: 'center',
                    px: 1.5,
                    py: 1.2,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
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
                    {glyph}
                  </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: '#f4f8ff', fontWeight: 800, lineHeight: 1.2 }} noWrap>
                        {name}
                      </Typography>
                      <Typography sx={{ color: 'rgba(226,234,255,0.70)', fontSize: '0.84rem' }} noWrap>
                        {prizeName}
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
                  borderRadius: 3,
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
