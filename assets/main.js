/* ריברסינג · רותי גוטמן — סקריפט אתר */
(function () {
  'use strict';

  /* ---------- Navbar: shrink on scroll ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('in'));
  }

  /* ---------- FAQ accordion: only one open at a time ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------- Hero: word-by-word entrance ---------- */
  const h1 = document.querySelector('h1[data-typewords]');
  if (h1) {
    const words = h1.querySelectorAll('.word');
    words.forEach((w, i) => {
      setTimeout(() => {
        w.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1), filter .6s ease';
        w.style.opacity = '1';
        w.style.transform = 'translateY(0)';
        w.style.filter = 'blur(0)';
      }, 350 + i * 320);
    });
    // reveal subtitle + CTA + stats after the words finish
    const after = 350 + words.length * 320 + 200;
    ['.home-tag', '.hero-sub', '.hero-cta', '.hero-stats', '.video-box', '.hero-video__tagline'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) setTimeout(() => el.classList.add('show'), after);
    });
  }

  /* ============================================================
     ✦ מוטיבים חיים של ריברסינג — דפים פנימיים בלבד (לא דף הבית)
     מים אמיתיים (WebGL caustics) · גלים זורמים · פרפרים · בועות
     ============================================================ */
  const isHome = document.documentElement.classList.contains('home');
  if (!isHome) {

    /* ---------- פרפר SVG (בהשראת הלוגו) ---------- */
    function butterflySVG() {
      return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
        '<g fill="currentColor">' +
        '<path d="M60 52C44 20 24 10 14 20 4 30 8 54 30 62 44 66 56 60 60 52Z" fill-opacity=".92"/>' +
        '<path d="M60 52C76 20 96 10 106 20 116 30 112 54 90 62 76 66 64 60 60 52Z" fill-opacity=".92"/>' +
        '<path d="M60 56C50 74 34 84 28 100 24 112 42 112 54 92 60 82 62 66 60 56Z" fill-opacity=".62"/>' +
        '<path d="M60 56C70 74 86 84 92 100 96 112 78 112 66 92 60 82 58 66 60 56Z" fill-opacity=".62"/>' +
        '</g>' +
        '<ellipse cx="60" cy="63" rx="3.1" ry="16" fill="#D9A94C"/>' +
        '<circle cx="60" cy="45" r="3.8" fill="#D9A94C"/>' +
        '<path d="M60 43C55 32 50 28 45 25M60 43C65 32 70 28 75 25" stroke="#D9A94C" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
        '<circle cx="45" cy="25" r="2" fill="#D9A94C"/><circle cx="75" cy="25" r="2" fill="#D9A94C"/>' +
        '</svg>';
    }

    /* ---------- שכבת פרפרים + בועות מרחפים ---------- */
    const sky = document.createElement('div');
    sky.className = 'decor-sky';
    sky.setAttribute('aria-hidden', 'true');

    // פרפרי רקע דהויים: [left%, top%, size, opacity, rotate, color]
    const marks = [
      [5, 13, 200, .10, -14, 'var(--teal-400)'],
      [83, 7, 150, .09, 16, 'var(--teal-500)'],
      [87, 58, 220, .07, -8, 'var(--teal-300)'],
      [2, 64, 172, .08, 12, 'var(--teal-400)'],
      [45, 87, 132, .06, 6, 'var(--teal-500)'],
      [70, 33, 92, .11, 20, 'var(--gold)'],
      [22, 42, 80, .12, -18, 'var(--gold)']
    ];
    // פרפרים מרחפים (מונפשים): [left%, top%, size, opacity, color, class]
    const floats = [
      [8, 22, 72, .42, 'var(--teal-400)', ''],
      [86, 26, 58, .36, 'var(--gold)', 's2'],
      [79, 72, 82, .32, 'var(--teal-500)', 's3'],
      [13, 78, 54, .38, 'var(--teal-300)', ''],
      [50, 15, 48, .32, 'var(--gold-soft)', 's2']
    ];
    marks.forEach(function (m) {
      const d = document.createElement('div');
      d.className = 'bf';
      d.style.cssText = 'left:' + m[0] + '%;top:' + m[1] + '%;width:' + m[2] + 'px;opacity:' + m[3] + ';color:' + m[5] + ';transform:rotate(' + m[4] + 'deg)';
      d.innerHTML = butterflySVG();
      sky.appendChild(d);
    });
    floats.forEach(function (f) {
      const d = document.createElement('div');
      d.className = 'bf bf-float ' + f[5];
      d.style.cssText = 'left:' + f[0] + '%;top:' + f[1] + '%;width:' + f[2] + 'px;opacity:' + f[3] + ';color:' + f[4];
      d.innerHTML = butterflySVG();
      sky.appendChild(d);
    });
    // בועות עולות: [left%, top%, size, duration s, delay s]
    const bubbles = [
      [10, 88, 16, 15, 0], [24, 94, 10, 12, 3], [38, 90, 22, 19, 6],
      [55, 96, 13, 14, 2], [67, 88, 9, 11, 5], [80, 93, 18, 17, 1],
      [90, 90, 12, 13, 7], [16, 92, 8, 16, 9], [46, 93, 11, 12, 4], [73, 95, 15, 20, 8]
    ];
    bubbles.forEach(function (b) {
      const d = document.createElement('div');
      d.className = 'bubble';
      d.style.cssText = 'left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + 'px;height:' + b[2] +
        'px;animation-duration:' + b[3] + 's;animation-delay:-' + b[4] + 's';
      sky.appendChild(d);
    });
    document.body.appendChild(sky);

    /* ---------- מים אמיתיים ב-WebGL (caustics) ---------- */
    function initWater(canvas, tone) {
      let gl;
      try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
      if (!gl) return false;

      const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
      const fs =
        'precision highp float;uniform vec2 u_res;uniform float u_t;uniform float u_lo;' +
        'void main(){' +
        'float TAU=6.28318530718;' +
        'vec2 uv=gl_FragCoord.xy/u_res.xy;' +
        'float a=u_res.x/u_res.y;' +
        'vec2 q=uv;q.x*=a;' +
        'vec2 p=mod(q*TAU*1.8,TAU)-250.0;' +
        'vec2 i=vec2(p);float c=1.0;float inten=.0045;' +
        'for(int n=0;n<5;n++){' +
        'float t=u_t*0.9*(1.0-(3.5/float(n+1)));' +
        'i=p+vec2(cos(t-i.x)+sin(t+i.y),sin(t-i.y)+cos(t+i.x));' +
        'c+=1.0/length(vec2(p.x/(sin(i.x+t)/inten),p.y/(cos(i.y+t)/inten)));' +
        '}' +
        'c/=5.0;c=1.17-pow(c,1.4);' +
        'float glow=pow(abs(c),8.0);' +
        'vec3 deep=vec3(0.035,0.24,0.27);' +
        'vec3 mid=vec3(0.07,0.55,0.58);' +
        'vec3 hi=vec3(0.82,0.97,0.93);' +
        'vec3 col=mix(deep,mid,pow(uv.y,0.7));' +
        'col+=hi*glow*1.05;' +
        'col=mix(col,vec3(0.85,0.68,0.32),glow*0.10);' +
        'gl_FragColor=vec4(col,u_lo);' +
        '}';

      function sh(type, src) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
        return s;
      }
      const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
      if (!v || !f) return false;
      const prog = gl.createProgram();
      gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uT = gl.getUniformLocation(prog, 'u_t');
      const uLo = gl.getUniformLocation(prog, 'u_lo');
      gl.uniform1f(uLo, tone == null ? 1.0 : tone);

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
        gl.uniform2f(uRes, w, h);
      }
      window.addEventListener('resize', resize, { passive: true });
      resize();

      const start = (window.performance && performance.now) ? performance.now() : Date.now();
      // כיבוד העדפת "הפחתת תנועה" — פריים סטטי אחד בלבד
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gl.uniform1f(uT, 12.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return true;
      }
      let running = true;
      document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) loop(); });
      function loop() {
        if (!running) return;
        resize();
        const now = (window.performance && performance.now) ? performance.now() : Date.now();
        gl.uniform1f(uT, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(loop);
      }
      loop();
      return true;
    }

    /* ---------- גלים זורמים ל-SVG ---------- */
    function wavesSVG() {
      return '<svg class="wv w1" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
        '<path d="M0 46C480 66 960 26 1440 46 1920 66 2400 26 2880 46L2880 120 0 120Z" fill="rgba(31,160,166,.4)"/></svg>' +
        '<svg class="wv w2" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
        '<path d="M0 50C360 80 720 20 1440 50 1800 80 2160 20 2880 50L2880 120 0 120Z" fill="rgba(255,255,255,.55)"/></svg>' +
        '<svg class="wv w3" viewBox="0 0 2880 120" preserveAspectRatio="none">' +
        '<path d="M0 60C480 20 960 100 1440 60 1920 20 2400 100 2880 60L2880 120 0 120Z" fill="#E7F4F0"/></svg>';
    }

    /* ---------- הרכבת ההירו של המים בראש הדף ---------- */
    const head = document.querySelector('.page-head');
    if (head) {
      const cv = document.createElement('canvas');
      cv.className = 'head-water';
      cv.setAttribute('aria-hidden', 'true');
      const scrim = document.createElement('div');
      scrim.className = 'head-scrim';
      scrim.setAttribute('aria-hidden', 'true');
      const waves = document.createElement('div');
      waves.className = 'head-waves';
      waves.setAttribute('aria-hidden', 'true');
      waves.innerHTML = wavesSVG();
      head.insertBefore(waves, head.firstChild);
      head.insertBefore(scrim, head.firstChild);
      head.insertBefore(cv, head.firstChild);
      initWater(cv, 1.0);
    }

    /* הערה: מפת היתרונות (poster) נשארת נקייה — ללא מים/מדיה, לפי בקשה */
  }
})();
