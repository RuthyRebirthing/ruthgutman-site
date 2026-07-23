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
