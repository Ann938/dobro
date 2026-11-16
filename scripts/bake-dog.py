# Собака для первого экрана из вырезанных кадров (research/cut/NNNN.png, RGBA 1920×1080, 24 fps, Mixkit 1552).
# Кадры кладутся на ровный фон сайта, нос — по центру по горизонтали (тогда отражение для взгляда вправо не сдвигает собаку).
#   public/dog/idle.mp4      — дыхание с улыбкой, зациклено с плавным стыком;
#   public/dog/turn/NN.jpg   — поворот головы: 00 — в камеру, последний — профиль (взгляд влево от зрителя).
# python -I scripts/bake-dog.py research/cut public/dog <ffmpeg>
import sys, os, glob, subprocess, numpy as np
from PIL import Image

src, out, ff = sys.argv[1:4]
BG = (241, 228, 211)  # --bg сайта, #f1e4d3
W, H = 1280, 720
SHIFT = 120  # сдвиг (в пикселях исходника 1920), чтобы нос оказался по центру

fs = sorted(glob.glob(f"{src}/*.png"))
print("frames", len(fs))


def bake(f):
    im = Image.open(f).convert("RGBA")
    c = Image.new("RGBA", im.size, BG + (255,))
    c.alpha_composite(im, (SHIFT, 0))
    return c.convert("RGB").resize((W, H), Image.LANCZOS)


def small(i):
    return np.asarray(Image.open(fs[i]).convert("RGBA").resize((160, 90)), np.float32)


# лучший цикл дыхания: два похожих кадра в 0–10 с, расстояние не меньше 4 с
cand = list(range(12, 248, 2))
S = {i: small(i) for i in cand}
best = None
for a in cand:
    for b in cand:
        if b - a < 96:
            continue
        d = float(np.mean(np.abs(S[a] - S[b])))
        if best is None or d < best[0]:
            best = (d, a, b)
d, a, b = best
print("loop", a, b, round(d, 2))

os.makedirs(f"{out}/idle", exist_ok=True)
tmp = f"{out}/idle"
X = 10  # кадров на сшивку: конец цикла плавно переходит в его начало
frames = [bake(fs[i]) for i in range(a, b + 1)]
for k in range(X):
    t = (k + 1) / (X + 1)
    frames[-X + k] = Image.blend(frames[-X + k], frames[k], t)
frames = frames[: len(frames) - 0]
for i, im in enumerate(frames):
    im.save(f"{tmp}/{i:04d}.png")
subprocess.run([ff, "-y", "-loglevel", "error", "-framerate", "24", "-i", f"{tmp}/%04d.png", "-c:v", "libx264", "-preset", "slow",
                "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", f"{out}/idle.mp4"], check=True)
for f in glob.glob(f"{tmp}/*.png"):
    os.remove(f)
os.rmdir(tmp)

# поворот головы: 16.5–17.6 с (профиль → камера), разворачиваем: 0 — в камеру
T0, T1 = int(16.4 * 24), int(17.7 * 24)
os.makedirs(f"{out}/turn", exist_ok=True)
seq = list(range(T1, T0 - 1, -1))
for k, i in enumerate(seq):
    bake(fs[i]).save(f"{out}/turn/{k:02d}.jpg", quality=86)
print("turn", len(seq), "idle", len(frames), os.path.getsize(f"{out}/idle.mp4"))
