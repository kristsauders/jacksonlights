"use client";
import { useEffect, useState } from 'react';

// Swap this each year to the new highlight reel. Preview at
// https://youtu.be/<id> and adjust these to a wide, calm-looking segment —
// fast cuts read as jarring on a short muted loop.
//
// Known limitation: YouTube's loop param always restarts from 0:00, not from
// `start` — so every ~20s this will briefly flash back to the intro before
// jumping to LOOP_START_SECONDS again, rather than looping seamlessly within
// the window. Fine for now; if that flash gets annoying, the real fix is
// swapping this URL-param embed for the YouTube IFrame Player API, which can
// seek precisely on the 'ended' event instead of relying on `loop`. Say the
// word and I'll do that.
const VIDEO_ID = '6GcqgGBDs8w'; // "2025 Show"
const LOOP_START_SECONDS = 45; // skip the slower intro, cut straight to the good part
const LOOP_DURATION_SECONDS = 20;
const LOOP_END_SECONDS = LOOP_START_SECONDS + LOOP_DURATION_SECONDS;

/**
 * Muted, looping YouTube embed layered over the hero photo.
 *
 * This is an embed, not a self-hosted clip — pulling and re-encoding a
 * snippet from YouTube isn't something I can do from here (no video tooling
 * in this environment, and it's their video anyway so embedding is the
 * legitimate path). The tradeoff: it costs a real chunk of YouTube's own JS.
 * Two things keep that off the critical path:
 *   1. Mounting is deferred to idle time, after the fast hero photo has
 *      already painted — LCP is unaffected.
 *   2. It's skipped entirely on phones, prefers-reduced-motion or a
 *      save-data connection, leaving just the static photo.
 *
 * If you'd rather have this be a tiny self-hosted mp4 (better performance,
 * no third-party request at all), export an 8-15s muted clip from the show
 * footage and this component can be swapped for a native <video> tag.
 */
export default function HeroVideoBackground() {
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection?.saveData;
    // Phones often refuse to autoplay the embed and show YouTube's play button
    // and spinner over the header instead, so they just get the photo.
    const smallScreen = window.matchMedia('(max-width: 639px)').matches;
    if (reduceMotion || saveData || smallScreen) return;

    const win = window as any;
    const idleId = win.requestIdleCallback
      ? win.requestIdleCallback(() => setArmed(true), { timeout: 3000 })
      : setTimeout(() => setArmed(true), 1200);

    return () => {
      if (win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
    };
  }, []);

  if (!armed) return null;

  const src =
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
    `?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}` +
    `&start=${LOOP_START_SECONDS}&end=${LOOP_END_SECONDS}` +
    `&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3`;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <iframe
        src={src}
        title="Jackson Lights show footage"
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        style={{ border: 0 }}
        onLoad={() => setVisible(true)}
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
