"""Pure Nano Banana Pro text designs at 4K."""
import sys,json,urllib.request
from concurrent.futures import ThreadPoolExecutor
O='/home/user/brand/nb/raw/'
BASE=("Print-ready t-shirt graphic for direct-to-garment printing. Typography only: no illustrations, no icons, no shapes, no borders, no decorations, no mockup, no shirt. "
      "Flat solid ink color, crisp sharp edges, no gradients, no shadows, no texture, no distress. Every word spelled exactly as written. "
      "The lettering is centered and fills most of the frame with a small margin.")
W="Background: perfectly flat solid pure white #FFFFFF."
K="Background: perfectly flat solid pure black #000000."
D={
 'petme_A':(f"{BASE} {W} Two lines. Line 1, large: 'pet me' in an elegant heavy serif italic, lowercase. Line 2, smaller: 'i’m high' in a typewriter font, lowercase. All text hot pink #FF4F9A."),
 'petme_B':(f"{BASE} {W} Stacked text, all lowercase in a bold soft retro serif like a 70s magazine headline: 'pet me' on top very large, 'i’m high' below slightly smaller and italic. All text hot pink #FF4F9A."),
 'hotbaked_A':(f"{BASE} {K} Four short stacked lines in a bold serif italic, lowercase, like a cute baby tee: 'sorry for being' / 'so hot' / 'and baked' / 'it’s a lot'. All text pure white."),
 'hotbaked_B':(f"{BASE} {K} Text: small lowercase serif italic line 'sorry for being so' on top, then very large bold condensed all caps 'HOT & BAKED' below. All text pure white."),
 'mommy_A':(f"{BASE} {W} Two lines in a bold blackletter Old English font: 'Mommy needs' / 'a joint'. All text pure black."),
 'mommy_B':(f"{BASE} {W} Text: 'mommy needs a joint' in a flowing tattoo-style script, slightly slanted upward, two lines: 'Mommy needs' / 'a joint'. All text pure black."),
 'born_A':(f"{BASE} {W} Blackletter Old English font. Line 1 and 2 large: 'Born to' / 'Smoke'. Line 3 and 4 smaller: 'Forced to' / 'Work'. All text pure black."),
 'born_B':(f"{BASE} {W} Text arranged like a classic tattoo meme shirt: 'BORN TO SMOKE' in bold blackletter caps on top, 'FORCED TO WORK' in smaller plain condensed caps below. All text pure black."),
 'rumors_A':(f"{BASE} {W} Text: 'THE RUMORS' / 'ARE TRUE' in very bold condensed all caps, then below it 'i’m baked' in a large serif italic lowercase. All text cherry red #C81E32."),
 'rumors_B':(f"{BASE} {W} Text: small typewriter line 'the rumors are true:' on top, then huge bold condensed all caps 'I’M BAKED' below. All text cherry red #C81E32."),
 'lighter_A':(f"{BASE} {W} Bold condensed all caps stacked lines: 'DO NOT' / 'PASS ME' / 'THE LIGHTER', then a smaller line in typewriter lowercase: 'under any circumstances'. All text pure black."),
 'lighter_B':(f"{BASE} {W} Stacked text: 'do not pass me the lighter' in a bold serif italic lowercase across two lines, then 'UNDER ANY CIRCUMSTANCES' in small spaced-out caps below. All text pure black."),
 'goodgirl_A':(f"{BASE} {W} Three stacked lines: small typewriter lowercase 'who’s a good girl?', then huge bold condensed all caps 'ME.', then bold condensed all caps 'I’M HIGH.'. All text cherry red #C81E32."),
 'goodgirl_B':(f"{BASE} {W} Text: 'who’s a good girl?' in a bold serif italic lowercase on top, then 'me. i’m high.' below in the same font, slightly larger. All text cherry red #C81E32."),
 'exgf_A':(f"{BASE} {W} Line 1: 'best ex-girlfriend' in an elegant serif italic, pure black, with a single bold hand-drawn red #C81E32 strikethrough line across it. Line 2 below: 'better smoke buddy' in the same serif italic, pure black. Only black and red."),
 'exgf_B':(f"{BASE} {W} Line 1: 'BEST EX-GIRLFRIEND' in bold condensed caps, pure black, crossed out with a thick red #C81E32 marker scribble line. Line 2 below: 'better smoke buddy' in red #C81E32 handwritten marker letters. Only black and red."),
}
def run(n):
    body={"prompt":D[n],"num_images":1,"aspect_ratio":"4:5","resolution":"4K"}
    req=urllib.request.Request("https://fal.run/fal-ai/nano-banana-pro",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","Authorization":"Key dummy"})
    try: r=json.load(urllib.request.urlopen(req,timeout=900))
    except urllib.error.HTTPError as e: return f"{n} ERR {e.code} {e.read()[:200]}"
    for im in r.get('images',[]): urllib.request.urlretrieve(im['url'],f"{O}{n}.png")
    return f"{n} ok"
names=sys.argv[1:] or list(D)
with ThreadPoolExecutor(3) as ex:
    for res in ex.map(run,names): print(res)
