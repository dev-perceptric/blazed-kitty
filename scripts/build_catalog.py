"""Write the storefront catalog (lib/products.ts + lib/mockups.json) from the real Printful store products."""
import json, re

REPO = '/home/user/blazed-kitty'
D1 = json.load(open('/home/user/brand/tools/ck_designs.json'))
D2 = json.load(open('/home/user/brand/tools/ck_designs_drop2.json'))
SHOTS = json.load(open('/home/user/brand/ck/site_shots.json'))
MODELS = json.load(open('/home/user/brand/ck/site_models.json'))
CAT = {pid: json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result'] for pid in (967, 780, 1579, 669)}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


KIND = {967: 'Baby Tee', 780: 'Rib Tank', 1579: 'Crop Tee', 669: 'String Bottom'}
META = {
    967: ('tees', 'crop', 'Bella+Canvas 1201 Micro Rib Raglan Baby Tee', 36,
          ['Micro-rib, 52% Airlume cotton and 48% polyester', 'Fitted baby-tee cut with contrast raglan sleeves', 'Printed when you order']),
    780: ('tanks', 'tank', 'Bella+Canvas 1012 Micro-Rib Tank', 34,
          ['Micro-rib, 52% Airlume cotton and 48% polyester', 'Thick straps, scoop neck, mid-length cut', 'Printed when you order']),
    1579: ('tees', 'crop', 'Bella+Canvas 6882GD Garment Dye Cropped Tee', 36,
           ['100% ring-spun cotton, heavyweight and garment-dyed', 'Cropped, boxy fit with oversized sleeves', 'Printed when you order']),
    669: ('panties', 'bikini', 'All-Over Print Recycled String Bottom', 30,
          ['Soft stretchy polyester and elastane, UPF 50+', 'String sides you tie your way', 'Printed edge to edge, then cut and sewn']),
}
BLURB = {
    'veryhot': 'Slightly stoned, still the hottest one in the room.', 'hotbaked': 'An apology that isn’t one. Sorry, not sorry.',
    'petme': 'Ask nicely. She’s in a good mood.', 'exgf': 'Crossed off the list, promoted to the sesh.',
    'goodgirl': 'Who’s a good girl? Easy answer.', 'mommy': 'Mommy had a long day. Pass it over.',
    'born': 'Born to smoke, clocked in anyway.', 'rumors': 'Everything you heard is true.',
    'lighter': 'Your lighter is safe with her. Your lighter is gone forever.',
    'lovelang': 'Words of affirmation? No. Passing the lighter.', 'textme': 'Phone on loud after 4:20.',
    'situationship': 'Committed to one thing only: the grinder.', 'pussy': 'Exactly what it says.',
    'university': 'Varsity for the girls who skipped class.', 'highclub': 'Members only. Dress code: elevated.',
    'highncute': 'Two moods, both at once.', 'toohot': 'Sobriety was never her color.',
    'petmeharder': 'For the girls who like it a little rougher.', 'lickme': 'Sticky situation, fully intended.',
    'comegetkitty': 'An invitation, printed where it counts.', 'munchies': 'The munchies hit different.',
    'goodgirls': 'Good girls smoke too. Ask around.', 'wetbong': 'Wet like a bong. You heard it here.',
    'rollit': 'Three steps. She knows them by heart.', 'ridehigh': 'Saddle up.',
    'kittyhungry': 'Feed the kitty.', 'spanking': 'Bad kitty. You know what to do.',
}
ADULT = {k for k, v in D2.items() if v.get('pantyonly')} | {'pussy'}
ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']
PREFIX = {'tees': 'T', 'tanks': 'K', 'panties': 'P'}


def title(v):
    t = ' '.join(v['lines']).replace('  ', ' ').lower()
    t = ' '.join(w if w.startswith('(') else w[:1].upper() + w[1:] for w in t.split())
    return t.replace('Of Bad', 'of Bad').replace(' To ', ' to ').replace(' A ', ' a ')


prods, mock, count = [], {}, {'tees': 0, 'tanks': 0, 'panties': 0}
for drop, D in (('drop2', D2), ('drop1', D1)):
    for d, v in D.items():
        for pid in (967, 1579, 780, 669):
            name = f'{title(v)} {KIND[pid]}'
            sl = slug(name)
            if sl not in SHOTS:
                continue
            s = SHOTS[sl]
            cat, gar, blank, price, details = META[pid]
            vs = [x for x in CAT[pid]['variants'] if x['color'] in s['colors'] and x.get('in_stock', True)]
            hexes = {x['color']: x['color_code'] for x in vs}
            sizes = sorted({x['size'] for x in vs}, key=lambda z: ORDER.index(z) if z in ORDER else 99)
            if pid == 669:
                cols = [{'name': 'Full print', 'hex': '#ffffff'}]
            elif pid == 967:  # raglan: white body + colored sleeves, show both on the swatch
                SLEEVE = {'White /True Royal': '#2347d1', 'White/Baby Blue': '#9ec9f0', 'White/Black': '#151515',
                          'White/Navy': '#243048', 'White/Pink': '#f7c5d3', 'White/Red': '#d11f2f'}
                cols = [{'name': c, 'hex': f'linear-gradient(135deg, #ffffff 50%, {SLEEVE[c]} 50%)'} for c in s['colors'] if c in hexes]
            else:
                cols = [{'name': c, 'hex': hexes[c]} for c in s['colors'] if c in hexes]
            count[cat] += 1
            p = dict(slug=sl, code=f'BK-{PREFIX[cat]}{count[cat]:02d}', name=name, category=cat, garment=gar, design=d, drop=drop,
                     price=price, colors=cols, sizes=sizes, blurb=BLURB[d])
            if d in ADULT:
                p['afterDark'] = True
            p['printful'] = {'productId': pid, 'syncProductId': s['printful_id'], 'blank': blank}
            p['details'] = details
            prods.append(p)
            shots = []
            if sl in MODELS:
                shots.append({'src': MODELS[sl], 'color': '*', 'style': 'Model', 'option': 'Front'})
            for sh in s['shots']:
                shots.append({**sh, 'color': 'Full print' if pid == 669 else sh['color']})
            mock[sl] = shots

HEAD = """export type Category = 'tees' | 'tanks' | 'panties';
export type Garment = 'crop' | 'tank' | 'bikini';

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  code: string;
  name: string;
  category: Category;
  garment: Garment;
  design: string;
  drop: string;
  price: number;
  colors: Color[];
  sizes: string[];
  blurb: string;
  afterDark?: boolean;
  printful: { productId: number; syncProductId: number; blank: string };
  details: string[];
}

// Generated from the Printful store (Blazed Kitty) by build_catalog.py on the brand-assets branch.
export const PRODUCTS: Product[] = [
"""
TAIL = """];

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: 'tees', label: 'Baby Tees', blurb: 'Fitted, cropped and a little rude.' },
  { id: 'tanks', label: 'Tanks', blurb: 'Micro-rib with thick straps.' },
  { id: 'panties', label: 'Panties', blurb: 'String bottoms, printed where it counts.' },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(n: number) {
  return '$' + n.toFixed(2);
}
"""
body = ''.join('  ' + json.dumps(p, ensure_ascii=False) + ',\n' for p in prods)
open(f'{REPO}/lib/products.ts', 'w').write(HEAD + body + TAIL)
json.dump(mock, open(f'{REPO}/lib/mockups.json', 'w'), indent=1, ensure_ascii=False)
print('products', len(prods), 'with model photo', sum(1 for p in prods if p['slug'] in MODELS), count)
