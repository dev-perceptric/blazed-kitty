"""Write the storefront catalog (lib/products.ts + lib/mockups.json) from the real Printful store products."""
import json, re

REPO = '/home/user/blazed-kitty'
D1 = json.load(open('/home/user/brand/tools/ck_designs.json'))
D2 = json.load(open('/home/user/brand/tools/ck_designs_drop2.json'))
D3 = json.load(open('/home/user/brand/tools/ck_designs_vcut.json'))  # V-cut panty drop
D4 = json.load(open('/home/user/brand/tools/ck_designs_drop4.json'))  # queer stoner drop
SHOTS = json.load(open('/home/user/brand/ck/site_shots.json'))
MODELS = json.load(open('/home/user/brand/ck/site_models.json'))


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


# Every Printful blank the store sells or plans to sell, and where it goes on the site.
# Fields: (kind, line, category, depts, blank, price, details, all_over)
W, M, U = ['women'], ['men'], ['women', 'men']
TYPES = {
    # Tops
    967: ('Baby Tee', 'tops', 'baby-tees', W, 'Bella+Canvas 1201 Micro Rib Raglan Baby Tee', 36,
          ['Micro-rib, 52% Airlume cotton and 48% polyester', 'Fitted baby-tee cut with contrast raglan sleeves', 'Printed when you order'], False),
    1579: ('Crop Tee', 'tops', 'crop-tees', W, 'Bella+Canvas 6882GD Garment Dye Cropped Tee', 36,
           ['100% ring-spun cotton, heavyweight and garment-dyed', 'Cropped, boxy fit with oversized sleeves', 'Printed when you order'], False),
    780: ('Rib Tank', 'tops', 'tanks', W, 'Bella+Canvas 1012 Micro-Rib Tank', 34,
          ['Micro-rib, 52% Airlume cotton and 48% polyester', 'Thick straps, scoop neck, mid-length cut', 'Printed when you order'], False),
    71: ('Tee', 'tops', 'tees', M, 'Bella+Canvas 3001 Unisex Jersey Tee', 34, ['Soft 100% cotton jersey', 'Regular unisex fit', 'Printed when you order'], False),
    248: ('Tank', 'tops', 'tanks', M, 'Bella+Canvas 3480 Unisex Jersey Tank', 32, ['Soft 100% cotton jersey', 'Relaxed unisex fit', 'Printed when you order'], False),
    # Couch Lock lounge
    317: ('Cropped Hoodie', 'lounge', 'hoodies', W, 'Bella+Canvas 7502 Cropped Fleece Hoodie', 58, ['Cotton-poly fleece', 'Cropped fit with raw hem', 'Printed when you order'], False),
    892: ('Heavyweight Hoodie', 'lounge', 'hoodies', U, 'Bella+Canvas 4719 Heavyweight Hoodie', 68, ['10 oz heavyweight fleece', 'Oversized fit, dropped shoulders', 'Printed when you order'], False),
    895: ('Sweatpants', 'lounge', 'sweatpants', U, 'Bella+Canvas 4737 Heavyweight Sweatpants', 64, ['10 oz heavyweight fleece', 'Elastic waist and cuffs, side pockets', 'Printed when you order'], False),
    830: ('PJ Shorts', 'lounge', 'pajamas', W, 'All-Over Print Pajama Shorts', 44, ['Soft brushed polyester', 'Elastic waist with drawstring', 'Printed edge to edge'], True),
    828: ('PJ Top', 'lounge', 'pajamas', W, 'All-Over Print Short Sleeve Pajama Top', 48, ['Soft brushed polyester', 'Button-up with notch collar', 'Printed edge to edge'], True),
    507: ('Biker Shorts', 'lounge', 'shorts', W, 'All-Over Print Biker Shorts', 44, ['Stretchy polyester and spandex', 'High waist', 'Printed edge to edge'], True),
    # Swim and underwear
    669: ('String Bottom', 'swim', 'panties', W, 'All-Over Print Recycled String Bottom', 30,
          ['Soft stretchy polyester and elastane, UPF 50+', 'String sides you tie your way', 'Printed edge to edge, then cut and sewn'], True),
    668: ('String Bikini Top', 'swim', 'bikinis', W, 'All-Over Print Padded String Bikini Top', 34, ['Recycled polyester and elastane, UPF 50+', 'Removable padding, ties at neck and back', 'Printed edge to edge'], True),
    872: ('V-Cut Bottom', 'swim', 'panties', W, 'All-Over Print V-Cut Bikini Bottom', 36, ['Recycled polyester and elastane, UPF 50+', 'High-cut V front', 'Printed edge to edge'], True),
    870: ('Bandeau Bikini', 'swim', 'bikinis', W, 'All-Over Print Bandeau Bikini', 58, ['Recycled polyester and elastane, UPF 50+', 'Strapless top with matching bottom', 'Printed edge to edge'], True),
    428: ('Boxer Briefs', 'swim', 'boxers', M, 'All-Over Print Boxer Briefs', 32, ['Polyester and spandex, stretchy and soft', 'Elastic waistband', 'Printed edge to edge'], True),
    571: ('Swim Trunks', 'swim', 'trunks', M, 'All-Over Print Recycled Swim Trunks', 48, ['Recycled polyester, quick-dry', 'Mesh lining, drawstring waist', 'Printed edge to edge'], True),
    # Headwear
    206: ('Dad Hat', 'headwear', 'hats', U, 'Yupoong 6245CM Classic Dad Hat', 30, ['100% cotton twill', 'Low profile, adjustable strap', 'Embroidered when you order'], False),
    252: ('Trucker Hat', 'headwear', 'hats', U, 'Yupoong 6606 Retro Trucker Hat', 30, ['Foam front, mesh back', 'Snapback closure', 'Embroidered when you order'], False),
    266: ('Beanie', 'headwear', 'beanies', U, 'Yupoong 1501KC Cuffed Beanie', 28, ['100% acrylic rib knit', 'Fold-over cuff', 'Embroidered when you order'], False),
    379: ('Bucket Hat', 'headwear', 'bucket-hats', U, 'Big Accessories BX003 Bucket Hat', 34, ['100% cotton twill', 'Sewn eyelets', 'Embroidered when you order'], False),
    # The Stash
    673: ('Holo Sticker', 'stash', 'stickers', U, 'Kiss-Cut Holographic Sticker', 6, ['Holographic vinyl', 'Peels easy, sticks hard', 'Printed when you order'], False),
    505: ('Sticker Sheet', 'stash', 'stickers', U, 'Kiss-Cut Sticker Sheet', 10, ['Matte vinyl sheet', 'Several stickers per sheet', 'Printed when you order'], False),
    611: ('Coaster', 'stash', 'glassware', U, 'Cork-Back Coaster', 12, ['Glossy hardboard top', 'Cork back', 'Printed when you order'], False),
    779: ('Rocks Glass', 'stash', 'glassware', U, 'Rocks Glass 10.5 oz', 22, ['Clear glass, heavy base', 'Hand wash', 'Printed when you order'], False),
    690: ('Can Glass', 'stash', 'glassware', U, 'Can-Shaped Glass 16 oz', 24, ['Clear glass shaped like a can', 'Hand wash', 'Printed when you order'], False),
    742: ('Straw Tumbler', 'stash', 'glassware', U, 'Insulated Tumbler with Straw 20 oz', 38, ['Double-wall stainless steel', 'Lid and straw included', 'Printed when you order'], False),
    672: ('Stash Bag', 'stash', 'bags', U, 'All-Over Print Crossbody Bag', 42, ['Water-resistant polyester', 'Adjustable strap, zip top', 'Printed edge to edge'], True),
    605: ('AirPods Case', 'stash', 'tech', U, 'Rubber Case for AirPods', 22, ['Flexible rubber', 'Fits AirPods 1 and 2', 'Printed when you order'], False),
    882: ('Socks', 'stash', 'socks', U, 'Sublimation Crew Socks', 16, ['Polyester and spandex', 'Cushioned sole', 'Printed edge to edge'], True),
    # Hotbox Home
    1424: ('Candle', 'home', 'candles', U, 'Amber Jar Scented Soy Candle', 26, ['Soy wax, cotton wick', 'Amber glass jar', 'Printed when you order'], False),
    395: ('Throw Blanket', 'home', 'blankets', U, 'Throw Blanket', 54, ['Soft polyester fleece', 'Printed on one side', 'Printed when you order'], True),
    973: ('Tapestry', 'home', 'wall-art', U, 'Indoor Wall Tapestry', 38, ['Lightweight polyester', 'Hemmed edges', 'Printed when you order'], False),
    1: ('Poster', 'home', 'wall-art', U, 'Enhanced Matte Paper Poster', 18, ['Thick matte paper', 'Ships rolled', 'Printed when you order'], False),
    853: ('Rolling Mat', 'home', 'rolling-mats', U, 'Desk Mat', 24, ['Neoprene base, polyester top', 'Non-slip back', 'Printed when you order'], False),
}

