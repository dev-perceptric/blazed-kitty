"""Generate blank model TEMPLATES with a neon-green marker where the print goes.

python3 tpl_gen.py proto      -> 4 quick test images (interactive API)
python3 tpl_gen.py batch      -> the full 184-image batch (Gemini batch API, half price)
Output: /home/user/brand/ck/photos/tpl/raw/<key>.jpg  (+ job.json for the batch)
"""
import json, base64, random, io, os, sys, urllib.request
from PIL import Image

random.seed(184)
OUT = '/home/user/brand/ck/photos/tpl/'
REF = OUT + 'refs/'
os.makedirs(OUT + 'raw', exist_ok=True); os.makedirs(REF, exist_ok=True)
API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:'
CAT = {pid: json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']['variants'] for pid in (967, 780, 1579, 71, 248)}

GREEN = ('IMPORTANT: on the front of the {g} there is NO text and NO graphic. Instead there is ONE perfectly flat, solid, bright neon green (#00FF00) '
         'rectangle printed where a graphic would go, {where}. The green rectangle has sharp straight edges, one uniform flat color, no texture, no shading, '
         'no logo, and nothing covers it: no hands, hair, jewelry or arms in front of it. It follows the fabric like a real screen print. ')

WOMEN = ["a slim Black woman with long knotless braids", "a slim Latina woman with a messy high ponytail", "a petite East Asian woman with a black hime cut and bangs",
         "a slim South Asian woman with long wavy dark hair", "a slim white woman with a platinum messy blowout", "a slim mixed-race woman with big curly hair",
         "a slim Middle Eastern woman with a sleek low bun", "a petite white woman with a choppy red wolf cut", "a slim Black woman with a short platinum buzz cut",
         "a slim Latina woman with dark curtain bangs", "a slim white woman with a messy brown mullet", "a slim Black woman with a sleek glossy bob",
         "a slim androgynous woman with a short bleached crop and a septum ring", "a slim Filipina woman with long straight black hair"]
MEN = ["a slim, toned Black man with short twists and a small hoop earring", "a lean Latino man with a soft curly fringe and a thin mustache",
       "a slim East Asian man with a bleached middle-part haircut and silver earrings", "a lean South Asian man with wavy shoulder-length hair",
       "a slim white man with a messy brown mullet and black painted nails", "a lean mixed-race man with a short buzz cut and a septum ring",
       "a slim Middle Eastern man with soft dark curls and a gold chain", "a lean white man with a bleached buzz cut and small tattoos",
       "a slim Black man with a low fade, a pearl necklace and painted nails", "a lean Filipino man with a curtain haircut and stud earrings"]
BGS = ['hot pink', 'cherry red', 'baby blue', 'lilac', 'tangerine orange', 'mint green', 'butter yellow', 'cobalt blue', 'bubblegum pink', 'lime green']

VIBE = ("Real unretouched photo shot on a cheap point-and-shoot camera with harsh direct flash, hard shadow on the wall behind, film grain. "
        "The backdrop is ONE solid saturated {bg} wall filling the whole background, nothing else. "
        "{who} looks like a real everyday person with attitude: visible skin texture, pores, freckles or small blemishes, no airbrushing. "
        "Stoner energy: heavy-lidded sleepy eyes, messy hair, rings, small tattoos and piercings, a short chain worn high on the neck. Slim body. "
        "Deadpan, bored or smirking, no polite smile. Wrinkled real fabric. Adult in their twenties. No smoking, no drugs shown. ")
W_POSE = ["TIGHT CROP from her nose down to her hips, one hand on her hip", "TIGHT CROP from her lips down to her belly button, thumbs hooked in her waistband",
          "close waist-up shot, top of her head cut off by the frame, slouched, arms relaxed", "TIGHT CROP from her chin down to her hips, slightly turned, arms at her sides"]
M_POSE = ["TIGHT CROP from his nose down to his hips, one hand in his pocket", "TIGHT CROP from his lips down to his belt, thumbs hooked in his waistband",
          "close waist-up shot, top of his head cut off by the frame, slouched, arms relaxed", "TIGHT CROP from his chin down to his hips, slightly turned, arms at his sides"]
STUDIO = ("Clean e-commerce underwear catalog photo, bright soft studio light, plain seamless light gray studio background, nothing else in the frame. "
          "Cropped from just under the chest down to mid-thigh, front view, no face. {who}, natural real skin texture. ")


def cat_img(pid, color):
    f = f"{REF}{pid}_{color.replace('/', '-').replace(' ', '')}.jpg"
    if not os.path.exists(f):
        url = next(x['image'] for x in CAT[pid] if x['color'] == color)
        open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'bk/1.0'}), timeout=60).read())
    im = Image.open(f).convert('RGB'); im.thumbnail((768, 768)); b = io.BytesIO(); im.save(b, 'JPEG', quality=88)
    return {'inline_data': {'mime_type': 'image/jpeg', 'data': base64.b64encode(b.getvalue()).decode()}}


