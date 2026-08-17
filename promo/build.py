# -*- coding: utf-8 -*-
"""בונה את סרטון הפרומו לסטטוס וואטסאפ — 1080x1920, 30fps."""
import os, math, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageChops

BASE = os.path.dirname(os.path.abspath(__file__))
VF   = os.path.join(BASE, "vf")
SHOT = os.path.join(BASE, "shots")
OV   = os.path.join(BASE, "ov")
OUT  = os.path.join(BASE, "frames_out")

W, H, FPS = 1080, 1920, 30

# ---------------------------------------------------------------- timeline
T_A   = (0.00,  7.00)    # hero video
T_B   = (7.00,  9.30)    # name card
FLASH = [                # (screenshot, start, dur)
    ("whatis",    9.30, 2.80),
    ("articles", 12.10, 2.80),
    ("about",    14.90, 2.80),
    ("gift",     17.70, 2.80),
    ("faq",      20.50, 2.80),
]
T_D   = (23.30, 29.00)   # end card
TOTAL = 29.00
NF    = int(TOTAL * FPS)


# ---------------------------------------------------------------- helpers
def ease(t):
    """smootherstep 0..1"""
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def seg(f, a, b):
    """מיקום נורמלי של פריים f בין שניות a ל-b"""
    if b <= a:
        return 1.0
    return (f / FPS - a) / (b - a)


def fade(f, t_in0, t_in1, t_out0, t_out1):
    a = ease(seg(f, t_in0, t_in1))
    if t_out1 > t_out0:
        a *= 1.0 - ease(seg(f, t_out0, t_out1))
    return max(0.0, min(1.0, a))


def apply_alpha(img, a):
    if a >= 0.999:
        return img
    if a <= 0.001:
        return None
    o = img.copy()
    o.putalpha(o.split()[3].point(lambda v: int(v * a)))
    return o


def paste(base, layer, alpha=1.0, dx=0, dy=0, scale=1.0):
    if layer is None or alpha <= 0.003:
        return
    im = layer
    if abs(scale - 1.0) > 0.002:
        nw, nh = int(round(W * scale)), int(round(H * scale))
        im = im.resize((nw, nh), Image.LANCZOS)
        dx += (W - nw) // 2
        dy += (H - nh) // 2
    im = apply_alpha(im, alpha)
    if im is None:
        return
    base.alpha_composite(im, (int(dx), int(dy)))


# ---------------------------------------------------------------- assets
print("· loading video frames")
VN = len([n for n in os.listdir(VF) if n.endswith(".jpg")])
vid_sharp = {}


def video_frame(i):
    """פריים חד מהוידאו, עם ping-pong"""
    i = i % (2 * VN)
    idx = i if i < VN else (2 * VN - 1 - i)
    if idx not in vid_sharp:
        if len(vid_sharp) > 60:
            vid_sharp.clear()
        vid_sharp[idx] = Image.open(os.path.join(VF, "f%04d.jpg" % (idx + 1))).convert("RGB")
    return vid_sharp[idx]


print("· pre-blurring background loop")
SMW, SMH = 200, 356
bg_small = []
for i in range(VN):
    im = Image.open(os.path.join(VF, "f%04d.jpg" % (i + 1))).convert("RGB")
    im = im.resize((SMW, SMH), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3.6))
    bg_small.append(np.asarray(im, dtype=np.float32))
bg_small = np.stack(bg_small)          # VN,SMH,SMW,3

# teal tint for blurred background
TEAL = np.array([12, 70, 75], dtype=np.float32)


def blur_bg(i, dark=0.52, tint=0.42):
    i = i % (2 * VN)
    idx = i if i < VN else (2 * VN - 1 - i)
    a = bg_small[idx] * dark
    a = a * (1 - tint) + TEAL * tint
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return im.convert("RGBA")


print("· loading overlays")
ov = {}
for i in range(1, 15):
    ov[i] = Image.open(os.path.join(OV, "o%d.png" % i)).convert("RGBA")


