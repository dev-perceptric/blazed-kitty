"""CherryKitten-style model photos for every panty (20 string bottoms + 10 V-cut). One Gemini 2.5 Flash Image batch."""
import json, base64, random, io, urllib.request
from PIL import Image

random.seed(99)
M = '/home/user/brand/ck/mockups/'
OUT = '/home/user/brand/ck/photos/panties7/'
URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:batchGenerateContent'
ALL = json.load(open('/home/user/brand/tools/ck_designs_all.json'))
VC = json.load(open('/home/user/brand/tools/ck_designs_vcut.json'))


def ref(f):
    im = Image.open(M + f).convert('RGB'); im.thumbnail((768, 768))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=88)
    return {'inline_data': {'mime_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}


SKIN = ['light skin', 'fair skin with freckles', 'olive skin', 'tan skin', 'warm brown skin', 'deep brown skin', 'light brown skin', 'golden skin']
TEE = ['a plain pastel pink cropped baby tee', 'a plain pastel pink cropped baby tee', 'a plain white cropped baby tee', 'a plain baby pink fitted crop top']
POSE = ['one hand pulling the side string of the panties up and out, the other hand lifting the hem of the tee',
        'both hands hooking the side strings of the panties and pulling them up over her hips',
        'one hand lifting the hem of the tee, the other hand resting on her hip',
        'one hand pulling the side string of the panties out, the other arm relaxed']
STYLE = ('Clean e-commerce lingerie catalog photo, bright soft studio light, plain seamless light gray studio background, nothing else in the frame. '
         'Cropped from just under the chest down to mid-thigh, front view, no face. A slim adult woman in her twenties with {skin}, flat stomach, '
         'long glossy almond nails, a couple of thin silver rings, natural real skin texture. She wears {tee} with no print and no text, lifted to show her stomach, '
         'and the panties from the reference image: {cut}, exactly the same fabric color and the exact same printed text in the same font, size, color and position, '
         'spelled exactly, centered on the front. The print is fully visible, flat and readable, nothing covers it. Pose: {pose}. Tasteful, sexy, catalog style. '
         'Vertical 4:5 photo. No other text anywhere.')

jobs = []
for d, v in ALL.items():
    if v.get('panty'):
        jobs.append((d, 'set', f'{d}__panty.jpg', 'a white or black string bikini bottom with thin side strings (the reference shows the flat cut pieces)'))
for k, v in VC.items():
    jobs.append((k, 'vcut', f'{k}__vcut.jpg', 'a high-leg V-cut bikini bottom with thin side straps (the reference shows the flat front piece)'))

reqs, man = [], {}
for d, kind, refimg, cut in jobs:
    for i in range(3):
        key = f'{d}__{kind}__{i}'
        text = STYLE.format(skin=random.choice(SKIN), tee=random.choice(TEE), cut=cut, pose=random.choice(POSE))
        reqs.append({'request': {'contents': [{'parts': [ref(refimg), {'text': text}]}],
                                 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '4:5'}}},
                     'metadata': {'key': key}})
        man[key] = {'design': d, 'ref': refimg}
body = {'batch': {'display_name': 'ck-panties7', 'input_config': {'requests': {'requests': reqs}}}}
data = json.dumps(body).encode(); print('requests', len(reqs), 'MB', round(len(data) / 1e6, 1))
r = json.load(urllib.request.urlopen(urllib.request.Request(URL, data=data, headers={'Content-Type': 'application/json', 'x-goog-api-key': 'dummy'}), timeout=300))
json.dump({'op': r, 'manifest': man}, open(OUT + 'job.json', 'w'), indent=1)
print('batch:', r.get('name'), r.get('metadata', {}).get('state'))
