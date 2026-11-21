// Rendering: the checklist rows with their guide detail, the header
// progress card, the platinum roadmap and the missables page. All markup is
// built with textContent and createElement, never innerHTML, so trophy text
// can never run as code.

import { displayName, displayDescription, isHiddenBySpoilers, progressCounts } from './filters.js';

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side questline',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robbery',
  misc: 'Open-world misc',
  completion: '100% completion',
  platinum: 'Platinum',
};

export const STAGE_LABELS = {
  1: 'Stage 1 — Play the story',
  2: 'Stage 2 — Character questlines',
  3: 'Stage 3 — Activities & collectibles',
  4: 'Stage 4 — Open world & money',
  5: 'Stage 5 — 100% completion & platinum',
};

// The five roadmap stages, in the order PowerPyx's roadmap gives them.
export const STAGES = [
  {
    stage: 1,
    title: 'Play the story — Chapters 1 to 5',
    meta: 'About 60–80 hours · 13 trophies',
    body: 'Play the story straight through and enjoy it. The 100% checklist is not visible until after the story, but everything you do along the way already counts toward it. Two habits cover the whole run: keep a manual save at the start and end of every chapter (there is no mission replay), and keep cheats off — cheats disable trophies and saving. The one thing to do on purpose in this stage is the Chapter 1 meditation at Jason’s house, the only potentially missable trophy in the game.',
  },
  {
    stage: 2,
    title: 'Character questlines',
    meta: 'Alongside the story, or right after it · 7 trophies',
    body: 'Six questlines, each ending in a trophy: Andy (Lucia only), Kenton, Billy, Randy, Tyrone (Jason only) and Bret (Jason only), plus Cal’s fishing challenge. They open as the story goes on and every one of them stays available after the story, so there is no rush — but a quest giver who goes quiet for a chapter is not gone for good.',
  },
  {
    stage: 3,
    title: 'Activities & collectibles',
    meta: 'The long grind · 11 trophies',
    body: 'Stunts, shooting ranges, drone races, races, arcade games, meditations, card sets, WAiNK scans, challenges, vehicle discovery and unfogging the map. Most of these count toward the 100% checklist as well — 300 stunts, all 42 shooting-range golds and all drone races are required in full — so doing them now is doing the checklist early.',
  },
  {
    stage: 4,
    title: 'Open world & money',
    meta: 'Robberies and one-off feats · 23 trophies',
    body: 'Gang operations, bank vaults, armored trucks, laundering marked bills, spending, garages and the Scooter Bros app, plus the one-off combat and stunt trophies such as Gunslinger, Catch Me If You Can and Challenging Tank. The big bank vaults unlock in Chapter 4 and pay up to $205,000 each, which funds the garages, the spending and the laundering in one sweep.',
  },
  {
    stage: 5,
    title: '100% completion, then the platinum',
    meta: 'About 100 hours for the checklist · 3 trophies',
    body: 'After the story, open Progress, Stats, 100% Completion and work the list: it is closer to 60% true completion, with most side quests not required, but robberies, underwater discoveries, shooting ranges, drone races and Bret’s quests need everything. Finish the 8 Strangers & Freaks strands last, and the platinum pops with the final trophy.',
  },
];

// Trophies whose condition must be met in a single attempt, but which can be
// tried again as often as needed. They are not missable.
export const RETRYABLE_IDS = [33, 34, 36, 39, 51];

function makeTag(text, extraClass) {
  const tag = document.createElement('span');
  tag.className = extraClass ? `tag ${extraClass}` : 'tag';
  tag.textContent = text;
  return tag;
}

// One trophy row: checkbox, medal, name, official description, tags, and a
// button that opens the guide. The detail pane is built by buildDetail.
export function buildTrophyRow(trophy, earned, spoilersOn, open, handlers) {
  const item = document.createElement('li');
  item.className = 'trophy';
  const isEarned = earned.has(trophy.name);
  if (isEarned) item.classList.add('earned');

  const row = document.createElement('div');
  row.className = 'trophy-row';

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = isEarned;
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  check.addEventListener('click', (event) => event.stopPropagation());
  check.addEventListener('change', () => handlers.onToggleEarned(trophy.name, check.checked));
  row.appendChild(check);

  const medal = document.createElement('span');
  medal.className = `medal ${trophy.grade}`;
  medal.title = trophy.grade;
  row.appendChild(medal);

  const main = document.createElement('div');
  main.className = 'trophy-main';

  const hidden = isHiddenBySpoilers(trophy, earned, spoilersOn);
  const name = document.createElement('div');
  name.className = 'trophy-name';
  if (hidden) name.classList.add('spoiler-hidden');
  name.textContent = displayName(trophy, earned, spoilersOn);
  if (isEarned) {
    const mark = document.createElement('span');
    mark.className = 'earned-mark';
    mark.textContent = '✓ Earned';
    name.appendChild(mark);
  }
  main.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  if (hidden) desc.classList.add('spoiler-hidden');
  desc.textContent = displayDescription(trophy, earned, spoilersOn);
  main.appendChild(desc);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.appendChild(makeTag(trophy.grade, `grade-${trophy.grade}`));
  tags.appendChild(makeTag(KIND_LABELS[trophy.kind] ?? trophy.kind, ''));
  if (trophy.missable) tags.appendChild(makeTag('⚠ Missable', 'missable'));
  if (trophy.targetLabel) tags.appendChild(makeTag(trophy.targetLabel, 'target'));
  main.appendChild(tags);
  row.appendChild(main);

  if (!hidden) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'trophy-toggle';
    toggle.textContent = open ? 'Hide guide ▲' : 'Guide ▼';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      handlers.onToggleDetail(trophy.id);
    });
    row.appendChild(toggle);
  }

  row.addEventListener('click', () => {
    if (!hidden) handlers.onToggleDetail(trophy.id);
  });

  item.appendChild(row);
  if (open && !hidden) item.appendChild(buildDetail(trophy));
  return item;
}

