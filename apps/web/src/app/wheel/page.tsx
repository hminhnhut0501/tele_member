'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { WheelDial } from './wheel-dial';
import { buildWheelRenderContract } from './wheel-contract';
import { getWheelDefaultOutcomeLabel, getWheelFallbackCampaign, type WheelCampaign, type WheelPrize } from './wheel-model';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<WheelCampaign | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [spins, setSpins] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
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
        setCampaign((wheel?.campaign ?? null) as WheelCampaign | null);
        setPrizes(((wheel?.prizes ?? []) as WheelPrize[]) ?? []);
        setSpins(Number(spinData?.balance ?? 0));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, token]);

  const displayCampaign = campaign ?? getWheelFallbackCampaign();
  const renderContract = buildWheelRenderContract(prizes);
  const segments = renderContract.segments;

  async function handleSpin() {
    if (spinning) return;
    try {
      setError('');
      setResult(null);
      setSpinning(true);
      setSpinPhase('spinning');

      const spinStart = rotation + 1440 + Math.floor(Math.random() * 360);
      setRotation(spinStart);

      const data = await client.spinWheel();
      setResult(data);

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
      setError(err instanceof Error ? err.message : String(err));
      setSpinPhase('idle');
    } finally {
      setSpinning(false);
    }
  }

  return (
    <PageShell>
      <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.18,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 68%, transparent 100%)',
          }}
        />

        <Stack spacing={1.5} sx={{ position: 'relative' }}>
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.75, sm: 2 },
              borderRadius: { xs: 4, sm: 5 },
              border: '1px solid rgba(105, 147, 255, 0.14)',
              background:
                'radial-gradient(circle at 18% 20%, rgba(47,84,183,0.22), transparent 18%), radial-gradient(circle at 82% 18%, rgba(255,212,111,0.10), transparent 20%), linear-gradient(180deg, rgba(10,18,36,0.94) 0%, rgba(7,11,21,0.98) 100%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  <Chip size="small" label={loading ? 'Syncing' : 'Ready'} sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#edf3ff', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Chip size="small" label={`${segments.length} prizes`} sx={{ bgcolor: 'rgba(255,208,101,0.10)', color: '#f7e6b5', border: '1px solid rgba(255,208,101,0.16)' }} />
                </Stack>
                <Typography sx={{ color: '#f7f2e7', fontWeight: 900, letterSpacing: '-0.06em', fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 0.94 }}>
                  {displayCampaign.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.75,
                  py: 1.2,
                  minWidth: { xs: 92, sm: 120 },
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  textAlign: 'right',
                }}
              >
                <Typography sx={{ color: 'rgba(230,238,255,0.68)', fontSize: '0.72rem', letterSpacing: '0.18em', fontWeight: 800 }}>
                  SPINS
                </Typography>
                <Typography sx={{ color: '#f8f3e6', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.6rem', sm: '1.9rem' }, lineHeight: 1 }}>
                  {spins}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ bgcolor: 'rgba(91, 26, 35, 0.70)', color: '#fdeaea', border: '1px solid rgba(248,113,113,0.18)' }}>
              {error}
            </Alert>
          ) : null}

          {result ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(8, 67, 59, 0.66)', color: '#dcfce7', border: '1px solid rgba(74,222,128,0.18)' }}>
              {result.prize?.name ?? 'Không trúng'}
            </Alert>
          ) : null}

          <Box
            sx={{
              borderRadius: { xs: 4, sm: 5 },
              border: '1px solid rgba(103, 151, 255, 0.14)',
              background: 'linear-gradient(180deg, rgba(11,20,41,0.82), rgba(8,13,26,0.94))',
              overflow: 'hidden',
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <WheelDial
              segments={segments}
              spins={spins}
              spinning={spinning}
              spinPhase={spinPhase}
              rotation={rotation}
              resultName={getWheelDefaultOutcomeLabel(result?.prize?.name)}
              onSpin={handleSpin}
              disabled={loading}
              chipLabelLimit={0}
              labelRadius={renderContract.labelRadius}
              wheelLabelScale={renderContract.wheelLabelScale}
              labelInset={renderContract.labelInset}
            />
          </Box>
        </Stack>
      </Container>
    </PageShell>
  );
}
