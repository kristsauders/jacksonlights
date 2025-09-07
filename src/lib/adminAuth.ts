import jwt from 'jsonwebtoken';

// Simple password + JWT based admin auth. Set ADMIN_PASSWORD (required) and optionally ADMIN_JWT_SECRET for signing.
// If ADMIN_JWT_SECRET isn't provided, the password is used as the signing secret (acceptable for small self-hosted usage; can be rotated by changing env vars).

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || ADMIN_PASSWORD || 'change-me-dev-secret';

export function passwordConfigured(){
  return !!ADMIN_PASSWORD;
}

export function passwordMatches(pw:string){
  return passwordConfigured() && pw === ADMIN_PASSWORD;
}

export function signAdminToken(){
  return jwt.sign({ sub:'admin' }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token?:string){
  if (!token) return false;
  try {
    jwt.verify(token, ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
