"""Put each house design on the front of the string bikini bottom (Printful 669) = our panties."""
import os,json
from PIL import Image
src=open('/home/user/brand/tools/mockup.py').read(); exec(src[:src.index("BT,TK,CT")])   # aop()
import sys
D=json.load(open(sys.argv[1] if len(sys.argv)>1 else '/home/user/brand/tools/ck_designs.json'))
D={k:v for k,v in D.items() if v.get('panty',True)}
P='/home/user/brand/ck/print'; OUT=f'{P}/panty_669'; os.makedirs(OUT,exist_ok=True); os.makedirs('/home/user/brand/ck/mockups',exist_ok=True)
FABRIC={'#FFFFFF':'#151515'}           # white ink -> black fabric; everything else on white fabric
# one uniform scale for every panty: the biggest that still fits the widest/tallest design
_sz=[Image.open(f'{P}/{k}.png').getbbox() for k in D]
S_UNI=0.80   # big shared letter size; only designs that overflow the panel shrink
print('uniform panty scale',round(S_UNI,3))
for k,v in D.items():
    fab=FABRIC.get(v['color'],'#FFFFFF')
    t=Image.open(f'{P}/{k}.png'); t=t.crop(t.getbbox())
    s=min(S_UNI,1550/t.width,1150/t.height)
    t=t.resize((round(t.width*s),round(t.height*s)),Image.LANCZOS)
    c=Image.new('RGB',(7500,3300),fab); c.paste(t,(1874-t.width//2,1250-t.height//2),t)
    f=f'{OUT}/{k}.png'; c.save(f,dpi=(150,150))
    aop(669,179549,f,f'../../ck/mockups/{k}__panty')
