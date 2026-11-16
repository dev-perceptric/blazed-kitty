"""Write lib/ae-products.json from the AliExpress products listed in scripts/ae_picks.json.

Each pick: {"id": "<AliExpress product id>", "category": "<taxonomy id>", ...} with the same optional
fields as scripts/cj_picks.json (name, price, blurb, details, description, depts, afterDark).

AliExpress calls go through https://blazedkitty.com/api/aliexpress/admin (the server holds the keys
and the store's AliExpress sign-in). Send ADMIN_TOKEN in the X-Admin-Token header; the cloud dev box
injects it for you.

Run:  python3 scripts/ae_catalog.py
"""
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cj_catalog import categories, clean_name, hex_for, known_hex, slug, upload  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PICKS = os.path.join(REPO, 'scripts', 'ae_picks.json')
OUT = os.path.join(REPO, 'lib', 'ae-products.json')
ADMIN_URL = os.environ.get('ADMIN_URL', 'https://blazedkitty.com/api/aliexpress/admin')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'proxy-injected')
MARKUP = float(os.environ.get('MARKUP', '2.5'))
MAX_PHOTOS = int(os.environ.get('MAX_PHOTOS', '10'))
SIZE_NAMES = re.compile(r'^(size|sizes|us size|clothing size)$', re.I)
SKIP_PROPS = re.compile(r'^(ships from|ship from|shipping from)$', re.I)


def admin(method, params):
    req = urllib.request.Request(ADMIN_URL, data=json.dumps({'method': method, 'params': params}).encode(), method='POST',
                                 headers={'Content-Type': 'application/json', 'X-Admin-Token': ADMIN_TOKEN})
    try:
        out = json.loads(urllib.request.urlopen(req, timeout=90).read())
    except urllib.error.HTTPError as e:
        sys.exit(f'{method}: HTTP {e.code} {e.read().decode()[:300]}')
    time.sleep(0.5)
    return out


def arr(x):
    """AliExpress wraps lists as {"thing_d_t_o": [...]}. Unwrap them."""
    if isinstance(x, list):
        return x
    if isinstance(x, dict) and len(x) == 1 and isinstance(next(iter(x.values())), list):
        return next(iter(x.values()))
    return [] if x in (None, '', {}) else [x]


def result_of(resp, method):
    return (resp.get(method.replace('.', '_') + '_response') or resp).get('result') or {}


def to_float(x):
    m = re.findall(r'\d+(?:\.\d+)?', str(x or ''))
    return float(m[0]) if m else 0.0


def ship_estimate(pid, sku_id):
    resp = admin('aliexpress.ds.freight.query', {'queryDeliveryReq': {
        'quantity': '1', 'shipToCountry': 'US', 'productId': pid, 'selectedSkuId': sku_id,
        'language': 'en_US', 'currency': 'USD', 'locale': 'en_US'}})
    opts = arr(result_of(resp, 'aliexpress.ds.freight.query').get('delivery_options'))
    if not opts:
        return 5.0, None
    fee = lambda o: 0.0 if str(o.get('free_shipping')).lower() == 'true' else to_float(o.get('shipping_fee_cent'))  # noqa: E731
    best = min(opts, key=lambda o: (fee(o), to_float(o.get('max_delivery_days') or 99)))
    lo, hi = best.get('min_delivery_days'), best.get('max_delivery_days')
    return fee(best), (f'{lo}-{hi} days' if lo and hi else None)


