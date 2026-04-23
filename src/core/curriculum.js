import { setJson } from './storage.js';

export function resolveInitialStageSlug(state) {
  const saved = localStorage.getItem('vi-stage-slug');
  if (saved && state.curriculum.some((c) => c.slug === saved)) return saved;
  const legacyIndex = Number(localStorage.getItem('vi-stage') || 1);
  return state.curriculum[Math.max(0, legacyIndex - 1)]?.slug || state.curriculum[0]?.slug;
}

export function getCurrentStage(state) {
  return state.curriculum.find((s) => s.slug === state.stageSlug) || state.curriculum[0];
}

export function getStageCardPoolBySlug(state, slug) {
  const stage = state.curriculum.find((s) => s.slug === slug);
  if (!stage) return [];
  const deckMeta = state.stageDecks[slug];
  if (deckMeta?.cardIds?.length) {
    const set = new Set(deckMeta.cardIds);
    return state.cards.filter((c) => set.has(c.id));
  }
  return state.cards.filter((c) => c.stageSlug === slug);
}

export function getCurrentStageCardPool(state) {
  const stage = getCurrentStage(state);
  return getStageCardPoolBySlug(state, stage.slug);
}

export function isPronunciationPriorityStage(state) {
  return ['letters-tones', 'pronunciation-rules'].includes(state.stageSlug);
}

export function getStageStats(state, slug) {
  return state.stageStats[slug] || { seenCount: 0, knownCount: 0, lastStudiedAt: null, completed: false };
}

export function stageCompletion(state, slug) {
  const stats = getStageStats(state, slug);
  const total = getStageCardPoolBySlug(state, slug).length || 1;
  return Math.min(100, Math.floor((stats.knownCount / total) * 100));
}

export function touchStageStat(state, slug, type) {
  const cur = getStageStats(state, slug);
  if (type === 'seen') cur.seenCount += 1;
  if (type === 'known') cur.knownCount += 1;
  cur.lastStudiedAt = new Date().toISOString();
  cur.completed = stageCompletion(state, slug) >= 90;
  state.stageStats[slug] = cur;
  setJson('vi-stage-stats', state.stageStats);
}
