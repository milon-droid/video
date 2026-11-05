#!/usr/bin/env python3
"""Скачать подборку звуков BigSoundBank (bigsoundbank.com, автор Joseph Sardin) — лицензия CC0, без аккаунта.

    python3 tools/get-bsb.py            # подборка ниже → assets/sfx-library/bigsoundbank/
    python3 tools/get-bsb.py 1506 0757  # дополнительно — любые номера звуков с сайта

Перед загрузкой проверяется, что на странице звука указано «CC0»; иначе звук пропускается.
Потом пересобрать каталог: python3 tools/sfx_index.py assets/sfx-library
"""
import json, re, subprocess, sys, html
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "sfx-library" / "bigsoundbank"
UA = "Mozilla/5.0 (video-project sfx downloader)"
# номер: (короткое имя, теги для поиска)
PICK = {
 "3363": ("snow-steps-quick", "snow footsteps steps walk winter crunch"), "0208": ("snow-footstep", "snow footstep step winter crunch"), "2890": ("snow-footsteps-loop", "snow footsteps walk loop winter"),
 "0595": ("wind-foley", "wind blizzard winter outside"), "0146": ("wind-strong-tree", "wind strong storm outside"), "0154": ("wind-strong-outside", "wind strong storm blizzard"),
 "0155": ("wind-whistle-chimney", "wind whistle howl eerie"), "1714": ("wind-from-inside", "wind storm from inside room interior"),
 "0189": ("car-start-depart", "car engine start drive away departure"), "0187": ("car-arrive-stop-depart", "car arrival brake stop idle depart"), "0557": ("car-interior-start-stop", "car interior engine start stop inside"),
 "0291": ("car-engine-accel", "car engine acceleration drive"), "2369": ("tires-screech", "tires screech skid car"), "1526": ("car-door-outside", "car door open close outside"),
 "0655": ("car-door-slam-inside", "car door slam inside interior"), "1506": ("seatbelt-in", "seat belt seatbelt click buckle"), "1507": ("seatbelt-out", "seat belt seatbelt release"),
 "0656": ("seatbelt-click", "seat belt seatbelt click car"), "0757": ("glovebox", "glove box glovebox compartment car open close"), "1265": ("car-door-alarm", "car door open alarm beep chime"),
 "1021": ("car-turn-signal", "car turn signal indicator blinker hazard tick"), "3110": ("car-turn-signal-loop", "car turn signal indicator hazard loop"),
 "2205": ("ice-crack-1", "ice crack frost freeze"), "2206": ("ice-crack-2", "ice crack frost freeze"), "2207": ("ice-crack-3", "ice crack frost freeze"),
 "0218": ("heartbeat-x10", "heart beat heartbeat pulse"), "1929": ("heartbeat-slow", "heart beat heartbeat slow"), "1930": ("heartbeat-fast", "heart beat heartbeat fast panic"),
 "0457": ("ecg-60bpm", "electrocardiogram heart monitor beep hospital"), "1309": ("ecg-flatline", "electrocardiogram cardiac arrest flatline monitor beep"),
 "3255": ("whisper-man", "whisper breath voice eerie"), "2195": ("breathing-man-slow", "breath breathing man slow nose"), "1103": ("breathless-man", "breath breathing out of breath panting"),
 "0660": ("kettle-electric", "kettle electric boil kitchen"), "1786": ("crt-off", "tv television crt screen off"), "2134": ("tv-zapping", "tv static white noise zapping"),
 "3211": ("door-creak-close", "door creak creaking close"), "3205": ("door-creak-open", "door creak creaking open"), "0320": ("knock-glass", "knock glass window door"),
 "0015": ("knock-door", "knock door"), "1386": ("drops-water", "drops drip water"), "0303": ("metal-gate-creak", "metal gate creak squeak"), "0359": ("heavy-chain", "chain metal heavy"),
 "2183": ("cough-man", "cough man"), "0566": ("cassette-rewind", "cassette tape rewind stop"), "2691": ("vhs-playback", "vhs tape playback hiss"), "0193": ("coins-floor", "coins drop money"),
}
# по какому запросу звук находится в поиске сайта (страница звука нужна для проверки лицензии)
Q = {"snow": "3363 0208 2890", "wind": "0595 0146 0154 0155 1714", "car engine": "0189 0187 0557 0291 2369", "car door": "1526 0655 1265", "seat belt": "1506 1507 0656",
     "glove box": "0757", "indicator": "1021 3110", "ice crack": "2205 2206 2207", "heart": "0218 1929 1930 0457 1309", "whisper": "3255", "breathing": "2195 1103",
     "kettle": "0660", "television": "1786 2134", "creaking door": "3211 3205", "knock": "0320 0015", "dripping": "1386", "metal": "0303 0359", "cough": "2183", "tape": "0566 2691", "coin": "0193"}
QUERY = {n: q for q, ns in Q.items() for n in ns.split()}
_cache = {}
def page_link(n):
    q = QUERY.get(n, n)
    if q not in _cache: _cache[q] = get("https://bigsoundbank.com/search?q=" + q.replace(" ", "+"))
    m = re.search(rf"href='(/[^']*s{n}\.html)'", _cache[q]); return m.group(1) if m else None
def get(url, binary=False):
    r = subprocess.run(["curl", "-sS", "-L", "-m", "60", "-A", UA, url], capture_output=True)
    return r.stdout if binary else r.stdout.decode("utf-8", "ignore")
def main():
    OUT.mkdir(parents=True, exist_ok=True); meta_f = OUT / "sounds.json"
    meta = json.loads(meta_f.read_text()) if meta_f.exists() else {}
    pick = dict(PICK); pick.update({n: (f"bsb-{n}", "") for n in sys.argv[1:] if n not in pick})  # свои номера: ищутся по номеру (может не найтись — тогда добавить запрос в Q)
    for n, (name, tags) in pick.items():
        if n in meta and (OUT / meta[n].get("file", f"{n}.flac")).exists(): continue
        link = page_link(n)
        sp = get("https://bigsoundbank.com" + link) if link else ""
        if "CC0" not in sp: print(f"  {n}: лицензия не CC0 или страница не найдена — пропуск"); continue
        title = html.unescape((re.search(r"<h1[^>]*>(.*?)</h1>", sp, re.S) or [None, name])[1]); title = re.sub("<[^>]+>", "", title).strip()
        f = None
        for ext, magic in (("flac", b"fLaC"), ("ogg", b"OggS")):  # у старых звуков нет FLAC — тогда OGG
            data = get(f"https://bigsoundbank.com/UPLOAD/{ext}/{n}.{ext}", binary=True)
            if data[:4] == magic: f = OUT / f"{n}.{ext}"; f.write_bytes(data); break
        if not f: print(f"  {n}: не скачался"); continue
        meta[n] = {"name": name, "title": title, "tags": tags, "license": "CC0", "url": "https://bigsoundbank.com" + link, "file": f.name}
        print(f"  {n}: {name} — {title}")
    meta_f.write_text(json.dumps(meta, ensure_ascii=False, indent=1)); print(f"BigSoundBank: {len(meta)} звуков → {OUT}")
if __name__ == "__main__": main()
