/**
 * Remote Falcon answers a rejected request/vote with HTTP 200-ish JSON carrying
 * a status code in `message` (the external API reports it as 202). Translate the
 * ones a visitor can act on; anything unrecognised becomes a generic line so
 * upstream detail never reaches the browser.
 */
const FRIENDLY: Record<string, string> = {
  ALREADY_VOTED: "You've already voted.",
  DAILY_VOTE_LIMIT_REACHED: "You've used all your votes for tonight.",
  ALREADY_REQUESTED: "That song is already in the queue.",
  QUEUE_FULL: 'The request queue is full right now. Try again in a moment.',
  SEQUENCE_UNAVAILABLE: 'That song just played, so it is resting for a bit. Pick another!',
  SEQUENCE_REQUESTED: 'That song is already in the queue.',
  INVALID_LOCATION: 'You need to be near the show to vote or request songs.',
  NAUGHTY: 'Sorry, that did not go through.',
};

export function friendlyRfMessage(code: unknown): string {
  return (typeof code === 'string' && FRIENDLY[code]) || 'Sorry, that did not go through. Please try again.';
}

/** The `message` field of a Remote Falcon reply, when it rejected the call. */
export function rejection(result: unknown): string | null {
  const message = (result as { message?: unknown } | null)?.message;
  return typeof message === 'string' && message ? friendlyRfMessage(message) : null;
}