# (pid, color label used in the library, Printful color or None, garment text, how many, who)
TOPS = [   # slim plan: only colors code cannot fake (dark shirts, raglan sleeves, denim)
    (967, 'trueroyal', 'White /True Royal', 'fitted cropped raglan baby tee with a white body and true royal blue sleeves and collar', 4, 'w'),
    (967, 'babyblue', 'White/Baby Blue', 'fitted cropped raglan baby tee with a white body and baby blue sleeves and collar', 4, 'w'),
    (967, 'navy', 'White/Navy', 'fitted cropped raglan baby tee with a white body and navy sleeves and collar', 4, 'w'),
    (780, 'black', 'Solid Black Blend', 'fitted cropped micro-rib tank top in black', 4, 'w'),
    (780, 'navy', 'Solid Navy Blend', 'fitted cropped micro-rib tank top in navy', 4, 'w'),
    (1579, 'lightdenim', 'Light Washed Denim', 'boxy garment-dyed cropped tee in light washed denim blue', 4, 'w'),
    (1579, 'vintagewhite', 'Vintage White', 'boxy garment-dyed cropped tee in vintage off-white', 3, 'w'),
    (71, 'white', 'White', 'classic relaxed unisex crew-neck t-shirt in white', 5, 'm'),
    (71, 'black', 'Black', 'classic relaxed unisex crew-neck t-shirt in black', 5, 'm'),
    (71, 'heather', 'Athletic Heather', 'classic relaxed unisex crew-neck t-shirt in heather gray', 5, 'm'),
    (248, 'white', 'White', 'relaxed unisex jersey tank top in white', 4, 'm'),
    (248, 'black', 'Black', 'relaxed unisex jersey tank top in black', 4, 'm'),
]
UNDER = [  # (pid, color, garment text, how many, who) -- boxers are all-over print, recolored in code
    (428, 'white', 'fitted white boxer briefs', 8, 'm'),
]


def jobs():
    J = []
    for pid, col, pcol, g, n, who in TOPS:
        for i in range(n):
            person = random.choice(WOMEN if who == 'w' else MEN); bg = random.choice(BGS)
            pose = random.choice(W_POSE if who == 'w' else M_POSE)
            text = (f'FRAMING (most important): {pose}. The torso and the top fill most of the frame. ' + VIBE.format(bg=bg, who=person[0].upper() + person[1:]) +
                    f"The model is {person}, wearing the garment in the reference image: a {g}, same cut and color, with jeans or track pants. Pose: {pose}. " +
                    GREEN.format(g='top', where='centered on the chest, about 9 inches wide and 5 inches tall') + 'No text anywhere. Vertical 4:5 photo.')
            J.append((f'tpl_{pid}_{col}_{i:02d}', [cat_img(pid, pcol)], text))
    for pid, col, g, n, who in UNDER:
        for i in range(n):
            if who == 'w':
                person = f"A slim adult woman in her twenties with {random.choice(['light', 'olive', 'tan', 'warm brown', 'deep brown', 'golden'])} skin, flat stomach, long glossy nails, thin silver rings"
                top = random.choice(['a plain pastel pink cropped baby tee', 'a plain white cropped baby tee'])
                body = (f"She wears {top} with no print, lifted to show her stomach, and a {g}. Pose: one hand pulling the side string up and out, the other lifting the hem of the tee. "
                        + GREEN.format(g='bikini bottom', where='centered on the front panel, about 4 inches wide and 1.5 inches tall'))
            else:
                person = f"A slim, toned adult man in his twenties with {random.choice(['light', 'olive', 'tan', 'warm brown', 'deep brown', 'golden'])} skin, defined abs, a thin silver chain"
                body = (f"He is shirtless and wears {g} with a plain black waistband. Pose: thumbs hooked in the waistband, relaxed. "
                        + GREEN.format(g='boxer briefs', where='on the front of the left leg, about 4 inches wide and 2 inches tall'))
            text = STUDIO.format(who=person) + body + 'Tasteful catalog style. No text anywhere. Vertical 4:5 photo.'
            J.append((f'tpl_{pid}_{col}_{i:02d}', [], text))
    return J


def req(refs, text):
    return {'contents': [{'parts': refs + [{'text': text}]}],
            'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '4:5'}}}


def save(key, resp):
    for c in resp.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            d = p.get('inlineData') or p.get('inline_data')
            if d:
                open(f'{OUT}raw/{key}.jpg', 'wb').write(base64.b64decode(d['data'])); return True
    return False


if __name__ == '__main__':
    J = jobs(); print('jobs', len(J))
    if sys.argv[1] == 'proto':
        pick = [j for j in J if j[0] in ('tpl_967_navy_00', 'tpl_71_black_00', 'tpl_669_black_00', 'tpl_428_white_00')]
        for key, refs, text in pick:
            r = json.load(urllib.request.urlopen(urllib.request.Request(API + 'generateContent', data=json.dumps(req(refs, text)).encode(),
                        headers={'Content-Type': 'application/json', 'x-goog-api-key': 'dummy'}), timeout=300))
            print(key, 'saved' if save(key, r) else 'NO IMAGE ' + json.dumps(r)[:200], flush=True)
    else:
        reqs = [{'request': req(refs, text), 'metadata': {'key': key}} for key, refs, text in J]
        body = {'batch': {'display_name': 'bk-templates-184', 'input_config': {'requests': {'requests': reqs}}}}
        data = json.dumps(body).encode(); print('payload MB', round(len(data) / 1e6, 1))
        r = json.load(urllib.request.urlopen(urllib.request.Request(API + 'batchGenerateContent', data=data,
                      headers={'Content-Type': 'application/json', 'x-goog-api-key': 'dummy'}), timeout=300))
        json.dump({'op': r, 'manifest': {k: t for k, _, t in J}}, open(OUT + 'job.json', 'w'), indent=1)
        print('batch:', r.get('name'), r.get('metadata', {}).get('state'))
