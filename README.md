# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Adnanhasim8/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Adnanhasim8/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An unofficial, offline-first web guide and tracker for all 55 PlayStation 5
trophies of Grand Theft Auto VI: the official names, descriptions and grades,
a checklist whose progress is saved in the browser, filters by kind and
grade, a spoiler setting that hides story trophies until they are earned,
export and import of progress, a five-stage roadmap to the platinum, and a
guide to every trophy in the authors' own words, with its sources named.

## Run it

Serve `app/` with any static file server and open `index.html`:

```sh
node serve.mjs   # serves app/ on http://localhost:8080 (development only)
```

No build step, no network at run time: every file the app loads lives under
`app/`. Progress is stored in the browser's localStorage under the key
`leonida-trophy-atlas-v1`.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions and grades are the official PlayStation 5 list as
published on Exophase and PSNProfiles (see `app/data/trophies.json`, and the
Sources line under every trophy's guide). Guide notes are written for this
entry from the official descriptions and are labelled where they have not
yet been verified in the game. No Rockstar Games logo, artwork or game
imagery is used; the look is original.

## License

MIT — see `LICENSE`. Unofficial fan work, not affiliated with Rockstar Games
or Sony Interactive Entertainment.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vev5ehp3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
