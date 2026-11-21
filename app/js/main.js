// Boot for the Leonida Trophy Atlas: load the trophy data, render every
// view, and wire the tabs, filters, spoiler setting, export and import.
// The app fetches one file — its own data/trophies.json — and nothing else.

import {
  clearProgress,
  exportProgress,
  getCount,
  importProgressFile,
  isEarned,
  loadProgress,
  saveProgress,
  setCount,
  setEarned,
  setNote,
} from './store.js';
import {
  renderChecklist,
  renderMissables,
  renderProgressCard,
  renderRoadmap,
} from './render.js';

const ui = {
  kind: 'all',
  grade: 'all',
  query: '',
  hideEarned: false,
  spoiler: false,
  openId: null,
};

let trophies = [];
let progress = loadProgress();

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyNote');
const countEl = document.getElementById('resultCount');
const roadmapEl = document.getElementById('roadmapList');
const missablesEl = document.getElementById('missableGroups');

const hooks = {
  openTrophy(id) {
    ui.openId = id;
    showView('checklist');
    renderAll();
    const row = listEl.querySelector(`[data-id="${id}"]`);
    if (row) row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  },
};

function renderAll() {
  renderChecklist(listEl, emptyEl, countEl, trophies, progress, ui, hooks);
  renderRoadmap(roadmapEl, trophies, progress, hooks);
  renderMissables(missablesEl, trophies, progress);
  renderProgressCard(trophies, progress);
  document.getElementById('spoilerBtn').textContent = ui.spoiler ? 'Spoilers: hidden' : 'Spoilers: shown';
  document.getElementById('spoilerBtn').setAttribute('aria-pressed', String(ui.spoiler));
}

function showView(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('active', view.id === `view-${name}`);
  }
  document.getElementById('toolbar').style.display = name === 'checklist' ? '' : 'none';
}

// Tabs.
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

// Kind chips.
for (const chip of document.querySelectorAll('#kindChips .chip')) {
  chip.addEventListener('click', () => {
    for (const other of document.querySelectorAll('#kindChips .chip')) other.classList.remove('active');
    chip.classList.add('active');
    ui.kind = chip.dataset.kind;
    renderAll();
  });
}

document.getElementById('gradeSelect').addEventListener('change', (event) => {
  ui.grade = event.target.value;
  renderAll();
});

document.getElementById('searchInput').addEventListener('input', (event) => {
  ui.query = event.target.value.trim();
  renderAll();
});

document.getElementById('hideEarned').addEventListener('change', (event) => {
  ui.hideEarned = event.target.checked;
  renderAll();
});

// Checklist clicks: earned checkbox, guide toggle, counter buttons, jumps.
listEl.addEventListener('click', (event) => {
  const earnedBox = event.target.closest('[data-earned]');
  if (earnedBox) {
    const id = Number(earnedBox.dataset.earned);
    setEarned(progress, id, earnedBox.checked);
    renderAll();
    return;
  }
  const guideBtn = event.target.closest('[data-guide]');
  if (guideBtn) {
    const id = Number(guideBtn.dataset.guide);
    ui.openId = ui.openId === id ? null : id;
    renderAll();
    return;
  }
  const countBtn = event.target.closest('[data-count]');
  if (countBtn) {
    const id = Number(countBtn.dataset.id);
    const trophy = trophies.find((item) => item.id === id);
    const next = getCount(progress, id) + Number(countBtn.dataset.count);
    setCount(progress, id, next, trophy ? trophy.target : undefined);
    renderAll();
  }
});

listEl.addEventListener('input', (event) => {
  const noteBox = event.target.closest('[data-note]');
  if (!noteBox) return;
  setNote(progress, Number(noteBox.dataset.note), noteBox.value);
});

// Roadmap trophy chips jump to the checklist.
roadmapEl.addEventListener('click', (event) => {
  const jump = event.target.closest('[data-jump]');
  if (jump) hooks.openTrophy(Number(jump.dataset.jump));
});

// Spoiler setting.
document.getElementById('spoilerBtn').addEventListener('click', () => {
  ui.spoiler = !ui.spoiler;
  renderAll();
});

// Export / import / reset.
document.getElementById('exportBtn').addEventListener('click', () => exportProgress(progress));

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    progress = await importProgressFile(file);
    renderAll();
  } catch (err) {
    alert('That file could not be imported as progress. Export first, then import the file it downloads.');
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear every earned trophy, counter and note?')) {
    progress = clearProgress();
    ui.openId = null;
    renderAll();
  }
});

// Load the data and paint the first view.
fetch('./data/trophies.json')
  .then((response) => {
    if (!response.ok) throw new Error(`trophies.json: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    trophies = Array.isArray(data) ? data : data.trophies;
    if (!Array.isArray(trophies) || trophies.length === 0) throw new Error('No trophies in trophies.json.');
    renderAll();
  })
  .catch((err) => {
    listEl.innerHTML = `<li class="trophy"><p>Could not load the trophy list: ${err.message}</p></li>`;
  });
