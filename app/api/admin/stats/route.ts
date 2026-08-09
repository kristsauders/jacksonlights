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
interface SongIdea { id: string; title: string; votes: number; createdAt: string; }
interface DonationData { total: number; }
interface Metrics { visits: number; lastVisitAt?: string; }

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const [feedback, ideas, donations, metrics] = await Promise.all([
    readJson<FeedbackItem[]>('feedback.json', []),
    readJson<SongIdea[]>('song-ideas.json', []),
    readJson<DonationData>('donations.json', { total: 0 }),
    readJson<Metrics>('metrics.json', { visits: 0 }),
  ]);

  const topIdeas = [...ideas]
    .sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title))
    .slice(0, 10);

  const recentFeedback = [...feedback]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return NextResponse.json(
    {
      donations: donations.total ?? 0,
      visits: metrics.visits ?? 0,
      ideas: { count: ideas.length, top: topIdeas },
      feedback: { count: feedback.length, recent: recentFeedback },
    },
    { headers: { 'Cache-Control': 'no-store, private' } }
  );
}
