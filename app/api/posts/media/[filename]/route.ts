import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import sharp from 'sharp';
import { isValidMediaFilename, resolveInside } from '../../../../../src/lib/safePath';
import { POSTS_DIR } from '../../../../../src/lib/storagePaths';

// Photos go out upright and web-sized. Phones save the sensor's raw pixels plus
// an EXIF "rotate me" flag; browsers and apps don't all honour it, which is how
// one photo showed up sideways on a desktop. Baking the rotation into the pixels
// (and dropping the EXIF, including GPS) makes every viewer agree. Originals on
// disk are untouched. Results are memoised: files never change once uploaded.
const MAX_PHOTO_EDGE = 2560;
// Promises, not buffers, so simultaneous first requests share one resize.
const photoCache = new Map<string, Promise<Buffer>>();

function normalizePhoto(filename: string, input: Buffer, ext: string): Promise<Buffer> {
  const hit = photoCache.get(filename);
  if (hit) return hit;
  const img = sharp(input).rotate().resize({
    width: MAX_PHOTO_EDGE, height: MAX_PHOTO_EDGE, fit: 'inside', withoutEnlargement: true,
  });
  const out = (ext === '.png' ? img.png() : ext === '.webp' ? img.webp({ quality: 85 }) : img.jpeg({ quality: 85, mozjpeg: true })).toBuffer();
  if (photoCache.size >= 20) photoCache.delete(photoCache.keys().next().value as string);
  photoCache.set(filename, out);
  out.catch(() => photoCache.delete(filename));
  return out;
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);

// Shared by full and partial video responses.
const MEDIA_HEADERS = {
  // Filenames are content-addressed by upload time, so they never change.
  'Cache-Control': 'public, max-age=31536000, immutable',
  // Stop the browser from re-interpreting a file as something more
  // dangerous than the Content-Type we declared.
  'X-Content-Type-Options': 'nosniff',
  'Accept-Ranges': 'bytes',
};

/**
 * Parse a single-range `Range: bytes=...` header into inclusive offsets.
 * Returns null for anything we don't serve as a range (missing, multi-range,
 * other units), which falls back to the whole file, and 'invalid' when the
 * range can't be satisfied.
 */
function parseRange(header: string | null, size: number): { start: number; end: number } | 'invalid' | null {
  const m = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start: number;
  let end: number;
  if (m[1] === '') {
    // Suffix range: the last N bytes.
    const suffix = Number(m[2]);
    if (suffix === 0) return 'invalid';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return 'invalid';
  return { start, end };
}

/**
 * Videos are streamed from disk and honour Range requests. Safari (iPhone,
 * iPad, Mac) only plays a video when the server answers ranges with 206
 * Partial Content, and shows a crossed-out play button otherwise.
 *
 * Front Door used to paper over this route's lack of range support by slicing
 * cached copies itself, but since Next 16.4.5 strips the Content-Length we set,
 * full responses go out chunked with no length, Front Door can neither cache
 * nor slice them, and Safari got a plain 200. Answering ranges here works
 * whatever the CDN does.
 */
function serveVideo(filePath: string, size: number, contentType: string, rangeHeader: string | null) {
  const range = parseRange(rangeHeader, size);
  if (range === 'invalid') {
    return new NextResponse(null, {
      status: 416,
      headers: { ...MEDIA_HEADERS, 'Content-Range': `bytes */${size}` },
    });
  }
  const { start, end } = range ?? { start: 0, end: size - 1 };
  const body = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
  return new NextResponse(body, {
    status: range ? 206 : 200,
    headers: {
      ...MEDIA_HEADERS,
      'Content-Type': contentType,
      'Content-Length': String(end - start + 1),
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}),
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Only serve names in the exact shape the upload route produces. This
    // rejects traversal, dotfiles, and the sibling .json metadata files (which
    // the old extension-agnostic version happily served).
    if (!isValidMediaFilename(filename)) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const postsDir = POSTS_DIR;
    const filePath = resolveInside(postsDir, filename);
    if (!filePath) return new NextResponse('Invalid filename', { status: 400 });

    let size: number;
    try {
      const info = await stat(filePath);
      if (!info.isFile()) return new NextResponse('File not found', { status: 404 });
      size = info.size;
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    if (VIDEO_EXTENSIONS.has(ext)) {
      return serveVideo(filePath, size, MIME_TYPES[ext], request.headers.get('range'));
    }
    let fileBuffer: Buffer = await readFile(filePath);
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      try {
        fileBuffer = await normalizePhoto(filename, fileBuffer, ext);
      } catch (e) {
        // The original still has its EXIF (including GPS), so don't hand it out.
        console.error('Photo normalize failed:', e);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Filenames are content-addressed by upload time, so they never change.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
        // Stop the browser from re-interpreting a file as something more
        // dangerous than the Content-Type we declared.
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving media file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
