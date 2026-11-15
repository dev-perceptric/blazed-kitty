"""Find model photos where a hand/arm/hair sits where the print goes, and re-make them on a clean blank.

python3 audit_models.py list    -> print flagged photos
python3 audit_models.py fix     -> re-make flagged ones on the least-used clean blank of the same product+color, upload, update site_models.json
Covers drop 4 + drop 5 (ck/drop*/models/_list.json) and the expansion (ck/expand/model_blanks.json).
"""
import io, json, os, re, sys, urllib.request, urllib.parse
from collections import Counter
import numpy as np
from PIL import Image
MODE = sys.argv[1] if len(sys.argv) > 1 else 'list'
_b = open('/home/user/brand/tools/blank_lib.py').read(); g = {}
exec(_b.replace("if __name__ == '__main__':", "if False:"), g)
LIB = g['LIB']; L = json.load(open(f'{LIB}/library.json'))
A = '8954ffc36634674f7163d2a03600e7fb'; PUB = 'https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
D = {}
for f in ['ck_designs.json', 'ck_designs_drop2.json', 'ck_designs_drop4.json', 'ck_designs_drop5.json', 'ck_designs_drop6.json']:
    D.update(json.load(open('/home/user/brand/tools/' + f)))
KIND = {'bt': 'Baby Tee', 'tk': 'Rib Tank', 'ct': 'Crop Tee'}


def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


def title(v):
    if v.get('title'): return v['title']
    t = ' '.join(v['lines']).replace('  ', ' ').lower()
    return ' '.join(w[:1].upper() + w[1:] for w in t.split()).replace(' To ', ' to ').replace(' A ', ' a ').replace('Of Bad', 'of Bad')


def skin_frac(k, d):
    b = L[k]
    if b['pid'] not in g['GARMENT_IN']: return 0
    a = np.asarray(Image.open(b['file']).convert('RGB')).astype(float)
    gw = g['garment_width'](a, b); des = Image.open(f'/home/user/brand/ck/print_big/{d}.png'); des = des.crop(des.getbbox())
    tw = des.width / 300 * g['FILE_SCALE'][b['pid']] * gw / g['GARMENT_IN'][b['pid']]; th = des.height * tw / des.width
    bx = b['box']; cx = bx['x'] + bx['w'] / 2; y0 = int(bx['y'] - 0.1 * bx['h'])
    m = 0.08 * tw
    reg = a[max(0, int(y0 - m)):int(y0 + th + m), max(0, int(cx - tw / 2 - m)):int(cx + tw / 2 + m)]
    if not reg.size: return 1
    r, gg, bb = reg[..., 0], reg[..., 1], reg[..., 2]
    skin = (r > 95) & (r > gg + 12) & (gg > bb) & (r - bb > 25) & ((r + gg + bb) / 3 < 235)
    return float(skin.mean())


OVR = '/home/user/brand/ck/expand/model_overrides.json'


def items():
    ovr = json.load(open(OVR)) if os.path.exists(OVR) else {}
    return [(sl, d, ovr.get(sl, k), L[ovr[sl]]['color'] if sl in ovr and ovr[sl] in L else col) for sl, d, k, col in _items()]


def _items():
    out = []
    for lf in ['/home/user/brand/ck/drop4/models/_list.json', '/home/user/brand/ck/drop5/models/_list.json']:
        for o, k in json.load(open(lf)):
            n = os.path.basename(o)[:-4]; d, rest = n.split('__'); p = rest.split('_')[0]
            if p in KIND: out.append((slug(f'{title(D[d])} {KIND[p]}'), d, k, rest.split('_', 1)[1]))
    ub = '/home/user/brand/ck/expand/model_blanks.json'
    if os.path.exists(ub):
        by_slug = {}
        for d, v in D.items():
            for kind in ('Baby Tee', 'Fitted Baby Tee', 'Crop Tee', 'Rib Tank', 'Tee', 'Tank', 'Cropped Hoodie', 'Heavyweight Hoodie'):
                by_slug[slug(f'{title(v)} {kind}')] = d
        for sl, k in json.load(open(ub)).items():
            if sl in by_slug and k in L: out.append((sl, by_slug[sl], k, L[k]['color']))
    return out


if __name__ == '__main__':
    flagged = []
    for sl, d, k, col in items():
        f = skin_frac(k, d)
        if f > 0.02: flagged.append((sl, d, k, col, round(f, 3)))
    print('checked', len(items()), 'flagged', len(flagged))
    for x in flagged: print(' ', x)
    if MODE == 'fix' and flagged:
        M = json.load(open('/home/user/brand/ck/site_models.json'))
        bad = {k for _, _, k, _, _ in flagged}
        use = Counter(k for _, _, k, _ in items())
        for sl, d, k, col, f in flagged:
            pid = L[k]['pid']
            cands = sorted([c for c, b in L.items() if b.get('ok') and b['pid'] == pid and b['color'] == col and c not in bad],
                           key=lambda c: (use[c], c))
            nk = next((c for c in cands if skin_frac(c, d) <= 0.02), None)
            if not nk: print('no clean blank for', sl, col); continue
            use[nk] += 1
            out = f'/home/user/brand/ck/expand/models/{sl}.jpg'; os.makedirs(os.path.dirname(out), exist_ok=True)
            g['apply_true'](L[nk], f'/home/user/brand/ck/print_big/{d}.png', D[d]['color'], out)
            buf = io.BytesIO(); Image.open(out).convert('RGB').save(buf, 'JPEG', quality=84, optimize=True, progressive=True)
            key = f'site/web/models/{sl}-r.jpg'
            urllib.request.urlopen(urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}',
                                   data=buf.getvalue(), method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/jpeg'}), timeout=120)
            M[sl] = f'{PUB}/{key}'; print('fixed', sl, k, '->', nk)
            ovr = json.load(open(OVR)) if os.path.exists(OVR) else {}; ovr[sl] = nk; json.dump(ovr, open(OVR, 'w'), indent=1)
        json.dump(M, open('/home/user/brand/ck/site_models.json', 'w'), indent=1)
