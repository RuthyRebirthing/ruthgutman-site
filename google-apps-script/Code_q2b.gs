// חלק ב' של notifyRuthy - בלוק המייל HTML עם כפתור-קישור
function testMail(approveUrl, p) {
  var mail =
    '<div dir="rtl" style="font-family:Arial;max-width:520px;margin:auto;color:#123B3E">' +
    '<h2 style="color:#0E6A70">הזמנת שובר מתנה חדשה</h2>' +
    '<p style="margin:24px 0 10px;color:#4A6E70">ודאי שהתשלום התקבל בביט, ואז לחצי:</p>' +
    '<a href="' + approveUrl + '" style="display:inline-block;background:#0E6A70' +
    ';color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 34px;border-radius:12px">' +
    'אשר ושלח את הקופון</a>' +
    '<p style="color:#8aa;margin-top:22px;font-size:12px">אם לא שולם - התעלמי מהמייל.</p>' +
    '</div>';
  return mail;
}
