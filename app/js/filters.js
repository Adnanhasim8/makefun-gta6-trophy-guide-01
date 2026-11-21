// Filtering and the spoiler rule for the checklist. A trophy is shown when
// every active filter agrees with it; the spoiler rule then decides whether
// its name and description may be read.

// The spoiler rule: with spoilers hidden, a story trophy the reader has not
// earned yet shows a placeholder instead of its name, description and guide.
// Earned story trophies and every non-story trophy are always shown in full.
export function isHiddenBySpoilers(trophy, earned, spoilersOn) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function displayName(trophy, earned, spoilersOn) {
  return isHiddenBySpoilers(trophy, earned, spoilersOn)
    ? 'Hidden story trophy'
    : trophy.name;
}

export function displayDescription(trophy, earned, spoilersOn) {
  return isHiddenBySpoilers(trophy, earned, spoilersOn)
    ? 'Earn this trophy in the game to reveal its name and description.'
    : trophy.description;
}

// filters: { search, kind, grade, status, missableOnly }
export function trophyMatches(trophy, earned, filters) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'unearned' && earned.has(trophy.name)) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.search) {
    const needle = filters.search.trim().toLowerCase();
    if (needle) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }
  return true;
}

// Progress counts, by grade, for the header card.
export function progressCounts(trophies, earned) {
  const counts = { total: trophies.length, earned: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned.has(trophy.name)) {
      counts.earned += 1;
      counts[trophy.grade] += 1;
    }
  }
  return counts;
}
