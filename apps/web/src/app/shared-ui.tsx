'use client';

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type SharedTone = 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

const toneMap: Record<SharedTone, { main: string; bg: string; glow: string }> = {
  blue: { main: '#2563eb', bg: '#eff6ff', glow: 'rgba(37,99,235,0.18)' },
  cyan: { main: '#06b6d4', bg: '#ecfeff', glow: 'rgba(6,182,212,0.18)' },
  emerald: { main: '#10b981', bg: '#ecfdf5', glow: 'rgba(16,185,129,0.18)' },
  amber: { main: '#f59e0b', bg: '#fffbeb', glow: 'rgba(245,158,11,0.18)' },
  rose: { main: '#f43f5e', bg: '#fff1f2', glow: 'rgba(244,63,94,0.18)' },
  violet: { main: '#8b5cf6', bg: '#f5f3ff', glow: 'rgba(139,92,246,0.18)' },
};

export function toneToken(tone: SharedTone = 'blue') {
  return toneMap[tone];
}

export function AppSection({
  title,
  subtitle,
  action,
  children,
  accent = 'blue',
  compact = false,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  accent?: SharedTone;
  compact?: boolean;
}) {
  const tone = toneToken(accent);
  return (
    <Card
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: 4,
        boxShadow: `0 16px 36px ${tone.main}12`,
        borderColor: 'divider',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          height: 4,
          background: `linear-gradient(90deg, ${tone.main}, #7c3aed, #10b981)`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, px: 2.25, py: 1.75, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', backgroundImage: `radial-gradient(circle at top left, ${tone.bg} 0%, rgba(255,255,255,0.98) 46%)` }}>
        <Box sx={{ position: 'relative', pl: 1.75 }}>
          <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, borderRadius: 999, bgcolor: tone.main }} />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.45 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      <Box sx={{ p: compact ? 1.5 : 2 }}>{children}</Box>
    </Card>
  );
}

export function PanelHead({
  title,
  subtitle,
  action,
  accent = 'blue',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: SharedTone;
}) {
  const tone = toneToken(accent);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, px: 2.25, py: 1.75, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', backgroundImage: `radial-gradient(circle at top left, ${tone.bg} 0%, rgba(255,255,255,0.98) 46%)` }}>
      <Box sx={{ position: 'relative', pl: 1.75 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, borderRadius: 999, bgcolor: tone.main }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.45 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

export function MetricCard({
  label,
  value,
  note,
  accent = 'blue',
  chip,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: SharedTone;
  chip?: string;
}) {
  const tone = toneToken(accent);
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        minHeight: 128,
        bgcolor: tone.bg,
        borderColor: `${tone.main}18`,
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.88) 0%, ${tone.bg} 38%, rgba(255,255,255,0.96) 100%)`,
        boxShadow: `0 10px 26px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.92), 0 0 0 1px ${tone.glow}`,
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: 124, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
            {label}
          </Typography>
          {chip ? <Chip size="small" label={chip} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.88)' }} /> : null}
        </Stack>
        <Typography sx={{ mt: 'auto', fontWeight: 900, lineHeight: 0.94, letterSpacing: '-0.04em', fontSize: { xs: '1.65rem', sm: '1.9rem', md: '2.05rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere', color: 'text.primary' }}>
          {value}
        </Typography>
        {note ? (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            {note}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#081222',
        backgroundImage:
          'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at top right, rgba(14,165,233,0.12), transparent 22%), radial-gradient(circle at 50% -10%, rgba(29,78,216,0.16), transparent 35%), linear-gradient(180deg, rgba(9,17,33,0.96) 0%, rgba(6,10,20,1) 100%)',
      }}
    >
      {children}
    </Box>
  );
}

export function HeroChip({ label, color = 'primary' }: { label: string; color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' }) {
  return <Chip label={label} color={color} size="small" sx={{ alignSelf: 'flex-start', fontWeight: 700, borderRadius: 999 }} />;
}

export function SectionButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} sx={{ borderRadius: 999, boxShadow: '0 10px 22px rgba(37, 99, 235, 0.16)', ...(props.sx ?? {}) }} />;
}

export function GameSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: 4,
        borderColor: 'rgba(88, 160, 255, 0.16)',
        background:
          'linear-gradient(180deg, rgba(10, 19, 37, 0.98) 0%, rgba(8, 14, 28, 1) 100%)',
        boxShadow: '0 24px 48px rgba(3, 8, 20, 0.44), inset 0 1px 0 rgba(255,255,255,0.05)',
        color: '#eef5ff',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          height: 4,
          background: 'linear-gradient(90deg, #2563eb, #38bdf8, #60a5fa)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, px: 2.25, py: 1.75, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, rgba(37,99,235,0.15) 0%, rgba(255,255,255,0) 100%)' }}>
        <Box sx={{ position: 'relative', pl: 1.75 }}>
          <Box sx={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, borderRadius: 999, bgcolor: '#3b82f6' }} />
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#f5f9ff' }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ mt: 0.25, lineHeight: 1.45, color: 'rgba(229,239,255,0.72)' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Card>
  );
}
