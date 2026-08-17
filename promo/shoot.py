# -*- coding: utf-8 -*-
"""מצלם צילומי מסך ארוכים (full page) של דפי האתר ב-viewport מובייל."""
import os, re, subprocess, sys, glob

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(BASE, "site")
SHOTS = os.path.join(BASE, "shots")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

INJECT = """
<style id="promo-fix">
  .reveal{opacity:1!important;transform:none!important;filter:none!important}
  .reveal.in{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation-duration:.001s!important;animation-delay:0s!important;transition:none!important}
  html,body{scroll-behavior:auto!important}
  html{zoom:1!important}
  html,body{overflow-x:hidden!important;max-width:100%!important}
  .a11y-fab,.a11y-panel,.cookie-bar,.skip-link,.nav-links{display:none!important}
  .hero-video,.hero,.hero--home,.benefits,.poster-full{
    height:1000px!important;min-height:1000px!important;max-height:1000px!important}
</style>
</head>"""

PAGES = ["index", "whatis", "poster", "articles", "about", "faq", "gift", "contact",
         "postpartum", "teens"]

W, H, SCALE = 540, 3000, 2


def prep():
    for p in PAGES:
        f = os.path.join(SITE, p + ".html")
        s = open(f, encoding="utf-8").read()
        if "promo-fix" not in s:
            s = s.replace("</head>", INJECT, 1)
            open(f, "w", encoding="utf-8").write(s)


def shoot():
    os.makedirs(SHOTS, exist_ok=True)
    for p in PAGES:
        out = os.path.join(SHOTS, p + ".png")
        url = "file:///" + os.path.join(SITE, p + ".html").replace("\\", "/")
        cmd = [CHROME, "--headless=new", "--disable-gpu-sandbox", "--no-sandbox",
               "--hide-scrollbars", "--disable-features=CalculateNativeWinOcclusion",
               "--allow-file-access-from-files",
               f"--force-device-scale-factor={SCALE}",
               f"--window-size={W},{H}",
               "--virtual-time-budget=6000",
               f"--screenshot={out}", url]
        subprocess.run(cmd, capture_output=True, timeout=120)
        ok = os.path.exists(out)
        print(p, "OK" if ok else "FAIL", os.path.getsize(out) if ok else "")


if __name__ == "__main__":
    prep()
    shoot()
