"""Bikini print files: solid color fabric + ONE text block per piece."""
import os
from PIL import Image
M='/home/user/brand/designs/master'; PR='/home/user/brand/designs/print'
def block(cw):
    im=Image.open(f'{M}/cw_{cw}.png').convert('RGBA'); return im.crop(im.getbbox())
# fabric color, text colorway
CW={'white-red':('#FFFFFF','red'),'red-white':('#C81E32','white'),'black-pink':('#151515','dark-pink'),
    'pink-black':('#FF4F9A','black'),'babyblue-navy':('#A9D4F5','navy')}
# piece centers + text width in print-file px (from Printful templates)
BOTTOM=dict(size=(7500,3300),cx=1874,cy=1300,w=820)   # front piece, upper middle
TOP=dict(size=(3900,3900),cx=1949,cy=1950,w=1250)      # bandeau front, centered
for name,(fab,cw) in CW.items():
    b=block(cw)
    for prod,P in [('bikini-bottom_669',BOTTOM),('bandeau-top_871',TOP)]:
        c=Image.new('RGB',P['size'],fab); s=P['w']/b.width
        r=b.resize((round(b.width*s),round(b.height*s)),Image.LANCZOS)
        c.paste(r,(P['cx']-r.width//2,P['cy']-r.height//2),r)
        os.makedirs(f'{PR}/{prod}',exist_ok=True); c.save(f'{PR}/{prod}/d03_{name}.png',dpi=(150,150))
    print(name)
for p in ('bikini-bottom_669','bandeau-top_871'):
    f=f'{PR}/{p}/d03_pattern.png'
    if os.path.exists(f): os.remove(f)
