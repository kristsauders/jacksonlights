"use client";
import useSWR from 'swr';
import { useState, useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Playlist() {
  // Hooks must always run in consistent order – keep all before any conditional returns
  const { data, error, isLoading } = useSWR('/api/status', fetcher, { refreshInterval: 30000 });
  const [query, setQuery] = useState('');

  const sequences = (data?.sequences || []) as any[];
  const filtered = useMemo(() => sequences.filter(s => {
    if (query && !s.displayName?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [sequences, query]);

  async function handleRequest(sequence: string) {
    try {
      const res = await fetch('/api/request', { method: 'POST', body: JSON.stringify({ sequence }) });
      if (!res.ok) throw new Error('Request failed');
    } catch (e) {
      // Basic feedback; could be replaced with toast system
  alert('Unable to request the song right now.');
    }
  }
  // Voting removed per updated requirements

  return (
  <div className="space-y-3 sm:space-y-4">
      {error && <div role="alert" className="text-red-600">Error loading playlist</div>}
  <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-xs font-medium" htmlFor="filter">Search:</label>
          <input id="filter" aria-label="Search songs" value={query} onChange={e => setQuery(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" placeholder="Type to filter" />
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-500">{filtered.length} songs</p>
      </div>
      { (isLoading && !sequences.length) ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Song list loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse h-28" />
          ))}
        </div>
      ) : (
  <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Song list">
          {filtered.map(seq => (
            <div key={seq.name} className="p-3 sm:p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col">
              <h3 className="font-medium text-sm" aria-label={`Song ${seq.displayName}`}>{seq.displayName}</h3>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{Math.round(seq.duration/60)}m {seq.duration%60}s</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => handleRequest(seq.name)} className="focus-ring flex-1 text-[11px] sm:text-xs rounded border border-brand-green/40 bg-brand-green/10 dark:bg-brand-green/15 text-brand-green dark:text-brand-gold font-medium py-1.5 hover:bg-brand-green/20 dark:hover:bg-brand-green/25 transition-colors">Play Next</button>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <p className="col-span-full text-sm text-neutral-600 dark:text-neutral-400">No songs match your filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
