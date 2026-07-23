
/* ---------- מסך "אושר" לרותי (עם כפתור שליחה בוואטסאפ ללקוח) ---------- */
function approvedPage(d, fresh) {
  var couponUrl = webUrl() + '?action=coupon&row=' + d.row + '&token=' + d.token;
  var waText = 'שלום ' + d.recipientName + '! קיבלת שובר מתנה לטיפול ריברסינג ' +
               'הנה השובר שלך (מס׳ ' + d.serial + '): ' + couponUrl;
  var waLink = 'https://wa.me/' + toIntl(d.buyerPhone) + '?text=' + encodeURIComponent(waText);
  var title = fresh ? 'נשלח!' : 'כבר אושר קודם';

  var html =
    '<div dir="rtl" style="font-family:Arial;max-width:560px;margin:30px auto;color:' + INK + ';text-align:center">' +
    '<h1 style="color:' + TEAL + '">' + title + '</h1>' +
    '<p style="font-size:17px">קופון מס׳ <b>' + d.serial + '</b> ' +
    (fresh ? 'נשלח למייל ' + d.buyerEmail : 'הונפק כבר עבור ' + d.buyerEmail) + '.</p>' +
    '<div style="margin:22px 0">' + couponInline(d) + '</div>' +
    '<a href="' + waLink + '" target="_blank" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;padding:13px 30px;border-radius:12px;font-size:16px;margin:6px">שלח/י ללקוח בוואטסאפ</a> ' +
    '<a href="' + couponUrl + '" target="_blank" style="display:inline-block;background:' + TEAL + ';color:#fff;text-decoration:none;font-weight:bold;padding:13px 30px;border-radius:12px;font-size:16px;margin:6px">פתח/י את הקופון</a>' +
    '</div>';
  return HtmlService.createHtmlOutput(html);
}

