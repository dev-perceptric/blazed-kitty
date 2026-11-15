"""Chunked Gemini batches for green-marker templates (small chunks so each result downloads in time).

python3 tpl_batch.py submit   -> builds all jobs (184 garment templates + 100 panty pose templates), submits chunks of 36
python3 tpl_batch.py poll     -> polls every chunk, saves images to ck/photos/tpl/raw/<key>.jpg as each chunk finishes
State: ck/photos/tpl/chunks.json
"""
import json, os, sys, time, random, base64, urllib.request
sys.argv = sys.argv[:2]
MODE = sys.argv[1]
_src = open('/home/user/brand/tools/tpl_gen.py').read()
exec(_src[:_src.index("if __name__ == '__main__':")])   # jobs(), req(), save(), API, GREEN, OUT

STATE = OUT + 'chunks.json'
CHUNK = 30

PANTY_COLORS = {'white': 'white'}   # recolored in code for every other fabric color
SKINS = ['light', 'fair freckled', 'olive', 'tan', 'warm brown', 'deep brown', 'golden', 'light brown']
FLAT = ('The front panel of the string bikini bottom faces the camera straight on, flat, smooth and fully visible: '
        'NO hands, fingers, strings, hair, jewelry or clothing cover any part of the front panel. ')
POSES = [
    ('light gray studio', 'standing straight, her low-rise light blue jeans unbuttoned and pushed down to her upper thighs, both hands holding the open jeans out to the sides at her hips'),
    ('light gray studio', 'standing straight, thumbs hooked in the side strings at her hips pulling them up high, hands at the sides of her hips only'),
    ('light gray studio', 'standing straight, holding the front of a pleated mini skirt lifted up above her navel with both hands at her waist'),
    ('white bedroom with white sheets, soft window light', 'kneeling upright on the bed facing the camera, knees slightly apart, tee rolled up under her chest, hands resting on her thighs'),
    ('white bedroom with white sheets, soft window light', 'lying on her back on the white sheets, shot from directly above, tee pushed up, arms relaxed above her head'),
    ('white bedroom with white sheets, soft window light', 'sitting on the edge of the bed facing the camera, leaning back on her hands placed behind her, knees together'),
    ('bathroom mirror selfie, warm light', 'standing facing the mirror, holding a phone in front of her face, other hand on her waist, crop top'),
    ('light gray studio', 'standing straight, one hand on her hip, the other hand at her side, tee lifted by her teeth showing her stomach, cropped at the lips'),
    ('white bedroom with white sheets, soft window light', 'standing by the bed, satin pajama shorts pulled down to her thighs, hands holding the shorts at her thighs'),
    ('cheap point-and-shoot flash photo against a solid hot pink wall', 'standing straight, hands on her hips, tee lifted, slightly bored expression, cropped at the chin'),
]


def panty_jobs():
    random.seed(669)
    J = []
    for pi, (scene, pose) in enumerate(POSES):
        for col, cname in PANTY_COLORS.items():
            for m in range(3):
                skin = random.choice(SKINS)
                top = random.choice(['a plain pastel pink cropped baby tee', 'a plain white cropped baby tee', 'a plain white ribbed crop tank'])
                text = (f'Sexy but tasteful lingerie catalog photo. Setting: {scene}. A slim adult woman in her twenties with {skin} skin, flat stomach, '
                        f'long glossy nails, thin rings, natural real skin texture, framed from her chest to mid-thigh. She wears {top} with no print and a {cname} string bikini bottom with thin side strings. '
                        f'Pose: {pose}. ' + FLAT +
                        GREEN.format(g='bikini bottom', where='centered on the front panel, about 4 inches wide and 1.5 inches tall') +
                        'Adult model. No nudity. No text anywhere. Vertical 4:5 photo.')
                J.append((f'tpl_669_{col}_{100 + pi * 3 + m}', [], text))
    return J


def all_jobs():
    have = {os.path.basename(f)[:-4] for f in os.listdir(OUT + 'raw')}
    J = [j for j in jobs() + panty_jobs() if j[0] not in have]
    return J


def submit():
    J = all_jobs(); chunks = []
    print('jobs to make', len(J))
    for i in range(0, len(J), CHUNK):
        part = J[i:i + CHUNK]
        reqs = [{'request': req(refs, text), 'metadata': {'key': key}} for key, refs, text in part]
        body = {'batch': {'display_name': f'bk-tpl-{i // CHUNK}', 'input_config': {'requests': {'requests': reqs}}}}
        r = json.load(urllib.request.urlopen(urllib.request.Request(API + 'batchGenerateContent', data=json.dumps(body).encode(),
                      headers={'Content-Type': 'application/json', 'x-goog-api-key': 'dummy'}), timeout=300))
        chunks.append({'name': r['name'], 'keys': [k for k, _, _ in part], 'done': False}); print('submitted', r['name'], len(part), flush=True)
        json.dump(chunks, open(STATE, 'w'), indent=1)


def walk(o):
    if isinstance(o, dict):
        if isinstance(o.get('metadata'), dict) and 'key' in o['metadata'] and ('response' in o or 'error' in o): yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o, list):
        for v in o: yield from walk(v)


def poll():
    chunks = json.load(open(STATE))
    while not all(c['done'] for c in chunks):
        for c in chunks:
            if c['done']: continue
            try:
                d = json.load(urllib.request.urlopen(urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/{c['name']}?fields=name,done", headers={'x-goog-api-key': 'dummy'}), timeout=60))
                if not d.get('done'): continue
                full = json.load(urllib.request.urlopen(urllib.request.Request(
                    f"https://generativelanguage.googleapis.com/v1beta/{c['name']}", headers={'x-goog-api-key': 'dummy'}), timeout=300))
            except Exception as e:
                print(time.strftime('%H:%M'), c['name'], 'poll error', str(e)[:80], flush=True); continue
            ok = bad = 0
            for item in walk(full):
                if save(item['metadata']['key'], item.get('response', {})): ok += 1
                else: bad += 1
            c['done'] = True; c['saved'] = ok; c['failed'] = bad
            print(time.strftime('%H:%M'), c['name'], 'saved', ok, 'failed', bad, flush=True)
            json.dump(chunks, open(STATE, 'w'), indent=1)
        time.sleep(60)
    print('ALL DONE', flush=True)


if MODE == 'submit': submit()
else: poll()
