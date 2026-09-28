"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';

// Last show: Jan 1 2026 22:00 America/New_York (Eastern Time) - end of final show
// Season ends: Jan 2 2026 00:00 America/New_York (Eastern Time) - switch to thank you message
// We derive fixed UTC timestamps so all clients see the same countdown regardless of their local timezone.

function lastShowUtc(): number {
  // Jan 1 2026 22:00 ET (EST, UTC-5) = Jan 2 2026 03:00 UTC
  return new Date(Date.UTC(2026, 0, 2, 3, 0, 0, 0)).getTime();
}

function seasonEndUtc(): number {
  // Jan 2 2026 00:00 ET (EST, UTC-5) = Jan 2 2026 05:00 UTC
  return new Date(Date.UTC(2026, 0, 2, 5, 0, 0, 0)).getTime();
}

const LAST_SHOW_UTC_MS = lastShowUtc();
const SEASON_END_UTC_MS = seasonEndUtc();

interface TimeParts { days:number; hours:number; minutes:number; seconds:number; }

function diffParts(targetMs: number): TimeParts {
  const nowMs = Date.now();
  let d = targetMs - nowMs;
  if (d < 0) d = 0;
  const days = Math.floor(d / 86400000);
  d -= days * 86400000;
  const hours = Math.floor(d / 3600000);
  d -= hours * 3600000;
  const minutes = Math.floor(d / 60000);
  d -= minutes * 60000;
  const seconds = Math.floor(d / 1000);
  return { days, hours, minutes, seconds };
}

function isSeasonOver(): boolean {
  return Date.now() >= SEASON_END_UTC_MS;
}

interface Sparkle { size:number; left:number; top:number; duration:number; delay:number; }

export default function PreseasonBanner(){
  const [dismissed,setDismissed] = useState<boolean>(false);
  // Initialize with zeros to keep SSR/client identical; fill after mount.
  const [parts,setParts] = useState<TimeParts>({ days:0, hours:0, minutes:0, seconds:0 });
  const [mounted,setMounted] = useState(false);
  const [sparkles,setSparkles] = useState<Sparkle[] | null>(null);
  const [seasonOver, setSeasonOver] = useState(false);
  
  const countdownDone = useMemo(()=> mounted && parts.days===0 && parts.hours===0 && parts.minutes===0 && parts.seconds===0, [parts, mounted]);

  useEffect(()=>{
    if (dismissed) return;
    // First calculation after mount to avoid hydration mismatch.
    setParts(diffParts(LAST_SHOW_UTC_MS));
    setSeasonOver(isSeasonOver());
    setMounted(true);
    if (!sparkles) {
      // Generate sparkle data once (client only) for stable rendering.
      const arr: Sparkle[] = Array.from({ length: 14 }).map(()=>({
        size: +(Math.random()*6+4).toFixed(3),
        left: +(Math.random()*100).toFixed(4),
        top: +(Math.random()*100).toFixed(4),
        duration: +(4+Math.random()*6).toFixed(2),
        delay: +(Math.random()*6).toFixed(2)
      }));
      setSparkles(arr);
    }
    const id = setInterval(()=> {
      setParts(diffParts(LAST_SHOW_UTC_MS));
      setSeasonOver(isSeasonOver());
    }, 1000);
    return ()=> clearInterval(id);
  }, [dismissed, sparkles]);

  const dismiss = useCallback(()=>{
    setDismissed(true); // stays dismissed for life of current page session
  },[]);

  if (dismissed) return null;

  // Show the appropriate banner based on season status
  if (mounted && seasonOver) {
    return <SeasonEndBanner dismiss={dismiss} sparkles={sparkles} />;
  }

  return <FinalShowBanner dismiss={dismiss} sparkles={sparkles} parts={parts} mounted={mounted} countdownDone={countdownDone} />;
}

