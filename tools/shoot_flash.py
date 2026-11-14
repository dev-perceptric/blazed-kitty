"""Model photos with Google Nano Banana Pro (gemini-3-pro-image), mockups as reference images."""
import sys,json,base64,urllib.request
from concurrent.futures import ThreadPoolExecutor
M='/home/user/brand/ck/mockups/'; O='/home/user/brand/ck/photos/v2flash/'
URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'
STYLE=("Raw Y2K party-editorial photo shot on a cheap point-and-shoot with harsh direct on-camera flash: blown-out highlights, hard black shadow on the backdrop behind her, film grain, slightly tilted frame. "
 "Plain seamless solid-color paper backdrop, no landscape, no studio equipment. "
 "The model is an adult woman in her mid twenties with wild stoner-baddie energy: messy or slick hair, heavy black eyeliner, glossy lips, long nails, rings on every finger, chunky silver chains, small tattoos and piercings. Unbothered, cheeky, a little feral, sexy but tasteful. "
 "No smoking, no joints, no drugs visible. "
 "She wears EXACTLY the garment(s) in the reference image(s): same garment type, same colors, and the exact same printed text with the same font, size and placement. "
 "The print must be sharp, readable and spelled exactly: 'MOMMY NEEDS A JOINT'. ")
S={
 'mommy_floor':(['mommy__bt_pink.jpg'],"The white raglan baby tee with pink sleeves and low-rise baggy jeans. She lies on her back on the floor, shot from directly above, surrounded by open bags of chips, candy and soda cans, tiny oval sunglasses pushed up on her head, smirking up at the camera. Mint green backdrop and floor."),
 'mommy_squat':(['mommy__bt_pink.jpg'],"The white raglan baby tee with pink sleeves, low-rise baggy jeans and knee-high boots, a faux fur coat slipping off her shoulders. She squats low facing the camera, tongue out, shot from slightly above. Hot pink backdrop."),
 'mommy_fisheye':(['mommy__tk_white.jpg'],"The white ribbed tank top. Fisheye close-up shot from above, she bites the arm of tiny oval sunglasses and holds a hot pink lighter near her face (not lit), faint haze in the air. Teal colored light on a solid backdrop."),
 'mommy_set_floor':(['mommy__tk_white.jpg','mommy__panty.jpg'],"Matching set: the white ribbed tank with the pink print (first reference) and the white string panties with the small pink 'MOMMY NEEDS A JOINT' print on the front (second reference, shown flat as cut pieces). She sits on the floor with knees up, a black leather jacket falling off her shoulders, side-eye at the camera. Baby pink backdrop. Underwear catalog style, tasteful."),
 'mommy_set_lolli':(['mommy__tk_white.jpg','mommy__panty.jpg'],"Matching set: the white ribbed tank with the pink print (first reference) and the white string panties with the small pink 'MOMMY NEEDS A JOINT' print on the front (second reference, shown flat as cut pieces). Standing with one hip popped, a red lollipop in her mouth, winking, leg warmers. Red spotlight fading to dark at the edges of a red backdrop. Underwear catalog style, tasteful."),
}
def call(job):
    n,i=job; refs,desc=S[n]
    parts=[{"inline_data":{"mime_type":"image/jpeg","data":base64.b64encode(open(M+r,'rb').read()).decode()}} for r in refs]
    parts.append({"text":STYLE+desc+" Vertical 4:5 photo."})
    body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"4:5"}}}
    for attempt in range(3):
        req=urllib.request.Request(URL,data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"dummy"})
        try: r=json.load(urllib.request.urlopen(req,timeout=600))
        except urllib.error.HTTPError as e:
            err=f"ERR {e.code} {e.read()[:200]}"
            if e.code in (500,502,503,429): continue
            return f"{n}_{i} {err}"
        for p in r.get('candidates',[{}])[0].get('content',{}).get('parts',[]):
            d=p.get('inlineData') or p.get('inline_data')
            if d: open(f"{O}{n}_{i}.jpg",'wb').write(base64.b64decode(d['data'])); return f"{n}_{i} ok"
        return f"{n}_{i} no image: {json.dumps(r.get('candidates',[{}])[0].get('finishReason',r))[:150]}"
    return f"{n}_{i} {err}"
names=sys.argv[1:] or list(S)
with ThreadPoolExecutor(4) as ex:
    for res in ex.map(call,[(n,0) for n in names]): print(res)
