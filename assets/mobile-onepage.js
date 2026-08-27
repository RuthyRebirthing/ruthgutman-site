/* ============================================================
   ריברסינג · רותי גוטמן — "דף אחד" במובייל
   ------------------------------------------------------------
   במסכי מובייל/טאבלט דף הבית מרכז את כל דפי האתר בגלילה אחת,
   והתפריט הופך לעוגנים בתוך הדף. במחשב שום דבר לא משתנה.

   התוכן נשאב מקבצי ה-HTML הקיימים בזמן אמת (fetch) — אין שכפול
   של טקסט. כל עריכה בדף המקורי מופיעה גם כאן, בלי עבודה נוספת.

   ⚠ fetch דורש שרת (http/https). בפתיחת index.html ישירות מהדיסק
   (file://) ההזרקה לא תרוץ, והדף פשוט יישאר כפי שהוא. לבדיקה
   מקומית: python -m http.server 8000  ואז http://localhost:8000
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  /* הכיתה נקבעת בסקריפט הקצר שב-<head> של index.html — דף הבית, מסך צר */
  if (!root.classList.contains('home-mob')) return;

  /* הדפים לפי סדר התפריט. id = מזהה העוגן בדף הבית */
  var PAGES = [
    { file: 'whatis.html',   id: 'm-whatis'   },
    { file: 'poster.html',   id: 'm-poster'   },
    { file: 'articles.html', id: 'm-articles' },
    { file: 'about.html',    id: 'm-about'    },
    { file: 'faq.html',      id: 'm-faq'      },
    { file: 'gift.html',     id: 'm-gift'     },
    { file: 'contact.html',  id: 'm-contact'  }
  ];

  /* ---------- הפיכת קישורים לדפים שנטענו לעוגנים בדף ---------- */
  function anchorFor(href) {
    /* עוגנים, tel:, mailto: וכתובות חוץ — לא נוגעים */
    if (!href || href.charAt(0) === '#' || href.indexOf(':') > -1) return null;
    var clean = href.split('#')[0].split('?')[0].replace(/^\.\//, '');
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].file === clean) return '#' + PAGES[i].id;
    }
    if (clean === 'index.html') return '#top';
    return null;
  }

  function rewriteLinks(scope) {
    scope.querySelectorAll('a[href]').forEach(function (a) {
      if (a.target === '_blank') return;
      var to = anchorFor(a.getAttribute('href'));
      if (to) a.setAttribute('href', to);
    });
  }

  /* ---------- גלים סטטיים לראש כל דף מוזרק ---------- */
  /* אותם גלים של הדפים הפנימיים, בלי קנבס ה-WebGL — שבעה קנבסים
     במקביל היו מרוקנים סוללה במובייל בלי להוסיף דבר. */
  function dressHead(head) {
    if (!head || head.querySelector('.head-waves')) return;
    var scrim = document.createElement('div');
    scrim.className = 'head-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    var waves = document.createElement('div');
    waves.className = 'head-waves';
    waves.setAttribute('aria-hidden', 'true');
    waves.innerHTML =
      '<svg class="wv w1" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
      '<path d="M0 46C480 66 960 26 1440 46 1920 66 2400 26 2880 46L2880 120 0 120Z" fill="rgba(31,160,166,.4)"/></svg>' +
      '<svg class="wv w2" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
      '<path d="M0 50C360 80 720 20 1440 50 1800 80 2160 20 2880 50L2880 120 0 120Z" fill="rgba(255,255,255,.55)"/></svg>' +
      '<svg class="wv w3" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
      '<path d="M0 60C480 20 960 100 1440 60 1920 20 2400 100 2880 60L2880 120 0 120Z" fill="#E7F4F0"/></svg>';
    head.insertBefore(waves, head.firstChild);
    head.insertBefore(scrim, head.firstChild);
  }

  /* ---------- h1 -> h2: בדף אחד יש כותרת ראשית אחת בלבד ---------- */
  function demoteH1(scope) {
    scope.querySelectorAll('h1').forEach(function (h1) {
      var h2 = document.createElement('h2');
      for (var i = 0; i < h1.attributes.length; i++) {
        h2.setAttribute(h1.attributes[i].name, h1.attributes[i].value);
      }
      h2.innerHTML = h1.innerHTML;
      h1.parentNode.replaceChild(h2, h1);
    });
  }

  /* ---------- חילוץ גוף הדף ---------- */
  function extract(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');

    var wrap = document.createElement('section');
    wrap.className = 'mob-page';
    wrap.id = page.id;
    /* מחלקות ה-body של הדף המקורי (bg-waves) לא מועברות בכוונה:
       בדף מאוחד כל הסקשנים מקבלים את אותה כותרת טורקיז, וזה מה
       שיוצר את ההפרדה הברורה בין דף לדף בגלילה. */

    Array.prototype.slice.call(doc.body.children).forEach(function (el) {
      var tag = el.tagName;
      if (tag === 'HEADER' || tag === 'FOOTER' || tag === 'SCRIPT' ||
          tag === 'NOSCRIPT' || el.classList.contains('decor-sky')) return;
      wrap.appendChild(document.importNode(el, true));
    });

    /* סגנונות inline של הדף (gift.html מחזיק CSS משלו) */
    var styles = [];
    doc.querySelectorAll('head style').forEach(function (s) { styles.push(s.textContent); });

    /* סקריפטים inline של הדף — בלי ld+json ובלי ממלא־השנה בפוטר */
    var scripts = [];
    doc.querySelectorAll('script').forEach(function (s) {
      if (s.src) return;                                    // main.js / a11y.js כבר טעונים
      if (s.type && s.type !== 'text/javascript') return;    // application/ld+json
      var code = s.textContent || '';
      if (code.length < 200 && /getElementById\(.yr.\)/.test(code)) return;
      scripts.push(code);
    });

    demoteH1(wrap);
    rewriteLinks(wrap);
    wrap.querySelectorAll('img').forEach(function (img) {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
    wrap.querySelectorAll('.page-head').forEach(dressHead);

    return { wrap: wrap, styles: styles, scripts: scripts };
  }

  /* ---------- הפעלת ההתנהגויות של main.js על התוכן החדש ---------- */
  function activate(scope) {
    /* אקורדיון שאלות — רק אחד פתוח בכל רגע */
    var faq = scope.querySelectorAll('.faq-item');
    faq.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) faq.forEach(function (o) { if (o !== item) o.open = false; });
      });
    });

    /* אנימציית הופעה בגלילה */
    var reveals = scope.querySelectorAll('.reveal:not(.in)');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.14 });
      reveals.forEach(function (r) { io.observe(r); });
    } else {
      reveals.forEach(function (r) { r.classList.add('in'); });
    }
  }

  /* ---------- הרצת הסקריפטים של הדף המוזרק ---------- */
  function runScripts(list) {
    list.forEach(function (code) {
      var el = document.createElement('script');
      el.textContent = code;
      document.body.appendChild(el);
    });
  }

  /* ============================================================
     ריצה
     ============================================================ */
  rewriteLinks(document);          /* גם בתפריט וגם בכפתורי ה-CTA של הבית */

  var footer = document.querySelector('body > footer');
  if (!footer) return;

  /* מקומות שמורים — כדי שהסקשנים יישבו בסדר גם אם התשובות חוזרות מעורבב */
  var slots = PAGES.map(function (page) {
    var slot = document.createElement('div');
    slot.className = 'mob-slot';
    footer.parentNode.insertBefore(slot, footer);
    return slot;
  });

  function load() {
    var jobs = PAGES.map(function (page, i) {
      return fetch(page.file, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status + ' ' + page.file);
          return r.text();
        })
        .then(function (html) {
          var part = extract(html, page);
          part.styles.forEach(function (css) {
            var st = document.createElement('style');
            st.textContent = css;
            document.head.appendChild(st);
          });
          slots[i].replaceWith(part.wrap);
          activate(part.wrap);
          runScripts(part.scripts);
        })
        .catch(function (err) {
          slots[i].remove();
          console.warn('[mobile-onepage] הדף ' + page.file + ' לא נטען לדף הבית:', err.message);
        });
    });

    Promise.all(jobs).then(function () {
      root.classList.add('mob-onepage-ready');
      /* כניסה עם עוגן בכתובת (או לחיצה בתפריט לפני שהטעינה הסתיימה) —
         לגלול רק עכשיו, כשהיעד כבר קיים. קפיצה ולא גלילה חלקה:
         הדף באורך אלפי פיקסלים, וגלילה חלקה לאורכו נמשכת נצח. */
      if (location.hash && location.hash.length > 1) {
        var t = document.getElementById(location.hash.slice(1));
        if (t) t.scrollIntoView({ behavior: 'auto' });
      }
    });
  }

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
}());