/* ---------- דף הקופון הציבורי (הורדה/הדפסה) ---------- */
function showCoupon(p, x) {
  var sh = sheet();
  var d = readRow(sh, parseInt(p.row, 10));
  if (!d || d.token !== p.token || d.status !== 'אושר') return page('שובר', 'השובר אינו זמין.');
  var html =
    '<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>שובר מתנה מס׳ ' + d.serial + '</title>' +
    '<style>body{font-family:Arial,Helvetica,sans-serif;background:' + CREAM + ';margin:0;padding:24px}' +
    '.bar{max-width:640px;margin:0 auto 18px;text-align:center}' +
    '.btn{display:inline-block;background:' + TEAL + ';color:#fff;text-decoration:none;font-weight:bold;padding:12px 26px;border-radius:12px;margin:4px;border:0;font-size:15px;cursor:pointer}' +
    '@media print{.bar{display:none}body{background:#fff;padding:0}}</style></head><body>' +
    '<div class="bar"><button class="btn" onclick="window.print()">הורדה / הדפסה (PDF)</button></div>' +
    couponInline(d) +
    '</body></html>';
  return HtmlService.createHtmlOutput(html).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ================= עיצוב הקופון (טבלאי - תואם מייל) ================= */
function couponInline(d) {
  var valid = validUntil(d.issued);
  var greet = d.greeting ? d.greeting : '';
  return '' +
  '<table role="presentation" cellpadding="0" cellspacing="0" style="width:640px;max-width:96%;margin:0 auto;border-collapse:separate;background:#ffffff;border:2px solid ' + GOLD + ';border-radius:18px;overflow:hidden;box-shadow:0 18px 46px rgba(12,70,75,.18)">' +
    // פס עליון
    '<tr><td style="background:' + TEAL_D + ';background:linear-gradient(135deg,' + TEAL + ',' + TEAL_D + ');padding:22px 26px;text-align:center">' +
      '<div style="color:' + GOLD + ';font-size:13px;letter-spacing:2px;font-weight:bold">Breathe &middot; Release &middot; Renew</div>' +
      '<div style="color:#fff;font-size:28px;font-weight:800;margin-top:6px">שובר מתנה</div>' +
      '<div style="color:#CDE9E6;font-size:15px;margin-top:4px">טיפול ריברסינג - נשימה טיפולית</div>' +
    '</td></tr>' +
    // גוף
    '<tr><td style="padding:26px 30px;text-align:center;color:' + INK + '">' +
      '<div style="font-size:15px;color:#4A6E70">לכבוד</div>' +
      '<div style="font-size:26px;font-weight:800;color:' + TEAL_D + ';margin:4px 0 2px">' + esc(d.recipientName) + '</div>' +
      (greet ? '<div style="font-size:15px;color:#4A6E70;font-style:italic;margin:8px auto;max-width:420px">"' + esc(greet) + '"</div>' : '') +
      '<div style="font-size:16px;color:' + INK + ';margin-top:14px">מפגש ריברסינג אישי מלא</div>' +
      '<div style="font-size:16px;color:' + TEAL + ';font-weight:700;margin-top:12px">באהבה, ליהנות מכל נשימה <span style="color:#1FA0A6">&#9829;</span></div>' +
    '</td></tr>' +
    // קו מנוקב
    '<tr><td style="padding:0 24px"><div style="border-top:2px dashed #CBD9D7;height:1px"></div></td></tr>' +
    // תחתית: מספר סידורי + תוקף
    '<tr><td style="padding:16px 30px 22px">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%"><tr>' +
        '<td style="text-align:right;vertical-align:middle">' +
          '<div style="font-size:12px;color:#8aa">מספר סידורי</div>' +
          '<div style="font-size:24px;font-weight:800;color:' + GOLD + ';letter-spacing:2px">מס׳ ' + d.serial + '</div>' +
        '</td>' +
        '<td style="text-align:left;vertical-align:middle">' +
          '<div style="font-size:12px;color:#8aa">בתוקף עד</div>' +
          '<div style="font-size:17px;font-weight:700;color:' + INK + '">' + valid + '</div>' +
        '</td>' +
      '</tr></table>' +
    '</td></tr>' +
    // רגל
    '<tr><td style="background:' + CREAM + ';padding:14px 26px;text-align:center;border-top:1px solid #E1EFEC">' +
      '<div style="font-size:14px;color:' + INK + ';font-weight:bold">' + CFG.BIZ_NAME + '</div>' +
      '<div style="font-size:13px;color:#4A6E70">לתיאום: ' + CFG.BIZ_PHONE + ' - ' + CFG.BIZ_SITE + '</div>' +
    '</td></tr>' +
  '</table>';
}

function couponEmail(d) {
  var couponUrl = webUrl() + '?action=coupon&row=' + d.row + '&token=' + d.token;
  return '<div dir="rtl" style="font-family:Arial;background:' + CREAM + ';padding:26px">' +
    '<p style="text-align:center;color:' + INK + ';font-size:16px;max-width:560px;margin:0 auto 20px">' +
    'שלום ' + esc(d.recipientName) + ', קיבלת שובר מתנה להלן השובר שלך:</p>' +
    couponInline(d) +
    '<p style="text-align:center;margin:22px 0"><a href="' + couponUrl +
    '" style="display:inline-block;background:' + TEAL + ';color:#fff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:12px">להורדה והדפסה של השובר</a></p>' +
    '<p style="text-align:center;color:#8aa;font-size:12px">לתיאום המפגש: ' + CFG.BIZ_PHONE + '</p></div>';
}

/* ===================== עזרי מערכת ===================== */
function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('הזמנות') || ss.insertSheet('הזמנות');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['תאריך','רוכש','מקבל','טלפון','מייל','ברכה','סכום','סטטוס','מס׳ סידורי','טוקן','הונפק']);
    sh.setFrozenRows(1);
  }
  return sh;
}
function readRow(sh, rowNum) {
  if (!rowNum || rowNum < 2 || rowNum > sh.getLastRow()) return null;
  var r = sh.getRange(rowNum, 1, 1, 11).getValues()[0];
  return {
    row: rowNum, date: r[0], buyerName: r[1], recipientName: r[2], buyerPhone: r[3],
    buyerEmail: r[4], greeting: r[5], amount: r[6], status: r[7], serial: r[8],
    token: String(r[9]), issued: r[10] || new Date()
  };
}
function nextSerial() {
  var props = PropertiesService.getScriptProperties();
  var last = parseInt(props.getProperty('lastSerial'), 10);
  var serial = isNaN(last) ? CFG.START_SERIAL : last + 1;
  props.setProperty('lastSerial', String(serial));
  return serial;
}
function validUntil(issued) {
  var d = new Date(issued);
  d.setMonth(d.getMonth() + CFG.VALID_MONTHS);
  return Utilities.formatDate(d, 'Asia/Jerusalem', 'dd/MM/yyyy');
}
function webUrl() { return ScriptApp.getService().getUrl(); }
function toIntl(phone) {
  var p = String(phone).replace(/\D/g, '');
  if (p.indexOf('972') === 0) return p;
  if (p.indexOf('0') === 0) return '972' + p.substring(1);
  return '972' + p;
}
function s(v) { return v == null ? '' : String(v).trim(); }
function esc(v) { return s(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function tr(k, v) { return '<tr><td style="padding:4px 10px;color:#8aa">' + k + '</td><td style="padding:4px 10px;font-weight:bold">' + esc(v) + '</td></tr>'; }
function ok(msg) { return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT); }
function page(t, m) { return HtmlService.createHtmlOutput('<div dir="rtl" style="font-family:Arial;text-align:center;padding:50px;color:#123B3E"><h2>' + t + '</h2><p>' + m + '</p></div>'); }
