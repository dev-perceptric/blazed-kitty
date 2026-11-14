"""Upload brand files to Cloudflare R2 (bucket blazed-kitty), organized by drop/design."""
import os,glob,json,time,urllib.request,urllib.parse
from concurrent.futures import ThreadPoolExecutor
A='8954ffc36634674f7163d2a03600e7fb'; BK='blazed-kitty'
BA='/home/user/bk-assets'; CK='/home/user/brand/ck'
D1=['veryhot','hotbaked','petme','exgf','goodgirl','mommy','born','rumors','lighter']
D2=list(json.load(open('/home/user/brand/tools/ck_designs_drop2.json')).keys())
jobs=[]
def add(src,key): jobs.append((src,key))
def design_of(name,designs):
    n=name.replace('set_','')
    for d in sorted(designs,key=len,reverse=True):
        if n.startswith(d+'_') or n.startswith(d+'__'): return d
for sub in ['standing_poses','baddie_poses','mommy_baddie','first_shoot_pro']:
    for f in glob.glob(f'{BA}/photos/{sub}/*.jpg'):
        d=design_of(os.path.basename(f),D1)
        if d: add(f,f'drop1/{d}/photos/{sub}/{os.path.basename(f)}')
for f in glob.glob(f'{BA}/photos/drop2/*.jpg'):
    d=design_of(os.path.basename(f),D2); add(f,f'drop2/{d}/photos/standing/{os.path.basename(f)}')
for f in glob.glob(f'{CK}/photos/batch4/zoom/*.jpg'):
    d=design_of(os.path.basename(f),D2); add(f,f'drop2/{d}/photos/zoom/{os.path.basename(f)}')
for drop,designs in (('drop1',D1),('drop2',D2)):
    for d in designs:
        for f in glob.glob(f'{CK}/mockups/{d}__*.jpg'): add(f,f'{drop}/{d}/mockups/{os.path.basename(f)}')
        p=f'{CK}/print/{d}.png'
        if os.path.exists(p): add(p,f'{drop}/{d}/print/{d}.png')
        p=f'{CK}/print/panty_669/{d}.png'
        if os.path.exists(p): add(p,f'{drop}/{d}/print/{d}__panty.png')
for f in glob.glob(f'{CK}/mockups/blank__*.jpg'): add(f,f'shared/mockups/{os.path.basename(f)}')
for f in glob.glob(f'{BA}/boards/*.jpg'): add(f,f'boards/{os.path.basename(f)}')
for f in glob.glob(f'{BA}/photos/very_hot_first/*.jpg'): add(f,f'archive/very_hot_first/{os.path.basename(f)}')
for f in glob.glob(f'{BA}/print/very_hot_colorways/*/*.png'): add(f,f'archive/very_hot_colorways/{f.split("/")[-2]}/{os.path.basename(f)}')
CT={'.jpg':'image/jpeg','.png':'image/png'}
def put(job):
    src,key=job; data=open(src,'rb').read()
    url=f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/{BK}/objects/{urllib.parse.quote(key)}'
    for t in range(5):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(url,data=data,method='PUT',headers={'Authorization':'Bearer dummy','Content-Type':CT[os.path.splitext(src)[1]]}),timeout=120))
            if r.get('success'): return 0
        except Exception as e: err=str(e)
        time.sleep(3*(t+1))
    print('FAIL',key,flush=True); return 1
print('files',len(jobs),'MB',round(sum(os.path.getsize(s) for s,_ in jobs)/1e6,1),flush=True)
json.dump([k for _,k in jobs],open('/home/user/brand/ck/r2_keys.json','w'))
with ThreadPoolExecutor(3) as ex: fails=sum(ex.map(put,jobs))
print('done, failed',fails,flush=True)
