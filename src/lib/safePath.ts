import path from 'path';

// Post ids are normally base36 timestamp + random hex, but posts migrated by
// scripts/migrate-posts.mjs use the original filename as the id (e.g.
// "m4x9k2ab.mp4"). Both shapes are accepted; what matters is that a name can
// never escape its directory, so separators, NUL, leading dots and any ".."
// sequence are rejected outright rather than stripped.
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

// Extensions the upload route can produce and the media route may serve.
export const ALLOWED_MEDIA_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.mp4',
  '.mov',
  '.webm',
]);

function isSafeName(value: unknown): value is string {
  return typeof value === 'string' && !value.includes('..') && SAFE_NAME.test(value);
}

export function isValidPostId(id: unknown): id is string {
  return isSafeName(id);
}

export function isValidMediaFilename(name: unknown): name is string {
  if (!isSafeName(name)) return false;
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return false;
  return ALLOWED_MEDIA_EXTENSIONS.has(name.slice(dot).toLowerCase());
}

/**
 * Join `name` onto `dir` and prove the result actually stays inside `dir`.
 *
 * The name checks above should already make traversal impossible; this is the
 * belt-and-braces check so a future change to those rules can't silently turn
 * into arbitrary filesystem access.
 */
export function resolveInside(dir: string, name: string): string | null {
  const base = path.resolve(dir);
  const target = path.resolve(base, name);
  if (target !== base && !target.startsWith(base + path.sep)) return null;
  return target;
}
