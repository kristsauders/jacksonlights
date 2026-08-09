import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '../../../../src/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Attributes must match the ones used at login or the browser keeps the
  // original cookie alongside the cleared one.
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0, expires: new Date(0) });
  return res;
}
