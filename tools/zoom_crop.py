"""Zoom in on the print: 4:5 crop centered on the (largest / panty) print, width = K x print width."""
import json,sys,os,glob
from PIL import Image
src,dst=sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True)
B=json.load(open(os.path.join(src,'_boxes.json')))
for f in sorted(glob.glob(src+'/*.jpg')):
    n=os.path.basename(f); im=Image.open(f); W,H=im.size
    boxes=B.get(n)
    if not boxes: im.save(os.path.join(dst,n),quality=93); print(n,'no box, kept'); continue
    # panty shots: use the lowest print (the panty); tops: the biggest print
    b=max(boxes,key=lambda b:b[1]) if '__set__' in n else max(boxes,key=lambda b:b[2]*b[3])
    px,py,pw,ph=b[:4]; cx=px+pw/2; cy=py+ph/2
    cw=min(W,max(pw*2.3,W*0.55)); ch=cw*5/4
    if ch>H: ch=H; cw=ch*4/5
    top=cy-ch*(0.42 if '__set__' not in n else 0.40); left=cx-cw/2
    left=max(0,min(W-cw,left)); top=max(0,min(H-ch,top))
    c=im.crop((int(left),int(top),int(left+cw),int(top+ch))).resize((1600,2000),Image.LANCZOS)
    c.save(os.path.join(dst,n),quality=93); print(n,'zoom',round(W/cw,2),'x')
