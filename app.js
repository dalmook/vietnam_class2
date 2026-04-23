const PRIMARY_DATA_FILE = "./data/vietnamese_im1_curriculum_seed.json";
const LEGACY_DATA_FILE = "./vietnamese_a1_lessons_1_6_starter.json";

const LEGACY_CURRICULUM = window.CURRICULUM_DATA || [];

const state = {
  dataSource: "none",
  data: null,
  curriculum: [],
  cards: [],
  stageDecks: {},
  opicTopics: [],
  mode: null,
  queue: [],
  index: 0,
  xp: 0,
  streak: 0,
  hearts: 3,
  timer: null,
  timeLeft: 0,
  quizAnswered: false,
  lastWrong: [],
  stageSlug: null,
  audio: new Audio(),
  record: {
    totalXp: Number(localStorage.getItem("vi-total-xp") || 0),
    sessions: Number(localStorage.getItem("vi-sessions") || 0),
    bestStreak: Number(localStorage.getItem("vi-best-streak") || 0),
    todayStudy: Number(localStorage.getItem("vi-today-study") || 0),
    todayReview: Number(localStorage.getItem("vi-today-review") || 0),
    streakDays: Number(localStorage.getItem("vi-streak-days") || 0),
    lastStudyDate: localStorage.getItem("vi-last-study-date") || "",
    wrongCardIds: JSON.parse(localStorage.getItem("vi-wrong-cards") || "[]"),
  },
  cardMeta: JSON.parse(localStorage.getItem("vi-card-meta") || "{}"),
  stageStats: JSON.parse(localStorage.getItem("vi-stage-stats") || "{}"),
  quizStats: null,
  selectedOpicTopic: null,
  reviewPool: [],
  reviewMode: "wrong",
  sessionLabel: "",
};

