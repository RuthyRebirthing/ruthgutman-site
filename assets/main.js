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
})();
