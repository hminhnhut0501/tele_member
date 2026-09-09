'use client';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Trang chủ', shortLabel: 'Home', icon: '⌂', href: '/' },
  { label: 'Vòng quay', shortLabel: 'Wheel', icon: '✦', href: '/wheel' },
  { label: 'Quà của tôi', shortLabel: 'Inbox', icon: '▣', href: '/my-rewards' },
  { label: 'Đổi quà', shortLabel: 'Store', icon: '◇', href: '/rewards' },
];

export function WheelProductHeader({ spins, peaches }: { spins: number; peaches: number }) {
  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        zIndex: 2,
        px: { xs: 1.5, sm: 2 },
        pt: 'max(12px, env(safe-area-inset-top))',
        pb: 1,
        borderBottom: '1px solid rgba(139,185,255,0.12)',
        background: 'linear-gradient(180deg, rgba(7,17,36,0.96) 0%, rgba(7,17,36,0.76) 100%)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Box sx={{ width: 'min(92vw, 560px)', mx: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <Box
              sx={{
                width: 38,
                height: 38,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                borderRadius: 1.5,
                color: '#eaf3ff',
                fontSize: '1.22rem',
                fontWeight: 900,
                background: 'linear-gradient(145deg, #4a8dff 0%, #1c3da5 100%)',
                border: '1px solid rgba(188,218,255,0.36)',
                boxShadow: '0 8px 20px rgba(42,96,235,0.28), inset 0 1px 0 rgba(255,255,255,0.24)',
              }}
            >
              ✦
            </Box>
            <Box minWidth={0}>
              <Typography sx={{ color: '#f5f9ff', fontSize: '0.96rem', lineHeight: 1.05, fontWeight: 950, letterSpacing: '-0.025em' }} noWrap>
                Blue lobby
              </Typography>
              <Typography sx={{ color: 'rgba(218,231,255,0.52)', fontSize: '0.72rem', mt: 0.35 }} noWrap>
                Lucky room của bạn
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.7} alignItems="center" flexShrink={0}>
            <Chip label={`${spins} lượt`} size="small" sx={{ height: 28, bgcolor: 'rgba(94,234,212,0.1)', color: '#71f1d7', border: '1px solid rgba(94,234,212,0.18)', fontWeight: 900 }} />
            <Chip label={`${peaches} 🍑`} size="small" sx={{ height: 28, bgcolor: 'rgba(255,209,102,0.1)', color: '#ffdc86', border: '1px solid rgba(255,209,102,0.18)', fontWeight: 900 }} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export function WheelProductNav() {
  const router = useRouter();

  return (
    <Box
      component="nav"
      aria-label="Điều hướng sản phẩm"
      sx={{
        position: 'fixed',
        zIndex: 10,
        right: 0,
        bottom: 0,
        left: 0,
        px: 1,
        pt: 0.75,
        pb: 'max(8px, env(safe-area-inset-bottom))',
        borderTop: '1px solid rgba(139,185,255,0.14)',
        background: 'rgba(5,12,25,0.92)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -12px 32px rgba(0,0,0,0.18)',
      }}
    >
      <Stack direction="row" justifyContent="center" spacing={{ xs: 0.25, sm: 1 }} sx={{ width: 'min(100%, 560px)', mx: 'auto' }}>
        {navItems.map((item) => {
          const active = item.href === '/wheel';
          return (
            <Button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={active ? 'page' : undefined}
              sx={{
                minWidth: 0,
                flex: 1,
                maxWidth: 132,
                px: { xs: 0.7, sm: 1.4 },
                py: 0.6,
                gap: 0.28,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1.7,
                color: active ? '#f5f9ff' : 'rgba(209,224,250,0.5)',
                background: active ? 'linear-gradient(180deg, rgba(52,105,232,0.32), rgba(33,68,159,0.13))' : 'transparent',
                border: active ? '1px solid rgba(116,166,255,0.24)' : '1px solid transparent',
                '&:hover': { background: 'rgba(75,132,255,0.12)' },
              }}
            >
              <Box component="span" sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' }, lineHeight: 1, color: active ? '#8db9ff' : 'inherit' }}>{item.icon}</Box>
              <Typography component="span" sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, lineHeight: 1.1, fontWeight: active ? 900 : 750, color: 'inherit' }}>{item.label}</Typography>
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