// The guide pane under a trophy: the guide in our own words, when to do it,
// and the sources each fact comes from.
export function buildDetail(trophy) {
  const detail = document.createElement('div');
  detail.className = 'trophy-detail';

  const heading = document.createElement('h4');
  heading.textContent = 'Guide';
  detail.appendChild(heading);

  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  detail.appendChild(guide);

  const when = document.createElement('p');
  when.className = 'guide-when';
  const whenLabel = document.createElement('strong');
  whenLabel.textContent = 'When: ';
  when.appendChild(whenLabel);
  when.appendChild(document.createTextNode(
    `${STAGE_LABELS[trophy.stage]}. ${trophy.missable ? 'Potentially missable — do it on your first pass.' : 'Not missable.'}`,
  ));
  detail.appendChild(when);

  const sources = document.createElement('p');
  sources.className = 'source-line';
  const sourceLabel = document.createElement('strong');
  sourceLabel.textContent = 'Sources: ';
  sources.appendChild(sourceLabel);
  for (const source of trophy.sources ?? []) {
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.label;
    sources.appendChild(link);
  }
  detail.appendChild(sources);
  return detail;
}

// The header progress card.
export function renderProgress(trophies, earned) {
  const counts = progressCounts(trophies, earned);
  document.getElementById('earned-count').textContent = String(counts.earned);
  const fill = document.getElementById('progress-fill');
  const bar = document.getElementById('progress-bar');
  const percent = counts.total === 0 ? 0 : Math.round((counts.earned / counts.total) * 100);
  fill.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', String(counts.earned));
  document.getElementById('progress-detail').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
}

// The roadmap: five stages, each with its trophies and how many are done.
export function renderRoadmap(trophies, earned) {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const stage of STAGES) {
    const item = document.createElement('li');
    item.className = 'stage';

    const title = document.createElement('h3');
    title.textContent = stage.title;
    item.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = stage.meta;
    item.appendChild(meta);

    const body = document.createElement('p');
    body.textContent = stage.body;
    item.appendChild(body);

    const stageTrophies = trophies.filter((t) => t.stage === stage.stage);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    for (const trophy of stageTrophies) {
      const line = document.createElement('li');
      const got = earned.has(trophy.name);
      if (got) line.classList.add('done');
      line.textContent = `${got ? '✓ ' : ''}${trophy.name} — ${trophy.description} `;
      const count = document.createElement('span');
      count.className = 'trophy-count';
      count.textContent = `(${trophy.grade}${trophy.targetLabel ? `, ${trophy.targetLabel}` : ''})`;
      line.appendChild(count);
      list.appendChild(line);
    }
    item.appendChild(list);

    const progress = document.createElement('p');
    progress.className = 'stage-progress';
    progress.textContent = `${done} of ${stageTrophies.length} earned in this stage`;
    item.appendChild(progress);

    stagesEl.appendChild(item);
  }
}

// The missables page: one truly missable trophy, the retryable one-shot
// conditions, and the automatic story trophies that cannot be missed.
export function renderMissables(trophies, earned, spoilersOn, openId, handlers) {
  const missableList = document.getElementById('missable-list');
  missableList.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable)) {
    missableList.appendChild(buildTrophyRow(trophy, earned, spoilersOn, openId === trophy.id, handlers));
  }

  const retryableList = document.getElementById('retryable-list');
  retryableList.replaceChildren();
  for (const trophy of trophies.filter((t) => RETRYABLE_IDS.includes(t.id))) {
    retryableList.appendChild(buildTrophyRow(trophy, earned, spoilersOn, openId === trophy.id, handlers));
  }

  const storyList = document.getElementById('story-list');
  storyList.replaceChildren();
  for (const trophy of trophies.filter((t) => t.kind === 'story')) {
    storyList.appendChild(buildTrophyRow(trophy, earned, spoilersOn, openId === trophy.id, handlers));
  }

  document.getElementById('missable-badge').textContent = String(trophies.filter((t) => t.missable).length);
}
