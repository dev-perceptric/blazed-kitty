"""Give every AliExpress pick without a tagline one in the BlazedKitty voice, picked by product id so it never changes.

Run:  python3 scripts/ae_blurbs.py      then  python3 scripts/ae_catalog.py  to copy them onto the products.
"""
import hashlib
import json
import os

PICKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ae_picks.json')

POOL = {
    'baby-tees': ["Tight fit, loud mouth.", "Your new go-out top.", "Pairs with low-rise and bad decisions.", "Cropped for a reason.", "Made for mirror pics.",
                  "Cute enough for the party, dark enough for after.", "The baby tee your ex remembers.", "Small tee, big attitude.",
                  "Wear it with chunky boots and zero apologies.", "2003 called. It wants this back.", "Grunge-girl approved.", "For the front row of the show."],
    'tees': ["Dark, loose and loud.", "For the guy in the back of the pit.", "Washed, worn-in and a little mean.", "Black jeans, this tee, done."],
    'long-sleeves': ["Sleeves for when it's cold, attitude for always.", "Layer it or wear it alone.", "Fitted, dark and a little dramatic.",
                     "Thumbholes optional, mood mandatory.", "The long sleeve that goes with every black skirt you own.",
                     "Made for late nights and later mornings.", "Soft on the arms, hard on the vibe."],
    'tanks': ["Straps out, eyes up.", "Little top, big night.", "Built for summer and sold-out shows.", "Show some skin, keep the mystery.", "The top that does the talking."],
    'hoodies': ["Zip it up, keep it dark.", "Fur trim, zero chill.", "For cold nights and loud music.", "The layer everyone asks about.", "Hood up, world off.", "Oversized and over it."],
    'shorts': ["Short on purpose.", "Pairs with fishnets and confidence.", "Made for festival season.", "Low effort, high impact."],
    'dresses': ["One piece, whole look.", "Dress up, act out.", "For the party and the after-party.", "Throw it on, go out."],
    'skirts': ["Mini on purpose.", "Ruffles with a bad attitude.", "Pairs with platforms and thigh-highs.", "Twirl at your own risk."],
    'pants': ["Baggy, low and loud.", "Big legs, bigger energy.", "The bottoms every top on here was waiting for.", "Wear them low, walk like you mean it."],
    'jewelry': ["Spikes for your softest days.", "Stack it, layer it, wear it to bed.", "Small piece, big statement.", "The finishing touch nobody forgets."],
    'accessories': ["The detail that makes the fit.", "Add it to anything black.", "Little extra, big difference."],
    'shoes': ["Stomp in.", "Height, attitude and a chain or two.", "Built for pits and pavements."],
    'socks': ["Thigh-high and a little dangerous.", "Layer them under everything.", "Legs, but make them goth."],
    'bags': ["Carry less, say more.", "Fits your phone, your lipstick and your secrets.", "The bag that finishes the fit."],
    'lingerie': ["For your eyes, or whoever's lucky.", "Lace, but make it dark."],
    'pajamas': ["Sleep in, stay cute."],
}

picks = json.load(open(PICKS))
added = 0
for p in picks:
    pool = POOL.get(p['category'])
    if p.get('blurb') or not pool:
        continue
    p['blurb'] = pool[int(hashlib.md5(str(p['id']).encode()).hexdigest(), 16) % len(pool)]
    added += 1
json.dump(picks, open(PICKS, 'w'), indent=1, ensure_ascii=False)
open(PICKS, 'a').write('\n')
print(f'Added {added} taglines. {sum(1 for p in picks if not p.get("blurb"))} picks still without one.')
