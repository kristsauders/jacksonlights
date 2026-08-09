// Lightweight in-memory rate limiter.
//
// The site runs as a single Node process on Azure App Service, so module-level
// state is shared across all requests. If you ever scale out to multiple
// instances each one keeps its own counters (limits become per-instance) —
// still fine for abuse control on a site this size.

interface Bucket { count: number; resetAt: number; }

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

// Drop expired buckets occasionally so the map can't grow without bound.
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
  // Hard ceiling in case of a flood from many distinct IPs.
  if (buckets.size > 20_000) buckets.clear();
}

/**
 * Fixed-window limiter. Returns null when allowed, or a 429 response when the
 * caller has exceeded `limit` requests inside `windowMs`.
 */
export function rateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs: number
): Response | null {
  const now = Date.now();
  sweep(now);

  const key = `${name}:${clientIp(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return new Response(
    JSON.stringify({ message: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'Cache-Control': 'no-store',
      },
    }
  );
}

/**
 * Best-effort client IP.
 *
 * Azure Front Door sets `X-Azure-ClientIP` to the real client address and
 * appends to `X-Forwarded-For`. Both are trivially spoofable if the App
 * Service origin is reachable directly — see README "Locking the origin to
 * Front Door" for the access restriction that makes these trustworthy.
 */
export function clientIp(req: Request): string {
  const azure = req.headers.get('x-azure-clientip');
  if (azure) return azure.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // Left-most entry is the original client; strip any :port suffix Azure adds.
    const first = forwarded.split(',')[0].trim();
    const withoutPort = first.replace(/:\d+$/, '');
    if (withoutPort) return withoutPort;
  }

  return 'unknown';
}
