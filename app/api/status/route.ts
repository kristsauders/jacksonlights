import { NextRequest, NextResponse } from 'next/server';
import { getRemoteFalconClient } from '../../../src/lib/remoteFalcon';

// Force this API route to be treated as fully dynamic to avoid build-time static rendering warnings
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const client = getRemoteFalconClient();
    const details = await client.getShowDetails();
    return NextResponse.json(details, { status: 200 });
  } catch (e: any) {
    console.error('Status API error', e);
    return NextResponse.json({ message: 'Error fetching status' }, { status: 500 });
  }
}
