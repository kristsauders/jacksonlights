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
        <Providers>
          {children}
        </Providers>
        <script dangerouslySetInnerHTML={{ __html: `(${registerSW.toString()})()` }} />
      </body>
    </html>
  );
}
