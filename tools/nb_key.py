"""Cut the solid background out of a single-ink Nano Banana design -> clean transparent PNG."""
import glob,os
import numpy as np
from PIL import Image
R='/home/user/brand/nb/raw/'; O='/home/user/brand/nb/clean/'
for f in sorted(glob.glob(R+'*.png')):
    n=os.path.basename(f)
    im=Image.open(f).convert('RGB')
    if im.width<3000: im=im.resize((im.width*3,im.height*3),Image.LANCZOS)   # 1K tests -> 3x
    a=np.asarray(im).astype(float)
    H,W,_=a.shape; edge=np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)])
    bg=np.median(edge,axis=0)
    d=np.sqrt(((a-bg)**2).sum(2)); far=d>0.8*d.max()
    ink=np.median(a[far],axis=0)
    alpha=np.clip(d/np.linalg.norm(ink-bg),0,1)
    alpha=np.where(alpha<0.2,0,np.where(alpha>0.8,1,(alpha-0.2)/0.6))
    out=np.zeros((H,W,4),'uint8'); out[...,:3]=ink.round(); out[...,3]=(alpha*255).astype('uint8')
    out[:40,:,3]=0; out[-40:,:,3]=0; out[:,:40,3]=0; out[:,-40:,3]=0   # drop edge noise
    o=Image.fromarray(out,'RGBA'); o=o.crop(o.getbbox()); o.save(O+n)
    print(n,'bg',bg.round(),'ink',ink.round(),o.size)
