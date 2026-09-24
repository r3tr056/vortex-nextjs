// Server-side only (imported by route handlers): forwards leads and AR funnel events to the Google Sheet (Apps Script web app).
// Setup: docs/google-apps-script/README.md. Env: LEADS_WEBHOOK_URL, LEADS_WEBHOOK_SECRET.

export type SheetPayload =
  | { type: 'lead'; lead: Record<string, string> }
  | { type: 'events'; rows: (string | number)[][] };

export type ForwardResult = { ok: true } | { ok: false; reason: 'not_configured' | 'upstream' };

export async function forwardToSheet(payload: SheetPayload, timeoutMs = 25_000): Promise<ForwardResult> {
  const url = process.env.LEADS_WEBHOOK_URL;
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!url || !secret) return { ok: false, reason: 'not_configured' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      // text/plain keeps Apps Script from rejecting the body; it parses JSON itself.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, secret }),
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
