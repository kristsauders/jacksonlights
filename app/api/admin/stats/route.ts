import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import { promises as fs } from 'fs';
import path from 'path';

interface FeedbackItem { id:string; message:string; name?:string; email?:string; createdAt:string; }
interface SongIdea { id:string; title:string; votes:number; createdAt:string; }
interface DonationData { total:number; }
interface Metrics { visits:number; lastVisitAt?:string; }

const feedbackPath = path.join(process.cwd(), 'data', 'feedback.json');
const songIdeasPath = path.join(process.cwd(), 'data', 'song-ideas.json');
const donationsPath = path.join(process.cwd(), 'data', 'donations.json');
const metricsPath = path.join(process.cwd(), 'data', 'metrics.json');

async function readJson<T>(p:string, fallback:T): Promise<T> {
  try { return JSON.parse(await fs.readFile(p,'utf8')); } catch { return fallback; }
}
async function writeJson<T>(p:string, data:T) { await fs.writeFile(p, JSON.stringify(data,null,2),'utf8'); }

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest){
  if (!isAdmin(req)) return NextResponse.json({ message:'Unauthorized' }, { status:401 });

  const [feedback, ideas, donations, metrics] = await Promise.all([
    readJson<FeedbackItem[]>(feedbackPath, []),
    readJson<SongIdea[]>(songIdeasPath, []),
    readJson<DonationData>(donationsPath, { total:0 }),
    readJson<Metrics>(metricsPath, { visits:0 })
  ]);

  // Aggregate song idea stats (top 10)
  const topIdeas = [...ideas].sort((a,b)=> b.votes - a.votes || a.title.localeCompare(b.title)).slice(0,10);

  // Feedback recent 10
  const recentFeedback = [...feedback].sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).slice(0,10);

  return NextResponse.json({
    donations: donations.total,
    visits: metrics.visits,
    ideas: { count: ideas.length, top: topIdeas },
    feedback: { count: feedback.length, recent: recentFeedback }
  });
}
