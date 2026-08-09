import { NextRequest, NextResponse } from 'next/server';
import { updateJson } from '../../../../src/lib/jsonStore';
import { rateLimit } from '../../../../src/lib/rateLimit';

interface Metrics {
  visits: number;
  lastVisitAt?: string;
}

const FILE = 'metrics.json';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Count at most a few visits per IP per hour. Without this the counter was a
  // free write-amplification endpoint: one curl loop could inflate it forever
  // and hammer the disk doing it.
  const limited = rateLimit(req, 'visit', 5, 60 * 60_000);
  if (limited) {
    // Quietly succeed rather than surfacing a 429 for a fire-and-forget ping.
    return NextResponse.json({ ok: true });
  }

  await updateJson<Metrics>(FILE, { visits: 0 }, (m) => ({
    visits: (m.visits ?? 0) + 1,
    lastVisitAt: new Date().toISOString(),
  }));

  return NextResponse.json({ ok: true });
}
