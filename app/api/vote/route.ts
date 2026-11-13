import { NextRequest, NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';
import { parseSequencePayload } from '../../../src/lib/sequencePayload';
import { rejection } from '../../../src/lib/rfMessages';
import { rateLimit } from '../../../src/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Generous on purpose: a crowd on one Wi-Fi network (a party, or phones
  // behind a carrier's shared address) all count as one IP here. Remote
  // Falcon can't tell visitors apart either, since every vote reaches it from
  // this server, so this only stops a single client flooding the endpoint.
  const limited = rateLimit(req, 'sequence-vote', 300, 5 * 60_000);
  if (limited) return limited;

  try {
    const payload = parseSequencePayload(await req.json());
    if (!payload) {
      return NextResponse.json({ message: 'sequence required' }, { status: 400 });
    }
    const result = await getRemoteFalconClient().voteForSequence(payload);
    const rejected = rejection(result);
    if (rejected) return NextResponse.json({ message: rejected }, { status: 409 });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error('Vote for sequence error', e);
    return NextResponse.json({ message: 'Error voting for sequence' }, { status: 500 });
  }
}
