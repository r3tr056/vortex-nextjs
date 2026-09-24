import { NextResponse } from 'next/server';
import { BodyTooLarge, clean, createRateLimiter, forwardToSheet, readJsonObject } from '@/lib/sheets';

// Demo requests from the booth AR and the site contact form → Google Sheet ("Leads" tab).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BYTES = 8_000;
// A real visitor submits once or twice; this only bites on scripted floods.
const limited = createRateLimiter(10 * 60_000, 8);

export async function POST(req: Request) {
  if (limited(req)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(req, MAX_BYTES);
  } catch (err) {
    const tooLarge = err instanceof BodyTooLarge;
    return NextResponse.json({ ok: false, error: tooLarge ? 'too_large' : 'invalid' }, { status: tooLarge ? 413 : 400 });
  }

  // Honeypot (an obscure name so browser AutoFill leaves it alone). Bots fill every field;
  // pretend success so they don't retry.
  if (clean(body.fax_extension, 200)) {
    console.warn('[leads] honeypot hit');
    return NextResponse.json({ ok: true });
  }

  const lead = {
    name: clean(body.name, 120),
    organisation: clean(body.organisation, 160),
    email: clean(body.email, 160),
    phone: clean(body.phone, 40),
    inquiryType: clean(body.inquiryType, 80),
    interest: clean(body.interest, 120),
    message: clean(body.message, 2000),
    nda: body.nda === true || body.nda === 'on' ? 'yes' : '',
    source: clean(body.source, 40) || 'unknown',
    userAgent: clean(req.headers.get('user-agent'), 300),
    referer: clean(req.headers.get('referer'), 300),
  };

  if (!lead.name || !lead.organisation || !EMAIL.test(lead.email)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  const result = await forwardToSheet({ type: 'lead', lead });
  if (result.ok) return NextResponse.json({ ok: true });

  if (result.reason === 'not_configured' && process.env.NODE_ENV !== 'production') {
    console.info('[leads] LEADS_WEBHOOK_URL not set; lead not stored (dev only)');
    return NextResponse.json({ ok: true, dev: true });
  }
  // No personal data in logs: the visitor is told to use WhatsApp/email instead.
  console.error('[leads] forwarding failed', { reason: result.reason, source: lead.source, org: lead.organisation.slice(0, 40) });
  return NextResponse.json({ ok: false, error: result.reason }, { status: 502 });
}
