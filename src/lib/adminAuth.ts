import { createHash, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';

// Password + JWT based admin auth.
//
// Required env vars:
//   ADMIN_PASSWORD    - the login password
//   ADMIN_JWT_SECRET  - signing secret (optional; falls back to ADMIN_PASSWORD)
//
// There is deliberately NO hardcoded fallback secret. The previous version fell
// back to a literal 'change-me-dev-secret' committed to this repo, which meant
// that on any deploy where ADMIN_PASSWORD/ADMIN_JWT_SECRET were unset, anyone
// could sign their own {sub:'admin'} token and get full admin access.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || ADMIN_PASSWORD || '';

const ALGORITHM = 'HS256' as const;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function passwordConfigured() {
  return ADMIN_PASSWORD.length > 0;
}

/** Constant-time comparison so response timing can't leak the password. */
export function passwordMatches(pw: string) {
  if (!passwordConfigured()) return false;
  if (typeof pw !== 'string') return false;
  // Compare fixed-size digests rather than the raw strings: timingSafeEqual
  // throws on length mismatch, and comparing digests keeps both the timing and
  // the length of the real password out of the response.
  return timingSafeEqual(sha256(pw), sha256(ADMIN_PASSWORD));
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function signAdminToken() {
  if (!ADMIN_JWT_SECRET) throw new Error('Admin auth is not configured');
  return jwt.sign({ sub: 'admin' }, ADMIN_JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

export function verifyAdminToken(token?: string) {
  // No secret configured means no valid tokens exist. Fail closed.
  if (!token || !ADMIN_JWT_SECRET) return false;
  try {
    // Pin the algorithm so a token can't dictate how it is verified.
    const payload = jwt.verify(token, ADMIN_JWT_SECRET, { algorithms: [ALGORITHM] });
    return typeof payload === 'object' && payload !== null && payload.sub === 'admin';
  } catch {
    return false;
  }
}

/** Cookie attributes shared by login and logout so the cookie clears cleanly. */
export const ADMIN_COOKIE = 'admin_token';

export const adminCookieOptions = {
  httpOnly: true,
  // The admin UI is same-origin, so 'strict' costs nothing and removes the
  // residual cross-site request surface that 'lax' leaves open.
  sameSite: 'strict' as const,
  // A Secure cookie is silently dropped by the browser over plain http.
  // NODE_ENV==='production' is also true for a local `npm run start`, which
  // is plain http on a laptop — WEBSITE_SITE_NAME is Azure App Service's own
  // auto-injected env var, so this is only true where we're actually behind
  // Front Door's TLS. Same distinction as `isDeployed` in next.config.js.
  secure: Boolean(process.env.WEBSITE_SITE_NAME),
  path: '/',
};

export const ADMIN_COOKIE_MAX_AGE = TOKEN_TTL_SECONDS;
