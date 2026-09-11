'use client';

import { Box, Button, Chip, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { FixedWheelIcon } from './wheel-icons';

export type WheelResultGroupKey = 'gift' | 'peach' | 'nothing';

export type WheelResultSheetData = {
  groupKey: WheelResultGroupKey;
  prizeName: string;
  prizeType: string;
  glyph: string;
  code: string | null;
  points?: number | null;
  description?: string | null;
  deliveryMode?: string | null;
  deliveryTarget?: string | null;
  status: 'won' | 'missed' | 'pending' | 'claimed';
};

const GROUP_COPY: Record<WheelResultGroupKey, {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  softAccent: string;
}> = {
  gift: {
    eyebrow: 'PHẦN THƯỞNG MỚI',
    title: 'Chúc mừng bạn!',
    description: 'Phần quà đã được ghi nhận và sẵn sàng trong kho quà của bạn.',
    accent: '#FFD166',
    softAccent: 'rgba(255,209,102,0.16)',
  },
  peach: {
    eyebrow: 'ĐÀO MAY MẮN',
    title: 'Bạn nhận được đào!',
    description: 'Đào đã được cộng vào ví của bạn. Tiếp tục tích lũy để đổi thêm lượt quay.',
    accent: '#FF9A8B',
    softAccent: 'rgba(255,154,139,0.16)',
  },
  nothing: {
    eyebrow: 'LẦN QUAY NÀY',
    title: 'Chưa trúng lần này',
    description: 'Đừng bỏ cuộc, may mắn vẫn đang chờ ở lượt quay tiếp theo.',
    accent: '#9FC2FF',
    softAccent: 'rgba(159,194,255,0.14)',
  },
};

function getDeliveryCopy(result: WheelResultSheetData) {
  if (result.groupKey === 'peach') return 'Đã cộng vào ví đào';
  if (result.groupKey === 'gift') {
    if (result.deliveryMode === 'claim_required') return 'Cần nhận trong kho quà';
    if (result.deliveryMode === 'manual') return 'Đang chờ xử lý';
    return 'Đã gửi vào kho quà';
  }
  return 'Không phát sinh phần thưởng';
}

function getResultName(result: WheelResultSheetData) {
  if (result.groupKey === 'nothing') return 'Không trúng';
  return result.prizeName;
}

export function WheelResultSheet({
  open,
  result,
  onClose,
  onViewRewards,
  onSpinAgain,
  canSpinAgain,
}: {
  open: boolean;
  result: WheelResultSheetData | null;
  onClose: () => void;
  onViewRewards: () => void;
  onSpinAgain?: () => void;
  canSpinAgain?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const resolvedResult = result;

  const copy = GROUP_COPY[result.groupKey];
  const isWin = result.groupKey !== 'nothing';

  async function copyCode() {
    if (!resolvedResult.code || !navigator.clipboard) return;
    await navigator.clipboard.writeText(resolvedResult.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 'min(100%, 520px)',
          mx: 'auto',
          overflow: 'hidden',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(105, 147, 255, 0.18)',
          background: 'linear-gradient(180deg, rgba(7,14,30,0.99), rgba(12,21,44,0.99))',
          color: '#eef4ff',
          boxShadow: '0 30px 90px rgba(0,0,0,0.52)',
        },
      }}
    >
      <Box sx={{ position: 'relative', px: { xs: 2.25, sm: 3 }, pt: 1.25, pb: 2.25 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: '-35% -20% auto',
            height: 240,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 50% 18%, ${copy.softAccent}, transparent 62%)`,
          }}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative' }}>
          <Box sx={{ width: 34, height: 4, borderRadius: 99, bgcolor: 'rgba(226,234,255,0.24)', mx: 'auto' }} />
          <IconButton
            aria-label="Đóng kết quả"
            onClick={onClose}
            sx={{ position: 'absolute', right: -8, top: -8, color: 'rgba(226,234,255,0.72)' }}
          >
            <Box component="span" sx={{ fontSize: '1.4rem', lineHeight: 1 }}>×</Box>
          </IconButton>
        </Stack>

        <Stack spacing={1.1} alignItems="center" sx={{ position: 'relative', mt: 2.4, textAlign: 'center' }}>
          <Chip
            label={copy.eyebrow}
            size="small"
            sx={{
              bgcolor: copy.softAccent,
              color: copy.accent,
              border: `1px solid ${copy.accent}55`,
              fontWeight: 900,
              letterSpacing: '0.08em',
              fontSize: '0.68rem',
            }}
          />
          <Box
            sx={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: copy.softAccent,
              border: `1px solid ${copy.accent}66`,
              boxShadow: `0 0 0 8px ${copy.softAccent}, 0 18px 36px rgba(0,0,0,0.24)`,
              fontSize: '3.15rem',
              lineHeight: 1,
            }}
          >
            <FixedWheelIcon kind={result.groupKey} size={68} variant={result.groupKey === 'nothing' ? 2 : 1} />
          </Box>
          <Typography sx={{ color: '#f7fbff', fontWeight: 950, fontSize: { xs: '1.55rem', sm: '1.7rem' }, letterSpacing: '-0.04em' }}>
            {copy.title}
          </Typography>
          <Typography sx={{ maxWidth: 390, color: 'rgba(226,234,255,0.68)', fontSize: '0.9rem', lineHeight: 1.45 }}>
            {result.description || copy.description}
          </Typography>
        </Stack>

        <Stack spacing={1.1} sx={{ position: 'relative', mt: 2.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <Typography sx={{ color: 'rgba(226,234,255,0.58)', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              KẾT QUẢ
            </Typography>
            <Typography sx={{ mt: 0.35, color: '#f7fbff', fontWeight: 900, fontSize: '1.08rem' }}>
              {getResultName(result)}
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.7 }}>
              <Chip label={getDeliveryCopy(result)} size="small" sx={{ bgcolor: copy.softAccent, color: copy.accent, fontWeight: 800 }} />
              {result.points ? <Chip label={`+${result.points} đào`} size="small" sx={{ bgcolor: 'rgba(255,154,139,0.12)', color: '#FFB7A7', fontWeight: 800 }} /> : null}
            </Stack>
          </Box>

          {result.code ? (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.2)' }}>
              <Typography sx={{ color: 'rgba(255,244,209,0.72)', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                MÃ NHẬN QUÀ
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.45 }}>
                <Typography sx={{ flex: 1, color: '#FFF2C0', fontWeight: 950, letterSpacing: '0.08em', wordBreak: 'break-all' }}>
                  {result.code}
                </Typography>
                <Button onClick={copyCode} size="small" variant="outlined" sx={{ minWidth: 72, borderRadius: 99, color: '#FFF2C0', borderColor: 'rgba(255,209,102,0.34)', fontWeight: 800 }}>
                  {copied ? 'Đã copy' : 'Copy'}
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ position: 'relative', mt: 2.1 }}>
          {isWin ? (
            <Button onClick={onViewRewards} variant="contained" sx={{ flex: 1, borderRadius: 99, py: 1.15, fontWeight: 900, background: 'linear-gradient(180deg, #3A6FFF 0%, #122D9A 100%)' }}>
              XEM QUÀ CỦA TÔI
            </Button>
          ) : null}
          {canSpinAgain && onSpinAgain ? (
            <Button onClick={onSpinAgain} variant={isWin ? 'outlined' : 'contained'} sx={{ flex: 1, borderRadius: 99, py: 1.15, fontWeight: 900, color: '#DBEAFE', borderColor: 'rgba(123,174,255,0.32)', ...(isWin ? {} : { background: 'linear-gradient(180deg, #3A6FFF 0%, #122D9A 100%)' }) }}>
              QUAY TIẾP
            </Button>
          ) : null}
          {!isWin && !canSpinAgain ? (
            <Button onClick={onClose} variant="outlined" sx={{ flex: 1, borderRadius: 99, py: 1.15, color: '#DBEAFE', borderColor: 'rgba(123,174,255,0.32)', fontWeight: 900 }}>
              ĐÓNG
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Drawer>
  );
}