const el = {
  sizeSelect: document.getElementById("sizeSelect"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startQuizBtn: document.getElementById("startQuizBtn"),
  quickToday: document.getElementById("quickToday"),
  quickPron: document.getElementById("quickPron"),
  quickWrong: document.getElementById("quickWrong"),
  quickOpic: document.getElementById("quickOpic"),
  quickReview1d: document.getElementById("quickReview1d"),
  quickReview3d: document.getElementById("quickReview3d"),
  quickReview7d: document.getElementById("quickReview7d"),
  quickPronConfusion: document.getElementById("quickPronConfusion"),
  openWrongNote: document.getElementById("openWrongNote"),
  openStarred: document.getElementById("openStarred"),
  openDifficult: document.getElementById("openDifficult"),

  stageChip: document.getElementById("stageChip"),
  stageTitle: document.getElementById("stageTitle"),
  stageGoal: document.getElementById("stageGoal"),
  stageTasks: document.getElementById("stageTasks"),
  savedStats: document.getElementById("savedStats"),
  stageList: document.getElementById("stageList"),
  sumTotal: document.getElementById("sumTotal"),
  sumToday: document.getElementById("sumToday"),
  sumReview: document.getElementById("sumReview"),
  sumStreakDays: document.getElementById("sumStreakDays"),
  sumDueToday: document.getElementById("sumDueToday"),
  sumRecentWrong: document.getElementById("sumRecentWrong"),
  sumPronConfusion: document.getElementById("sumPronConfusion"),

  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  timerLabel: document.getElementById("timerLabel"),

  streak: document.getElementById("streak"),
  xp: document.getElementById("xp"),
  hearts: document.getElementById("hearts"),

  screens: {
    home: document.getElementById("homeScreen"),
    study: document.getElementById("studyScreen"),
    quiz: document.getElementById("quizScreen"),
    result: document.getElementById("resultScreen"),
    opic: document.getElementById("opicScreen"),
    review: document.getElementById("reviewScreen"),
  },

  studyTitle: document.getElementById("studyTitle"),
  flashCard: document.getElementById("flashCard"),
  studyStageName: document.getElementById("studyStageName"),
  studySubtopic: document.getElementById("studySubtopic"),
  studyProgressMeta: document.getElementById("studyProgressMeta"),
  studyRemaining: document.getElementById("studyRemaining"),
  studyReason: document.getElementById("studyReason"),
  studyBody: document.getElementById("studyBody"),
  studyTipsWrap: document.getElementById("studyTipsWrap"),
  speakBtn: document.getElementById("speakBtn"),
  slowSpeakBtn: document.getElementById("slowSpeakBtn"),
  flipBtn: document.getElementById("flipBtn"),
  toggleTipsBtn: document.getElementById("toggleTipsBtn"),
  starBtn: document.getElementById("starBtn"),
  studyHomeBtn: document.getElementById("studyHomeBtn"),
  knownBtn: document.getElementById("knownBtn"),
  againBtn: document.getElementById("againBtn"),

  quizTitle: document.getElementById("quizTitle"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  quizSpeakBtn: document.getElementById("quizSpeakBtn"),
  nextQuizBtn: document.getElementById("nextQuizBtn"),
  quizHomeBtn: document.getElementById("quizHomeBtn"),

  resultText: document.getElementById("resultText"),
  retryBtn: document.getElementById("retryBtn"),
  homeBtn: document.getElementById("homeBtn"),
  resultReviewBtn: document.getElementById("resultReviewBtn"),
  resultDueBtn: document.getElementById("resultDueBtn"),

  opicHomeBtn: document.getElementById("opicHomeBtn"),
  opicTopicList: document.getElementById("opicTopicList"),
  opicDetail: document.getElementById("opicDetail"),
  opicTopicTitle: document.getElementById("opicTopicTitle"),
  opicTopicGuide: document.getElementById("opicTopicGuide"),
  opicCoreExpr: document.getElementById("opicCoreExpr"),
  opicVocabCards: document.getElementById("opicVocabCards"),
  opicSentenceCards: document.getElementById("opicSentenceCards"),
  opicTemplates: document.getElementById("opicTemplates"),
  opicBuilderChips: document.getElementById("opicBuilderChips"),
  opicDraft: document.getElementById("opicDraft"),
  opicBuild30: document.getElementById("opicBuild30"),
  opicBuild60: document.getElementById("opicBuild60"),

  reviewTitle: document.getElementById("reviewTitle"),
  reviewDesc: document.getElementById("reviewDesc"),
  reviewList: document.getElementById("reviewList"),
  reviewHomeBtn: document.getElementById("reviewHomeBtn"),
  reviewStartBtn: document.getElementById("reviewStartBtn"),
  reviewClearBtn: document.getElementById("reviewClearBtn"),
};

state.audio.preload = "none";
state.ui = { showMeaning: false, showTips: false };

init();

async function init() {
  bindEvents();
  await loadLearningData();
  renderSavedStats();
  updateHud();
  activateScreen("home");
}

async function loadLearningData() {
  try {
    const primary = await fetchJson(PRIMARY_DATA_FILE);
    applySeedData(primary);
    state.dataSource = "seed";
  } catch (e) {
    el.progressLabel.textContent = "학습 데이터를 불러오지 못했습니다.";
    el.timerLabel.textContent = "기본 스타터 데이터로 전환합니다.";

    const legacy = await fetchJson(LEGACY_DATA_FILE);
    applyLegacyData(legacy);
    state.dataSource = "legacy";
  }

  state.stageSlug = resolveInitialStageSlug();
  renderStageInfo();
  renderDashboard();
  logDataSummary();
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function applySeedData(seed) {
  state.data = seed;
  state.curriculum = seed.stages || LEGACY_CURRICULUM;
  state.stageDecks = seed.stageDecks || {};
  state.cards = seed.cards || [];
  state.opicTopics = seed.opicTopics || [];
}

function applyLegacyData(legacy) {
  state.data = legacy;
  state.curriculum = LEGACY_CURRICULUM;
  state.stageDecks = {};
  state.opicTopics = [];

  state.cards = (legacy.lessons || []).flatMap((lesson, idx) => {
    const stage = state.curriculum[Math.min(idx, state.curriculum.length - 1)]?.slug || "letters-tones";
    return [
      ...(lesson.vocabCards || []).map((x) => ({
        id: x.id,
        type: idx < 2 ? "pronunciation" : "vocab",
        stageSlug: stage,
        text: x.term,
        meaningKo: x.meaningKo,
        audioSrc: x.audioSrc,
      })),
      ...(lesson.sentenceCards || []).map((x) => ({
        id: x.id,
        type: "sentence",
        stageSlug: stage,
        text: x.textVi,
        meaningKo: x.textKo,
        audioSrc: x.audioSrc,
      })),
    ];
  });
}

function resolveInitialStageSlug() {
  const saved = localStorage.getItem("vi-stage-slug");
  if (saved && state.curriculum.some((c) => c.slug === saved)) return saved;
  const legacyIndex = Number(localStorage.getItem("vi-stage") || 1);
  return state.curriculum[Math.max(0, legacyIndex - 1)]?.slug || state.curriculum[0]?.slug;
}

function getCurrentStage() {
  return state.curriculum.find((s) => s.slug === state.stageSlug) || state.curriculum[0];
}

function getCurrentStageCardPool() {
  touchStageStat(state.stageSlug, "seen");
  const stage = getCurrentStage();
  const deckMeta = state.stageDecks[stage.slug];

  if (deckMeta?.cardIds?.length) {
    const set = new Set(deckMeta.cardIds);
    return state.cards.filter((c) => set.has(c.id));
  }

  return state.cards.filter((c) => c.stageSlug === stage.slug);
}


function isPronunciationPriorityStage() {
  return ["letters-tones", "pronunciation-rules"].includes(state.stageSlug);
}

function bindEvents() {
  el.startStudyBtn.addEventListener("click", () => startMode("study"));
  el.startQuizBtn.addEventListener("click", () => startMode("quiz"));
  el.quickToday.addEventListener("click", () => startMode("study"));
  el.quickPron.addEventListener("click", quickPronReview);
  el.quickWrong.addEventListener("click", quickWrongReview);
  el.quickOpic.addEventListener("click", openOpicMode);
  el.quickReview1d.addEventListener("click", () => quickReviewByDays(1));
  el.quickReview3d.addEventListener("click", () => quickReviewByDays(3));
  el.quickReview7d.addEventListener("click", () => quickReviewByDays(7));
  el.quickPronConfusion.addEventListener("click", quickPronConfusionReview);
  el.openWrongNote.addEventListener("click", () => openReviewNotebook("wrong"));
  el.openStarred.addEventListener("click", () => openReviewNotebook("starred"));
  el.openDifficult.addEventListener("click", () => openReviewNotebook("difficult"));

  el.flipBtn.addEventListener("click", toggleMeaning);
  el.toggleTipsBtn.addEventListener("click", toggleTips);
  el.starBtn.addEventListener("click", toggleCardStar);

  el.speakBtn.addEventListener("click", () => speakCurrent(false));
  el.slowSpeakBtn.addEventListener("click", () => speakCurrent(true));
  el.knownBtn.addEventListener("click", () => nextStudyCard(true));
  el.againBtn.addEventListener("click", () => nextStudyCard(false));
  el.quizSpeakBtn.addEventListener("click", () => speakItem(state.queue[state.index]));
  el.nextQuizBtn.addEventListener("click", nextQuiz);

  el.retryBtn.addEventListener("click", () => startMode(state.mode));
  el.homeBtn.addEventListener("click", goHome);
  el.resultReviewBtn.addEventListener("click", quickWrongReview);
  el.resultDueBtn.addEventListener("click", () => quickReviewByDays(1));
  el.studyHomeBtn.addEventListener("click", goHome);
  el.quizHomeBtn.addEventListener("click", goHome);
  el.opicHomeBtn.addEventListener("click", goHome);
  el.opicBuild30.addEventListener("click", () => buildOpicDraft(30));
  el.opicBuild60.addEventListener("click", () => buildOpicDraft(60));
  el.reviewHomeBtn.addEventListener("click", goHome);
  el.reviewStartBtn.addEventListener("click", startSelectedReview);
  el.reviewClearBtn.addEventListener("click", clearReviewMetaForCurrentPool);
}

function quickPronReview() {
  const target = state.curriculum.find((s) => ["letters-tones", "pronunciation-rules"].includes(s.slug) && stageCompletion(s.slug) < 100) || state.curriculum[0];
  state.stageSlug = target.slug;
  startMode("study");
}

function quickWrongReview() {
  const set = new Set(state.record.wrongCardIds);
  const items = state.cards.filter((c) => set.has(c.id));
  startReviewSession(items, "오답 복습");
}

function quickReviewByDays(days) {
  const queue = buildReviewQueueByDays(days);
  startReviewSession(queue, `${days}일 복습`);
}

function quickPronConfusionReview() {
  const groups = getPronConfusionGroups();
  const ids = groups.flatMap(([, cards]) => cards.map((c) => c.id));
  const set = new Set(ids);
  const queue = state.cards.filter((c) => set.has(c.id));
  startReviewSession(queue, "헷갈리는 소리 복습");
}

function startReviewSession(items, label = "복습") {
  if (!items.length) return;
  state.mode = "study";
  state.sessionLabel = label;
  state.index = 0;
  state.streak = 0;
  state.hearts = 3;
  state.lastWrong = [];
  state.queue = shuffle(items).slice(0, Number(el.sizeSelect.value || 12));
  updateDailyRecord(true);
  activateScreen("study");
  renderStudy();
  updateProgress();
  updateHud();
}

function openReviewNotebook(mode) {
  state.reviewMode = mode;
  state.reviewPool = getReviewPool(mode);
  el.reviewTitle.textContent = mode === "wrong" ? "오답노트" : mode === "starred" ? "Starred 카드" : "어려운 카드";
  el.reviewDesc.textContent = `총 ${state.reviewPool.length}개 카드`;
  renderReviewList();
  activateScreen("review");
}

function getReviewPool(mode) {
  if (mode === "starred") {
    return state.cards.filter((card) => getCardMeta(card.id).starred);
  }
  if (mode === "difficult") {
    return state.cards.filter((card) => isDifficultMeta(getCardMeta(card.id)));
  }
  const set = new Set(state.record.wrongCardIds);
  return state.cards.filter((card) => set.has(card.id));
}

function renderReviewList() {
  if (!state.reviewPool.length) {
    el.reviewList.innerHTML = "<p class='muted'>표시할 카드가 없습니다.</p>";
    return;
  }
  el.reviewList.innerHTML = state.reviewPool.map((card) => {
    const meta = getCardMeta(card.id);
    const next = meta.nextReviewAt ? new Date(meta.nextReviewAt).toLocaleDateString() : "-";
    return `<article class="review-item">
      <p><strong>${card.text || card.term || "-"}</strong></p>
      <p class="tiny">${card.meaningKo || "-"}</p>
      <div class="meta-chips">
        <span class="meta-chip">seen ${meta.seen}</span>
        <span class="meta-chip">wrong ${meta.wrongCount}</span>
        <span class="meta-chip">ease ${meta.easeScore.toFixed(2)}</span>
        <span class="meta-chip">next ${next}</span>
      </div>
    </article>`;
  }).join("");
}

function startSelectedReview() {
  startReviewSession(state.reviewPool, "노트 기반 복습");
}

function clearReviewMetaForCurrentPool() {
  state.reviewPool.forEach((card) => {
    const meta = getCardMeta(card.id);
    meta.wrongCount = 0;
    meta.lastWrongAt = null;
    if (state.reviewMode === "starred") meta.starred = false;
    upsertCardMeta(card.id, meta);
  });
  state.record.wrongCardIds = state.record.wrongCardIds.filter((id) => !state.reviewPool.some((c) => c.id === id));
  persistRecord();
  openReviewNotebook(state.reviewMode);
}

function openOpicMode() {
  activateScreen("opic");
  renderOpicTopics();
}


function renderOpicTopics() {
  const fallbackTopics = [
    "자기소개", "집/동네", "가족", "일상 루틴", "취미", "음식/카페", "쇼핑", "시간/약속", "과거 경험"
  ].map((t, i) => ({ id: `topic-${i + 1}`, title: t, slug: t }));

  const topics = state.opicTopics?.length ? state.opicTopics : fallbackTopics;
  el.opicTopicList.innerHTML = topics
    .map((t) => `<button class="topic-btn" data-topic="${t.slug || t.id}">${t.title || t.slug}</button>`)
    .join("");

  [...el.opicTopicList.querySelectorAll(".topic-btn")].forEach((btn) => {
    btn.addEventListener("click", () => selectOpicTopic(btn.dataset.topic));
  });
}

function selectOpicTopic(topicKey) {
  state.selectedOpicTopic = topicKey;
  const topicTitle = (state.opicTopics || []).find((t) => (t.slug || t.id) === topicKey)?.title || topicKey;
  const related = state.cards.filter((c) => c.isOpicCore || c.topicTag === topicKey || (c.type === "opic"));
  const vocab = related.filter((c) => c.type === "vocab").slice(0, 8);
  const sentence = related.filter((c) => c.type === "sentence" || c.type === "opic").slice(0, 8);

  el.opicDetail.classList.remove("hidden");
  el.opicTopicTitle.textContent = `${topicTitle} 말하기`;
  el.opicTopicGuide.textContent = "30초는 핵심 2문장, 60초는 이유/예시까지 확장해 보세요.";

  const expr = [
    "Tôi là ...",
    "Tôi sống ở ...",
    "Tôi thích ... vì ...",
    "Cuối tuần tôi thường ...",
    "Trước đây ... nhưng bây giờ ...",
  ];

  el.opicCoreExpr.innerHTML = expr.map((x) => `<li>${x}</li>`).join("");
  el.opicTemplates.innerHTML = [
    "[도입] Tôi là ... / Tôi sống ở ...",
    "[전개] Tôi thường ... vì ...",
    "[확장] Trước đây ... nhưng bây giờ ...",
  ].map((x) => `<li>${x}</li>`).join("");

  el.opicVocabCards.innerHTML = vocab.map((c) => `<button class="chip" data-text="${escapeHtml(c.text || c.term || "")}">${c.text || c.term}</button>`).join("");
  el.opicSentenceCards.innerHTML = sentence.map((c) => `<button class="chip" data-text="${escapeHtml(c.text || c.term || "")}">${c.text || c.term}</button>`).join("");

  el.opicBuilderChips.innerHTML = [...expr, ...vocab.map((c) => c.text || c.term), ...sentence.map((c) => c.text || c.term)]
    .slice(0, 16)
    .map((txt) => `<button class="chip" data-text="${escapeHtml(txt || "")}">${txt}</button>`)
    .join("");

  [...document.querySelectorAll('.chip')].forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.text || "";
      el.opicDraft.value = `${el.opicDraft.value} ${text}`.trim();
    });
  });
}

