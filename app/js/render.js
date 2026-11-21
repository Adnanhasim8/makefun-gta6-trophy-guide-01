// Rendering for the Leonida Trophy Atlas: the checklist rows with their
// guides and counters, the five-stage roadmap, and the missables page.
// Data never goes into innerHTML unescaped: every trophy string passes
// through escapeHtml first.

import { getCount, getNote, isEarned, progressStats } from './store.js';

// The roadmap, built from the official descriptions alone: story first,
// then the side missions, then the counts, then the activities, and the
// heists and clean-up last, with 100% completion and the platinum at the end.
export const ROADMAP_STAGES = [
  {
    title: 'Story first',
    text: 'Play the story straight through: the four chapters, the final mission, and the mission trophies along the way. Every chapter and mission trophy lands here, in order.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Side stories & strangers',
    text: 'After the story opens up, finish the last mission for each contact — Andy, Kenton, Billy, Randy and Tyrone — and complete 8 mission strands for strangers across Leonida.',
    ids: [22, 23, 24, 26, 27, 25],
  },
  {
    title: 'Counts & collectibles',
    text: 'The long counts, done a little at a time while you roam: meditation spots, card sets, WAiNK locations, vehicles, every area of Leonida, garages and Scooter Bros registrations.',
    ids: [28, 30, 31, 35, 42, 54, 55, 32],
  },
  {
    title: 'Activities & skills',
    text: 'One of everything, then the grinds: 250 stunts, gold in all 42 Shooting Range challenges, a Top Fun win at every location, 20 race wins, fishing, the arcade and the hunt.',
    ids: [15, 16, 17, 18, 19, 20, 21, 29],
  },
  {
    title: 'Heists, heat & clean-up',
    text: 'The robberies and the one-time setups, then the money trophies, 100% completion — and the platinum, which unlocks only when the other 54 are yours.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 14, 1],
  },
];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

// The spoiler rule: a story trophy you have not earned yet shows no name
// and no description until you earn it.
export function isSpoilerHidden(trophy, progress, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !isEarned(progress, trophy.id);
}

function trophyMatches(trophy, progress, ui) {
  if (ui.kind === 'missable' && !trophy.missable) return false;
  if (ui.kind !== 'all' && ui.kind !== 'missable' && trophy.kind !== ui.kind) return false;
  if (ui.grade !== 'all' && trophy.grade !== ui.grade) return false;
  if (ui.hideEarned && isEarned(progress, trophy.id)) return false;
  if (ui.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(ui.query.toLowerCase())) return false;
  }
  return true;
}

// The two public lists the official names, descriptions and grades come
// from, plus the honesty note every guide carries. A trophy's "sources"
// array in trophies.json names these by key.
export const SOURCE_LIST = {
  exophase: {
    label: 'Exophase — Grand Theft Auto VI trophy list (official names, descriptions, grades)',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  },
  psnprofiles: {
    label: 'PSNProfiles — Grand Theft Auto VI trophy list (PSN progress counts)',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
  },
  'own-words': {
    label: 'Guide notes — written for this entry from the official description; not yet verified in the game',
    url: null,
  },
};

function sourcesHtml(trophy) {
  if (!Array.isArray(trophy.sources) || trophy.sources.length === 0) return '';
  const items = trophy.sources
    .map((key) => {
      const source = SOURCE_LIST[key];
      if (!source) return '';
      if (source.url) {
        return `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`;
      }
      return `<li>${escapeHtml(source.label)}</li>`;
    })
    .join('');
  return `<p class="sources">Sources:</p><ul class="sources">${items}</ul>`;
}

function counterHtml(trophy, progress) {
  if (!trophy.target) return '';
  const count = getCount(progress, trophy.id);
  const done = count >= trophy.target;
  return `<div class="counter">
    <button type="button" data-count="-1" data-id="${trophy.id}" aria-label="Decrease count">−</button>
    <span class="count-num">${count} / ${trophy.target}${done ? ' — done' : ''}</span>
    <button type="button" data-count="1" data-id="${trophy.id}" aria-label="Increase count">+</button>
    <span class="count-hint">PlayStation tracks this one by number.</span>
  </div>`;
}

