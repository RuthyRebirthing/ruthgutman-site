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
