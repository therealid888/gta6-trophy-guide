// Screenshot scenes (?shot=checklist|guide|roadmap|spoiler). The demo progress is kept in
// memory only — it never touches localStorage — so a real visitor's saves stay theirs.

export const DEMO_EARNED = [2, 3, 4, 5, 8, 9, 15, 16, 18, 19, 20, 21, 28, 32, 35, 42, 52, 53];

export function applyShot(state) {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) return;
  if (shot === 'checklist') {
    state.view = 'checklist';
    state.spoilerOn = true;
    state.demoEarned = new Set(DEMO_EARNED);
    state.selectedId = 18;
  } else if (shot === 'guide') {
    state.view = 'checklist';
    state.spoilerOn = true;
    state.demoEarned = new Set(DEMO_EARNED);
    state.selectedId = 28;
  } else if (shot === 'roadmap') {
    state.view = 'roadmap';
    state.spoilerOn = true;
    state.demoEarned = new Set(DEMO_EARNED);
  } else if (shot === 'spoiler') {
    state.view = 'checklist';
    state.spoilerOn = true;
    state.demoEarned = new Set();
    state.selectedId = 2;
  }
}

export function markReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
