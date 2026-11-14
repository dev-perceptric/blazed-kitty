"""Refit every 669 string-bottom print inside Printful's dotted safe print area (front piece), as big as it will go."""
import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
# Inside Printful's dotted "safe print area" on the front piece (measured from the template), upper part where text reads.
POLY = [(1010, 780), (2740, 780), (2310, 1720), (1540, 1720)]
pm = Image.new('L', (7500, 3300), 0); ImageDraw.Draw(pm).polygon(POLY, fill=255)
SAFE = np.asarray(pm) > 0
ys, xs = np.nonzero(SAFE)

def place(txt, maxs=0.80):
    """Largest scale <= maxs (and its position) so every ink pixel sits inside SAFE."""
    al0 = np.asarray(txt.getchannel('A')) > 40
    cx = int(xs.mean())
    s = maxs
    while s > 0.15:
        w, h = round(txt.width * s), round(txt.height * s)
        al = np.asarray(txt.getchannel('A').resize((w, h), Image.BILINEAR)) > 40
        yy, xx = np.nonzero(al)
        for top in [max(ys.min(), (ys.min() + ys.max()) // 2 - h // 2 - 120 + d) for d in range(0, 400, 20)]:
            x0 = cx - w // 2
            Y, X = yy + top, xx + x0
            if X.min() < 0 or Y.max() >= 3300: break
            if SAFE[Y, X].all(): return s, x0, top
        s *= 0.96
    raise SystemExit('cannot fit')

if __name__ == '__main__':
    import sys
    D = json.load(open('/home/user/brand/tools/ck_designs_all.json'))
    FAB = {'#FFFFFF': '#151515'}
    for k, v in D.items():
        if not v.get('panty'): continue
        txt = Image.open(f'/home/user/brand/ck/print/{k}.png'); txt = txt.crop(txt.getbbox())
        s, x0, top = place(txt)
        r = txt.resize((round(txt.width * s), round(txt.height * s)), Image.LANCZOS)
        c = Image.new('RGB', (7500, 3300), FAB.get(v['color'], '#FFFFFF')); c.paste(r, (x0, top), r)
        c.save(f'/home/user/brand/ck/print/panty_669/{k}.png', dpi=(150, 150))
        print(k, 'scale', round(s, 2), 'size', r.size)
