"""Blank model library.

build : turn existing model photos into blanks (AI print erased) and record where the print sits.
apply : paste any design onto a blank -> finished model photo.

Library lives in /home/user/brand/ck/library/<pid>_<color>/<id>.jpg with library.json next to it.
"""
import os, sys, json, glob, re
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, '/home/user/brand/tools')
_src = open('/home/user/brand/tools/print_paste.py').read()
exec(_src[:_src.index('BOXES={}')])          # components(), blur_fill()

LIB = '/home/user/brand/ck/library'
D_ALL = json.load(open('/home/user/brand/tools/ck_designs_all30.json'))
PROD = {'bt': 967, 'tk': 780, 'ct': 1579, 'set': 669, 'vcut': 872}
FABRIC_NAMES = {'#151515': 'black', '#FFFFFF': 'white', '#FF4F9A': 'hotpink', '#C81E32': 'red', '#A9D4F5': 'babyblue'}


def ink_mask(a, ink_hex):
    INKC = np.array([int(ink_hex[i:i + 2], 16) for i in (1, 3, 5)], float)
    sat = a.max(-1) - a.min(-1)
    if INKC.min() > 200:
        return 'white', (a.min(-1) > 195) & (sat < 40), INKC
    if INKC.max() < 60:
        return 'black', a.max(-1) < 75, INKC
    return 'color', (np.sqrt(((a - INKC) ** 2).sum(-1)) < 90) & (sat > 70), INKC


