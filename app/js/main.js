// Boot for the Leonida Ledger: load the trophy data, wire the toolbar and the
// tabs, and render the checklist, roadmap and missables from one shared state.

import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgress } from './store.js';
import { trophyMatches } from './filters.js';
import { buildTrophyRow, renderProgress, renderRoadmap, renderMissables } from './views.js';

const DATA_URL = 'data/trophies.json';

const state = {
  trophies: [],
  earned: loadEarned(),
  settings: loadSettings(),
  search: '',
  openId: null,
  view: 'checklist',
};

const VIEWS = ['checklist', 'roadmap', 'missables', 'sources'];

function currentFilters() {
  return {
    search: state.search,
    kind: state.settings.kind,
    grade: state.settings.grade,
    status: state.settings.status,
    missableOnly: state.settings.missableOnly,
  };
}

function renderAll() {
  renderProgress(state.trophies, state.earned);
  renderChecklist();
  renderRoadmap(state.trophies, state.earned, handlers);
  renderMissables(state.trophies, state.earned, state.settings.spoilers, state.openId, handlers);
}

function renderChecklist() {
  const list = document.getElementById('trophy-list');
  const filters = currentFilters();
  const shown = state.trophies.filter((t) => trophyMatches(t, state.earned, filters));
  list.replaceChildren();
  for (const trophy of shown) {
    list.appendChild(buildTrophyRow(trophy, state.earned, state.settings.spoilers, state.openId === trophy.id, handlers));
  }
  document.getElementById('list-meta').textContent =
    `Showing ${shown.length} of ${state.trophies.length} trophies` +
    (state.settings.spoilers ? ' · story spoilers hidden' : '');
  document.getElementById('empty-note').hidden = shown.length !== 0;
}

const handlers = {
  onToggleEarned(name, checked) {
    if (checked) state.earned.add(name);
    else state.earned.delete(name);
    saveEarned(state.earned);
    renderAll();
  },
  onToggleDetail(id) {
    state.openId = state.openId === id ? null : id;
    renderChecklist();
    renderMissables(state.trophies, state.earned, state.settings.spoilers, state.openId, handlers);
  },
};

function showView(view) {
  state.view = view;
  for (const name of VIEWS) {
    document.getElementById(`view-${name}`).hidden = name !== view;
    document.getElementById(`tab-${name}`).classList.toggle('active', name === view);
  }
  if (view === 'roadmap') renderRoadmap(state.trophies, state.earned, handlers);
  if (view === 'missables') renderMissables(state.trophies, state.earned, state.settings.spoilers, state.openId, handlers);
}

function wireToolbar() {
  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    state.search = search.value;
    renderChecklist();
  });

  const kind = document.getElementById('kind');
  kind.value = state.settings.kind;
  kind.addEventListener('change', () => {
    state.settings.kind = kind.value;
    saveSettings(state.settings);
    renderChecklist();
  });

  const grade = document.getElementById('grade');
  grade.value = state.settings.grade;
  grade.addEventListener('change', () => {
    state.settings.grade = grade.value;
    saveSettings(state.settings);
    renderChecklist();
  });

  const status = document.getElementById('status');
  status.value = state.settings.status;
  status.addEventListener('change', () => {
    state.settings.status = status.value;
    saveSettings(state.settings);
    renderChecklist();
  });

  const missableOnly = document.getElementById('missable-only');
  missableOnly.checked = state.settings.missableOnly;
  missableOnly.addEventListener('change', () => {
    state.settings.missableOnly = missableOnly.checked;
    saveSettings(state.settings);
    renderChecklist();
  });

  const spoilers = document.getElementById('spoilers');
  spoilers.checked = state.settings.spoilers;
  spoilers.addEventListener('change', () => {
    state.settings.spoilers = spoilers.checked;
    saveSettings(state.settings);
    state.openId = null;
    renderAll();
  });

  document.getElementById('export').addEventListener('click', () => {
    exportProgress(state.earned);
  });

  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const { earned, dropped } = await importProgress(file, state.trophies.map((t) => t.name));
      state.earned = earned;
      saveEarned(state.earned);
      renderAll();
      document.getElementById('list-meta').textContent =
        `Imported ${earned.size} earned trophies` + (dropped ? ` (${dropped} names not on the official list were skipped)` : '');
    } catch {
      document.getElementById('list-meta').textContent =
        'That file could not be read as trophy progress. Export a progress file from this guide and try again.';
    }
    event.target.value = '';
  });
}

function wireTabs() {
  for (const name of VIEWS) {
    document.getElementById(`tab-${name}`).addEventListener('click', () => showView(name));
  }
}

// Deep links: #roadmap and #missables open those tabs; #spoilers turns the
// spoiler setting on and #missable-only turns the missable filter on, so a
// link can open the guide straight into a view (used by the screenshots).
function applyHash() {
  const parts = location.hash.slice(1).split(',').filter(Boolean);
  for (const part of parts) {
    if (VIEWS.includes(part)) showView(part);
    if (part === 'spoilers') {
      state.settings.spoilers = true;
      document.getElementById('spoilers').checked = true;
    }
    if (part === 'missable-only') {
      state.settings.missableOnly = true;
      document.getElementById('missable-only').checked = true;
    }
  }
  saveSettings(state.settings);
}

async function boot() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`could not load ${DATA_URL}`);
  const doc = await response.json();
  state.trophies = Array.isArray(doc) ? doc : doc.trophies;
  wireToolbar();
  wireTabs();
  applyHash();
  renderAll();
}

boot().catch((error) => {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  const note = document.createElement('li');
  note.className = 'trophy';
  note.textContent = `The trophy list could not be loaded (${error.message}). Check that data/trophies.json sits beside this page and reload.`;
  list.appendChild(note);
});
