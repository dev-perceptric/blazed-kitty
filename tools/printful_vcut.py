"""Create the V-cut (Printful 872) sync products. Front + back files hosted on R2."""
import json, re, time, urllib.request, urllib.parse
A = '8954ffc36634674f7163d2a03600e7fb'; PUB = 'https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
D = json.load(open('/home/user/brand/tools/ck_designs_vcut.json'))
VARS = json.load(open('/home/user/brand/printful/cat_872.json'))['result']['variants']

def r2(local, key):
    url = f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    urllib.request.urlopen(urllib.request.Request(url, data=open(local, 'rb').read(), method='PUT',
                           headers={'Authorization': 'Bearer dummy', 'Content-Type': 'image/png'}), timeout=180)
    return f'{PUB}/{key}'

def pf(method, path, body=None):
    for _ in range(8):
        req = urllib.request.Request('https://api.printful.com' + path, data=json.dumps(body).encode() if body is not None else None,
                                     method=method, headers={'Authorization': 'Bearer dummy', 'Content-Type': 'application/json'})
        try:
            return json.load(urllib.request.urlopen(req, timeout=120))
        except urllib.error.HTTPError as e:
            t = e.read().decode()
            if e.code == 429:
                time.sleep(int((re.findall(r'after (\d+) seconds', t) or ['60'])[0]) + 3); continue
            return {'code': e.code, 'error': t[:300]}

def title(v):
    t = ' '.join(v['lines']).lower()
    return ' '.join(w[:1].upper() + w[1:] for w in t.split()).replace(' Of The ', ' of the ').replace(' Is My ', ' Is My ')

have = {p['name'] for p in pf('GET', '/store/products?limit=100')['result']}
for k, v in D.items():
    name = f'{title(v)} V-Cut Bottom'
    if name in have: print('skip', name); continue
    fu = r2(f'/home/user/brand/ck/print/vcut_872/{k}__front.png', f'printful/{k}__872_front.png')
    bu = r2(f'/home/user/brand/ck/print/vcut_872/{k}__back.png', f'printful/{k}__872_back.png')
    body = {'sync_product': {'name': name},
            'sync_variants': [{'variant_id': x['id'], 'retail_price': '30.00',
                               'files': [{'type': 'bottom_front', 'url': fu}, {'type': 'bottom_back', 'url': bu}]}
                              for x in VARS if x.get('in_stock', True)]}
    r = pf('POST', '/store/products', body)
    print('OK ' if r.get('code') == 200 else 'ERR', name, r.get('result', {}).get('id') if r.get('code') == 200 else r)
    time.sleep(2)
