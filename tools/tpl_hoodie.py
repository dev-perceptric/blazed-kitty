"""Hoodie templates with the green print marker (plain colored backdrops). One small batch.

python3 tpl_hoodie.py submit | poll
"""
import json, os, sys, time, random, urllib.request
MODE = sys.argv[1]
sys.argv = ['x']
_src = open('/home/user/brand/tools/tpl_gen.py').read()
exec(_src[:_src.index("if __name__ == '__main__':")])    # VIBE, GREEN, WOMEN, MEN, BGS, cat_img, req, save, API, OUT, CAT
for pid in (317, 892):
    CAT[pid] = json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']['variants']
random.seed(892)
STATE = OUT + 'hoodie_chunks.json'

H = [  # pid, library color, Printful color, garment text, count, who
    (317, 'black', 'Black', 'cropped fleece hoodie in black that ends above the belly button', 4, 'w'),
    (317, 'storm', 'Storm', 'cropped fleece hoodie in storm gray that ends above the belly button', 3, 'w'),
    (317, 'peach', 'Peach', 'cropped fleece hoodie in soft peach that ends above the belly button', 3, 'w'),
    (892, 'white', 'White', 'oversized heavyweight hoodie in white', 2, 'm'),
    (892, 'white', 'White', 'oversized heavyweight hoodie in white', 2, 'w'),
    (892, 'black', 'Black', 'oversized heavyweight hoodie in black', 2, 'm'),
    (892, 'black', 'Black', 'oversized heavyweight hoodie in black', 2, 'w'),
    (892, 'heather', 'Athletic Heather', 'oversized heavyweight hoodie in heather gray', 2, 'm'),
]
W_POSE_H = ['TIGHT CROP from her lips down to her hips, hands in her low-rise jeans pockets', 'TIGHT CROP from her chin down to her hips, one hand on her hip',
            'close waist-up shot, top of her head cut off by the frame, arms relaxed at her sides']
M_POSE_H = ['TIGHT CROP from his lips down to his hips, hands in his pockets', 'TIGHT CROP from his chin down to his hips, arms relaxed at his sides',
            'close waist-up shot, top of his head cut off by the frame, slouched']


def jobs():
    J, n = [], {}
    for pid, col, pcol, g, cnt, who in H:
        for _ in range(cnt):
            i = n.get((pid, col), 0); n[(pid, col)] = i + 1
            person = random.choice(WOMEN if who == 'w' else MEN); bg = random.choice(BGS)
            pose = random.choice(W_POSE_H if who == 'w' else M_POSE_H)
            text = (f'FRAMING (most important): {pose}. The hoodie fills most of the frame. ' +
                    VIBE.format(bg=bg, who=person[0].upper() + person[1:]) +
                    f'The model is {person}, wearing the garment in the reference image: a {g}, hood down, NO drawstrings, nothing hanging over the chest. Pose: {pose}. ' +
                    GREEN.format(g='hoodie', where='centered on the chest below the neckline, about 10 inches wide and 6 inches tall') +
                    'No text anywhere. Vertical 4:5 photo.')
            J.append((f'tpl_{pid}_{col}_{i:02d}', [cat_img(pid, pcol)], text))
    return J


if MODE == 'submit':
    J = jobs(); reqs = [{'request': req(r, t), 'metadata': {'key': k}} for k, r, t in J]
    body = {'batch': {'display_name': 'bk-tpl-hoodies', 'input_config': {'requests': {'requests': reqs}}}}
    r = json.load(urllib.request.urlopen(urllib.request.Request(API + 'batchGenerateContent', data=json.dumps(body).encode(),
                  headers={'Content-Type': 'application/json', 'x-goog-api-key': 'dummy'}), timeout=300))
    json.dump([{'name': r['name'], 'keys': [k for k, _, _ in J], 'done': False}], open(STATE, 'w')); print('submitted', r['name'], len(J))
else:
    _b = open('/home/user/brand/tools/tpl_batch.py').read(); g = {}
    exec(_b[_b.index('def walk(o):'):_b.index('def poll():')], g)
    c = json.load(open(STATE))[0]
    while True:
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/{c['name']}?fields=name,done", headers={'x-goog-api-key': 'dummy'}), timeout=60))
            if d.get('done'):
                full = json.load(urllib.request.urlopen(urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/{c['name']}", headers={'x-goog-api-key': 'dummy'}), timeout=300))
                ok = sum(1 for it in g['walk'](full) if save(it['metadata']['key'], it.get('response', {})))
                print('saved', ok, flush=True); break
        except Exception as e:
            print('poll error', str(e)[:80], flush=True)
        time.sleep(60)
