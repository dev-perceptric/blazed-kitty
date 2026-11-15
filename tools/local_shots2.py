"""Product photos for the expansion products, made locally from Printful templates (same method as local_shots.py).

Covers Baby Tee 967, Crop Tee 1579, Rib Tank 780, Tee 71, Tank 248, Cropped Hoodie 317, Heavyweight Hoodie 892.
Only products that already exist in the store and have no photos yet in ck/site_shots.json are made.
ONLY=design1,design2 limits the run.
"""
import json, os, re, sys
from concurrent.futures import ThreadPoolExecutor
sys.argv = ['x', 'plan']
_e = open('/home/user/brand/tools/expand.py').read()
exec(_e[:_e.index("if __name__ == '__main__':")])          # jobs(), colors(), make_file(), KINDS, CAT, h, title, store ids
_l = open('/home/user/brand/tools/local_shots.py').read()
_g = {}
exec(_l[:_l.index("if __name__ == '__main__':")], _g)       # compose(), tpl_image(), r2()
compose, tpl_image, r2, TPL = _g['compose'], _g['tpl_image'], _g['r2'], _g['TPL']
PLACEMENT = {636: 'front', 967: 'front', 780: 'front', 1579: 'front_dtf', 71: 'front', 248: 'front', 317: 'front', 892: 'front'}
SHOTS_P = '/home/user/brand/ck/site_shots.json'


def load_templates(pid):
    f = f'{TPL}/tpl_{pid}.json'
    if not os.path.exists(f): open(f, 'w').write(json.dumps(h(f'/mockup-generator/templates/{pid}')))
    r = json.load(open(f))['result']
    T = {t['template_id']: t for t in r['templates']}
    return {m['variant_id']: next((T[x['template_id']] for x in m['templates'] if x['placement'] == PLACEMENT[pid]), None) for m in r['variant_mapping']}


if __name__ == '__main__':
    pids = sorted(PLACEMENT)
    VM = {pid: load_templates(pid) for pid in pids}
    ids, off = {}, 0
    while True:
        res = h(f'/store/products?limit=100&offset={off}').get('result', []); ids.update({slug(x['name']): (x['id'], x['name']) for x in res})
        if len(res) < 100: break
        off += 100
    man = json.load(open(SHOTS_P))
    J = [j for j in jobs() if j[3] in PLACEMENT]
    if os.environ.get('ONLY'): J = [j for j in J if j[1] in os.environ['ONLY'].split(',')]
    J = [j for j in J if slug(f'{title(j[2])} {KINDS[j[3]]}') in ids and not man.get(slug(f'{title(j[2])} {KINDS[j[3]]}'), {}).get('shots')]
    for pid in pids:                                         # download templates once, before threads
        for c in {x['color'] for x in CAT[pid]}:
            t = VM[pid].get(next(x['id'] for x in CAT[pid] if x['color'] == c))
            if t: tpl_image(t)
    print('to photograph', len(J), flush=True)

    def one(j):
        drop, d, v, pid = j
        sl = slug(f'{title(v)} {KINDS[pid]}'); f = make_file(d, pid); shots = []
        cols = colors(pid, v['color'])
        for c in cols:
            t = VM[pid].get(next(x['id'] for x in CAT[pid] if x['color'] == c))
            if not t: continue
            try:
                shots.append({'src': r2(compose(t, f, v['color']), f'site/products/{sl}/{slug(c)}-big.jpg'), 'color': c, 'style': 'Ghost', 'option': 'Front'})
            except Exception as e:
                print('photo failed', sl, c, str(e)[:80], flush=True)
        return sl, {'name': ids[sl][1], 'printful_id': ids[sl][0], 'product_id': pid, 'colors': cols, 'shots': shots}

    with ThreadPoolExecutor(6) as ex:
        res = list(ex.map(one, J))
    man = json.load(open(SHOTS_P))
    for sl, e in res:
        if e['shots']: man[sl] = e
    json.dump(man, open(SHOTS_P, 'w'), indent=1)
    print('photographed', sum(1 for _, e in res if e['shots']))
