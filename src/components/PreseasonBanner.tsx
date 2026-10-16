"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import MapLink from './MapLink';

interface Sparkle { size:number; left:number; top:number; duration:number; delay:number; }

// The banner follows the season by date (Beacon time), so nothing needs editing
// after the party. Each value is the first day (YYYY-MM-DD, America/New_York) its
// phase applies.
type Phase = 'preview' | 'upcoming' | 'live' | 'over';
const PHASE_STARTS: [string, Phase][] = [
  ['2027-01-02', 'over'],     // day after New Year's Day: banner goes away
  ['2026-11-27', 'live'],     // day after Thanksgiving: lights are on
  ['2026-11-15', 'upcoming'], // day after Preview Night
];

function currentPhase(): Phase {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  return PHASE_STARTS.find(([start]) => today >= start)?.[1] ?? 'preview';
}

const subscribe = () => () => {};
// The page is prerendered at build time, so the server can't know today's date.
// It renders the preview copy and the browser swaps in the right phase on hydration.
const usePhase = () => useSyncExternalStore(subscribe, currentPhase, () => 'preview' as Phase);

export default function PreseasonBanner(){
  const [dismissed,setDismissed] = useState<boolean>(false);
  const [sparkles,setSparkles] = useState<Sparkle[] | null>(null);
  const phase = usePhase();

  useEffect(()=>{
    if (dismissed || sparkles) return;
    // Generate sparkle data once (client only) for stable rendering and no hydration mismatch.
    const arr: Sparkle[] = Array.from({ length: 14 }).map(()=>({
      size: +(Math.random()*6+4).toFixed(3),
      left: +(Math.random()*100).toFixed(4),
      top: +(Math.random()*100).toFixed(4),
      duration: +(4+Math.random()*6).toFixed(2),
      delay: +(Math.random()*6).toFixed(2)
    }));
    setSparkles(arr);
  }, [dismissed, sparkles]);

  const dismiss = useCallback(()=>{
    setDismissed(true); // stays dismissed for life of current page session
  },[]);

  if (dismissed || phase === 'over') return null;

  return <SeasonStartBanner phase={phase} dismiss={dismiss} sparkles={sparkles} />;
}

