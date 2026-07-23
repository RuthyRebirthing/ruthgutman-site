/**********************************************************************
 *  שובר מתנה - רותי גוטמן ריברסינג
 *  "המוח" מאחורי דף gift.html: מונה סידורי, יומן הזמנות,
 *  התראה לרותי (מייל + וואטסאפ) עם כפתור "אשר ושלח", והנפקת הקופון.
 *
 *  התקנה מלאה: ראה קובץ "הוראות-הקמה.md" באותה תיקייה.
 **********************************************************************/

/* ===================== הגדרות - למלא =============================== */
var CFG = {
  RUTHY_EMAIL:      'r0532771754@gmail.com',   // לאן נשלחות ההתראות + ממי נשלח הקופון
  RUTHY_WHATSAPP:   '972532771754',            // מספר הוואטסאפ של רותי (בפורמט בינ"ל, בלי +)
  CALLMEBOT_APIKEY: 'REPLACE_WITH_CALLMEBOT_KEY', // מפתח מ-CallMeBot (ראה הוראות שלב 4)
  START_SERIAL:     1150,                       // המספר הסידורי הראשון
  VALID_MONTHS:     6,                          // תוקף הקופון בחודשים
  AMOUNT:           250,                        // מחיר הטיפול (₪)
  BIZ_NAME:         'רותי גוטמן - ריברסינג',
  BIZ_PHONE:        '053-2771754',
  BIZ_SITE:         'ruthgutman.co.il'
};
/* ================================================================== */

var TEAL = '#0E6A70', TEAL_D = '#0C464B', GOLD = '#D9A94C', CREAM = '#F4FAF8', INK = '#123B3E';

/* ---------- קבלת הזמנה חדשה מהאתר (POST) ---------- */
function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var sh = sheet();
    var token = Utilities.getUuid().split('-')[0];
    var now = new Date();

    var row = [
      now,
      s(p.buyerName), s(p.recipientName), s(p.buyerPhone), s(p.buyerEmail),
      s(p.greeting), (p.amount || CFG.AMOUNT),
      'ממתין', '', token, ''
    ];
    sh.appendRow(row);
    var rowNum = sh.getLastRow();

    notifyRuthy(rowNum, token, p);
    return ok('קיבלנו את ההזמנה');
  } catch (err) {
    return ok('התקבל'); // לא חושפים שגיאות ללקוח
  }
}

/* ---------- כפתורי ניהול (GET) ---------- */
function doGet(e) {
  var a = (e && e.parameter && e.parameter.action) || '';
  if (a === 'approve') return handleApprove(e.parameter);
  if (a === 'coupon')  return showCoupon(e.parameter, false);
  return HtmlService.createHtmlOutput('<div dir="rtl" style="font-family:Arial;padding:40px">שירות שוברי המתנה פעיל</div>');
}

/* ---------- אישור ושליחה ---------- */
function handleApprove(p) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {}
  try {
    var sh = sheet();
    var rowNum = parseInt(p.row, 10);
    var data = readRow(sh, rowNum);
    if (!data)               return page('שגיאה', 'הזמנה לא נמצאה.');
    if (data.token !== p.token) return page('שגיאה', 'קישור לא תקין.');

    // כבר אושר בעבר - מציגים שוב בלי לשרוף מספר
    if (data.status === 'אושר' && data.serial) {
      return approvedPage(data, false);
    }

    var serial = nextSerial();
    var issued = new Date();
    sh.getRange(rowNum, 8).setValue('אושר');    // H status
    sh.getRange(rowNum, 9).setValue(serial);    // I serial
    sh.getRange(rowNum, 11).setValue(issued);   // K issuedAt
    data.status = 'אושר'; data.serial = serial; data.issued = issued;

    sendCouponEmail(data);
    return approvedPage(data, true);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/* ---------- שליחת הקופון ללקוח במייל ---------- */
function sendCouponEmail(d) {
  var html = couponEmail(d);
  MailApp.sendEmail({
    to: d.buyerEmail,
    replyTo: CFG.RUTHY_EMAIL,
    name: CFG.BIZ_NAME,
    subject: 'שובר המתנה שלך - טיפול ריברסינג (מס׳ ' + d.serial + ')',
    htmlBody: html
  });
}

/* ---------- התראה לרותי: מייל + וואטסאפ ---------- */
function notifyRuthy(rowNum, token, p) {
  var approveUrl = webUrl() + '?action=approve&row=' + rowNum + '&token=' + token;
  var summary =
    'הזמנת שובר מתנה חדשה\n' +
    'רוכש/ת: ' + s(p.buyerName) + '\n' +
    'מקבל/ת: ' + s(p.recipientName) + '\n' +
    'טלפון: ' + s(p.buyerPhone) + '\n' +
    'מייל: ' + s(p.buyerEmail) + '\n' +
    'סכום: ' + (p.amount || CFG.AMOUNT) + ' ₪\n' +
    'לאישור ושליחת הקופון:\n' + approveUrl;

  // מייל עם כפתור "אשר ושלח"
  var mail =
    '<div dir="rtl" style="font-family:Arial;max-width:520px;margin:auto;color:' + INK + '">' +
    '<h2 style="color:' + TEAL + '">הזמנת שובר מתנה חדשה</h2>' +
    '<table style="border-collapse:collapse;font-size:15px">' +
    tr('רוכש/ת', s(p.buyerName)) + tr('מקבל/ת', s(p.recipientName)) +
    tr('טלפון', s(p.buyerPhone)) + tr('מייל', s(p.buyerEmail)) +
    tr('ברכה', s(p.greeting)) + tr('סכום', (p.amount || CFG.AMOUNT) + ' ₪') +
    '</table>' +
    '<p style="margin:24px 0 10px;color:#4A6E70">ודאי שהתשלום התקבל בביט, ואז לחצי:</p>' +
    '<a href="' + approveUrl + '" style="display:inline-block;background:' + TEAL +
    ';color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 34px;border-radius:12px">' +
    'אשר ושלח את הקופון</a>' +
    '<p style="color:#93a;margin-top:22px;font-size:12px;color:#8aa">אם לא שולם - התעלמי מהמייל ולא יישלח דבר.</p>' +
    '</div>';
  MailApp.sendEmail({ to: CFG.RUTHY_EMAIL, subject: 'הזמנת קופון חדשה - ' + s(p.buyerName), htmlBody: mail });

  // וואטסאפ דרך CallMeBot
  if (CFG.CALLMEBOT_APIKEY && CFG.CALLMEBOT_APIKEY.indexOf('REPLACE') === -1) {
    try {
      var url = 'https://api.callmebot.com/whatsapp.php?phone=' + CFG.RUTHY_WHATSAPP +
        '&apikey=' + CFG.CALLMEBOT_APIKEY +
        '&text=' + encodeURIComponent(summary);
      UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    } catch (e) {}
  }
}
