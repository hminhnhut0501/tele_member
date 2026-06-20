import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Tele Member',
  description: 'Telegram loyalty platform MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
