#!/usr/bin/env node
import { readdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const photosDir = join(process.cwd(), 'public', 'photos');
const postsDir = join(process.cwd(), 'public', 'posts');
const galleryOutFile = join(process.cwd(), 'public', 'gallery.json');
const postsOutFile = join(process.cwd(), 'public', 'posts.json');

const valid = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function main() {
  try {
    const photoFiles = await readdir(photosDir).catch(() => []);
    const images = photoFiles.filter(f => valid.has(extname(f).toLowerCase())).map(f => ({
      src: `/photos/${f}`,
      alt: f.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '')
    }));
    await writeFile(galleryOutFile, JSON.stringify(images, null, 2));
    console.log(`Generated gallery.json with ${images.length} images`);

    // Posts feed (images + videos) from /public/posts
    const postFiles = await readdir(postsDir).catch(() => []);
    const imageExt = valid;
    const videoExt = new Set(['.mp4', '.webm']);
    const posts = postFiles.filter(f => imageExt.has(extname(f).toLowerCase()) || videoExt.has(extname(f).toLowerCase()))
      .sort((a,b) => b.localeCompare(a))
      .map(f => {
        const ext = extname(f).toLowerCase();
        const type = imageExt.has(ext) ? 'image' : 'video';
        return {
          src: `/posts/${f}`,
          type,
          alt: f.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
          id: f
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
