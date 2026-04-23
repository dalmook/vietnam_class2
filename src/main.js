import { createInitialState } from './core/state.js';
import { setJson, setString } from './core/storage.js';
import { loadLearningData } from './content/loaders.js';
import { resolveInitialStageSlug, touchStageStat } from './core/curriculum.js';
import { buildStageItems, buildReviewQueueByDays, getCardMeta, getPronConfusionGroups, isDifficultMeta, persistRecord, shuffle, updateCardMetaAfterStudy, upsertCardMeta } from './core/stage-builder.js';
import { buildQuizQueue } from './core/quiz-builder.js';
import { speakItem } from './audio/speech.js';
import { createElements, activateScreen } from './ui/components.js';
import { renderDashboard, renderSavedStats, renderStageCards, renderStageInfo } from './ui/home.js';
import { renderStudy } from './ui/study.js';
import { renderQuiz } from './ui/quiz.js';
import { renderResult } from './ui/result.js';
import { bindOpicBuilder, buildOpicDraft, renderOpicTopicDetail, renderOpicTopics } from './ui/opic.js';
import { renderReviewList } from './ui/review.js';

const LEGACY_CURRICULUM = window.CURRICULUM_DATA || [];
const state = createInitialState();
const el = createElements();
state.audio.preload = 'none';

init();

async function init() {
  bindEvents();
  try {
    await loadLearningData(state, LEGACY_CURRICULUM);
  } catch {
    showNotice('데이터를 불러오지 못했습니다. 파일 경로를 확인해 주세요.');
    el.progressLabel.textContent = '데이터 로딩 실패';
    el.timerLabel.textContent = 'fallback 파일 확인 필요';
    return;
  }
  state.stageSlug = resolveInitialStageSlug(state);
  refreshHome();
  updateHud();
  activateScreen(el, 'home');
  setupOnboarding();
  setupA11yLabels();
}

function bindEvents() {
  el.startStudyBtn?.addEventListener('click', () => startMode('study'));
  el.startQuizBtn?.addEventListener('click', () => startMode('quiz'));
  el.quickToday.addEventListener('click', () => startMode('study'));
  el.quickPron.addEventListener('click', quickPronReview);
  el.quickWrong.addEventListener('click', quickWrongReview);
  el.quickOpic.addEventListener('click', openOpicMode);
  el.quickReview1d.addEventListener('click', () => startReviewSession(buildReviewQueueByDays(state, 1), '1일 복습'));
  el.quickReview3d.addEventListener('click', () => startReviewSession(buildReviewQueueByDays(state, 3), '3일 복습'));
  el.quickReview7d.addEventListener('click', () => startReviewSession(buildReviewQueueByDays(state, 7), '7일 복습'));
  el.quickPronConfusion.addEventListener('click', quickPronConfusionReview);
  el.openWrongNote.addEventListener('click', () => openReviewNotebook('wrong'));
  el.openStarred.addEventListener('click', () => openReviewNotebook('starred'));
  el.openDifficult.addEventListener('click', () => openReviewNotebook('difficult'));

  el.flipBtn.addEventListener('click', () => { state.ui.showMeaning = !state.ui.showMeaning; renderStudy(state, el); });
  el.toggleTipsBtn.addEventListener('click', () => { state.ui.showTips = !state.ui.showTips; renderStudy(state, el); });
  el.starBtn.addEventListener('click', toggleCardStar);
  el.speakBtn.addEventListener('click', () => speakItem(state, el, state.queue[state.index], false));
  el.slowSpeakBtn.addEventListener('click', () => speakItem(state, el, state.queue[state.index], true));
  el.knownBtn.addEventListener('click', () => nextStudyCard(true));
  el.againBtn.addEventListener('click', () => nextStudyCard(false));

  el.quizSpeakBtn.addEventListener('click', () => speakItem(state, el, state.queue[state.index] ? { ...state.queue[state.index], text: state.queue[state.index].speakText || state.queue[state.index].answer } : null));
  el.nextQuizBtn.addEventListener('click', nextQuiz);

  el.retryBtn.addEventListener('click', () => startMode(state.mode));
  el.homeBtn.addEventListener('click', goHome);
  el.studyHomeBtn.addEventListener('click', goHome);
  el.quizHomeBtn.addEventListener('click', goHome);
  el.resultReviewBtn.addEventListener('click', quickWrongReview);
  el.resultDueBtn.addEventListener('click', () => startReviewSession(buildReviewQueueByDays(state, 1), '1일 복습'));

  el.opicHomeBtn.addEventListener('click', goHome);
  el.opicBuild30.addEventListener('click', () => buildOpicDraft(el, state.selectedOpicTopic, 30));
  el.opicBuild60.addEventListener('click', () => buildOpicDraft(el, state.selectedOpicTopic, 60));

  el.reviewHomeBtn.addEventListener('click', goHome);
  el.reviewStartBtn.addEventListener('click', () => startReviewSession(state.reviewPool, '노트 기반 복습'));
  el.reviewClearBtn.addEventListener('click', clearReviewMetaForCurrentPool);
  el.onboardingStartBtn?.addEventListener('click', closeOnboarding);
  el.onboardingSkipBtn?.addEventListener('click', closeOnboarding);
}

