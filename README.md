# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Adnanhasim8/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Adnanhasim8/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 PlayStation 5 trophies of
Grand Theft Auto VI: the official list with saved progress, filters and a
spoiler setting, a roadmap to the platinum, and a guide to each trophy that
cites its sources.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `app/` is plain static files and works with the
network off.

## What is inside

- `app/index.html` — the shell: header with progress, tabs, toolbar
- `app/style.css` — the look (warm paper, plum header, coral accent)
- `app/js/main.js` — boot: loads the data, wires tabs and toolbar
- `app/js/store.js` — saved progress in localStorage, export and import
- `app/js/filters.js` — kind/grade/status/search filters and the spoiler rule
- `app/js/views.js` — checklist rows, guide detail, roadmap, missables
- `app/data/trophies.json` — the 55 official trophies with guides and sources
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with the kit's vendored library
- `screenshots/` — four renders of the app (see `shots.json`)

## Sources

- Trophy names, descriptions and grades: the official list, checked against
  [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
  and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).
- How to earn each trophy, the roadmap and the missable warning:
  [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/).
  Every trophy names its sources beside its guide; five trophies PowerPyx
  still lists as “currently unknown” say so plainly instead of guessing.

Grand Theft Auto VI is a game by Rockstar Games. This is an unofficial
fan-made guide, not affiliated with Rockstar Games or Sony Interactive
Entertainment. No Rockstar logo, artwork or game screenshot is used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vev5ehp3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
