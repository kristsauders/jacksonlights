# Jackson Lights

Modern, accessible, responsive site for the Jackson Lights holiday show. Fetches live show data from the Remote Falcon external API (show status, playlist, request + vote actions), displays a photo gallery, embedded videos, and a lightweight audio stream panel.

## Features
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS with festive accent palette (muted, not overwhelming)
- Light / Dark mode via system preference (toggle provided)
- Remote Falcon integration (JWT generated server-side on-demand)
- Show status panel (now playing / next / hours / stream)
- Playlist with filter, visibility toggle, queue + vote actions
- Photo carousel (drop images into `public/photos` and rebuild)
- Video gallery (YouTube nocookie embeds)
- Accessible components (aria labels, roles, focus states)
- Responsive layout (mobile-first, fluid grid, reduced motion friendly)
- Gallery generator script (`npm run build` will include gallery if you add a prebuild hook below)

## Getting Started

1. Copy `.env` variables (Remote Falcon credentials):
```
REMOTE_FALCON_ACCESS_CODE=yourAccess
REMOTE_FALCON_SECRET_KEY=yourSecret
```
2. Install dependencies:
```
npm install
```
3. (Optional) Add photos to `public/photos`.
4. Generate gallery JSON (auto step suggestion):
```
node scripts/generate-gallery.mjs
```
5. Run dev server:
```
npm run dev
```
6. Open http://localhost:3000

## Adding Photos
Place `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif` images into `public/photos`. Run the gallery script (or add to `predev` / `prebuild`) and refresh. Carousel auto-populates from `gallery.json`.

## Request / Vote Logic
The serverless API routes (`/api/request`, `/api/vote`) proxy to Remote Falcon with a freshly minted JWT (5 min TTL cached). Client never sees secrets.

## Audio Stream
Replace `/public/audio/stream-placeholder.mp3` or point the `<audio>` src in `ShowStatus` to your actual stream (Icecast/Shoutcast/etc). If using an HLS stream, consider `hls.js` for broader support.

## Security & Hosting Notes

### Required environment variables
See `.env.example`. `ADMIN_PASSWORD` **must** be set in Azure App Service
Application Settings — the admin API fails closed without it. Prefer also
setting a separate `ADMIN_JWT_SECRET`.

### Locking the origin to Front Door
Rate limiting and abuse controls key off the client IP taken from the
`X-Azure-ClientIP` / `X-Forwarded-For` headers. Those headers are only
trustworthy if the App Service can't be reached directly — otherwise anyone
can hit `<app>.azurewebsites.net` and set them to whatever they like.

In the App Service: **Networking → Access restrictions**, add a rule allowing
service tag `AzureFrontDoor.Backend`, matching the header
`X-Azure-FDID` against your Front Door profile's ID, and deny everything else.

### Content Security Policy
Set in `next.config.js`. `script-src` still allows `'unsafe-inline'` because
next-themes, styled-jsx and the JSON-LD block all emit inline content. Moving
to a nonce-based policy requires a `middleware.ts` that generates a per-request
nonce and passes it to `ThemeProvider`; worth doing if the site ever accepts
richer user-generated content.

### Data files
`data/*.json` is created on demand and written atomically (temp file + rename),
with per-file serialisation so concurrent submissions can't clobber each other.
These live on the App Service filesystem — take a copy before any operation
that resets it.

## Potential Enhancements
- Persist user votes / feedback locally
- Add map with location (Leaflet) respecting privacy
- Progressive image loading / blur placeholders
- Add analytics events for button interactions
- Rate limit request/vote actions client-side

## Scripts
Add these to `package.json` if desired:
```json
"scripts": {
  "predev": "node scripts/generate-gallery.mjs",
  "prebuild": "node scripts/generate-gallery.mjs"
}
```

## License
MIT (site code) – Remote Falcon API subject to their terms.
