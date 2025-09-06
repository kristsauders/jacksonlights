import { NextRequest, NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sequence, viewerLatitude, viewerLongitude } = body;
    if (!sequence || typeof sequence !== 'string') {
      return NextResponse.json({ message: 'sequence required' }, { status: 400 });
    }
    const client = getRemoteFalconClient();
    const result = await client.requestSequence({ sequence, viewerLatitude, viewerLongitude });
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error('Request sequence error', e);
    return NextResponse.json({ message: 'Error requesting sequence' }, { status: 500 });
  }
}
