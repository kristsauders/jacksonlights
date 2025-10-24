"use client";
import { useEffect, useState } from 'react';
// Inline lightweight icons (avoid external dep)
function IconRadio(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className} width={props.width||14} height={props.height||14} aria-hidden="true">
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M6 12h4M6 16h2M12 16h6M12 12h8" />
      <path d="m9 5 12-3" />
    </svg>
  );
}
function IconPlayCircle(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className} width={props.width||15} height={props.height||15} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8l6 4-6 4z" />
    </svg>
  );
}
function IconMapPin(props: React.SVGProps<SVGSVGElement>){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className} width={props.width||14} height={props.height||14} aria-hidden="true">
      <path d="M12 22s7-6.2 7-12A7 7 0 0 0 5 10c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function HeroHeader(){
  const [bg,setBg] = useState<string | null>(null);
  const [ready,setReady] = useState(false);
  const [mapHref, setMapHref] = useState('https://maps.google.com/?daddr=4+Jackson+Street+Beacon+NY');
  useEffect(()=>{
    fetch('/gallery.json')
      .then(r=> r.ok ? r.json(): [])
      .then((imgs:any[])=>{
        if(Array.isArray(imgs) && imgs.length){
          const pick = imgs[Math.floor(Math.random()*imgs.length)];
          setBg(pick.src);
        }
      })
      .catch(()=>{});
  },[]);
  useEffect(()=>{
    const addr = '4 Jackson Street Beacon NY';
    const enc = encodeURIComponent(addr);
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOS = /iP(hone|ad|od)/i.test(ua);
      const isAndroid = /Android/i.test(ua);
      if (isIOS) {
        // Apple Maps deep link
        setMapHref(`maps://?daddr=${enc}`);
      } else if (isAndroid) {
        // Geo intent opens user-chosen maps app
        setMapHref(`geo:0,0?q=${enc}`);
      } else {
        setMapHref(`https://maps.google.com/?daddr=${enc}`);
      }
    }
  },[]);

  return (
  <header className="relative overflow-hidden rounded-3xl ring-1 ring-brand-maroon/15 dark:ring-brand-pine/25 min-h-[260px] flex items-center px-3 sm:px-8 pt-6 pb-4 sm:pt-8 sm:pb-6 md:pt-12 md:pb-8">
      <div className="absolute inset-0">
        {/* Base fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-maroon/70 via-brand-cream/50 to-brand-green/60 dark:from-brand-pine/70 dark:via-neutral-900/60 dark:to-brand-green/45" />
        {bg && (
          <img
            src={bg}
            alt="" aria-hidden="true"
            onLoad={()=>setReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ready? 'opacity-100':'opacity-0'} scale-105`}
          />
        )}
        {/* Blur / tint overlays */}
        <div className="absolute inset-0 backdrop-blur-sm" />
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
          <div className="group px-5 py-4 sm:px-6 sm:py-5 rounded-xl bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm flex flex-col">
            <h2 className="flex items-center gap-1.5 font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase">
              <IconRadio className="transition-transform group-hover:scale-110" />
              <span>FM Radio</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed"><strong className="font-semibold text-neutral-900 dark:text-neutral-100">87.9 FM</strong><br /><span className="text-[11px] text-neutral-600 dark:text-neutral-400">Listen from your car</span></p>
          </div>
          {/* Online Stream */}
          <a href="https://player.pulsemesh.io" target="_blank" rel="noopener noreferrer" className="group px-5 py-4 sm:px-6 sm:py-5 rounded-xl bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/60">
            <h2 className="flex items-center gap-1.5 font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase">
              <IconPlayCircle className="transition-transform group-hover:scale-110" />
              <span>Listen Online</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">Open player tab<br /><span className="text-[11px] text-neutral-600 dark:text-neutral-400">Opens in new tab</span></p>
          </a>
          {/* Visit */}
          <a
            href={mapHref}
            {...(mapHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group px-5 py-4 sm:px-6 sm:py-5 rounded-xl bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/60"
            aria-label="Open directions to 4 Jackson Street, Beacon NY in maps"
          >
            <h2 className="flex items-center gap-1.5 font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase">
              <IconMapPin className="transition-transform group-hover:scale-110" />
              <span>Visit</span>
            </h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">4 Jackson Street<br />Beacon, NY</p>
          </a>
        </div>
      </div>
    </header>
  );
}
