import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import path from 'path';
import { readdir, readFile, unlink } from 'fs/promises';

interface PostMetadata { 
  id: string; 
  filename: string; 
  type: 'image' | 'video'; 
  alt: string; 
  createdAt: string; 
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!verifyAdminToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 });
    
    const publicDir = path.join(process.cwd(), 'public');
    const postsDir = path.join(publicDir, 'posts');
    
    // Read the metadata file
    const metadataPath = path.join(postsDir, `${id}.json`);
    let metadata: PostMetadata;
    
    try {
      const content = await readFile(metadataPath, 'utf8');
      metadata = JSON.parse(content);
    } catch {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    
    // Delete the media file
    const mediaPath = path.join(postsDir, metadata.filename);
    try {
      await unlink(mediaPath);
    } catch {
      // File might already be deleted, continue
    }
    
    // Delete the metadata JSON file
    try {
      await unlink(metadataPath);
    } catch {
      // File might already be deleted
    }
    
    // Trigger event to refresh PostsFeed
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Delete failed:', e);
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}