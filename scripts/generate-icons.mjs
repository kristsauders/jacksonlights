#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
await fs.promises.mkdir(iconsDir, { recursive: true });

// Base mark: a string of holiday lights on a rounded pine-green badge, using
// the same brand colors as tailwind.config.js. The mark is kept within the
// centered ~70% safe zone (leftmost/topmost content sits well inside the
// standard 80%-diameter maskable safe circle), so the same file works
// directly for the maskable PWA icon too — no separate padded variant needed.
const baseSvgPath = path.join(iconsDir, 'base.svg');
const defaultSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='108' ry='108' fill='#0F3B2E'/>
  <path d='M96 176 C 176 224, 336 224, 416 176' fill='none' stroke='#F5E9D3' stroke-opacity='0.55' stroke-width='10' stroke-linecap='round'/>
  <g stroke='#F5E9D3' stroke-opacity='0.55' stroke-width='8' stroke-linecap='round'>
    <line x1='168' y1='202' x2='168' y2='236'/>
    <line x1='256' y1='222' x2='256' y2='260'/>
    <line x1='344' y1='202' x2='344' y2='236'/>
  </g>
  <circle cx='168' cy='266' r='34' fill='#E2C044'/>
  <circle cx='256' cy='300' r='38' fill='#BF2C31'/>
  <circle cx='344' cy='266' r='34' fill='#008B6B'/>
</svg>`;
if (!fs.existsSync(baseSvgPath)) {
  await fs.promises.writeFile(baseSvgPath, defaultSvg, 'utf8');
}

// icon-192/512 feed the PWA manifest; maskable-512 is the same mark (see note
// above); favicon-32/16 are raster fallbacks for contexts that don't read
// favicon.svg directly (most modern browsers do, and use that instead).
const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'maskable-512.png', size: 512 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon-16.png', size: 16 },
];

for (const { file, size } of targets) {
  await sharp(baseSvgPath).resize(size, size).png().toFile(path.join(iconsDir, file));
}

console.log(`Generated ${targets.map((t) => t.file).join(', ')} in /public/icons`);
console.log('Open public/icons/base.svg (or public/favicon.svg) directly in a browser to preview before shipping.');
