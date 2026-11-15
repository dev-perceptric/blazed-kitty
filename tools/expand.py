"""Fill the store: put every design on every product type that fits.

python3 expand.py plan     -> list what would be created (no changes)
python3 expand.py run      -> create the missing Printful products (skips names already in the store), rate-limit safe

Types handled: Baby Tee 967, Crop Tee 1579, Rib Tank 780 (women), Tee 71, Tank 248 (men set), Cropped Hoodie 317,
Heavyweight Hoodie 892, String Bottom 669. Print files come from ck/print_big (tops/hoodies) and ck/print/panty_669 (panties).
"""
import json, os, re, sys, time
from PIL import Image
MODE = sys.argv[1] if len(sys.argv) > 1 else 'plan'
sys.argv = ['x']
_src = open('/home/user/brand/tools/printful_sync.py').read()
exec(_src[:_src.index("if __name__")])            # D1 D2 D4 D5, title, h, r2_put, CK, OUT, CAT (967/780/1579/669)

for pid in (71, 248, 317, 892, 636):
    CAT[pid] = json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']['variants']
BIG = f'{CK}/print_big'
KINDS = {636: 'Fitted Baby Tee', 967: 'Baby Tee', 1579: 'Crop Tee', 780: 'Rib Tank', 71: 'Tee', 248: 'Tank', 317: 'Cropped Hoodie', 892: 'Heavyweight Hoodie', 669: 'String Bottom'}
PRICES = {636: '34.00', 967: '36.00', 1579: '36.00', 780: '34.00', 71: '34.00', 248: '32.00', 317: '58.00', 892: '68.00', 669: '30.00'}
PLACE = {636: 'front', 967: 'front', 1579: 'front_dtf', 780: 'front', 71: 'front', 248: 'front', 317: 'front', 892: 'front', 669: 'bottom'}
LIGHT = ('#FFFFFF', '#9FD3F5')

MEN = ['veryhot', 'born', 'lighter', 'rumors', 'hotbaked', 'mommy', 'exgf', 'textme', 'situationship', 'highclub', 'toohot',
       'biandhigh', 'gaybaked', 'toogay', 'theythem', 'kissgirls', 'ftp', 'legalizeme', 'obey', 'highhorny', 'slutweed',
       'dirtystoner', 'onehit', 'eatpussy', 'dodab', 'wetwasted', 'sluttystoned', 'ibite', 'sitonmyface', 'afterdark',
       'tonguetied', 'lickblunt', 'tieme', 'bongappetit', 'momsfav', 'stonerlover', 'toostoned', 'hotterlighter']


def colors(pid, ink):
    ink = ink.upper(); light = ink in LIGHT; black = ink == '#1A1A1A'
    if pid == 967: return [] if light else ['White /True Royal', 'White/Baby Blue', 'White/Black', 'White/Navy', 'White/Pink', 'White/Red']
    if pid == 1579: return ['Washed Black'] if light else ['Vintage White', 'Light Washed Denim']
    if pid == 780:
        if light: return ['Solid Black Blend', 'Solid Navy Blend']
        c = ['Solid White Blend', 'Solid Pink Blend', 'Solid Baby Blue Blend', 'Athletic Heather']
        if ink == '#FF4F9A': c.remove('Solid Pink Blend')
        return c
    if pid == 71:
        if light: return ['Black', 'Navy']
        c = ['White', 'Athletic Heather', 'Soft Pink', 'Baby Blue']
        if ink == '#FF4F9A': c.remove('Soft Pink')
        return c
    if pid == 248: return ['Black', 'Navy'] if light else ['White', 'Athletic Heather']
    if pid == 317:
        if light: return ['Black', 'Military Green']
        return ['Peach', 'Storm'] if black else ['Black', 'Storm']
    if pid == 892:
        if light: return ['Black', 'Vintage Black', 'Navy', 'Forest']
        return ['White', 'Athletic Heather', 'Dust'] if black else ['White', 'Black', 'Athletic Heather', 'Dust']
    if pid == 669: return ['White']
    if pid == 636:   # solid fitted baby tee (CherryKitten style)
        if light: return ['Black']
        if black: return ['Bubblegum', 'Pale Pink', 'Hazy Pink', 'White', 'Bone']
        if ink == '#FF4F9A': return ['White', 'Black', 'Bone']
        return ['White', 'Pale Pink', 'Bone']
    return []


