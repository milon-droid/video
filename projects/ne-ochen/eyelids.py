"""Точный верх глаза для век и блик радужки (дополняет cut.py; запускать после него).
По head.png: для каждой колонки глаза — низ обводки/стрелки (yb) и её верх (yt), гладко; блик — крупное белое пятно в радужке.
Пишет в remotion/src/ne/cutData.json → face.eyes[i].top = [[x, yb, yt], ...], face.eyes[i].hl = [dx, dy, r] от центра радужки."""
import json, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
RM = os.path.join(os.path.dirname(__file__), '../popal/remotion')
P = os.path.join(RM, 'src/ne/cutData.json'); D = json.load(open(P))
for cid, d in D.items():
    F = d.get('face')
    if not F: continue
    hx, hy = d['parts']['head'][:2]
    im = np.array(Image.open(os.path.join(RM, f'public/ne-cut/{cid}/head.png')).convert('RGBA')).astype(float)
    rgb = im[..., :3]; lum = rgb.mean(-1); skin = np.array([int(d['skin'][i:i + 2], 16) for i in (1, 3, 5)]); thr = min(120, skin.mean() * .6)
    for e in F['eyes']:
        H = np.array(e['hull']); x0, x1 = H[:, 0].min() + 2, H[:, 0].max() - 2; ex, ey, rx, ry = e['e']
        cx, cy, r = e['c'][0], e['c'][1], e['r']
        xs = np.arange(int(x0), int(x1) + 1); yb = np.full(len(xs), np.nan); yt = np.full(len(xs), np.nan)
        for k, x in enumerate(xs):          # от белка вверх: конец белка = низ обводки
            if abs(x - cx) < r * 1.1: continue
            L = lum[:, int(x - hx)]; y = int(ey - hy)
            if L[y] < 170: continue
            while y > 0 and L[y - 1] >= 170: y -= 1
            yb[k] = y + hy
        ok = ~np.isnan(yb); u = (xs - xs.mean()) / (np.ptp(xs) / 2)
        fb = np.polyval(np.polyfit(u[ok], yb[ok], 2), u)
        for k, x in enumerate(xs):          # от низа обводки вверх, пока тёмное = верх обводки
            L = lum[:, int(x - hx)]; y = int(round(fb[k] - hy)) - 1; n = 0
            m = 0
            while y > 0 and L[y] >= thr and m < 6: y -= 1; m += 1
            while y > 0 and L[y] < thr and n < ry * 1.2: y -= 1; n += 1
            yt[k] = y + 1 + hy
        okt = ~np.isnan(yt); ft = np.polyval(np.polyfit(u[okt], yt[okt], 2), u); yr = np.where(okt, yt, np.nanmax(yt)); ft = np.minimum(ft, ndi.minimum_filter1d(yr, 7)); ft = np.minimum(ft, fb - 3)
        e['top'] = [[float(x), round(float(b), 1), round(float(t), 1)] for x, b, t in zip(xs[::2], fb[::2], ft[::2])]
        # блик: самое крупное почти белое пятно внутри круга радужки
        yy, xx = np.mgrid[:im.shape[0], :im.shape[1]]
        circ = (xx + hx - cx) ** 2 + (yy + hy - cy) ** 2 <= (r * .95) ** 2
        wb = circ & (rgb.min(-1) > 215)
        lab, n = ndi.label(wb)
        if n:
            sz = ndi.sum(wb, lab, range(1, n + 1)); m = lab == (np.argmax(sz) + 1)
            if m.sum() > 12:
                py, px = np.where(m); e['hl'] = [float(px.mean() + hx - cx), float(py.mean() + hy - cy), float(np.sqrt(m.sum() / np.pi))]
        print(cid, 'thick', round(float(np.median(fb - ft)), 1), 'hl', e.get('hl'))
json.dump(D, open(P, 'w'), indent=1)
