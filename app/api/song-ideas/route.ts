import { NextRequest, NextResponse } from 'next/server';
import { readJson, updateJson } from '../../../src/lib/jsonStore';
import { rateLimit } from '../../../src/lib/rateLimit';

interface SongIdea {
  id: string;
  title: string;
  votes: number;
  createdAt: string;
}

const FILE = 'song-ideas.json';
const MAX_IDEAS = 500;
const MAX_TITLE = 120;

export const dynamic = 'force-dynamic';

export async function GET() {
  const ideas = await readJson<SongIdea[]>(FILE, []);
  ideas.sort((a, b) => b.votes - a.votes || b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ideas }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  // 10 new suggestions per IP per 10 minutes.
  const limited = rateLimit(req, 'song-idea-add', 10, 10 * 60_000);
  if (limited) return limited;

  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ message: 'Title required' }, { status: 400 });
    }
    const clean = title.trim().slice(0, MAX_TITLE);
    if (clean.length < 2) {
      return NextResponse.json({ message: 'Title too short' }, { status: 400 });
    }

    let existing: SongIdea | undefined;
    let created: SongIdea | undefined;
    let full = false;

    await updateJson<SongIdea[]>(FILE, [], (ideas) => {
      existing = ideas.find((i) => i.title.toLowerCase() === clean.toLowerCase());
      if (existing) return ideas;
      // Cap the list so the suggestion box can't be used to fill the disk.
      if (ideas.length >= MAX_IDEAS) {
        full = true;
        return ideas;
      }
      const idea: SongIdea = {
        id: crypto.randomUUID(),
        title: clean,
        votes: 1,
        createdAt: new Date().toISOString(),
      };
      created = idea;
      return [...ideas, idea];
    });

    if (existing) return NextResponse.json({ message: 'Already suggested', idea: existing });
    if (full) {
      return NextResponse.json(
        { message: 'The suggestion list is full for now — thanks!' },
        { status: 429 }
      );
    }
    return NextResponse.json({ idea: created }, { status: 201 });
  } catch (e) {
    console.error('Error adding song idea', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // 30 votes per IP per 10 minutes. Enough for genuine browsing, not enough to
  // meaningfully stuff the ballot.
  const limited = rateLimit(req, 'song-idea-vote', 30, 10 * 60_000);
  if (limited) return limited;

  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string' || id.length > 64) {
      return NextResponse.json({ message: 'id required' }, { status: 400 });
    }

    let updated: SongIdea | undefined;
    await updateJson<SongIdea[]>(FILE, [], (ideas) => {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return ideas;
      idea.votes += 1;
      updated = idea;
      return ideas;
    });

    if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ idea: updated });
  } catch (e) {
    console.error('Error voting song idea', e);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
