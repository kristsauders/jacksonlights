import { NextRequest, NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';
import { parseSequencePayload } from '../../../src/lib/sequencePayload';
import { rateLimit } from '../../../src/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'sequence-vote', 30, 5 * 60_000);
  if (limited) return limited;

  try {
    const payload = parseSequencePayload(await req.json());
    if (!payload) {
      return NextResponse.json({ message: 'sequence required' }, { status: 400 });
    }
    const result = await getRemoteFalconClient().voteForSequence(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error('Vote for sequence error', e);
    return NextResponse.json({ message: 'Error voting for sequence' }, { status: 500 });
  }
}
