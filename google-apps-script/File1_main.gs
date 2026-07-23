var CFG = {
  RUTHY_EMAIL:      'r0532771754@gmail.com',
  RUTHY_WHATSAPP:   '972532771754',
  CALLMEBOT_APIKEY: 'REPLACE_WITH_CALLMEBOT_KEY',
  START_SERIAL:     1150,
  VALID_MONTHS:     6,
  AMOUNT:           250,
  BIZ_NAME:         'רותי גוטמן - ריברסינג',
  BIZ_PHONE:        '053-2771754',
  BIZ_SITE:         'ruthgutman.co.il'
};

var TEAL = '#0E6A70', TEAL_D = '#0C464B', GOLD = '#D9A94C', CREAM = '#F4FAF8', INK = '#123B3E';

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
    return ok('התקבל');
  }
}

function doGet(e) {
  var a = (e && e.parameter && e.parameter.action) || '';
  if (a === 'approve') return handleApprove(e.parameter);
  if (a === 'coupon')  return showCoupon(e.parameter, false);
  return HtmlService.createHtmlOutput('<div dir="rtl" style="font-family:Arial;padding:40px">שירות שוברי המתנה פעיל</div>');
}

function handleApprove(p) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) {}
  try {
    var sh = sheet();
    var rowNum = parseInt(p.row, 10);
    var data = readRow(sh, rowNum);
    if (!data)               return page('שגיאה', 'הזמנה לא נמצאה.');
    if (data.token !== p.token) return page('שגיאה', 'קישור לא תקין.');

    if (data.status === 'אושר' && data.serial) {
      return approvedPage(data, false);
    }

    var serial = nextSerial();
    var issued = new Date();
    sh.getRange(rowNum, 8).setValue('אושר');
    sh.getRange(rowNum, 9).setValue(serial);
    sh.getRange(rowNum, 11).setValue(issued);
    data.status = 'אושר'; data.serial = serial; data.issued = issued;

    if (data.buyerEmail) sendCouponEmail(data);
    return approvedPage(data, true);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

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

