from PIL import Image,ImageDraw
import os
os.chdir('/home/user/brand/designs/mockups')
bt=['baby-tee_trueroyal_royal','baby-tee_red_red','baby-tee_pink_pink','baby-tee_black_black','baby-tee_babyblue_sky','baby-tee_navy_navy']
tk=['tank_white_red','tank_white_pink','tank_white_green','tank_white_chrome','tank_pink_red','tank_babyblue_navy','tank_heather_black','tank_black_dark-pink','tank_black_dark-cream','tank_black_dark-chrome','tank_navy_dark-cream']
ct=['crop-tee_vintagewhite_chrome','crop-tee_vintagewhite_green','crop-tee_lightdenim_red','crop-tee_lightdenim_navy','crop-tee_washedblack_dark-pink','crop-tee_washedblack_dark-red','crop-tee_washedblack_dark-chrome']
bk=['white-red','red-white','black-pink','pink-black','babyblue-navy']
S=330; cols=6
def label(n): return n.split('_',1)[1].replace('_',' / ')
rows=[]
for title,lst in [('BABY TEE 1201 (text matches sleeves)',bt),('MICRO-RIB TANK 1012',tk),('GARMENT DYE CROP TEE 6882GD',ct)]:
    for i in range(0,len(lst),cols): rows.append((title if i==0 else '',[(f,label(f)) for f in lst[i:i+cols]],'g'))
rows.append(('BANDEAU TOP + STRING BOTTOM (one print each, flat pieces)',[(c,c) for c in bk[:3]],'b'))
rows.append(('',[(c,c) for c in bk[3:]],'b'))
H=sum(S+60 for r in rows); g=Image.new('RGB',(cols*S,H),'white'); d=ImageDraw.Draw(g); y=0
for title,items,kind in rows:
    d.text((10,y+4),title,fill='black')
    for i,(f,lab) in enumerate(items):
        if kind=='g':
            im=Image.open(f+'.jpg'); im.thumbnail((S-10,S-10)); g.paste(im,(i*S+5,y+22)); d.text((i*S+10,y+S+18),lab,fill='#444')
        else:
            w=2*S; a=Image.open(f'bikini-top_{f}.jpg'); b=Image.open(f'bikini-bottom_{f}.jpg')
            a.thumbnail((w*0.42,S-10)); b.thumbnail((w*0.56,S-10))
            g.paste(a,(i*w+5,y+22+(S-10-a.height)//2)); g.paste(b,(i*w+15+a.width,y+22+(S-10-b.height)//2)); d.text((i*w+10,y+S+18),f,fill='#444')
    y+=S+60
g.save('/home/user/brand/designs/very_hot_colorways.jpg',quality=88)
