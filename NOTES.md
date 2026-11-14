# Brand notes

## Test products (Printful) — chosen by owner
1. Micro Rib Raglan Baby Tee, Bella+Canvas 1201 (id 967) — owner picked White / True Royal
   https://www.printful.com/custom/womens/t-shirts/womens-micro-rib-raglan-baby-tee-bella-canvas-1201
2. Micro-Rib Tank Top, Bella+Canvas 1012 (id 780)
   https://www.printful.com/custom/womens/tank-tops/womens-micro-rib-tank-top-bella-canvas-1012
3. Garment Dye Cropped Tee, Bella+Canvas 6882GD (id 1579)
   https://www.printful.com/custom/womens/shirts/womens-garment-dye-cropped-tee-bella-canvas-6882gd
4. All-Over Print Recycled String Bikini Bottom
   https://www.printful.com/custom/womens/swimwear/all-over-print-recycled-string-bikini-bottom
5. All-Over Print Recycled Bandeau Bikini Top
   https://www.printful.com/custom/womens/swimwear/aop-recycled-bandeau-bikini-top

## Tier 1 designs
2 Pet Me I'm High (Diary) · 1 Sorry For Being Hot And Baked (Chrome) · 9 Slightly Stoned But Very Hot (Chrome)
4 Mommy Needs A Joint (Flash) · 12 Born To Smoke, Forced To Work (Flash) · 15 Rumors Are True, I'm Baked (Tabloid)
8 Do Not Pass Me The Lighter Under Any Circumstances (Warning label) · 7 Who's A Good Girl? (Pixel pet)
5 Best Ex-Girlfriend, Better Smoke Buddy (Diary) · 17 Smoke Break Kitten (Flash mascot)

## Style rule (from owner)
- Designs must NOT be too cartoonish. No cartoon mascot.
- Lean on typography, fine-line tattoo art, real photos with grain or halftone, and objects (pet tags, labels, receipts).

## Tier 1 status
- Masters: designs/master (3000x3600). Print files: designs/print/{baby-tee_1201,tank_1012,crop-tee_6882GD}
- Rebuild: node tools/render.js && python3 tools/export.py
- fal balance ran out — flash sheet art not made (d05 uses a code-drawn dagger instead)
- Art is AI at ~900px upscaled 3x locally; upscale on fal once balance is topped up

