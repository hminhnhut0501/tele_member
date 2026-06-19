import { Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h3" fontWeight={800}>
          Tele Member
        </Typography>
        <Typography color="text.secondary">
          Dashboard mini app P1: điểm hiện tại, điểm danh, và thống kê cơ bản.
        </Typography>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Điểm hiện tại</Typography>
              <Typography variant="h2" fontWeight={800}>
                120
              </Typography>
              <Button variant="contained">Điểm danh hôm nay</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
