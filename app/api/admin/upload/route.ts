import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { ADMIN_COOKIE, verifyAdminToken } from '../../../../src/lib/adminAuth';
import { resolveInside } from '../../../../src/lib/safePath';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface PostMetadata {
  id: string;
  filename: string;
  type: 'image' | 'video';
  alt: string;
  createdAt: string;
}

const MAX_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_CAPTION = 140;

export const dynamic = 'force-dynamic';

type Detected = { ext: string; mime: string; type: 'image' | 'video' };

/**
 * Identify the file from its leading bytes rather than the client-supplied
 * `file.type`, which is just a header in the multipart body and can claim
 * anything. The extension we store is derived from what the bytes actually
 * are, so an HTML or script payload can never land on disk as ".png".
 */
function detectType(buf: Buffer): Detected | null {
  const startsWith = (...bytes: number[]) =>
    bytes.every((b, i) => buf[i] === b);

  if (startsWith(0xff, 0xd8, 0xff)) return { ext: '.jpg', mime: 'image/jpeg', type: 'image' };
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
    return { ext: '.png', mime: 'image/png', type: 'image' };
  }
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: '.webp', mime: 'image/webp', type: 'image' };
  }
  if (startsWith(0x1a, 0x45, 0xdf, 0xa3)) {
    return { ext: '.webm', mime: 'video/webm', type: 'video' };
  }
  // ISO base media format: a 'ftyp' box sits at offset 4. The brand that
  // follows tells MOV (QuickTime) apart from MP4.
  if (buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12);
    if (brand.startsWith('qt')) return { ext: '.mov', mime: 'video/quicktime', type: 'video' };
    return { ext: '.mp4', mime: 'video/mp4', type: 'video' };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    const rawCaption = form.get('caption');
    const caption = typeof rawCaption === 'string' ? rawCaption.slice(0, MAX_CAPTION).trim() : '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'File required' }, { status: 400 });
    }
    // Check size before reading the body into memory.
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File too large (max 200MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectType(buffer);
    if (!detected) {
      return NextResponse.json(
        { message: 'Unsupported file type (JPEG, PNG, WebP, MP4, MOV or WebM only)' },
        { status: 400 }
      );
    }

    const id = Date.now().toString(36) + randomBytes(5).toString('hex');
    const filename = id + detected.ext;

    const postsDir = path.join(process.cwd(), 'public', 'posts');
    const mediaPath = resolveInside(postsDir, filename);
    const metaPath = resolveInside(postsDir, `${id}.json`);
    if (!mediaPath || !metaPath) {
      return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
    }

    await mkdir(postsDir, { recursive: true });
    await writeFile(mediaPath, buffer);

    const metadata: PostMetadata = {
      id,
      filename,
      type: detected.type,
      alt: caption || (detected.type === 'video' ? 'Uploaded video' : 'Uploaded image'),
      createdAt: new Date().toISOString(),
    };
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      ok: true,
      item: { ...metadata, src: `/api/posts/media/${filename}` },
    });
  } catch (e) {
    console.error('Upload failed:', e);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