function buildOpicDraft(sec) {
  const base30 = "Tôi là ... Tôi sống ở ... Tôi thích ... vì ...";
  const base60 = "Tôi là ... Tôi sống ở ... Vào ngày thường tôi ... Cuối tuần tôi thường ... Trước đây ... nhưng bây giờ ...";
  const text = sec === 30 ? base30 : base60;
  el.opicDraft.value = `${text}

[주제: ${state.selectedOpicTopic || "선택 필요"}]`;
}

function escapeHtml(raw) {
  return String(raw).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderStageInfo() {
  const stage = getCurrentStage();
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug);
  el.stageChip.textContent = `STEP ${idx + 1} · ${stage.id || stage.slug}`;
  el.stageTitle.textContent = stage.title || "학습 단계";
  el.stageGoal.textContent = `${stage.subtitle || ""} · 목표: ${stage.goal || ""}`;
  const tasks = Array.isArray(stage.tasks) ? stage.tasks.join(" / ") : stage.tasks || "-";
  el.stageTasks.textContent = `오늘 미션: ${tasks}`;
  renderStageCards(stage.slug);
  renderDashboard();
}

function renderStageCards(activeSlug) {
  el.stageList.innerHTML = state.curriculum
    .map((s, i) => {
      const stats = getStageStats(s.slug);
      const completion = stageCompletion(s.slug);
      const status = s.slug === activeSlug ? "current" : stats.completed ? "done" : stats.seenCount > 0 ? "in-progress" : "new";
      const recent = stats.lastStudiedAt ? `최근 학습: ${new Date(stats.lastStudiedAt).toLocaleDateString()}` : "최근 학습 없음";
      const cardCount = getStageCardPoolBySlug(s.slug).length;
      return `<button class="stage-card ${status}" data-slug="${s.slug}">
        <div class="stage-head"><span>STEP ${i + 1}</span><span>${completion}%</span></div>
        <h4>${s.title}</h4>
        <p class="sub">${s.subtitle || ""}</p>
        <p class="goal">${s.goal || ""}</p>
        <p class="meta">카드 ${cardCount}개 · 완료율 ${completion}%</p>
        <p class="meta">${recent}</p>
      </button>`;
    })
    .join("");

  [...el.stageList.querySelectorAll(".stage-card")].forEach((btn) => {
    btn.addEventListener("click", () => {
      state.stageSlug = btn.dataset.slug;
      localStorage.setItem("vi-stage-slug", state.stageSlug);
      startMode("study");
    });
  });
}


