#!/bin/bash
# Лист превью: bash sheet.sh out.jpg t1 t2 ... (SC=масштаб, COLS=колонки)
out=$1; shift; d=$(mktemp -d); i=0
cd "$(dirname "$0")" && node_modules/.bin/esbuild src/main.js --bundle --format=iife --outfile=dist/bundle5.js --log-level=warning || exit 1
for t in "$@"; do node ../../tools/render.mjs index5.html --still $t -o $d/$(printf %03d $i).png > $d/log$i.txt 2>&1 & i=$((i+1)); if (( i % 4 == 0 )); then wait; fi; done; wait
grep -hi "error" $d/log*.txt | head -5
python3 -c "
from PIL import Image, ImageDraw; import glob
fs=sorted(glob.glob('$d/*.png')); ts='$*'.split(); ims=[Image.open(f).convert('RGB') for f in fs]; s=${SC:-0.4}
ims=[im.resize((int(im.width*s),int(im.height*s))) for im in ims]; w,h=ims[0].size; c=${COLS:-6}; r=(len(ims)+c-1)//c
S=Image.new('RGB',(w*c,h*r)); d=ImageDraw.Draw(S)
for k,(im,t) in enumerate(zip(ims,ts)): S.paste(im,((k%c)*w,(k//c)*h)); d.text(((k%c)*w+5,(k//c)*h+5),t,fill='yellow')
S.save('$out')"; rm -rf $d; echo sheet $out
