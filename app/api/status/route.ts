import { NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';

export const dynamic = 'force-dynamic';

// Every visitor's browser polls this endpoint on a timer. Without a shared
// cache each poll became a separate upstream call to Remote Falcon, so origin
// load (and page latency) scaled linearly with the number of people parked on
// the site. One upstream call per CACHE_TTL_MS now serves everybody.
const CACHE_TTL_MS = 5_000;

let cached: { at: number; body: unknown } | null = null;
let inFlight: Promise<unknown> | null = null;

// Only these top-level keys reach the browser. showDetails also carries
// account-level fields (owner email, show coordinates, page config) that the
// site never uses and has no business publishing.
const PUBLIC_KEYS = [
  'playingNow',
  'playingNext',
  'playingNextFromSchedule',
  'sequences',
  'preferences',
] as const;

function project(details: any) {
  const out: Record<string, unknown> = {};
  if (details && typeof details === 'object') {
    for (const key of PUBLIC_KEYS) {
      if (key in details) out[key] = details[key];
    }
    // Live voting standings. Remote Falcon also lists who voted (by IP address)
    // on each entry, so rebuild every row from just the public fields.
    if (Array.isArray(details.votes)) {
      out.votes = details.votes
        .map((v: any) => ({
          name: v?.sequence?.name ?? v?.sequenceGroup?.name,
          displayName: v?.sequence?.displayName ?? v?.sequenceGroup?.name,
          votes: v?.votes,
          lastVoteTime: v?.lastVoteTime,
        }))
        .filter((v: any) => typeof v.name === 'string' && typeof v.votes === 'number' && v.votes > 0);
    }
  }
  return out;
}

async function getStatus(): Promise<unknown> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.body;

  // Collapse concurrent misses into a single upstream request.
  if (!inFlight) {
    inFlight = getRemoteFalconClient()
      .getShowDetails()
      .then((details) => {
        const body = project(details);
        cached = { at: Date.now(), body };
        return body;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export async function GET() {
  try {
    const body = await getStatus();
    return NextResponse.json(body, {
      status: 200,
      headers: {
        // Let Front Door absorb the polling too.
        'Cache-Control': 'public, max-age=3, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (e) {
    console.error('Status API error', e);
    // Serve the last good payload rather than an error banner if Remote Falcon
    // is briefly unreachable.
    if (cached) {
      return NextResponse.json(cached.body, {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=5, s-maxage=10' },
      });
    }
    return NextResponse.json({ message: 'Error fetching status' }, { status: 500 });
  }
}