function getStageCardPoolBySlug(slug) {
  const stage = state.curriculum.find((s) => s.slug === slug);
  if (!stage) return [];
  const deckMeta = state.stageDecks[slug];
  if (deckMeta?.cardIds?.length) {
    const set = new Set(deckMeta.cardIds);
    return state.cards.filter((c) => set.has(c.id));
  }
  return state.cards.filter((c) => c.stageSlug === slug);
}

function getStageStats(slug) {
  return state.stageStats[slug] || { seenCount: 0, knownCount: 0, lastStudiedAt: null, completed: false };
}

function stageCompletion(slug) {
  const stats = getStageStats(slug);
  const total = getStageCardPoolBySlug(slug).length || 1;
  return Math.min(100, Math.floor((stats.knownCount / total) * 100));
}

function touchStageStat(slug, type) {
  const cur = getStageStats(slug);
  if (type === "seen") cur.seenCount += 1;
  if (type === "known") cur.knownCount += 1;
  cur.lastStudiedAt = new Date().toISOString();
  cur.completed = stageCompletion(slug) >= 90;
  state.stageStats[slug] = cur;
  localStorage.setItem("vi-stage-stats", JSON.stringify(state.stageStats));
}

function renderDashboard() {
  el.sumTotal.textContent = String(state.record.sessions);
  el.sumToday.textContent = String(state.record.todayStudy);
  el.sumReview.textContent = String(state.record.todayReview);
  el.sumStreakDays.textContent = String(state.record.streakDays);
  el.sumDueToday.textContent = String(buildReviewQueueByDays(1).length);
  el.sumRecentWrong.textContent = String(
    state.cards.filter((card) => {
      const wrongAt = getCardMeta(card.id).lastWrongAt;
      if (!wrongAt) return false;
      return Date.now() - new Date(wrongAt).getTime() <= 3 * 86400000;
    }).length
  );
  el.sumPronConfusion.textContent = String(getPronConfusionGroups().length);
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

function getCardMeta(cardId) {
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

function upsertCardMeta(cardId, patch) {
  state.cardMeta[cardId] = { ...getCardMeta(cardId), ...patch };
  localStorage.setItem("vi-card-meta", JSON.stringify(state.cardMeta));
}

function computeReviewDays(meta, wrong = false) {
  if (wrong) return 1;
  if (meta.easeScore < 1.4) return 1;
  if (meta.easeScore < 2.1) return 3;
  return 7;
}

function toIsoAfterDays(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function updateCardMetaAfterStudy(card, known) {
  if (!card?.id) return;
  const now = new Date().toISOString();
  const meta = getCardMeta(card.id);
  meta.seen += 1;
  meta.lastSeenAt = now;
  if (known) {
    meta.known += 1;
    meta.easeScore = Math.min(3.0, meta.easeScore + 0.18);
    meta.nextReviewAt = toIsoAfterDays(computeReviewDays(meta, false));
  } else {
    meta.wrongCount += 1;
    meta.lastWrongAt = now;
    meta.easeScore = Math.max(0.8, meta.easeScore - 0.35);
    meta.nextReviewAt = toIsoAfterDays(computeReviewDays(meta, true));
  }
  upsertCardMeta(card.id, meta);
}

function updateCardMetaAfterQuiz(quiz, correct) {
  const cardId = quiz.cardId || quiz.id;
  if (!cardId) return;
  const card = state.cards.find((c) => c.id === cardId);
  updateCardMetaAfterStudy(card || { id: cardId }, correct);
}

function isDifficultMeta(meta) {
  return meta.wrongCount >= 2 || meta.easeScore <= 1.35;
}

function buildReviewQueueByDays(days) {
  const horizon = Date.now() + days * 86400000;
  return state.cards.filter((card) => {
    const meta = getCardMeta(card.id);
    if (!meta.nextReviewAt) return false;
    return new Date(meta.nextReviewAt).getTime() <= horizon;
  });
}

function getPronConfusionGroups() {
  const grouped = new Map();
  state.cards
    .filter((card) => card.minimalPairGroup)
    .forEach((card) => {
      const group = card.minimalPairGroup;
      const bucket = grouped.get(group) || [];
      const meta = getCardMeta(card.id);
      if (meta.wrongCount > 0) {
        bucket.push(card);
        grouped.set(group, bucket);
      }
    });
  return [...grouped.entries()].filter(([, cards]) => cards.length >= 1);
}

function startMode(mode) {
  state.mode = mode;
  state.sessionLabel = "";
  state.index = 0;
  state.streak = 0;
  state.hearts = 3;
  state.lastWrong = [];
  state.queue = buildStageItems();
  localStorage.setItem("vi-stage-slug", state.stageSlug);

  if (mode === "study") {
    activateScreen("study");
    renderStudy();
  } else {
    activateScreen("quiz");
    state.quizStats = { total: 0, correct: 0, byType: {}, byCategory: {} };
    state.queue = buildQuizQueue(state.queue);
    startTimer();
    renderQuiz();
  }
  updateProgress();
  updateHud();
}

function buildStageItems() {
  const size = Number(el.sizeSelect.value || 12);
  const pool = getCurrentStageCardPool();
  if (!pool.length) return [];

  if (isPronunciationPriorityStage()) {
    const core = pool.filter((c) => c.type === "pronunciation" || c.isPronunciationCore);
    const rest = pool.filter((c) => !core.includes(c));
    return [...shuffle(core), ...shuffle(rest)].slice(0, Math.min(size, pool.length));
  }

  return shuffle(pool).slice(0, Math.min(size, pool.length));
}

function buildQuizQueue(items) {
  const stage = getCurrentStage();
  const plan = getQuizPlanForStage(stage.slug);
  const count = Math.min(items.length, 10);
  const pool = [...items];
  const quizzes = [];

  for (let i = 0; i < count; i += 1) {
    const item = pool[i % pool.length];
    const preferredType = mapSkillTypeToQuizType(item.skillType);
    const type = preferredType && Math.random() < 0.4 ? preferredType : weightedPick(plan);
    const quiz = createQuizByType(type, item, items);
    if (quiz) quizzes.push(quiz);
  }

  return quizzes;
}

function getQuizPlanForStage(slug) {
  if (["letters-tones", "pronunciation-rules"].includes(slug)) {
    return [
      ["listen-spelling", 4],
      ["tone-discrimination", 3],
      ["vi-meaning", 2],
      ["meaning-choice", 1],
    ];
  }

  const mid = [
    ["meaning-choice", 2],
    ["vi-meaning", 2],
    ["fill-blank", 2],
    ["situation-choice", 2],
    ["sentence-arrange", 2],
  ];

  if (["reasons-frequency-emotions", "comparison-experience-time", "opic-im1-speaking", "survival-repair-review"].includes(slug)) {
    return [
      ["pattern-continue", 3],
      ["situation-choice", 3],
      ["sentence-arrange", 2],
      ["fill-blank", 2],
    ];
  }

  return mid;
}

function weightedPick(entries) {
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

function createQuizByType(type, item, all) {
  const term = item.text || item.term || "";
  const meaning = item.meaningKo || "";
  const randomMeanings = shuffle(all.map((c) => c.meaningKo).filter(Boolean)).slice(0, 3);
  const randomTerms = shuffle(all.map((c) => c.text || c.term).filter(Boolean)).slice(0, 3);

  if (type === "meaning-choice") {
    return {
      type,
      prompt: `뜻 고르기: "${meaning}"에 맞는 표현은?`,
      options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4),
      answer: term,
      speakText: term,
      category: categorizeCard(item),
      cardId: item.id,
    };
  }

  if (type === "vi-meaning") {
    return {
      type,
      prompt: `베트남어 보고 뜻 고르기: "${term}"`,
      options: shuffle([meaning, ...randomMeanings.filter((x) => x !== meaning)]).slice(0, 4),
      answer: meaning,
      speakText: term,
      category: categorizeCard(item),
      cardId: item.id,
    };
  }

  if (type === "listen-spelling") {
    return {
      type,
      prompt: `발음 듣고 철자 고르기`,
      options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4),
      answer: term,
      speakText: item.pronounceVi || term,
      category: "pronunciation",
      cardId: item.id,
    };
  }

  if (type === "tone-discrimination") {
    const base = item.minimalPairGroup || term;
    const opts = shuffle([term, ...randomTerms]).slice(0, 4);
    return {
      type,
      prompt: `비슷한 성조/철자 구별하기 (${base})`,
      options: opts,
      answer: term,
      speakText: item.pronounceVi || term,
      category: "pronunciation",
      cardId: item.id,
    };
  }

  if (type === "fill-blank") {
    const sentence = term.includes(" ") ? term : `${term} ${meaning}`;
    const tokens = sentence.split(" ");
    const blankIdx = Math.min(1, tokens.length - 1);
    const answer = tokens[blankIdx] || term;
    tokens[blankIdx] = "____";
    return {
      type,
      prompt: `빈칸 채우기: ${tokens.join(" ")}`,
      options: shuffle([answer, ...randomTerms.filter((x) => x !== answer)]).slice(0, 4),
      answer,
      speakText: sentence,
      category: categorizeCard(item),
      cardId: item.id,
    };
  }

  if (type === "sentence-arrange") {
    const sentence = term.includes(" ") ? term : `${term} ${meaning}`;
    const shuffled = shuffle(sentence.split(" ")).join(" ");
    return {
      type,
      prompt: `문장 배열: ${shuffled}`,
      options: shuffle([sentence, ...randomTerms.map((t) => `${t}`)]).slice(0, 4),
      answer: sentence,
      speakText: sentence,
      category: "sentence",
      cardId: item.id,
    };
  }

  if (type === "pattern-continue") {
    const stem = term.split(" ").slice(0, 2).join(" ") || "Tôi";
    const answer = `${stem} ...`;
    return {
      type,
      prompt: `패턴 이어말하기: "${stem}" 다음으로 가장 자연스러운 것은?`,
      options: shuffle([answer, "Vì vậy...", "Nhưng mà...", "Tôi nghĩ..."]),
      answer,
      speakText: term,
      category: "opic",
      cardId: item.id,
    };
  }

  // situation-choice
  return {
    type: "situation-choice",
    prompt: `상황별 적절한 표현 고르기 (${item.topicTag || "일상"})`,
    options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4),
    answer: term,
    speakText: term,
    category: categorizeCard(item),
    cardId: item.id,
  };
}

function mapSkillTypeToQuizType(skillType) {
  const map = {
    pronunciation: "listen-spelling",
    tone: "tone-discrimination",
    vocab: "meaning-choice",
    sentence: "fill-blank",
    pattern: "pattern-continue",
    situation: "situation-choice",
  };
  return map[(skillType || "").toLowerCase()] || null;
}

function categorizeCard(item) {
  if (item.isOpicCore || item.type === "opic") return "opic";
  if (item.isPronunciationCore || item.type === "pronunciation") return "pronunciation";
  if (item.type === "sentence" || item.skillType === "sentence") return "sentence";
  return "vocab";
}

function toggleMeaning() {
  state.ui.showMeaning = !state.ui.showMeaning;
  renderStudy();
}

function toggleTips() {
  state.ui.showTips = !state.ui.showTips;
  renderStudy();
}

function renderStudy() {
  const item = state.queue[state.index];
  if (!item) return finishMode();

  const stage = getCurrentStage();
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug) + 1;
  const remain = Math.max(0, state.queue.length - (state.index + 1));

  el.studyTitle.textContent = state.sessionLabel ? `학습 카드 · ${state.sessionLabel}` : "학습 카드";
  el.studyStageName.textContent = `현재 단계: STEP ${idx} · ${stage.title}`;
  el.studySubtopic.textContent = `서브주제: ${stage.subtitle || "기초 학습"}`;
  el.studyProgressMeta.textContent = `진행률: ${Math.floor(((state.index + 1) / state.queue.length) * 100)}%`;
  el.studyRemaining.textContent = `남은 카드 수: ${remain}`;

  const reason = getCardReason(item, stage);
  el.studyReason.textContent = reason;

  const type = item.type || "vocab";
  el.studyBody.innerHTML = renderCardByType(item, type, state.ui.showMeaning);

  const tips = getTipsHtml(item, type);
  el.studyTipsWrap.innerHTML = tips;
  el.studyTipsWrap.classList.toggle("hidden", !state.ui.showTips || !tips);

  el.flashCard.classList.add("card-enter");
  setTimeout(() => el.flashCard.classList.remove("card-enter"), 160);

  el.progressLabel.textContent = `STEP ${idx} - ${stage.title}`;
  el.timerLabel.textContent = "⏱️ 자유";
  const meta = getCardMeta(item.id);
  el.starBtn.classList.toggle("starred", Boolean(meta.starred));
  el.starBtn.textContent = meta.starred ? "⭐ Starred" : "☆ Starred";
}

