import { buildReviewQueueByDays, getCardMeta, getPronConfusionGroups } from '../core/stage-builder.js';
import { getCurrentStage, getStageCardPoolBySlug, getStageStats, stageCompletion } from '../core/curriculum.js';

export function renderStageInfo(state, el) {
  const stage = getCurrentStage(state);
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug);
  el.stageChip.textContent = `STEP ${idx + 1} · ${stage.id || stage.slug}`;
  el.stageTitle.textContent = stage.title || '학습 단계';
  el.stageGoal.textContent = `${stage.subtitle || ''} · 목표: ${stage.goal || ''}`;
  const tasks = Array.isArray(stage.tasks) ? stage.tasks.join(' / ') : stage.tasks || '-';
  el.stageTasks.textContent = `오늘 미션: ${tasks}`;
}

export function renderStageCards(state, el, onSelect) {
  el.stageList.innerHTML = state.curriculum.map((s, i) => {
    const stats = getStageStats(state, s.slug);
    const completion = stageCompletion(state, s.slug);
    const status = s.slug === state.stageSlug ? 'current' : stats.completed ? 'done' : stats.seenCount > 0 ? 'in-progress' : 'new';
    const cta = stats.seenCount > 0 ? '이어서 하기' : '시작하기';
    const recent = stats.lastStudiedAt ? `최근 학습: ${new Date(stats.lastStudiedAt).toLocaleDateString()}` : '최근 학습 없음';
    const cardCount = getStageCardPoolBySlug(state, s.slug).length;
    return `<button class="stage-card ${status}" data-slug="${s.slug}"><div class="stage-head"><span>STEP ${i + 1}</span><span>${completion}%</span></div><h4>${s.title}</h4><p class="sub">${s.subtitle || ''}</p><p class="meta">카드 ${cardCount}개 · ${recent}</p><p class="goal">${cta}</p></button>`;
  }).join('');

  [...el.stageList.querySelectorAll('.stage-card')].forEach((btn) => btn.addEventListener('click', () => onSelect(btn.dataset.slug)));
}

export function renderDashboard(state, el) {
  el.sumTotal.textContent = String(state.record.sessions);
  el.sumToday.textContent = String(state.record.todayStudy);
  el.sumReview.textContent = String(state.record.todayReview);
  el.sumStreakDays.textContent = String(state.record.streakDays);
  el.sumDueToday.textContent = String(buildReviewQueueByDays(state, 1).length);
  el.sumRecentWrong.textContent = String(state.cards.filter((card) => {
    const wrongAt = getCardMeta(state, card.id).lastWrongAt;
    return wrongAt && Date.now() - new Date(wrongAt).getTime() <= 3 * 86400000;
  }).length);
  el.sumPronConfusion.textContent = String(getPronConfusionGroups(state).length);
}

export function renderSavedStats(state, el) {
  el.savedStats.textContent = `기록: 누적 XP ${state.record.totalXp} · 완료 ${state.record.sessions}회 · 최고 스트릭 ${state.record.bestStreak} · 데이터 ${state.dataSource}`;
}
