#!/usr/bin/env python3
"""Режет PNG-персонажей пользователя (assets/chars/*-transparent.png) на части для перекладной анимации.
Части: head, torso (+torsoF — корпус с отзеркаленным на месте номером, для flip), uaL/faL/uaR/faR (плечо/предплечье с кистью),
thL/shL/thR/shR (бедро/голень со стопой). L/R — сторона экрана. Выход: remotion/public/ne-cut/<id>/*.png + src/ne/cutData.json.
Запуск: python3 projects/ne-ochen/cut.py [--debug]
"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'assets/chars')
RM = os.path.join(ROOT, '../popal/remotion')
OUT = os.path.join(RM, 'public/ne-cut')
DEBUG = '--debug' in sys.argv

# ручные ориентиры (пиксели исходника): шея (линия среза головы), подмышка, ось плеча, локоть, промежность, ось бедра, колено
CH = {
  'vini-kit':   dict(f='vinicius-kit',   neck=646, armpit=880, sh=765, el=980, crotch=1222, hip=1140, knee=1325, num=True, mouth=(476, 486, 541, 68, 508)),
  'vini-home':  dict(f='vinicius-home',  neck=640, armpit=890, sh=770, el=985, crotch=1219, hip=1140, knee=1345, mouth=(476, 486, 541, 68, 508)),
  'diom-kit':   dict(f='diomande-kit',   neck=556, armpit=776, sh=665, el=900, crotch=1140, hip=1060, knee=1285, num=True, locs=592),
  'diom-track': dict(f='diomande-casual', neck=548, armpit=804, sh=690, el=920, crotch=1144, hip=1060, knee=1295, locs=592),
  'sadie-vip':  dict(f='sadie-vip',      neck=612, armpit=852, sh=730, el=935, crotch=1238, hip=1060, knee=1400, hair=True, browOut=4, browT=200, irisCol='blue', mouth=(474, 486, 527, 54, 506)),
  'sadie-jkt':  dict(f='sadie-casual',   neck=622, armpit=852, sh=730, el=945, crotch=1176, hip=1090, knee=1370, hair=True, browOut=4, browT=200, irisCol='blue', mouth=(474, 486, 527, 54, 506)),
  'tom':        dict(f='tom-holland',    neck=640, armpit=896, sh=760, el=985, crotch=1204, hip=1120, knee=1365),
  'coach':      dict(f='jose-mourinho-coach-v2', neck=612, armpit=868, sh=720, el=950, crotch=1220, hip=1130, knee=1380, noface=True),
}

def disk(shape, c, r):
    yy, xx = np.ogrid[:shape[0], :shape[1]]
    return (xx - c[0]) ** 2 + (yy - c[1]) ** 2 <= r * r

def comps(mask, split=0):
    soft = mask
    if split: mask = ndi.binary_erosion(mask, iterations=split)
    lab, n = ndi.label(mask, structure=np.ones((3, 3)))
    if n == 0: return []
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    out = [(sizes[i], (ndi.binary_dilation(lab == i + 1, iterations=split + 1) & soft) if split else lab == i + 1) for i in range(n)]
    out.sort(key=lambda x: -x[0])
    return [m for s, m in out]

def center_x(mask, y):
    xs = np.where(mask[y])[0]
    return float(xs.mean()) if len(xs) else None

def save(img, mask, path):
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    a = img.copy(); a[..., 3] = np.where(mask, a[..., 3], 0)
    Image.fromarray(a[y0:y1, x0:x1]).save(path, optimize=True)
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]

def runs(row):
    r = []; inside = False
    for x, v in enumerate(row):
        if v and not inside: s0 = x; inside = True
        if not v and inside: r.append((s0, x - 1)); inside = False
    if inside: r.append((s0, len(row) - 1))
    return [q for q in r if q[1] - q[0] > 2]

def arm_split(img, A, c, side):
    """рука = всё снаружи от линии зазора рука/корпус; где кисть касается корпуса — зазор продлевается,
    а пиксели цвета кисти за зазором (до 45 px) тоже отходят руке"""
    H, W = A.shape; S = np.array(A[:, ::-1]) if side == 'R' else A
    im = img[:, ::-1] if side == 'R' else img
    strict = (im[..., 3] > 140)
    gaps = {}; last = None; y = c['armpit']
    m = np.zeros_like(A)
    while y < H:
        r = runs(strict[y, :W // 2 + 40])
        if not r: break
        if len(r) >= 2 and r[0][1] < W * .42: g = (r[0][1] + r[1][0]) / 2; last = g; merged = False
        else: g = last; merged = True
        if g is None: y += 1; continue
        if not S[y, :int(g)].any(): break
        m[y, :int(g)] = S[y, :int(g)]
        if merged:
            gaps[y] = g
        y += 1
    # кисть, лежащая поверх корпуса: цвет близок к цвету кисти
    ys = np.where(m.any(1))[0]
    if gaps:
        low = m.copy(); low[:int(ys[-1] - 90)] = False
        col = np.median(im[..., :3][low].reshape(-1, 3), 0)
        for y, g in gaps.items():
            x0, x1 = int(g), int(g) + 45
            d = np.abs(im[y, x0:x1, :3].astype(int) - col).sum(-1)
            ok = (d < 70) & S[y, x0:x1]
            # только непрерывно от края зазора
            run = 0
            while run < len(ok) and ok[run]: run += 1
            m[y, x0:x0 + run] = True
    return m[:, ::-1] if side == 'R' else m

def eyes_of(img, A, neck):
    """белки глаз: крупные светлые пятна в области лица"""
    rgb = img[..., :3].astype(int)
    white = (rgb.min(-1) > 225) & A
    white[:200] = False; white[neck - 120:] = False
    res = []
    for m in comps(white)[:4]:
        ys, xs = np.where(m)
        if len(xs) < 600: continue
        res.append([float(xs.mean()), float(ys.mean()), float((xs.max() - xs.min()) / 2), float((ys.max() - ys.min()) / 2)])
    res = sorted(res, key=lambda e: -e[2] * e[3])[:2]
    return sorted(res, key=lambda e: e[0])


REF = {}
def inpaint(img, M, bad=None):
    """закрасить область M цветом окружения (нормированная свёртка, от мелкого радиуса к крупному)"""
    rgb = img[..., :3].astype(float); known = (~M) & (img[..., 3] > 200)
    if bad is not None: known &= ~bad
    out = rgb.copy(); todo = M.copy()
    for sg in (4, 8, 16, 32):
        w = ndi.gaussian_filter(known.astype(float), sg)
        est = np.stack([ndi.gaussian_filter(rgb[..., k] * known, sg) for k in range(3)], -1) / np.maximum(w, 1e-6)[..., None]
        ok = todo & (w > .08); out[ok] = est[ok]; todo &= ~ok
    sm = np.stack([ndi.gaussian_filter(out[..., k], 2.5) for k in range(3)], -1)
    Md = ndi.binary_dilation(M, iterations=2); out[Md] = sm[Md]
    img[..., :3] = np.clip(out, 0, 255).astype(np.uint8)

def sprite(src, mask, path, feather=1.5):
    ys, xs = np.where(mask); p = 6
    x0, x1, y0, y1 = xs.min() - p, xs.max() + 1 + p, ys.min() - p, ys.max() + 1 + p
    a = src[y0:y1, x0:x1].copy(); al = ndi.gaussian_filter(mask[y0:y1, x0:x1].astype(float), feather)
    a[..., 3] = np.clip(al * 255 * 1.15, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(path, optimize=True)
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]

def face_parts(cid, c, img, A, eyes, parts):
    """подвижное лицо: брови и рот — отдельные спрайты (под ними кожа дорисована), радужки — спрайты, белок — контур"""
    from scipy.spatial import ConvexHull
    src = img.copy(); rgb = src[..., :3].astype(int); H, W = A.shape; F = dict(brows=[], eyes=[])
    out = os.path.join(OUT, cid)
    # глаза
    for i, e in enumerate(eyes):
        ex, ey, rx, ry = e; side = 'LR'[i]
        box = np.zeros_like(A); box[int(ey - ry - 8):int(ey + ry + 8), int(ex - rx - 34):int(ex + rx + 34)] = True
        white = (rgb.min(-1) > 225) & box
        Wc = np.zeros_like(A)
        for m in comps(white):          # все светлые части глаза (белок по обе стороны радужки), блик — мелкий, не в счёт
            if m.sum() > 60 and not (m.sum() < 500 and np.hypot(np.where(m)[1].mean() - ex, np.where(m)[0].mean() - ey) < rx * .75 and m.sum() < 450): Wc |= m
        Wc |= comps(white)[0]
        pts = np.argwhere(Wc)[:, ::-1]; hull = pts[ConvexHull(pts).vertices]
        hm = Image.new('L', (W, H), 0); ImageDraw.Draw(hm).polygon([tuple(map(int, p)) for p in hull], fill=255); hm = np.array(hm) > 0
        ic = comps(hm & ~Wc)
        if not ic or ic[0].sum() < 400: continue
        I0 = ic[0]
        if c.get('irisCol') == 'blue':   # радужка по цвету (у Сэди её режет веко)
            bl = comps((rgb[..., 2] > rgb[..., 0] + 15) & box & hm); I0 = ndi.binary_fill_holes(bl[0]) if bl else I0
        ys, xs = np.where(I0); r = (xs.max() - xs.min() + 1) / 2; cx = (xs.max() + xs.min()) / 2; cy = ys.max() - r
        if c.get('irisRef'):
            R = REF[c['irisRef']]['eyes'][i]; r = R['r']; cx = R['c'][0] + ex - R['e'][0]; cy = R['c'][1] + ey - R['e'][1]
        yy, xx = np.mgrid[:H, :W]; circ = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
        vis = ndi.binary_fill_holes(I0) & circ
        spr = src.copy(); mean = np.median(src[..., :3][vis & (rgb.max(-1) < 200)], 0)
        miss = circ & ~vis; my, mx = np.where(miss); ry2 = np.clip((2 * cy - my).round().astype(int), 0, H - 1)
        okm = vis[ry2, mx]; spr[my, mx, :3] = np.where(okm[:, None], src[ry2, mx, :3], mean); spr[..., 3] = 255
        parts['iris' + side] = sprite(spr, circ, os.path.join(out, 'iris' + side + '.png'), 1.0)
        hl = hull.astype(float); cen = hl.mean(0); hl = cen + (hl - cen) * 1.03
        F['eyes'].append(dict(hull=[[round(float(x), 1), round(float(y), 1)] for x, y in hl], c=[float(cx), float(cy)], r=float(r), e=[float(v) for v in e]))
    skin = np.median(rgb[int(eyes[0][1] + eyes[0][3] + 30):int(eyes[0][1] + eyes[0][3] + 45), int(eyes[0][0] - 10):int(eyes[0][0] + 10)].reshape(-1, 3), 0)
    # брови: самое крупное тёмное пятно над глазом
    kill = np.zeros_like(A); bm = np.zeros_like(A)
    for i, e in enumerate(eyes):
        ex, ey, rx, ry = e; side = 'LR'[i]
        box = np.zeros_like(A); po = c.get('browOut', 45); box[int(ey - ry - 95):int(ey - ry - 4), int(ex - rx - (po if i == 0 else 45)):int(ex + rx + (45 if i == 0 else po))] = True
        d = np.abs(rgb - skin).sum(-1); dark = (d > c.get('browT', 110)) & box & A & (rgb.sum(-1) < skin.sum() - 60)
        cs = [m for m in comps(dark, split=4 if 'browOut' in c else 0) if np.where(m)[0].max() < ey - ry - 6 and m.sum() > 500]
        cs.sort(key=lambda m: -np.where(m)[0].mean())   # ближайшее к глазу (не прядь волос)
        if not cs: continue
        m = ndi.binary_dilation(cs[0], iterations=2)
        parts['brow' + side] = sprite(src, m, os.path.join(out, 'brow' + side + '.png'))
        ys, xs = np.where(m); F['brows'].append(dict(c=[float(xs.mean()), float(ys.mean())], w=float(xs.max() - xs.min())))
        km = ndi.binary_dilation(m, iterations=8)
        if 'browOut' in c:      # хвост брови лежит на волосах — его не стираем
            if i == 0: km[:, :int(ex - rx - c['browOut'] + 8)] = False
            else: km[:, int(ex + rx + c['browOut'] - 8):] = False
        kill |= km; bm |= ndi.binary_dilation(m, iterations=2)
    if len(F['brows']) == 2:   # морщинки между бровями
        ey = eyes[0][1] - eyes[0][3]; mid = np.zeros_like(A); mid[int(ey - 95):int(ey - 8), int(eyes[0][0] + 20):int(eyes[1][0] - 20)] = True
        wm = np.zeros_like(A)
        for m in comps((np.abs(rgb - skin).sum(-1) > 45) & mid & ~bm):
            if m.sum() < 900 and np.where(m)[0].min() > ey - 90: wm |= m
        eyeP = np.zeros_like(A)           # обводку и стрелки глаз не трогать (иначе над радужкой кожа на обводке)
        for E in F['eyes']: ImageDraw.Draw(im_ := Image.new('L', (W, H), 0)).polygon([tuple(map(int, q)) for q in E['hull']], fill=255); eyeP |= np.array(im_) > 0
        eyeP = ndi.binary_dilation(eyeP, iterations=18)
        wr = ndi.binary_dilation(wm & ~eyeP, iterations=5) & ~eyeP; kill |= wr; bm |= wr
    keep = (np.abs(rgb - skin).sum(-1) > 60) & ~bm        # ресницы, волосы — не трогаем и не размазываем
    inpaint(img, kill & A & ~keep, ndi.binary_dilation(keep, iterations=3) | ~A)
    kill = np.zeros_like(A)
    # рот: линза вокруг губ
    if c.get('mouth'):
        cx, y0, y1, hw, line = c['mouth']; cy = (y0 + y1) / 2; ry = (y1 - y0) / 2 + 5
        yy, xx = np.mgrid[:H, :W]; m = ((xx - cx) / (hw + 6)) ** 2 + ((yy - cy) / ry) ** 2 <= 1
        parts['mouth'] = sprite(src, m, os.path.join(out, 'mouth.png'), 2.5)
        F['mouth'] = dict(c=[cx, cy], hw=hw, ry=ry, line=line)
        kill |= ndi.binary_dilation(m, iterations=3)
    inpaint(img, kill & A)
    return F

def run(cid, c):
    img = np.array(Image.open(os.path.join(SRC, c['f'] + '-transparent.png')).convert('RGBA'))
    H, W = img.shape[:2]
    A = img[..., 3] > 8
    rgb = img[..., :3].astype(int)
    ys = np.where(A.any(1))[0]; top, foot = int(ys[0]), int(ys[-1])
    cx = float(np.where(A[foot - 40:foot].any(0))[0].mean())
    os.makedirs(os.path.join(OUT, cid), exist_ok=True)
    parts, piv = {}, {}

    # ── руки: компоненты ниже подмышки, крайние слева и справа
    below = A.copy(); below[:c['armpit']] = False; below[c['crotch'] + 200:] = False
    armL, armR = arm_split(img, A, c, 'L'), arm_split(img, A, c, 'R')
    # ── ноги: компоненты ниже промежности
    lb = A.copy(); lb[:c['crotch']] = False
    legs = sorted(comps(lb & (img[..., 3] > 140), split=2)[:2], key=lambda m: np.where(m)[1].mean())
    legL, legR = legs

    # ── голова (+ волосы): выше линии шеи; у Сэди — все рыжие пиксели, у Диоманде — локи до плеч
    head = A.copy(); head[c['neck']:] = False
    if c.get('hair'):
        hairc = (rgb[..., 0] > 120) & (rgb[..., 1] < 120) & (rgb[..., 2] < 90) & (rgb[..., 0] - rgb[..., 1] > 50) & A
        hairc[:c['neck'] - 300] = False; hairc[c['armpit']:] = False
        hairc = ndi.binary_opening(hairc, iterations=2)
        head |= hairc
    if c.get('locs'):
        # локи — тёмные/золотистые пряди по бокам от шеи до плеч (не белая/зелёная одежда)
        side = np.zeros_like(A); xs_neck = np.where(A[c['neck'] - 10])[0]
        nl, nr = xs_neck.min() + 45, xs_neck.max() - 45
        side[c['neck']:c['locs'], :int(nl)] = True; side[c['neck']:c['locs'], int(nr):] = True
        bright = rgb.min(-1) > 170
        green = (rgb[..., 1] > rgb[..., 0] + 15) & (rgb[..., 1] > rgb[..., 2])
        locm = side & A & ~bright & ~green
        head |= locm
    neckx = center_x(A, c['neck'] - 30)
    piv['head'] = [neckx, c['neck'] - 25]

    # мягкие края (сглаживание) отходят конечностям, иначе на корпусе остаются «следы» ног и рук
    grow = lambda m: ndi.binary_dilation(m, iterations=3) & A
    armL, armR = grow(armL) & ~grow(legL) | armL, grow(armR) & ~grow(legR) | armR
    legL, legR = grow(legL), grow(legR)
    torso = A & ~legL & ~legR & ~armL & ~armR
    torso[:c['neck'] - 40] = False
    torso[c['crotch'] + 8:] = False
    # мелкие обрывки (кончики пальцев и т.п.) — руке своей стороны
    lab, n = ndi.label(torso, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndi.sum(torso, lab, range(1, n + 1)); big = int(np.argmax(sz)) + 1
        for i in range(1, n + 1):
            if i == big or sz[i - 1] > 4000: continue
            m = lab == i; torso &= ~m
            if np.where(m)[0].mean() > c['armpit']:
                if np.where(m)[1].mean() < cx: armL |= m
                else: armR |= m

    for side, arm in (('L', armL), ('R', armR)):
        ax = center_x(arm, c['armpit'] + 12)
        ex = center_x(arm, c['el'])
        hw = (np.ptp(np.where(arm[c["el"]])[0]) + 1) / 2
        S = [ax + (12 if side == 'L' else -12), c['sh']]
        E = [ex, c['el']]
        ys_a = np.where(arm.any(1))[0]
        Wy = int(ys_a[-1] - (ys_a[-1] - c['el']) * .38)
        Wr = [center_x(arm, Wy), Wy]
        Hd = [center_x(arm, int(ys_a[-1] - 30)), int(ys_a[-1])]
        # плечо: компонента руки выше локтя + шарнир у локтя + круг плеча + рукав выше подмышки снаружи
        xin = np.where(arm[c['armpit'] + 4])[0]; xin = xin.max() if side == 'L' else xin.min()
        sleeve = A.copy(); sleeve[:c['sh'] - 70] = False; sleeve[c['armpit'] + 4:] = False
        if side == 'L': sleeve[:, int(xin) + 6:] = False
        else: sleeve[:, :int(xin) - 6] = False
        ua = (arm & (np.arange(H)[:, None] < c['el'])) | (arm & disk(A.shape, E, hw * 1.15)) | (A & disk(A.shape, S, hw * 1.25)) | sleeve
        ua &= ~head if not c.get('hair') else ~(head & ~disk(A.shape, S, hw * 1.25))
        fa = arm & (np.arange(H)[:, None] >= c['el'] - 6)
        parts['ua' + side] = save(img, ua, os.path.join(OUT, cid, 'ua' + side + '.png'))
        parts['fa' + side] = save(img, fa, os.path.join(OUT, cid, 'fa' + side + '.png'))
        piv['S' + side], piv['E' + side], piv['W' + side], piv['H' + side] = S, E, Wr, Hd

    for side, leg in (('L', legL), ('R', legR)):
        lx = center_x(leg, c['crotch'] + 15)
        kx = center_x(leg, c['knee'])
        kw = (np.ptp(np.where(leg[c["knee"]])[0]) + 1) / 2
        Hp = [lx, c['hip']]
        K = [kx, c['knee']]
        ys_l = np.where(leg.any(1))[0]
        An = [center_x(leg, int(ys_l[-1] - 70)), int(ys_l[-1] - 50)]
        # верх бедра (шорты/брюки над промежностью) — дубль под корпусом, прячет шов при повороте
        hipz = A & disk(A.shape, [lx, (c['hip'] + c['crotch']) / 2], (c['crotch'] - c['hip']) * .75 + 10)
        hipz[:c['hip'] - 20] = False
        hipz &= ~armL & ~armR
        th = (leg & (np.arange(H)[:, None] < c['knee'])) | (leg & disk(A.shape, K, kw * 1.1)) | hipz
        sh = leg & (np.arange(H)[:, None] >= c['knee'] - 6)
        parts['th' + side] = save(img, th, os.path.join(OUT, cid, 'th' + side + '.png'))
        parts['sh' + side] = save(img, sh, os.path.join(OUT, cid, 'sh' + side + '.png'))
        piv['P' + side], piv['K' + side], piv['A' + side] = Hp, K, An

    eyes = eyes_of(img, A, c['neck'])
    fc = face_parts(cid, c, img, A, eyes, parts) if not c.get('noface') else None
    rgb = img[..., :3].astype(int)
    parts['head'] = save(img, head, os.path.join(OUT, cid, 'head.png'))
    parts['torso'] = save(img, torso, os.path.join(OUT, cid, 'torso.png'))
    if c.get('num'):
        # номер на груди: тёмно-синие пиксели на белой футболке → отзеркалить на месте (после flip всей фигуры читается верно)
        navy = (rgb[..., 2] > rgb[..., 0] + 25) & (rgb.max(-1) < 120) & torso
        navy[:c['neck'] + 80] = False; navy[c['armpit'] + 60:] = False
        m = comps(navy)
        nm = m[0] | (m[1] if len(m) > 1 and np.where(m[1])[0].mean() - np.where(m[0])[0].mean() < 30 and abs(np.where(m[1])[1].mean() - np.where(m[0])[1].mean()) < 120 else False)
        ys_n, xs_n = np.where(nm)
        x0, x1, y0, y1 = xs_n.min() - 8, xs_n.max() + 9, ys_n.min() - 6, ys_n.max() + 7
        tf = img.copy(); tf[y0:y1, x0:x1] = img[y0:y1, x0:x1][:, ::-1]
        parts['torsoF'] = save(tf, torso, os.path.join(OUT, cid, 'torsoF.png'))
    # цвет кожи: под глазами
    skin = [int(v) for v in np.median(rgb[int(eyes[0][1] + eyes[0][3] + 30):int(eyes[0][1] + eyes[0][3] + 45), int(eyes[0][0] - 10):int(eyes[0][0] + 10)].reshape(-1, 3), 0)] if eyes else [200, 160, 130]
    knee = [int(v) for v in np.median(rgb[int(piv['KL'][1]) - 6:int(piv['KL'][1]) + 6, int(piv['KL'][0]) - 8:int(piv['KL'][0]) + 8].reshape(-1, 3), 0)]
    data = dict(W=W, H=H, top=top, foot=foot, cx=cx, parts=parts, piv=piv, eyes=eyes, skin='#%02x%02x%02x' % tuple(skin), knee='#%02x%02x%02x' % tuple(knee))
    if fc: data['face'] = fc; REF[cid] = fc
    if DEBUG:
        dbg = Image.new('RGBA', (W, H), (40, 40, 40, 255))
        cols = {'head': (255, 80, 80), 'torso': (80, 80, 255), 'uaL': (80, 255, 80), 'faL': (255, 255, 80), 'uaR': (80, 255, 80), 'faR': (255, 255, 80),
                'thL': (255, 80, 255), 'shL': (80, 255, 255), 'thR': (255, 80, 255), 'shR': (80, 255, 255)}
        d = ImageDraw.Draw(dbg)
        for k, (x, y, w, h) in parts.items():
            if k in cols: d.rectangle([x, y, x + w, y + h], outline=cols[k] + (255,), width=3)
        for k, (x, y) in piv.items(): d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(255, 0, 0, 255)); d.text((x + 10, y - 6), k, fill=(255, 255, 255, 255))
        for e in eyes: d.ellipse([e[0] - e[2], e[1] - e[3], e[0] + e[2], e[1] + e[3]], outline=(0, 255, 0, 255), width=3)
        Image.alpha_composite(dbg, Image.fromarray(img).copy().convert('RGBA').point(lambda v: v)).save(os.path.join(os.environ.get('DBG_DIR', '/tmp'), f'dbg-{cid}.png'))
    return data

if __name__ == '__main__':
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    path = os.path.join(RM, 'src/ne/cutData.json')
    allD = json.load(open(path)) if os.path.exists(path) else {}
    for cid, c in CH.items():
        if only and cid not in only: continue
        allD[cid] = run(cid, c)
        print(cid, 'ok', allD[cid]['eyes'])
    json.dump(allD, open(path, "w"), indent=1)

# ── кисть «паутинный жест» с картинки tom-holland-web (нить стирается — её рисует анимация)
def gesture():
    img = np.array(Image.open(os.path.join(SRC, 'tom-holland-web-transparent.png')).convert('RGBA'))
    x0, y0, x1, y1 = 772, 220, 952, 366
    cr = img[y0:y1, x0:x1].copy(); rgb = cr[..., :3].astype(int)
    web = (rgb.min(-1) > 150) & (rgb.max(-1) - rgb.min(-1) < 40)     # белая/серая нить
    cr[..., 3] = np.where(web, 0, cr[..., 3])
    Image.fromarray(cr).save(os.path.join(OUT, 'tom', 'gestR.png'), optimize=True)
    return dict(w=x1 - x0, h=y1 - y0, cuff=[785 - x0, 322 - y0], tip=[940 - x0, 279 - y0])

if __name__ == '__main__':
    path = os.path.join(RM, 'src/ne/cutData.json'); allD = json.load(open(path))
    allD['tom']['gest'] = gesture(); json.dump(allD, open(path, 'w'), indent=1); print('gesture ok')