function FinalShowBanner({ dismiss, sparkles, parts, mounted, countdownDone }: { dismiss: () => void; sparkles: Sparkle[] | null; parts: TimeParts; mounted: boolean; countdownDone: boolean }) {
  const timeString = !mounted ? 'Calculating…' : countdownDone ? 'Final Show Tonight!' : `${parts.days}d ${parts.hours}h ${parts.minutes}m ${parts.seconds}s`;

  return (
    <div className="mt-2 sm:mt-4" data-preseason-banner>
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-maroon/25 dark:ring-brand-gold/35 bg-gradient-to-br from-brand-cream/80 via-white/70 to-brand-gold/50 dark:from-brand-pine/60 dark:via-neutral-900/60 dark:to-brand-maroon/40 px-5 sm:px-8 py-5 sm:py-7">
        {/* Sparkles (client-only) */}
        <Sparkles sparkles={sparkles} />
        <button onClick={dismiss} aria-label="Dismiss announcement" className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md p-1 transition focus:outline-none focus-visible:ring focus-visible:ring-brand-green/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 relative z-10">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-maroon dark:text-brand-gold/90">2025 Season Finale</p>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-snug">
              Last night of the show: <span className="whitespace-nowrap text-brand-maroon dark:text-brand-gold font-extrabold">New Year's Day!</span>
            </h2>
            <p className="text-[13px] sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-2xl">Don't miss your last chance to see our synchronized light show this season! Join us on January 1st from 5:00 PM to 8:00 PM for the grand finale featuring 42 thousand lights. Thank you for an amazing season!</p>
            <FinalShowCountdown done={countdownDone} parts={parts} mounted={mounted} />
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:gap-4">
            <a href="#requests" onClick={(e)=>{ e.preventDefault(); activateTabAndScroll('requests'); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-brand-green text-white text-xs font-semibold shadow hover:bg-brand-pine transition">Request a Song<span className="hidden sm:inline">→</span></a>
            <a href="#gallery" onClick={(e)=>{ e.preventDefault(); activateTabAndScroll('gallery'); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-neutral-900/90 dark:bg-neutral-800/80 text-white text-xs font-semibold shadow hover:bg-neutral-700 dark:hover:bg-neutral-700 transition">View Gallery</a>
          </div>
        </div>
        <div className="mt-4 text-[10px] tracking-wide text-neutral-500 dark:text-neutral-500 font-medium flex flex-wrap items-center gap-3">
          <span>Final Show: Jan 1 · 5:00–8:00 PM</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-maroon/15 text-brand-maroon dark:bg-brand-gold/15 dark:text-brand-gold text-[10px] font-semibold tabular-nums">{timeString}</span>
        </div>
      </div>
    </div>
  );
}

function SeasonEndBanner({ dismiss, sparkles }: { dismiss: () => void; sparkles: Sparkle[] | null }) {
  return (
    <div className="mt-2 sm:mt-4" data-preseason-banner>
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-brand-green/25 dark:ring-brand-green/35 bg-gradient-to-br from-brand-cream/80 via-white/70 to-brand-green/30 dark:from-brand-pine/60 dark:via-neutral-900/60 dark:to-brand-green/40 px-5 sm:px-8 py-5 sm:py-7">
        {/* Sparkles (client-only) */}
        <Sparkles sparkles={sparkles} />
        <button onClick={dismiss} aria-label="Dismiss announcement" className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-md p-1 transition focus:outline-none focus-visible:ring focus-visible:ring-brand-green/60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 relative z-10">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green dark:text-brand-gold/90">2025 Season Complete</p>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-snug">
              Thank you for an amazing season! 🎄✨
            </h2>
            <p className="text-[13px] sm:text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 max-w-2xl">The 2025 light show season has come to a close. Thank you to everyone who visited, requested songs, and made this year so special! Missed a show or want to relive the magic? Check out our video gallery below.</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-green/15 text-brand-green text-xs font-semibold">See you next season! 🎉</div>
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:gap-4">
            <a href="#gallery" onClick={(e)=>{ e.preventDefault(); activateTabAndScroll('gallery'); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-brand-green text-white text-xs font-semibold shadow hover:bg-brand-pine transition">Watch Show Videos<span className="hidden sm:inline">→</span></a>
            <a href="#updates" onClick={(e)=>{ e.preventDefault(); activateTabAndScroll('posts'); }} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 bg-neutral-900/90 dark:bg-neutral-800/80 text-white text-xs font-semibold shadow hover:bg-neutral-700 dark:hover:bg-neutral-700 transition">Behind The Scenes</a>
          </div>
        </div>
        <div className="mt-4 text-[10px] tracking-wide text-neutral-500 dark:text-neutral-500 font-medium flex flex-wrap items-center gap-3">
          <span>Season ran Nov 28 – Jan 1</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-green/15 text-brand-green text-[10px] font-semibold">Season Complete ✓</span>
        </div>
      </div>
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

function FinalShowCountdown({ parts, done, mounted }:{ parts:TimeParts; done:boolean; mounted:boolean }){
  if (!mounted) {
    return (
      <div className="mt-4 flex gap-1.5 opacity-80" aria-hidden="true">
        {['Days','Hours','Min','Sec'].map(l=> (
          <div key={l} className="w-14 sm:w-16 h-[62px] sm:h-[70px] animate-pulse rounded-md bg-white/50 dark:bg-neutral-800/40 ring-1 ring-neutral-200 dark:ring-neutral-700" />
        ))}
      </div>
    );
  }
  if (done) return <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-maroon/15 text-brand-maroon dark:bg-brand-gold/15 dark:text-brand-gold text-xs font-semibold" suppressHydrationWarning>Final show tonight! Don't miss it! 🎆</div>;
  const boxes: { label:string; value:number }[] = [
    { label:'Days', value: parts.days },
    { label:'Hours', value: parts.hours },
    { label:'Min', value: parts.minutes },
    { label:'Sec', value: parts.seconds }
  ];
  return (
    <div className="mt-4 flex gap-1.5" aria-label="Countdown to final show">
      {boxes.map(b=> (
        <div key={b.label} className="w-14 sm:w-16 text-center rounded-md bg-white/70 dark:bg-neutral-800/60 ring-1 ring-neutral-200 dark:ring-neutral-700 backdrop-blur px-1.5 py-1.5" suppressHydrationWarning>
          <div className="text-lg sm:text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100" suppressHydrationWarning>{b.value}</div>
          <div className="text-[9px] uppercase tracking-wide font-medium text-neutral-500 dark:text-neutral-400">{b.label}</div>
        </div>
      ))}
    </div>
  );
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
