// Saved progress for the Leonida Ledger. Earned trophies live in
// localStorage as a sorted array of names, and the reader's filter and
// spoiler choices live beside them. Export downloads the earned set as a
// JSON file; import reads one back. Nothing leaves the browser except the
// file the reader asks to download.

export const PROGRESS_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

// Read the earned set. A damaged or foreign value is treated as empty, so
// a bad import can never break the checklist.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

// Reader settings that survive a reload: the spoiler switch and the filters.
export function loadSettings() {
  const fallback = { spoilers: false, kind: 'all', grade: 'all', status: 'all', missableOnly: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object') return fallback;
    return {
      spoilers: parsed.spoilers === true,
      kind: typeof parsed.kind === 'string' ? parsed.kind : 'all',
      grade: typeof parsed.grade === 'string' ? parsed.grade : 'all',
      status: typeof parsed.status === 'string' ? parsed.status : 'all',
      missableOnly: parsed.missableOnly === true,
    };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Turn the earned set into a download. The file carries the game name and a
// date so a file from another guide is easy to spot on import.
export function exportProgress(earned) {
  const payload = {
    guide: 'Leonida Ledger — GTA 6 trophy progress',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Read an exported file back into an earned set. Accepts our own export
// shape ({ earned: [...] }) or a bare array of names. Names that are not on
// the official list are dropped and counted, so the reader sees what happened.
export async function importProgress(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const rawList = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(rawList)) throw new Error('not a progress file');
  const known = new Set(knownNames);
  const earned = new Set();
  let dropped = 0;
  for (const name of rawList) {
    if (typeof name !== 'string') { dropped += 1; continue; }
    if (known.has(name)) earned.add(name);
    else dropped += 1;
  }
  return { earned, dropped };
}
