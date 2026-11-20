// Renders the checklist, the detail panel, the progress bar and the roadmap from state.
// State: { trophies, earned:Set, demoEarned:Set, filter, query, spoilerOn, selectedId, view }

import { GRADE_ORDER, KIND_LABELS, STAGES } from './data.js';

export function isEarned(state, trophy) {
  return state.earned.has(trophy.id) || state.demoEarned.has(trophy.id);
}

export function isMasked(state, trophy) {
  return trophy.hidden && state.spoilerOn && !isEarned(state, trophy);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function visibleTrophies(state) {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.filter !== 'all' && t.kind !== state.filter) return false;
    if (!q) return true;
    return (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q);
  });
}

function trophyCard(state, t) {
  const earned = isEarned(state, t);
  const masked = isMasked(state, t);
  const name = masked ? 'Hidden trophy' : t.name;
  const desc = masked ? 'Hidden until earned — turn the spoiler setting off to reveal it.' : t.description;
  const badges = [`<span class="badge ${t.grade}">${t.grade}</span>`];
  badges.push(`<span class="badge kind">${KIND_LABELS[t.kind]}</span>`);
  if (t.missable && t.kind !== 'missable') badges.push('<span class="badge missable">Missable</span>');
  if (t.hidden) badges.push('<span class="badge hidden-badge">Hidden</span>');
  return `<li class="trophy${earned ? ' earned' : ''}${state.selectedId === t.id ? ' selected' : ''}" data-id="${t.id}">
    <input type="checkbox" data-check="${t.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(name)} earned">
    <div class="trophy-body">
      <div class="trophy-name${masked ? ' hidden-name' : ''}">${esc(name)}</div>
      <div class="trophy-desc">${esc(desc)}</div>
      <div class="trophy-meta">${badges.join('')}</div>
    </div>
    <span class="earned-mark">${earned ? '✓ Earned' : ''}</span>
  </li>`;
}

export function renderList(state) {
  const list = document.getElementById('trophyList');
  const shown = visibleTrophies(state);
  list.innerHTML = shown.map((t) => trophyCard(state, t)).join('');
  document.getElementById('emptyState').hidden = shown.length > 0;
}

export function renderDetail(state) {
  const box = document.getElementById('detail');
  const t = state.trophies.find((x) => x.id === state.selectedId);
  if (!t) {
    box.innerHTML = '<p class="detail-empty">Select a trophy to read its guide and sources.</p>';
    return;
  }
  const earned = isEarned(state, t);
  const masked = isMasked(state, t);
  const name = masked ? 'Hidden trophy' : t.name;
  const official = masked ? 'Hidden until earned.' : t.description;
  const guide = masked
    ? 'Earn this trophy — or turn the spoiler setting off — to reveal its guide.'
    : t.guide;
  const badges = [`<span class="badge ${t.grade}">${t.grade}</span>`];
  badges.push(`<span class="badge kind">${KIND_LABELS[t.kind]}</span>`);
  if (t.missable && t.kind !== 'missable') badges.push('<span class="badge missable">Missable</span>');
  if (t.hidden) badges.push('<span class="badge hidden-badge">Hidden</span>');
  box.innerHTML = `<h2>${esc(name)}</h2>
    <p class="official">Official: ${esc(official)}</p>
    <div class="trophy-meta">${badges.join('')}</div>
    <p>${earned ? '✓ You have earned this trophy.' : 'Not earned yet.'}</p>
    <h3>Guide</h3>
    <p class="${masked ? 'guide-hidden' : ''}">${esc(guide)}</p>
    <h3>Sources</h3>
    <p class="sources">${masked ? 'Hidden until earned.' : t.sources.map(esc).join(' · ')}</p>`;
}

export function renderProgress(state) {
  const total = state.trophies.length;
  const earned = state.trophies.filter((t) => isEarned(state, t)).length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `${earned}/${total} earned · ${pct}% to the platinum`;
  const parts = GRADE_ORDER.map((g) => {
    const ofGrade = state.trophies.filter((t) => t.grade === g);
    const got = ofGrade.filter((t) => isEarned(state, t)).length;
    return `${g} ${got}/${ofGrade.length}`;
  });
  document.getElementById('gradeCounts').textContent = parts.join(' · ');
}

export function renderFilterCounts(state) {
  const counts = { all: state.trophies.length, online: 0 };
  for (const t of state.trophies) counts[t.kind] = (counts[t.kind] || 0) + 1;
  document.querySelectorAll('[data-count]').forEach((el) => {
    el.textContent = `(${counts[el.dataset.count] || 0})`;
  });
}

export function renderRoadmap(state) {
  const box = document.getElementById('roadmap');
  box.innerHTML = STAGES.map((stage) => {
    const items = state.trophies.filter((t) => t.stage === stage.n);
    const lis = items
      .map((t) => {
        const flag = t.missable ? ' <span class="flag">⚠ MISSABLE</span>' : '';
        const earned = isEarned(state, t) ? ' ✓' : '';
        return `<li>${esc(t.name)} <span class="badge ${t.grade}">${t.grade}</span>${flag}${earned}</li>`;
      })
      .join('');
    return `<div class="stage"><h3><span class="stage-num">Stage ${stage.n} —</span> ${esc(stage.title)}</h3>
      <p>${esc(stage.blurb)}</p><ul>${lis}</ul></div>`;
  }).join('');
}

export function renderAll(state) {
  renderProgress(state);
  renderFilterCounts(state);
  renderList(state);
  renderDetail(state);
  renderRoadmap(state);
}
