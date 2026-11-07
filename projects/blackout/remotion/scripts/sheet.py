import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; fs = sorted(glob.glob(d + '/f_*.png')); w, h = 216, 384; cols = 11; rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * w, rows * (h + 22)), (30, 30, 30)); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 22); sh.paste(im, (x, y + 22)); dr.text((x + 6, y + 4), '%.1f' % (int(f.split('_')[-1][:-4]) / 30), fill=(255, 255, 0))
sh.save(out, quality=85)
