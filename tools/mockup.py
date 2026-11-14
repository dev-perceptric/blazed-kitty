"""Build mockups from Printful templates + our print files."""
import json,os
import numpy as np
from PIL import Image,ImageFilter,ImageChops,ImageDraw
T='/tmp/claude-0/-home-user/3b9538e9-d6cd-56ef-8c70-bf1b7c62b93f/scratchpad/tpl'
PR='/home/user/brand/designs/print'; O='/home/user/brand/designs/mockups'; os.makedirs(O,exist_ok=True)
def tpl(pid,tid):
    r=json.load(open(f'{T}/t{pid}.json'))['result']
    return next(t for t in r['templates'] if t['template_id']==tid)

def garment(pid,tid,printfile,out):
    t=tpl(pid,tid); im=Image.open(f'{T}/{pid}_{tid}_im.png').convert('RGBA')
    S=im.width/t['template_width']
    pa=(round(t['print_area_left']*S),round(t['print_area_top']*S),round(t['print_area_width']*S),round(t['print_area_height']*S))
    design=Image.open(printfile).convert('RGBA').resize(pa[2:],Image.LANCZOS)
    if t['is_template_on_front']:
        base=Image.new('RGBA',im.size,t['background_color'])
        base.alpha_composite(design,pa[:2]); base.alpha_composite(im)
    else:
        base=Image.new('RGBA',im.size,'white'); base.alpha_composite(im)
        layer=Image.new('RGBA',im.size,(0,0,0,0)); layer.alpha_composite(design,pa[:2])
        # fabric folds: multiply print by template shading
        L=np.asarray(im.convert('L')).astype(float); shade=np.clip(L/np.percentile(L[L>200],60),0,1)[...,None]
        la=np.asarray(layer).astype(float); la[...,:3]*=shade; layer=Image.fromarray(la.astype('uint8'),'RGBA')
        base.alpha_composite(layer)
    bg=Image.new('RGB',im.size,'#F3F1EE'); bg.paste(base,(0,0),base)
    bg.save(f'{O}/{out}.jpg',quality=90); print(out)

def aop(pid,tid,printfile,out):
    """Flat-lay of the AOP pieces cut from the pattern, using the template's piece shapes."""
    t=tpl(pid,tid); im=Image.open(f'{T}/{pid}_{tid}_im.png').convert('RGBA')
    S=im.width/t['template_width']; im=im.resize((1500,1500)); S2=1500/t['template_width']
    pa=(round(t['print_area_left']*S2),round(t['print_area_top']*S2),round(t['print_area_width']*S2),round(t['print_area_height']*S2))
    a=np.asarray(im)[...,3]
    holes=Image.fromarray(((a<100)*255).astype('uint8'))
    holes=holes.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # close dotted lines
    m=np.asarray(holes)>0; box=np.zeros_like(m); box[pa[1]:pa[1]+pa[3],pa[0]:pa[0]+pa[2]]=True; m&=box
    mask=Image.fromarray((m*255).astype('uint8')).filter(ImageFilter.MinFilter(3))
    pat=Image.open(printfile).convert('RGB').resize(pa[2:],Image.LANCZOS)
    canvas=Image.new('RGB',(1500,1500),'#F3F1EE')
    sh=mask.filter(ImageFilter.GaussianBlur(10)); shadow=Image.new('RGB',(1500,1500),'#bdb8b2')
    canvas.paste(shadow,(8,12),sh)
    full=Image.new('RGB',(1500,1500),'white'); full.paste(pat,pa[:2])
    canvas.paste(full,(0,0),mask)
    edge=ImageChops.subtract(mask,mask.filter(ImageFilter.MinFilter(5)))
    canvas.paste(Image.new('RGB',(1500,1500),'#9c958e'),(0,0),edge)
    bb=mask.getbbox(); canvas=canvas.crop((max(0,bb[0]-80),max(0,bb[1]-80),min(1500,bb[2]+80),min(1500,bb[3]+80)))
    canvas.save(f'{O}/{out}.jpg',quality=90); print(out)


BT,TK,CT=f'{PR}/baby-tee_1201',f'{PR}/tank_1012',f'{PR}/crop-tee_6882GD'
# baby tee: text color matches sleeve color
for tid,c,cw in [(1006181,'trueroyal','royal'),(1006186,'red','red'),(1006185,'pink','pink'),(1006183,'black','black'),(1006182,'babyblue','sky'),(1006184,'navy','navy')]:
    garment(967,tid,f'{BT}/cw_{cw}.png',f'baby-tee_{c}_{cw}')
for tid,c,cws in [(389442,'white',['red','pink','green','chrome']),(389440,'pink',['red']),(389437,'babyblue',['navy']),(389436,'heather',['black']),(389438,'black',['dark-pink','dark-cream','dark-chrome']),(389439,'navy',['dark-cream'])]:
    for cw in cws: garment(780,tid,f'{TK}/cw_{cw}.png',f'tank_{c}_{cw}')
for tid,c,cws in [(1130915,'vintagewhite',['chrome','green']),(1130914,'lightdenim',['red','navy']),(1130916,'washedblack',['dark-pink','dark-red','dark-chrome'])]:
    for cw in cws: garment(1579,tid,f'{CT}/cw_{cw}.png',f'crop-tee_{c}_{cw}')
for cw in ['white-red','red-white','black-pink','pink-black','babyblue-navy']:
    aop(871,905314,f'{PR}/bandeau-top_871/d03_{cw}.png',f'bikini-top_{cw}')
    aop(669,179549,f'{PR}/bikini-bottom_669/d03_{cw}.png',f'bikini-bottom_{cw}')
