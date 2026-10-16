import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ReactNode } from 'react';
import { Providers } from './providers';
import Snowfall from '../src/components/Snowfall';
import { registerSW } from '../src/app/register-sw';

// Self-hosted from app/fonts (Latin subset, variable weight). These used to be
// next/font/google, which downloads the fonts from Google during every build;
// that request intermittently hung or failed on the Azure build server and took
// whole deploys down with it. Local files make the build independent of Google
// and add nothing to the CSP. Inter is body/UI text (Anthropic's own documented
// substitute for their licensed Styrene B, which isn't available for us to
// use); Geist is the display face for headlines.
const sans = localFont({
  src: './fonts/Inter-latin-variable.woff2',
  weight: '100 900',
  variable: '--font-sans',
  display: 'swap',
});
const display = localFont({
  src: './fonts/Geist-latin-variable.woff2',
  weight: '100 900',
  variable: '--font-display',
  display: 'swap',
});

// Single source of truth for the brand color shown in mobile browser chrome /
// PWA task switcher. Previously this, the manifest, and Tailwind's brand.green
// disagreed with each other (three different greens) — now all tied together.
const THEME_COLOR = '#0F3B2E';

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
        url: '/icons/icon-512.png',
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
    images: ['/icons/icon-512.png']
  },
  icons: [
    // Modern browsers use the crisp vector; favicon.ico stays as the
    // fallback for the few contexts that still only look for it.
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192.png' },
  ],
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
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <meta name="theme-color" content={THEME_COLOR} />
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
                  logo: 'https://jacksonlights.com/icons/icon-512.png',
                  sameAs: [
                    'https://www.jacksonstreetlights.com/', // add actual socials if available
                  ]
                },
                {
                  '@type': 'Event',
                  name: 'Jackson Lights Holiday Show',
                  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  startDate: '2026-11-27',
                  endDate: '2027-01-01',
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
                },
                {
                  '@type': 'Event',
                  name: 'Jackson Lights Preview Night',
                  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                  eventStatus: 'https://schema.org/EventScheduled',
                  startDate: '2026-11-14T18:00:00-05:00',
                  isAccessibleForFree: true,
                  location: {
                    '@type': 'Place',
                    name: 'Jackson Lights',
                    address: {
                      '@type': 'PostalAddress',
                      streetAddress: '4 Jackson Street',
                      addressLocality: 'Beacon',
                      addressRegion: 'NY',
                      addressCountry: 'US'
                    }
                  },
                  organizer: { '@type': 'Organization', name: 'Jackson Lights', url: 'https://jacksonlights.com' },
                  url: 'https://jacksonlights.com',
                  description: 'Open to everyone. Party at 6 PM with hot cider, cocoa, festive snacks, and a bonfire, followed by the light show at 7 PM. Nightly shows start the day after Thanksgiving.'
                }
              ]
            })
          }}
        />
      </head>
      <body>
        <Snowfall />
        <Providers>
          {children}
        </Providers>
        <script dangerouslySetInnerHTML={{ __html: `(${registerSW.toString()})()` }} />
      </body>
    </html>
  );
}
