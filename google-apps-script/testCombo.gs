function testS() {
  var p = { buyerName: 'a', recipientName: 'b', buyerPhone: 'c', buyerEmail: 'd', amount: 250 };
  var approveUrl = 'https://example.com/exec';
  var summary =
    'הזמנת שובר מתנה חדשה\n' +
    'רוכש/ת: ' + p.buyerName + '\n' +
    'מקבל/ת: ' + p.recipientName + '\n' +
    'טלפון: ' + p.buyerPhone + '\n' +
    'מייל: ' + p.buyerEmail + '\n' +
    'סכום: ' + p.amount + ' shekel\n' +
    'לאישור ושליחת הקופון:\n' + approveUrl;
  return summary;
}
function testM() {
  var approveUrl = 'https://example.com/exec';
  var mail =
    '<div dir="rtl" style="font-family:Arial;max-width:520px;margin:auto;color:#123B3E">' +
    '<h2 style="color:#0E6A70">הזמנת שובר מתנה חדשה</h2>' +
    '<p style="margin:24px 0 10px;color:#4A6E70">ודאי שהתשלום התקבל בביט, ואז לחצי:</p>' +
    '<a href="' + approveUrl + '" style="display:inline-block;background:#0E6A70;color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 34px;border-radius:12px">' +
    'אשר ושלח את הקופון</a>' +
    '</div>';
  return mail;
}
function testX(p) {
  var mail =
    '<table style="border-collapse:collapse;font-size:15px">' +
    tr('רוכש/ת', p.buyerName) + tr('מקבל/ת', p.recipientName) +
    tr('קבלת הקופון', p.deliveryMethod) +
    tr('טלפון', p.buyerPhone) + tr('מייל', p.buyerEmail) +
    tr('ברכה', p.greeting) + tr('סכום', p.amount + ' shekel') +
    '</table>' +
    '<p style="color:#8aa;margin-top:22px;font-size:12px">אם לא שולם - התעלמי מהמייל ולא יישלח דבר.</p>';
  return mail;
}