function toggleCardStar() {
  const item = state.queue[state.index];
  if (!item?.id) return;
  const meta = getCardMeta(item.id);
  upsertCardMeta(item.id, { ...meta, starred: !meta.starred });
  renderStudy();
  renderDashboard();
}

function renderCardByType(item, type, showMeaning) {
  const text = item.text || item.term || "";
  const meaning = showMeaning ? `<p class="meaning-block">뜻: ${item.meaningKo || "-"}</p>` : "";

  if (type === "pronunciation") {
    return `
      <p class="term big">${text}</p>
      <div class="info-grid">
        <p>음절: ${item.syllables || "-"}</p>
        <p>성조/IPA: ${(item.toneName || "-")} ${(item.toneMarks ? `(${item.toneMarks})` : "")} / ${item.ipa || "-"}</p>
        <p>한국어 참고 발음: ${item.pronGuideKo || item.pronGuide || getPronounceHint(text, item.pronGuideKo)}</p>
        <p>minimal pairs: ${item.minimalPairGroup || "-"}</p>
      </div>
      ${meaning}
    `;
  }

  if (type === "sentence") {
    return `
      <p class="term">${text}</p>
      ${meaning}
      <p>핵심 패턴: ${item.corePattern || item.pattern || "S + V + O"}</p>
      <p>대체 가능한 단어: ${item.replaceableWords || item.altWords || "핵심명사/동사 바꿔 말하기"}</p>
    `;
  }

  if (type === "opic") {
    return `
      <p class="term">${text}</p>
      ${meaning}
      <p>답변 확장 힌트: ${item.extendHint || "이유 + 예시 + 감정 한 문장 추가"}</p>
      <p>관련 topic: ${item.topic || item.relatedTopic || "OPIc IM1"}</p>
    `;
  }

  return `
    <p class="term">${text}</p>
    ${meaning}
    <p>예문: ${item.example || "-"}</p>
    <p>예문 번역: ${item.exampleKo || item.exampleMeaningKo || "-"}</p>
    <p>자주 붙는 표현: ${item.collocation || "자주 쓰는 결합 표현 학습"}</p>
  `;
}