def load_cat(pid):
    try:
        return json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']
    except FileNotFoundError:
        return None  # blank not used in the store yet


CAT = {pid: c for pid in TYPES if (c := load_cat(pid))}
# Existing blanks first so product codes stay the same, then everything else in table order.
PIDS = [967, 1579, 780, 669] + [pid for pid in TYPES if pid not in (967, 1579, 780, 669)]

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
    'smokebreaks': 'Reserved for the good part of the day.', 'fourtwenty': 'Fluent in one language only.',
    'munchonthis': 'Snack time.', 'propertysesh': 'Claimed by the circle.', 'stonedhorny': 'Two moods, both at once.',
    'rollmeup': 'Twist, lick, light.', 'highmaint': 'Expensive taste, no patience.', 'hitit': 'Words to live by.',
    'kushcush': 'Exactly where it should be.', 'lighternot': 'Bring your own.',
    'biandhigh': 'Both. Always both.', 'gaybaked': 'The two main food groups.', 'shesmyplug': 'Wear it to match her lighter.',
    'shesmylighter': 'Wear it to match her plug.', 'toogay': 'Doing my best, which is lying down.',
    'kissgirls': 'A simple plan.', 'girlsgrass': 'Everything a girl needs.', 'theythem': 'Pronouns updated.',
}
ADULT = {k for k, v in D2.items() if v.get('pantyonly')} | {'pussy'} | {k for k, v in D3.items() if v.get('afterDark')}
ORDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']
# Product code letter per category. Tees and crop tees share T so old codes stay put.
PREFIX = {'baby-tees': 'T', 'crop-tees': 'T', 'tees': 'T', 'tanks': 'K', 'long-sleeves': 'L', 'panties': 'P', 'bikinis': 'B',
          'boxers': 'X', 'trunks': 'W', 'hoodies': 'H', 'sweatpants': 'S', 'shorts': 'S', 'pajamas': 'J',
          'hats': 'C', 'beanies': 'C', 'bucket-hats': 'C', 'stickers': 'A', 'glassware': 'A', 'bags': 'A', 'socks': 'A', 'tech': 'A',
          'blankets': 'O', 'wall-art': 'O', 'candles': 'O', 'rolling-mats': 'O'}


