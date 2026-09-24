import { NextResponse } from 'next/server';
import { clean, forwardToSheet } from '@/lib/sheets';

// Demo requests from the booth AR and the site contact form → Google Sheet ("Leads" tab).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  // Honeypot (an obscure name so browser AutoFill leaves it alone). Bots fill every field; pretend
  // success so they don't retry, but log it in case a real lead was caught.
  if (clean(body.fax_extension, 200)) {
    console.warn('[leads] honeypot hit', clean(body.email, 160));
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
    console.info('[leads] LEADS_WEBHOOK_URL not set; lead not stored (dev only):', lead);
    return NextResponse.json({ ok: true, dev: true });
  }
  // Keep the lead recoverable from the Vercel logs if the sheet is unavailable.
  console.error('[leads] forwarding failed:', result.reason, JSON.stringify(lead));
  return NextResponse.json({ ok: false, error: result.reason }, { status: 502 });
}
