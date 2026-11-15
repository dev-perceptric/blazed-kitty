"""Long product descriptions, written per product from the design and the garment.

describe(design_key, design, pid, colors, name) -> list of paragraphs (plain text).
Each one covers: the design (exact wording, lettering style, ink color, layout, real print size),
the garment (fabric, feel, cut, length), how it is printed, how it fits and what size to get, and care.
"""
import os
from PIL import Image

FONT_STYLE = {
    'Caprasimo': 'a chunky, rounded retro serif with a 70s diner feel',
    'Arimo': 'clean, heavy sans-serif capitals',
    'LibreBaskerville': 'a classic italic serif, the kind you see on old book covers',
    'RoadRage': 'rough, distressed block capitals with a worn, stamped edge',
    'Yellowtail': 'a flowing retro script, like a vintage diner sign',
    'DMSerifDisplay': 'a high-contrast italic serif straight out of a fashion magazine',
    'AbrilFatface': 'a heavy, high-contrast poster serif',
    'SourceSerif4': 'a thick, black-weight italic serif',
    'ZillaSlab': 'a bold slab serif with a typewriter attitude',
    'SpaceGrotesk': 'a bold, slightly techy grotesk',
    'Unbounded': 'extra-wide, ultra-black Y2K capitals',
    'Anton': 'tall, tightly condensed poster capitals',
    'BebasNeue': 'clean condensed capitals',
    'ArchivoBlack': 'heavy, blocky sans-serif capitals',
    'PlayfairDisplay': 'a dramatic black-weight italic serif',
    'BarlowCondensed': 'slanted, condensed athletic capitals',
    'Cinzel': 'carved, Roman-style capitals',
    'LibreFranklin': 'a black-weight italic sans-serif',
    'Tinos': 'a bold italic newspaper serif',
    'CourierPrime': 'typewriter lettering',
    'PirataOne': 'blackletter',
    'GrenzeGotisch': 'a modern blackletter',
    'UnifrakturCook': 'Old English blackletter',
    'GreatVibes': 'an elegant script',
    'Graduate': 'varsity block capitals',
    'Oswald': 'condensed sans-serif capitals',
    'Shrikhand': 'a fat, curvy display script',
    'MrDafoe': 'a brushy handwritten script',
}
INK = {'#FF4F9A': 'hot pink', '#C81E32': 'cherry red', '#1A1A1A': 'jet black', '#FFFFFF': 'bright white',
       '#9FD3F5': 'baby blue', '#7B3FE4': 'electric purple'}
NUM = {1: 'one line', 2: 'two stacked lines', 3: 'three stacked lines', 4: 'four stacked lines', 5: 'five stacked lines'}

