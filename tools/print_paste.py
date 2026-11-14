"""Upscale a photo 2x, find the AI-drawn pink print, erase it, and paste our EXACT print file in its place."""
import sys,glob,os
import numpy as np
from PIL import Image,ImageFilter
PRINT='/home/user/brand/ck/print/mommy.png'      # exact design (pink ink on transparent)
INK=np.array([255,79,154],float)
def components(mask):
    """Label connected regions of a small bool mask (BFS)."""
    H,W=mask.shape; lab=np.zeros((H,W),int); n=0; out=[]
    for y in range(H):
        for x in range(W):
            if mask[y,x] and not lab[y,x]:
                n+=1; st=[(y,x)]; lab[y,x]=n; pts=[]
                while st:
                    cy,cx=st.pop(); pts.append((cy,cx))
                    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        ny,nx=cy+dy,cx+dx
                        if 0<=ny<H and 0<=nx<W and mask[ny,nx] and not lab[ny,nx]: lab[ny,nx]=n; st.append((ny,nx))
                out.append(np.array(pts))
    return out
def blur_fill(img,m,r):
    """Normalized blur: estimate fabric under the mask from surrounding pixels (keeps shading). Two passes so big holes fill."""
    f1=_bf(img,m,r); m2=m.copy(); img2=img*(1-m[...,None])+f1*m[...,None]
    return _bf(img2,np.clip(m-0.0,0,1)*0.0,max(2,r//3))*0+f1
def _bf(img,m,r):
    w=Image.fromarray(((1-m)*255).astype('uint8')).filter(ImageFilter.GaussianBlur(r))
    num=[Image.fromarray((img[...,c]*(1-m)).astype('uint8')).filter(ImageFilter.GaussianBlur(r)) for c in range(3)]
    wv=np.asarray(w).astype(float)/255+1e-4
    res=np.stack([np.asarray(x).astype(float)/255/wv*255 for x in num],-1)
    ys,xs=np.nonzero(m>0.01)
    if len(ys):
        y0,y1,x0,x1=max(0,ys.min()-40),ys.max()+40,max(0,xs.min()-40),xs.max()+40
        ring=img[y0:y1,x0:x1][m[y0:y1,x0:x1]<0.01]
        fb=np.median(ring,axis=0) if len(ring) else np.array([235,235,235])
        bad=(wv<0.15)[...,None]|(res.max(-1,keepdims=True)>260)|(res.min(-1,keepdims=True)<0)
        res=np.where(bad,fb,res)
    return np.clip(res,0,255)
def process(src,dst,print_path=PRINT,ink_hex='#FF4F9A'):
    im=Image.open(src).convert('RGB'); im=im.resize((im.width*2,im.height*2),Image.LANCZOS)
    a=np.asarray(im).astype(float); r,g,b=a[...,0],a[...,1],a[...,2]
    INKC=np.array([int(ink_hex[i:i+2],16) for i in (1,3,5)],float)
    lum=a.mean(-1); sat=a.max(-1)-a.min(-1)
    if INKC.min()>200:   kind='white'; ink=(a.min(-1)>195)&(sat<40)
    elif INKC.max()<60:  kind='black'; ink=(a.max(-1)<75)
    else:                kind='color'; ink=(np.sqrt(((a-INKC)**2).sum(-1))<90)&(sat>70)
    small=Image.fromarray((ink*255).astype('uint8')).resize((im.width//8,im.height//8),Image.BOX)
    sm=np.asarray(small.filter(ImageFilter.MaxFilter(5)))>20      # merge letters into text blocks
    design=Image.open(print_path); design=design.crop(design.getbbox())
    out=a.copy(); n=0
    for comp in components(sm):
        if len(comp)<12: continue
        y0,x0=comp.min(0)*8; y1,x1=(comp.max(0)+1)*8
        blk=ink[y0:y1,x0:x1]; fill=blk.mean()
        if fill<0.05 or fill>0.5: continue                       # solid pink objects (lighter) are skipped
        if (x1-x0)<0.035*im.width: continue                       # too small to be a print (nails etc.)
        bg=a[y0:y1,x0:x1][~blk]
        if kind=='white':
            if bg.max(-1).mean()>120: continue                     # white print must sit on dark fabric
        elif bg.min(-1).mean()<140 or (bg.max(-1)-bg.min(-1)).mean()>55: continue   # print must sit on light, low-color fabric
        ys,xs=np.nonzero(blk); ty0,ty1,tx0,tx1=ys.min()+y0,ys.max()+y0,xs.min()+x0,xs.max()+x0
        # angle of the text block from its pixel spread
        cy,cx=ys.mean(),xs.mean(); cov=np.cov(np.vstack([xs-cx,ys-cy])); ang=np.degrees(0.5*np.arctan2(2*cov[0,1],cov[0,0]-cov[1,1]))
        ang=float(np.clip(ang,-20,20))
        # erase AI text
        # paste exact design sized to the AI text block, rotated, shaded by the fabric
        w=tx1-tx0; h=ty1-ty0
        ar=(w/h)/(design.width/design.height)
        if not (0.7<ar<1.45) or w>0.42*im.width: continue          # block doesn't look like our print (sleeves merged etc.) -> leave as is
        Y0,Y1,X0,X1=max(0,ty0-14),ty1+15,max(0,tx0-14),tx1+15
        sub=a[Y0:Y1,X0:X1]; sr,sg,sb=sub[...,0],sub[...,1],sub[...,2]
        if kind=='white': soft=(sub.min(-1)>150)&((sub.max(-1)-sub.min(-1))<50)
        elif kind=='black': soft=sub.max(-1)<120
        else: soft=np.sqrt(((sub-INKC)**2).sum(-1))<140                     # include faint anti-aliased edges
        m=np.zeros(ink.shape); m[Y0:Y1,X0:X1]=np.asarray(Image.fromarray((soft*255).astype('uint8')).filter(ImageFilter.MaxFilter(9)))/255
        fab=blur_fill(out,m,int(max(8,(ty1-ty0)//7))); out=out*(1-m[...,None])+fab*m[...,None]
        s=w/design.width; d=design.resize((max(1,round(design.width*s)),max(1,round(design.height*s))),Image.LANCZOS).rotate(-ang,expand=True,resample=Image.BICUBIC)
        da=np.asarray(d).astype(float); px=int(tx0+w/2-d.width/2); py=int((ty0+ty1)/2-d.height/2)
        reg=out[py:py+d.height,px:px+d.width]; H,W=reg.shape[:2]; da=da[:H,:W]
        fl=fab[py:py+H,px:px+W].mean(-1,keepdims=True)
        shade=np.clip(fl/235,0.55,1.05) if kind!='white' else np.clip(0.75+fl/255,0.8,1.0)
        al=da[...,3:4]/255; ink_rgb=da[...,:3]*shade
        out[py:py+H,px:px+W]=reg*(1-al)+ink_rgb*al; n+=1
    Image.fromarray(np.clip(out,0,255).astype('uint8')).save(dst,quality=93); return n
if __name__=='__main__':
    import json
    if len(sys.argv)>3:   # manifest mode: raw dir, out dir, designs json
        D=json.load(open(sys.argv[3]))
        for f in sorted(glob.glob(sys.argv[1]+'/*.jpg')):
            k=os.path.basename(f).split('__')[0]; k=k if k in D else k.split('_')[0]; v=D[k]
            print(os.path.basename(f),'prints replaced:',process(f,os.path.join(sys.argv[2],os.path.basename(f)),f'/home/user/brand/ck/print/{k}.png',v['color']),flush=True)
    else:
        for f in sorted(glob.glob(sys.argv[1]+'/*.jpg')):
            print(os.path.basename(f),'prints replaced:',process(f,os.path.join(sys.argv[2],os.path.basename(f))))