def find_blocks(a, ink, design, W):
    small = Image.fromarray((ink * 255).astype('uint8')).resize((a.shape[1] // 8, a.shape[0] // 8), Image.BOX)
    sm = np.asarray(small.filter(ImageFilter.MaxFilter(5))) > 20
    out = []
    for comp in components(sm):
        if len(comp) < 12: continue
        y0, x0 = comp.min(0) * 8; y1, x1 = (comp.max(0) + 1) * 8
        blk = ink[y0:y1, x0:x1]; fill = blk.mean()
        if fill < 0.05 or fill > 0.5 or (x1 - x0) < 0.035 * W: continue
        ys, xs = np.nonzero(blk); ty0, ty1, tx0, tx1 = ys.min() + y0, ys.max() + y0, xs.min() + x0, xs.max() + x0
        w, h = tx1 - tx0, ty1 - ty0
        ar = (w / max(h, 1)) / (design.width / design.height)
        if not (0.6 < ar < 1.6) or w > 0.8 * W: continue
        cy, cx = ys.mean(), xs.mean(); cov = np.cov(np.vstack([xs - cx, ys - cy]))
        ang = float(np.clip(np.degrees(0.5 * np.arctan2(2 * cov[0, 1], cov[0, 0] - cov[1, 1])), -8, 8))
        out.append(dict(x=int(tx0), y=int(ty0), w=int(w), h=int(h), ang=ang))
    return out


def erase(a, box, kind, INKC):
    tx0, ty0, w, h = box['x'], box['y'], box['w'], box['h']
    Y0, Y1, X0, X1 = max(0, ty0 - 14), ty0 + h + 15, max(0, tx0 - 14), tx0 + w + 15
    sub = a[Y0:Y1, X0:X1]
    if kind == 'white': soft = (sub.min(-1) > 150) & ((sub.max(-1) - sub.min(-1)) < 50)
    elif kind == 'black': soft = sub.max(-1) < 120
    else: soft = np.sqrt(((sub - INKC) ** 2).sum(-1)) < 140
    m = np.zeros(a.shape[:2]); m[Y0:Y1, X0:X1] = np.asarray(Image.fromarray((soft * 255).astype('uint8')).filter(ImageFilter.MaxFilter(9))) / 255
    fab = blur_fill(a, m, int(max(8, h // 7)))
    return a * (1 - m[..., None]) + fab * m[..., None]


def fabric_color(a, box):
    """Median color of the fabric right around the print -> nearest named fabric."""
    x, y, w, h = box['x'], box['y'], box['w'], box['h']
    ring = np.concatenate([a[max(0, y - 30):y - 8, x:x + w].reshape(-1, 3), a[y + h + 8:y + h + 30, x:x + w].reshape(-1, 3)])
    med = np.median(ring, 0)
    best = min(FABRIC_NAMES, key=lambda hx: sum((med - np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)])) ** 2))
    return FABRIC_NAMES[best], med.round().tolist()


def build(paths):
    lib = json.load(open(f'{LIB}/library.json')) if os.path.exists(f'{LIB}/library.json') else {}
    for f in paths:
        n = os.path.basename(f)[:-4]
        if n in lib: continue
        parts = n.split('__'); d = parts[0]; prod = parts[1]
        if d not in D_ALL: continue
        v = D_ALL[d]; pkey = prod.split('_')[0]; pid = PROD[pkey]
        design = Image.open(f'/home/user/brand/ck/print/{d}.png'); design = design.crop(design.getbbox())
        im = Image.open(f).convert('RGB'); im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        a = np.asarray(im).astype(float)
        kind, ink, INKC = ink_mask(a, v['color'])
        blocks = find_blocks(a, ink, design, im.width)
        if not blocks:
            print('skip (no print found)', n, flush=True); continue
        main = max(blocks, key=lambda b: b['y']) if pkey in ('set', 'vcut') else max(blocks, key=lambda b: b['w'] * b['h'])
        out = a.copy()
        for b in blocks: out = erase(out, b, kind, INKC)
        # left-over check: any print-like ink still visible?
        k2, ink2, _ = ink_mask(out, v['color'])
        left = len(find_blocks(out, ink2, design, im.width))
        if pkey in ('set', 'vcut'):
            color, med = fabric_color(out, main)
        else:
            color = prod.split('_', 1)[1]; med = None
        folder = f'{LIB}/{pid}_{color}'; os.makedirs(folder, exist_ok=True)
        Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(f'{folder}/{n}.jpg', quality=92)
        lib[n] = dict(file=f'{folder}/{n}.jpg', pid=pid, color=color, box=main, extra=len(blocks) - 1, leftover=left,
                      src=f, fabric_rgb=med, ok=left == 0)
        print('blank', n, pid, color, 'leftover' if left else 'clean', flush=True)
        json.dump(lib, open(f'{LIB}/library.json', 'w'), indent=1)
    return lib


def apply(blank, design_png, ink_hex, out_path, crop=True):
    """Paste a design onto a blank. Fits the print box, keeps aspect, rotates and shades with the fabric."""
    a = np.asarray(Image.open(blank['file']).convert('RGB')).astype(float)
    b = blank['box']
    design = Image.open(design_png); design = design.crop(design.getbbox())
    s = min(b['w'] / design.width, max(b['h'] * 1.25, b['w'] * 0.8) / design.height)   # tall designs may grow down
    d = design.resize((max(1, round(design.width * s)), max(1, round(design.height * s))), Image.LANCZOS).rotate(-b['ang'], expand=True, resample=Image.BICUBIC)
    da = np.asarray(d).astype(float)
    cx, cy = b['x'] + b['w'] / 2, b['y'] + b['h'] / 2
    px, py = int(cx - d.width / 2), int(cy - d.height / 2)
    if d.height > b['h'] * 1.3: py = int(b['y'] - 0.15 * b['h'])   # tall design: start at the old print's top
    reg = a[py:py + d.height, px:px + d.width]; H, W = reg.shape[:2]; da = da[:H, :W]
    fl = Image.fromarray(np.clip(reg, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(6))
    fl = np.asarray(fl).astype(float).mean(-1, keepdims=True)
    INKC = np.array([int(ink_hex[i:i + 2], 16) for i in (1, 3, 5)], float)
    shade = np.clip(0.75 + fl / 255, 0.8, 1.0) if INKC.min() > 200 else np.clip(fl / np.percentile(fl, 90), 0.55, 1.05)
    al = da[..., 3:4] / 255
    a[py:py + H, px:px + W] = reg * (1 - al) + da[..., :3] * shade * al
    img = Image.fromarray(np.clip(a, 0, 255).astype('uint8'))
    if crop:
        Wd, Hd = img.size; pw = d.width
        panty = blank['pid'] in (669, 872)
        cw = min(Wd, max(pw * (2.6 if panty else 2.3), Wd * (0.75 if panty else 0.55))); ch = cw * 5 / 4
        if ch > Hd: ch = Hd; cw = ch * 4 / 5
        top = cy - ch * (0.55 if panty else 0.42); left = cx - cw / 2
        left = max(0, min(Wd - cw, left)); top = max(0, min(Hd - ch, top))
        img = img.crop((int(left), int(top), int(left + cw), int(top + ch))).resize((1600, 2000), Image.LANCZOS)
    img.save(out_path, quality=92)
    return out_path


if __name__ == '__main__':
    paths = sorted(glob.glob('/home/user/brand/ck/photos/b6all/raw/*.jpg')) + \
            sorted(glob.glob('/home/user/brand/ck/photos/panties7/raw/*.jpg')) + \
            sorted(glob.glob('/home/user/brand/ck/photos/panties7/redo_raw/*.jpg'))
    lib = build(paths)
    ok = [k for k, v in lib.items() if v['ok']]
    print('blanks', len(lib), 'clean', len(ok))
