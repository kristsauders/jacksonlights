import Image from 'next/image';
import HeroVideoBackground from './HeroVideoBackground';
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
//
// Kept deliberately short so the tabs are close to the top on a phone: title,
// one line, the two things people come for (listen along, pick a song) and a
// small row of radio/address details, where the address opens directions. The backdrop is always a night
// photo, so the header uses light-on-dark text in both themes.

interface GalleryImage { src: string; alt?: string; }

const heroImage: GalleryImage | undefined = (gallery as GalleryImage[])[0];

const BUTTON = 'focus-ring w-full max-w-xs sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition';
const META = 'inline-flex items-center gap-1.5';

function IconMusic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconMapPin({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
      <path d="M12 22s7-6.2 7-12A7 7 0 0 0 5 10c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconRadio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14} aria-hidden="true">
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M6 12h4M6 16h2M12 16h6M12 12h8" />
      <path d="m9 5 12-3" />
    </svg>
  );
}

function IconHeadphones({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
    </svg>
  );
}

export default function HeroHeader() {
  return (
    <header className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-neutral-950">
      <div className="absolute inset-0">
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
        <HeroVideoBackground />
        {/* Darken evenly, then a little more at the bottom where the buttons sit. */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-16 md:py-20 text-center">
        <h1 className="font-display font-extrabold tracking-tight leading-none text-[2.5rem] sm:text-6xl md:text-7xl text-white [text-shadow:0_0_28px_rgba(226,192,68,0.55),0_2px_8px_rgba(0,0,0,0.5)]">
          Jackson Lights
        </h1>
        <p className="mt-3 sm:mt-4 text-[15px] sm:text-lg text-white/85 text-balance">
          A free holiday light show synchronized to music in Beacon, NY
        </p>

        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3">
          {/* Listening along is the main thing, so it gets the gold button. */}
          <a href="https://player.pulsemesh.io/d/Q8AN" target="_blank" rel="noopener noreferrer" className={`${BUTTON} bg-brand-gold text-neutral-950 hover:bg-[#ecd06a] shadow-lg shadow-black/30`}>
            <IconHeadphones size={16} />
            Listen online
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a href="#songs" className={`${BUTTON} bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20 backdrop-blur-sm`}>
            <IconMusic />
            Pick the next song
          </a>
        </div>

        <ul className="mt-5 sm:mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] text-white/75">
          <li className={META}><IconRadio /> Tune to <strong className="font-semibold text-white">87.9 FM</strong></li>
          <li>
            <MapLink className={`${META} underline underline-offset-4 decoration-white/40 hover:decoration-white hover:text-white focus-ring rounded`}>
              <IconMapPin size={14} /> 4 Jackson Street · Directions
            </MapLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
