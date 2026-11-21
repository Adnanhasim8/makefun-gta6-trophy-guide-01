// Progress store for the Leonida Trophy Atlas: earned flags, per-trophy
// counters for the trophies PlayStation tracks by number, and free-text
// notes, all saved in the browser's localStorage and exportable as JSON.

export const STORAGE_KEY = 'leonida-trophy-atlas-v1';

// PSN's trophy point values, shown beside the earned count.
export const GRADE_POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };

export function blankProgress() {
  return { version: 1, earned: [], counts: {}, notes: {} };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankProgress();
    return {
      version: 1,
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'number') : [],
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    };
  } catch (err) {
    return blankProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (err) {
    return false;
  }
}

export function isEarned(progress, trophyId) {
  return progress.earned.includes(trophyId);
}

export function setEarned(progress, trophyId, earned) {
  const next = new Set(progress.earned);
  if (earned) next.add(trophyId);
  else next.delete(trophyId);
  progress.earned = [...next].sort((a, b) => a - b);
  saveProgress(progress);
  return progress;
}

export function getCount(progress, trophyId) {
  const value = progress.counts[trophyId];
  return typeof value === 'number' && value > 0 ? value : 0;
}

export function setCount(progress, trophyId, count, target) {
  const clamped = Math.max(0, target ? Math.min(count, target) : count);
  progress.counts[trophyId] = clamped;
  if (target && clamped >= target) {
    const next = new Set(progress.earned);
    next.add(trophyId);
    progress.earned = [...next].sort((a, b) => a - b);
  }
  saveProgress(progress);
  return progress;
}

export function getNote(progress, trophyId) {
  const note = progress.notes[trophyId];
  return typeof note === 'string' ? note : '';
}

export function setNote(progress, trophyId, text) {
  if (text.trim() === '') delete progress.notes[trophyId];
  else progress.notes[trophyId] = text.slice(0, 500);
  saveProgress(progress);
  return progress;
}

export function clearProgress() {
  const fresh = blankProgress();
  saveProgress(fresh);
  return fresh;
}

// Totals for the header card: earned count, per-grade counts, points.
export function progressStats(trophies, progress) {
  const earned = new Set(progress.earned);
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let points = 0;
  for (const trophy of trophies) {
    if (earned.has(trophy.id)) {
      byGrade[trophy.grade] = (byGrade[trophy.grade] || 0) + 1;
      points += GRADE_POINTS[trophy.grade] || 0;
    }
  }
  return { earnedCount: earned.size, byGrade, points };
}

// Export: download the progress as a JSON file.
export function exportProgress(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-atlas-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import: read an exported JSON file and return the parsed progress, or
// throw a short error message the caller shows.
export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
  const progress = blankProgress();
  if (Array.isArray(parsed.earned)) {
    progress.earned = parsed.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  }
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [key, value] of Object.entries(parsed.counts)) {
      const id = Number(key);
      if (Number.isInteger(id) && typeof value === 'number' && value >= 0) progress.counts[id] = Math.floor(value);
    }
  }
  if (parsed.notes && typeof parsed.notes === 'object') {
    for (const [key, value] of Object.entries(parsed.notes)) {
      const id = Number(key);
      if (Number.isInteger(id) && typeof value === 'string') progress.notes[id] = value.slice(0, 500);
    }
  }
  saveProgress(progress);
  return progress;
}
