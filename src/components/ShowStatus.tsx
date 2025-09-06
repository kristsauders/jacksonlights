"use client";
import useSWR from 'swr';
import { motion } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ShowStatus() {
  const { data, error, isLoading } = useSWR('/api/status', fetcher, { refreshInterval: 15000 });

  if (error) return <div role="alert" className="text-red-600">Error loading status</div>;
  if (isLoading || !data) return <div className="animate-pulse text-sm">Loading status…</div>;

  const prefs = data.preferences || {};

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3" aria-live="polite">
  <div className="p-3 sm:p-4 rounded-lg bg-brand-cream/70 dark:bg-neutral-900 border border-brand-maroon/20 dark:border-brand-pine/40">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Now Playing</h3>
        <motion.p
          key={data.playingNow}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-medium"
        >{data.playingNow || '—'}</motion.p>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Up Next: {data.playingNext || '—'}</p>
      </div>
  <div className="p-3 sm:p-4 rounded-lg bg-brand-cream/70 dark:bg-neutral-900 border border-brand-maroon/20 dark:border-brand-pine/40">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Show Hours</h3>
        <p className="text-sm leading-relaxed">Daily until Jan 2 • 5:00 PM – 10:00 PM<br /><span className="text-xs text-neutral-600 dark:text-neutral-400">Weather permitting</span></p>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">Viewer Control: {prefs.viewerControlEnabled ? `${prefs.viewerControlMode}` : 'Disabled'}</p>
      </div>
  <div className="p-3 sm:p-4 rounded-lg bg-brand-cream/70 dark:bg-neutral-900 border border-brand-maroon/20 dark:border-brand-pine/40 flex flex-col">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Listen Along</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Tune to <strong>FM 87.9</strong> or press play to stream.</p>
        <audio id="show-audio-element" aria-label="Show audio stream" controls className="w-full" src="/audio/stream-placeholder.mp3" />
        {/* <AudioVisualizer /> */}
      </div>
    </div>
  );
}
