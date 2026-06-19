import { Card, CardContent, Container, Stack, Typography } from '@mui/material';

export default function WalletPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>
          /wallet
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="h3" fontWeight={800}>
              120
            </Typography>
            <Typography color="text.secondary">Số điểm hiện tại</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
