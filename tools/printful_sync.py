"""Create Printful sync products for every design (print files hosted on R2)."""
import json,os,sys,time,urllib.request,urllib.parse
from PIL import Image
A='8954ffc36634674f7163d2a03600e7fb'; PUB='https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
CK='/home/user/brand/ck'; OUT=f'{CK}/printful_files'; os.makedirs(OUT,exist_ok=True)
D1=json.load(open('/home/user/brand/tools/ck_designs.json')); D2=json.load(open('/home/user/brand/tools/ck_designs_drop2.json')); D4=json.load(open('/home/user/brand/tools/ck_designs_drop4.json'))
CAT={pid:json.load(open(f'/home/user/brand/printful/cat_{pid}.json'))['result']['variants'] for pid in (967,780,1579,669)}
PRICE={967:'36.00',780:'34.00',1579:'36.00',669:'30.00'}
KIND={967:'Baby Tee',780:'Rib Tank',1579:'Crop Tee',669:'String Bottom'}
PLACE={967:'front',780:'front',1579:'front_dtf',669:'bottom'}
COLS={  # product -> (colors for dark/colored ink, colors for white ink)
 967:(['White /True Royal','White/Baby Blue','White/Black','White/Navy','White/Pink','White/Red'],[]),
 780:(['Solid White Blend','Solid Pink Blend','Solid Baby Blue Blend','Athletic Heather'],['Solid Black Blend','Solid Navy Blend']),
 1579:(['Vintage White','Light Washed Denim'],['Washed Black']),
 669:(['White'],['White'])}
def h(path,data=None,method=None,host='https://api.printful.com'):
    req=urllib.request.Request(host+path,data=json.dumps(data).encode() if data is not None else None,method=method,
        headers={'Authorization':'Bearer dummy','Content-Type':'application/json'})
    try: return json.load(urllib.request.urlopen(req,timeout=120))
    except urllib.error.HTTPError as e: return {'code':e.code,'error':e.read().decode()[:400]}
def r2_put(local,key):
    url=f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    urllib.request.urlopen(urllib.request.Request(url,data=open(local,'rb').read(),method='PUT',headers={'Authorization':'Bearer dummy','Content-Type':'image/png'}),timeout=120)
    return f'{PUB}/{key}'
def print_file(d,pid):
    if pid==669: src=f'{CK}/print/panty_669/{d}.png'; f=src
    else:
        im=Image.open(f'{CK}/print/{d}.png')                       # 10x12 in @300dpi
        if pid==780: sm=im.resize((round(im.width*0.78),round(im.height*0.78)),Image.LANCZOS); l=(sm.width-2100)//2; im=sm.crop((l,0,l+2100,2400))
        if pid==1579: im=im.crop((0,0,3000,3000))
        f=f'{OUT}/{d}__{pid}.png'; im.save(f,dpi=(300,300))
    return r2_put(f,f'printful/{d}__{pid}.png')
def title(v): 
    if v.get('title'): return v['title']
    t=' '.join(v['lines']).replace('  ',' ').lower()
    return ' '.join(w if w.startswith('(') else w[:1].upper()+w[1:] for w in t.split()).replace('Of Bad','of Bad').replace(' To ',' to ').replace(' A ',' a ')
def plan():
    P=[]
    for drop,D in (('drop1',D1),('drop2',D2),('drop4',D4)):
        for d,v in D.items():
            white=v['color'].upper()=='#FFFFFF'
            if drop=='drop1': tops=[780,1579] if white else [967,780]
            else: tops=[{'bt':967,'tk':780,'ct':1579}[p] for p,_ in v.get('tops',[])]
            prods=list(dict.fromkeys(tops))+([669] if v.get('panty',drop=='drop1') else [])
            for pid in prods: P.append((drop,d,v,pid,white))
    return P
def make(drop,d,v,pid,white):
    cols=COLS[pid][1 if white else 0]
    if pid==780 and not white and v['color'].upper()=='#FF4F9A': cols=[c for c in cols if c!='Solid Pink Blend']   # pink on pink = unreadable
    if pid==780 and not white and v['color'].upper()=='#1A1A1A': cols=[c for c in cols if c!='Solid Navy Blend']
    url=print_file(d,pid)
    vs=[x for x in CAT[pid] if x['color'] in cols and x.get('in_stock',True)]
    thumbs=[f for f in json.load(open(f'{CK}/r2_keys.json')) if f.startswith(f'{drop}/{d}/mockups/')]
    body={'sync_product':{'name':f"{title(v)} {KIND[pid]}",'thumbnail':f'{PUB}/{thumbs[0]}' if thumbs else None},
          'sync_variants':[{'variant_id':x['id'],'retail_price':PRICE[pid],'files':[{'type':PLACE[pid],'url':url}]} for x in vs]}
    if not body['sync_product']['thumbnail']: del body['sync_product']['thumbnail']
    import re
    for attempt in range(8):
        r=h('/store/products',body,'POST')
        if r.get('code')==429:
            w=int((re.findall(r'after (\d+) seconds',r.get('error',''))or['60'])[0])+3; print('  rate limited, waiting',w,'s',flush=True); time.sleep(w); continue
        break
    ok=r.get('code')==200
    print(('OK ' if ok else 'ERR'),drop,d,pid,len(vs),'variants',(r.get('result',{}).get('id') if ok else r.get('error') or r)[:300] if not ok else r['result']['id'],flush=True)
    return ok
if __name__=='__main__':
    P=plan(); print('products planned',len(P),'variants',sum(1 for _ in P))
    have=set()
    off=0
    while True:
        r=h(f'/store/products?limit=100&offset={off}'); res=r.get('result',[]); have|={p['name'] for p in res}
        if len(res)<100: break
        off+=100
    todo=[j for j in P if f"{title(j[2])} {KIND[j[3]]}" not in have]
    print('already in store',len(have),'to create',len(todo),flush=True)
    for job in todo: make(*job); time.sleep(1)
