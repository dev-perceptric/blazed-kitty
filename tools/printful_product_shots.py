"""Printful product-only photos (Ghost/Flat, no models) for every store product, in every color. Saved to R2 site/products/<slug>/."""
import json,time,re,urllib.request,urllib.parse,sys,os
A='8954ffc36634674f7163d2a03600e7fb'; PUB='https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
OUT='/home/user/brand/ck/site_shots.json'
STY={967:(['Ghost','Flat'],['Front']),780:(['Ghost','Flat'],['Front']),1579:(['Ghost','Flat'],['Front']),669:(['Flat','Product details'],['Front','Bottom','Product details']),872:(['Flat','Product details'],['Front','Bottom Front','Product details'])}
AREA={967:(1500,1800),780:(1050,1200),1579:(1500,1500),669:(7500,3300),872:(3900,3900)}
PLACE={967:'front',780:'front',1579:'front_dtf',669:'bottom',872:'bottom_front'}
def pf(method,path,body=None):
    for t in range(10):
        req=urllib.request.Request('https://api.printful.com'+path,data=json.dumps(body).encode() if body is not None else None,method=method,headers={'Authorization':'Bearer dummy','Content-Type':'application/json'})
        try: return json.load(urllib.request.urlopen(req,timeout=120))
        except urllib.error.HTTPError as e:
            txt=e.read().decode()
            if e.code==429:
                w=int((re.findall(r'after (\d+) seconds',txt) or ['30'])[0])+3; print('  wait',w,flush=True); time.sleep(w); continue
            return {'code':e.code,'error':txt[:300]}
def r2(data,key):
    url=f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    urllib.request.urlopen(urllib.request.Request(url,data=data,method='PUT',headers={'Authorization':'Bearer dummy','Content-Type':'image/jpeg'}),timeout=120); return f'{PUB}/{key}'
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower().replace('’','').replace("'",'')).strip('-')
man=json.load(open(OUT)) if os.path.exists(OUT) else {}
PP='/home/user/brand/ck/print_big/pushed.json'; PUSHED=set(json.load(open(PP))) if os.path.exists(PP) else set()
prods=[]; off=0
while True:
    r=pf('GET',f'/store/products?limit=100&offset={off}')['result']; prods+=r
    if len(r)<100: break
    off+=100
for p in prods:
    sl=slug(p['name'])
    if sl in man and man[sl].get('shots'): continue
    d=pf('GET',f"/store/products/{p['id']}")['result']; sv=d['sync_variants']
    pid=sv[0]['product']['product_id']; url=sv[0]['files'][0]['url'] if sv[0]['files'][0].get('url') else None
    url=next((f['url'] for v in sv for f in v['files'] if f.get('url') and f['type'] not in ('preview',)),None)
    bycolor={}
    for v in sv:
        c=v.get('color') or 'White'
        if c not in bycolor or v.get('size') in ('M','S'): bycolor[c]=v['product']['variant_id']
    if pid not in (669, 872): continue   # only panties use Printful photos; everything else is made locally
    w,h=AREA[pid]; groups,opts=STY[pid]
    pos={'area_width':w,'area_height':h,'width':w,'height':h,'top':0,'left':0}
    files=[{'placement':f['type'],'image_url':f['url'],'position':pos} for f in sv[0]['files'] if f.get('url') and f['type'] not in ('default','preview')] if pid==872 else [{'placement':PLACE[pid],'image_url':url,'position':pos}]
    body={'variant_ids':list(bycolor.values()),'format':'jpg','width':2000,'files':files,'option_groups':groups,'options':opts}
    t=pf('POST',f'/mockup-generator/create-task/{pid}',body)
    if 'result' not in t: print('ERR task',p['name'],t,flush=True); continue
    key=t['result']['task_key']
    for _ in range(60):
        time.sleep(5); res=pf('GET',f'/mockup-generator/task?task_key={urllib.parse.quote(key)}')['result']
        if res['status']!='pending': break
    if res['status']!='completed': print('ERR',p['name'],res.get('status'),res.get('error'),flush=True); continue
    cmap={vid:c for c,vid in bycolor.items()}; shots=[]
    for m in res['mockups']:
        color=next((cmap[v] for v in m['variant_ids'] if v in cmap),list(bycolor)[0])
        items=[{'url':m['mockup_url'],'style':'Main','option':'Front'}]+[{'url':e['url'],'style':e.get('option_group',''),'option':e.get('option','')} for e in m.get('extra',[])]
        for i,s in enumerate(items):
            img=urllib.request.urlopen(urllib.request.Request(s['url'],headers={'User-Agent':'bk/1.0'}),timeout=120).read()
            key2=f"site/products/{sl}/{slug(color)}-{i}-hd.jpg"; shots.append({'src':r2(img,key2),'color':color,'style':s['style'],'option':s['option']})
    man[sl]={'name':p['name'],'printful_id':p['id'],'product_id':pid,'colors':list(bycolor),'shots':shots}
    json.dump(man,open(OUT,'w'),indent=1); print('OK',sl,len(shots),'shots',flush=True); time.sleep(6)
print('done',len(man))
