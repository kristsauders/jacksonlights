import { NextRequest, NextResponse } from 'next/server';
import { readJson, updateJson } from '../../../src/lib/jsonStore';
import { rateLimit } from '../../../src/lib/rateLimit';

interface DonationData {
  total: number;
}

const FILE = 'donations.json';
const MAX_SINGLE_AMOUNT = 10_000;

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await readJson<DonationData>(FILE, { total: 0 });
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

// SECURITY NOTE: this endpoint takes an unauthenticated number and adds it to
// the publicly displayed "raised" total — there is no payment provider behind
// it (the Donate tab is currently disabled in TabbedSections). Rate limiting
// and the per-request cap below keep it from being trivially defaced, but
// before re-enabling the Donate tab this should post to a real provider
// (e.g. Stripe Checkout) and update the total from a verified webhook only.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'donate', 5, 10 * 60_000);
  if (limited) return limited;

  try {
    const { amount } = await req.json();
    const amt = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0 || amt > MAX_SINGLE_AMOUNT) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
    }

    const data = await updateJson<DonationData>(FILE, { total: 0 }, (current) => ({
      total: Math.round(((current.total ?? 0) + amt) * 100) / 100,
    }));

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error('Donation error', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
