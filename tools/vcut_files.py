"""Print files for the Printful 872 V-Cut Bikini Bottom: colored fabric, text on the front panel; plain back."""
import json, os
from PIL import Image
D = json.load(open('/home/user/brand/tools/ck_designs_vcut.json'))
P = '/home/user/brand/ck/print'; OUT = f'{P}/vcut_872'; os.makedirs(OUT, exist_ok=True)
S = 0.55            # shared text scale (300 dpi master -> 150 dpi print file)
CX, TOP, MAXW, MAXH = 1950, 1230, 1050, 720   # inside the front safe area
for k, v in D.items():
    t = Image.open(f'{P}/{k}.png'); t = t.crop(t.getbbox())
    s = min(S, MAXW / t.width, MAXH / t.height)
    t = t.resize((round(t.width * s), round(t.height * s)), Image.LANCZOS)
    front = Image.new('RGB', (3900, 3900), v['fabric']); front.paste(t, (CX - t.width // 2, TOP + (MAXH - t.height) // 3), t)
    front.save(f'{OUT}/{k}__front.png', dpi=(150, 150))
    Image.new('RGB', (3900, 3900), v['fabric']).save(f'{OUT}/{k}__back.png', dpi=(150, 150))
    print(k, t.size)