# ---------------------------------------------------------------- vignette / scrim
def make_vignette():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (x - W / 2) / (W / 2)
    ny = (y - H / 2) / (H / 2)
    r = np.sqrt(nx * nx * 0.85 + ny * ny)
    v = np.clip((r - 0.62) / 0.75, 0, 1) ** 1.6 * 200
    a = np.zeros((H, W, 4), dtype=np.uint8)
    a[..., 3] = v.astype(np.uint8)
    a[..., 0:3] = np.array([4, 30, 34], dtype=np.uint8)
    return Image.fromarray(a, "RGBA")


def make_scrim():
    """כהות עדינה בתחתית לקריאות הטקסט על הים"""
    g = np.zeros((H, W, 4), dtype=np.uint8)
    col = np.array([5, 38, 42], dtype=np.uint8)
    prof = np.clip((np.arange(H) - 780) / (H - 780), 0, 1) ** 1.35 * 168
    top = np.clip((320 - np.arange(H)) / 320, 0, 1) ** 1.4 * 120
    a = np.maximum(prof, top)
    g[..., 3] = a[:, None].astype(np.uint8)
    g[..., 0:3] = col
    return Image.fromarray(g, "RGBA")


VIGN  = make_vignette()
SCRIM = make_scrim()


# ---------------------------------------------------------------- phone mockup
PW, PH = 604, 1164          # inner screen
PX, PY = (W - PW) // 2, 224
RAD    = 44
BW     = 13                 # bezel


def trim_shot(im):
    """חותך את השטח הריק שמתחת לתוכן — לפי שונות אופקית בכל שורה"""
    a = np.asarray(im.convert("L"), dtype=np.float32)
    rows = a.std(axis=1)
    h = a.shape[0]
    for y in range(h - 1, 0, -1):
        if rows[y] > 7.0:
            return im.crop((0, 0, im.width, min(h, y + 40)))
    return im


print("· loading screenshots")
shots = {}
for name, _, _ in FLASH:
    im = trim_shot(Image.open(os.path.join(SHOT, name + ".png")).convert("RGB"))
    k = PW / im.width
    im = im.resize((PW, int(round(im.height * k))), Image.LANCZOS)
    shots[name] = im
    print("   ", name, im.size)


def rounded_mask(w, h, r, ss=3):
    m = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)


SCR_MASK = rounded_mask(PW, PH, RAD)


def make_phone_shell():
    """מסגרת + צל, כשכבת RGBA בגודל מסך מלא"""
    ow, oh = PW + BW * 2, PH + BW * 2
    ox, oy = PX - BW, PY - BW

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sm = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sm).rounded_rectangle([ox, oy + 20, ox + ow, oy + oh + 30],
                                         radius=RAD + BW, fill=190)
    sm = sm.filter(ImageFilter.GaussianBlur(34))
    shadow.putalpha(sm)
    shadow = Image.composite(Image.new("RGBA", (W, H), (3, 26, 30, 255)),
                             Image.new("RGBA", (W, H), (0, 0, 0, 0)),
                             sm.point(lambda v: 255 if v > 0 else 0))
    shadow.putalpha(sm)

    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    bm = rounded_mask(ow, oh, RAD + BW)
    bimg = Image.new("RGBA", (ow, oh), (11, 60, 65, 255))
    # subtle metal gradient on bezel
    gr = np.linspace(1.28, 0.72, oh, dtype=np.float32)[:, None]
    ba = np.asarray(bimg, dtype=np.float32)
    ba[..., 0:3] = np.clip(ba[..., 0:3] * gr[..., None], 0, 255)
    bimg = Image.fromarray(ba.astype(np.uint8), "RGBA")
    bimg.putalpha(bm)
    body.alpha_composite(bimg, (ox, oy))
    # gold hairline
    d.rounded_rectangle([ox + 1, oy + 1, ox + ow - 2, oy + oh - 2],
                        radius=RAD + BW - 1, outline=(217, 169, 76, 150), width=3)

    shell = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shell.alpha_composite(shadow)
    shell.alpha_composite(body)
    return shell


PHONE_SHELL = make_phone_shell()

