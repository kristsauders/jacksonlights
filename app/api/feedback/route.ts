import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface FeedbackItem { id:string; message:string; name?:string; email?:string; createdAt:string; }

const filePath = path.join(process.cwd(), 'data', 'feedback.json');

async function readItems(): Promise<FeedbackItem[]> {
  try { return JSON.parse(await fs.readFile(filePath,'utf8')); } catch { return []; }
}
async function writeItems(items: FeedbackItem[]) { await fs.writeFile(filePath, JSON.stringify(items,null,2),'utf8'); }

export async function POST(req: NextRequest){
  try {
    const { message, name, email } = await req.json();
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ message:'Message too short' }, { status:400 });
    }
    const item: FeedbackItem = { id: crypto.randomUUID(), message: message.trim().slice(0, 1000), name: name?.slice(0,80), email: email?.slice(0,160), createdAt: new Date().toISOString() };
    const items = await readItems();
    items.unshift(item);
    await writeItems(items);

  // Email disabled – feedback only stored locally.

    return NextResponse.json({ item }, { status:201 });
  } catch (e:any){
    console.error('Feedback error', e);
    return NextResponse.json({ message:'Server error' }, { status:500 });
  }
}

export async function GET(){
  const items = await readItems();
  return NextResponse.json({ items });
}
