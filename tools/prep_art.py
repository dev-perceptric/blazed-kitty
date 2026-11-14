"""Prepare AI art for print: cut out white backgrounds, upscale, halftone photos, crisp line art."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
RAW='/home/user/brand/art/raw/'; OUT='/home/user/brand/art/clean/'

def border_flood(img, thresh=238):
    """Alpha mask: remove near-white pixels connected to the image border."""
    a=np.asarray(img.convert('RGB')).astype(int)
    white=(a.min(axis=2)>=thresh)
    seed=np.zeros_like(white); seed[0,:]=white[0,:]; seed[-1,:]=white[-1,:]; seed[:,0]=white[:,0]; seed[:,-1]=white[:,-1]
    wimg=white
    for _ in range(2000):
        s=Image.fromarray((seed*255).astype('uint8'),'L').filter(ImageFilter.MaxFilter(3))
        ns=(np.asarray(s)>0)&wimg
        if (ns==seed).all(): break
        seed=ns
    alpha=Image.fromarray(((~seed)*255).astype('uint8'),'L')
    alpha=alpha.filter(ImageFilter.MinFilter(3))
    return alpha

def cutout(name, out, scale=3):
    im=Image.open(RAW+name).convert('RGB')
    alpha=border_flood(im)
    im=im.resize((im.width*scale,im.height*scale),Image.LANCZOS)
    alpha=alpha.resize(im.size,Image.LANCZOS).point(lambda v:0 if v<100 else (255 if v>155 else v))
    im.putalpha(alpha)
    im=im.crop(im.getbbox()); im.save(OUT+out); print(out,im.size)

def lineart(name,out,scale=3):
    """Upscale fine-line art, keep 2 inks (black + red), drop white."""
    im=Image.open(RAW+name).convert('RGB')
    im=im.resize((im.width*scale,im.height*scale),Image.LANCZOS)
    a=np.asarray(im).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
    lum=0.3*r+0.59*g+0.11*b
    red=(r>110)&(r-g>60)&(r-b>45)
    ink=(lum<150)&~red
    o=np.zeros((*lum.shape,4),'uint8')
    o[ink]=[26,26,26,255]; o[red]=[200,30,50,255]
    res=Image.fromarray(o,'RGBA')
    res=res.crop(res.getbbox()); res.save(OUT+out); print(out,res.size)

def halftone(name,out,cell=14,angle=45,crop=None,scale=3,gamma=1.0):
    """Black dot halftone of a photo on transparent background."""
    im=Image.open(RAW+name).convert('L')
    if crop: im=im.crop(crop)
    im=ImageOps.autocontrast(im,cutoff=1)
    im=im.resize((im.width*scale,im.height*scale),Image.LANCZOS)
    W,H=im.size
    big=im.rotate(angle,expand=True,fillcolor=255)
    BW,BH=big.size
    dots=Image.new('L',(BW,BH),0); d=ImageDraw.Draw(dots)
    px=np.asarray(big)
    for y in range(0,BH,cell):
        for x in range(0,BW,cell):
            v=px[y:y+cell,x:x+cell].mean()/255.0
            dark=(1-v)**gamma
            r=cell*0.75*dark**0.5
            if r>0.6: d.ellipse([x+cell/2-r,y+cell/2-r,x+cell/2+r,y+cell/2+r],fill=255)
    dots=dots.rotate(-angle,expand=False)
    l=(BW-W)//2;t=(BH-H)//2; dots=dots.crop((l,t,l+W,t+H))
    dots=dots.point(lambda v:255 if v>127 else 0)
    o=Image.new('RGBA',(W,H),(26,26,26,0)); o.putalpha(dots)
    o.save(OUT+out); print(out,o.size)

if __name__=='__main__':
    cutout('heart_tag_1.png','heart_tag.png')
    cutout('dog_tag_1.png','dog_tag.png')
    cutout('round_tag_1.png','round_tag.png')
    cutout('lighter_1.png','lighter.png')
    lineart('roses_1.png','roses.png')
    halftone('tabloid_0.png','tabloid_ht.png',crop=(60,120,860,1050),cell=15)
