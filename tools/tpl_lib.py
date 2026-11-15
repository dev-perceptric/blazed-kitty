"""Turn green-marker templates into library blanks.

For each ck/photos/tpl/raw/tpl_<pid>_<color>_<n>.jpg:
  - find the neon green marker, record its box and tilt
  - paint the marker away with blurred surrounding fabric
  - save a 2x blank to ck/library/<pid>_<color>/ and add it to library.json
A template is rejected if the marker is missing, tiny, broken into pieces, or not a clean rectangle.
"""
import os, re, sys, json, glob
import numpy as np
from PIL import Image, ImageFilter

_src = open('/home/user/brand/tools/print_paste.py').read()
exec(_src[:_src.index('BOXES={}')])          # components(), blur_fill()

LIB = '/home/user/brand/ck/library'
RAW = '/home/user/brand/ck/photos/tpl/raw'


def marker(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (g > 150) & (g - r > 70) & (g - b > 70)


def process(f):
    n = os.path.basename(f)[:-4]
    m = re.match(r'tpl_(\d+)_([a-z]+)_(\d+)', n)
    pid, color = int(m.group(1)), m.group(2)
    im = Image.open(f).convert('RGB'); im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    a = np.asarray(im).astype(float); H, W = a.shape[:2]
    mk = marker(a)
    small = np.asarray(Image.fromarray((mk * 255).astype('uint8')).resize((W // 8, H // 8), Image.BOX)) > 60
    comps = [c for c in components(small) if len(c) > 20]
    if not comps:
        return n, None, 'no marker'
    main = max(comps, key=len)
    if len(comps) > 1 and sorted(map(len, comps))[-2] > 0.15 * len(main):
        return n, None, 'marker in pieces'
    y0, x0 = main.min(0) * 8; y1, x1 = (main.max(0) + 1) * 8
    y0, x0, y1, x1 = max(0, y0 - 8), max(0, x0 - 8), min(H, y1 + 8), min(W, x1 + 8)
    sub = mk[y0:y1, x0:x1]; ys, xs = np.nonzero(sub)
    ty0, ty1, tx0, tx1 = ys.min() + y0, ys.max() + y0, xs.min() + x0, xs.max() + x0
    w, h = tx1 - tx0, ty1 - ty0
    fill = sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1].mean()
    if w < 0.06 * W:
        return n, None, f'marker too small ({w / W:.2f})'
    if fill < 0.68:
        return n, None, f'marker not a clean rectangle (fill {fill:.2f})'
    cy, cx = ys.mean(), xs.mean(); cov = np.cov(np.vstack([xs - cx, ys - cy]))
    ang = float(np.clip(np.degrees(0.5 * np.arctan2(2 * cov[0, 1], cov[0, 0] - cov[1, 1])), -8, 8))
    # erase: inpaint the grown marker at 1x, add back film grain, then upscale
    import cv2
    a1 = np.asarray(Image.open(f).convert('RGB'))
    mk1 = marker(a1.astype(float)).astype('uint8') * 255
    mk1 = cv2.dilate(mk1, np.ones((7, 7), np.uint8))
    inp = cv2.inpaint(cv2.cvtColor(a1, cv2.COLOR_RGB2BGR), mk1, 7, cv2.INPAINT_TELEA)
    inp = cv2.cvtColor(inp, cv2.COLOR_BGR2RGB).astype(float)
    ring = cv2.dilate(mk1, np.ones((41, 41), np.uint8)) & ~mk1
    hp = a1.astype(float) - cv2.GaussianBlur(a1, (0, 0), 2).astype(float)
    sd = hp[ring > 0].std(0) if (ring > 0).any() else np.zeros(3)
    noise = np.random.default_rng(1).normal(0, 1, a1.shape[:2])[..., None] * sd
    soft = cv2.GaussianBlur(mk1.astype(float) / 255, (0, 0), 1.5)[..., None]
    a1o = inp + noise * soft
    out = np.asarray(Image.fromarray(np.clip(a1o, 0, 255).astype('uint8')).resize((W, H), Image.LANCZOS)).astype(float)
    left = marker(out).sum()
    if left > 50:
        return n, None, 'green left after erase'
    folder = f'{LIB}/{pid}_{color}'; os.makedirs(folder, exist_ok=True)
    path = f'{folder}/{n}.jpg'
    Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(path, quality=92)
    reg = out[ty0:ty1, tx0:tx1].reshape(-1, 3)
    return n, dict(file=path, pid=pid, color=color, box=dict(x=int(tx0), y=int(ty0), w=int(w), h=int(h), ang=ang), extra=0, leftover=0,
                   src=f, fabric_rgb=np.median(reg, 0).round().tolist(), ok=True, template=True), 'ok'


if __name__ == '__main__':
    lib = json.load(open(f'{LIB}/library.json'))
    files = sorted(glob.glob(f'{RAW}/tpl_*.jpg'))
    good = bad = 0
    for f in files:
        n, entry, why = process(f)
        if entry:
            lib[n] = entry; good += 1
        else:
            lib.pop(n, None); bad += 1; print('reject', n, why, flush=True)
    json.dump(lib, open(f'{LIB}/library.json', 'w'), indent=1)
    print('templates ok', good, 'rejected', bad)