function SeasonStartBanner({ phase, dismiss, sparkles }: { phase: Exclude<Phase, 'over'>; dismiss: () => void; sparkles: Sparkle[] | null }) {
  return (
    <div className="mt-2 sm:mt-4" data-preseason-banner>
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-green/25 dark:ring-brand-green/35 bg-gradient-to-br from-brand-cream/80 via-white/70 to-brand-green/30 dark:from-brand-pine/60 dark:via-neutral-900/60 dark:to-brand-green/40 px-5 sm:px-8 py-5 sm:py-7">
        {/* Sparkles (client-only) */}
        <Sparkles sparkles={sparkles} />
        <button onClick={dismiss} aria-label="Dismiss announcement" className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md p-1 transition focus:outline-none focus-visible:ring focus-visible:ring-brand-green/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 relative z-10">
          {phase === 'preview' ? <PreviewCopy /> : <SeasonCopy phase={phase} />}
          <div className="flex flex-row md:flex-col gap-3 md:gap-4">
            <MapLink className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-brand-green text-white text-xs font-semibold shadow hover:bg-brand-pine transition">Get Directions<span className="hidden sm:inline">→</span></MapLink>
            <a href="#gallery" onClick={(e)=>{ e.preventDefault(); activateTabAndScroll('gallery'); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-neutral-900/90 dark:bg-neutral-800/80 text-white text-xs font-semibold shadow hover:bg-neutral-700 dark:hover:bg-neutral-700 transition">Watch Show Videos</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const EYEBROW = "pr-7 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green dark:text-brand-gold/90";
const HEADING = "font-display text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-snug";
const BODY = "text-[13px] sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-2xl";

function PreviewCopy() {
  return (
    <div className="flex-1 space-y-3">
      <p className={EYEBROW}>
        Preview Night · <time dateTime="2026-11-14"><span className="sm:hidden">Sat, Nov 14</span><span className="hidden sm:inline">Saturday, November 14</span></time>
      </p>
      <h2 className={HEADING}>Join us for Preview Night! 🎄✨</h2>
      <p className={BODY}>
        Come kick off the 2026 season with us. Everyone is welcome, so bring your family, friends, and neighbors!
      </p>
      <ul className="text-[13px] sm:text-sm space-y-1.5 text-neutral-800 dark:text-neutral-200">
        <li><span aria-hidden="true">🎉</span> <strong>6:00 PM</strong> · Party starts</li>
        <li><span aria-hidden="true">✨</span> <strong>7:00 PM</strong> · Light show begins</li>
        <li><span aria-hidden="true">🔥</span> Hot cider &amp; cocoa, festive snacks, and a bonfire</li>
      </ul>
      <p className="text-[12px] sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl">
        Then the lights are on <strong>every night, 5–10 PM</strong>, starting the day after Thanksgiving (Friday, November 27) through New Year&apos;s Day (Friday, January 1).
      </p>
    </div>
  );
}

function SeasonCopy({ phase }: { phase: 'upcoming' | 'live' }) {
  const live = phase === 'live';
  return (
    <div className="flex-1 space-y-3">
      <p className={EYEBROW}>
        {live ? '2026 Season' : <>Opening night · <time dateTime="2026-11-27"><span className="sm:hidden">Fri, Nov 27</span><span className="hidden sm:inline">Friday, November 27</span></time></>}
      </p>
      <h2 className={HEADING}>{live ? 'The lights are on! 🎄✨' : 'Thanks for celebrating with us! 🎄✨'}</h2>
      <p className={BODY}>
        {live
          ? <>Stop by any night from <strong>5 to 10 PM</strong> through New Year&apos;s Day (Friday, January 1). Bring your family, friends, and neighbors!</>
          : <>The lights are on <strong>every night, 5–10 PM</strong>, starting Friday, November 27 (the day after Thanksgiving) through New Year&apos;s Day (Friday, January 1). Bring your family, friends, and neighbors!</>}
      </p>
      <p className="text-[12px] sm:text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl">Weather permitting. Free for everyone.</p>
    </div>
  );
}

function activateTabAndScroll(id:string){
  const btn = document.querySelector(`[data-tab="${id}"]`) as HTMLElement | null;
  if (!btn) return;
  btn.click();
  // Scroll the tab list (or button) into view with slight offset
  const tablist = btn.closest('[role="tablist"]') as HTMLElement | null;
  const target = tablist || btn;
  const rect = target.getBoundingClientRect();
  const y = rect.top + window.scrollY - 12; // small offset
  window.scrollTo({ top: y, behavior: 'smooth' });
}

function Sparkles({ sparkles }:{ sparkles: Sparkle[] | null }){
  if (!sparkles) return null; // SSR & pre-mount: render nothing (no mismatch)
  return (
    <>
      {sparkles.map((s,i)=> (
        <span key={i} className="pointer-events-none absolute rounded-full bg-gradient-to-br from-white/90 to-brand-gold/50 dark:from-brand-gold/80 dark:to-white/30 shadow" style={{ width:s.size, height:s.size, left:s.left+'%', top:s.top+'%', animation: `sparkle ${s.duration}s linear infinite`, animationDelay: s.delay+'s', opacity:0 }} />
      ))}
      <style jsx global>{`
        @keyframes sparkle { 0%,100% { transform: scale(.4) translateY(0); opacity:0 } 10% { opacity:.9 } 50% { opacity:.2 } 70% { opacity:.75 } }
        @media (prefers-reduced-motion: reduce) { [data-preseason-banner] span[style*='sparkle'] { animation: none !important; opacity: .4 !important; } }
      `}</style>
    </>
  );
}
