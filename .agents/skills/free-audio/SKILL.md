---
name: free-audio
description: "Find and download free, CC-licensed sound effects and music, and auto-generate the attribution file the licenses require. Searches Freesound, Jamendo and Wikimedia Commons through Openverse — no API key, no account, no per-generation cost. Use when the user needs a sound effect, background music, a loop, an ambience bed, a UI click, or any audio asset for a game, video, app or demo, or asks where to get royalty-free, copyright-free or CC0 audio. Triggers — 'sound effect for X', 'background music', 'free music', 'royalty-free audio', 'sfx', 'audio assets', '/free-audio'."
---

# Free audio

Search and download Creative Commons audio, then ship the credits file. This finds
*existing licensed recordings* — it does not generate audio with AI, so nothing is
billed and nothing is synthetic.

```bash
S=~/.claude/skills/free-audio/scripts/audio.mjs

node $S search "sword swing" --sfx --cc0
node $S get 1 3 --out ./assets/audio     # by index from the last search
node $S credits --out ./assets/audio     # rebuild CREDITS.md from the manifest
```

`get` writes the audio plus `CREDITS.md` and `.free-audio-manifest.json` into the
output folder. Re-running skips files already present, so it is safe to call repeatedly.

## Sources

| Preset | Sources | Best for |
|---|---|---|
| `--sfx` | Freesound (591K) | sound effects, foley, ambiences, short loops |
| `--music` | Jamendo (645K), Wikimedia (3.9M) | full songs, beds, classical, spoken |
| `--speech` | Wikimedia | pronunciation, spoken word |
| *(none)* | all three | broadest recall |

Filters: `--cc0`, `--commercial`, `--license by,by-sa`, `--source freesound`,
`--length shortest|short|medium|long`, `--limit N` (max 20), `--page N`, `--json`.

Valid licenses: `cc0` `pdm` `by` `by-sa` `by-nc` `by-nd` `by-nc-sa` `by-nc-nd`
`sampling+` `nc-sampling+`.

## Picking a license

- **`--cc0`** — public domain, no obligations. Default to this when the user is
  shipping something commercial or does not want a credits file at all.
- **`--commercial`** — allows commercial use but most results still require credit.
- Anything with **`nc`** cannot be used commercially; anything with **`nd`** cannot be
  edited, trimmed or remixed — which rules it out for most video and game work.

Always tell the user which obligations attach to what they downloaded. `search` and
`get` both print this, and `CREDITS.md` has a "Usage restrictions" section.

## Gotchas worth knowing

- **Never filter by `category`.** Openverse leaves `category` null on every Freesound
  record, so `category=sound_effect` returns almost nothing. The `--sfx` preset filters
  by source instead, which is why it works.
- **Freesound gives you the 128kbps mp3 preview**, not the original WAV — the original
  sits behind OAuth. For master-quality assets, send the user to the `foreign_landing_url`.
- **Jamendo's URL 403s as returned by Openverse.** The script appends `&from=app-devsite`,
  which is what makes the full track download. Don't strip it.
- **Rate limit is 20 requests/min and 200/day** anonymously, and `--limit` caps at 20.
  The script warns when the daily budget runs low. For heavier use, register a free key
  at `https://api.openverse.org/v1/auth_tokens/register/` (instant, no approval).
- **Jamendo has zero CC0 tracks** — every one is BY, BY-NC-SA or BY-NC-ND. So `--music --cc0`
  quietly collapses to Wikimedia-only results. For CC0 music prefer `--source wikimedia_audio
  --cc0` or `--source freesound --cc0` (loops and beds); for the widest music selection use
  `--music --commercial` and expect to credit the artist.
- **`result_count` caps at 240** for anonymous requests — that is the deep-pagination ceiling,
  not the true total. Treat 240 as "plenty more", and never compare two 240s as if they differ.
