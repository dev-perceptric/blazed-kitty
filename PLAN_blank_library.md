# Blank model library plan

Goal: generate reusable "blank" model photos once, then paste every design onto them in code.
New products then cost $0 in image generation.

## Casting rules
- Women: slim girls, 21 to 30, many ethnicities. Mix of femme and queer-coded looks (buzz cuts, masc-of-center fits, tattoos, piercings).
- Men: slim, fit "pretty boy" men, 21 to 30, many ethnicities. Slightly queer styling (earrings, chains, painted nails, soft hair, mustaches, cropped fits).
- No plus size. Stoner and baddie energy: lazy smirks, chains, rings, tattoos.
- Every blank: front facing, print area flat and clear (no hands, hair, necklaces over it), solid colored or light gray studio backdrop.

## How a blank works
1. Gemini 2.5 Flash batch makes the model wearing the garment with a bright green marker rectangle where the print goes.
2. Code finds the marker corners, warps the design to that shape, bends it along fabric folds, darkens it in creases.
3. Automatic check: marker fully visible and a clean shape. Failed blanks are thrown out once, at library build time.
4. Only ONE model photo shows per product, in its hero color, so the library only needs the hero colors.

## Products and how each gets its photos
### Model blanks (worn, front print)
| ID | Product | Dept | Hero colors in library | Poses each | Blanks |
|---|---|---|---|---|---|
| 967 | Raglan Baby Tee | W | 6 sleeve colors | 8 | 48 |
| 1579 | Garment Dye Crop Tee | W | 3 | 8 | 24 |
| 780 | Micro-Rib Tank | W | 6 | 8 | 48 |
| 317 | Cropped Hoodie | W | 4 | 6 | 24 |
| 892 | Heavyweight Hoodie | W | 4 | 6 | 24 |
| 892 | Heavyweight Hoodie | M | 4 | 6 | 24 |
| 895 | Sweatpants (hip/leg print) | W | 3 | 5 | 15 |
| 895 | Sweatpants (hip/leg print) | M | 3 | 5 | 15 |
| 669 | String Bottom (studio style) | W | white, black | 12 | 24 |
| 872 | V-Cut Bottom (studio style) | W | 5 fabric colors | 6 | 30 |
| 71 | Unisex Tee | M | 6 core colors | 8 | 48 |
| 248 | Unisex Tank | M | 4 | 6 | 24 |
| 428 | Boxer Briefs (waistband/front text) | M | 4 | 8 | 32 |
| 206 / 252 / 266 / 379 | Dad Hat, Trucker, Beanie, Bucket | W | 3 to 4 each | 4 | 60 |
| 206 / 252 / 266 / 379 | Dad Hat, Trucker, Beanie, Bucket | M | 3 each | 3 | 36 |
| — | Couple sets (two models, matching prints) | W+W, M+M, W+M | 3 | 7 | 21 |
| | **Total** | | | | **~497** |

### Printful mockups only (full-pattern prints, paste does not fit)
PJ Shorts 830, PJ Top 828, Biker Shorts 507, String Bikini Top 668, Bandeau Bikini 870,
Swim Trunks 571, Stash Bag 672, Socks 882, Throw Blanket 395.
Printful lifestyle mockups (free). Fresh Gemini shoots only for best sellers.

### No models (objects)
Holo Sticker 673, Sticker Sheet 505, Coaster 611, Rocks Glass 779, Can Glass 690, Straw Tumbler 742,
AirPods Case 605, Candle 1424, Tapestry 973, Poster 1, Rolling Mat 853.
Printful product and lifestyle mockups (free).

## Cost
- ~500 blanks x best of 3 tries = ~1,500 images x $0.02 = ~$30, plus ~20% redos = ~$36 one time.
- Refresh about 100 blanks every 1 to 2 months: ~$6 each time.
- Storage: ~0.5 GB on R2 (free).
- Every new product after that: $0.

## Phases
0. Prototype (~$0.50): 10 blanks (baby tee, tank, string bottom, men's tee), marker detection, warp and fold paste, auto check. Go or no-go.
1. Women core: baby tee, crop tee, tank, string bottom, V-cut (~175 blanks, ~$11).
2. Men core: tee, tank, boxers (~105 blanks, ~$7).
3. Lounge and hats: hoodies, sweatpants, 4 hat types (~200 blanks, ~$12).
4. Couple sets (~21 blanks, ~$1.50).
5. Switch the pipeline: new design -> print file -> paste on a blank (rotating poses so the same model is not next to herself) -> Printful product -> site.
