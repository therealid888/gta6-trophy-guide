// Saved progress: a set of earned trophy ids kept in localStorage, with export/import/reset.

const KEY = 'gta6-trophy-guide-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids || []).map(Number).filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }));
}

export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  const out = ids.map(Number).filter((n) => Number.isInteger(n));
  if (out.length !== ids.length) throw new Error('bad ids in progress file');
  return out;
}
