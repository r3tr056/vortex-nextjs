import { clean, createRateLimiter, forwardToSheet, readJsonObject } from '@/lib/sheets';

// Anonymous booth-AR funnel events (sendBeacon batches) → Google Sheet ("Events" tab).
// Analytics must never break the experience, so every path ends in 204.

const MAX_EVENTS = 40;
const MAX_BYTES = 20_000;
const limited = createRateLimiter(60_000, 12);

export async function POST(req: Request) {
  if (limited(req)) return new Response(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(req, MAX_BYTES);
  } catch {
    return new Response(null, { status: 204 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : [];
  if (!events.length) return new Response(null, { status: 204 });

  const session = clean(body.sessionId, 64);
  const drone = clean(body.drone, 20);
  const platform = clean(body.platform, 20);
  const src = clean(body.src, 60);
  const anchorMode = clean(body.anchorMode, 20);
  const rows = events.map((e) => {
    const ev = (e ?? {}) as Record<string, unknown>;
    const ts = typeof ev.t === 'number' && Number.isFinite(ev.t) ? new Date(ev.t) : new Date();
    const t = Number.isNaN(ts.getTime()) ? new Date().toISOString() : ts.toISOString();
    let detail = '';
    try {
      detail = ev.detail ? clean(JSON.stringify(ev.detail), 500) : '';
    } catch {
      detail = '';
    }
    return [t, session, drone, clean(ev.event, 40), detail, anchorMode, platform, src];
  });

  try {
    const result = await forwardToSheet({ type: 'events', rows }, 6000);
    if (!result.ok && result.reason === 'not_configured' && process.env.NODE_ENV !== 'production') {
      console.info(`[ar-track] ${rows.map((r) => r[3]).join(', ')}`);
    }
  } catch {
    // Best effort only.
  }
  return new Response(null, { status: 204 });
}