## Drop 1 pick: d03 Slightly Stoned But Very Hot (owner: only this one works)
- Print files: designs/print/*/d03_very_hot.png (light), d03_very_hot_dark.png (white top line, for black/navy)
- Bikini all-over pattern: designs/print/bikini-bottom_669/d03_pattern.png (7500x3300), bandeau-top_871/d03_pattern.png (3900x3900)
- Mockups: designs/mockups/ (built from Printful templates; bikini = flat piece layout). Rebuild: python3 tools/mockup.py
- Colorways (cw_*): red, pink, royal, navy, black, sky, green, chrome; dark shirts: dark-pink, dark-cream, dark-red, dark-chrome
- Baby tee rule: text color matches sleeve color
- Bikini: ONE text block per piece (owner said no repeat pattern). Fabric colorways: white-red, red-white, black-pink, pink-black, babyblue-navy. Script: tools/bikini.py
- Rejected Tier 1 designs moved to designs/archive

## Model photos
- photos/final (15 picks), sheet photos/very_hot_models.jpg. Script: tools/shoot.py (Nano Banana Pro edit, mockup as reference)

## New direction (owner): PURE TEXT on hot clothes, very readable (like CherryKitten). No art, no tags, no photos.
- Nano Banana Pro test (art/nbtest): spelling 6/6 correct, ~1000px, white background, 1 of 6 came out as a shirt mockup.
- Pure Nano Banana designs: nb/raw (4K), cutouts nb/clean, print files nb/print, mockups nb/mockups, board nb/nb_text_mockups.jpg
- Scripts: tools/nb_designs.py (generate), tools/nb_key.py (cut background), tools/nb_mock.py (print files + mockups)
- Rejected: lighter_A (spelled "PAS ME"), hotbaked_B (stretched letters)
- Still missing (fal balance ran out): exgf A+B, rumors_A, goodgirl_B; petme + goodgirl_A are 1K tests, regenerate at 4K

## HOUSE STYLE (owner, after studying CherryKitten) — USE THIS
- ONE font per design, every line the SAME size, ONE ink color, small block centered mid-chest. Text only.
- UPDATED: each design = ONE font throughout, but DIFFERENT font per design (diverse set). Fonts per design live in tools/ck_designs.json.
- Size rule: ALL-CAPS designs cap height 0.85 in; lowercase designs x-height 0.58 in; optional per-font 'scale' boost; max width 7.6 in; break long sentences into short lines; top 1.0 in.
- Per product scale: baby tee + crop tee 100%, tank 78% (same for every design).
- Files: tools/ck_designs.json (slogans), tools/ck_render.js (print files -> ck/print), tools/ck_mock.py (mockups -> ck/mockups)
- Nano Banana (Google key works via generativelanguage.googleapis.com, model gemini-3-pro-image) can't hold exact sizes -> use for model photos, not print files
- Owner: no cartoonish fonts; classic print fonts with CherryKitten vibe (not their exact fonts). Owner loves the hot pink #FF4F9A.
- Current fonts: Anton, Tinos Bold Italic, Source Serif 4 Black Italic, Playfair Black Italic, Libre Franklin Black Italic, Archivo Black, Pirata One, Zilla Slab Bold, Barlow Condensed ExtraBold Italic
- Panties = Printful 669 string bikini bottom, front print, fixed scale 0.40 of tee master. Files ck/print/panty_669. Script tools/ck_panty.py
- Model photos (Google key): tools/shoot_google.py -> ck/photos/final (25). Rejected exgf_1 (print hidden).

## Model photo direction v2 (from Pinterest research) — models must feel stoner / wild baddie
- Attitude: tongue out, biting sunglasses arm, finger on lip, wink, side-eye, smirk, mid-laugh. Low squats, floor sitting with boots, crouching, kneeling.
- Camera: harsh direct flash with hard shadow on backdrop, high angle looking down, fisheye/wide from above, low angle, tilted frame, grain, slight blur.
- Styling: tiny oval or wraparound sunglasses, bandana/head scarf, chunky silver chains, rings on every finger, long nails, tattoos, piercings, heavy liner, glossy lips, slick bun or messy blowout, fur coat or leather jacket off the shoulder, knee boots, leg warmers, low-rise baggy jeans/cargos, micro skirts.
- Stoner props (no drug use shown): lighter, lipstick lighter, smoke haze, lollipop, soda can, munchies (chips, takeout), rolling papers.
- Backdrops: still solid color, plus colored gel light (teal, red, blue) and spotlight vignette.
- Mood board: ck/moodboard_pinterest.jpg
- Cheap pipeline (owner approved): Gemini 2.5 Flash Image 1K (tools/shoot_flash.py, ~$0.04/img) -> tools/print_paste.py (2x upscale, erase AI print, paste exact print file). Output ck/photos/v2final
- Batch1 (2.5 Flash batch, 48 shots, ~$1): ck/photos/batch1/final (45 kept). Scripts: tools/batch_submit.py, tools/batch_poll.py, tools/print_paste.py raw final ck_designs.json
- Watch: AI snack bags can look like real brands (Doritos/Lay's lookalikes) — avoid in ads
- CherryKitten's own fonts (DON'T use): Cooper Black, Helvetica caps, Baskerville italic, Road Rage, Barbie-style, Maneater script
- Panty set shots: top is PLAIN (no print), only the panty carries the design
- Batch2 standing poses (owner ref: hand on hip, sunglasses, lollipop, hard wall shadow), plain tops on panty sets: ck/photos/batch2/final (49 kept). Script tools/batch_submit2.py

## Storage
- Everything is saved on GitHub: dev-perceptric/blazed-kitty, branch `brand-assets` (separate from main, no deploy). Add new keepers there.

## Drop 2 (18 designs)
- Designs: tools/ck_designs_drop2.json. Print files print/drop2, panties print/panty_669 (bigger: shared scale 0.80, max 10 in wide).
- Photos: photos/drop2 (51). Panty set shots use a PLAIN tank.

## Cloudflare R2 (main image storage)
- Bucket: blazed-kitty. Public URL: https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev/<key>
- Layout: drop1|drop2/<design>/photos/<shoot>/, /mockups/, /print/ ; shared/, boards/, archive/
- Upload script: tools/r2_upload.py (uses Cloudflare API token saved as network secret for api.cloudflare.com)
- Drop 2 zoomed realistic photos (47): photos/drop2_zoom. Zoom is done in code (tools/zoom_crop.py) since the model ignores tight-crop prompts.

## Printful (store 'Blazed Kitty', id 19064428, API/native)
- 54 products, 898 variants, all synced. Script: tools/printful_sync.py (skips names already in store, waits on rate limits)
- Prices: baby tee 967 $36, tank 780 $34, crop tee 1579 $36, string bottom 669 $30
- Colors: dark/colored ink -> 6 raglan baby tees + light tanks (no pink tank for pink ink, no navy for black ink); white ink -> black/navy tank + washed black crop tee
- Print files hosted on R2 at printful/<design>__<productId>.png
