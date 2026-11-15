"""Upload every usable blank template to R2 (web size) and publish a gallery page at <PUB>/library/index.html."""
import io, json, html, urllib.request, urllib.parse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw

A = '8954ffc36634674f7163d2a03600e7fb'; PUB = 'https://pub-d9dce74a87164578ab89f22d84cb54f5.r2.dev'
L = json.load(open('/home/user/brand/ck/library/library.json'))
NAMES = {967: 'Raglan Baby Tee', 780: 'Rib Tank', 1579: 'Crop Tee', 669: 'String Bottom', 872: 'V-Cut Bottom',
         71: 'Men Unisex Tee', 248: 'Men Tank', 428: 'Men Boxer Briefs'}


def put(data, key, ctype):
    url = f'https://api.cloudflare.com/client/v4/accounts/{A}/r2/buckets/blazed-kitty/objects/{urllib.parse.quote(key)}'
    urllib.request.urlopen(urllib.request.Request(url, data=data, method='PUT', headers={'Authorization': 'Bearer dummy', 'Content-Type': ctype}), timeout=120)
    return f'{PUB}/{key}'


def up(item):
    k, v = item
    im = Image.open(v['file']).convert('RGB')
    b = v['box']; d = ImageDraw.Draw(im)
    d.rectangle([b['x'], b['y'], b['x'] + b['w'], b['y'] + b['h']], outline=(0, 255, 0), width=max(3, im.width // 300))
    im.thumbnail((900, 1125), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=80, optimize=True, progressive=True)
    return k, put(buf.getvalue(), f"library/{v['pid']}_{v['color']}/{k}.jpg", 'image/jpeg')


items = [(k, v) for k, v in L.items() if v.get('ok')]
with ThreadPoolExecutor(8) as ex:
    urls = dict(ex.map(up, items))

groups = defaultdict(list)
for k, v in items: groups[(v['pid'], v['color'])].append(k)
order = [967, 780, 1579, 669, 872, 71, 248, 428]
secs, nav = [], []
for pid in order:
    cols = sorted(c for p, c in groups if p == pid)
    if not cols: continue
    n = sum(len(groups[(pid, c)]) for c in cols)
    nav.append(f'<a href="#p{pid}">{NAMES[pid]} <b>{n}</b></a>')
    body = ''
    for c in cols:
        ks = sorted(groups[(pid, c)])
        cards = ''.join(f'<figure><a href="{urls[k]}" target="_blank"><img loading="lazy" src="{urls[k]}"></a>'
                        f'<figcaption>{html.escape(k)}{" · new template" if L[k].get("template") else ""}{" · recolored" if L[k].get("recolored_from") else ""}</figcaption></figure>'
                        for k in ks)
        body += f'<h3>{html.escape(c)} <span>{len(ks)}</span></h3><div class=grid>{cards}</div>'
    secs.append(f'<section id="p{pid}"><h2>{NAMES[pid]}</h2>{body}</section>')

page = f'''<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Blazed Kitty Templates</title><style>
:root{{--bg:#0b0b0b;--fg:#f4f1ec;--mute:#9a948c;--pink:#FF4F9A}}
body{{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,Helvetica,Arial,sans-serif}}
header{{position:sticky;top:0;background:var(--bg);padding:14px 16px;border-bottom:1px solid #222;z-index:2}}
h1{{margin:0 0 8px;font-size:20px;letter-spacing:.04em}} nav{{display:flex;flex-wrap:wrap;gap:8px}}
nav a{{color:var(--fg);text-decoration:none;border:1px solid #333;border-radius:999px;padding:5px 10px;font-size:13px}} nav b{{color:var(--pink)}}
section{{padding:8px 16px 24px}} h2{{font-size:18px;margin:18px 0 4px}} h3{{font-size:14px;color:var(--mute);margin:14px 0 8px;text-transform:uppercase;letter-spacing:.06em}} h3 span{{color:var(--pink)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
figure{{margin:0}} img{{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:6px;background:#1a1a1a;display:block}}
figcaption{{font-size:11px;color:var(--mute);margin-top:4px;word-break:break-all}}
p.note{{color:var(--mute);font-size:13px;margin:6px 0 0}}
</style></head><body><header><h1>BLAZED KITTY · TEMPLATES ({len(items)})</h1><nav>{"".join(nav)}</nav>
<p class=note>Green box = where the print gets pasted. Tap a photo to open it full size.</p></header>{"".join(secs)}</body></html>'''
print(put(page.encode(), 'library/index.html', 'text/html; charset=utf-8'))
print('templates', len(items))
