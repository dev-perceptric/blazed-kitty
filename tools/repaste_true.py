"""Re-paste drop 4 + drop 5 top model photos at TRUE print size, using the BIG print files.

python3 repaste_true.py test   -> a few samples into the scratchpad
python3 repaste_true.py all    -> rewrite ck/drop4/models and ck/drop5/models top photos (panties untouched)
Blanks listed in BAD are marked not ok first (leftover smudges), and photos that used them get a new blank.
"""
import sys, json, os
sys.argv = sys.argv[:2] if len(sys.argv) > 1 else ['x', 'test']
MODE = sys.argv[1]
_src = open('/home/user/brand/tools/blank_lib.py').read()
_g = {}
exec(_src.replace("if __name__ == '__main__':", "if False:"), _g)
apply_true, LIB = _g['apply_true'], _g['LIB']
from PIL import Image

BIG = '/home/user/brand/ck/print_big'
PID = {'bt': 967, 'tk': 780, 'ct': 1579}
L = json.load(open(f'{LIB}/library.json'))

BAD_PHOTOS = ['use-me', 'cumhere__ct', 'squirt__ct', 'dirtystoner__ct', 'propmommy__ct', 'wifeyslut__ct', 'afterdark__ct', 'slutweed__bt', 'useme__ct']


def run(listfile, designs, only=None):
    D = json.load(open(designs)); out = json.load(open(listfile)); used = set(k for _, k in out)
    for i, (o, k) in enumerate(out):
        name = os.path.basename(o)[:-4]; d, rest = name.split('__'); p = rest.split('_')[0]
        if p not in PID: continue
        if only and d not in only: continue
        if any(name.startswith(b) for b in BAD_PHOTOS) and MODE == 'all':
            L[k]['ok'] = False
            col = rest.split('_', 1)[1]
            cands = [kk for kk, b in L.items() if b['ok'] and b['pid'] == PID[p] and b['color'] == col and kk not in used]
            cands = cands or [kk for kk, b in L.items() if b['ok'] and b['pid'] == PID[p] and b['color'] == col]
            if cands:
                k = sorted(cands, key=lambda kk: L[kk].get('extra', 0))[0]; used.add(k); out[i] = [o, k]
        dst = o if MODE == 'all' else f'/tmp/claude-0/-home-user-blazed-kitty/3b9538e9-d6cd-56ef-8c70-bf1b7c62b93f/scratchpad/tt_{name}.jpg'
        apply_true(L[k], f'{BIG}/{d}.png', D[d]['color'], dst)
        print('ok', name, '<-', k, flush=True)
    if MODE == 'all':
        json.dump(out, open(listfile, 'w'))


if MODE == 'test':
    run('/home/user/brand/ck/drop5/models/_list.json', '/home/user/brand/tools/ck_designs_drop5.json',
        only={'bendover', 'fucktoy', 'spankme', 'eatme', 'lovesorgasms'})
    run('/home/user/brand/ck/drop4/models/_list.json', '/home/user/brand/tools/ck_designs_drop4.json', only={'biandhigh', 'kissgirls'})
else:
    run('/home/user/brand/ck/drop4/models/_list.json', '/home/user/brand/tools/ck_designs_drop4.json')
    run('/home/user/brand/ck/drop5/models/_list.json', '/home/user/brand/tools/ck_designs_drop5.json')
    json.dump(L, open(f'{LIB}/library.json', 'w'), indent=1)
