'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Stack } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { WheelDial } from './wheel-dial';
import { buildWheelRenderContract } from './wheel-contract';
import type { WheelPrize } from './wheel-model';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [spins, setSpins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'settling'>('idle');
  const [rotation, setRotation] = useState(0);

  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([client.getWheelCurrent(), client.getMySpins()])
      .then(([wheel, spinData]) => {
        if (cancelled) return;
        setPrizes(((wheel?.prizes ?? []) as WheelPrize[]) ?? []);
        setSpins(Number(spinData?.balance ?? 0));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, token]);

  const renderContract = buildWheelRenderContract(prizes);
  const segments = renderContract.segments;

  async function handleSpin() {
    if (spinning) return;
    try {
      setSpinning(true);
      setSpinPhase('spinning');

      const spinStart = rotation + 1440 + Math.floor(Math.random() * 360);
      setRotation(spinStart);

      const data = await client.spinWheel();

      const prizeId = data?.prize?.id;
      const prizeIndex = segments.findIndex((segment) => segment.id === prizeId);
      if (prizeIndex >= 0) {
        const segmentAngle = 360 / Math.max(segments.length, 1);
        const target = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
        const finalRotation = spinStart + target;
        setSpinPhase('settling');
        setRotation(finalRotation + 10);
        window.setTimeout(() => setRotation(finalRotation - 3), 180);
        window.setTimeout(() => setRotation(finalRotation), 360);
        window.setTimeout(() => setSpinPhase('idle'), 620);
      }

      const updatedSpins = await client.getMySpins();
      setSpins(Number(updatedSpins?.balance ?? 0));
    } catch (err) {
      setSpinPhase('idle');
    } finally {
      setSpinning(false);
    }
  }

  return (
    <PageShell>
      <Container maxWidth="md" sx={{ py: { xs: 1, sm: 1.5 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: { xs: -20, sm: -32 },
            pointerEvents: 'none',
            opacity: 0.18,
            background:
              'radial-gradient(circle at 18% 18%, rgba(123,174,255,0.18), transparent 24%), radial-gradient(circle at 82% 16%, rgba(86,135,255,0.14), transparent 20%), radial-gradient(circle at 50% 50%, rgba(23,56,178,0.10), transparent 44%)',
            filter: 'blur(6px)',
          }}
        />

        <Stack spacing={1.5} sx={{ position: 'relative', alignItems: 'center' }}>
          <WheelDial
            segments={segments}
            spinning={spinning}
            spinPhase={spinPhase}
            rotation={rotation}
            centerLabel=""
            labelRadius={renderContract.labelRadius}
            wheelLabelScale={renderContract.wheelLabelScale}
            labelInset={renderContract.labelInset}
          />

          <Button
            onClick={handleSpin}
            disabled={loading || spinning || spins <= 0}
            variant="contained"
            sx={{
              minWidth: { xs: 240, sm: 300 },
              mt: 0.5,
              px: { xs: 4.5, sm: 6 },
              py: { xs: 1.35, sm: 1.55 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '1rem', sm: '1.04rem' },
              letterSpacing: '0.04em',
              color: '#f7fbff',
              background: 'linear-gradient(180deg, rgba(58,111,255,1) 0%, rgba(18,45,154,1) 100%)',
              boxShadow: '0 16px 30px rgba(33,69,191,0.26)',
              '&:hover': {
                background: 'linear-gradient(180deg, rgba(82,133,255,1) 0%, rgba(18,45,154,1) 100%)',
              },
            }}
          >
            {spinning ? 'ĐANG QUAY...' : spins > 0 ? 'QUAY NGAY' : 'HẾT LƯỢT QUAY'}
          </Button>
        </Stack>
      </Container>
    </PageShell>
  );
}
