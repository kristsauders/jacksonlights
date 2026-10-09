import { NextResponse } from 'next/server';
import { readJson } from '../../../src/lib/jsonStore';

interface DonationData {
  total: number;
}

const FILE = 'donations.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await readJson<DonationData>(FILE, { total: 0 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

// There is deliberately no POST here. The old handler added any
// unauthenticated number to the publicly displayed "raised" total with no
// payment provider behind it. Before re-enabling the Donate tab, post to a
// real provider (e.g. Stripe Checkout) and update the total from a verified
// webhook only.
