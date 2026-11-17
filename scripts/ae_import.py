"""Turn a list of AliExpress items (id + title) into scripts/ae_picks.json entries.

Sorts each item into a store category from its title, skips kids' items, knockoffs and
band/anime/movie art, and writes a short clean name. Existing picks are kept.

Run:  python3 scripts/ae_import.py items.json        (items.json = [{"id": "...", "title": "..."}])
Then: python3 scripts/ae_catalog.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ae_cats import new_category  # noqa: E402

PICKS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'scripts', 'ae_picks.json')
# Items removed by hand (copyrighted art, duplicates). Never imported again.
BLOCKED = os.path.join(os.path.dirname(PICKS), 'ae_blocked.json')

# Only skip what can't be sold safely: kids' items and copyrighted characters or brand logos.
SKIP = re.compile(
    r"\b(kid|kids|child|children|toddler|infant|newborn|baby (girl|boy)|boys|girls'|maternity|pregnan|pet|dog clothes|doll)\b|"
    r"(nike|adidas|disney|hello ?kitty|sanrio|kuromi|my melody|cinnamoroll|marvel|pokemon|pikachu|barbie|harry potter|star wars|mickey|minnie|stitch|"
    r"gucci|chanel|louis vuitton|supreme|nfl|nba|naruto|one piece|dragon ball|jojo|spongebob|simpsons|anime|manga|hatsune|miku|sakura|minecraft|nyan|"
    r"pop ?tart|pierce the veil|my chemical|nirvana|metallica|slipknot|ramones|misfits|house of 1000|corpse bride|nightmare before|tim burton|"
    r"playboy|vans|carhartt|stussy|balenciaga|prada|dior|chrome hearts|ed hardy|juicy couture|von dutch|bratz|monster high|tokidoki|domo|"
    r"invader zim|care bears|my little pony|garfield|snoopy|peanuts|sonic|mario|zelda|kirby|squishmallow|labubu|king von|trippie|curious george|attack on titan)",
    re.I)

KIDS = re.compile(r"\b(kid|kids|child|children|toddler|infant|newborn|baby (girl|boy)|boys|girls'|maternity|pregnan|pet|dog clothes|doll)\b", re.I)
KEEP_ALL = '--keep-all' in sys.argv

# (category, product word) by title keywords, first match wins.
TYPES = [
    (r'\b(necklace|earrings?|rings?|bracelet|choker|pendant|jewelry|piercing|anklet|body chain)\b', 'jewelry', 'Jewelry'),
    (r'\b(shoes|boots|sneakers|heels|platforms?|sandals|loafers|mary janes)\b', 'shoes', 'Shoes'),
    (r'\b(sunglasses|glasses|belt|scarf|gloves|arm warmers?|leg warmers?|hair clips?|hairpins?|wig|garter|harness|mask)\b', 'accessories', None),
    (r'\b(bag|purse|handbag|tote|crossbody|backpack|wallet)\b', 'bags', 'Bag'),
    (r'\b(socks?|stockings?|tights|fishnets?)\b', 'socks', 'Socks'),
    (r'\b(bikini|swimsuit|swimwear)\b', 'bikinis', 'Bikini'),
    (r'\b(lingerie|bra|bralette set|panties|underwear|thong|garter set|babydoll)\b', 'lingerie', 'Lingerie'),
    (r'\b(pajamas?|sleepwear|nightgown|loungewear set)\b', 'pajamas', 'Pajama Set'),
    (r'\b(beanie)\b', 'beanies', 'Beanie'),
    (r'\b(bucket hat)\b', 'bucket-hats', 'Bucket Hat'),
    (r'\b(baseball cap|trucker hat|dad hat|cap|hat)\b', 'hats', 'Cap'),
    (r'\b(dress|jumpsuit|romper|playsuit|two[- ]piece set|2 piece set|matching set|outfit set)\b', 'dresses', None),
    (r'\b(skirt|skort)\b', 'skirts', 'Skirt'),
    (r'\b(jeans|pants|trousers|leggings|cargos?|flares?|joggers|sweatpants)\b', 'pants', None),
    (r'\b(shorts)\b', 'shorts', 'Shorts'),
    (r'\b(hoodie|hoodies|zip[- ]?up|sweatshirt|jacket|cardigan|coat|sweater|jumper|vest jacket)\b', 'hoodies', None),
    (r'\b(bodysuit)\b', None, 'Bodysuit'),
    (r'\b(long[- ]?sleeves?d?)\b', 'long-sleeves', None),
    (r'\b(tube top|bandeau|strapless)\b', 'tanks', 'Tube Top'),
    (r'\b(halter)\b', 'tanks', 'Halter Top'),
    (r'\b(cami|camis|camisole|spaghetti strap)\b', 'tanks', 'Cami'),
    (r'\b(tank|sleeveless|vest|corset)\b', 'tanks', 'Tank'),
    (r'\b(t-?shirts?|tees?|tshirts?|crop tops?|short sleeves?|baby tees?|tops?|blouse|shirt)\b', 'baby-tees', None),
]

WORDS = [
    ('leopard', 'Leopard'), ('cheetah', 'Leopard'), ('skeleton', 'Skeleton'), ('ribcage', 'Skeleton'), ('skull', 'Skull'),
    ('spider', 'Spider Web'), ('angel', 'Angel'), ('fairy', 'Fairy'), ('butterfly', 'Butterfly'), ('cherry', 'Cherry'),
    ('cat', 'Kitty'), ('kitten', 'Kitty'), ('bunny', 'Bunny'), ('rabbit', 'Bunny'), ('star', 'Star'), ('heart', 'Heart'),
    ('cross', 'Cross'), ('lace', 'Lace'), ('mesh', 'Mesh'), ('fur', 'Fur'), ('rhinestone', 'Rhinestone'), ('sequin', 'Sequin'),
    ('stripe', 'Stripe'), ('plaid', 'Plaid'), ('polka', 'Polka Dot'), ('floral', 'Floral'), ('flower', 'Floral'), ('rose', 'Rose'),
    ('bow', 'Bow'), ('ruched', 'Ruched'), ('corset', 'Corset'), ('patchwork', 'Patchwork'), ('off shoulder', 'Off-Shoulder'),
    ('off-shoulder', 'Off-Shoulder'), ('one shoulder', 'One-Shoulder'), ('deep v', 'Deep V'), ('backless', 'Backless'),
    ('letter', 'Slogan'), ('graphic', 'Graphic'), ('gothic', 'Goth'), ('goth', 'Goth'), ('punk', 'Punk'), ('grunge', 'Grunge'),
    ('kawaii', 'Kawaii'), ('cyber', 'Cyber'), ('zebra', 'Zebra'), ('snake', 'Snakeskin'), ('cow', 'Cow'), ('deer', 'Fawn'),
    ('guitar', 'Rockstar'), ('knit', 'Knit'), ('ribbed', 'Ribbed'), ('two piece', 'Layered'), ('two-piece', 'Layered'),
    ('fake two', 'Layered'), ('henley', 'Henley'), ('turtleneck', 'Turtleneck'), ('square neck', 'Square Neck'),
    ('ruffle', 'Ruffle'), ('coquette', 'Coquette'), ('pastel', 'Pastel'), ('emo', 'Emo'), ('trashy', 'Trashy'),
    ('vintage', 'Vintage'), ('slim', 'Fitted'), ('tight', 'Fitted'), ('sexy', 'Sexy'),
]

DEFAULT_WORD = {'baby-tees': 'Baby Tee', 'long-sleeves': 'Long Sleeve Tee', 'hoodies': 'Zip Hoodie', 'tanks': 'Tank', 'tees': 'Tee'}


def classify(title):
    t = title.lower()
    for pat, cat, word in TYPES:
        if re.search(pat, t):
            if cat is None and word is None:
                return None, None
            if word == 'Bodysuit':
                return ('long-sleeves' if re.search(r'long[- ]?sleeve', t) else 'tanks'), 'Bodysuit'
            if cat == 'hoodies':
                word = 'Jacket' if re.search(r'jacket|coat', t) else 'Cardigan' if 'cardigan' in t else 'Zip Hoodie' if re.search(r'zip', t) else 'Hoodie'
            if cat == 'baby-tees' and re.search(r'crop', t):
                word = 'Crop Tee'
            if cat == 'dresses':
                word = 'Jumpsuit' if re.search(r'jumpsuit|romper|playsuit', t) else 'Set' if re.search(r'set\b', t) else 'Dress'
            if cat == 'pants':
                word = 'Jeans' if 'jeans' in t else 'Leggings' if 'leggings' in t else 'Sweatpants' if re.search(r'sweatpants|joggers', t) else 'Pants'
            if cat == 'accessories':
                word = next((w.title() for w in ('sunglasses', 'glasses', 'belt', 'scarf', 'gloves', 'arm warmers', 'leg warmers', 'hair clips', 'wig', 'garter', 'harness') if w in t), 'Accessory')
            return cat, word or DEFAULT_WORD.get(cat, 'Top')
    return None, None


def name_for(title, word, used):
    t = title.lower()
    picked = []
    for key, label in WORDS:
        if re.search(r'\b' + re.escape(key), t) and label not in picked and label.lower() not in word.lower():
            picked.append(label)
    for n in (2, 1, 3, 4, 5):
        name = ' '.join(picked[:n] + [word]) if picked else word
        if name not in used:
            return name
    i = 2
    while f'{name} {i}' in used:
        i += 1
    return f'{name} {i}'


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    items = json.load(open(sys.argv[1]))
    picks = json.load(open(PICKS)) if os.path.exists(PICKS) else []
    have = {str(p['id']) for p in picks}
    have |= set(json.load(open(BLOCKED))) if os.path.exists(BLOCKED) else set()
    used = {p.get('name') for p in picks}
    added = skipped = 0
    for it in items:
        pid, title = str(it['id']), it.get('title') or ''
        if pid in have:
            continue
        # --keep-all: only skip kids' items; keep character, meme and brand prints.
        if (KIDS.search(title) if KEEP_ALL else SKIP.search(title)):
            skipped += 1
            continue
        cat, word = classify(title)
        if not cat:
            skipped += 1
            continue
        # Women's store: skip anything sold only for men.
        if re.search(r"\b(men'?s|for men|male|boyfriend)\b", title, re.I) and not re.search(r'\b(women|woman|female|ladies|girl)', title, re.I):
            skipped += 1
            continue
        name = name_for(title, word, used)
        cat = new_category(name, cat)
        used.add(name)
        have.add(pid)
        pick = {'id': pid, 'category': cat, 'name': name, 'depts': ['women']}
        picks.append(pick)
        added += 1
        print(f'  + {cat:13} {name:34} {title[:70]}')
    with open(PICKS, 'w') as f:
        json.dump(picks, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(f'Added {added}, skipped {skipped}. {len(picks)} picks in total.')


if __name__ == '__main__':
    main()
