"""Poll a Gemini batch job until done, then save images by metadata key."""
import json,time,base64,urllib.request,sys
OUT='/home/user/brand/ck/photos/batch2/'
job=json.load(open(OUT+'job.json')); name=job['op']['name']
def get():
    return json.load(urllib.request.urlopen(urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/{name}",headers={"x-goog-api-key":"dummy"}),timeout=120))
for i in range(240):
    try: b=get()
    except Exception as e: print('poll error',e,flush=True); time.sleep(60); continue
    st=b.get('metadata',{}).get('state') or b.get('state'); print(time.strftime('%H:%M'),st,flush=True)
    if b.get('done') or st in ('BATCH_STATE_SUCCEEDED','BATCH_STATE_FAILED','BATCH_STATE_CANCELLED','BATCH_STATE_EXPIRED','JOB_STATE_SUCCEEDED','JOB_STATE_FAILED'): break
    time.sleep(60)
json.dump(b,open(OUT+'result_meta.json','w'))
def walk(o):
    if isinstance(o,dict):
        if 'metadata' in o and isinstance(o.get('metadata'),dict) and 'key' in o['metadata'] and ('response' in o or 'error' in o): yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o,list):
        for v in o: yield from walk(v)
ok=bad=0
for item in walk(b):
    key=item['metadata']['key']; saved=False
    for c in item.get('response',{}).get('candidates',[]):
        for p in c.get('content',{}).get('parts',[]):
            d=p.get('inlineData') or p.get('inline_data')
            if d: open(f"{OUT}raw/{key}.jpg",'wb').write(base64.b64decode(d['data'])); saved=True
    if saved: ok+=1
    else: bad+=1; print('no image',key,json.dumps(item.get('error') or item.get('response',{}).get('candidates',[{}])[0].get('finishReason'))[:120],flush=True)
print('saved',ok,'failed',bad,flush=True)
