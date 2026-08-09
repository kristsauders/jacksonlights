/** Shared SWR wiring so components polling the same key stay consistent. */

export const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
    return r.json();
  });

/**
 * ShowStatus and Playlist both read '/api/status'. They used to declare
 * different refreshIntervals (15s and 30s) on the same key, which left two
 * independent timers running against one cache entry. One interval keeps it to
 * a single poll.
 */
export const statusSwrConfig = {
  refreshInterval: 20_000,
  // Don't re-fetch every time someone alt-tabs back; the interval covers it.
  revalidateOnFocus: false,
  keepPreviousData: true,
} as const;
