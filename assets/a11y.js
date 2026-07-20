/* ============================================================
   נגישות (ת"י 5568 רמה AA) + הודעת עוגיות
   נטען בכל דפי האתר — לא משנה את העיצוב הקיים
   ============================================================ */
(function () {
  'use strict';

  // גרסת המפתח — שינוי הגרסה מאפס הגדרות תקועות מבדיקות קודמות
  var STORE = 'rg_a11y_v2';
  var COOKIE_KEY = 'rg_cookie_consent';
  var root = document.documentElement;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  /* ---------- מצב הנגישות השמור ---------- */
  try { localStorage.removeItem('rg_a11y'); } catch (e) {} // ניקוי מפתח ישן
  var state = read(STORE, { font: 0, contrast: false, links: false, stop: false, readable: false });

  function apply() {
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-links', !!state.links);
    root.classList.toggle('a11y-stop', !!state.stop);
    root.classList.toggle('a11y-readable', !!state.readable);
    // הגדלה מתונה — כדי שהאתר לא "יתפוצץ" בלחיצה אחת
    var steps = [100, 108, 116, 125];
    root.style.fontSize = state.font ? steps[state.font] + '%' : '';
    write(STORE, state);
    syncButtons();
  }

  function syncButtons() {
    var panel = document.getElementById('a11y-panel');
    if (!panel) return;
    ['contrast', 'links', 'stop', 'readable'].forEach(function (k) {
      var b = panel.querySelector('[data-a11y="' + k + '"]');
      if (b) b.setAttribute('aria-pressed', state[k] ? 'true' : 'false');
    });
    var f = panel.querySelector('[data-a11y="font"]');
    if (f) f.setAttribute('aria-pressed', state.font ? 'true' : 'false');
  }

  /* ---------- בניית הווידג'ט ---------- */
  function icon(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }

  function build() {
    /* דילוג לתוכן */
    if (!document.querySelector('.skip-link')) {
      var target = document.querySelector('#main-content, main, .page-head, .hero-video, section');
      if (target && !target.id) target.id = 'main-content';
      var skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#' + (target ? target.id : 'main-content');
      skip.textContent = 'דילוג לתוכן הראשי';
      document.body.insertBefore(skip, document.body.firstChild);
    }

    /* כפתור */
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.id = 'a11y-fab';
    fab.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'a11y-panel');
    fab.innerHTML = icon('<circle cx="12" cy="4.2" r="1.7"/><path d="M4.5 8.2h15"/>' +
                         '<path d="M12 8.2v6"/><path d="m12 14.2-3 6.6"/><path d="m12 14.2 3 6.6"/>');

    /* פאנל */
    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'תפריט נגישות');
    panel.setAttribute('data-open', 'false');
    panel.innerHTML =
      '<h2>תפריט נגישות' +
        '<button type="button" class="a11y-close" aria-label="סגירת תפריט נגישות">&times;</button>' +
      '</h2>' +
      '<button type="button" class="a11y-btn" data-a11y="font" aria-pressed="false">' +
        icon('<path d="M4 19 10 5l6 14"/><path d="M6.5 14h7"/><path d="M18 10v8"/><path d="M14.5 14h7"/>') +
        '<span id="a11y-font-label">הגדלת טקסט</span></button>' +
      '<button type="button" class="a11y-btn" data-a11y="contrast" aria-pressed="false">' +
        icon('<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor"/>') +
        '<span>ניגודיות גבוהה</span></button>' +
      '<button type="button" class="a11y-btn" data-a11y="links" aria-pressed="false">' +
        icon('<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>') +
        '<span>הדגשת קישורים</span></button>' +
      '<button type="button" class="a11y-btn" data-a11y="stop" aria-pressed="false">' +
        icon('<rect x="5" y="5" width="14" height="14" rx="2"/>') +
        '<span>עצירת אנימציות</span></button>' +
      '<button type="button" class="a11y-btn" data-a11y="readable" aria-pressed="false">' +
        icon('<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h10"/>') +
        '<span>גופן קריא ומרווח</span></button>' +
      '<button type="button" class="a11y-btn a11y-reset" data-a11y="reset">' +
        icon('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>') +
        '<span>איפוס הגדרות</span></button>' +
      '<a class="a11y-link" href="accessibility.html">להצהרת הנגישות המלאה</a>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function openPanel(open) {
      panel.setAttribute('data-open', open ? 'true' : 'false');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var b = panel.querySelector('.a11y-btn'); if (b) b.focus(); }
    }

    fab.addEventListener('click', function () {
      openPanel(panel.getAttribute('data-open') !== 'true');
    });
    panel.querySelector('.a11y-close').addEventListener('click', function () {
      openPanel(false); fab.focus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') {
        openPanel(false); fab.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (panel.getAttribute('data-open') !== 'true') return;
      if (!panel.contains(e.target) && !fab.contains(e.target)) openPanel(false);
    });

    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-a11y]');
      if (!btn) return;
      var key = btn.getAttribute('data-a11y');
      var lbl = document.getElementById('a11y-font-label');
      if (key === 'reset') {
        state = { font: 0, contrast: false, links: false, stop: false, readable: false };
        if (lbl) lbl.textContent = 'הגדלת טקסט';
      } else if (key === 'font') {
        state.font = (state.font + 1) % 4;
        if (lbl) lbl.textContent = state.font ? 'טקסט מוגדל (' + (state.font + 1) + '/4)' : 'הגדלת טקסט';
      } else {
        state[key] = !state[key];
      }
      apply();
    });

    syncButtons();
  }

  /* ---------- הודעת עוגיות ---------- */
  function cookieBar() {
    if (read(COOKIE_KEY, null)) return;
    var bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'הודעה על שימוש בעוגיות');
    bar.innerHTML =
      '<p>האתר עושה שימוש בעוגיות (Cookies) לצורך תפעול תקין, שמירת העדפות נגישות וניתוח תנועה סטטיסטי. ' +
      'לפרטים ראו את <a href="privacy.html">מדיניות הפרטיות</a>.</p>' +
      '<button type="button" class="cb-accept">הבנתי</button>';
    document.body.appendChild(bar);
    bar.setAttribute('data-open', 'true');

    bar.addEventListener('click', function (e) {
      if (e.target.classList.contains('cb-accept')) {
        write(COOKIE_KEY, { choice: 'acknowledged', at: new Date().toISOString() });
        bar.remove();
      }
    });
  }

  function init() { build(); apply(); cookieBar(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
