import { clean, forwardToSheet } from '@/lib/sheets';

// Anonymous booth-AR funnel events (sendBeacon batches) → Google Sheet ("Events" tab).

const MAX_EVENTS = 40;

// Best-effort per-instance rate limit so one client can't flood the sheet (analytics only;
// dropped batches are acceptable).
const WINDOW_MS = 60_000;
const MAX_BATCHES = 12;
const hits = new Map<string, number[]>();
function rateLimited(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_BATCHES;
}

export async function POST(req: Request) {
  if (rateLimited(req)) return new Response(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > 20_000) return new Response(null, { status: 413 });
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return new Response(null, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
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

  const result = await forwardToSheet({ type: 'events', rows }, 6000);
  if (!result.ok && result.reason === 'not_configured' && process.env.NODE_ENV !== 'production') {
    console.info(`[ar-track] ${rows.map((r) => r[3]).join(', ')}`);
  }
  // Analytics must never break the experience: always 204.
  return new Response(null, { status: 204 });
}