def build(pick, n, cats):
    pid, cat = str(pick['id']), pick['category']
    if cat not in cats:
        sys.exit(f"{pid}: category '{cat}' isn't in lib/taxonomy.ts")
    line, cat_depts = cats[cat]
    res = result_of(admin('aliexpress.ds.product.get', {
        'product_id': pid, 'ship_to_country': 'US', 'target_currency': 'USD', 'target_language': 'en'}), 'aliexpress.ds.product.get')
    if not res:
        sys.exit(f'{pid}: AliExpress returned nothing')
    base = res.get('ae_item_base_info_dto') or {}
    skus = [s for s in arr(res.get('ae_item_sku_info_dtos')) if int(s.get('sku_available_stock') or 0) > 0]
    if not skus:
        sys.exit(f'{pid}: no SKUs in stock')

    # Prefer US-warehouse SKUs when the listing offers "Ships From: United States".
    def ships_from(s):
        for pr in arr(s.get('ae_sku_property_dtos')):
            if SKIP_PROPS.match(str(pr.get('sku_property_name', '')).strip()):
                return str(pr.get('property_value_definition_name') or pr.get('sku_property_value') or '')
        return ''
    if any(re.search(r'united states|^us$', ships_from(s), re.I) for s in skus):
        skus = [s for s in skus if re.search(r'united states|^us$', ships_from(s), re.I)]
    elif any(ships_from(s) for s in skus):
        skus = [s for s in skus if re.search(r'china|^cn$', ships_from(s), re.I)] or skus

    variants, colors, sizes, seen, color_img = [], [], [], set(), {}
    for s in skus:
        size, others = 'One Size', []
        for pr in arr(s.get('ae_sku_property_dtos')):
            name = str(pr.get('sku_property_name', '')).strip()
            val = str(pr.get('property_value_definition_name') or pr.get('sku_property_value') or '').strip()
            if SKIP_PROPS.match(name) or not val:
                continue
            if SIZE_NAMES.match(name):
                size = val.upper() if len(val) <= 5 else val
            else:
                others.append(val)
                if pr.get('sku_image'):
                    color_img.setdefault(val, pr['sku_image'])
        color = ' / '.join(others) or 'Default'
        if (color, size) in seen:
            continue
        seen.add((color, size))
        variants.append({'color': color, 'size': size, 'skuAttr': s.get('sku_attr') or s.get('id'), 'skuId': str(s.get('sku_id')),
                         'cost': round(to_float(s.get('offer_sale_price') or s.get('sku_price')), 2)})
        if color not in [c['name'] for c in colors]:
            colors.append({'name': color, 'hex': hex_for(color)})
        if size not in sizes:
            sizes.append(size)

    name = pick.get('name') or clean_name(base.get('subject'))
    ship, delivery = ship_estimate(pid, variants[0]['skuId'])
    max_cost = max(v['cost'] for v in variants)
    price = pick.get('price') or (math.ceil(max_cost * MARKUP + ship) - 0.01)

    photos = []
    for c in colors:
        img = color_img.get(c['name']) or next((color_img[x] for x in c['name'].split(' / ') if x in color_img), None)
        if img and len(colors) > 1:
            src = upload(img, f'ae-{pid}')
            photos.append({'src': src, 'color': c['name']})
            c['image'] = src
    hexes = [known_hex(c['name']) for c in colors]
    if all(hexes) and len(set(hexes)) == len(hexes):
        for c in colors:
            c.pop('image', None)
    images = [u for u in str((res.get('ae_multimedia_info_dto') or {}).get('image_urls') or '').split(';') if u]
    for img in images[:max(0, MAX_PHOTOS - len(photos))] or images[:3]:
        photos.append({'src': upload(img, f'ae-{pid}'), 'color': '*'})

    margin = price - max_cost - ship
    print(f'  {n}. {name}: {len(variants)} variants, ${price:.2f} retail, ${max_cost:.2f} cost, ${ship:.2f} ship, ~${margin:.2f} profit, '
          f"rating {base.get('avg_evaluation_rating')} ({base.get('evaluation_count')}), sold {base.get('sales_count')}")
    product = {
        'slug': f'{slug(name)}-{pid[-6:]}',
        'code': f'BK-AE{n}',
        'name': name,
        'depts': pick.get('depts') or cat_depts,
        'line': line,
        'category': cat,
        'design': 'ae',
        'drop': 'ae',
        'price': round(price, 2),
        'colors': colors,
        'sizes': sizes,
        'blurb': pick.get('blurb', ''),
        'details': (pick.get('details') or []) + ['Ships from our overseas partner'],
        'ae': {'productId': pid, 'delivery': delivery, 'variants': variants},
        'photos': photos,
    }
    if pick.get('description'):
        product['description'] = pick['description']
    if pick.get('afterDark'):
        product['afterDark'] = True
    return product


def main():
    picks = json.load(open(PICKS))
    cats = categories()
    print(f'Building {len(picks)} AliExpress products...')
    products = [build(p, i, cats) for i, p in enumerate(picks, 1)]
    with open(OUT, 'w') as f:
        json.dump(products, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(f'Wrote {len(products)} products to lib/ae-products.json')


if __name__ == '__main__':
    main()
