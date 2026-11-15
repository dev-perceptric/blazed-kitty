"""Swap the BIG print files into every existing top (baby tee 967, rib tank 780, crop tee 1579) in the Printful store.

Reads ck/print_big/<design>.png, makes the per-product file, uploads it to R2 (new key so Printful fetches fresh),
PUTs it onto every variant, and clears that product's photos in ck/site_shots.json so new photos get made.
Safe to re-run: products already done are listed in ck/print_big/pushed.json.
"""
import json, os, re, sys, time, urllib.request, urllib.parse
from PIL import Image
sys.argv = ['x']
_src = open('/home/user/brand/tools/printful_sync.py').read()
exec(_src[:_src.index("if __name__")])            # D1, D2, D4, D5, title(), KIND, PLACE, h(), r2_put(), plan()

BIG = '/home/user/brand/ck/print_big'; FILES = f'{BIG}/files'; os.makedirs(FILES, exist_ok=True)
SHOTS_P = '/home/user/brand/ck/site_shots.json'
DONE_P = f'{BIG}/pushed.json'
TANK_SCALE = 0.86   # 8.0 in widest line -> 6.9 in on the 7 in tank print area


def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


def big_file(d, pid):
    im = Image.open(f'{BIG}/{d}.png')                                  # 10 x 12 in @ 300 dpi
    if pid == 780:
        sm = im.resize((round(im.width * TANK_SCALE), round(im.height * TANK_SCALE)), Image.LANCZOS)
        l = (sm.width - 2100) // 2; im = sm.crop((l, 0, l + 2100, 2400))
    if pid == 1579: im = im.crop((0, 0, 3000, 3000))
    f = f'{FILES}/{d}__{pid}.png'; im.save(f, dpi=(300, 300)); return f


def pf(method, path, body=None):
    for _ in range(20):
        r = h(path, body, method)
        if r.get('code') == 429:
            w = int((re.findall(r'after (\d+) seconds', r.get('error', '')) or ['60'])[0]) + 3
            print('  rate limited, waiting', w, 's', flush=True); time.sleep(w); continue
        return r
    return r


if __name__ == '__main__':
    shots = json.load(open(SHOTS_P)); done = set(json.load(open(DONE_P))) if os.path.exists(DONE_P) else set()
    jobs = [(drop, d, v, pid) for drop, d, v, pid, white in plan() if pid in (967, 780, 1579)]
    ids = {}; off = 0
    while True:
        res = pf('GET', f'/store/products?limit=100&offset={off}').get('result', []); ids.update({slug(x['name']): x['id'] for x in res})
        if len(res) < 100: break
        off += 100
    print('tops', len(jobs), 'already pushed', len(done), 'store products', len(ids), flush=True)
    for drop, d, v, pid in jobs:
        sl = slug(f'{title(v)} {KIND[pid]}')
        if sl in done: continue
        if sl not in ids: print('not in store (skip)', sl, flush=True); continue
        url = r2_put(big_file(d, pid), f'printful/{d}__{pid}_big.png')
        prod = pf('GET', f"/store/products/{ids[sl]}")['result']
        r = pf('PUT', f"/store/products/{ids[sl]}",
               {'sync_variants': [{'id': x['id'], 'files': [{'type': PLACE[pid], 'url': url}]} for x in prod['sync_variants']]})
        if r.get('code') == 200:
            done.add(sl); json.dump(sorted(done), open(DONE_P, 'w'))   # photos are made locally by local_shots.py
            print('OK ', sl, flush=True)
        else:
            print('ERR', sl, str(r)[:300], flush=True)
    print('pushed', len(done))
