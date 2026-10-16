/** Shared SWR wiring so components polling the same key stay consistent. */

export const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
    return r.json();
  });

/**
 * The Behind the Scenes feed. The public tab and the admin panel both read this
 * key, so a single `mutate(POSTS_KEY)` after an upload or delete refreshes every
 * view of it. `no-store` because a new post must appear on the next fetch.
 */
export const POSTS_KEY = '/api/posts';
export const postsFetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => {
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
  // Voting is a live scoreboard, so poll faster while it is the active mode.
  refreshInterval: (latest?: { preferences?: { viewerControlMode?: string } }) =>
    latest?.preferences?.viewerControlMode === 'VOTING' ? 5_000 : 20_000,
  // Don't re-fetch every time someone alt-tabs back; the interval covers it.
  revalidateOnFocus: false,
  keepPreviousData: true,
} as const;
