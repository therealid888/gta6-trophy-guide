// Loads the trophy data and holds the shared labels for kinds, grades and roadmap stages.

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const STAGES = [
  {
    n: 1,
    title: 'Play the story',
    blurb:
      'Chapters 1–4, the opening mission and the finale. Story trophies cannot be missed — just follow the main missions. One warning: meditate at the Chapter 1 spot before you leave Chapter 1 (Positive Mental Attitude).',
  },
  {
    n: 2,
    title: 'Strangers of Leonida',
    blurb:
      'Meet the strangers marked around the map and play their chains through. Their final missions are the story-kind trophies here, and finishing eight strands earns Strangers & Freaks.',
  },
  {
    n: 3,
    title: 'Skills & activities',
    blurb:
      'Shooting range golds, stunts, drone races, races, fishing, the arcade and the challenge list. These are all repeatable, so grind them whenever you like.',
  },
  {
    n: 4,
    title: 'Collections & money',
    blurb:
      'Cards, WAiNK It locations, vehicles, bank vaults, gang operations, garages and cash. Explore, gather and spend — and finish the 18 meditation spots.',
  },
  {
    n: 5,
    title: 'Odd jobs, secrets & 100%',
    blurb:
      'The strange and secret trophies, then the 100% completion checklist for A Long Road. The platinum pops as soon as the other 54 are done.',
  },
];

export async function loadTrophies() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error('could not load trophies.json');
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  trophies.sort((a, b) => a.id - b.id);
  return trophies;
}

export function byId(trophies) {
  const map = new Map();
  for (const t of trophies) map.set(t.id, t);
  return map;
}
