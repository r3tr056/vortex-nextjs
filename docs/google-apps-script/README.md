# Leads + AR analytics → Google Sheet

The website posts demo requests (booth AR + the site contact form) and anonymous AR funnel
events to a Google Apps Script web app, which appends them to a Google Sheet. About 10 minutes.

## 1. Create the sheet and script

1. Create a new Google Sheet, e.g. **Vortex — Leads & AR**.
2. **Extensions → Apps Script**. Replace the default code with [`leads.gs`](./leads.gs). Save.
3. **Project Settings (gear) → Script Properties → Add script property**
   - Property: `WEBHOOK_SECRET`
   - Value: a long random string (e.g. 40+ characters from a password generator). Keep it for step 3.

## 2. Deploy it as a web app

1. **Deploy → New deployment → Select type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (the secret is what protects it)
2. Authorise when prompted, then copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).

If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the URL
stays the same.

## 3. Add the environment variables on Vercel

Project → Settings → Environment Variables (Production + Preview):

| Name | Value |
|---|---|
| `LEADS_WEBHOOK_URL` | the Web app URL from step 2 |
| `LEADS_WEBHOOK_SECRET` | the same secret as the script property |

Redeploy. For local development put the same two lines in `.env.local`.

## What lands in the sheet

- **Leads** tab: time, name, organisation, email, phone, inquiry type, interest, message, NDA,
  source (`ar-sentinel`, `ar-ranger`, `site-contact`), user agent, referer.
- **Events** tab: one row per AR event — `page_open`, `start`, `ready`, `anchored` (standee / floor /
  preview), `sequence_start`, `sequence_skip`, `sequence_complete`, `flight_start`, `mission_start`,
  `target_locked`, `mission_complete`, `cta_open`, `cta_click`, `photo`, `lead_submitted`, `error`.
  Group by Session to see the funnel per visitor. Set the qrfy destinations to
  `/ar/sentinel?src=booth-qr` and `/ar/ranger?src=booth-qr` to tell booth scans apart from shares.

Without the env vars, leads return an error in production (the form tells the visitor to use
WhatsApp/email instead) and are only logged to the console in development.
