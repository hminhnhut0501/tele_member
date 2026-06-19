import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Tele Member',
  description: 'Telegram loyalty platform MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
