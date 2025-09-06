import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'song-ideas.json');

interface SongIdea { id:string; title:string; votes:number; createdAt:string; }

async function readIdeas(): Promise<SongIdea[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeIdeas(items: SongIdea[]) {
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
}

export async function GET() {
  const ideas = await readIdeas();
  // sort by votes desc then recent
  ideas.sort((a,b)=> b.votes - a.votes || b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ideas });
}

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string' || title.length < 2) {
      return NextResponse.json({ message:'Title too short' }, { status:400 });
    }
    const ideas = await readIdeas();
    const exists = ideas.find(i => i.title.toLowerCase() === title.toLowerCase());
    if (exists) {
      return NextResponse.json({ message:'Already suggested', idea: exists }, { status:200 });
    }
    const idea: SongIdea = { id: crypto.randomUUID(), title: title.trim(), votes: 1, createdAt: new Date().toISOString() };
    ideas.push(idea);
    await writeIdeas(ideas);
    return NextResponse.json({ idea }, { status:201 });
  } catch (e:any) {
    console.error('Error adding song idea', e);
    return NextResponse.json({ message:'Server error' }, { status:500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message:'id required' }, { status:400 });
    const ideas = await readIdeas();
    const idea = ideas.find(i=>i.id===id);
    if (!idea) return NextResponse.json({ message:'Not found' }, { status:404 });
    idea.votes += 1;
    await writeIdeas(ideas);
    return NextResponse.json({ idea });
  } catch (e:any) {
    console.error('Error voting song idea', e);
    return NextResponse.json({ message:'Server error' }, { status:500 });
  }
}