# glare across the screen
def make_glare():
    g = Image.new("L", (PW, PH), 0)
    dr = ImageDraw.Draw(g)
    dr.polygon([(-260, PH), (PW * 0.42, -60), (PW * 0.78, -60), (-40, PH)], fill=40)
    g = g.filter(ImageFilter.GaussianBlur(46))
    out = Image.new("RGBA", (PW, PH), (255, 255, 255, 0))
    out.putalpha(ImageChops.multiply(g, SCR_MASK))
    return out


GLARE = make_glare()


# ---------------------------------------------------------------- bubbles
BUB_W, BUB_H = 270, 480
_rng = np.random.RandomState(7)
BUBBLES = []
for _ in range(26):
    BUBBLES.append(dict(
        x=float(_rng.uniform(0.03, 0.97)),
        r=float(_rng.uniform(3.0, 11.5)),
        sp=float(_rng.uniform(0.030, 0.085)),
        ph=float(_rng.uniform(0, 1)),
        sw=float(_rng.uniform(6, 22)),
        al=int(_rng.uniform(26, 66)),
    ))


def bubble_layer(t):
    """שכבת בועות עולות — מצוירת קטן ומוגדלת (זול)"""
    im = Image.new("RGBA", (BUB_W, BUB_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for b in BUBBLES:
        u = (b["ph"] + t * b["sp"]) % 1.0
        y = BUB_H * (1.06 - 1.14 * u)
        x = b["x"] * BUB_W + math.sin((u * 6.0 + b["ph"] * 9) * 1.7) * b["sw"] * 0.28
        a = int(b["al"] * min(1.0, u * 5.5) * min(1.0, (1 - u) * 4.0))
        if a <= 1:
            continue
        r = b["r"]
        d.ellipse([x - r, y - r, x + r, y + r], fill=(214, 244, 240, a))
        d.ellipse([x - r * .45, y - r * .55, x + r * .12, y - r * .05],
                  fill=(255, 255, 255, min(255, a + 40)))
    im = im.filter(ImageFilter.GaussianBlur(0.7))
    return im.resize((W, H), Image.BICUBIC)


def phone_screen(name, prog):
    """גזרת גלילה מהצילום, ממוסכת לפינות מעוגלות"""
    im = shots[name]
    maxy = max(0, im.height - PH)
    # מתחילים קצת מתחת ל-hero כדי שיראו תוכן
    y0 = int(round(maxy * 0.02))
    y1 = int(round(maxy * 0.96))
    y = int(round(y0 + (y1 - y0) * prog))
    cut = im.crop((0, y, PW, y + PH)).convert("RGBA")
    cut.putalpha(SCR_MASK)
    cut.alpha_composite(GLARE)
    return cut


# ---------------------------------------------------------------- render
os.makedirs(OUT, exist_ok=True)
print("· rendering %d frames" % NF)

ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y",
     "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
     "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
     "-pix_fmt", "yuv420p", "-movflags", "+faststart",
     os.path.join(BASE, "_video_only.mp4")],
    stdin=subprocess.PIPE)

