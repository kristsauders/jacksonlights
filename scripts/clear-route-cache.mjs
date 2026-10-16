// Runs before every `next start` (npm "prestart").
//
// Next keeps a persisted route cache in .next/server/route-cache, keyed by route
// rather than by build. Azure App Service deploys by copying the new build over
// the existing .next without deleting anything, so the previous build's cached
// pages survive and keep being served after a deploy, even though the fresh
// HTML is sitting right next to them. The cache is derived data that Next
// re-creates from the build output at startup, so it is always safe to clear.
import { rmSync } from 'node:fs';

rmSync(new URL('../.next/server/route-cache', import.meta.url), { recursive: true, force: true });
console.log('prestart: cleared .next/server/route-cache');