GARMENT = {
    636: dict(style='With low-rise jeans, a mini skirt or baggy cargos, a few rings and a choker. Tuck it into high-waist pants or let it ride up for a little stomach.', what='fitted baby tee', fabric='soft, midweight 100% combed cotton with a smooth, matte hand',
              cut='a close, body-skimming baby-tee cut with short sleeves and a cropped hem that lands just above the belly button',
              fit='It is made to fit snug like a true Y2K baby tee. Take your usual size for that fitted look, or size up once if you want it a little looser through the chest and arms.',
              method='printed straight onto the fabric with water-based inks, so the print stays soft and moves with the shirt instead of sitting on top like a sticker',
              care='Machine wash cold, inside out, with like colors. Tumble dry low or hang dry. Do not iron directly on the print.'),
    967: dict(style='With baggy jeans or a pleated mini, sneakers and a messy bun. The contrast sleeves make it pop in photos.', what='raglan baby tee', fabric='micro-rib knit made of 52% Airlume combed and ring-spun cotton and 48% polyester, stretchy, soft and a little bit shiny',
              cut='a fitted baby-tee shape with contrast raglan sleeves and a matching collar, cropped to hit right around the belly button',
              fit='The rib knit stretches and hugs the body. Take your usual size for a fitted look, or size up once for a slightly relaxed fit.',
              method='printed with water-based inks directly into the rib knit, so it stretches with the fabric',
              care='Machine wash cold, inside out. Tumble dry low or hang dry. Do not iron the print.'),
    1579: dict(style='Over a bikini top, with bike shorts, or with high-waist jeans so the boxy crop meets the waistband.', what='garment-dyed crop tee', fabric='heavyweight 100% ring-spun cotton that is dyed after sewing, which gives it a soft, broken-in, lived-in feel and a slightly washed color',
               cut='a boxy, cropped shape with dropped shoulders and wide, oversized sleeves',
               fit='It is cut wide and short on purpose. Take your usual size for the boxy look. Size down once if you want it closer to the body.',
               method='printed with a direct-to-film transfer that is pressed into the cotton, which keeps the color bold on washed fabric',
               care='Machine wash cold, inside out. Garment-dyed cotton can fade a little over time, which is part of the look. Hang dry to keep the shape.'),
    780: dict(style='Alone on hot days, under an open button-up or zip hoodie, or with a mini skirt for a night out.', what='micro-rib tank', fabric='micro-rib knit made of 52% Airlume combed and ring-spun cotton and 48% polyester, stretchy and soft',
              cut='a fitted tank with thick straps, a scoop neck and a slightly cropped length',
              fit='It is made to fit close. Take your usual size for a fitted look, or size up once for a looser fit.',
              method='printed with water-based inks directly into the rib knit, so it stretches with the fabric',
              care='Machine wash cold, inside out. Tumble dry low or hang dry. Do not iron the print.'),
    71: dict(style='Loose with shorts or jeans for the guys, or oversized and knotted at the waist for the girls.', what='unisex tee', fabric='4.2 oz 100% Airlume combed and ring-spun cotton jersey, soft and light enough to wear all year',
             cut='a classic crew neck with a regular unisex fit, side seams and a straight hem',
             fit='It fits true to size as a regular unisex tee. Women who want an oversized look can size up one or two.',
             method='printed with water-based inks directly onto the cotton, so it feels soft and breathes',
             care='Machine wash cold, inside out. Tumble dry low. Do not iron the print.'),
    248: dict(style='For hot days, the gym, the beach or the couch. Layer it under an open shirt for a night out.', what='unisex tank', fabric='4.2 oz 100% Airlume combed and ring-spun cotton jersey',
              cut='a relaxed unisex tank with a crew neck and deep armholes',
              fit='It fits true to size with a relaxed drape. Size down once for a closer fit.',
              method='printed with water-based inks directly onto the cotton',
              care='Machine wash cold, inside out. Tumble dry low. Do not iron the print.'),
    317: dict(style='With high-waist sweats or jeans so the crop shows a little skin. Throw it over a bikini or a sports bra.', what='cropped hoodie', fabric='soft cotton and polyester fleece, brushed on the inside for warmth',
              cut='a cropped hoodie with a lined hood, long sleeves with ribbed cuffs and a raw-cut hem that sits above the waist',
              fit='It fits relaxed through the body and short in length. Take your usual size, or size up once for a slouchier fit.',
              method='printed with water-based inks directly onto the fleece',
              care='Machine wash cold, inside out. Tumble dry low or hang dry. Do not iron the print.'),
    892: dict(style='Big and cozy with sweats for a couch day, or over a skirt and boots for that oversized boyfriend look.', what='heavyweight hoodie', fabric='thick 10 oz cotton-blend fleece with a soft brushed inside, heavy enough to hold its shape',
              cut='an oversized hoodie with dropped shoulders, a double-layer hood, a front pouch pocket and ribbed cuffs and hem',
              fit='It is cut oversized on purpose and fits unisex. Take your usual size for a roomy fit, or size down once for a regular fit.',
              method='printed with water-based inks directly onto the fleece',
              care='Machine wash cold, inside out. Tumble dry low. Do not iron the print.'),
    669: dict(style='Under a short skirt or low-rise jeans so the strings peek out, with a matching baby tee, or as a cheeky surprise for someone special.', what='string panty', fabric='smooth, stretchy polyester and elastane that feels soft and sleek on the skin',
              cut='a low-rise string panty with a cheeky back and thin side strings that you tie yourself, so you choose how high and how tight it sits',
              fit='Because the sides tie, it fits a wide range of hips. Pick your usual underwear size. If you are between sizes, go with the larger one for more coverage.',
              method='printed edge to edge on the fabric before it is cut and sewn, so the color goes all the way through and the print never cracks or peels',
              care='Hand wash cold or use a gentle cycle in a laundry bag. Hang dry. No bleach, no dryer, no iron.'),
    872: dict(style='Under low-rise jeans so the high sides show, with a cropped tee, or saved for the bedroom.', what='V-cut panty', fabric='smooth, stretchy polyester and elastane that feels soft and sleek on the skin',
              cut='a high-cut V front that sits high on the hips with thin side straps and a cheeky back',
              fit='It sits high on the hips. Take your usual underwear size. If you are between sizes, go with the larger one.',
              method='printed edge to edge on the fabric before it is cut and sewn, so the color goes all the way through and the print never cracks or peels',
              care='Hand wash cold or use a gentle cycle in a laundry bag. Hang dry. No bleach, no dryer, no iron.'),
}
FILE_SCALE = {780: 0.86}
WHERE = {669: 'centered on the front panel', 872: 'centered on the front panel'}


