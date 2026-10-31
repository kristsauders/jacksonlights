"use client";
import { useCallback, useState, useSyncExternalStore } from 'react';

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
  const phase = usePhase();

  const dismiss = useCallback(()=>{
    setDismissed(true); // stays dismissed for life of current page session
  },[]);

  if (dismissed || phase === 'over') return null;

  return <SeasonStartBanner phase={phase} dismiss={dismiss} />;
}

// A standard card with a soft green wash, so it reads as the one highlighted
// announcement without competing with the header photo.
function SeasonStartBanner({ phase, dismiss }: { phase: Exclude<Phase, 'over'>; dismiss: () => void }) {
  return (
    <div>
      <div className="surface relative overflow-hidden !border-brand-green/40 bg-gradient-to-br from-brand-green/15 to-transparent px-5 sm:px-8 py-5 sm:py-6">
        <button onClick={dismiss} aria-label="Dismiss announcement" className="focus-ring absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 rounded-full p-1 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        {/* Hours and directions live in the status card and header, so the
            banner only carries the event itself. */}
        <div className="relative z-10">
          {phase === 'preview' ? <PreviewCopy /> : <SeasonCopy phase={phase} />}
        </div>
      </div>
    </div>
  );
}

const EYEBROW = "eyebrow pr-7";
const HEADING = "section-title";
const BODY = "body-text max-w-2xl";

function PreviewCopy() {
  return (
    <div className="space-y-2.5">
      <p className={EYEBROW}>
        Preview Night · <time dateTime="2026-11-14"><span className="sm:hidden">Sat, Nov 14</span><span className="hidden sm:inline">Saturday, November 14</span></time>
      </p>
      <h2 className={HEADING}>Join us for Preview Night! 🎄✨</h2>
      <p className={BODY}>
        Come kick off the 2026 season with us. Everyone is welcome, so bring your family, friends, and neighbors!
      </p>
      <ul className="body-text flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1.5 !text-neutral-800 dark:!text-neutral-200">
        <li><span aria-hidden="true">🎉</span> <strong>6:00 PM</strong> · Party starts</li>
        <li><span aria-hidden="true">✨</span> <strong>7:00 PM</strong> · Light show begins</li>
        <li><span aria-hidden="true">🔥</span> Hot cider &amp; cocoa, snacks, and a bonfire</li>
      </ul>
    </div>
  );
}

function SeasonCopy({ phase }: { phase: 'upcoming' | 'live' }) {
  const live = phase === 'live';
  return (
    <div className="space-y-2.5">
      <p className={EYEBROW}>
        {live ? '2026 Season' : <>Opening night · <time dateTime="2026-11-27"><span className="sm:hidden">Fri, Nov 27</span><span className="hidden sm:inline">Friday, November 27</span></time></>}
      </p>
      <h2 className={HEADING}>{live ? 'The lights are on! 🎄✨' : 'Thanks for celebrating with us! 🎄✨'}</h2>
      <p className={BODY}>
        {live
          ? <>Stop by any night through New Year&apos;s Day. Tune to 87.9 FM and pick the next song below. Free for everyone!</>
          : <>The nightly shows start the day after Thanksgiving. Bring your family, friends, and neighbors. Free for everyone!</>}
      </p>
    </div>
  );
}