function getTipsHtml(item, type) {
  if (type === "pronunciation") {
    return `<p>발음 팁: ${item.pronTips || "성조와 길이를 먼저 듣고 따라해 보세요."}</p><p class="assist-note">※ 한국어 참고 발음은 보조용입니다.</p>`;
  }
  if (type === "opic") {
    return `<p>OPIc 팁: 키워드 3개 + 이유 1개 + 예시 1개로 확장하세요.</p>`;
  }
  return `<p>학습 팁: 소리 → 뜻 → 예문 순서로 2회 반복해 보세요.</p>`;
}

function getCardReason(item, stage) {
  if (item.type === "opic") return "이 카드는 OPIc 답변 확장에 유용해요.";
  if (stage.slug === "numbers-time-date") return "이 카드는 시간 말하기의 기초예요.";
  if (stage.slug === "self-intro-basics") return "이 표현은 자기소개에서 자주 써요.";
  if (item.type === "pronunciation") return item.toneMarks ? "성조 차이를 먼저 들어보세요." : "이 카드는 발음 구분이 중요해요.";
  return "소리→뜻→예문 순서로 익히면 기억이 오래갑니다.";
}

function nextStudyCard(known) {
  const item = state.queue[state.index];
  updateCardMetaAfterStudy(item, known);
  if (known) {
    state.xp += 8;
    state.streak += 1;
    touchStageStat(state.stageSlug, "known");
  } else {
    state.streak = 0;
  }
  state.index += 1;
  state.ui.showMeaning = false;
  state.ui.showTips = false;
  state.index >= state.queue.length ? finishMode() : renderStudy();
  updateProgress();
  updateHud();
}

