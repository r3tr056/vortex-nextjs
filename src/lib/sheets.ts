// Server-side only (imported by route handlers): forwards leads and AR funnel events to the
// Google Sheet (Apps Script web app), plus the request guards both public routes share.
// Setup: docs/google-apps-script/README.md. Env: LEADS_WEBHOOK_URL, LEADS_WEBHOOK_SECRET.

export type SheetPayload =
  | { type: 'lead'; lead: Record<string, string> }
  | { type: 'events'; rows: (string | number)[][] };

export type ForwardResult = { ok: true } | { ok: false; reason: 'not_configured' | 'upstream' };

/** Only ever post the secret and lead data to Google's Apps Script host over HTTPS. */
function webhookUrl(): URL | null {
  const raw = process.env.LEADS_WEBHOOK_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.hostname !== 'script.google.com') return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Stops visitor input being evaluated as a spreadsheet formula (=, +, -, @ …). The Apps Script
 * does the same; this is the second layer.
 */
export function sheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export async function forwardToSheet(payload: SheetPayload, timeoutMs = 25_000): Promise<ForwardResult> {
  const url = webhookUrl();
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: 'not_configured' };
  const safe: SheetPayload =
    payload.type === 'lead'
      ? { type: 'lead', lead: Object.fromEntries(Object.entries(payload.lead).map(([k, v]) => [k, sheetSafe(v)])) }
      : { type: 'events', rows: payload.rows.map((r) => r.map((c) => (typeof c === 'string' ? sheetSafe(c) : c))) };
  try {
    const res = await fetch(url, {
      method: 'POST',
      // text/plain keeps Apps Script from rejecting the body; it parses JSON itself.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...safe, secret }),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return res.ok && json?.ok ? { ok: true } : { ok: false, reason: 'upstream' };
  } catch {
    return { ok: false, reason: 'upstream' };
  }
}

/** Trims, strips control characters and caps length for anything headed to the sheet. */
export function clean(value: unknown, max: number): string {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return '';
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

export class BodyTooLarge extends Error {}

/**
 * Reads a JSON object body, never buffering more than `maxBytes` (checks Content-Length first,
 * then counts while streaming). Throws BodyTooLarge, or SyntaxError for bad JSON / non-objects.
 */
export async function readJsonObject(req: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) throw new BodyTooLarge();
  if (!req.body) throw new SyntaxError('empty body');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new BodyTooLarge();
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new SyntaxError('not an object');
  return parsed as Record<string, unknown>;
}

/**
 * Best-effort, per-instance sliding-window limiter keyed by client IP. Serverless instances don't
 * share memory, so this caps bursts from one client rather than guaranteeing a global limit; the
 * Apps Script lock and Vercel's own protections sit behind it.
 */
export function createRateLimiter(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();
  return (req: Request): boolean => {
    // Vercel sets x-real-ip to the connecting client; x-forwarded-for can be client-supplied.
    const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ?? 'unknown';
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) {
      // Evict expired entries rather than resetting everyone's window.
      for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    return recent.length > max;
  };
}
