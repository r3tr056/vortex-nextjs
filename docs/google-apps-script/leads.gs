/**
 * Vortex leads + booth-AR analytics sink.
 *
 * Bound to a Google Sheet (Extensions → Apps Script). Receives POSTs from the website's
 * /api/leads and /api/ar/track routes and appends rows to two tabs:
 *   Leads  — demo requests (AR experience + site contact form)
 *   Events — anonymous AR funnel events
 *
 * Setup: see README.md next to this file.
 */

var LEAD_HEADERS = [
  'Received', 'Name', 'Organisation', 'Email', 'Phone', 'Inquiry type', 'Interest',
  'Message', 'NDA', 'Source', 'User agent', 'Referer',
];
var EVENT_HEADERS = ['Time', 'Session', 'Drone', 'Event', 'Detail', 'Anchor', 'Platform', 'Source'];

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorized' });

  // Leads wait for the lock (the website allows 25 s); analytics give up quickly so a busy booth
  // never delays a lead.
  var lock = LockService.getScriptLock();
  var isLead = body.type === 'lead';
  if (!lock.tryLock(isLead ? 20000 : 2000)) return json_({ ok: false, error: 'busy' });
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (body.type === 'lead' && body.lead) {
      var l = body.lead;
      sheet_(ss, 'Leads', LEAD_HEADERS).appendRow([
        new Date(), l.name, l.organisation, l.email, l.phone, l.inquiryType, l.interest,
        l.message, l.nda, l.source, l.userAgent, l.referer,
      ].map(safe_));
    } else if (body.type === 'events' && body.rows && body.rows.length) {
      var sh = sheet_(ss, 'Events', EVENT_HEADERS);
      var rows = body.rows.map(function (r) {
        return EVENT_HEADERS.map(function (_, i) { return safe_(r[i]); });
      });
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, EVENT_HEADERS.length).setValues(rows);
    } else {
      return json_({ ok: false, error: 'bad_type' });
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function sheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sh;
}

/** Stops visitor input from being evaluated as a spreadsheet formula. */
function safe_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v;
  var s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
