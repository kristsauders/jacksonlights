import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { registerSW } from '../src/app/register-sw';

export const metadata: Metadata = {
  title: 'Jackson Lights',
  description: 'Jackson Lights holiday show - live status, playlists, and requests',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
  {/* PWA / iOS install meta */}
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#119B68" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Jackson Lights" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <meta name="application-name" content="Jackson Lights" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="msapplication-TileColor" content="#119B68" />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans antialiased transition-colors">
        <Providers>
          {children}
        </Providers>
        <script dangerouslySetInnerHTML={{__html:`(${registerSW.toString()})();`}} />
      </body>
    </html>
  );
}
