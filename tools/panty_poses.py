"""Give every string bottom (669) 3 new pose photos from the white panty templates.

Each product gets 3 different poses (rotated so neighbors differ), recolored to its fabric (white, or black for light inks),
with its print pasted on the flat front panel. Uploaded to R2; ck/site_models.json gets a list:
[new pose 1, new pose 2, new pose 3, old studio photo].
"""
import io, json, os, re, sys, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
sys.argv = ['x']
sys.path.insert(0, '/home/user/brand/tools')
_src = open('/home/user/brand/tools/printful_sync.py').read()
exec(_src[:_src.index("if __name__")])                 # plan(), title(), KIND, A, PUB
_b = open('/home/user/brand/tools/blank_lib.py').read(); _g = {}
exec(_b.replace("if __name__ == '__main__':", "if False:"), _g)
apply = _g['apply']
from recolor import recolor, LIB
from PIL import Image

OUT = '/home/user/brand/ck/panty_poses'; os.makedirs(OUT, exist_ok=True)
MODELS_P = '/home/user/brand/ck/site_models.json'
LIGHT = ('#FFFFFF', '#9FD3F5')


def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


def r2(path, key):
    url = f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    b = io.BytesIO(); Image.open(path).convert('RGB').save(b, 'JPEG', quality=84, optimize=True, progressive=True)
    urllib.request.urlopen(urllib.request.Request(url, data=b.getvalue(), method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/jpeg'}), timeout=120)
    return f'{PUB}/{key}'


if __name__ == '__main__':
    L = json.load(open(f'{LIB}/library.json'))
    def whiteish(v): r = v.get('fabric_rgb') or [0, 0, 0]; return min(r) > 160 and max(r) - min(r) < 13
    tpl = sorted(k for k, v in L.items() if k.startswith('tpl_669_white_1') and v.get('ok') and not v.get('recolored_from') and whiteish(v))
    print('dropped (not white fabric):', sorted(k for k, v in L.items() if k.startswith('tpl_669_white_1') and not v.get('recolored_from') and not whiteish(v)))
    poses = {}
    for k in tpl: poses.setdefault((int(k.rsplit('_', 1)[1]) - 100) // 3, []).append(k)
    P = sorted(poses); print('poses', len(P), 'templates', len(tpl), flush=True)
    # black versions of every template, once
    for k in tpl:
        bk = k.replace('_white_', '_black_')
        L.pop(bk, None)
        recolor(k, 'black', L)
    json.dump(L, open(f'{LIB}/library.json', 'w'), indent=1)

    jobs = [(d, v) for drop, d, v, pid, white in plan() if pid == 669]
    print('panties', len(jobs), flush=True)

    def one(ix_job):
        i, (d, v) = ix_job
        sl = slug(f'{title(v)} {KIND[669]}')
        fabric = 'black' if v['color'].upper() in LIGHT else 'white'
        urls = []
        pool = [(pose, k) for pose in P for k in poses[pose]]
        if fabric == 'black':
            pool = [(pose, k.replace('_white_', '_black_')) for pose, k in pool if k.replace('_white_', '_black_') in L and pose != 0]   # no jeans pose on black
        seen, picks = set(), []
        for step in range(len(pool)):
            pose, k = pool[(i * 5 + step * 7) % len(pool)]
            if pose in seen: continue
            seen.add(pose); picks.append(k)
            if len(picks) == 3: break
        for j, k in enumerate(picks):
            out = f'{OUT}/{sl}__{j}.jpg'
            apply(L[k], f'/home/user/brand/ck/print/{d}.png', v['color'], out, crop=False)
            Image.open(out).convert('RGB').resize((1600, 2000), Image.LANCZOS).save(out, quality=90)
            urls.append(r2(out, f'site/web/models/{sl}-pose{j}.jpg'))
        return sl, urls

    with ThreadPoolExecutor(6) as ex:
        res = list(ex.map(one, enumerate(jobs)))
    M = json.load(open(MODELS_P))
    for sl, urls in res:
        old = M.get(sl); old = old if isinstance(old, list) else ([old] if old else [])
        old = [u for u in old if '-pose' not in u]
        M[sl] = urls + old[-1:]
    json.dump(M, open(MODELS_P, 'w'), indent=1)
    print('done', len(res))
