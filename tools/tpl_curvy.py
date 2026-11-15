"""Hoodie templates with the green print marker (plain colored backdrops). One small batch.

python3 tpl_hoodie.py submit | poll
"""
import json, os, sys, time, random, urllib.request
MODE = sys.argv[1]
sys.argv = ['x']
_src = open('/home/user/brand/tools/tpl_gen.py').read().replace('Slim body. ', 'Curvy hourglass body: full bust, slim waist, flat stomach. ').replace('Deadpan, bored or smirking, no polite smile.', 'Flirty, sultry and confident.')
exec(_src[:_src.index("if __name__ == '__main__':")])    # VIBE, GREEN, WOMEN, MEN, BGS, cat_img, req, save, API, OUT, CAT
for pid in (317, 892, 636):
    CAT[pid] = json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']['variants']
random.seed(4242)
STATE = OUT + 'curvy_chunks.json'

H = [  # pid, library color, Printful color, garment text, count, who
    (967, 'pink', 'White/Pink', 'fitted cropped raglan baby tee with a white body and pink sleeves, one size small so it is tight across the chest', 2, 'c'),
    (967, 'black', 'White/Black', 'fitted cropped raglan baby tee with a white body and black sleeves, one size small so it is tight across the chest', 1, 'c'),
    (967, 'red', 'White/Red', 'fitted cropped raglan baby tee with a white body and red sleeves, one size small so it is tight across the chest', 1, 'c'),
    (636, 'white', 'White', 'tight cropped baby tee in plain white that hugs the chest and ends above the belly button', 1, 'c'),
    (636, 'bubblegum', 'Bubblegum', 'tight cropped baby tee in bubblegum pink that hugs the chest and ends above the belly button', 2, 'c'),
    (636, 'black', 'Black', 'tight cropped baby tee in plain black that hugs the chest and ends above the belly button', 1, 'c'),
]
CURVY = ["a curvy Latina woman with a full bust, tiny waist and long dark hair", "a curvy Black woman with a full bust, slim waist and long knotless braids",
         "a curvy white woman with a full bust, slim waist and a platinum blowout", "a curvy mixed-race woman with a full bust, slim waist and big curls",
         "a curvy Middle Eastern woman with a full bust, slim waist and glossy waves", "a curvy East Asian woman with a full bust, slim waist and a sleek black bob"]
C_POSE = ["TIGHT CROP from her lips down to her hips, back arched and chest pushed forward, both hands on her hips, biting her bottom lip",
          "TIGHT CROP from her chin down to her hips, one hand running through her hair, hip popped to the side, chest forward",
          "TIGHT CROP from her nose down to her hips, leaning slightly toward the camera with her hands on her thighs, flirty smirk",
          "TIGHT CROP from her lips down to her hips, thumbs hooked in the waistband of low-rise jeans pulling them down a little, chest forward"]
W_POSE_H = ['TIGHT CROP from her lips down to her hips, hands in her low-rise jeans pockets', 'TIGHT CROP from her chin down to her hips, one hand on her hip',
            'close waist-up shot, top of her head cut off by the frame, arms relaxed at her sides']
M_POSE_H = ['TIGHT CROP from his lips down to his hips, hands in his pockets', 'TIGHT CROP from his chin down to his hips, arms relaxed at his sides',
            'close waist-up shot, top of his head cut off by the frame, slouched']


def jobs():
    J, n = [], {}
    for pid, col, pcol, g, cnt, who in H:
        for _ in range(cnt):
            i = n.get((pid, col), 50); n[(pid, col)] = i + 1
            person = random.choice(CURVY); bg = random.choice(BGS)
            pose = random.choice(C_POSE)
            text = (f'FRAMING (most important): {pose}. The top fills most of the frame. ' +
                    VIBE.format(bg=bg, who=person[0].upper() + person[1:]) +
                    f'The model is {person}, wearing the garment in the reference image: a {g}, nothing hanging over the chest. Pose: {pose}. ' +
                    GREEN.format(g='baby tee', where='centered on the chest below the neckline, about 8 inches wide and 5 inches tall') +
                    'Sexy but tasteful, fully clothed adult woman. No text anywhere. Vertical 4:5 photo.')
            J.append((f'tpl_{pid}_{col}_{i:02d}', [cat_img(pid, pcol)], text))
    return J


if MODE == 'submit':
    J = jobs(); reqs = [{'request': req(r, t), 'metadata': {'key': k}} for k, r, t in J]
    body = {'batch': {'display_name': 'bk-tpl-curvy', 'input_config': {'requests': {'requests': reqs}}}}
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
