"""Product photos for every top made locally from Printful's own blank templates (no Printful rate limit).

For baby tee 967, rib tank 780 and crop tee 1579: one front photo per color, with the BIG print file placed in
Printful's exact print area and shaded with the fabric. 2000x2000 JPEG on white, uploaded to R2.
Writes the product's entry in ck/site_shots.json (name, printful_id, product_id, colors, shots).
"""
import io, json, os, re, sys, urllib.request, urllib.parse
import numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
sys.argv = ['x']
_src = open('/home/user/brand/tools/printful_sync.py').read()
exec(_src[:_src.index("if __name__")])            # D1.., title(), KIND, COLS, CAT, plan(), h()

TPL = '/home/user/brand/ck/pf_tpl'; os.makedirs(TPL, exist_ok=True)
BIGF = '/home/user/brand/ck/print_big/files'
SHOTS_P = '/home/user/brand/ck/site_shots.json'
PLACEMENT = {967: 'front', 780: 'front', 1579: 'front_dtf'}
OUT_PX = 2000


def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


def load_templates(pid):
    f = f'{TPL}/tpl_{pid}.json'
    if not os.path.exists(f):
        open(f, 'w').write(json.dumps(h(f'/mockup-generator/templates/{pid}')))
    r = json.load(open(f))['result']
    T = {t['template_id']: t for t in r['templates']}
    vm = {m['variant_id']: next((T[x['template_id']] for x in m['templates'] if x['placement'] == PLACEMENT[pid]), None) for m in r['variant_mapping']}
    return vm


def tpl_image(t):
    name = re.sub(r'[^A-Za-z0-9]+', '_', t['image_url'].split('/m/')[-1].split('?')[0])
    f = f'{TPL}/{name}'
    if not os.path.exists(f):
        data = urllib.request.urlopen(urllib.request.Request(t['image_url'], headers={'User-Agent': 'bk/1.0'}), timeout=60).read()
        open(f + '.tmp', 'wb').write(data); os.replace(f + '.tmp', f)
    return Image.open(f).convert('RGBA')


def compose(t, print_png, ink_hex):
    base = tpl_image(t).resize((OUT_PX, OUT_PX), Image.LANCZOS)
    a = np.asarray(base).astype(float); rgb, al = a[..., :3], a[..., 3:4] / 255
    tinted = 'whitebg.png' in t['image_url']
    s = OUT_PX / t['template_width']
    x, y, w, hh = t['print_area_left'] * s, t['print_area_top'] * s, t['print_area_width'] * s, t['print_area_height'] * s
    pr = np.asarray(Image.open(print_png).convert('RGBA').resize((round(w), round(hh)), Image.LANCZOS)).astype(float)
    X, Y = int(round(x)), int(round(y))
    if tinted:
        # Printful ghost template: opaque white background + see-through garment with shading on top.
        # Layers: fabric color -> print -> template on top.
        col = np.array([int(t['background_color'][i:i + 2], 16) for i in (1, 3, 5)], float)
        under = np.ones_like(rgb) * col
        reg = under[Y:Y + pr.shape[0], X:X + pr.shape[1]]; p = pr[:reg.shape[0], :reg.shape[1]]; pa = p[..., 3:4] / 255
        under[Y:Y + reg.shape[0], X:X + reg.shape[1]] = reg * (1 - pa) + p[..., :3] * pa
        out = rgb * al + under * (1 - al)
    else:
        # full-color garment photo (raglan): print multiplied by the fabric shading
        out = rgb * al + 255 * (1 - al)
        L = out.mean(-1, keepdims=True)
        reg = out[Y:Y + pr.shape[0], X:X + pr.shape[1]]; p = pr[:reg.shape[0], :reg.shape[1]]; pa = p[..., 3:4] / 255
        Lr = L[Y:Y + reg.shape[0], X:X + reg.shape[1]]
        shade = np.clip(Lr / np.percentile(Lr, 90), 0.6, 1.05)
        out[Y:Y + reg.shape[0], X:X + reg.shape[1]] = reg * (1 - pa) + p[..., :3] * shade * pa
    return Image.fromarray(np.clip(out, 0, 255).astype('uint8'))


def r2(img, key):
    b = io.BytesIO(); img.save(b, 'JPEG', quality=88, optimize=True, progressive=True)
    url = f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    urllib.request.urlopen(urllib.request.Request(url, data=b.getvalue(), method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/jpeg'}), timeout=120)
    return f'{PUB}/{key}'


def big_file(d, pid):
    im = Image.open(f'/home/user/brand/ck/print_big/{d}.png')
    if pid == 780:
        sm = im.resize((round(im.width * 0.86), round(im.height * 0.86)), Image.LANCZOS); l = (sm.width - 2100) // 2; im = sm.crop((l, 0, l + 2100, 2400))
    if pid == 1579: im = im.crop((0, 0, 3000, 3000))
    f = f'{BIGF}/{d}__{pid}.png'; im.save(f, dpi=(300, 300)); return f


def colors_for(pid, v, white):
    cols = COLS[pid][1 if white else 0]
    if pid == 780 and not white and v['color'].upper() == '#FF4F9A': cols = [c for c in cols if c != 'Solid Pink Blend']
    if pid == 780 and not white and v['color'].upper() == '#1A1A1A': cols = [c for c in cols if c != 'Solid Navy Blend']
    return [c for c in cols if any(x['color'] == c and x.get('in_stock', True) for x in CAT[pid])]


if __name__ == '__main__':
    VM = {pid: load_templates(pid) for pid in (967, 780, 1579)}
    ids = {}; off = 0
    while True:
        res = h(f'/store/products?limit=100&offset={off}').get('result', []); ids.update({slug(x['name']): (x['id'], x['name']) for x in res})
        if len(res) < 100: break
        off += 100
    jobs = [(d, v, pid, white) for drop, d, v, pid, white in plan() if pid in (967, 780, 1579)]
    if os.environ.get('ONLY'): jobs = [j for j in jobs if j[0] in os.environ['ONLY'].split(',')]
    print('tops', len(jobs), flush=True)

    def one(job):
        d, v, pid, white = job
        sl = slug(f'{title(v)} {KIND[pid]}')
        if sl not in ids: return sl, None
        f = big_file(d, pid)
        shots, cols = [], colors_for(pid, v, white)
        for c in cols:
            vid = next(x['id'] for x in CAT[pid] if x['color'] == c)
            t = VM[pid].get(vid)
            if not t: continue
            img = compose(t, f, v['color'])
            shots.append({'src': r2(img, f'site/products/{sl}/{slug(c)}-big.jpg'), 'color': c, 'style': 'Ghost', 'option': 'Front'})
        return sl, {'name': ids[sl][1], 'printful_id': ids[sl][0], 'product_id': pid, 'colors': cols, 'shots': shots}

    for pid in VM:                      # download every template once, before the threads start
        for c in {x['color'] for x in CAT[pid]}:
            vid = next(x['id'] for x in CAT[pid] if x['color'] == c); t = VM[pid].get(vid)
            if t: tpl_image(t)
    with ThreadPoolExecutor(6) as ex:
        results = list(ex.map(one, jobs))
    man = json.load(open(SHOTS_P))
    n = 0
    for sl, entry in results:
        if entry and entry['shots']:
            man[sl] = entry; n += 1
        else:
            print('skip', sl, flush=True)
    json.dump(man, open(SHOTS_P, 'w'), indent=1)
    print('products with local photos', n)
