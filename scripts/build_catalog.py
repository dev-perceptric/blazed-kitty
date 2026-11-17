"""Write the storefront catalog (lib/products.ts + lib/mockups.json) from the real Printful store products."""
import json, re

REPO = '/home/user/blazed-kitty'
D1 = json.load(open('/home/user/brand/tools/ck_designs.json'))
D2 = json.load(open('/home/user/brand/tools/ck_designs_drop2.json'))
D3 = json.load(open('/home/user/brand/tools/ck_designs_vcut.json'))  # V-cut panty drop
D4 = json.load(open('/home/user/brand/tools/ck_designs_drop4.json'))  # queer stoner drop
D5 = json.load(open('/home/user/brand/tools/ck_designs_drop5.json'))  # lustful stoner drop
D6 = json.load(open('/home/user/brand/tools/ck_designs_drop6.json'))  # hot stoner girl drop
SHOTS = json.load(open('/home/user/brand/ck/site_shots.json'))
MODELS = json.load(open('/home/user/brand/ck/site_models.json'))


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('’', '').replace("'", '')).strip('-')


# Every Printful blank the store sells or plans to sell, and where it goes on the site.
# Fields: (kind, line, category, depts, blank, price, details, all_over)
W, M, U = ['women'], ['men'], ['women', 'men']
TYPES = {
    # Tops
    636: ('Fitted Baby Tee', 'tops', 'baby-tees', W, 'AS Colour 4062 Women\'s Crop Top', 34, ['Soft 100% combed cotton', 'Fitted baby-tee cut, cropped', 'Printed when you order', 'AS Colour 4062'], False),
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
    669: ('String Bottom', 'swim', 'panties', W, 'Printed String Panty', 30,
          ['Soft, stretchy polyester and elastane', 'Thin side strings you tie your way', 'Printed edge to edge, then cut and sewn', 'Made to order'], True),
    668: ('String Bikini Top', 'swim', 'bikinis', W, 'All-Over Print Padded String Bikini Top', 34, ['Recycled polyester and elastane, UPF 50+', 'Removable padding, ties at neck and back', 'Printed edge to edge'], True),
    872: ('V-Cut Bottom', 'swim', 'panties', W, 'Printed V-Cut Panty', 36, ['Soft, stretchy polyester and elastane', 'High-cut V front, thin side straps', 'Printed edge to edge, then cut and sewn', 'Made to order'], True),
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
DISPLAY = {669: 'String Panty', 872: 'V-Cut Panty'}
from descriptions import describe
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
    'shesmylighter': 'Wear it to match her plug.',
    'bongappetit': 'Dinner is served.',
    'hotterlighter': 'Handle with care.',
    'kushkisses': 'Sealed with a smoke.',
    'hornymunchies': 'Two kinds of hungry.',
    'toostoned': 'Confidence, rolled.',
    'momsfav': 'She asks about you.',
    'stonerlover': 'All three, nightly.',
    'hotgirls': 'Facts.',
    'stonerprincess': 'Crown sold separately.',
    'sativadiva': 'Up, up and away.',
    'indicaqueen': 'Ruling from the couch.',
    'hybridhottie': 'Best of both strains.',
    'weedwife': 'Wifey with a stash.',
    'certstoner': 'Officially licensed.',
    'toopretty': 'Someone else is buying.',
    'puffpretty': 'Pass it, then pose.',
    'crossfaded': 'Still cute though.',
    'bakedbratty': 'Feed me and nobody gets hurt.',
    'spoiledstoned': 'Living the dream.',
    'weedera': 'Not leaving it.',
    'prerolled': 'Always prepared.',
    'redlipstick': 'Every girl needs both.',
    'spankme': 'Ask nicely. Or don’t.',
    'eatme': 'Instructions included.',
    'princess': 'Treat her like one.',
    'goodgirl2': 'Earned it.',
    'ftp': 'A classic for a reason.',
    'fucktoy': 'Daddy’s favorite toy.',
    'lovesorgasms': 'She knows what she likes.',
    'cumslot': 'Say it with your chest.',
    'fillme': 'No notes.',
    'sitonmyface': 'An open invitation.',
    'chokeme': 'Gently. Then not.',
    'ruinme': 'Please.',
    'useme': 'Hands-on.',
    'brat': 'Needs a firm hand.',
    'obey': 'Do as she says.',
    'iswallow': 'Good manners.',
    'open247': 'Always ready.',
    'breedme': 'Very serious about it.',
    'fuckmestupid': 'Brains optional.',
    'prettycry': 'Mascara-proof energy.',
    'sorrydaddy': 'Not that sorry.',
    'ibite': 'Fair warning.',
    'grabit': 'Go ahead.',
    'cumhere': 'Follow the arrow.',
    'squirt': 'Brag a little.',
    'mommyslut': 'Her pick, every time.',
    'knees': 'Hit the floor.',
    'legalizeme': 'Free the kitty.',
    'highhorny': 'The best combo.',
    'sluttystoned': 'Couch, then bed.',
    'dirtystoner': 'Grinder in one hand.',
    'slutweed': 'Always down for a session.',
    'wetwasted': 'Both, usually.',
    'onehit': 'Easy to please.',
    'lickblunt': 'Show some technique.',
    'bendover': 'Teamwork.',
    'tieme': 'Rope and a lighter.',
    'rollmeone': 'Aftercare done right.',
    'deepthroat': 'Big lungs.',
    'dodab': 'In that order.',
    'tonguetied': 'Too high to talk.',
    'illegal': 'Report it.',
    'dessert': 'Save room.',
    'sapphicslut': 'Proudly.',
    'eatpussy': 'A balanced diet.',
    'propmommy': 'Claimed.',
    'gfsfav': 'Sorry, babe.',
    'wifeyslut': 'Best of both.',
    'tastebetter': 'Science.',
    'afterdark': 'Lights off.', 'toogay': 'Doing my best, which is lying down.',
    'kissgirls': 'A simple plan.', 'girlsgrass': 'Everything a girl needs.', 'theythem': 'Pronouns updated.',
}
ADULT = {k for k, v in D2.items() if v.get('pantyonly')} | {'pussy'} | {k for k, v in D3.items() if v.get('afterDark')} | {k for k, v in D5.items() if v.get('afterDark')}
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
for drop, D in (('drop3', D3), ('drop2', D2), ('drop1', D1), ('drop4', D4), ('drop5', D5), ('drop6', D6)):
    for d, v in D.items():
        for pid in PIDS:
            if pid not in CAT:
                continue
            kind, line, cat, depts, blank, price, details, all_over = TYPES[pid]
            name = f'{title(v)} {kind}'
            sl = slug(name)                      # slug stays tied to the Printful name
            name = f'{title(v)} {DISPLAY.get(pid, kind)}'
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
            p['description'] = describe(d, v, pid, [c['name'] for c in cols], name)
            prods.append(p)
            shots = []
            if sl in MODELS:
                u = MODELS[sl][0] if isinstance(MODELS[sl], list) else MODELS[sl]   # one model photo per product
                shots.append({'src': u, 'color': '*', 'style': 'Model', 'option': 'Front'})
            for sh in s['shots']:
                shots.append({**sh, 'color': 'Full print' if all_over else sh['color']})
            mock[sl] = shots

