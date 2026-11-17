/**
 * Joshua & Rochelle wedding RSVPs -> Google Sheet
 *
 * Paste this whole file into Extensions → Apps Script in your Google Sheet,
 * then deploy it as a Web app (see SETUP.md).
 */

var RSVP_TAB = 'RSVPs';
var SUMMARY_TAB = 'Summary';
var HEADERS = [
  'Timestamp', 'Full name', 'Contact', 'Attending',
  'Plus ones (count)', 'Plus one names',
  'Children (count)', 'Children ages',
  'Dietary', 'Staying the night',
  'Singles opt-in', 'Singles: 3 words', 'Singles: ideal date', 'Singles: Instagram', 'Singles consent',
  'Note'
];

/** Called by the website when a guest presses "Send my RSVP". */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // wait up to 20s if another guest is saving at the same moment

    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (d.website) return json_({ ok: true });                 // honeypot filled = spam bot, ignore quietly
    if (!clean_(d.name) || !clean_(d.phone)) return json_({ ok: false, error: 'Missing name or contact number' });

    var sheet = ensureSheets_();
    var yesNo = function (x) { return x === 'Yes' ? 'Yes' : 'No'; };
    var going = d.attending === 'Yes';

    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Singapore', 'yyyy-MM-dd HH:mm:ss'),
      clean_(d.name),
      clean_(d.phone),
      going ? 'Yes' : 'No',
      going ? num_(d.plusCount, 2) : 0,
      clean_(d.plusNames),
      going ? num_(d.kidsCount, 3) : 0,
      clean_(d.kidsAges),
      clean_(d.dietary),
      yesNo(d.stay),
      yesNo(d.singles),
      clean_(d.singlesWords),
      clean_(d.singlesDate),
      clean_(d.singlesInstagram),
      yesNo(d.singlesConsent),
      clean_(d.note)
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Open the web app URL in a browser to check it's live. */
function doGet() {
  return json_({ ok: true, message: 'RSVP endpoint is working' });
}

/**
 * Run this once from the Apps Script editor (select "setup" and press Run).
 * It creates the RSVPs and Summary tabs and asks you to authorise the script.
 */
function setup() {
  ensureSheets_();
}

/* ---------- helpers ---------- */

function ensureSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(RSVP_TAB);
  if (!sheet) sheet = ss.insertSheet(RSVP_TAB, 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#c6d7b2');
    sheet.setFrozenRows(1);
  }

  if (!ss.getSheetByName(SUMMARY_TAB)) {
    var s = ss.insertSheet(SUMMARY_TAB);
    var r = "'" + RSVP_TAB + "'!";
    var rows = [
      ['What', 'Number'],
      ['RSVPs received', '=COUNTA(' + r + 'B2:B)'],
      ['Attending (people who said yes)', '=COUNTIF(' + r + 'D2:D,"Yes")'],
      ['Not attending', '=COUNTIF(' + r + 'D2:D,"No")'],
      ['Plus ones', '=SUMIF(' + r + 'D2:D,"Yes",' + r + 'E2:E)'],
      ['Children', '=SUMIF(' + r + 'D2:D,"Yes",' + r + 'G2:G)'],
      ['TOTAL GUESTS (attending + plus ones + children)', '=B3+B5+B6'],
      ['Interested in staying the night', '=COUNTIFS(' + r + 'D2:D,"Yes",' + r + 'J2:J,"Yes")'],
      ['Singles opted in (with consent)', '=COUNTIFS(' + r + 'K2:K,"Yes",' + r + 'O2:O,"Yes")'],
      ['', ''],
      ['Dietary needs (name → need)', '']
    ];
    s.getRange(1, 1, rows.length, 2).setValues(rows);
    s.getRange('A12').setFormula(
      '=IFERROR(FILTER({' + r + 'B2:B,' + r + 'I2:I},' + r + 'I2:I<>"",' + r + 'D2:D="Yes"),"None yet")'
    );
    s.getRange('A1:B1').setFontWeight('bold').setBackground('#c6d7b2');
    s.getRange('A7:B7').setFontWeight('bold');
    s.getRange('A11').setFontWeight('bold');
    s.setColumnWidth(1, 340);
    s.setColumnWidth(2, 220);
  }
  return sheet;
}

/** Trim, cap the length, and stop text being treated as a formula (e.g. a phone number starting with +). */
function clean_(x) {
  var s = (x === undefined || x === null) ? '' : String(x).trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(x, max) {
  var n = parseInt(x, 10);
  if (isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
