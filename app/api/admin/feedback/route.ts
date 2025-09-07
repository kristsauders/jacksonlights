import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import { promises as fs } from 'fs';
import path from 'path';

interface FeedbackItem { id:string; message:string; name?:string; email?:string; createdAt:string; }

const feedbackPath = path.join(process.cwd(), 'data', 'feedback.json');

async function readFeedback(): Promise<FeedbackItem[]> { try { return JSON.parse(await fs.readFile(feedbackPath,'utf8')); } catch { return []; } }

function isAdmin(req: NextRequest){
  const token = req.cookies.get('admin_token')?.value;
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest){
  if (!isAdmin(req)) return NextResponse.json({ message:'Unauthorized' }, { status:401 });
  const items = await readFeedback();
  items.sort((a,b)=> b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ items });
}
