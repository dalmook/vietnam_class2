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
  stageStats: JSON.parse(localStorage.getItem("vi-stage-stats") || "{}"),
};

const el = {
  sizeSelect: document.getElementById("sizeSelect"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startQuizBtn: document.getElementById("startQuizBtn"),
  quickToday: document.getElementById("quickToday"),
  quickPron: document.getElementById("quickPron"),
  quickWrong: document.getElementById("quickWrong"),
  quickOpic: document.getElementById("quickOpic"),

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
  el.quickOpic.addEventListener("click", quickOpicMode);

  el.flipBtn.addEventListener("click", toggleMeaning);
  el.toggleTipsBtn.addEventListener("click", toggleTips);

  el.speakBtn.addEventListener("click", () => speakCurrent(false));
  el.slowSpeakBtn.addEventListener("click", () => speakCurrent(true));
  el.knownBtn.addEventListener("click", () => nextStudyCard(true));
  el.againBtn.addEventListener("click", () => nextStudyCard(false));
  el.quizSpeakBtn.addEventListener("click", () => speakItem(state.queue[state.index]));
  el.nextQuizBtn.addEventListener("click", nextQuiz);

  el.retryBtn.addEventListener("click", () => startMode(state.mode));
  el.homeBtn.addEventListener("click", goHome);
  el.studyHomeBtn.addEventListener("click", goHome);
  el.quizHomeBtn.addEventListener("click", goHome);
}

function quickPronReview() {
  const target = state.curriculum.find((s) => ["letters-tones", "pronunciation-rules"].includes(s.slug) && stageCompletion(s.slug) < 100) || state.curriculum[0];
  state.stageSlug = target.slug;
  startMode("study");
}

function quickWrongReview() {
  if (!state.record.wrongCardIds.length) return;
  const set = new Set(state.record.wrongCardIds);
  state.queue = state.cards.filter((c) => set.has(c.id)).slice(0, Number(el.sizeSelect.value || 12));
  state.mode = "study";
  updateDailyRecord(true);
  state.index = 0;
  activateScreen("study");
  renderStudy();
  updateProgress();
}

function quickOpicMode() {
  const opicStage = state.curriculum.find((s) => s.slug === "opic-im1-speaking") || state.curriculum[state.curriculum.length - 1];
  state.stageSlug = opicStage.slug;
  startMode("quiz");
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

function startMode(mode) {
  state.mode = mode;
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
  return items.map((item) => {
    const answer = item.meaningKo || "";
    const pool = items.map((x) => x.meaningKo).filter((x) => x && x !== answer);
    return { ...item, answer, options: shuffle([answer, ...shuffle(pool).slice(0, 3)]) };
  });
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

  el.studyTitle.textContent = `학습 카드`;
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
  el.quizQuestion.textContent = `"${quiz.text || quiz.term}" 뜻은?`;
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

  speakItem(quiz);
}

function gradeAnswer(button, picked, quiz) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  [...el.quizOptions.children].forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === quiz.answer) btn.classList.add("correct");
  });

  if (picked === quiz.answer) {
    state.xp += 12;
    state.streak += 1;
    button.classList.add("correct");
    el.quizFeedback.textContent = "정답!";
  } else {
    state.hearts -= 1;
    state.streak = 0;
    state.lastWrong.push(quiz);
    if (quiz.id) {
      if (!state.record.wrongCardIds.includes(quiz.id)) state.record.wrongCardIds.push(quiz.id);
      localStorage.setItem("vi-wrong-cards", JSON.stringify(state.record.wrongCardIds));
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

  el.resultText.textContent = `STEP ${idx}(${stage.slug}) ${status} | 이번 XP ${state.xp} | 누적 XP ${state.record.totalXp} | 오답 ${state.lastWrong.length} ${reason}`;
}

function goHome() {
  stopTimer();
  state.audio.pause();
  speechSynthesis.cancel();
  activateScreen("home");
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
