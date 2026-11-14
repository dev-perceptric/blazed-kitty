"""Print files + mockups for the Nano Banana designs."""
import os
from PIL import Image
src=open('/home/user/brand/tools/mockup.py').read(); exec(src[:src.index("BT,TK,CT")])  # garment(), aop()
C='/home/user/brand/nb/clean/'; PR='/home/user/brand/nb/print'; MO='/home/user/brand/nb/mockups'
os.makedirs(MO,exist_ok=True)
SIZES={'baby-tee_1201':(1500,1800,0.80,60),'tank_1012':(1050,1200,0.90,40),'crop-tee_6882GD':(1500,1500,0.78,60)}
def pf(name,prod):
    W,H,frac,top=SIZES[prod]; im=Image.open(C+name+'.png')
    s=min(W*frac/im.width,(H*0.62)/im.height)   # cap height so tall designs stay on the chest
    r=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    c=Image.new('RGBA',(W,H),(0,0,0,0)); c.paste(r,((W-r.width)//2,top),r)
    os.makedirs(f'{PR}/{prod}',exist_ok=True); p=f'{PR}/{prod}/{name}.png'; c.save(p,dpi=(150,150)); return p
BT={'trueroyal':1006181,'red':1006186,'black':1006183,'pink':1006185,'babyblue':1006182,'navy':1006184}
TK={'white':389442,'pink':389440,'babyblue':389437,'heather':389436,'black':389438,'navy':389439}
CT={'vintagewhite':1130915,'lightdenim':1130914,'washedblack':1130916}
PLAN={ # design: [(product, color)]
 'born_A':[('bt','black'),('tk','white'),('ct','vintagewhite')],
 'born_B':[('bt','black'),('tk','heather'),('ct','lightdenim')],
 'mommy_A':[('bt','black'),('tk','pink'),('ct','vintagewhite')],
 'mommy_B':[('bt','red'),('tk','white'),('ct','lightdenim')],
 'lighter_B':[('bt','black'),('tk','babyblue'),('ct','vintagewhite')],
 'hotbaked_A':[('tk','navy'),('tk','black'),('ct','washedblack')],
 'rumors_B':[('bt','red'),('tk','white'),('ct','vintagewhite')],
 'goodgirl_A':[('bt','red'),('tk','white'),('ct','vintagewhite')],
 'petme_A':[('bt','pink'),('tk','white'),('ct','vintagewhite')],
 'petme_B':[('bt','pink'),('tk','babyblue'),('ct','lightdenim')],
}
import builtins
for d,items in PLAN.items():
    for kind,col in items:
        if kind=='bt': garment(967,BT[col],pf(d,'baby-tee_1201'),f'../../nb/mockups/{d}__babytee_{col}')
        if kind=='tk': garment(780,TK[col],pf(d,'tank_1012'),f'../../nb/mockups/{d}__tank_{col}')
        if kind=='ct': garment(1579,CT[col],pf(d,'crop-tee_6882GD'),f'../../nb/mockups/{d}__croptee_{col}')
