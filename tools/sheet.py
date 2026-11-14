import sys,glob,os
from PIL import Image,ImageDraw
files=sorted(glob.glob('/home/user/brand/designs/master/*.png'))
if len(sys.argv)>2: files=[f for f in files if any(k in f for k in sys.argv[2:])]
bg=sys.argv[1] if len(sys.argv)>1 else '#ffffff'
tw,th=500,600;cols=min(4,len(files));rows=(len(files)+cols-1)//cols
s=Image.new('RGB',(cols*tw,rows*(th+40)),'#888');d=ImageDraw.Draw(s)
for i,f in enumerate(files):
    im=Image.open(f);im=im.resize((tw-10,th-12),Image.LANCZOS)
    x=(i%cols)*tw;y=(i//cols)*(th+40)
    tile=Image.new('RGB',(tw-10,th-12),bg);tile.paste(im,(0,0),im);s.paste(tile,(x+5,y+5))
    d.text((x+10,y+th-2),os.path.basename(f),fill='white')
s.save('/tmp/claude-0/-home-user/3b9538e9-d6cd-56ef-8c70-bf1b7c62b93f/scratchpad/sheet.jpg',quality=85)
