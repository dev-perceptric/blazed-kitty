"""Submit one Gemini 2.5 Flash Image BATCH job: every design x (2 tops + panty set) x 2 random models."""
import json,base64,random,io,urllib.request
from PIL import Image
random.seed(7)
M='/home/user/brand/ck/mockups/'; OUT='/home/user/brand/ck/photos/batch1/'
URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:batchGenerateContent'
def ref(f):
    im=Image.open(M+f).convert('RGB'); im.thumbnail((768,768)); b=io.BytesIO(); im.save(b,'JPEG',quality=88)
    return {"inline_data":{"mime_type":"image/jpeg","data":base64.b64encode(b.getvalue()).decode()}}
MODELS=["a Black woman with long knotless braids","a Latina woman with a messy high ponytail","an East Asian woman with a black hime cut and bangs","a South Asian woman with long wavy dark hair",
 "a white woman with a platinum messy blowout","a mixed-race woman with big curly hair","a Middle Eastern woman with a sleek low bun","a white woman with a choppy red wolf cut",
 "a Black woman with a short platinum buzz cut","a Southeast Asian woman with a slick back bun","a curvy Latina woman with dark curtain bangs","a white woman with a messy brown mullet",
 "a Filipina woman with long straight black hair","a plus-size Black woman with a glossy bob","a white woman with pink-streaked blonde hair","an Indigenous woman with long black braids"]
VIBE=("Raw Y2K flash editorial photo: harsh direct on-camera flash, hard shadow behind her, film grain, slightly tilted frame. "
 "The backdrop is ONE solid saturated color filling the entire frame edge to edge, seamless paper wall and floor, nothing else in the background. "
 "Stoner baddie energy: heavy-lidded lazy stoned eyes, sleepy smirk or giggling, slouchy relaxed body, messy styling, chunky silver chains, rings, long nails, small tattoos and piercings. "
 "She is an adult woman in her twenties, sexy but tasteful. No smoking, no joints, no drugs shown. "
 "She wears EXACTLY the garment(s) in the reference image(s): same garment, same color, and the same printed text in the same font, size and placement, spelled exactly. ")
POSES=["lounging on the floor surrounded by open bags of chips and candy","squatting low with a lazy smirk, knee-high boots","sitting backwards on a chair, arms on the backrest, half-lidded eyes",
 "lying on her side propped on an elbow, giggling","kneeling and twirling a pink lighter between her fingers, faint haze in the air","standing slouched with a lollipop in her mouth, tiny sunglasses low on her nose",
 "sitting cross-legged with a big bag of chips, mid-laugh","leaning back on her hands on the floor, sleepy smirk at the camera"]
SHOTS={ # design: (backdrop colors, [top mockups], panty mockup, bottoms for top shots)
 'veryhot':(['butter yellow','tangerine orange'],['veryhot__bt_red.jpg','veryhot__tk_white.jpg'],'veryhot__panty.jpg'),
 'hotbaked':(['lilac','cherry red'],['hotbaked__tk_black.jpg','hotbaked__ct_washedblack.jpg'],'hotbaked__panty.jpg'),
 'petme':(['hot pink','baby blue'],['petme__bt_pink.jpg','petme__tk_white.jpg'],'petme__panty.jpg'),
 'exgf':(['baby blue','lime green'],['exgf__bt_black.jpg','exgf__ct_vintagewhite.jpg'],'exgf__panty.jpg'),
 'goodgirl':(['cherry red','hot pink'],['goodgirl__bt_red.jpg','goodgirl__tk_babyblue.jpg'],'goodgirl__panty.jpg'),
 'born':(['tangerine orange','cobalt blue'],['born__bt_black.jpg','born__tk_heather.jpg'],'born__panty.jpg'),
 'rumors':(['cobalt blue','bubblegum pink'],['rumors__bt_pink.jpg','rumors__ct_vintagewhite.jpg'],'rumors__panty.jpg'),
 'lighter':(['hot pink','mint green'],['lighter__tk_navy.jpg','lighter__ct_washedblack.jpg'],'lighter__panty.jpg'),
}
BOTTOMS=["low-rise baggy jeans","low-rise cargo pants","a denim micro skirt","low-rise track pants"]
reqs=[]; manifest={}
for d,(cols,tops,panty) in SHOTS.items():
    jobs=[(t,[t],f"wearing the top from the reference with {random.choice(BOTTOMS)}") for t in tops]
    jobs.append(('set',[tops[0],panty],"wearing a matching set: the top from the first reference and the string panties from the second reference (shown flat as cut pieces) with the small print on the front, underwear catalog style"))
    for j,(name,refs,outfit) in enumerate(jobs):
        for k in range(2):
            key=f"{d}__{name.replace('.jpg','').split('__')[-1] if name!='set' else 'set'}__{k}"
            model=random.choice(MODELS); pose=random.choice(POSES); bg=cols[(j+k)%2]
            text=VIBE+f"The model is {model}, {outfit}, {pose}. Solid {bg} backdrop. Vertical 4:5 photo."
            reqs.append({"request":{"contents":[{"parts":[ref(r) for r in refs]+[{"text":text}]}],
                         "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"4:5"}}},"metadata":{"key":key}})
            manifest[key]={"design":d,"refs":refs,"model":model,"pose":pose,"bg":bg}
body={"batch":{"display_name":"ck-batch1","input_config":{"requests":{"requests":reqs}}}}
data=json.dumps(body).encode(); print('requests',len(reqs),'payload MB',round(len(data)/1e6,1))
r=json.load(urllib.request.urlopen(urllib.request.Request(URL,data=data,headers={"Content-Type":"application/json","x-goog-api-key":"dummy"}),timeout=300))
json.dump({"op":r,"manifest":manifest},open(OUT+'job.json','w'),indent=1)
print('batch:',r.get('name'),r.get('metadata',{}).get('state'))