export function renderChecklist(listEl, emptyEl, countEl, trophies, progress, ui, hooks) {
  const visible = trophies.filter((trophy) => trophyMatches(trophy, progress, ui));
  countEl.textContent = `${visible.length} of ${trophies.length} trophies shown`;
  emptyEl.hidden = visible.length !== 0;
  listEl.innerHTML = visible
    .map((trophy) => {
      const earned = isEarned(progress, trophy.id);
      const hidden = isSpoilerHidden(trophy, progress, ui.spoiler);
      const open = ui.openId === trophy.id;
      const name = hidden ? 'Story trophy — hidden until earned' : trophy.name;
      const desc = hidden
        ? 'Hidden by the spoiler setting. Earn it to reveal its name and description.'
        : trophy.description;
      const tags = [
        `<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>`,
        `<span class="tag kind">${KIND_LABELS[trophy.kind] || trophy.kind}</span>`,
      ];
      if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
      if (trophy.target) tags.push(`<span class="tag">Count: ${trophy.target}</span>`);
      const guide = open
        ? `<div class="guide">
          <h3>Guide</h3>
          <p>${escapeHtml(trophy.guide)}</p>
          ${trophy.missableNote ? `<p class="missable-note"><strong>Missable:</strong> ${escapeHtml(trophy.missableNote)}</p>` : ''}
          ${counterHtml(trophy, progress)}
          <label>Your note
            <textarea class="note-box" data-note="${trophy.id}" rows="2" placeholder="Where you found it, what worked&hellip;">${escapeHtml(getNote(progress, trophy.id))}</textarea>
          </label>
          ${sourcesHtml(trophy)}
        </div>`
        : '';
      return `<li class="trophy${earned ? ' earned' : ''}" data-id="${trophy.id}">
        <div class="trophy-row">
          <input class="trophy-check" type="checkbox" data-earned="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Earned: ${escapeHtml(name)}">
          <div class="trophy-main">
            <h2 class="trophy-name"><span class="grade-dot ${trophy.grade}"></span>${escapeHtml(name)}</h2>
            <p class="trophy-desc${hidden ? ' hidden-spoiler' : ''}">${escapeHtml(desc)}</p>
            <div class="tags">${tags.join('')}</div>
            <button class="guide-toggle" type="button" data-guide="${trophy.id}">${open ? 'Hide guide' : 'Show guide'}</button>
            ${guide}
          </div>
        </div>
      </li>`;
    })
    .join('');
}

export function renderRoadmap(listEl, trophies, progress, hooks) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  listEl.innerHTML = ROADMAP_STAGES.map((stage) => {
    const stageTrophies = stage.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = stageTrophies.filter((trophy) => isEarned(progress, trophy.id)).length;
    const chips = stageTrophies
      .map((trophy) => {
        const earned = isEarned(progress, trophy.id);
        return `<button type="button" data-jump="${trophy.id}" class="${earned ? 'done' : ''}" title="Open in the checklist">${escapeHtml(trophy.name)}</button>`;
      })
      .join('');
    return `<li class="stage">
      <h3>${escapeHtml(stage.title)}</h3>
      <p>${escapeHtml(stage.text)}</p>
      <div class="stage-trophies">${chips}</div>
      <p class="stage-progress">${done} of ${stageTrophies.length} earned in this stage</p>
    </li>`;
  }).join('');
}

export function renderMissables(containerEl, trophies, progress) {
  const story = trophies.filter((trophy) => trophy.missable && trophy.kind === 'story');
  const setups = trophies.filter((trophy) => trophy.missable && trophy.kind !== 'story');
  const groupHtml = (title, intro, items) => {
    if (items.length === 0) return '';
    const rows = items
      .map((trophy) => {
        const earned = isEarned(progress, trophy.id);
        return `<li><strong>${escapeHtml(trophy.name)}</strong> ${earned ? '— earned ✓' : ''}<br>
          <span class="why">${escapeHtml(trophy.missableNote || trophy.description)}</span></li>`;
      })
      .join('');
    return `<div class="missable-group"><h3>${title} (${items.length})</h3><p class="view-intro">${intro}</p><ul class="missable-list">${rows}</ul></div>`;
  };
  containerEl.innerHTML =
    groupHtml('Story moments', 'Tied to one chapter or mission. Replay the mission if you miss one — but do it on your first pass.', story) +
    groupHtml('One-time setups', 'Tied to a single situation you must set up deliberately. If the moment passes, set it up again and retry.', setups);
}

export function renderProgressCard(trophies, progress) {
  const stats = progressStats(trophies, progress);
  document.getElementById('earnedCount').textContent = String(stats.earnedCount);
  document.getElementById('progressFill').style.width = `${Math.round((stats.earnedCount / trophies.length) * 100)}%`;
  document.getElementById('gradeLine').textContent =
    `${stats.byGrade.platinum} platinum · ${stats.byGrade.gold} gold · ${stats.byGrade.silver} silver · ${stats.byGrade.bronze} bronze`;
  document.getElementById('pointsLine').textContent =
    `${stats.points} trophy points (platinum 300 · gold 90 · silver 30 · bronze 15)`;
}
