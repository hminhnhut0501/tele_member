import { Card, CardContent, Container, Stack, Typography } from '@mui/material';

export default function CheckinPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>
          /checkin
        </Typography>
        <Card>
          <CardContent>
            <Typography>Trạng thái hôm nay: chưa điểm danh</Typography>
            <Typography>Streak: 1</Typography>
            <Typography>Lịch sử: sắp có</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
