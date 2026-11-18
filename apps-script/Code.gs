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
  'Dietary', 'Staying the night', 'Song request',
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

    // values by column name, so the row lines up with whatever order the sheet's headers are in
    var values = {
      'Timestamp': Utilities.formatDate(new Date(), 'Asia/Singapore', 'yyyy-MM-dd HH:mm:ss'),
      'Full name': clean_(d.name),
      'Contact': clean_(d.phone),
      'Attending': going ? 'Yes' : 'No',
      'Plus ones (count)': going ? num_(d.plusCount, 2) : 0,
      'Plus one names': clean_(d.plusNames),
      'Children (count)': going ? num_(d.kidsCount, 3) : 0,
      'Children ages': clean_(d.kidsAges),
      'Dietary': clean_(d.dietary),
      'Staying the night': clean_(d.stay) || 'No thanks',          // No thanks / Resort room / Glamping tent
      'Song request': clean_(d.song),
      'Singles opt-in': yesNo(d.singles),
      'Singles: 3 words': clean_(d.singlesWords),
      'Singles: ideal date': clean_(d.singlesDate),
      'Singles: Instagram': clean_(d.singlesInstagram),
      'Singles consent': yesNo(d.singlesConsent),
      'Note': clean_(d.note)
    };
    var headers = headers_(sheet);
    sheet.appendRow(headers.map(function (h) { return values.hasOwnProperty(h) ? values[h] : ''; }));

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
  } else {
    // an older sheet: add any new columns (e.g. "Song request") at the END, so existing rows stay correct
    var have = headers_(sheet);
    HEADERS.forEach(function (h) {
      if (have.indexOf(h) === -1) {
        var col = have.length + 1;
        sheet.getRange(1, col).setValue(h).setFontWeight('bold').setBackground('#c6d7b2');
        have.push(h);
      }
    });
  }

  if (!ss.getSheetByName(SUMMARY_TAB)) {
    var s = ss.insertSheet(SUMMARY_TAB);
    var r = "'" + RSVP_TAB + "'!";
    var hs = headers_(sheet);
    var c = function (name) { return colLetter_(hs.indexOf(name) + 1); };   // column letter for a header
    var B = c('Full name'), D = c('Attending'), E = c('Plus ones (count)'), G = c('Children (count)'),
        I = c('Dietary'), J = c('Staying the night'), K = c('Singles opt-in'), O = c('Singles consent');
    var rows = [
      ['What', 'Number'],
      ['RSVPs received', '=COUNTA(' + r + B + '2:' + B + ')'],
      ['Attending (people who said yes)', '=COUNTIF(' + r + D + '2:' + D + ',"Yes")'],
      ['Not attending', '=COUNTIF(' + r + D + '2:' + D + ',"No")'],
      ['Plus ones', '=SUMIF(' + r + D + '2:' + D + ',"Yes",' + r + E + '2:' + E + ')'],
      ['Children', '=SUMIF(' + r + D + '2:' + D + ',"Yes",' + r + G + '2:' + G + ')'],
      ['TOTAL GUESTS (attending + plus ones + children)', '=B3+B5+B6'],
      ['Staying over: resort room', '=COUNTIFS(' + r + D + '2:' + D + ',"Yes",' + r + J + '2:' + J + ',"Resort room")'],
      ['Staying over: glamping tent', '=COUNTIFS(' + r + D + '2:' + D + ',"Yes",' + r + J + '2:' + J + ',"Glamping tent")'],
      ['Singles opted in (with consent)', '=COUNTIFS(' + r + K + '2:' + K + ',"Yes",' + r + O + '2:' + O + ',"Yes")'],
      ['Dietary needs (name → need)', '']
    ];
    s.getRange(1, 1, rows.length, 2).setValues(rows);
    s.getRange('A12').setFormula(
      '=IFERROR(FILTER({' + r + B + '2:' + B + ',' + r + I + '2:' + I + '},' + r + I + '2:' + I + '<>"",' + r + D + '2:' + D + '="Yes"),"None yet")'
    );
    s.getRange('A1:B1').setFontWeight('bold').setBackground('#c6d7b2');
    s.getRange('A7:B7').setFontWeight('bold');
    s.getRange('A11').setFontWeight('bold');
    s.setColumnWidth(1, 340);
    s.setColumnWidth(2, 220);
  }
  return sheet;
}

/** The sheet's header row, as a list of names. */
function headers_(sheet) {
  var n = sheet.getLastColumn();
  if (n === 0) return [];
  return sheet.getRange(1, 1, 1, n).getValues()[0].map(function (h) { return String(h).trim(); });
}

/** 1 -> A, 27 -> AA */
function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
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
