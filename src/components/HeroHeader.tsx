"use client";
import { useEffect, useState } from 'react';

export default function HeroHeader(){
  const [bg,setBg] = useState<string | null>(null);
  const [ready,setReady] = useState(false);
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
        <div className="absolute inset-0 backdrop-blur-md" />
        <div className="absolute inset-0 bg-brand-green/25 dark:bg-brand-pine/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.10),transparent_70%)]" />
      </div>
  <div className="relative z-10 mx-auto max-w-5xl w-full text-center space-y-5 sm:space-y-7">
  <h1 className="font-extrabold tracking-tight leading-tight text-balance text-4xl xs:text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-r from-brand-red via-brand-gold to-brand-green text-transparent bg-clip-text drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">Jackson Lights</span>
        </h1>
  <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-xl lg:text-2xl font-medium text-brand-maroon/90 dark:text-brand-gold/80">
          A family holiday light experience synchronized to music in Beacon, NY. See what’s playing now
          and pick what should play next.
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center pt-1 sm:pt-2 text-xs sm:text-sm md:text-base">
          <div className="flex-1 md:max-w-xs px-4 py-4 sm:px-5 sm:py-5 rounded-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm">
            <h2 className="font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase">Visit</h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">4 Jackson Street<br />Beacon, NY</p>
          </div>
          <div className="flex-1 md:max-w-xs px-4 py-4 sm:px-5 sm:py-5 rounded-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur border border-brand-maroon/30 dark:border-brand-pine/40 shadow-sm">
            <h2 className="font-semibold text-brand-maroon dark:text-brand-gold text-[11px] tracking-wider uppercase">Listen</h2>
            <p className="mt-1 text-neutral-700 dark:text-neutral-300 leading-relaxed">Tune car radio to <strong>FM 87.9</strong><br />or use the stream below.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
