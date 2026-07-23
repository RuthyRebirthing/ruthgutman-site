function ruthySummary(p, approveUrl) {
  return '' +
    'הזמנת שובר מתנה חדשה\n' +
    'רוכש/ת: ' + s(p.buyerName) + '\n' +
    'מקבל/ת: ' + s(p.recipientName) + '\n' +
    'קבלת הקופון: ' + s(p.deliveryMethod) + '\n' +
    'טלפון: ' + s(p.buyerPhone) + '\n' +
    'מייל: ' + s(p.buyerEmail) + '\n' +
    'סכום: ' + (p.amount || CFG.AMOUNT) + ' shekel\n' +
    'לאישור ושליחת הקופון:\n' + approveUrl;
}

function ruthyMailDetails(p) {
  return '' +
    '<h2 style="color:' + TEAL + '">הזמנת שובר מתנה חדשה</h2>' +
    '<table style="border-collapse:collapse;font-size:15px">' +
    tr('רוכש/ת', s(p.buyerName)) + tr('מקבל/ת', s(p.recipientName)) +
    tr('קבלת הקופון', s(p.deliveryMethod)) +
    tr('טלפון', s(p.buyerPhone)) + tr('מייל', s(p.buyerEmail)) +
    tr('ברכה', s(p.greeting)) + tr('סכום', (p.amount || CFG.AMOUNT) + ' shekel') +
    '</table>';
}

function ruthyMailAction(approveUrl) {
  return '' +
    '<p style="margin:24px 0 10px;color:#4A6E70">ודאי שהתשלום התקבל בביט, ואז לחצי:</p>' +
    '<a href="' + approveUrl + '" style="display:inline-block;background:' + TEAL +
    ';color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 34px;border-radius:12px">' +
    'אשר ושלח את הקופון</a>' +
    '<p style="color:#8aa;margin-top:22px;font-size:12px">אם לא שולם - התעלמי מהמייל.</p>';
}

function notifyRuthy(rowNum, token, p) {
  var approveUrl = webUrl() + '?action=approve&row=' + rowNum + '&token=' + token;
  var mail = '<div dir="rtl" style="font-family:Arial;max-width:520px;margin:auto;color:' + INK + '">' +
    ruthyMailDetails(p) + ruthyMailAction(approveUrl) + '</div>';
  MailApp.sendEmail({ to: CFG.RUTHY_EMAIL, subject: 'הזמנת קופון חדשה - ' + s(p.buyerName), htmlBody: mail });
  if (CFG.CALLMEBOT_APIKEY && CFG.CALLMEBOT_APIKEY.indexOf('REPLACE') === -1) {
    try {
      var url = 'https://api.callmebot.com/whatsapp.php?phone=' + CFG.RUTHY_WHATSAPP +
        '&apikey=' + CFG.CALLMEBOT_APIKEY +
        '&text=' + encodeURIComponent(ruthySummary(p, approveUrl));
      UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    } catch (e) {}
  }
}

function approvedPage(d, fresh) {
  var couponUrl = webUrl() + '?action=coupon&row=' + d.row + '&token=' + d.token;
  var waText = 'שלום ' + d.recipientName + '! קיבלת שובר מתנה לטיפול ריברסינג ' +
               'הנה השובר שלך (מס׳ ' + d.serial + '): ' + couponUrl;
  var waLink = 'https://wa.me/' + toIntl(d.buyerPhone) + '?text=' + encodeURIComponent(waText);
  var title = fresh ? 'נשלח!' : 'כבר אושר קודם';

  var status = d.buyerEmail
    ? (fresh ? 'נשלח למייל ' + d.buyerEmail : 'הונפק כבר עבור ' + d.buyerEmail)
    : (d.buyerPhone ? 'מוכן לשליחה בוואטסאפ ל-' + d.buyerPhone : 'הונפק');

  var waBtn = d.buyerPhone
    ? '<a href="' + waLink + '" target="_blank" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;padding:13px 30px;border-radius:12px;font-size:16px;margin:6px">שלח/י ללקוח בוואטסאפ</a> '
    : '';

  var html =
    '<div dir="rtl" style="font-family:Arial;max-width:560px;margin:30px auto;color:' + INK + ';text-align:center">' +
    '<h1 style="color:' + TEAL + '">' + title + '</h1>' +
    '<p style="font-size:17px">קופון מס׳ <b>' + d.serial + '</b> ' + status + '.</p>' +
    '<div style="margin:22px 0">' + couponInline(d) + '</div>' +
    waBtn +
    '<a href="' + couponUrl + '" target="_blank" style="display:inline-block;background:' + TEAL + ';color:#fff;text-decoration:none;font-weight:bold;padding:13px 30px;border-radius:12px;font-size:16px;margin:6px">פתח/י את הקופון</a>' +
    '</div>';
  return HtmlService.createHtmlOutput(html);
}

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

