import { NextRequest, NextResponse } from 'next/server';
import { passwordMatches, passwordConfigured, signAdminToken } from '../../../../src/lib/adminAuth';

export async function POST(req: NextRequest){
  if (!passwordConfigured()) return NextResponse.json({ message:'Admin password not configured' }, { status:500 });
  try {
    const { password } = await req.json();
    if (!password || typeof password !== 'string') return NextResponse.json({ message:'Password required' }, { status:400 });
    if (!passwordMatches(password)) return NextResponse.json({ message:'Invalid credentials' }, { status:401 });
    const token = signAdminToken();
    const res = NextResponse.json({ ok:true });
    res.cookies.set('admin_token', token, { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge: 60*60*24*7 });
    return res;
  } catch {
    return NextResponse.json({ message:'Bad request' }, { status:400 });
  }
}
