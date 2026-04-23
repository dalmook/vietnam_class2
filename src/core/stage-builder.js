import { setJson, setString } from './storage.js';
import { getCurrentStageCardPool, isPronunciationPriorityStage } from './curriculum.js';

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildStageItems(state, size) {
  const pool = getCurrentStageCardPool(state);
  if (!pool.length) return [];
  if (isPronunciationPriorityStage(state)) {
    const core = pool.filter((c) => c.type === 'pronunciation' || c.isPronunciationCore);
    const rest = pool.filter((c) => !core.includes(c));
    return [...shuffle(core), ...shuffle(rest)].slice(0, Math.min(size, pool.length));
  }
  return shuffle(pool).slice(0, Math.min(size, pool.length));
}

export function getCardMeta(state, cardId) {
  const base = state.cardMeta[cardId] || {};
  return {
    seen: Number(base.seen || 0),
    known: Number(base.known || 0),
    wrongCount: Number(base.wrongCount || 0),
    starred: Boolean(base.starred),
    easeScore: Number(base.easeScore || 1.8),
    lastSeenAt: base.lastSeenAt || null,
    lastWrongAt: base.lastWrongAt || null,
    nextReviewAt: base.nextReviewAt || null,
  };
}

export function upsertCardMeta(state, cardId, patch) {
  state.cardMeta[cardId] = { ...getCardMeta(state, cardId), ...patch };
  setJson('vi-card-meta', state.cardMeta);
}

export function computeReviewDays(meta, wrong = false) {
  if (wrong) return 1;
  if (meta.easeScore < 1.4) return 1;
  if (meta.easeScore < 2.1) return 3;
  return 7;
}

export function updateCardMetaAfterStudy(state, card, known) {
  if (!card?.id) return;
  const now = new Date().toISOString();
  const meta = getCardMeta(state, card.id);
  meta.seen += 1;
  meta.lastSeenAt = now;
  if (known) {
    meta.known += 1;
    meta.easeScore = Math.min(3.0, meta.easeScore + 0.18);
    meta.nextReviewAt = new Date(Date.now() + computeReviewDays(meta, false) * 86400000).toISOString();
  } else {
    meta.wrongCount += 1;
    meta.lastWrongAt = now;
    meta.easeScore = Math.max(0.8, meta.easeScore - 0.35);
    meta.nextReviewAt = new Date(Date.now() + 86400000).toISOString();
  }
  upsertCardMeta(state, card.id, meta);
}

export function isDifficultMeta(meta) {
  return meta.wrongCount >= 2 || meta.easeScore <= 1.35;
}

export function buildReviewQueueByDays(state, days) {
  const horizon = Date.now() + days * 86400000;
  return state.cards.filter((card) => {
    const meta = getCardMeta(state, card.id);
    return meta.nextReviewAt && new Date(meta.nextReviewAt).getTime() <= horizon;
  });
}

export function getPronConfusionGroups(state) {
  const grouped = new Map();
  state.cards.filter((card) => card.minimalPairGroup).forEach((card) => {
    const meta = getCardMeta(state, card.id);
    if (meta.wrongCount <= 0) return;
    const key = card.minimalPairGroup;
    grouped.set(key, [...(grouped.get(key) || []), card]);
  });
  return [...grouped.entries()];
}

export function persistRecord(state) {
  setString('vi-total-xp', String(state.record.totalXp));
  setString('vi-sessions', String(state.record.sessions));
  setString('vi-best-streak', String(state.record.bestStreak));
  setString('vi-today-study', String(state.record.todayStudy));
  setString('vi-today-review', String(state.record.todayReview));
  setString('vi-streak-days', String(state.record.streakDays));
  setString('vi-last-study-date', state.record.lastStudyDate);
  setJson('vi-wrong-cards', state.record.wrongCardIds);
}
