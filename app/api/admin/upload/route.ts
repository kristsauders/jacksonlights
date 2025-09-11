import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';

interface StoredPost { id:string; src:string; type:'image'|'video'; alt:string; createdAt:string; }

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
    const MAX_BYTES = 40 * 1024 * 1024; // 40MB
    if (file.size > MAX_BYTES) return NextResponse.json({ message:'File too large (max 40MB)' }, { status:400 });

    const isVideo = file.type.startsWith('video/');
    const extMap: Record<string,string> = { 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','video/mp4':'.mp4','video/quicktime':'.mov','video/webm':'.webm' };
    const id = Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    const filename = id + extMap[file.type];
    const publicDir = path.join(process.cwd(),'public');
    const postsDir = path.join(publicDir,'posts');
    await mkdir(postsDir, { recursive:true });
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(path.join(postsDir, filename), Buffer.from(arrayBuffer));

    // Update posts.json
    const postsJsonPath = path.join(publicDir,'posts.json');
    let posts: StoredPost[] = [];
    try {
      const raw = await readFile(postsJsonPath,'utf8');
      posts = JSON.parse(raw) as StoredPost[];
      if (!Array.isArray(posts)) posts = [];
    } catch {/* ignore */}
    const createdAt = new Date().toISOString();
    const newItem: StoredPost = { id, src:`/posts/${filename}`, type: isVideo? 'video':'image', alt: caption || (isVideo? 'Uploaded video':'Uploaded image'), createdAt };
    // Prepend newest first
    posts.unshift(newItem);
    await writeFile(postsJsonPath, JSON.stringify(posts, null, 2));

    return NextResponse.json({ ok:true, item:newItem });
  } catch (e:any){
    return NextResponse.json({ message:'Upload failed' }, { status:500 });
  }
}
