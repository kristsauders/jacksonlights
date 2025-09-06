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

async function rfFetch(path: string, init?: RequestInit) {
  const token = getJwt();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remote Falcon error ${res.status}: ${text}`);
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
