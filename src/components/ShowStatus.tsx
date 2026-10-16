"use client";
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { fetcher, statusSwrConfig } from '../lib/swr';

export default function ShowStatus() {
  const { data, error, isLoading } = useSWR('/api/status', fetcher, statusSwrConfig);

  if (error) return <div role="alert" className="text-red-600">Error loading status</div>;
  if (isLoading || !data) return <div className="animate-pulse text-sm">Loading status…</div>;

  const prefs = data.preferences || {};
  
  // Clean up display names by removing "2025 40fps"
  const cleanName = (name: string) => name ? name.replace(/\s*2025\s*40fps\s*$/i, '').trim() : '';
  const nowPlaying = cleanName(data.playingNow) || '—';
  const upNext = cleanName(data.playingNext || data.playingNextFromSchedule) || '—';

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2" aria-live="polite">
  <div className="p-3 sm:p-4 rounded-lg bg-brand-cream/70 dark:bg-neutral-900 border border-brand-maroon/20 dark:border-brand-pine/40">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Now Playing</h3>
        <motion.p
          key={data.playingNow ?? 'none'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium"
        >{nowPlaying}</motion.p>
        {/* <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Up Next: {upNext}</p> */}
      </div>
  <div className="p-3 sm:p-4 rounded-lg bg-brand-cream/70 dark:bg-neutral-900 border border-brand-maroon/20 dark:border-brand-pine/40">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Show Hours</h3>
        <p className="text-sm leading-relaxed">Nightly • 5:00 PM – 10:00 PM<br /><span className="text-xs text-neutral-600 dark:text-neutral-400">November 27 – January 1</span><br /><span className="text-xs text-neutral-600 dark:text-neutral-400">Weather permitting</span></p>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">{prefs.viewerControlMode === 'VOTING' ? 'Song Voting' : 'Song Requests'}: Currently {prefs.viewerControlEnabled ? `Enabled` : 'Disabled'}</p>
      </div>
      
    </div>
  );
}
