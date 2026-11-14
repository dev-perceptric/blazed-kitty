"""Submit one Gemini 2.5 Flash Image BATCH job: every design x (2 tops + panty set) x 2 random models."""
import json,base64,random,io,urllib.request
from PIL import Image
random.seed(33)
M='/home/user/brand/ck/mockups/'; OUT='/home/user/brand/ck/photos/batch3/'
URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:batchGenerateContent'
def ref(f):
    im=Image.open(M+f).convert('RGB'); im.thumbnail((768,768)); b=io.BytesIO(); im.save(b,'JPEG',quality=88)
    return {"inline_data":{"mime_type":"image/jpeg","data":base64.b64encode(b.getvalue()).decode()}}
MODELS=["a Black woman with long knotless braids","a Latina woman with a messy high ponytail","an East Asian woman with a black hime cut and bangs","a South Asian woman with long wavy dark hair",
 "a white woman with a platinum messy blowout","a mixed-race woman with big curly hair","a Middle Eastern woman with a sleek low bun","a white woman with a choppy red wolf cut",
 "a Black woman with a short platinum buzz cut","a Southeast Asian woman with a slick back bun","a curvy Latina woman with dark curtain bangs","a white woman with a messy brown mullet",
 "a Filipina woman with long straight black hair","a plus-size Black woman with a glossy bob","a white woman with pink-streaked blonde hair","an Indigenous woman with long black braids"]
VIBE=("Simple fashion lookbook photo, framed from mid-thigh up: harsh direct on-camera flash casting a hard shadow of her on the wall behind her, film grain. "
 "The backdrop is ONE solid saturated color filling the entire frame edge to edge, seamless paper wall and floor, nothing else in the background. "
 "Stoner baddie energy: heavy-lidded lazy stoned eyes, sleepy smirk or giggling, slouchy relaxed body, messy styling, chunky silver chains, rings, long nails, small tattoos and piercings. "
 "She is an adult woman in her twenties, sexy but tasteful. No smoking, no joints, no drugs shown. "
 "She wears EXACTLY the garment(s) in the reference image(s): same garment, same color, and the same printed text (if any) in the same font, size and placement, spelled exactly. Do not add text anywhere else. ")
POSES=["standing facing the camera, one hand on her hip, the other hand relaxed, lollipop stick in her mouth, slim sunglasses",
 "standing with her weight on one leg, both thumbs hooked in her waistband, chin slightly down, unbothered look",
 "standing three-quarter turned toward the camera, one hand lifting her sunglasses, lazy half-lidded eyes",
 "standing straight with arms relaxed at her sides, lips parted, slight head tilt",
 "standing with one hand on her hip and the other touching her chains, sleepy smirk",
 "standing slouched with one hip popped, hand in her hair, heavy-lidded stare"]
DJ=json.load(open('/home/user/brand/tools/ck_designs_drop2.json'))
PAL=[['hot pink','butter yellow'],['cherry red','baby blue'],['lilac','tangerine orange'],['bubblegum pink','mint green'],['cobalt blue','hot pink'],['lime green','lilac'],['tangerine orange','bubblegum pink'],['baby blue','cherry red']]
SHOTS={}
for i,(k,v) in enumerate(DJ.items()):
    tops=[f"{k}__{p}_{c}.jpg" for p,c in v.get('tops',[])]
    SHOTS[k]=(PAL[i%len(PAL)],tops,f"{k}__panty.jpg" if v.get('panty') else None)
BOTTOMS=["low-rise baggy jeans","low-rise cargo pants","a denim micro skirt","low-rise track pants"]
reqs=[]; manifest={}
for d,(cols,tops,panty) in SHOTS.items():
    jobs=[(t,[t],f"wearing the top from the reference with {random.choice(BOTTOMS)}") for t in tops]
    if panty:
        blank='blank__tk_black.jpg' if DJ[d]['color']=='#FFFFFF' else 'blank__tk_white.jpg'
        setjob=('set',[blank,panty],"wearing the PLAIN tank top from the first reference with NO print on it at all, and the string panties from the second reference (shown flat as cut pieces) with the small print on the front; the only text anywhere is on the panties; underwear catalog style")
        jobs+= [setjob]*(2 if not tops else 1)
    for j,(name,refs,outfit) in enumerate(jobs):
        for k in range(2 if name!='set' else 1):
            key=f"{d}__{name.replace('.jpg','').split('__')[-1] if name!='set' else 'set'}__{j}{k}"
            model=random.choice(MODELS); pose=random.choice(POSES); bg=cols[(j+k)%2]
            text=VIBE+f"The model is {model}, {outfit}, {pose}. Solid {bg} backdrop. Vertical 4:5 photo."
            reqs.append({"request":{"contents":[{"parts":[ref(r) for r in refs]+[{"text":text}]}],
                         "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"4:5"}}},"metadata":{"key":key}})
            manifest[key]={"design":d,"refs":refs,"model":model,"pose":pose,"bg":bg}
body={"batch":{"display_name":"ck-batch3","input_config":{"requests":{"requests":reqs}}}}
data=json.dumps(body).encode(); print('requests',len(reqs),'payload MB',round(len(data)/1e6,1))
r=json.load(urllib.request.urlopen(urllib.request.Request(URL,data=data,headers={"Content-Type":"application/json","x-goog-api-key":"dummy"}),timeout=300))
json.dump({"op":r,"manifest":manifest},open(OUT+'job.json','w'),indent=1)
print('batch:',r.get('name'),r.get('metadata',{}).get('state'))
