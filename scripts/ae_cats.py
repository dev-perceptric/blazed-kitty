"""Pick a store category for a product from its name (and old category as a fallback).

Names end in the product type ("... Grunge Off Shoulder Long Sleeve Tee"), so the type words near the end decide.
Used by ae_import.py for new picks and by recategorize.py for the whole catalog.
"""
import re

# (pattern on the last few words of the name, category), first match wins. Bottoms and dresses before tops,
# because "Mini Skirt" or "Set" names can mention tops earlier on.
RULES = [
    (r'\b(earrings?|necklace|choker|pendant|bracelet|rings?|jewelry|piercing|anklet|body chain)$', 'jewelry'),
    (r'\b(boots|shoes|sneakers|heels|platforms?|sandals|loafers|mary janes)$', 'shoes'),
    (r'\b(socks|tights|stockings|leg warmers|garter|fishnets?)$', 'legwear'),
    (r'\b(arm warmers|gloves|mittens)$', 'arm-warmers'),
    (r'\b(hair clips?|clips?|hairpins?|wig|headband|scrunchies?)$', 'hair'),
    (r'\b(bag|purse|tote|backpack|wallet)$', 'bags'),
    (r'\b(belt|scarf|sunglasses|glasses|harness|mask|accessory)$', 'belts'),
    (r'\b(grinder|ashtray|tray|jar|lighter)$', 'extras'),
    (r'\bjeans$', 'jeans'),
    (r'\b(skirt|skort)$', 'skirts'),
    (r'\bshorts$', 'shorts'),
    (r'\b(pants|sweatpants|leggings|trousers|joggers|cargos)$', 'pants'),
    (r'\b(dress|gown)$', 'dresses'),
    (r'\b(set|jumpsuit|romper|playsuit)$', 'sets'),
    (r'\b(sweater|jumper|pullover)$', 'sweaters'),
    (r'\b(cardigan|shrug|bolero)$', 'cardigans'),
    (r'\b(hoodie|zip[- ]up|sweatshirt)$', 'hoodies'),
    (r'\b(jacket|coat|blazer)$', 'jackets'),
    (r'\blong sleeve (tee|top|shirt)$|\blong sleeve$', 'long-sleeves'),
    (r'\b(oversized|raglan|ringer) tee$', 'oversized-tees'),
    (r'\b(corset|bustier) top$|\bbodysuit$|\bcorset$', 'corsets-bodysuits'),
    (r'\b(halter|tube) top$|\bbandeau$', 'halter-tube'),
    (r'\b(cami|camisole|tank|tank top|vest)$', 'camis-tanks'),
    (r'\b(blouse|shirt)$', 'blouses'),
    (r'\bcrop (tee|top)$', 'crop-tees'),
    (r'\b(baby tee|off shoulder tee|tee|t-shirt|top)$', 'baby-tees'),
]

FALLBACK = {
    'baby-tees': 'baby-tees', 'crop-tees': 'crop-tees', 'tees': 'oversized-tees', 'long-sleeves': 'long-sleeves', 'tanks': 'camis-tanks',
    'hoodies': 'hoodies', 'sweatpants': 'pants', 'shorts': 'shorts', 'pajamas': 'sets', 'dresses': 'dresses', 'skirts': 'skirts',
    'pants': 'pants', 'lingerie': 'corsets-bodysuits', 'jewelry': 'jewelry', 'accessories': 'belts', 'shoes': 'shoes', 'socks': 'legwear',
    'bags': 'bags', 'tech': 'extras', 'glassware': 'extras', 'rolling-mats': 'extras', 'stickers': 'extras',
}


def new_category(name, old=None):
    n = re.sub(r'[^a-z0-9 -]', '', (name or '').lower()).strip()
    n = re.sub(r'\s+(no\s+\d+|ii)$', '', n)
    n = re.sub(r'\s+with\s+.*$', '', n)  # "Cardigan With Scarf" is a cardigan
    for pat, cat in RULES:
        if re.search(pat, n):
            return cat
    return FALLBACK.get(old, old or 'baby-tees')
