"""One model photo per store product -> R2 site/models/<slug>.jpg, writes ck/site_models.json"""
import json,re,urllib.request,urllib.parse,os
A='8954ffc36634674f7163d2a03600e7fb'; PUB='https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
P='/home/user/brand/ck/photos'
D1=json.load(open('/home/user/brand/tools/ck_designs.json')); D2=json.load(open('/home/user/brand/tools/ck_designs_drop2.json'))
KIND={967:'Baby Tee',780:'Rib Tank',1579:'Crop Tee',669:'String Bottom'}
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower().replace('’','').replace("'",'')).strip('-')
def title(v):
    t=' '.join(v['lines']).replace('  ',' ').lower()
    t=' '.join(w if w.startswith('(') else w[:1].upper()+w[1:] for w in t.split())
    return t.replace('Of Bad','of Bad').replace(' To ',' to ').replace(' A ',' a ')
B5=f'{P}/batch5/zoom'; B4=f'{P}/batch4/zoom'; T=f'{P}/picks_tmp'
PICK={
 ('veryhot',967):f'{B5}/veryhot__bt_red__00.jpg',('veryhot',780):f'{B5}/veryhot__tk_white__10.jpg',('veryhot',669):f'{B5}/veryhot__set__20.jpg',
 ('hotbaked',780):f'{B5}/hotbaked__tk_black__01.jpg',('hotbaked',1579):f'{B5}/hotbaked__ct_washedblack__11.jpg',('hotbaked',669):f'{B5}/hotbaked__set__20.jpg',
 ('petme',967):f'{B5}/petme__bt_pink__01.jpg',('petme',780):f'{B5}/petme__tk_white__10.jpg',('petme',669):f'{B5}/petme__set__20.jpg',
 ('exgf',967):f'{B5}/exgf__bt_black__01.jpg',('exgf',780):f'{B5}/exgf__tk_white__11.jpg',('exgf',669):f'{T}/exgf__set__20.jpg',
 ('goodgirl',967):f'{B5}/goodgirl__bt_red__00.jpg',('goodgirl',780):f'{B5}/goodgirl__tk_babyblue__10.jpg',('goodgirl',669):f'{B5}/goodgirl__set__20.jpg',
 ('mommy',967):f'{B5}/mommy__bt_pink__00.jpg',('mommy',780):f'{B5}/mommy__tk_white__10.jpg',('mommy',669):f'{B5}/mommy__set__20.jpg',
 ('born',967):f'{B5}/born__bt_black__00.jpg',('born',780):f'{B5}/born__tk_heather__10.jpg',('born',669):f'{B5}/born__set__20.jpg',
 ('rumors',967):f'{B5}/rumors__bt_pink__01.jpg',('rumors',780):f'{B5}/rumors__tk_white__10.jpg',('rumors',669):f'{B5}/rumors__set__20.jpg',
 ('lighter',780):f'{B5}/lighter__tk_navy__00.jpg',('lighter',1579):f'{B5}/lighter__ct_washedblack__10.jpg',('lighter',669):f'{B5}/lighter__set__20.jpg',
 ('lovelang',967):f'{B4}/lovelang__bt_pink__01.jpg',('lovelang',780):f'{B4}/lovelang__tk_white__10.jpg',
 ('textme',967):f'{B4}/textme__bt_red__01.jpg',('textme',780):f'{B4}/textme__tk_white__10.jpg',
 ('situationship',967):f'{B4}/situationship__bt_black__00.jpg',('situationship',1579):f'{B4}/situationship__ct_vintagewhite__10.jpg',
 ('pussy',967):f'{B4}/pussy__bt_pink__00.jpg',('pussy',780):f'{B4}/pussy__tk_white__11.jpg',('pussy',669):f'{B4}/pussy__set__20.jpg',
 ('university',967):f'{B4}/university__bt_pink__01.jpg',('university',780):f'{B4}/university__tk_white__10.jpg',
 ('highclub',967):f'{B4}/highclub__bt_black__01.jpg',('highclub',1579):f'{B4}/highclub__ct_vintagewhite__11.jpg',
 ('highncute',967):f'{B4}/highncute__bt_pink__01.jpg',('highncute',780):f'{B4}/highncute__tk_babyblue__11.jpg',
 ('toohot',967):f'{B4}/toohot__bt_red__00.jpg',('toohot',780):f'{B4}/toohot__tk_white__10.jpg',
 ('petmeharder',669):f'{B4}/petmeharder__set__00.jpg',('lickme',669):f'{B4}/lickme__set__00.jpg',('comegetkitty',669):f'{B4}/comegetkitty__set__10.jpg',
 ('munchies',669):f'{B4}/munchies__set__00.jpg',('goodgirls',669):f'{B4}/goodgirls__set__00.jpg',('wetbong',669):f'{B4}/wetbong__set__10.jpg',
 ('rollit',669):f'{B4}/rollit__set__00.jpg',('ridehigh',669):f'{B4}/ridehigh__set__10.jpg',('kittyhungry',669):f'{T}/kittyhungry__set__00.jpg',
 ('spanking',669):f'{B4}/spanking__set__10.jpg',
}
out={}
for (d,pid),f in PICK.items():
    v=D1.get(d) or D2[d]; sl=slug(f'{title(v)} {KIND[pid]}')
    assert os.path.exists(f),f
    key=f'site/models/{sl}.jpg'
    urllib.request.urlopen(urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}',data=open(f,'rb').read(),method='PUT',headers={'Authorization':'Bearer dummy','Content-Type':'image/jpeg'}),timeout=120)
    out[sl]=f'{PUB}/{key}'
json.dump(out,open('/home/user/brand/ck/site_models.json','w'),indent=1)
print('model photos',len(out))
