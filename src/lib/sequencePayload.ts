export interface SequencePayload {
  sequence: string;
  viewerLatitude?: number;
  viewerLongitude?: number;
}

const MAX_SEQUENCE_NAME = 200;

/**
 * Validate the body of a request/vote call before it is forwarded upstream.
 * Returns null when the payload is unusable.
 */
export function parseSequencePayload(body: unknown): SequencePayload | null {
  if (!body || typeof body !== 'object') return null;
  const { sequence, viewerLatitude, viewerLongitude } = body as Record<string, unknown>;

  if (typeof sequence !== 'string') return null;
  const name = sequence.trim();
  if (!name || name.length > MAX_SEQUENCE_NAME) return null;

  const payload: SequencePayload = { sequence: name };
  if (inRange(viewerLatitude, 90)) payload.viewerLatitude = viewerLatitude as number;
  if (inRange(viewerLongitude, 180)) payload.viewerLongitude = viewerLongitude as number;
  return payload;
}

function inRange(value: unknown, bound: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= bound;
}
