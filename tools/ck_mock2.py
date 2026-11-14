import os
from PIL import Image
src=open('/home/user/brand/tools/mockup.py').read(); exec(src[:src.index("BT,TK,CT")])
P='/home/user/brand/ck/print'; TMP='/home/user/brand/ck/tmp'; os.makedirs(TMP,exist_ok=True); os.makedirs('/home/user/brand/ck/mockups',exist_ok=True)
BT={'trueroyal':1006181,'red':1006186,'black':1006183,'pink':1006185,'babyblue':1006182,'navy':1006184}
TK={'white':389442,'pink':389440,'babyblue':389437,'heather':389436,'black':389438,'navy':389439}
CT={'vintagewhite':1130915,'lightdenim':1130914,'washedblack':1130916}
def file_for(d,prod):
    im=Image.open(f'{P}/{d}.png')               # 10x12 in @300dpi
    if prod=='bt': out=im
    if prod=='tk':                                   # tank is smaller: one fixed 0.78 scale for every design
        sm=im.resize((round(im.width*0.78),round(im.height*0.78)),Image.LANCZOS); l=(sm.width-2100)//2; out=sm.crop((l,0,l+2100,2400))
    if prod=='ct': out=im.crop((0,0,3000,3000))      # 10x10 in
    f=f'{TMP}/{d}_{prod}.png'; out.save(f); return f
import json,sys
DJ=json.load(open(sys.argv[1]))
PLAN={k:v['tops'] for k,v in DJ.items() if v.get('tops')}
for d,items in PLAN.items():
    for prod,col in items:
        pid,tid={'bt':(967,BT),'tk':(780,TK),'ct':(1579,CT)}[prod]; tid=tid[col]
        garment(pid,tid,file_for(d,prod),f'../../ck/mockups/{d}__{prod}_{col}')
