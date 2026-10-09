import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { isValidMediaFilename, resolveInside } from '../../../../../src/lib/safePath';
import { POSTS_DIR } from '../../../../../src/lib/storagePaths';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

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

    try {
      const info = await stat(filePath);
      if (!info.isFile()) return new NextResponse('File not found', { status: 404 });
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
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
