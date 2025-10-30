import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface PostMetadata { 
  id: string; 
  filename: string; 
  type: 'image' | 'video'; 
  alt: string; 
  createdAt: string; 
}

export async function POST(req: NextRequest){
  // Auth check
  const token = req.cookies.get('admin_token')?.value;
  if (!verifyAdminToken(token)) return NextResponse.json({ message:'Unauthorized' }, { status:401 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    const caption = (form.get('caption') || '') as string;
    if (!file || !(file instanceof File)) return NextResponse.json({ message:'File required' }, { status:400 });
    const allowed = ['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm'];
    if (!allowed.includes(file.type)) return NextResponse.json({ message:'Unsupported file type' }, { status:400 });
    const MAX_BYTES = 200 * 1024 * 1024; // 200MB
    if (file.size > MAX_BYTES) return NextResponse.json({ message:'File too large (max 200MB)' }, { status:400 });

    const isVideo = file.type.startsWith('video/');
    const extMap: Record<string,string> = { 
      'image/jpeg':'.jpg',
      'image/png':'.png',
      'image/webp':'.webp',
      'video/mp4':'.mp4',
      'video/quicktime':'.mov',
      'video/webm':'.webm' 
    };
    
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const filename = id + extMap[file.type];
    const publicDir = path.join(process.cwd(), 'public');
    const postsDir = path.join(publicDir, 'posts');
    await mkdir(postsDir, { recursive: true });
    
    // Write media file
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(path.join(postsDir, filename), Buffer.from(arrayBuffer));

    // Write metadata JSON file (same name but .json extension)
    const createdAt = new Date().toISOString();
    const metadata: PostMetadata = { 
      id, 
      filename, 
      type: isVideo ? 'video' : 'image', 
      alt: caption || (isVideo ? 'Uploaded video' : 'Uploaded image'), 
      createdAt 
    };
    await writeFile(
      path.join(postsDir, `${id}.json`), 
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({ ok: true, item: { ...metadata, src: `/api/posts/media/${filename}` } });
  } catch (e: any) {
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
