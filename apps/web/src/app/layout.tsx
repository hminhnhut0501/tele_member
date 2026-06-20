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
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js?62" strategy="beforeInteractive" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