NEW = ['drop6', 'drop5', 'drop4']  # newest first on the site
prods = [p for d in NEW for p in prods if p['drop'] == d] + [p for p in prods if p['drop'] not in NEW]


def mix(group, seed):
    """Spread a drop out so the same design never sits next to itself: round-robin across designs,
    with each design's products and the design order shuffled (fixed seed, so the order is stable between builds)."""
    import random
    rnd = random.Random(seed)
    by = {}
    for p in group: by.setdefault(p['design'], []).append(p)
    designs = list(by); rnd.shuffle(designs)
    for d in designs: rnd.shuffle(by[d])
    out, r = [], 0
    while any(by.values()):
        row = [d for d in designs if len(by[d]) > r]
        if not row: break
        rnd.shuffle(row)
        if out and row and row[0] == out[-1]['design'] and len(row) > 1: row.append(row.pop(0))
        out += [by[d][r] for d in row]
        r += 1
    return out


_order = []
for _d in dict.fromkeys(p['drop'] for p in prods):
    _order += mix([p for p in prods if p['drop'] == _d], _d)
prods = _order

HEAD = """import type { CategoryId, Dept, LineId } from './taxonomy';
import CJ_PRODUCTS from './cj-products.json';
import AE_PRODUCTS from './ae-products.json';

export interface Color {
  name: string;
  hex: string;
  /** Small photo for the swatch when the option is a print or finish, not a plain color (CJ). */
  image?: string;
}

export interface CjVariant {
  color: string;
  size: string;
  vid: string;
  /** What CJ charges us, in USD, before shipping. */
  cost: number;
}

export interface CjInfo {
  pid: string;
  /** Warehouse country CJ ships from (US or CN). */
  from: string;
  /** Typical delivery time shown on the product page, e.g. "5-9 business days". */
  delivery?: string;
  variants: CjVariant[];
}

export interface AeVariant {
  color: string;
  size: string;
  /** AliExpress sku_attr, e.g. "14:193#Black;5:100014064". Needed to order this exact variant. */
  skuAttr: string;
  skuId: string;
  cost: number;
}

export interface AeInfo {
  productId: string;
  delivery?: string;
  variants: AeVariant[];
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
  /** Set when Printful prints and ships this piece. */
  printful?: { productId: number; syncProductId: number; blank: string };
  /** Set when CJ Dropshipping ships this piece. One entry per color and size. */
  cj?: CjInfo;
  /** Set when AliExpress ships this piece. */
  ae?: AeInfo;
  /** Photos for products that don't use mockups.json (CJ). color '*' means every color. */
  photos?: { src: string; color: string }[];
  details: string[];
  /** Long description, one paragraph per entry. */
  description?: string[];
  /** Earlier web addresses, so orders paid under an old one can still be fulfilled. Not redirected. */
  oldSlugs?: string[];
}

// Generated from the Printful store (Blazed Kitty) by scripts/build_catalog.py.
const PRINTFUL_PRODUCTS: Product[] = [
"""
TAIL = """];

// CJ Dropshipping products, written by scripts/cj_catalog.py from scripts/cj_picks.json.
// Printful pieces are hidden from the store for now. Set to true to bring them back.
const SHOW_PRINTFUL = false;

/** Everything we've ever listed, hidden or not. Used to fulfil orders already paid for. */
export const ALL_PRODUCTS: Product[] = [...PRINTFUL_PRODUCTS, ...(CJ_PRODUCTS as Product[]), ...(AE_PRODUCTS as Product[])];

/** What the store shows and sells. */
export const PRODUCTS: Product[] = ALL_PRODUCTS.filter((p) => SHOW_PRINTFUL || !p.printful);

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Finds a product even if it's hidden from the store. */
export function findAnyProduct(slug: string) {
  return ALL_PRODUCTS.find((p) => p.slug === slug || p.oldSlugs?.includes(slug));
}

/** The CJ variant for a color and size, if CJ stocks that combo. */
export function cjVariant(p: Product, color: string, size: string) {
  return p.cj?.variants.find((v) => v.color === color && v.size === size);
}

/** The AliExpress variant for a color and size, if that combo exists. */
export function aeVariant(p: Product, color: string, size: string) {
  return p.ae?.variants.find((v) => v.color === color && v.size === size);
}

/** Dropship items only come in the combos the supplier stocks. Printful pieces come in all of them. */
export function inStock(p: Product, color: string, size: string) {
  if (p.cj) return !!cjVariant(p, color, size);
  if (p.ae) return !!aeVariant(p, color, size);
  return true;
}

export function formatPrice(n: number) {
  return '$' + n.toFixed(2);
}
"""
body = ''.join('  ' + json.dumps(p, ensure_ascii=False) + ',\n' for p in prods)
open(f'{REPO}/lib/products.ts', 'w').write(HEAD + body + TAIL)
json.dump(mock, open(f'{REPO}/lib/mockups.json', 'w'), indent=1, ensure_ascii=False)
print('products', len(prods), 'with model photo', sum(1 for p in prods if p['slug'] in MODELS), count)