function refreshHome() {
  renderStageInfo(state, el);
  renderStageCards(state, el, (slug) => { state.stageSlug = slug; setString('vi-stage-slug', slug); startMode('study'); });
  renderSavedStats(state, el);
  renderDashboard(state, el);
}

function quickPronReview() {
  const target = state.curriculum.find((s) => ['letters-tones', 'pronunciation-rules'].includes(s.slug)) || state.curriculum[0];
  state.stageSlug = target.slug;
  startMode('study');
}

function quickWrongReview() {
  const set = new Set(state.record.wrongCardIds);
  startReviewSession(state.cards.filter((c) => set.has(c.id)), '오답 복습');
}

function quickPronConfusionReview() {
  const ids = getPronConfusionGroups(state).flatMap(([, cards]) => cards.map((c) => c.id));
  const set = new Set(ids);
  startReviewSession(state.cards.filter((c) => set.has(c.id)), '헷갈리는 소리 복습');
}

function startReviewSession(items, label = '복습') {
  if (!items.length) {
    showNotice('복습할 카드가 아직 없습니다.');
    return;
  }
  state.mode = 'study';
  state.sessionLabel = label;
  state.index = 0;
  state.queue = shuffle(items).slice(0, Number(el.sizeSelect.value || 12));
  updateDailyRecord(true);
  activateScreen(el, 'study');
  renderStudy(state, el);
  updateProgress();
}

function openReviewNotebook(mode) {
  state.reviewMode = mode;
  if (mode === 'starred') state.reviewPool = state.cards.filter((card) => getCardMeta(state, card.id).starred);
  else if (mode === 'difficult') state.reviewPool = state.cards.filter((card) => isDifficultMeta(getCardMeta(state, card.id)));
  else state.reviewPool = state.cards.filter((card) => state.record.wrongCardIds.includes(card.id));
  el.reviewTitle.textContent = mode === 'wrong' ? '오답노트' : mode === 'starred' ? '즐겨찾기 카드' : '어려운 카드';
  el.reviewDesc.textContent = `총 ${state.reviewPool.length}개 카드`;
  if (!state.reviewPool.length) el.reviewDesc.textContent = '표시할 카드가 없습니다. 학습/퀴즈를 먼저 진행해 주세요.';
  renderReviewList(state, el, getCardMeta);
  activateScreen(el, 'review');
}

function clearReviewMetaForCurrentPool() {
  state.reviewPool.forEach((card) => {
    const meta = getCardMeta(state, card.id);
    meta.wrongCount = 0;
    meta.lastWrongAt = null;
    if (state.reviewMode === 'starred') meta.starred = false;
    upsertCardMeta(state, card.id, meta);
  });
  state.record.wrongCardIds = state.record.wrongCardIds.filter((id) => !state.reviewPool.some((c) => c.id === id));
  persistRecord(state);
  openReviewNotebook(state.reviewMode);
}

function openOpicMode() {
  activateScreen(el, 'opic');
  renderOpicTopics(state, el, (topicKey) => {
    state.selectedOpicTopic = topicKey;
    renderOpicTopicDetail(state, el, topicKey);
    bindOpicBuilder(el);
  });
}

function startMode(mode) {
  state.mode = mode;
  state.sessionLabel = '';
  state.index = 0;
  state.xp = 0;
  state.streak = 0;
  state.hearts = 3;
  state.lastWrong = [];
  state.queue = buildStageItems(state, Number(el.sizeSelect.value || 12));
  touchStageStat(state, state.stageSlug, 'seen');
  setString('vi-stage-slug', state.stageSlug);

  if (mode === 'study') {
    activateScreen(el, 'study');
    if (!renderStudy(state, el)) finishMode();
  } else {
    activateScreen(el, 'quiz');
    state.quizStats = { total: 0, correct: 0, byType: {}, byCategory: {} };
    state.queue = buildQuizQueue(state, state.queue);
    renderQuiz(state, el, gradeAnswer);
  }
  updateHud();
  updateProgress();
}

function nextStudyCard(known) {
  const item = state.queue[state.index];
  updateCardMetaAfterStudy(state, item, known);
  if (known) {
    state.xp += 8;
    state.streak += 1;
    touchStageStat(state, state.stageSlug, 'known');
  } else {
    state.streak = 0;
  }
  state.index += 1;
  state.ui.showMeaning = false;
  state.ui.showTips = false;
  if (!renderStudy(state, el)) finishMode();
  updateHud();
  updateProgress();
}