for f in range(NF):
    t = f / FPS
    fr = None

    # ---------------- Scene A : hero video
    if t < T_B[0]:
        base = video_frame(f).convert("RGBA")
        # zoom in slowly 1.0 -> 1.06
        z = 1.0 + 0.065 * (t / T_A[1])
        if z > 1.001:
            nw, nh = int(W * z), int(H * z)
            base = base.resize((nw, nh), Image.LANCZOS).crop(
                ((nw - W) // 2, (nh - H) // 2, (nw - W) // 2 + W, (nh - H) // 2 + H))
        # ending blur into scene B
        bo = ease(seg(f, 6.30, 7.00))
        if bo > 0.01:
            base = base.filter(ImageFilter.GaussianBlur(1 + 16 * bo))
            d = Image.new("RGBA", (W, H), (8, 48, 52, int(120 * bo)))
            base.alpha_composite(d)
        fr = base
        fr.alpha_composite(SCRIM)
        fr.alpha_composite(VIGN)

        out_t = (6.42, 6.98)
        paste(fr, ov[1], fade(f, 0.25, 1.15, *out_t), dy=int(-46 * (1 - ease(seg(f, .25, 1.15)))))
        paste(fr, ov[2], fade(f, 1.05, 1.95, *out_t), dy=int(58 * (1 - ease(seg(f, 1.05, 1.95)))))
        paste(fr, ov[3], fade(f, 1.55, 2.45, *out_t), dy=int(58 * (1 - ease(seg(f, 1.55, 2.45)))))
        paste(fr, ov[4], fade(f, 2.30, 3.20, *out_t))

    # ---------------- Scene B : name card
    elif t < FLASH[0][1]:
        fr = blur_bg(f, dark=0.62, tint=0.34)
        fr.alpha_composite(bubble_layer(t))
        fr.alpha_composite(VIGN)
        a = fade(f, 6.96, 7.72, 9.04, 9.30)
        e = ease(seg(f, 6.96, 7.80))
        paste(fr, ov[5], a, dy=int(40 * (1 - e)), scale=0.955 + 0.045 * e)

    # ---------------- Scene C : site flashes
    elif t < T_D[0]:
        fr = blur_bg(f, dark=0.58, tint=0.38)
        fr.alpha_composite(bubble_layer(t))
        fr.alpha_composite(VIGN)
        for i, (name, st, du) in enumerate(FLASH):
            if not (st - 0.36 <= t < st + du + 0.05):
                continue
            p = (t - st) / du
            a = fade(f, st, st + 0.40, st + du - 0.34, st + du)
            if a <= 0.004:
                continue
            e_in  = ease(seg(f, st, st + 0.45))
            e_out = ease(seg(f, st + du - 0.34, st + du))
            dy = int(96 * (1 - e_in) - 62 * e_out)
            sc = 0.955 + 0.045 * e_in
            pp = max(0.0, min(1.0, (p - 0.06) / 0.90))
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            layer.alpha_composite(PHONE_SHELL)
            layer.alpha_composite(phone_screen(name, ease(pp) * 0.55 + pp * 0.45), (PX, PY))
            paste(fr, layer, a, dy=dy, scale=sc)
            cap = ov[6 + i]
            ca = fade(f, st + 0.30, st + 0.85, st + du - 0.30, st + du - 0.02)
            paste(fr, cap, ca, dy=int(34 * (1 - ease(seg(f, st + .30, st + .90)))))
        # הבזק רך בכל מעבר
        for _, st, _ in FLASH:
            if st - 0.10 <= t <= st + 0.22:
                k = 1.0 - abs(t - st - 0.06) / 0.16
                if k > 0:
                    fr.alpha_composite(Image.new("RGBA", (W, H),
                                                 (226, 248, 245, int(46 * k))))

    # ---------------- Scene D : end card
    else:
        fr = blur_bg(f, dark=0.54, tint=0.46)
        fr.alpha_composite(bubble_layer(t))
        fr.alpha_composite(VIGN)
        e = ease(seg(f, 23.32, 24.00))
        paste(fr, ov[11], fade(f, 23.32, 24.00, 0, 0), dy=int(34 * (1 - e)),
              scale=0.90 + 0.10 * e)
        paste(fr, ov[12], fade(f, 23.86, 24.52, 0, 0),
              dy=int(40 * (1 - ease(seg(f, 23.86, 24.52)))))
        pulse = 1.0 + 0.013 * math.sin((t - 25.1) * 2.5)
        paste(fr, ov[13], fade(f, 24.36, 25.06, 0, 0),
              dy=int(40 * (1 - ease(seg(f, 24.36, 25.06)))),
              scale=pulse if t > 25.06 else 1.0)
        paste(fr, ov[14], fade(f, 24.92, 25.66, 0, 0),
              dy=int(40 * (1 - ease(seg(f, 24.92, 25.66)))))
        # gentle fade out at the very end
        fo = ease(seg(f, 28.72, 29.00))
        if fo > 0.01:
            fr.alpha_composite(Image.new("RGBA", (W, H), (6, 40, 44, int(255 * fo * 0.72))))

    ff.stdin.write(fr.convert("RGB").tobytes())
    if f % 60 == 0:
        print("   frame %d/%d  (%.1fs)" % (f, NF, t))

ff.stdin.close()
ff.wait()
print("· video done ->", os.path.join(BASE, "_video_only.mp4"))
