"""Model photos with Google Nano Banana Pro (gemini-3-pro-image), mockups as reference images."""
import sys,json,base64,urllib.request
from concurrent.futures import ThreadPoolExecutor
M='/home/user/brand/ck/mockups/'; O='/home/user/brand/ck/photos/raw/'
URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent'
STYLE=("Real high-end fashion editorial photo, 35mm film look, direct on-camera flash, natural skin texture, realistic fabric. "
 "Plain seamless solid-color paper backdrop filling the whole frame edge to edge, no landscape, no props, no studio equipment. "
 "The model is an adult woman in her mid twenties, confident, flirty and sexy but tasteful. "
 "She wears EXACTLY the garment(s) shown in the reference image(s): same garment type, same colors, and the exact same printed text with the same font, same size and same placement. "
 "The printed words must be sharp, readable and spelled exactly like the reference. ")
S={
 'veryhot':(['veryhot__bt_red.jpg'],"White raglan baby tee with red sleeves, low-rise light wash jeans, one hand in her messy dark hair, looking at the camera, lips parted. Butter yellow backdrop."),
 'hotbaked':(['hotbaked__tk_black.jpg'],"Black ribbed tank top, sitting on the floor with knees up and arms resting on them, smirking at the camera, sleek dark hair. Lilac backdrop."),
 'petme':(['petme__bt_pink.jpg'],"White raglan baby tee with pink sleeves, low-rise jeans, cropped from her glossy lips down to her hips, thumbs hooked in her waistband. Hot pink backdrop."),
 'exgf':(['exgf__bt_black.jpg'],"White raglan baby tee with black sleeves, glancing back over her shoulder then turned to show the front print, blonde bob, red lipstick. Baby blue backdrop."),
 'goodgirl':(['goodgirl__tk_babyblue.jpg'],"Baby blue ribbed tank top and a white micro mini skirt, kneeling upright, playful smile, auburn waves. Cherry red backdrop."),
 'mommy':(['mommy__bt_pink.jpg'],"White raglan baby tee with pink sleeves and low-rise denim micro shorts, cropped from chin to thighs, face not shown, one hand on her hip. Mint green backdrop."),
 'born':(['born__tk_heather.jpg'],"Heather grey ribbed tank top, black low-rise cargo pants, leaning back with attitude, smoky eyes, piercings. Tangerine orange backdrop."),
 'rumors':(['rumors__bt_pink.jpg'],"White raglan baby tee with pink sleeves, low-rise baggy jeans, dark oval sunglasses, laughing, curly hair. Cobalt blue backdrop."),
 'lighter':(['lighter__tk_navy.jpg'],"Navy ribbed tank top, low-rise jeans, cropped from her lips down to her waist, chain necklace. Hot pink backdrop."),
 'set_petme':(['petme__tk_white.jpg','petme__panty.jpg'],"Matching loungewear set: the white ribbed tank top with the pink print from the first reference, and the white string bikini-style panties with the small pink print on the front from the second reference (shown flat as cut pieces). Standing, relaxed pose, hand in hair. Hot pink backdrop. Underwear catalog style, tasteful."),
 'set_mommy':(['mommy__tk_white.jpg','mommy__panty.jpg'],"Matching loungewear set: the white ribbed tank with the pink print from the first reference and the white string panties with the small pink print on the front from the second reference (shown flat as cut pieces). Cropped from chin to mid thigh, face not shown. Baby pink backdrop. Underwear catalog style, tasteful."),
 'set_hotbaked':(['hotbaked__tk_black.jpg','hotbaked__panty.jpg'],"Matching loungewear set: the black ribbed tank with the white print from the first reference and the black string panties with the small white print on the front from the second reference (shown flat as cut pieces). Sitting on a stool, legs crossed at the ankle, looking at camera. Cherry red backdrop. Underwear catalog style, tasteful."),
 'set_veryhot':(['veryhot__bt_red.jpg','veryhot__panty.jpg'],"Matching set: the white raglan baby tee with red sleeves from the first reference and the white string panties with the small red print on the front from the second reference (shown flat as cut pieces). Standing, one hip popped, playful look. Butter yellow backdrop. Underwear catalog style, tasteful."),
}
def call(job):
    n,i=job; refs,desc=S[n]
    parts=[{"inline_data":{"mime_type":"image/jpeg","data":base64.b64encode(open(M+r,'rb').read()).decode()}} for r in refs]
    parts.append({"text":STYLE+desc+" Vertical 4:5 photo."})
    body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"4:5","imageSize":"2K"}}}
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
    for res in ex.map(call,[(n,i) for n in names for i in (0,1)]): print(res)
