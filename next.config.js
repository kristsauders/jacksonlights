/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// WEBSITE_SITE_NAME is auto-injected by Azure App Service and only present
// there — unlike NODE_ENV==='production', which is also true for a plain
// `npm run start` on a laptop. Two headers below only make sense once we're
// actually reachable over https, which on a laptop (even in production mode)
// we never are. See src/lib/adminAuth.ts's `secure` cookie flag for the same
// distinction applied to the admin session cookie.
const isDeployed = Boolean(process.env.WEBSITE_SITE_NAME);

// Content Security Policy.
//
// script-src still needs 'unsafe-inline': next-themes injects an inline script
// to set the theme class before paint, styled-jsx emits inline <style>, and the
// JSON-LD block in app/layout.tsx is inline. Even so, this policy blocks the
// things that actually matter here — loading script from another origin,
// framing the site, rewriting <base>, and posting forms off-site.
// Tightening to a nonce-based policy means routing every request through
// middleware; see README for that upgrade path.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  // ws: in dev only, for the Next.js hot-reload socket.
  `connect-src 'self'${isDev ? ' ws: http://localhost:*' : ''}`,
  // YouTube embeds in VideoGallery.
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Rewrites every http:// subresource request on the page to https:// —
  // including same-origin relative fetches like /api/status or /_next/static
  // assets. Correct once actually deployed behind Front Door's TLS; on a
  // local `npm run start` (plain http, no TLS listener) it silently rewrites
  // every single asset request to https and every one of them fails, which
  // is exactly what breaks a local production-mode test. Browsers apply this
  // regardless of what scheme the current page itself loaded over, so it
  // can't be conditioned on NODE_ENV — only on whether we're really deployed.
  ...(isDeployed ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDeployed
    ? [
        // Browsers ignore this header when it arrives over plain http, so it
        // wouldn't have caused the localhost breakage above — gated anyway
        // since the spec (RFC 6797) says a server MUST NOT send it over http.
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  reactStrictMode: true,
  // Diagnostic: Next's built-in gzip middleware appears to hang on
  // Accept-Encoding: gzip requests to /_next/static/* in production on this
  // App Service — reproduced independent of Front Door (compression, WAF,
  // health probe) and independent of the App Insights Node agent. Disabling
  // here to confirm, since Front Door can compress at the edge instead.
  compress: false,
  images: {
    // Serve modern formats to browsers that accept them.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' }
    ]
  },
  experimental: {
    // Tree-shake these to the icons/components actually imported.
    optimizePackageImports: ['framer-motion', 'recharts']
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // HTML pages. Next marks prerendered pages s-maxage=31536000 (one year),
        // and Front Door honours that per edge location, so after a deploy some
        // visitors kept getting last season's page until someone purged the
        // cache. Keep the edge copy short; the page still revalidates quietly
        // in the background. Hashed /_next/static assets, photos, icons and the
        // API keep their own caching rules below and in the route handlers.
        source: '/((?!_next/|api/|photos/|icons/|models/|audio/|gallery\\.json|sw\\.js).*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' }],
      },
      {
        // Photos and icons are content that only changes when redeployed, so
        // let Front Door and the browser hold on to them.
        source: '/photos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800, immutable' }],
      },
      {
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' }],
      },
      {
        source: '/gallery.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' }],
      },
      {
        // The service worker must never be cached, or a bad one is permanent.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
