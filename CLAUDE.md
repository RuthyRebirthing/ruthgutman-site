# CLAUDE.md — אתר רותי גוטמן · ריברסינג

מדריך מבנה מלא לאתר. המטרה: שכל שינוי עתידי ייעשה מהר ונכון, בלי לחקור מחדש.

---

## 1. מה זה האתר

אתר תדמית + שיווק ל**רותי גוטמן**, מטפלת רגשית ב**ריברסינג (נשימה טיפולית)** מאשדוד.
כולל תוכן שיווקי/SEO, טופס יצירת קשר, ומערכת **שובר מתנה** (רכישה בביט + הנפקת קופון סידורי).

- **דומיין חי:** https://ruthgutman.co.il
- **טלפון/וואטסאפ עסקי:** 053-2771754 (בינ"ל: `972532771754`)
- **מייל עסקי:** `r0532771754@gmail.com`
- **קהל:** ילדים, נערות, נשים, אמהות אחרי לידה. שפה: **עברית, RTL בלבד**.

---

## 2. סטאק ואירוח — אין build!

- **HTML/CSS/JS סטטי לגמרי (Vanilla).** אין framework, אין npm, אין שלב build, אין bundler.
- **עריכה = עריכה ישירה של הקובץ.** אחרי עריכה פשוט רענון דפדפן (Ctrl+F5).
- **אירוח:** GitHub Pages מהרפו `RuthyRebirthing/ruthgutman-site` (branch `main`, שורש הרפו).
  קובץ [CNAME](CNAME) מפנה את הדומיין `ruthgutman.co.il` ל-Pages.
- **פרסום לאוויר = `git commit` + `git push` ל-`main`.** GitHub Pages מתעדכן תוך דקה-שתיים.
- כל דף HTML הוא עצמאי ומקושר ל-`assets/style.css`, `assets/a11y.css`, `assets/main.js`, `assets/a11y.js`.

> ⚠️ לפי ההוראות הגלובליות: אחרי כל שינוי בקוד — **לעצור לפני push ולשאול**, אלא אם המשתמש כתב במפורש "תעלה/תדחוף".

---

## 3. מבנה הקבצים

### דפי HTML (שורש הרפו) — 9 דפים

| קובץ | דף | תוכן עיקרי |
|------|-----|-----------|
| [index.html](index.html) | **בית** | הירו וידאו מסך-מלא + לוגו, אינטרו SEO, קטע "מפגש במתנה" (מקשר ל-gift.html) |
| [whatis.html](whatis.html) | מהו ריברסינג | הסבר, בלוק איור+טקסט, grid-3 "מה משתחרר". `body.bg-waves` |
| [poster.html](poster.html) | מתנת הנשימה | "מפת יתרונות" סימטרית: מדליון-לוגו מרכזי + 3 כרטיסים בכל צד + גלי SVG בתחתית |
| [about.html](about.html) | אודותי | ביו של רותי, badges, רצועת "למי מתאים", 6 חוות דעת |
| [faq.html](faq.html) | שאלות נפוצות | 5 שאלות ב-`<details>` אקורדיון + FAQ schema.org |
| [gift.html](gift.html) | **העניקו מתנה** | טופס שובר מתנה 3-שלבים (ראה §6). מכיל CSS+JS inline משלו |
| [contact.html](contact.html) | יצירת קשר | פרטי קשר + טופס Web3Forms (ראה §7) |
| [privacy.html](privacy.html) | מדיניות פרטיות | דף משפטי |
| [accessibility.html](accessibility.html) | הצהרת נגישות | דף משפטי (ת"י 5568) |

### assets/
| קובץ | תפקיד |
|------|-------|
| [assets/style.css](assets/style.css) | **כל העיצוב** (~1290 שורות, מחולק לסקשנים ממוספרים). ראה §5 |
| [assets/main.js](assets/main.js) | לוגיקת UI כללית (ראה §5.2) |
| [assets/a11y.css](assets/a11y.css) | עיצוב ווידג'ט הנגישות + הודעת עוגיות |
| [assets/a11y.js](assets/a11y.js) | ווידג'ט נגישות + cookie bar (ראה §8) |
| `logo_mark.png` | הלוגו (עיגול טורקיז). משמש גם כ-favicon וכ-og fallback |
| `video.mp4` + `video_poster.jpg` | וידאו ההירו של דף הבית (דחוס) |
| `waves-bg.jpg` | רקע ים לדפים עם `bg-waves` |
| `og_share.jpg` | תמונת שיתוף חברתי (1200×630) |

### google-apps-script/ — הבק-אנד של שובר המתנה
| קובץ | תפקיד |
|------|-------|
| [google-apps-script/Code.gs](google-apps-script/Code.gs) | **הקובץ האמיתי היחיד.** כל הלוגיקה של שובר המתנה (ראה §6) |
| [google-apps-script/הוראות-הקמה.md](google-apps-script/הוראות-הקמה.md) | מדריך הקמה/פריסה צעד-אחר-צעד |
| `Code_part1/part2/q1/q2/q2a/q2b.gs` | **פסולת דיבוג** — פיצולים ישנים של Code.gs מבדיקות "בידוד" (תקלת שמירה בעורך Apps Script). לא בשימוש, אפשר להתעלם/למחוק |

### קבצים שמורים / לא-באתר
- [.gitignore](.gitignore) מתעלם מ: `_unused/` (תמונות פוסטר ישנות), `מאמרים לעריכה/` (טיוטות docx של רותי), וקבצים כבדים (`לוגו.png`, `דף הבית.mp4`, `be029251-...png`).
- [robots.txt](robots.txt) — Allow all + הפניה ל-sitemap.
- [sitemap.xml](sitemap.xml) — 9 דפים עם priority/lastmod. **לעדכן lastmod כשמשנים דף.**

---

## 4. תבנית משותפת לכל דף

כל דפי ה-HTML חולקים מבנה זהה. כשמוסיפים/משנים דף — לשמור על העקביות:

1. **`<html lang="he" dir="rtl">`** (דף הבית: גם `class="home"`).
2. **`<head>`** מלא SEO: `title`, `description`, `keywords`, `canonical`, Open Graph, Twitter card, `geo.region/placename`, favicon, `theme-color=#8FC8C2`. חלק מהדפים גם JSON-LD schema.org (`HealthAndBeautyBusiness`, `FAQPage`).
3. **`<header class="nav">`** — זהה בכל הדפים: לוגו+שם, טלפון, ניווט (7 קישורים), כפתור וואטסאפ (desktop+mobile), כפתור המבורגר. הקישור הפעיל מקבל `class="active"`.
   - ⚠️ ה-nav מודבק ידנית בכל דף (אין include). **שינוי בניווט = לעדכן ב-9 הדפים.**
4. **תוכן:** או `<section class="page-head">` (דפים פנימיים) או הירו ייעודי (בית/poster).
5. **`<footer>`** — וריאציות: `footer--center` (לוגו-lockup) או מינימלי.
6. **סקריפטים בסוף:** `main.js`, `a11y.js`, ואז `<script>` קטן שממלא `#yr` (שנה בפוטר).
7. **`class="reveal"`** על אלמנטים שאמורים להופיע בגלילה (עם `d1`/`d2` להשהיה מדורגת).

מספרי וואטסאפ ב-nav כוללים `?text=` עם הודעה מקודדת (URL-encoded): "היי רותי, אני מתעניינת בטיפול ריברסינג ואשמח לקבל פרטים".

---

## 5. מערכת העיצוב (assets/)

### 5.1 style.css — משתני `:root` וסקשנים
**פלטת צבעים (CSS vars):** טורקיז `--teal-900:#0C464B` → `--teal-300`, `--mint-100`, קרם (`--cream`, `--cream-soft`, `--ivory`), **זהב `--gold:#D9A94C`**, טקסט `--ink:#123B3E` / `--muted:#4A6E70`.
**גופן:** `--serif` ו-`--sans` שניהם `Tahoma, Arial, system-ui` (אין Google Fonts — הכל מקומי). `--maxw:1180px`, `--radius:22px`.

**סקשנים עיקריים ב-style.css (לפי הערות ממוספרות):** בסיס/טיפוגרפיה/כפתורים · nav · hero-video (דף בית) · page-head · buttons/btn-wa/btn-primary · reveal · cards/grid-3 · sec-mint · benefits (מפת poster, שורה ~520-670) · footer · **רספונסיביות** (טאבלט ≤, מובייל ≤760, צר ≤480) · **מוטיבים חיים** (רקע מים/גלים/בועות, שורה ~889+) · בלוקים (media-split, gold-emblem, ill-strip, video-box) · about/tst/faq/contact · form-toast.

**כפתורים:** `.btn-primary` (טורקיז), `.btn-wa` (ירוק וואטסאפ), `.btn-bit` (כחול ביט, ב-gift), `.btn-primary` עם svg אייקון.

### 5.2 main.js — נטען בכל דף
- **Navbar shrink** בגלילה (`.scrolled` אחרי 40px).
- **תפריט מובייל** (toggle `.open`).
- **Scroll reveal** דרך `IntersectionObserver` (מוסיף `.in` ל-`.reveal`).
- **FAQ accordion** — רק אחד פתוח בכל רגע (`<details class="faq-item">`).
- **Hero typewords** — כניסת מילים מדורגת בכותרת `h1[data-typewords]` (דף הבית).
- **מוטיבים חיים לדפים פנימיים בלבד** (`if (!isHome)`):
  - שכבת **בועות** מרחפות (`.decor-sky`).
  - **מים אמיתיים ב-WebGL** (shader caustics) שמוזרק כ-`<canvas class="head-water">` לתוך `.page-head` — **אלא אם** ל-body יש `bg-waves` (שם יש תמונת ים סטטית).
  - כיבוד `prefers-reduced-motion` (פריים סטטי), עצירה ב-`visibilitychange`.
  - poster.html נשאר **נקי** ממים בכוונה.

---

## 6. מערכת שובר המתנה (gift.html + Code.gs)

זה החלק המורכב היחיד. שני חלקים:

### 6.1 Frontend — [gift.html](gift.html)
טופס 3-שלבים (CSS+JS **inline** בקובץ עצמו, לא ב-assets):
- **שלב 1 (`#gift-step1`):** פרטי המתנה. שדות: שם רוכש, שם מקבל, **בורר "איך ברצונך לקבל את הקופון?"** (רדיו: מייל / וואטסאפ), שדה מותנה (מייל **או** טלפון לפי הבחירה), ברכה. כפתור "המשך לתשלום בביט".
- **שלב 2 (`#gift-step2`):** אחרי לחיצה — נפתח `BIT_LINK` בטאב חדש + כפתור **"שילמתי ✓"**. (הוסר בכוונה קישור "חזרה לתיקון הפרטים".)
- **שלב 3 (`#gift-step3`):** הודעת הצלחה. הטקסט מתעדכן דינמית לפי אופן הקבלה ("יישלח למייל/לוואטסאפ שהזנת").

**מנגנון השליחה (עוקף CORS):** טופס האישור (`#gift-confirm`) נשלח ב-POST ל-`<iframe name="gift-sink">` נסתר → הדף לא מתחלף, וה-`load` של ה-iframe מפעיל את מעבר שלב 3.

**לוגיקת JS מרכזית ב-gift.html:**
- `syncDelivery()` — מציג/מסתיר שדה מייל מול טלפון לפי הרדיו `deliveryMethod`.
- `validate()` — מוודא **רק שדות מוצגים** (מדלג על שדה מוסתר דרך `offsetParent === null`).
- **2 ערכים למילוי בראש הסקריפט:** `BIT_LINK` (קישור בקשת תשלום בביט 250₪) ו-`SCRIPT_URL` (כתובת `/exec` של Apps Script). כרגע placeholders `REPLACE_WITH_...`.

### 6.2 Backend — [google-apps-script/Code.gs](google-apps-script/Code.gs)
Google Apps Script Web App, מחובר ל-Google Sheet. **קובץ נפרד — לא מתפרסם ב-GitHub Pages.** פריסה ידנית (ראה הוראות-הקמה.md).

- **`CFG`** בראש הקובץ: `RUTHY_EMAIL`, `RUTHY_WHATSAPP`, `CALLMEBOT_APIKEY`, `START_SERIAL:1150`, `VALID_MONTHS:6`, `AMOUNT:250`, שם/טלפון/אתר.
- **`doPost`** — קולט הזמנה, מוסיף שורה לגיליון "הזמנות" (סטטוס "ממתין" + token), קורא ל-`notifyRuthy`.
- **`notifyRuthy`** — שולח לרותי **מייל** עם כפתור "אשר ושלח" + **וואטסאפ** דרך CallMeBot. מציג את **אופן הקבלה** שהרוכש בחר.
- **`doGet`** עם `action=approve` → **`handleApprove`**: מנפיק מספר סידורי רץ (`nextSerial`, נשמר ב-ScriptProperties), מסמן "אושר", **שולח מייל קופון רק אם יש `buyerEmail`** (הזמנת וואטסאפ → רותי שולחת ידנית בכפתור). `action=coupon` → `showCoupon` (דף הורדה/הדפסה PDF).
- **`couponInline(d)`** — עיצוב הקופון (טבלאי, תואם-מייל). כולל שם מקבל, ברכה, מספר סידורי, תוקף, לב `&#9829;`, וברגל **לוגו** (`logo_mark.png` מהכתובת הציבורית) + שם העסק + טלפון.
  - ⚠️ **RTL בקופון:** הלב עוגן לסוף המשפט (שמאל) עם סימני כיווניות `&#8207;` (RLM) משני הצדדים — בלי זה הלב "קופץ" להתחלה בחלק מלקוחות המייל.
- **מספור סידורי:** ראשון = 1150, כל אישור +1. מספרים **לא נשרפים** על הזמנות שלא אושרו.
- **זרימה יומיומית לרותי:** לקוח משלם בביט → רותי מקבלת מייל+וואטסאפ → בודקת שהכסף נכנס → "אשר ושלח" → קופון נשלח אוטומטית.

> אחרי כל שינוי ב-Code.gs צריך **פריסה מחדש** ידנית ב-Apps Script (Deploy → Manage deployments → New version). שינוי מקומי בקובץ **לא** מספיק.

---

## 7. טופס יצירת קשר (contact.html)
- שולח ל-**Web3Forms** (`api.web3forms.com/submit`, `access_key` בתוך ה-HTML) דרך `<iframe name="cf-sink">` נסתר (אותו טריק כמו gift).
- שדות: שם מלא, טלפון, הודעה, **checkbox הסכמה למדיניות פרטיות (חובה)**, מלכודת ספאם (`botcheck` נסתר), ותיעוד מועד+מקור ההסכמה (hidden).
- ה-JS מציג toast "ההודעה נשלחה" ל-6 שניות ומאפס את הטופס.

---

## 8. נגישות (a11y.js / a11y.css)
תואם **ת"י ישראלי 5568 רמה AA**. נטען בכל דף, לא נוגע בעיצוב הקיים:
- **ווידג'ט צף** (`.a11y-fab`) שפותח פאנל: הגדלת טקסט (4 דרגות 100→125%), ניגודיות גבוהה, הדגשת קישורים, עצירת אנימציות, גופן קריא ומרווח, איפוס.
- ההעדפות נשמרות ב-`localStorage` (`rg_a11y_v2`), מוחלות כ-classes על `<html>` (`a11y-contrast` וכו').
- **skip-link** "דילוג לתוכן", תמיכת מקלדת (Esc/פוקוס), ARIA מלא.
- **הודעת עוגיות** (`rg_cookie_consent` ב-localStorage) — מוצגת פעם אחת.

---

## 9. כללי עבודה חשובים

- **עברית + RTL תמיד.** בכל תוכן/מייל/קופון לוודא כיווניות (סימני `&#8207;`/`&#8206;` איפה שסמלים/מספרים קופצים).
- **שדות מספר:** `placeholder="0"` ולא `value="0"` (ריק = 0 בחישוב).
- **ניווט/פוטר משוכפלים ב-9 דפים** — שינוי גורף = לעדכן בכולם (שקול sed/סקריפט).
- **sitemap.xml** — לעדכן `lastmod` לדף ששונה.
- **אין build.** לבדוק ע"י פתיחת הקובץ בדפדפן. פרודקשן = commit+push ל-`main` (GitHub Pages).
- **git:** branch `main`, remote `origin` = `RuthyRebirthing/ruthgutman-site`. לשאול לפני push (אלא אם נאמר "תעלה").
- **Code.gs דורש פריסה ידנית נפרדת** — לא חלק מ-push ל-Pages.
