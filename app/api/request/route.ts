import { NextRequest, NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';
import { parseSequencePayload } from '../../../src/lib/sequencePayload';
import { rejection } from '../../../src/lib/rfMessages';
import { rateLimit } from '../../../src/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // These endpoints drive what actually plays on the house. Anyone can call
  // them directly without loading the page, so cap how fast a single client
  // can queue songs.
  const limited = rateLimit(req, 'sequence-request', 20, 5 * 60_000);
  if (limited) return limited;

  try {
    const payload = parseSequencePayload(await req.json());
    if (!payload) {
      return NextResponse.json({ message: 'sequence required' }, { status: 400 });
    }
    const result = await getRemoteFalconClient().requestSequence(payload);
    const rejected = rejection(result);
    if (rejected) return NextResponse.json({ message: rejected }, { status: 409 });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error('Request sequence error', e);
    return NextResponse.json({ message: 'Error requesting sequence' }, { status: 500 });
  }
}