function renderQuiz() {
  const quiz = state.queue[state.index];
  if (!quiz) return finishMode();

  const stage = getCurrentStage();
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug) + 1;
  el.quizTitle.textContent = `STEP ${idx} 퀴즈 (${state.index + 1}/${state.queue.length})`;
  el.quizQuestion.textContent = `[${quiz.type}] ${quiz.prompt}`;
  el.quizFeedback.textContent = "";
  el.quizOptions.innerHTML = "";
  el.nextQuizBtn.disabled = true;

  quiz.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;
    btn.addEventListener("click", () => gradeAnswer(btn, option, quiz));
    el.quizOptions.appendChild(btn);
  });

  speakItem({ ...quiz, text: quiz.speakText || quiz.answer });
}

function gradeAnswer(button, picked, quiz) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  [...el.quizOptions.children].forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === quiz.answer) btn.classList.add("correct");
  });

  state.quizStats.total += 1;
  state.quizStats.byType[quiz.type] = state.quizStats.byType[quiz.type] || { total: 0, correct: 0 };
  state.quizStats.byCategory[quiz.category] = state.quizStats.byCategory[quiz.category] || { total: 0, correct: 0 };
  state.quizStats.byType[quiz.type].total += 1;
  state.quizStats.byCategory[quiz.category].total += 1;

  if (picked === quiz.answer) {
    updateCardMetaAfterQuiz(quiz, true);
    const currentMeta = getCardMeta(quiz.cardId);
    if (currentMeta.known >= 2) {
      state.record.wrongCardIds = state.record.wrongCardIds.filter((id) => id !== quiz.cardId);
    }
    state.xp += 12;
    state.quizStats.correct += 1;
    state.quizStats.byType[quiz.type].correct += 1;
    state.quizStats.byCategory[quiz.category].correct += 1;
    state.streak += 1;
    button.classList.add("correct");
    el.quizFeedback.textContent = "정답!";
  } else {
    updateCardMetaAfterQuiz(quiz, false);
    state.hearts -= 1;
    state.streak = 0;
    state.lastWrong.push(quiz);
    if (quiz.cardId) {
      if (!state.record.wrongCardIds.includes(quiz.cardId)) state.record.wrongCardIds.push(quiz.cardId);
      localStorage.setItem("vi-wrong-cards", JSON.stringify(state.record.wrongCardIds));
      localStorage.setItem("vi-wrong-meta", JSON.stringify({ cardId: quiz.cardId, quizType: quiz.type, category: quiz.category, at: Date.now() }));
    }
    button.classList.add("wrong");
    el.quizFeedback.textContent = `오답! 정답: ${quiz.answer}`;
  }

  el.nextQuizBtn.disabled = false;
  updateHud();
}

function nextQuiz() {
  state.index += 1;
  state.ui.showMeaning = false;
  state.ui.showTips = false;
  state.quizAnswered = false;
  if (state.index >= state.queue.length || state.hearts <= 0) {
    finishMode();
  } else {
    renderQuiz();
  }
  updateProgress();
}

function startTimer() {
  stopTimer();
  state.timeLeft = Math.max(30, state.queue.length * 6);
  el.timerLabel.textContent = `⏱️ ${state.timeLeft}s`;
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    el.timerLabel.textContent = `⏱️ ${state.timeLeft}s`;
    if (state.timeLeft <= 0) {
      stopTimer();
      finishMode("시간 종료");
    }
  }, 1000);
}

function stopTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function finishMode(reason = "") {
  stopTimer();
  activateScreen("result");
  el.progressBar.style.width = "100%";
  el.progressLabel.textContent = "완료";
  el.timerLabel.textContent = "⏱️ 종료";

  const stage = getCurrentStage();
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug) + 1;
  const status = state.hearts > 0 ? "성공" : "실패";

  updateDailyRecord(state.mode === "quiz");
  state.record.totalXp += state.xp;
  state.record.sessions += 1;
  state.record.bestStreak = Math.max(state.record.bestStreak, state.streak);
  persistRecord();
  renderSavedStats();
  renderStageInfo();
  renderDashboard();

  const totalAcc = state.quizStats?.total ? Math.round((state.quizStats.correct / state.quizStats.total) * 100) : 0;
  const byType = state.quizStats ? Object.entries(state.quizStats.byType).map(([k,v]) => `${k}:${v.total ? Math.round((v.correct/v.total)*100) : 0}%`).join(" / ") : "-";
  const weak = state.quizStats ? Object.entries(state.quizStats.byCategory).sort((a,b)=> (a[1].correct/a[1].total) - (b[1].correct/b[1].total)).slice(0,2).map(([k])=>k).join(", ") : "-";
  el.resultText.textContent = `STEP ${idx}(${stage.slug}) ${status} | 이번 XP ${state.xp} | 총 정답률 ${totalAcc}% | 유형별 ${byType} | 약점 ${weak} | 오답 ${state.lastWrong.length} ${reason}`;
  el.resultReviewBtn.disabled = !state.record.wrongCardIds.length;
  el.resultDueBtn.disabled = !buildReviewQueueByDays(1).length;
}

function goHome() {
  stopTimer();
  state.audio.pause();
  speechSynthesis.cancel();
  activateScreen("home");
  state.sessionLabel = "";
  renderStageInfo();
  renderDashboard();
  el.progressLabel.textContent = "시작 준비";
  el.timerLabel.textContent = "⏱️ --";
  el.progressBar.style.width = "0%";
}

function speakCurrent(slow = false) {
  const item = state.queue[state.index];
  if (item) speakItem(item, slow);
}

function speakItem(item, slow = false) {
  if (!item) return;
  if (item.audioSrc) {
    playAudio(item.audioSrc).catch(() => speakFallback(item, slow));
  } else {
    speakFallback(item, slow);
  }
}

function speakFallback(item, slow = false) {
  if (!("speechSynthesis" in window)) return;
  const voices = speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith("vi-vn")) || voices.find((v) => v.lang.toLowerCase().startsWith("vi"));

  if (!viVoice) {
    el.quizFeedback.textContent = "베트남어 음성(vi-VN)이 없어 발음을 재생할 수 없어요.";
    el.studyTipsWrap.classList.remove("hidden");
    el.studyTipsWrap.innerHTML = `<p>발음 팁: ${getPronounceHint(item.text || item.term, item.pronGuideKo || item.pronGuide)}</p>`;
    return;
  }

  const utter = new SpeechSynthesisUtterance(item.pronounceVi || item.text || item.term);
  utter.voice = viVoice;
  utter.lang = "vi-VN";
  utter.rate = slow ? 0.62 : 0.82;
  utter.pitch = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function getPronounceHint(term, guide) {
  if (guide) return guide;
  const key = (term || "").trim().toLowerCase();
  const map = { tr: "쯔", ph: "프", th: "트", nh: "니", ng: "응", ngh: "응", ch: "ㅉ", gi: "지", kh: "ㅋㅎ", qu: "꾸" };
  if (map[key]) return map[key];
  return key;
}

async function playAudio(src) {
  state.audio.pause();
  state.audio.currentTime = 0;
  state.audio.src = src.startsWith("/") ? `.${src}` : src;
  await state.audio.play();
}

function activateScreen(name) {
  Object.entries(el.screens).forEach(([key, node]) => node.classList.toggle("active", key === name));
}

function updateProgress() {
  const total = state.queue.length || 1;
  const done = Math.min(state.index, total);
  el.progressBar.style.width = `${Math.floor((done / total) * 100)}%`;
}

function updateHud() {
  el.xp.textContent = state.xp;
  el.streak.textContent = state.streak;
  el.hearts.textContent = state.hearts;
}

function persistRecord() {
  localStorage.setItem("vi-total-xp", String(state.record.totalXp));
  localStorage.setItem("vi-sessions", String(state.record.sessions));
  localStorage.setItem("vi-best-streak", String(state.record.bestStreak));
  localStorage.setItem("vi-today-study", String(state.record.todayStudy));
  localStorage.setItem("vi-today-review", String(state.record.todayReview));
  localStorage.setItem("vi-streak-days", String(state.record.streakDays));
  localStorage.setItem("vi-last-study-date", state.record.lastStudyDate);
  localStorage.setItem("vi-wrong-cards", JSON.stringify(state.record.wrongCardIds));
}

function renderSavedStats() {
  el.savedStats.textContent = `기록: 누적 XP ${state.record.totalXp} · 완료 ${state.record.sessions}회 · 최고 스트릭 ${state.record.bestStreak} · 데이터 ${state.dataSource}`;
}

function logDataSummary() {
  const byType = state.cards.reduce(
    (acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    },
    { pronunciation: 0, vocab: 0, sentence: 0, opic: 0 }
  );

  const byStage = state.curriculum.map((stage) => {
    const deck = state.stageDecks[stage.slug];
    const count = deck?.cardIds?.length || state.cards.filter((c) => c.stageSlug === stage.slug).length;
    return [stage.slug, count];
  });

  console.group(`[Vietnam Class] 데이터 로딩 (${state.dataSource})`);
  console.log(`stages: ${state.curriculum.length}`);
  console.log(`cards: ${state.cards.length}`);
  console.log(`pronunciation: ${byType.pronunciation || 0}`);
  console.log(`vocab: ${byType.vocab || 0}`);
  console.log(`sentence: ${byType.sentence || 0}`);
  console.log(`opic: ${byType.opic || 0}`);
  console.table(Object.fromEntries(byStage));
  console.groupEnd();
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
