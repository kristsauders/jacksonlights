import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { isValidMediaFilename } from '../../../src/lib/safePath';
import { POSTS_DIR } from '../../../src/lib/storagePaths';

export const dynamic = 'force-dynamic';

interface PostMetadata { 
  id: string; 
  filename: string; 
  type: 'image' | 'video'; 
  alt: string; 
  createdAt: string; 
}

interface PostItem {
  id: string;
  src: string;
  type: 'image' | 'video';
  alt: string;
  createdAt: string;
}

export async function GET() {
  try {
    const postsDir = POSTS_DIR;
    
    let files: string[];
    try {
      files = await readdir(postsDir);
    } catch {
      // Directory doesn't exist or is empty
      return NextResponse.json([]);
    }

    // Find all .json metadata files
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const posts: PostItem[] = [];
    
    for (const jsonFile of jsonFiles) {
      try {
        const content = await readFile(path.join(postsDir, jsonFile), 'utf8');
        const metadata: PostMetadata = JSON.parse(content);

        // Skip anything whose filename wouldn't be servable by the media route
        // anyway, so the feed never renders a permanently broken tile.
        if (!isValidMediaFilename(metadata.filename)) continue;

        // Check if the corresponding media file exists
        const mediaExists = files.includes(metadata.filename);

        if (mediaExists) {
          posts.push({
            id: metadata.id,
            src: `/api/posts/media/${metadata.filename}`,
            type: metadata.type,
            alt: metadata.alt,
            createdAt: metadata.createdAt
          });
        }
      } catch {
        // Skip invalid JSON files
        continue;
      }
    }
    
    // Sort by creation date, newest first
    posts.sort((a, b) => {
      const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bd - ad;
    });
    
    return NextResponse.json(posts, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Error loading posts:', e);
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}
