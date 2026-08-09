import Image from 'next/image';
import MapLink from './MapLink';
import gallery from '../../public/gallery.json';

// This is now a server component. It previously ran on the client, fetched
// /gallery.json after hydration, picked a random photo, then faded in a raw
// <img> of a full-resolution phone photo. That put the largest element on the
// page behind a JS download + a network round trip, and shipped a 2MB+ image.
//
// The photo is now chosen at build time, rendered into the server HTML, run
// through next/image (resized + AVIF/WebP), and marked priority so the browser
// preloads it as soon as it reads the document.

interface GalleryImage { src: string; alt?: string; }

const heroImage: GalleryImage | undefined = (gallery as GalleryImage[])[0];

const CARD_CLASS =
  'group px-5 py-4 sm:px-6 sm:py-5 rounded-xl bg-white/85 dark:bg-neutral-900/70 border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm flex flex-col';
const LINK_CARD_CLASS = `${CARD_CLASS} focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/60`;
const CARD_HEADING_CLASS =
  'flex items-center gap-1.5 font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase';

function IconRadio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true" className="transition-transform group-hover:scale-110">
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M6 12h4M6 16h2M12 16h6M12 12h8" />
      <path d="m9 5 12-3" />
    </svg>
  );
}

function IconPlayCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={15} height={15} aria-hidden="true" className="transition-transform group-hover:scale-110">
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8l6 4-6 4z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true" className="transition-transform group-hover:scale-110">
      <path d="M12 22s7-6.2 7-12A7 7 0 0 0 5 10c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function HeroHeader() {
  return (
    <header className="relative overflow-hidden rounded-3xl ring-1 ring-brand-maroon/15 dark:ring-brand-pine/25 min-h-[260px] flex items-center px-3 sm:px-8 pt-6 pb-4 sm:pt-8 sm:pb-6 md:pt-12 md:pb-8">
      <div className="absolute inset-0">
        {/* Base fallback gradient, visible until the photo decodes */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-maroon/70 via-brand-cream/50 to-brand-green/60 dark:from-brand-pine/70 dark:via-neutral-900/60 dark:to-brand-green/45" />
        {heroImage && (
          <Image
            src={heroImage.src}
            alt=""
            aria-hidden="true"
            fill
            priority
            quality={70}
            sizes="100vw"
            className="object-cover scale-105"
          />
        )}
        {/* Tint overlays. The heavy full-bleed backdrop-blur that used to sit
            here was dropped: blurring a viewport-sized layer is one of the most
            expensive things a mobile GPU can be asked to do on every scroll. */}
        <div className="absolute inset-0 bg-brand-green/25 dark:bg-brand-pine/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.10),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl w-full text-center space-y-5 sm:space-y-7">
        <h1 className="font-extrabold tracking-tight leading-tight text-balance text-4xl xs:text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-r from-brand-red via-brand-gold to-brand-green text-transparent bg-clip-text drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">Jackson Lights</span>
        </h1>
        <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-xl lg:text-2xl font-medium text-brand-maroon/90 dark:text-brand-gold/80">
          A family holiday light experience synchronized to music in Beacon, NY. See what’s playing now and pick what should play next.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 pt-1 sm:pt-2 text-xs sm:text-sm md:text-base">
          {/* FM Radio */}
          <div className={CARD_CLASS}>
            <h2 className={CARD_HEADING_CLASS}>
              <IconRadio />
              <span>FM Radio</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <strong className="font-semibold text-neutral-900 dark:text-neutral-100">87.9 FM</strong>
              <br />
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Listen from your car</span>
            </p>
          </div>

          {/* Online Stream */}
          <a href="https://player.pulsemesh.io/d/Q8AN" target="_blank" rel="noopener noreferrer" className={LINK_CARD_CLASS}>
            <h2 className={CARD_HEADING_CLASS}>
              <IconPlayCircle />
              <span>Listen Online</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Open player tab
              <br />
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Opens in new tab</span>
            </p>
          </a>

          {/* Visit */}
          <MapLink className={LINK_CARD_CLASS}>
            <h2 className={CARD_HEADING_CLASS}>
              <IconMapPin />
              <span>Visit</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              4 Jackson Street
              <br />
              Beacon, NY
            </p>
          </MapLink>
        </div>
      </div>
    </header>
  );
}
