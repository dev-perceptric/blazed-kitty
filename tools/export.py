"""Export master art to Printful print files (transparent PNG, 150 dpi)."""
import glob,os
from PIL import Image
M='/home/user/brand/designs/master'; O='/home/user/brand/designs/print'
# product: (folder, canvas w,h, design width fraction, top margin px)
P={'baby-tee_1201':(1500,1800,0.80,60),'tank_1012':(1050,1200,0.92,40),'crop-tee_6882GD':(1500,1500,0.80,60)}
for f in sorted(glob.glob(M+'/*.png')):
    im=Image.open(f).convert('RGBA')
    a=im.getchannel('A').point(lambda v:0 if v<30 else (255 if v>225 else v)); im.putalpha(a)
    im=im.crop(im.getbbox())
    for prod,(W,H,frac,top) in P.items():
        os.makedirs(f'{O}/{prod}',exist_ok=True)
        s=min(W*frac/im.width,(H-top-20)/im.height)
        r=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
        c=Image.new('RGBA',(W,H),(0,0,0,0)); c.paste(r,((W-r.width)//2,top),r)
        c.save(f'{O}/{prod}/{os.path.basename(f)}',dpi=(150,150))
    print('exported',os.path.basename(f))