def title(v):
    if v.get('title'):
        return v['title']
    t = ' '.join(v['lines']).replace('  ', ' ').lower()
    t = ' '.join(w if w.startswith('(') else w[:1].upper() + w[1:] for w in t.split())
    return t.replace('Of Bad', 'of Bad').replace(' To ', ' to ').replace(' A ', ' a ')


prods, mock, count = [], {}, {}
# Newest drop is added last so older product codes never change; it is moved to the front below.
for drop, D in (('drop3', D3), ('drop2', D2), ('drop1', D1), ('drop4', D4)):
    for d, v in D.items():
        for pid in PIDS:
            if pid not in CAT:
                continue
            kind, line, cat, depts, blank, price, details, all_over = TYPES[pid]
            name = f'{title(v)} {kind}'
            sl = slug(name)
            if sl not in SHOTS:
                continue
            s = SHOTS[sl]
            vs = [x for x in CAT[pid]['variants'] if x['color'] in s['colors'] and x.get('in_stock', True)]
            hexes = {x['color']: x['color_code'] for x in vs}
            sizes = sorted({x['size'] for x in vs}, key=lambda z: ORDER.index(z) if z in ORDER else 99)
            if all_over:
                cols = [{'name': 'Full print', 'hex': '#ffffff'}]
            elif pid == 967:  # raglan: white body + colored sleeves, show both on the swatch
                SLEEVE = {'White /True Royal': '#2347d1', 'White/Baby Blue': '#9ec9f0', 'White/Black': '#151515',
                          'White/Navy': '#243048', 'White/Pink': '#f7c5d3', 'White/Red': '#d11f2f'}
                cols = [{'name': c, 'hex': f'linear-gradient(135deg, #ffffff 50%, {SLEEVE[c]} 50%)'} for c in s['colors'] if c in hexes]
            else:
                cols = [{'name': c, 'hex': hexes[c]} for c in s['colors'] if c in hexes]
            letter = PREFIX[cat]
            count[letter] = count.get(letter, 0) + 1
            p = dict(slug=sl, code=f'BK-{letter}{count[letter]:02d}', name=name, depts=depts, line=line, category=cat)
            if all_over:
                p['allOver'] = True
            p.update(design=d, drop=drop, price=price, colors=cols, sizes=sizes, blurb=BLURB.get(d, ''))
            if d in ADULT:
                p['afterDark'] = True
            p['printful'] = {'productId': pid, 'syncProductId': s['printful_id'], 'blank': blank}
            p['details'] = details
            prods.append(p)
            shots = []
            if sl in MODELS:
                shots.append({'src': MODELS[sl], 'color': '*', 'style': 'Model', 'option': 'Front'})
            for sh in s['shots']:
                shots.append({**sh, 'color': 'Full print' if all_over else sh['color']})
            mock[sl] = shots

prods = [p for p in prods if p['drop'] == 'drop4'] + [p for p in prods if p['drop'] != 'drop4']

HEAD = """import type { CategoryId, Dept, LineId } from './taxonomy';

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  slug: string;
  code: string;
  name: string;
  /** Departments this piece is listed under. Unisex pieces list both. */
  depts: Dept[];
  line: LineId;
  category: CategoryId;
  /** Printed edge to edge (swim, AOP). One "Full print" color, no color picker. */
  allOver?: boolean;
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

// Generated from the Printful store (Blazed Kitty) by scripts/build_catalog.py.
export const PRODUCTS: Product[] = [
"""
TAIL = """];

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
