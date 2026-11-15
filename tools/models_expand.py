"""Model photos for expansion products (baby tee, crop tee, rib tank, men's tee and tank) at true print size.

Picks a blank in one of the product's colors, least-used first so models rotate, pastes the BIG print with apply_true,
uploads to R2 and records the URL in ck/site_models.json. Skips products that already have a model photo.
"""
import io, json, os, re, sys, urllib.request, urllib.parse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
sys.argv = ['x', 'plan']
_e = open('/home/user/brand/tools/expand.py').read()
exec(_e[:_e.rindex("if __name__ == '__main__':")])          # jobs(), colors(), KINDS, title, h, A, PUB
_b = open('/home/user/brand/tools/blank_lib.py').read(); _g = {}
exec(_b.replace("if __name__ == '__main__':", "if False:"), _g)
apply_true, LIB = _g['apply_true'], _g['LIB']
from PIL import Image

LIBCOL = {  # Printful color -> library color name
    967: {'White/Pink': 'pink', 'White/Red': 'red', 'White/Black': 'black', 'White /True Royal': 'trueroyal', 'White/Baby Blue': 'babyblue', 'White/Navy': 'navy'},
    780: {'Solid White Blend': 'white', 'Solid Baby Blue Blend': 'babyblue', 'Athletic Heather': 'heather', 'Solid Black Blend': 'black', 'Solid Navy Blend': 'navy'},
    1579: {'Vintage White': 'vintagewhite', 'Light Washed Denim': 'lightdenim', 'Washed Black': 'washedblack'},
    71: {'White': 'white', 'Black': 'black', 'Athletic Heather': 'heather'},
    248: {'White': 'white', 'Black': 'black'},
    317: {'Black': 'black', 'Storm': 'storm', 'Peach': 'peach'},
    892: {'White': 'white', 'Black': 'black', 'Athletic Heather': 'heather'},
}
OUT = '/home/user/brand/ck/expand/models'; os.makedirs(OUT, exist_ok=True)
MP = '/home/user/brand/ck/site_models.json'


def r2(path, key):
    b = io.BytesIO(); Image.open(path).convert('RGB').save(b, 'JPEG', quality=84, optimize=True, progressive=True)
    urllib.request.urlopen(urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}',
                           data=b.getvalue(), method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/jpeg'}), timeout=120)
    return f'{PUB}/{key}'


if __name__ == '__main__':
    L = json.load(open(f'{LIB}/library.json')); M = json.load(open(MP))
    names, off = set(), 0
    while True:
        res = h(f'/store/products?limit=100&offset={off}').get('result', []); names |= {slug(x['name']) for x in res}
        if len(res) < 100: break
        off += 100
    J = [j for j in jobs() if j[3] in LIBCOL]
    J = [j for j in J if slug(f'{title(j[2])} {KINDS[j[3]]}') in names and slug(f'{title(j[2])} {KINDS[j[3]]}') not in M]
    import numpy as np
    def skin_hit(k, d):
        # does a hand / arm / hair sit where the true-size print will go?
        b = L[k]; a = np.asarray(Image.open(b['file']).convert('RGB')).astype(float)
        gw = _g['garment_width'](a, b); des = Image.open(f'/home/user/brand/ck/print_big/{d}.png'); des = des.crop(des.getbbox())
        tw = des.width / 300 * _g['FILE_SCALE'][b['pid']] * gw / _g['GARMENT_IN'][b['pid']]; th = des.height * tw / des.width
        bx = b['box']; cx = bx['x'] + bx['w'] / 2; y0 = int(bx['y'] - 0.1 * bx['h'])
        reg = a[max(0, y0):int(y0 + th), max(0, int(cx - tw / 2)):int(cx + tw / 2)]
        if not reg.size: return True
        r, g, bb = reg[..., 0], reg[..., 1], reg[..., 2]
        skin = (r > 95) & (r > g + 12) & (g > bb) & (r - bb > 25) & ((r + g + bb) / 3 < 235)
        return skin.mean() > 0.03
    L['highclub__bt_black__00a']['ok'] = False
    UB = '/home/user/brand/ck/expand/model_blanks.json'
    usedmap = json.load(open(UB)) if os.path.exists(UB) else {}
    used = Counter(usedmap.values())
    plan_ = []
    for drop, d, v, pid in J:
        cands = []
        for c in colors(pid, v['color']):
            lc = LIBCOL[pid].get(c)
            if lc: cands += [k for k, b in L.items() if b.get('ok') and b['pid'] == pid and b['color'] == lc]
        if not cands: print('no blank', d, pid, flush=True); continue
        cands = sorted(cands, key=lambda k: (used[k], L[k].get('extra', 0), k))
        k = next((c for c in cands if not skin_hit(c, d)), None)
        if not k: print('only blocked blanks for', d, pid, flush=True); continue
        used[k] += 1; usedmap[slug(f'{title(v)} {KINDS[pid]}')] = k
        plan_.append((d, v, pid, k))
    json.dump(usedmap, open(UB, 'w'), indent=1)
    print('model photos to make', len(plan_), flush=True)

    def one(p):
        d, v, pid, k = p
        sl = slug(f'{title(v)} {KINDS[pid]}'); out = f'{OUT}/{sl}.jpg'
        apply_true(L[k], f'/home/user/brand/ck/print_big/{d}.png', v['color'], out)
        return sl, r2(out, f'site/web/models/{sl}-x2.jpg')

    with ThreadPoolExecutor(6) as ex:
        res = list(ex.map(one, plan_))
    M = json.load(open(MP))
    for sl, u in res: M[sl] = u
    json.dump(M, open(MP, 'w'), indent=1)
    print('done', len(res))
