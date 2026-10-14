import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from './storagePaths';

// All mutable site data lives here. It is gitignored so deploys never clobber
// production data (see docs/DATA_PERSISTENCE.md).
export { DATA_DIR };

export function dataPath(file: string): string {
  return path.join(DATA_DIR, file);
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(dataPath(file), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function atomicWrite(file: string, data: unknown): Promise<void> {
  // mkdir here so a fresh deploy with no data/ directory still works — the
  // previous code threw ENOENT and every submission returned a 500.
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = dataPath(file);
  const tmp = `${target}.${process.pid}.tmp`;
  // Write to a sibling temp file then rename, so a crash mid-write can't leave
  // a truncated JSON file behind.
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, target);
}

// Serialise access per file. Route handlers run concurrently, and two
// overlapping read-modify-write cycles previously raced each other (one
// update silently lost). Chaining every operation on a per-file promise
// removes that.
const chains = new Map<string, Promise<unknown>>();

function enqueue<T>(file: string, task: () => Promise<T>): Promise<T> {
  const previous = chains.get(file) ?? Promise.resolve();
  const run = previous.then(task, task);
  // Swallow rejections on the stored chain so one failure doesn't poison
  // every later write, while still surfacing the error to this caller.
  chains.set(file, run.catch(() => undefined));
  return run;
}

export function writeJson(file: string, data: unknown): Promise<void> {
  return enqueue(file, () => atomicWrite(file, data));
}

/**
 * Read, modify and write a JSON file without interleaving with other updates
 * to the same file.
 */
export function updateJson<T>(
  file: string,
  fallback: T,
  mutate: (current: T) => T
): Promise<T> {
  return enqueue(file, async () => {
    const current = await readJson<T>(file, fallback);
    const updated = mutate(current);
    await atomicWrite(file, updated);
    return updated;
  });
}
