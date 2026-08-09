import { NextRequest, NextResponse } from 'next/server';
import { updateJson } from '../../../src/lib/jsonStore';
import { rateLimit } from '../../../src/lib/rateLimit';

interface FeedbackItem {
  id: string;
  message: string;
  name?: string;
  email?: string;
  createdAt: string;
}

const FILE = 'feedback.json';
// Keep the file bounded so a flood of submissions can't fill the App Service
// disk or slow every read to a crawl.
const MAX_ITEMS = 2000;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 5 submissions per IP per 10 minutes.
  const limited = rateLimit(req, 'feedback', 5, 10 * 60_000);
  if (limited) return limited;

  try {
    const { message, name, email } = await req.json();
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ message: 'Message too short' }, { status: 400 });
    }

    const item: FeedbackItem = {
      id: crypto.randomUUID(),
      message: message.trim().slice(0, 1000),
      name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : undefined,
      email: typeof email === 'string' && email.trim() ? email.trim().slice(0, 160) : undefined,
      createdAt: new Date().toISOString(),
    };

    await updateJson<FeedbackItem[]>(FILE, [], (items) =>
      [item, ...items].slice(0, MAX_ITEMS)
    );

    // Echo back only what the submitter already typed — never the stored list.
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error('Feedback error', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// NOTE: this route previously exposed a public GET that returned every
// submission, including the optional name and email fields. Reading feedback
// is admin-only and lives at /api/admin/feedback, which the admin dashboard
// already uses.
