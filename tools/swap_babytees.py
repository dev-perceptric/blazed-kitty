"""Put the new slim, big-chest, no-face templates (tpl_*_6?z) on every baby tee (raglan 967 and fitted 636).

Picks a template in a color the product sells, rotates so neighbors differ, skips any where a hand would cover the print,
pastes the BIG print at true size, uploads, and records it in site_models.json and model_overrides.json.
"""
import io, json, os, re, sys, urllib.request, urllib.parse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
sys.argv = ['x', 'plan']
_e = open('/home/user/brand/tools/expand.py').read()
exec(_e[:_e.rindex("if __name__ == '__main__':")])            # jobs(), colors(), KINDS, title, slug, A, PUB
_b = open('/home/user/brand/tools/blank_lib.py').read(); g = {}
exec(_b.replace("if __name__ == '__main__':", "if False:"), g)
from PIL import Image
import numpy as np

L = json.load(open(f"{g['LIB']}/library.json"))
Z = {k: v for k, v in L.items() if re.match(r'tpl_(967|636)_[a-z]+_6\dz$', k) and v.get('ok')}
COL = {967: {'White/Pink': 'pink', 'White/Red': 'red'},
       636: {'Black': 'black', 'Bubblegum': 'bubblegum', 'White': 'white'}}
MP = '/home/user/brand/ck/site_models.json'; OVR = '/home/user/brand/ck/expand/model_overrides.json'
OUT = '/home/user/brand/ck/expand/models'; os.makedirs(OUT, exist_ok=True)


def skin_hit(k, d):
    b = L[k]; a = np.asarray(Image.open(b['file']).convert('RGB')).astype(float)
    gw = g['garment_width'](a, b); des = Image.open(f'/home/user/brand/ck/print_big/{d}.png'); des = des.crop(des.getbbox())
    tw = des.width / 300 * gw / g['GARMENT_IN'][b['pid']]; th = des.height * tw / des.width
    bx = b['box']; cx = bx['x'] + bx['w'] / 2; y0 = int(bx['y'] - 0.1 * bx['h']); m = 0.08 * tw
    reg = a[max(0, int(y0 - m)):int(y0 + th + m), max(0, int(cx - tw / 2 - m)):int(cx + tw / 2 + m)]
    if not reg.size: return True
    r, gg, bb = reg[..., 0], reg[..., 1], reg[..., 2]
    return float(((r > 95) & (r > gg + 12) & (gg > bb) & (r - bb > 25) & ((r + gg + bb) / 3 < 235)).mean()) > 0.02


if __name__ == '__main__':
    M = json.load(open(MP))
    names, off = set(), 0
    while True:
        res = h(f'/store/products?limit=100&offset={off}').get('result', []); names |= {slug(x['name']) for x in res}
        if len(res) < 100: break
        off += 100
    J = [(d, v, pid) for drop, d, v, pid in jobs() if pid in (967, 636) and slug(f'{title(v)} {KINDS[pid]}') in names]
    print('baby tees', len(J), 'templates', sorted(Z), flush=True)
    used = Counter(); plan_ = []
    for i, (d, v, pid) in enumerate(J):
        sl = slug(f'{title(v)} {KINDS[pid]}')
        cols = {COL[pid][c] for c in colors(pid, v['color']) if c in COL[pid]}
        cands = sorted([k for k, b in Z.items() if b['pid'] == pid and b['color'] in cols], key=lambda k: (used[k], (hash(k) + i) % 7))
        k = next((c for c in cands if not skin_hit(c, d)), None)
        if not k: print('keep old', sl, flush=True); continue
        used[k] += 1; plan_.append((sl, d, v, k))
    print('swapping', len(plan_), dict(used), flush=True)

    def one(p):
        sl, d, v, k = p; out = f'{OUT}/{sl}.jpg'
        g['apply_true'](L[k], f'/home/user/brand/ck/print_big/{d}.png', v['color'], out)
        buf = io.BytesIO(); Image.open(out).convert('RGB').save(buf, 'JPEG', quality=84, optimize=True, progressive=True)
        key = f'site/web/models/{sl}-sb.jpg'
        urllib.request.urlopen(urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}',
                               data=buf.getvalue(), method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/jpeg'}), timeout=120)
        return sl, f'{PUB}/{key}', k

    with ThreadPoolExecutor(6) as ex:
        res = list(ex.map(one, plan_))
    M = json.load(open(MP)); ovr = json.load(open(OVR)) if os.path.exists(OVR) else {}
    for sl, u, k in res: M[sl] = u; ovr[sl] = k
    json.dump(M, open(MP, 'w'), indent=1); json.dump(ovr, open(OVR, 'w'), indent=1)
    print('done', len(res))
