#!/usr/bin/env bash
# Музыка серии (OpenGameArt, все треки CC0 — проверено на страницах 2026-11-20). Скачать в remotion/public/audio/lib/
set -e; d="$(dirname "$0")/remotion/public/audio/lib"; mkdir -p "$d"; B=https://opengameart.org/sites/default/files
get() { [ -f "$d/$1" ] || curl -sSL "$B/$2" -o "$d/$1"; }
get time-of-the-apocalypse.ogg 03_time_of_the_apocalypse.ogg          # opengameart.org/content/time-of-the-apocalypse (the-oracle)
get some-must-fall.ogg 02_some_must_fall.ogg                          # /content/some-must-fall (the-oracle)
get gladiators-lament-epic-tragic-music.mp3 gladiator_lament_0.mp3    # /content/gladiators-lament-epic-tragic-music (sorth)
get eine-schlacht-gegen-die-korrupte-macht.ogg 04_eine_schlacht_gegen_die_korrupte_macht.ogg
get ambient-horror-track-01.ogg ambient_horror_track01.ogg
get dark-cavern-ambient.ogg dark_cavern_ambient_001_0.ogg
get horror-atmosphere.ogg "Post%20Apocalyptic%20Atmosphere%20Preview%20Short%20Clip.ogg"
get eyes-in-the-shadows.ogg eyes_in_the_shadows.ogg
get emotional-piano-0.ogg emotional_piano_1.ogg
get i-want-to-go-home.mp3 i_want_to_go_home.mp3
# Freesound через Openverse (все CC0 1.0, проверено 2026-11-20): music-credits.json
OV=https://api.openverse.org/v1/audio
[ -f "$d/epic-orch-bertsz.mp3" ] || curl -sSL "$(curl -sS $OV/f0371330-1d07-4b2e-94cf-420485ac6eb2/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/epic-orch-bertsz.mp3"
[ -f "$d/epic-loop-fusionwolf.mp3" ] || curl -sSL "$(curl -sS $OV/6e8680b6-b2c5-48c7-81bc-09b4405ebb73/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/epic-loop-fusionwolf.mp3"
[ -f "$d/piano-darknight-szegvari.mp3" ] || curl -sSL "$(curl -sS $OV/638c53be-f87f-4c64-8d44-a592c22cd783/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/piano-darknight-szegvari.mp3"
[ -f "$d/strings-choir-sad-szegvari.mp3" ] || curl -sSL "$(curl -sS $OV/37a983db-14c1-4e5d-83aa-0c8ad459a710/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/strings-choir-sad-szegvari.mp3"
[ -f "$d/strings-choir-slow-szegvari.mp3" ] || curl -sSL "$(curl -sS $OV/1f9f767d-cc3f-4d88-8111-54caa9b13949/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/strings-choir-slow-szegvari.mp3"
[ -f "$d/horror-intense-magmi.mp3" ] || curl -sSL "$(curl -sS $OV/095bc479-68ba-4417-ae11-989df96de2e9/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/horror-intense-magmi.mp3"
[ -f "$d/horror-drone-magmi.mp3" ] || curl -sSL "$(curl -sS $OV/09e01140-e3e3-4d49-bc29-9957edca7484/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/horror-drone-magmi.mp3"
[ -f "$d/slow-cinematic-devern.mp3" ] || curl -sSL "$(curl -sS $OV/c5c4a846-a8f0-4bae-847c-221a62468f49/ | python3 -c 'import json,sys;print(json.load(sys.stdin)["url"])')" -o "$d/slow-cinematic-devern.mp3"
echo ok