def make_file(d, pid):
    if pid == 669:
        return f'{CK}/print/panty_669/{d}.png'
    im = Image.open(f'{BIG}/{d}.png')                       # 10 x 12 in @300
    if pid == 780:
        sm = im.resize((round(im.width * 0.86), round(im.height * 0.86)), Image.LANCZOS); l = (sm.width - 2100) // 2; im = sm.crop((l, 0, l + 2100, 2400))
    elif pid in (1579, 317, 636):
        im = im.crop((0, 0, 3000, 3000))
    elif pid in (71, 248):
        c = Image.new('RGBA', (3600, 4800), (0, 0, 0, 0)); c.paste(im, (300, 0), im); im = c
    elif pid == 892:
        c = Image.new('RGBA', (3300, 3300), (0, 0, 0, 0)); c.paste(im.crop((0, 0, 3000, 3000)), (150, 0)); im = c
    f = f'{OUT}/{d}__{pid}_x.png'; im.save(f, dpi=(300, 300)); return f


def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


def jobs():
    J = []
    D6 = json.load(open('/home/user/brand/tools/ck_designs_drop6.json'))
    for drop, D in (('drop1', D1), ('drop2', D2), ('drop4', D4), ('drop5', D5), ('drop6', D6)):
        for d, v in D.items():
            pids = [967, 1579, 780, 317, 892, 669]
            if d in MEN: pids += [71, 248]
            pids = [636] + pids   # fitted baby tee on every design
            for pid in pids:
                if not colors(pid, v['color']): continue
                if pid == 669 and not os.path.exists(f'{CK}/print/panty_669/{d}.png'): continue
                J.append((drop, d, v, pid))
    return J


def store_names():
    names, off = set(), 0
    while True:
        res = h(f'/store/products?limit=100&offset={off}').get('result', []); names |= {x['name'] for x in res}
        if len(res) < 100: return names
        off += 100


def create(drop, d, v, pid):
    cols = colors(pid, v['color'])
    vs = [x for x in CAT[pid] if x['color'] in cols and x.get('in_stock', True)]
    url = r2_put(make_file(d, pid), f'printful/{d}__{pid}_x.png')
    body = {'sync_product': {'name': f'{title(v)} {KINDS[pid]}'},
            'sync_variants': [{'variant_id': x['id'], 'retail_price': PRICES[pid], 'files': [{'type': PLACE[pid], 'url': url}]} for x in vs]}
    for _ in range(30):
        r = h('/store/products', body, 'POST')
        if r.get('code') == 429:
            w = int((re.findall(r'after (\d+) seconds', r.get('error', '')) or ['60'])[0]) + 3; time.sleep(w); continue
        return r
    return r


if __name__ == '__main__':
    have = store_names()
    todo = [j for j in jobs() if f'{title(j[2])} {KINDS[j[3]]}' not in have]
    from collections import Counter
    print('store has', len(have), '| to create', len(todo), dict(Counter(KINDS[j[3]] for j in todo)), flush=True)
    if MODE == 'run':
        order = {636: -1, 967: 0, 1579: 1, 780: 2, 71: 3, 248: 4, 317: 5, 892: 6, 669: 7}
        for j in sorted(todo, key=lambda j: order[j[3]]):
            r = create(*j)
            ok = r.get('code') == 200
            print('OK ' if ok else 'ERR', j[1], KINDS[j[3]], r['result']['id'] if ok else str(r)[:200], flush=True)
