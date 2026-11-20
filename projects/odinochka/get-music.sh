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
echo ok
