import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminCookieOptions,
  passwordConfigured,
  passwordMatches,
  signAdminToken,
} from '../../../../src/lib/adminAuth';
import { rateLimit } from '../../../../src/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Throttle password guessing: 8 attempts per IP per 15 minutes.
  const limited = rateLimit(req, 'admin-login', 8, 15 * 60_000);
  if (limited) return limited;

  if (!passwordConfigured()) {
    return NextResponse.json({ message: 'Admin password not configured' }, { status: 500 });
  }
  try {
    const { password } = await req.json();
    if (!password || typeof password !== 'string' || password.length > 512) {
      return NextResponse.json({ message: 'Password required' }, { status: 400 });
    }
    if (!passwordMatches(password)) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const token = signAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, { ...adminCookieOptions, maxAge: ADMIN_COOKIE_MAX_AGE });
    return res;
  } catch {
    return NextResponse.json({ message: 'Bad request' }, { status: 400 });
  }
}
