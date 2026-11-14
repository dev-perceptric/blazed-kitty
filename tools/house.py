"""House-style text designs with Google Nano Banana Pro (gemini-3-pro-image), VERY HOT as font reference."""
import sys,json,base64,urllib.request
from concurrent.futures import ThreadPoolExecutor
O='/home/user/brand/house/raw/'
REF=base64.b64encode(open('/home/user/brand/house/ref_veryhot.png','rb').read()).decode()
URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent'
STYLE=("The attached image is our brand's t-shirt print design. Make a NEW print design in EXACTLY the same style: "
 "the exact same two fonts (a small lowercase typewriter font for the top line in black, and a huge heavy bold condensed all-caps sans-serif for the main words in cherry red #C81E32), "
 "same font weights, same letter spacing, same tight line spacing, same centered stacked layout, same proportions between the small line and the big words. "
 "Flat solid ink only, crisp edges, perfectly flat pure white background, nothing else: no icons, no shapes, no borders, no shadows, no texture. "
 "Every word spelled exactly as written below. Change only the words: ")
D={
 'petme':"small top line: 'i’m high so'. Big red words: 'PET ME' (stack as 'PET' / 'ME' if it fits better).",
 'hotbaked':"small top line: 'sorry for being so'. Big red words stacked on two lines: 'HOT &' / 'BAKED'.",
 'mommy':"small top line: 'mommy needs'. Big red words stacked: 'A' / 'JOINT' or 'A JOINT'.",
 'born':"small top line: 'born to smoke,'. Big red words stacked on two lines: 'FORCED' / 'TO WORK'.",
 'rumors':"small top line: 'the rumors are true:'. Big red words stacked on two lines: 'I’M' / 'BAKED'.",
 'lighter':"small top line: 'do not pass me'. Big red words stacked on two lines: 'THE' / 'LIGHTER'. Then one more small typewriter line in black at the bottom: 'under any circumstances'.",
 'goodgirl':"small top line: 'who’s a good girl?'. Big red words stacked on two lines: 'ME.' / 'I’M HIGH.'",
 'exgf':"small top line: 'best ex-girlfriend' in the same black typewriter font with one straight black line striking through it. Big red words stacked on three lines: 'BETTER' / 'SMOKE' / 'BUDDY'.",
}
def run(job):
    n,i=job
    body={"contents":[{"parts":[{"inline_data":{"mime_type":"image/png","data":REF}},{"text":STYLE+D[n]}]}],
          "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"4:5","imageSize":"4K"}}}
    req=urllib.request.Request(URL,data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"dummy"})
    try: r=json.load(urllib.request.urlopen(req,timeout=600))
    except urllib.error.HTTPError as e: return f"{n}_{i} ERR {e.code} {e.read()[:300]}"
    for p in r.get('candidates',[{}])[0].get('content',{}).get('parts',[]):
        d=p.get('inlineData') or p.get('inline_data')
        if d: open(f"{O}{n}_{i}.png",'wb').write(base64.b64decode(d['data'])); return f"{n}_{i} ok"
    return f"{n}_{i} no image {json.dumps(r)[:300]}"
names=sys.argv[1:] or list(D)
jobs=[(n,i) for n in names for i in (0,1)]
with ThreadPoolExecutor(4) as ex:
    for res in ex.map(run,jobs): print(res)
