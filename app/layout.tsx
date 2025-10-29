import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { registerSW } from '../src/app/register-sw';

export const metadata: Metadata = {
  metadataBase: new URL('https://jacksonlights.com'),
  title: {
    default: 'Jackson Lights • Beacon NY Holiday Light Show',
    template: '%s • Jackson Lights'
  },
  description: 'Jackson Lights is a synchronized holiday light show in Beacon, NY. Music, animated lights, song requests, live status, behind-the-scenes, and community fun.',
  keywords: [
    'Jackson Lights',
    'Jackson Street Lights',
    'Beacon NY Christmas Lights',
    'holiday light show',
    'synchronized lights',
    'Beacon holiday display',
    'Hudson Valley Christmas lights',
    'music light show',
    'animated Christmas lights',
    'Hudson Valley holiday events',
    'Beacon NY XLights'
  ],
  authors: [{ name: 'Jackson Lights' }],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Jackson Lights • Beacon NY Holiday Light Show',
    description: 'A family-run synchronized Christmas light show in Beacon, NY—request songs, see live status, and explore behind-the-scenes photos & videos.',
    url: 'https://jacksonlights.com',
    siteName: 'Jackson Lights',
    images: [
      {
        url: '/favicon-512.png',
        width: 512,
        height: 512,
        alt: 'Jackson Lights display'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jacksonlights', // remove or change if no handle
    creator: '@jacksonlights',
    title: 'Jackson Lights • Beacon NY Holiday Light Show',
    description: 'Synchronized holiday light show in Beacon, NY. Pick the next song & enjoy the lights.',
    images: ['/favicon-512.png']
  },
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  manifest: '/site.webmanifest',
  category: 'entertainment',
  other: {
    'geo.region': 'US-NY',
    'geo.placename': 'Beacon',
    'geo.position': '41.5040;-73.9696',
    'ICBM': '41.5040, -73.9696'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#166534" />
        <link rel="canonical" href="https://jacksonlights.com/" />
        {/* Structured Data: Organization + Event (adjust dates as needed) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Jackson Lights',
                  url: 'https://jacksonlights.com',
                  logo: 'https://jacksonlights.com/favicon-512.png',
                  sameAs: [
                    'https://www.jacksonstreetlights.com/', // add actual socials if available
                  ]
                },
                {
                  '@type': 'Event',
                  name: 'Jackson Lights Holiday Show',
                  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  startDate: '2025-11-28',
                  endDate: '2026-01-02',
                  location: {
                    '@type': 'Place',
                    name: 'Beacon, NY',
                    address: {
                      '@type': 'PostalAddress',
                      addressLocality: 'Beacon',
                      addressRegion: 'NY',
                      addressCountry: 'US'
                    }
                  },
                  url: 'https://jacksonlights.com',
                  description: 'A synchronized holiday light and music show with community song requests in Beacon, NY.'
                }
              ]
            })
          }}
        />
      </head>
      <body>
        {/* Loading screen - shown instantly, hidden after React hydrates */}
        <div id="loading-screen" className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-green-700 dark:border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 animate-pulse">
              Loading Jackson Lights...
            </p>
          </div>
        </div>
        <Providers>
          {children}
        </Providers>
        <script dangerouslySetInnerHTML={{ __html: `(${registerSW.toString()})()` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          // Hide loading screen once page is interactive
          window.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              var loader = document.getElementById('loading-screen');
              if (loader) {
                loader.style.opacity = '0';
                setTimeout(function() { loader.style.display = 'none'; }, 500);
              }
            }, 100);
          });
        ` }} />
      </body>
    </html>
  );
}
