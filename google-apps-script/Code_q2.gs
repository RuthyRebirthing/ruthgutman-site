
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
