// Entry point: loads the data, wires the toolbar, the tabs and the detail panel.

import { loadTrophies } from './data.js';
import { exportProgress, loadProgress, parseImport, saveProgress } from './store.js';
import { applyShot, markReady } from './shots.js';
import { renderAll } from './render.js';

const state = {
  trophies: [],
  earned: loadProgress(),
  demoEarned: new Set(),
  filter: 'all',
  query: '',
  spoilerOn: true,
  selectedId: null,
  view: 'checklist',
};

function showView(view) {
  state.view = view;
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('tabChecklist').classList.toggle('active', view === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('active', view === 'roadmap');
}

async function init() {
  state.trophies = await loadTrophies();
  applyShot(state);
  document.getElementById('spoilerToggle').checked = state.spoilerOn;
  showView(state.view);
  renderAll(state);
  markReady();

  document.getElementById('search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderAll(state);
  });

  document.getElementById('filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kind]');
    if (!btn) return;
    state.filter = btn.dataset.kind;
    document.querySelectorAll('.filter').forEach((b) => b.classList.toggle('active', b === btn));
    renderAll(state);
  });

  document.getElementById('spoilerToggle').addEventListener('change', (e) => {
    state.spoilerOn = e.target.checked;
    renderAll(state);
  });

  document.getElementById('tabChecklist').addEventListener('click', () => showView('checklist'));
  document.getElementById('tabRoadmap').addEventListener('click', () => showView('roadmap'));

  document.getElementById('trophyList').addEventListener('click', (e) => {
    const check = e.target.closest('[data-check]');
    if (check) {
      const id = Number(check.dataset.check);
      if (check.checked) state.earned.add(id);
      else state.earned.delete(id);
      saveProgress(state.earned);
      renderAll(state);
      return;
    }
    const card = e.target.closest('.trophy');
    if (card) {
      state.selectedId = Number(card.dataset.id);
      renderAll(state);
    }
  });

  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));

  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const ids = parseImport(await file.text());
      state.earned = new Set(ids.filter((id) => state.trophies.some((t) => t.id === id)));
      saveProgress(state.earned);
      renderAll(state);
    } catch {
      alert('That file is not a Trophy Guide progress export.');
    }
    e.target.value = '';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all saved progress?')) {
      state.earned = new Set();
      saveProgress(state.earned);
      renderAll(state);
    }
  });
}

init().catch((err) => {
  document.getElementById('progressText').textContent = 'Could not load the trophy list.';
  console.error(err);
});
