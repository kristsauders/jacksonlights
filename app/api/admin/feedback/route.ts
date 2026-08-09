import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '../../../../src/lib/adminAuth';
import { readJson } from '../../../../src/lib/jsonStore';

interface FeedbackItem {
  id: string;
  message: string;
  name?: string;
  email?: string;
  createdAt: string;
}

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const items = await readJson<FeedbackItem[]>('feedback.json', []);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    { items },
    // Never let Front Door or a browser cache a response containing PII.
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}
