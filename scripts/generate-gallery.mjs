#!/usr/bin/env node
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const photosDir = join(process.cwd(), 'public', 'photos');
const optimizedDir = join(photosDir, 'optimized');
const postsDir = join(process.cwd(), 'public', 'posts');
const galleryOutFile = join(process.cwd(), 'public', 'gallery.json');
const postsOutFile = join(process.cwd(), 'public', 'posts.json');

const valid = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// Straight-off-the-phone photos are ~4000px wide and several MB. Downscaling
// once at build time means next/image never has to re-encode a huge original
// on a cold cache (slow on small App Service tiers), and it strips EXIF —
// including the camera and capture metadata — from anything we publish.
const MAX_WIDTH = 2400;
const WEBP_QUALITY = 78;

async function optimizePhotos(files) {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('sharp unavailable — using original photos as-is');
    return new Map();
  }

  await mkdir(optimizedDir, { recursive: true });
  const optimized = new Map();

  for (const file of files) {
    const source = join(photosDir, file);
    const outName = `${basename(file, extname(file))}.webp`;
    const outPath = join(optimizedDir, outName);

    try {
      // Skip files already processed and still newer than their source.
      const [srcStat, outStat] = await Promise.all([
        stat(source),
        stat(outPath).catch(() => null),
      ]);
      if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) {
        optimized.set(file, `/photos/optimized/${outName}`);
        continue;
      }

      await sharp(source)
        .rotate() // honour EXIF orientation before the metadata is dropped
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outPath);

      optimized.set(file, `/photos/optimized/${outName}`);
      console.log(`  optimized ${file} -> optimized/${outName}`);
    } catch (e) {
      console.warn(`  could not optimize ${file}: ${e.message}`);
    }
  }

  return optimized;
}

async function main() {
  try {
    const photoFiles = (await readdir(photosDir).catch(() => [])).filter((f) =>
      valid.has(extname(f).toLowerCase())
    );

    const optimized = await optimizePhotos(photoFiles);

    const images = photoFiles.map((f) => ({
      // Prefer the downscaled copy; fall back to the original if sharp
      // couldn't process it for any reason.
      src: optimized.get(f) ?? `/photos/${f}`,
      alt: f.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
    }));
    await writeFile(galleryOutFile, JSON.stringify(images, null, 2));
    console.log(`Generated gallery.json with ${images.length} images`);

    // Posts feed (images + videos) from /public/posts
    const postFiles = await readdir(postsDir).catch(() => []);
    const imageExt = valid;
    const videoExt = new Set(['.mp4', '.webm']);
    const posts = postFiles
      .filter((f) => imageExt.has(extname(f).toLowerCase()) || videoExt.has(extname(f).toLowerCase()))
      .sort((a, b) => b.localeCompare(a))
      .map((f) => {
        const ext = extname(f).toLowerCase();
        const type = imageExt.has(ext) ? 'image' : 'video';
        return {
          src: `/posts/${f}`,
          type,
          alt: f.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
          id: f,
        };
      });
    await writeFile(postsOutFile, JSON.stringify(posts, null, 2));
    console.log(`Generated posts.json with ${posts.length} posts`);
  } catch (e) {
    console.error('Gallery generation failed', e);
    process.exit(1);
  }
}

await main();
