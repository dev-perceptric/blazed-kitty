"""Model photos via Nano Banana Pro edit, using our mockup as the reference image."""
import sys,json,base64,urllib.request,os
from concurrent.futures import ThreadPoolExecutor
M='/home/user/brand/designs/mockups/'; O='/home/user/brand/photos/raw/'
STYLE=("Real high-end fashion editorial photo shot on a 35mm camera with direct on-camera flash, natural skin texture with pores, "
       "realistic fabric wrinkles, plain seamless solid-color paper studio backdrop with nothing else, no landscape, no props. "
       "The model is an adult woman in her mid twenties. Confident, flirty, sexy but tasteful pose. "
       "She wears EXACTLY the garment from the reference image with the exact same print, same words, same font, same colors and placement: "
       "the small typewriter line 'slightly stoned but' above big bold condensed letters 'VERY HOT'. Keep the text sharp and spelled correctly. ")
SHOTS={
 'babytee_red':('baby-tee_red_red.jpg',"Full upper body and face. She wears the white raglan baby tee with red sleeves and low-rise light blue baggy jeans, one hand running through messy brunette hair, lips slightly parted, looking into the camera. Hot pink backdrop. Vertical 3:4.","3:4"),
 'babytee_royal':('baby-tee_trueroyal_royal.jpg',"Cropped from lips down to hips, face not shown, only her glossy lips and chin at the top of the frame. She wears the white raglan baby tee with royal blue sleeves showing a bit of midriff, low-rise dark jeans, thumbs hooked in her waistband. Butter yellow backdrop. Vertical 3:4.","3:4"),
 'tank_black':('tank_black_dark-pink.jpg',"She sits backwards on a simple chair, arms folded on the backrest, wearing the black micro-rib tank top with the pink print, smoky eye makeup, slight smirk, sleek dark hair. Cherry red backdrop. Vertical 3:4.","3:4"),
 'tank_chrome':('tank_white_chrome.jpg',"Close crop of her torso from collarbones to waist, face cropped out above the lips, wearing the white micro-rib tank with the chrome print, silver chain necklace, one hand touching her collarbone. Lilac backdrop. Vertical 4:5.","4:5"),
 'croptee_black':('crop-tee_washedblack_dark-chrome.jpg',"Three-quarter body, she leans back slightly with one hand on her hip, wearing the washed black cropped tee with the chrome print, a low-rise black micro mini skirt, blonde bob, looking over her sunglasses at the camera. Baby blue backdrop. Vertical 3:4.","3:4"),
 'croptee_denim':('crop-tee_lightdenim_red.jpg',"Upper body, she bites her lower lip and tugs the hem of the light blue washed cropped tee with the red print, curly auburn hair, freckles. Tangerine orange backdrop. Vertical 4:5.","4:5"),
 'bikini_black':('bikini-set_black-pink.jpg',"Fashion swimwear catalog photo, full body, relaxed standing pose with one hand on her hip, wearing a black bandeau swimsuit top with the pink print centered on the front and matching black string bikini bottoms with the small pink print on the front, oversized dark sunglasses. The hot pink seamless backdrop fills the entire frame edge to edge, no wall, no studio equipment visible. The reference shows the flat cut pieces of the top (upper) and bottom (lower). Vertical 3:4.","3:4"),
 'bikini_red':('bikini-set_red-white.jpg',"Cropped from chin down to mid thigh, face not shown, wearing a red bandeau bikini top with the white print centered on the front and a matching red string bikini bottom with the small white print on the front, one hand on her hip. The sky blue seamless backdrop fills the entire frame edge to edge, no wall, no studio equipment visible. The reference shows the flat cut pieces of the top (upper) and bottom (lower). Vertical 3:4.","3:4"),
}
def run(name):
    ref,desc,ar=SHOTS[name]
    uri="data:image/jpeg;base64,"+base64.b64encode(open(M+ref,'rb').read()).decode()
    body={"prompt":STYLE+desc,"image_urls":[uri],"num_images":2,"aspect_ratio":ar,"resolution":"2K"}
    req=urllib.request.Request("https://fal.run/fal-ai/nano-banana-pro/edit",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","Authorization":"Key dummy"})
    try: r=json.load(urllib.request.urlopen(req,timeout=600))
    except urllib.error.HTTPError as e: return f"{name} ERR {e.code} {e.read()[:300]}"
    out=[]
    for i,im in enumerate(r.get('images',[])):
        fn=f"{O}{name}_{i}.png"; urllib.request.urlretrieve(im['url'],fn); out.append(fn)
    return f"{name} -> {len(out)} images {r.get('description','')[:80]}"
names=sys.argv[1:] or list(SHOTS)
with ThreadPoolExecutor(8) as ex:
    for res in ex.map(run,names): print(res)