def _print_size(d, pid):
    if pid in (669, 872):
        return None
    f = f'/home/user/brand/ck/print_big/{d}.png'
    if not os.path.exists(f):
        return None
    bb = Image.open(f).getbbox()
    s = FILE_SCALE.get(pid, 1.0)
    return (bb[2] - bb[0]) / 300 * s, (bb[3] - bb[1]) / 300 * s


def _colors(colors):
    names = [c.replace('White /', 'white body with ').replace('White/', 'white body with ').replace('Solid ', '').replace(' Blend', '').lower() for c in colors]
    if pid_is_raglan(colors):
        names = [n + ' sleeves' for n in names]
    if len(names) == 1:
        return names[0]
    return ', '.join(names[:-1]) + ' or ' + names[-1]


def pid_is_raglan(colors):
    return any(c.startswith('White/') or c.startswith('White /') for c in colors)


def describe(d, v, pid, colors, name):
    g = GARMENT.get(pid)
    if not g:
        return []
    words = ' '.join(l.strip() for l in v['lines'])
    font = FONT_STYLE.get(v['font'].split('-')[0], 'bold lettering')
    ink = INK.get(v['color'].upper(), 'bold')
    n = len(v['lines'])
    out = []
    size = _print_size(d, pid)
    where = WHERE.get(pid, 'across the chest')
    p1 = f'The {name} says “{words}” in {font}, printed in {ink} ink on {NUM.get(n, f"{n} lines")}, {where}.'
    if size:
        p1 += f' The print is big and easy to read from across the room: about {size[0]:.1f} inches wide and {size[1]:.1f} inches tall on the real piece, the same size you see on the model.'
    else:
        p1 += ' The print is sized to fill the front without wrapping onto the sides, so the words stay flat and easy to read.'
    out.append(p1)
    out.append(f'Fabric: {g["fabric"][0].upper() + g["fabric"][1:]}. The cut: {g["cut"]}.')
    if pid in (669, 872):
        fab = 'black' if v['color'].upper() in ('#FFFFFF', '#9FD3F5') else 'white'
        out.append(f'Comes in {fab} fabric with {ink} lettering, picked so the words pop. The design is {g["method"]}.')
    else:
        out.append(f'Available in {_colors(colors)}. Every color is matched to the ink so the words always stand out. The design is {g["method"]}.')
    out.append(f'How to wear it: {g["style"]}')
    out.append(f'Fit and sizing: {g["fit"]}')
    out.append(f'Made for you: each piece is printed after you order, which means no extra stock and no waste. Care: {g["care"]}')
    return out
