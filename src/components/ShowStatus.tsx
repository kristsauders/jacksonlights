"use client";
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { fetcher, statusSwrConfig } from '../lib/swr';

// Sequences that aren't songs: the show playing these means the lights are off
// or idle, so visitors get a friendly "next show" line instead of the file name.
const IDLE_SEQUENCE = /^(all\s*off|off|blank|black(out)?|idle)$/i;

// Clean up display names by removing "2025 40fps"
const cleanName = (name?: string) => (name ? name.replace(/\s*2025\s*40fps\s*$/i, '').trim() : '');

// When the show is next on, in Beacon time. Dates match PreseasonBanner and the
// nightly 5–10 PM schedule.
function nextShow(): string {
  const now = new Date();
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(now);
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23' }).format(now));
  if (day < '2026-11-27') return 'Opening night: Fri, Nov 27 at 5 PM';
  if (day > '2027-01-01' || (day === '2027-01-01' && hour >= 22)) return 'See you next season!';
  if (hour < 17) return 'Next show: tonight at 5 PM';
  if (hour >= 22) return 'Next show: tomorrow at 5 PM';
  return 'Starting any minute';
}

function Hours() {
  return (
    <div className="meta-text sm:text-right">
      <p className="font-semibold text-neutral-900 dark:text-neutral-100">Nightly · 5–10 PM</p>
      <p>Nov 27 – Jan 1 · Weather permitting</p>
    </div>
  );
}

export default function ShowStatus() {
  const { data, error, isLoading } = useSWR('/api/status', fetcher, statusSwrConfig);

  const song = cleanName(data?.playingNow);
  const playing = !!song && !IDLE_SEQUENCE.test(song);

  let label = 'Show status';
  let headline = 'Checking what’s on…';
  if (error) headline = 'Live status unavailable';
  else if (!isLoading && data) {
    label = playing ? 'Now playing' : 'The lights are off';
    headline = playing ? song : nextShow();
  }

  return (
    <section aria-labelledby="status-heading" className="surface px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <h2 id="status-heading" className="sr-only">Current show status</h2>
      <div className="flex-1 min-w-0" aria-live="polite">
        <p className="eyebrow flex items-center gap-2 !text-neutral-500 dark:!text-neutral-400">
          <span className={`h-2 w-2 rounded-full ${playing ? 'bg-brand-green animate-pulse' : 'bg-neutral-400 dark:bg-neutral-600'}`} aria-hidden="true" />
          {label}
        </p>
        <motion.p
          key={headline}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate"
        >{headline}</motion.p>
      </div>
      <Hours />
    </section>
  );
}
