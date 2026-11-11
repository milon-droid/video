#!/usr/bin/env python3
"""Нарезка PNG героев «Блэкаута» (assets/ep1v4/*-v3.png) на части для перекладки (риг remotion/src/v4/Rig.tsx).
Вид спереди: head, torso (корпус+ноги), uaL/faL/uaR/faR (плечо / предплечье с кистью; L/R — сторона экрана).
Граница руки и корпуса — ломаная по внутреннему краю рукава (ручные точки ниже), голова — по самому узкому месту шеи.
Профиль (смотрит влево): head, body, ua/fa (ближняя рука, вырезается многоугольником; дыра в корпусе закрашивается
размытием соседних пикселей), th/sh (бедро / голень со стопой — для посадки).
Выход: remotion/public/v4/<id>/*.png + remotion/src/v4/cutData.json.   python3 tools/cut4.py [--debug]
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets/ep1v4'); OUT = os.path.join(ROOT, 'remotion/public/v4'); DATA = os.path.join(ROOT, 'remotion/src/v4/cutData.json')
DEBUG = '--debug' in sys.argv
# фас: линия руки L/R — [плечевой шов сверху, подмышка, манжета, ниже кисти]; S — плечо, E — локоть, W — запястье
FRONT = {
  'alik': dict(f='student-front-v3', L=[(150, 420), (232, 545), (212, 935), (214, 1110)], R=[(735, 420), (645, 545), (660, 935), (658, 1110)],
               S=[(215, 472), (672, 472)], E=[(202, 740), (682, 740)], W=[(190, 945), (695, 945)]),
  'beka': dict(f='blue-front-v3', L=[(140, 420), (242, 545), (226, 925), (232, 1110)], R=[(720, 420), (622, 545), (642, 925), (636, 1110)],
               S=[(225, 480), (645, 480)], E=[(208, 720), (668, 720)], W=[(195, 935), (688, 935)]),
  'dias': dict(f='dias-robe-front-v3', L=[(300, 410), (392, 470), (382, 812), (366, 990)], R=[(728, 410), (636, 470), (644, 812), (652, 990)],
               S=[(355, 462), (668, 462)], E=[(332, 640), (690, 640)], W=[(322, 815), (695, 815)]),
}
PROFILE = {
  'alikP': dict(f='student-profile-v3', arm=[(398, 410), (440, 385), (478, 420), (482, 560), (470, 720), (452, 905), (424, 925), (418, 1000), (408, 1078),
                (358, 1082), (344, 1000), (336, 905), (330, 850), (338, 700), (358, 560)],
                S=(440, 445), E=(405, 665), W=(388, 905), hip=930, knee=1330, Hp=(398, 930), K=(395, 1330)),
}

def neck_rows(a, y0, y1):
    w = [(a[y] > 128).sum() for y in range(y0, y1)]
    return y0 + int(np.argmin(w))

def side_mask(shape, pts, side):
    """маска пикселей снаружи ломаной (к краю кадра), ниже верхней точки"""
    H, W = shape
    img = Image.new('L', (W, H), 0); d = ImageDraw.Draw(img)
    edge = 0 if side == 'L' else W - 1
    poly = [(edge, pts[0][1])] + pts + [(edge, pts[-1][1])]
    d.polygon(poly, fill=255)
    return np.array(img) > 0

def save(rgba, mask, path):
    ys, xs = np.where(mask & (rgba[..., 3] > 0))
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    a = rgba.copy(); a[..., 3] = np.where(mask, a[..., 3], 0)
    Image.fromarray(a[y0:y1, x0:x1]).save(path, optimize=True)
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]

def front(id, c, data):
    im = np.array(Image.open(os.path.join(SRC, c['f'] + '.png')).convert('RGBA')); H, W = im.shape[:2]; a = im[..., 3]
    os.makedirs(os.path.join(OUT, id), exist_ok=True)
    ys = np.where(a.max(1) > 0)[0]; top, foot = int(ys.min()), int(ys.max())
    neck = neck_rows(a, top + 150, top + 450)
    yy = np.arange(H)[:, None] * np.ones((1, W))
    parts, piv = {}, {}
    head = yy < neck + 22
    parts['head'] = save(im, head, f'{OUT}/{id}/head.png')
    arms = {}
    for i, sd in enumerate('LR'):
        m = side_mask((H, W), c[sd], sd) & (a > 0)
        ey = c['E'][i][1]
        arms[sd] = m
        parts['ua' + sd] = save(im, m & (yy < ey + 4), f'{OUT}/{id}/ua{sd}.png')
        parts['fa' + sd] = save(im, m & (yy >= ey - 42), f'{OUT}/{id}/fa{sd}.png')
        piv['S' + sd], piv['E' + sd], piv['W' + sd] = list(c['S'][i]), list(c['E'][i]), list(c['W'][i])
        hy = np.where(m.any(1))[0].max(); hx = np.where(m[hy - 30:hy].any(0))[0].mean()
        piv['H' + sd] = [float(hx), int(hy)]
    armpit = min(c['L'][1][1], c['R'][1][1])
    torso = (yy >= neck - 30) & ~((arms['L'] | arms['R']) & (yy >= armpit - 10))
    parts['torso'] = save(im, torso, f'{OUT}/{id}/torso.png')
    piv['neck'] = [float(np.where(a[neck] > 128)[0].mean()), neck]
    data[id] = dict(view='front', W=W, H=H, top=top, foot=foot, cx=float(np.where(a[foot - 20] > 0)[0].mean()), parts=parts, piv=piv)
    if DEBUG:
        dbg = Image.open(os.path.join(SRC, c['f'] + '.png')).convert('RGBA'); bg = Image.new('RGBA', dbg.size, (255, 0, 255, 255)); bg.alpha_composite(dbg)
        ov = np.array(bg); ov[arms['L'] & (a > 0), 0] = 0; ov[arms['R'] & (a > 0), 2] = 0
        dd = Image.fromarray(ov); d = ImageDraw.Draw(dd)
        d.line([(0, neck), (W, neck)], fill=(0, 255, 0), width=3)
        for k, p in piv.items():
            if k != 'neck': d.ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], fill=(255, 255, 0))
        dd.convert('RGB').resize((W // 2, H // 2)).save(f'{OUT}/../../../tools/dbg-{id}.jpg')

def profile(id, c, data):
    src = Image.open(os.path.join(SRC, c['f'] + '.png')).convert('RGBA'); im = np.array(src); H, W = im.shape[:2]; a = im[..., 3]
    os.makedirs(os.path.join(OUT, id), exist_ok=True)
    ys = np.where(a.max(1) > 0)[0]; top, foot = int(ys.min()), int(ys.max())
    neck = neck_rows(a, top + 200, top + 480)
    yy = np.arange(H)[:, None] * np.ones((1, W))
    mk = Image.new('L', (W, H), 0); ImageDraw.Draw(mk).polygon(c['arm'], fill=255); arm = (np.array(mk) > 0) & (a > 0)
    # корпус без руки: дыру закрываем размытым и притемнённым корпусом (тень под рукой)
    keep = ((a > 0) & ~arm).astype(float)
    pm = im[..., :3].astype(float) * keep[..., None]
    blur = lambda x: np.array(Image.fromarray(np.clip(x, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(26))).astype(float)
    num = np.stack([blur(pm[..., i]) for i in range(3)], -1); den = blur(keep * 255)[..., None] / 255.0
    rgb = num / np.maximum(den, 1e-3)
    hole = arm
    body = im.copy(); body[hole, :3] = np.clip(rgb[hole] * 0.72, 0, 255).astype(np.uint8)
    parts, piv = {}, {}
    parts['head'] = save(im, yy < neck + 22, f'{OUT}/{id}/head.png')
    e = c['E'][1]
    parts['ua'] = save(im, arm & (yy < e + 16), f'{OUT}/{id}/ua.png')
    parts['fa'] = save(im, arm & (yy >= e - 16), f'{OUT}/{id}/fa.png')
    parts['body'] = save(body, (yy >= neck - 30) & (yy < c['hip'] + 20), f'{OUT}/{id}/body.png')
    parts['th'] = save(body, (yy >= c['hip'] - 30) & (yy < c['knee'] + 18), f'{OUT}/{id}/th.png')
    parts['sh'] = save(body, (yy >= c['knee'] - 18), f'{OUT}/{id}/sh.png')
    parts['full'] = save(im, a > 0, f'{OUT}/{id}/full.png')
    piv.update(S=list(c['S']), E=list(c['E']), W=list(c['W']), P=list(c['Hp']), K=list(c['K']), neck=[float(np.where(a[neck] > 128)[0].mean()), neck])
    data[id] = dict(view='profile', W=W, H=H, top=top, foot=foot, cx=float(np.where(a[foot - 20] > 0)[0].mean()), parts=parts, piv=piv)

def plain(id, f, data):
    """профиль без нарезки рук: голова + тело (поворот головы, дыхание)"""
    im = np.array(Image.open(os.path.join(SRC, f + '.png')).convert('RGBA')); H, W = im.shape[:2]; a = im[..., 3]
    os.makedirs(os.path.join(OUT, id), exist_ok=True)
    ys = np.where(a.max(1) > 0)[0]; top, foot = int(ys.min()), int(ys.max())
    neck = neck_rows(a, top + 200, top + 480); yy = np.arange(H)[:, None] * np.ones((1, W))
    parts = dict(head=save(im, yy < neck + 22, f'{OUT}/{id}/head.png'), body=save(im, yy >= neck - 30, f'{OUT}/{id}/body.png'))
    data[id] = dict(view='plain', W=W, H=H, top=top, foot=foot, cx=float(np.where(a[foot - 20] > 0)[0].mean()), parts=parts,
                    piv=dict(neck=[float(np.where(a[neck] > 128)[0].mean()), neck]))

def civilians(data):
    """массовка: 4 отдельных слоя (женщина в фиолетовом, мужчина в синем, отец с ребёнком, женщина с телефоном)"""
    im = np.array(Image.open(os.path.join(SRC, 'civilians-concerned.png')).convert('RGBA')); H, W = im.shape[:2]
    os.makedirs(os.path.join(OUT, 'civ'), exist_ok=True); xx = np.ones((H, 1)) * np.arange(W)[None, :]
    for k, (x0, x1) in dict(c1=(70, 352), c2=(352, 657), c3=(657, 1190), c4=(1190, 1480)).items():
        m = (xx >= x0) & (xx < x1) & (im[..., 3] > 0); b = save(im, m, f'{OUT}/civ/{k}.png')
        ys = np.where(m.any(1))[0]; data['civ_' + k] = dict(view='civ', W=W, H=H, top=int(ys.min()), foot=int(ys.max()), cx=(x0 + x1) / 2, parts={'full': b}, piv={})

def table(data):
    """стол комнаты отдельным слоем: герои за столом стоят позади него"""
    os.makedirs(os.path.join(OUT, 'room'), exist_ok=True)
    for k, f in dict(lit='room-lit-v3', dark='room-blackout-v3').items():
        im = np.array(Image.open(os.path.join(SRC, f + '.jpg')).convert('RGBA')); H, W = im.shape[:2]
        mk = Image.new('L', (W, H), 0); d = ImageDraw.Draw(mk)
        d.polygon([(150, 846), (740, 846), (760, 900), (792, 1000), (788, 1060), (102, 1060), (98, 1000), (125, 900)], fill=255)
        for x0, x1, y1 in [(132, 159, 1248), (741, 768, 1248), (198, 219, 1152), (675, 699, 1152)]: d.rectangle([x0, 1040, x1, y1], fill=255)
        m = np.array(mk.filter(ImageFilter.GaussianBlur(1.2)))
        im[..., 3] = m; b = save(im, m > 0, f'{OUT}/room/table-{k}.png')
        data['table_' + k] = dict(view='bg', W=W, H=H, top=0, foot=0, cx=0, parts={'full': b}, piv={})

if __name__ == '__main__':
    data = json.load(open(DATA)) if os.path.exists(DATA) else {}
    for id, c in FRONT.items(): front(id, c, data)
    for id, c in PROFILE.items(): profile(id, c, data)
    civilians(data); table(data)
    for id, f in dict(bekaP='blue-profile-v3', diasP='dias-robe-profile-v3').items(): plain(id, f, data)
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    json.dump(data, open(DATA, 'w'), indent=1)
    print('ok', list(data))
