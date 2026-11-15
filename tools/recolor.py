"""Recolor a white-fabric blank into another fabric color (for all-over-print panties/boxers and light shirts).

Finds the garment as the bright, low-saturation region connected to the print box, then multiplies its shading by
the new color. Writes a new blank next to the others and a library.json entry with the new color.
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter

LIB = '/home/user/brand/ck/library'
COLORS = {'red': '#C81E32', 'hotpink': '#FF4F9A', 'purple': '#7B3FE4', 'babyblue': '#A9D4F5', 'pink': '#F6C6D6',
          'black': '#1C1C1C', 'heather': '#A7A7A7', 'softpink': '#F3C9D3', 'navy': '#243048'}


def garment_mask(a, box):
    """The white garment around the print box: low-saturation bright pixels, limited to a window around the box,
    thin links cut so walls, sheets and tees do not join in, then the side strings grown back."""
    import cv2
    H, W = a.shape[:2]
    sat = a.max(-1) - a.min(-1); lum = a.mean(-1)
    cand = ((sat < 38) & (lum > 120)).astype('uint8')
    x0 = int(max(0, box['x'] - 1.4 * box['w'])); x1 = int(min(W, box['x'] + 2.4 * box['w']))
    y0 = int(max(0, box['y'] - 1.3 * box['h'])); y1 = int(min(H, box['y'] + box['h'] * 3.2))
    win = np.zeros_like(cand); win[y0:y1, x0:x1] = 1
    # background: bright gray regions (after cutting thin links) that touch the photo edge
    opened = cv2.morphologyEx(cand, cv2.MORPH_OPEN, np.ones((11, 11), np.uint8))
    nb, labb = cv2.connectedComponents(opened)
    edge = set(np.unique(np.concatenate([labb[0], labb[-1], labb[:, 0], labb[:, -1]]))) - {0}
    bg = np.isin(labb, list(edge)).astype('uint8')
    bg = cv2.dilate(bg, np.ones((7, 7), np.uint8))
    cw = cand & win & (1 - bg)
    core = cv2.morphologyEx(cw, cv2.MORPH_OPEN, np.ones((11, 11), np.uint8))
    n, lab = cv2.connectedComponents(core)
    cx, cy = int(box['x'] + box['w'] / 2), int(box['y'] + box['h'] / 2)
    ids = lab[max(0, cy - 20):cy + 20, max(0, cx - 20):cx + 20].ravel(); ids = ids[ids > 0]
    if not len(ids): return None
    m = (lab == np.bincount(ids).argmax()).astype('uint8')
    for _ in range(4):                      # grow back into the strings / edges, still inside the window
        m = cw & cv2.dilate(m, np.ones((9, 9), np.uint8))
    # below the print the garment only narrows toward the crotch: drop any row that suddenly gets wider (sheets, floor)
    start = int(box['y'] + box['h'])
    low = m[start].sum()
    for y in range(start + 1, y1):
        w = m[y].sum()
        if w > low + 3: m[y:y1] = 0; break
        low = min(low, w)
    n2, lab2, stats, _ = cv2.connectedComponentsWithStats(m)
    if n2 > 2: m = (lab2 == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype('uint8')   # main garment only
    m = cv2.morphologyEx(m * 255, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    return cv2.GaussianBlur(m.astype(float) / 255, (0, 0), 1.2)


def recolor(key, color, lib=None):
    lib = lib or json.load(open(f'{LIB}/library.json'))
    b = lib[key]
    a = np.asarray(Image.open(b['file']).convert('RGB')).astype(float)
    m = garment_mask(a, b['box'])
    if m is None: return None
    if m.sum() > 16 * b['box']['w'] * b['box']['h']: return None     # grabbed more than the garment (skirt, sheets)
    lum = a.mean(-1, keepdims=True); ref = np.percentile(lum[m > 0.5], 85)
    col = np.array([int(COLORS[color][i:i + 2], 16) for i in (1, 3, 5)], float)
    shade = np.clip(lum / ref, 0, 1.15)
    if col.mean() < 70:          # dark fabric: keep a little highlight so folds still read
        new = col + (shade - 1).clip(-1, 0.15) * 60 + 25 * (shade - 0.6).clip(0, None)
    else:
        new = col * shade
    out = a * (1 - m[..., None]) + new * m[..., None]
    # check: the fabric just below and beside the print must be recolored too
    bx = b['box']; y2 = int(bx['y'] + bx['h']); y3 = int(min(a.shape[0], bx['y'] + 1.8 * bx['h']))
    under = out[y2:y3, int(bx['x'] + 0.2 * bx['w']):int(bx['x'] + 0.8 * bx['w'])]
    if under.size and (((under.max(-1) - under.min(-1)) < 30) & (under.mean(-1) > 170)).mean() > 0.15:
        return None
    nk = key.replace('_white_', f'_{color}_') if '_white_' in key else f'{key}__{color}'
    folder = f"{LIB}/{b['pid']}_{color}"; os.makedirs(folder, exist_ok=True)
    path = f'{folder}/{nk}.jpg'
    Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(path, quality=92)
    lib[nk] = dict(b, file=path, color=color, recolored_from=key, fabric_rgb=col.tolist())
    return nk
