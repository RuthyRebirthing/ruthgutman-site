// חלק א' של notifyRuthy - בלוק הסיכום (טקסט בלבד)
function testSummary(rowNum, token, p) {
  var approveUrl = webUrl() + '?action=approve&row=' + rowNum + '&token=' + token;
  var summary =
    'הזמנת שובר מתנה חדשה\n' +
    'רוכש/ת: ' + s(p.buyerName) + '\n' +
    'מקבל/ת: ' + s(p.recipientName) + '\n' +
    'טלפון: ' + s(p.buyerPhone) + '\n' +
    'מייל: ' + s(p.buyerEmail) + '\n' +
    'סכום: ' + (p.amount || 250) + ' shekel\n' +
    'לאישור ושליחת הקופון:\n' + approveUrl;
  return summary;
}
