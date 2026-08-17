# -*- coding: utf-8 -*-
"""פסקול אמביינטי לסרטון — פד רך + פעימות נשימה + פעמונים עדינים."""
import os, math, wave, struct
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
SR   = 48000
DUR  = 29.0
N    = int(SR * DUR)
t    = np.arange(N) / SR

rng = np.random.RandomState(11)
L = np.zeros(N, dtype=np.float64)
R = np.zeros(N, dtype=np.float64)


def add(sig, pan=0.0, gain=1.0):
    global L, R
    l = gain * (1 - max(0.0, pan)) ** 0.5
    r = gain * (1 + min(0.0, pan)) ** 0.5
    L += sig * l
    R += sig * r


def onepole_lp(x, cut):
    a = math.exp(-2 * math.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lp_fft(x, cut, order=2):
    """low-pass מהיר בתדר"""
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1.0 / (1.0 + (fr / cut) ** (2 * order)) ** 0.5
    return np.fft.irfft(X, n=len(x))


def hp_fft(x, cut, order=2):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    w = (fr / cut) ** order
    X *= w / (1.0 + w ** 2) ** 0.5
    return np.fft.irfft(X, n=len(x))


def env(points):
    """מעטפת מנקודות (זמן, ערך) עם אינטרפולציה חלקה"""
    ts = np.array([p[0] for p in points])
    vs = np.array([p[1] for p in points])
    return np.interp(t, ts, vs)


# ---------------------------------------------------------------- 1. פד
# אקורד A minor add9 רחב — טורקיז/ימי
PAD = [(110.00, .34, -.35), (164.81, .26, .30), (220.00, .30, -.15),
       (261.63, .20, .38), (329.63, .16, -.42), (493.88, .09, .18),
       (659.26, .06, -.25)]

pad_env = env([(0, .0), (1.6, .55), (6.6, .62), (7.4, .50), (9.3, .58),
               (22.9, .60), (23.5, .72), (26.5, .70), (28.2, .55), (29.0, .0)])

for fq, amp, pan in PAD:
    # שני קולות מפולפלים קלות לרוחב סטריאו
    for det, dp in ((0.0, 0.0), (0.16, 1.0), (-0.19, -1.0)):
        drift = 1.0 + 0.0016 * np.sin(2 * math.pi * (0.055 + fq * 1e-4) * t + fq)
        ph = 2 * math.pi * (fq + det) * t * drift
        wave_ = np.sin(ph) + 0.16 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
        slow = 1.0 + 0.13 * np.sin(2 * math.pi * (0.07 + fq * 2e-5) * t + fq * .3)
        add(wave_ * amp * slow * pad_env * 0.13,
            pan=max(-1, min(1, pan + dp * 0.22)), gain=1.0)

# ---------------------------------------------------------------- 2. נשימות
noise = rng.normal(0, 1, N)
breath_src = lp_fft(hp_fft(noise, 420, 2), 2100, 2)
breath_env = np.zeros(N)
cycle = 5.4
k = 0
while k * cycle < DUR + 1:
    t0 = k * cycle + 0.35
    inh, hold, exh = 1.85, 0.30, 2.45
    seg = (t >= t0) & (t < t0 + inh)
    breath_env[seg] += np.sin(np.pi * (t[seg] - t0) / inh / 2) ** 1.6
    t1 = t0 + inh + hold
    seg = (t >= t1) & (t < t1 + exh)
    breath_env[seg] += np.cos(np.pi * (t[seg] - t1) / exh / 2) ** 1.4
    k += 1
breath_env = np.clip(breath_env, 0, 1.2)
b_gain = env([(0, .0), (1.2, .55), (7.0, .55), (7.6, .30), (9.3, .45),
              (23.0, .45), (24.0, .55), (27.5, .45), (29.0, .0)])
add(breath_src * breath_env * b_gain * 0.075, pan=0.0)

# ---------------------------------------------------------------- 3. פעמונים
# A minor pentatonic — A C D E G
SCALE = [440.00, 523.25, 587.33, 659.26, 783.99, 880.00, 1046.50, 1174.66]
bell_times = []
tt = 1.30
i = 0
while tt < 28.2:
    bell_times.append(tt)
    tt += [1.15, 0.72, 1.42, 0.86, 1.05, 1.70][i % 6]
    i += 1

for i, bt in enumerate(bell_times):
    fq = SCALE[(i * 3 + (i // 4)) % len(SCALE)]
    dur = 2.6
    n0 = int(bt * SR)
    n1 = min(N, n0 + int(dur * SR))
    if n1 <= n0:
        continue
    lt = np.arange(n1 - n0) / SR
    e = np.exp(-lt * 2.5) * (1 - np.exp(-lt * 260))
    s = (np.sin(2 * math.pi * fq * lt) * 0.62
         + np.sin(2 * math.pi * fq * 2.01 * lt) * 0.20 * np.exp(-lt * 4.2)
         + np.sin(2 * math.pi * fq * 3.02 * lt) * 0.09 * np.exp(-lt * 6.5))
    seg = np.zeros(N)
    seg[n0:n1] = s * e
    lvl = 0.030 if bt < 23.0 else 0.036
    pan = 0.55 * math.sin(i * 1.7)
    add(seg, pan=pan, gain=lvl)

# ---------------------------------------------------------------- 4. סוושים במעברים
SWOOSH = [7.00, 9.30, 12.10, 14.90, 17.70, 20.50, 23.30]
for i, st in enumerate(SWOOSH):
    big = st in (7.00, 9.30, 23.30)
    dur = 1.05 if big else 0.62
    n0 = max(0, int((st - dur * 0.55) * SR))
    n1 = min(N, n0 + int(dur * SR))
    ln = n1 - n0
    lt = np.arange(ln) / SR
    u = lt / dur
    nz = rng.normal(0, 1, ln)
    # מעטפת דו-כיוונית
    e = np.exp(-((u - 0.45) ** 2) / 0.055)
    # סינון סוחף: מחברים כמה בנדים עם משקל שנע בזמן
    band = np.zeros(ln)
    CUTS = [(260, 900), (500, 1700), (950, 3100), (1800, 5600), (3300, 9500)]
    for bi, (lo, hi) in enumerate(CUTS):
        c = bi / (len(CUTS) - 1)
        wgt = np.exp(-((u - (0.12 + 0.78 * c)) ** 2) / 0.030)
        band += lp_fft(hp_fft(nz, lo, 2), hi, 2) * wgt
    seg = np.zeros(N)
    seg[n0:n1] = band * e
    add(seg, pan=0.0, gain=0.055 if big else 0.036)

# ---------------------------------------------------------------- 5. sub swell לסיום
n0, n1 = int(22.9 * SR), int(24.6 * SR)
lt = np.arange(n1 - n0) / SR
sub = np.sin(2 * math.pi * 55 * lt) * np.exp(-((lt - 0.55) ** 2) / 0.30)
seg = np.zeros(N)
seg[n0:n1] = sub
add(seg, gain=0.10)

# ---------------------------------------------------------------- mix
def finish(x):
    x = lp_fft(x, 15000, 3)
    x = hp_fft(x, 34, 2)
    return x


L, R = finish(L), finish(R)

# רוורב פשוט (Schroeder-ish) לתחושת מרחב
def reverb(x, mix=0.26):
    out = np.zeros_like(x)
    for d_ms, g in ((37, .42), (53, .36), (71, .31), (97, .26),
                    (131, .21), (173, .16), (211, .12)):
        d = int(SR * d_ms / 1000)
        out[d:] += x[:-d] * g
    out = lp_fft(out, 5200, 2)
    return x * (1 - mix) + out * mix


L = reverb(L, 0.30)
R = reverb(R, 0.30)

# fade in/out כללי
g = env([(0, 0), (0.55, 1), (28.35, 1), (29.0, 0)])
L *= g
R *= g

peak = max(np.abs(L).max(), np.abs(R).max())
L = L / peak * 0.80
R = R / peak * 0.80

# soft clip
L = np.tanh(L * 1.08) * 0.94
R = np.tanh(R * 1.08) * 0.94

out = np.empty(N * 2, dtype=np.int16)
out[0::2] = np.clip(L * 32767, -32768, 32767).astype(np.int16)
out[1::2] = np.clip(R * 32767, -32768, 32767).astype(np.int16)

path = os.path.join(BASE, "_audio.wav")
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())
print("· audio done ->", path)
