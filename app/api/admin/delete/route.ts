import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminToken } from '../../../../src/lib/adminAuth';
import { isValidMediaFilename, isValidPostId, resolveInside } from '../../../../src/lib/safePath';
import path from 'path';
import { readFile, unlink } from 'fs/promises';

interface PostMetadata {
  id: string;
  filename: string;
  type: 'image' | 'video';
  alt: string;
  createdAt: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    // `id` used to be interpolated straight into a path, so a body of
    // {"id":"../../something"} deleted arbitrary files. Only ever accept ids
    // in the exact shape the upload route generates.
    if (!isValidPostId(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    const postsDir = path.join(process.cwd(), 'public', 'posts');
    const metadataPath = resolveInside(postsDir, `${id}.json`);
    if (!metadataPath) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }

    let metadata: PostMetadata;
    try {
      metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
    } catch {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // The filename comes out of a file on disk, but validate it anyway — the
    // metadata is only as trustworthy as whatever wrote it.
    if (isValidMediaFilename(metadata.filename)) {
      const mediaPath = resolveInside(postsDir, metadata.filename);
      if (mediaPath) {
        // Media file may already be gone; that isn't an error.
        await unlink(mediaPath).catch(() => {});
      }
    }

    await unlink(metadataPath).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Delete failed:', e);
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}
