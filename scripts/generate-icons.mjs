#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
await fs.promises.mkdir(iconsDir, { recursive: true });

// Base simple SVG (gradient + JL letters) - if you want to replace, drop a logo.svg in public/icons/base.svg
const baseSvgPath = path.join(iconsDir, 'base.svg');
if (!fs.existsSync(baseSvgPath)) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#119B68'/><stop offset='100%' stop-color='#c09200'/></linearGradient></defs>
  <rect rx='96' ry='96' x='0' y='0' width='512' height='512' fill='url(#g)'/>
  <text x='50%' y='54%' font-family='system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif' font-size='250' font-weight='800' text-anchor='middle' fill='#fff'>JL</text>
</svg>`;
  await fs.promises.writeFile(baseSvgPath, svg, 'utf8');
}

const sizes = [192, 512];
for (const size of sizes) {
  const out = path.join(iconsDir, `icon-${size}.png`);
  await sharp(baseSvgPath).resize(size, size).png().toFile(out);
}
// Maskable variant (keep padding)
await sharp(path.join(iconsDir,'base.svg')).resize(512,512, { fit:'contain', background:{ r:0, g:0, b:0, alpha:0 } }).png().toFile(path.join(iconsDir,'maskable-512.png'));

console.log('Icons generated to /public/icons');
