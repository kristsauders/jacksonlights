import jwt from 'jsonwebtoken';

const API_BASE = 'https://remotefalcon.com/remote-falcon-external-api';

interface RequestSequencePayload {
  sequence: string;
  viewerLatitude?: number;
  viewerLongitude?: number;
}

interface RemoteFalconClient {
  getShowDetails: () => Promise<any>;
  requestSequence: (payload: RequestSequencePayload) => Promise<any>;
  voteForSequence: (payload: RequestSequencePayload) => Promise<any>;
}

let cachedToken: { token: string; exp: number } | null = null;

function generateJwt() {
  const accessToken = process.env.REMOTE_FALCON_ACCESS_CODE;
  const secretKey = process.env.REMOTE_FALCON_SECRET_KEY;
  if (!accessToken || !secretKey) throw new Error('Missing Remote Falcon env vars');
  // Short lived token (5 minutes)
  const token = jwt.sign({ accessToken }, secretKey, { algorithm: 'HS256', expiresIn: '5m' });
  const decoded: any = jwt.decode(token);
  return { token, exp: decoded.exp * 1000 };
}

function getJwt(): string {
  const now = Date.now();
  if (!cachedToken || now > cachedToken.exp - 30_000) {
    cachedToken = generateJwt();
  }
  return cachedToken.token;
}

// Don't let a hung upstream hold a request (and an App Service worker) open.
const UPSTREAM_TIMEOUT_MS = 8_000;

async function rfFetch(path: string, init?: RequestInit) {
  const token = getJwt();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  });
  if (!res.ok) {
    // Body text is kept for the server log only — callers turn this into a
    // generic message so upstream detail never reaches the browser.
    const text = await res.text().catch(() => '');
    throw new Error(`Remote Falcon error ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.json();
}

export function getRemoteFalconClient(): RemoteFalconClient {
  return {
    async getShowDetails() {
      return rfFetch('/showDetails');
    },
    async requestSequence(payload: RequestSequencePayload) {
      return rfFetch('/addSequenceToQueue', { method: 'POST', body: JSON.stringify(payload) });
    },
    async voteForSequence(payload: RequestSequencePayload) {
      return rfFetch('/voteForSequence', { method: 'POST', body: JSON.stringify(payload) });
    }
  };
}