function gradeAnswer(button, picked, quiz) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;
  [...el.quizOptions.children].forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === quiz.answer) btn.classList.add('correct');
  });

  state.quizStats.total += 1;
  state.quizStats.byType[quiz.type] = state.quizStats.byType[quiz.type] || { total: 0, correct: 0 };
  state.quizStats.byCategory[quiz.category] = state.quizStats.byCategory[quiz.category] || { total: 0, correct: 0 };
  state.quizStats.byType[quiz.type].total += 1;
  state.quizStats.byCategory[quiz.category].total += 1;

  if (picked === quiz.answer) {
    updateCardMetaAfterStudy(state, state.cards.find((c) => c.id === quiz.cardId) || { id: quiz.cardId }, true);
    state.xp += 12;
    state.quizStats.correct += 1;
    state.quizStats.byType[quiz.type].correct += 1;
    state.quizStats.byCategory[quiz.category].correct += 1;
    state.streak += 1;
    button.classList.add('correct');
    el.quizFeedback.textContent = '정답!';
  } else {
    updateCardMetaAfterStudy(state, state.cards.find((c) => c.id === quiz.cardId) || { id: quiz.cardId }, false);
    state.hearts -= 1;
    state.streak = 0;
    state.lastWrong.push(quiz);
    if (quiz.cardId && !state.record.wrongCardIds.includes(quiz.cardId)) state.record.wrongCardIds.push(quiz.cardId);
    setJson('vi-wrong-cards', state.record.wrongCardIds);
    button.classList.add('wrong');
    el.quizFeedback.textContent = `오답! 정답: ${quiz.answer}`;
  }

  el.nextQuizBtn.disabled = false;
  updateHud();
}

function nextQuiz() {
  state.index += 1;
  state.quizAnswered = false;
  if (state.index >= state.queue.length || state.hearts <= 0) finishMode();
  else renderQuiz(state, el, gradeAnswer);
  updateProgress();
}

function finishMode() {
  activateScreen(el, 'result');
  const totalAcc = state.quizStats?.total ? Math.round((state.quizStats.correct / state.quizStats.total) * 100) : 0;
  updateDailyRecord(state.mode === 'quiz');
  state.record.totalXp += state.xp;
  state.record.sessions += 1;
  state.record.bestStreak = Math.max(state.record.bestStreak, state.streak);
  persistRecord(state);
  refreshHome();
  renderResult(state, el, `세션 완료 | 이번 XP ${state.xp} | 정답률 ${totalAcc}% | 오답 ${state.lastWrong.length}`);
  el.resultDueBtn.disabled = !buildReviewQueueByDays(state, 1).length;
}

function goHome() {
  state.audio.pause();
  speechSynthesis.cancel();
  state.sessionLabel = '';
  activateScreen(el, 'home');
  refreshHome();
  el.progressLabel.textContent = '시작 준비';
  el.timerLabel.textContent = '⏱️ --';
  el.progressBar.style.width = '0%';
}

function updateDailyRecord(review = false) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.record.lastStudyDate !== today) {
    const prev = state.record.lastStudyDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.record.todayStudy = 0;
    state.record.todayReview = 0;
    state.record.streakDays = prev === yesterday ? state.record.streakDays + 1 : 1;
    state.record.lastStudyDate = today;
  }
  if (review) state.record.todayReview += 1;
  else state.record.todayStudy += 1;
}

function toggleCardStar() {
  const item = state.queue[state.index];
  if (!item?.id) return;
  const meta = getCardMeta(state, item.id);
  upsertCardMeta(state, item.id, { ...meta, starred: !meta.starred });
  renderStudy(state, el);
  renderDashboard(state, el);
  showNotice(meta.starred ? '즐겨찾기에서 제거했습니다.' : '즐겨찾기에 추가했습니다.');
}

function updateHud() {
  el.xp.textContent = state.xp;
  el.streak.textContent = state.streak;
  el.hearts.textContent = state.hearts;
}

function updateProgress() {
  const total = state.queue.length || 1;
  const done = Math.min(state.index, total);
  el.progressBar.style.width = `${Math.floor((done / total) * 100)}%`;
}

function showNotice(message) {
  if (!el.appNotice) return;
  el.appNotice.textContent = message;
  el.appNotice.classList.remove('hidden');
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => el.appNotice.classList.add('hidden'), 1800);
}

function setupOnboarding() {
  if (!el.onboardingDialog) return;
  const done = localStorage.getItem('vi-onboarding-done') === '1';
  if (!done) el.onboardingDialog.showModal();
}

function closeOnboarding() {
  localStorage.setItem('vi-onboarding-done', '1');
  el.onboardingDialog?.close();
}

function setupA11yLabels() {
  document.querySelectorAll('button').forEach((btn) => {
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', btn.textContent.trim());
  });
}
