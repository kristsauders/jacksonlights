import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../src/lib/adminAuth';
import path from 'path';
import { readFile, writeFile, unlink } from 'fs/promises';

interface PostItem { id:string; src:string; type:'image'|'video'; alt:string; createdAt?:string; }

export async function POST(req:NextRequest){
  const token = req.cookies.get('admin_token')?.value;
  if (!verifyAdminToken(token)) return NextResponse.json({ message:'Unauthorized' }, { status:401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message:'Missing id' }, { status:400 });
    const publicDir = path.join(process.cwd(),'public');
    const postsJsonPath = path.join(publicDir,'posts.json');
    let posts: PostItem[] = [];
    try {
      const raw = await readFile(postsJsonPath,'utf8');
      posts = JSON.parse(raw) as PostItem[];
    } catch {/* ignore */}
    const idx = posts.findIndex(p=> p.id === id);
    if (idx === -1) return NextResponse.json({ message:'Not found' }, { status:404 });
    const [removed] = posts.splice(idx,1);
    // Remove underlying file if inside /posts/
    if (removed.src.startsWith('/posts/')){
      const filePath = path.join(publicDir, removed.src.replace(/^\//,''));
      try { await unlink(filePath); } catch {/* ignore missing */}
    }
    await writeFile(postsJsonPath, JSON.stringify(posts, null, 2));
    return NextResponse.json({ ok:true });
  } catch (e:any){
    return NextResponse.json({ message:'Delete failed' }, { status:500 });
  }
}