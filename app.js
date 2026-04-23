const DATA_FILE = "./vietnamese_a1_lessons_1_6_starter.json";

const CURRICULUM = window.CURRICULUM_DATA || [];

const STAGE_DECKS = {
  "letters-tones": [
    { term: "b", meaningKo: "단자음", pronGuide: "ㅂ" },
    { term: "c", meaningKo: "단자음", pronGuide: "ㄲ/ㅋ" },
    { term: "d", meaningKo: "단자음", pronGuide: "ㅈ 계열" },
    { term: "đ", meaningKo: "단자음", pronGuide: "ㄷ" },
    { term: "g", meaningKo: "단자음", pronGuide: "ㄱ" },
    { term: "h", meaningKo: "단자음", pronGuide: "ㅎ" },
    { term: "k", meaningKo: "단자음", pronGuide: "ㅋ" },
    { term: "l", meaningKo: "단자음", pronGuide: "ㄹ" },
    { term: "m", meaningKo: "단자음", pronGuide: "ㅁ" },
    { term: "n", meaningKo: "단자음", pronGuide: "ㄴ" },
    { term: "p", meaningKo: "단자음", pronGuide: "ㅍ" },
    { term: "q", meaningKo: "단자음", pronGuide: "꾸" },
    { term: "r", meaningKo: "단자음", pronGuide: "ㄹ/르" },
    { term: "s", meaningKo: "단자음", pronGuide: "ㅅ" },
    { term: "t", meaningKo: "단자음", pronGuide: "ㅌ" },
    { term: "v", meaningKo: "단자음", pronGuide: "ㅂ/브" },
    { term: "x", meaningKo: "단자음", pronGuide: "ㅅ" },
    { term: "ch", meaningKo: "복합자음", pronGuide: "ㅉ" },
    { term: "gh", meaningKo: "복합자음", pronGuide: "ㄱ" },
    { term: "kh", meaningKo: "복합자음", pronGuide: "ㅋㅎ" },
    { term: "ng", meaningKo: "복합자음", pronGuide: "응" },
    { term: "ngh", meaningKo: "복합자음", pronGuide: "응" },
    { term: "nh", meaningKo: "복합자음", pronGuide: "니" },
    { term: "ph", meaningKo: "복합자음", pronGuide: "프" },
    { term: "th", meaningKo: "복합자음", pronGuide: "트" },
    { term: "tr", meaningKo: "복합자음(ㅉ 계열)", pronGuide: "쯔" },
    { term: "a", meaningKo: "단모음", pronGuide: "아" },
    { term: "ă", meaningKo: "단모음", pronGuide: "아(짧게)" },
    { term: "â", meaningKo: "단모음", pronGuide: "어(짧게)" },
    { term: "e", meaningKo: "단모음", pronGuide: "에" },
    { term: "ê", meaningKo: "단모음", pronGuide: "에(닫힘)" },
    { term: "i", meaningKo: "단모음", pronGuide: "이" },
    { term: "y", meaningKo: "단모음", pronGuide: "이" },
    { term: "o", meaningKo: "단모음", pronGuide: "오" },
    { term: "ô", meaningKo: "단모음", pronGuide: "오(닫힘)" },
    { term: "ơ", meaningKo: "단모음", pronGuide: "어" },
    { term: "u", meaningKo: "단모음", pronGuide: "우" },
    { term: "ư", meaningKo: "단모음", pronGuide: "으" },
    { term: "ia / iê / yê", meaningKo: "복모음", pronGuide: "이아/이에" },
    { term: "ưa / ươ", meaningKo: "복모음", pronGuide: "으어" },
    { term: "ua / uô", meaningKo: "복모음", pronGuide: "우어" },
  ],
  "numbers-time-date": [
    { term: "một, hai, ba", meaningKo: "1,2,3", pronGuide: "못, 하이, 바" },
    { term: "Hôm nay", meaningKo: "오늘", pronGuide: "홈 나이" },
    { term: "Mấy giờ?", meaningKo: "몇 시예요?", pronGuide: "머이 저?" },
    { term: "Số điện thoại", meaningKo: "전화번호", pronGuide: "소 띠엔 토아이" },
    { term: "20.000 đồng", meaningKo: "2만동", pronGuide: "하이므어이 응힌 동" },
  ],
  "self-intro-basics": [
    { term: "Tôi ăn cơm", meaningKo: "저는 밥을 먹어요", pronGuide: "또이 안 껌" },
    { term: "Tôi thích cà phê", meaningKo: "저는 커피를 좋아해요", pronGuide: "또이 틱 까페" },
    { term: "Tôi đi làm hôm nay", meaningKo: "저는 오늘 출근해요", pronGuide: "또이 디 람 홈 나이" },
    { term: "Tôi học tiếng Việt", meaningKo: "저는 베트남어를 공부해요", pronGuide: "또이 혹 띠엥 비엣" },
  ],
  "greetings-politeness": [
    { term: "Xin chào", meaningKo: "안녕하세요", pronGuide: "씬 짜오" },
    { term: "Cảm ơn", meaningKo: "감사합니다", pronGuide: "깜 언" },
    { term: "Bao nhiêu tiền?", meaningKo: "얼마예요?", pronGuide: "바오 니우 띠엔?" },
    { term: "Tôi là người Hàn Quốc", meaningKo: "저는 한국 사람이에요", pronGuide: "또이 라 느어이 한 꾸억" },
    { term: "Nói chậm thôi", meaningKo: "천천히 말해 주세요", pronGuide: "노이 짬 토이" },
    { term: "Tôi không hiểu", meaningKo: "잘 모르겠어요", pronGuide: "또이 콩 히우" },
  ],
  "core-pos-location": [
    { term: "Tôi không đi", meaningKo: "저는 안 가요", pronGuide: "또이 콩 디" },
    { term: "Bạn có khỏe không?", meaningKo: "잘 지내요?", pronGuide: "반 꺼 훼 콩" },
    { term: "Tôi đang học", meaningKo: "저는 공부 중이에요", pronGuide: "또이 당 혹" },
    { term: "Tôi sẽ đi", meaningKo: "저는 갈 거예요", pronGuide: "또이 세 디" },
  ],
};


function resolveInitialStageSlug() {
  const savedSlug = localStorage.getItem("vi-stage-slug");
  if (savedSlug && CURRICULUM.some((c) => c.slug === savedSlug)) return savedSlug;

  const legacyIndex = Number(localStorage.getItem("vi-stage") || 1);
  const byLegacy = CURRICULUM[Math.max(0, legacyIndex - 1)];
  return byLegacy?.slug || CURRICULUM[0]?.slug || "letters-tones";
}

function getCurrentStage() {
  return CURRICULUM.find((c) => c.slug === state.stageSlug) || CURRICULUM[0];
}

const state = {
  data: null,
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
  stageSlug: resolveInitialStageSlug(),
  audio: new Audio(),
  record: { totalXp: Number(localStorage.getItem("vi-total-xp") || 0), sessions: Number(localStorage.getItem("vi-sessions") || 0), bestStreak: Number(localStorage.getItem("vi-best-streak") || 0) },
};

state.audio.preload = "none";

const el = {
  sizeSelect: document.getElementById("sizeSelect"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startQuizBtn: document.getElementById("startQuizBtn"),
  prevStageBtn: document.getElementById("prevStageBtn"),
  nextStageBtn: document.getElementById("nextStageBtn"),
  stageChip: document.getElementById("stageChip"),
  stageTitle: document.getElementById("stageTitle"),
  stageGoal: document.getElementById("stageGoal"),
  stageTasks: document.getElementById("stageTasks"),
  savedStats: document.getElementById("savedStats"),
  stageList: document.getElementById("stageList"),

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
  studyTerm: document.getElementById("studyTerm"),
  studyPron: document.getElementById("studyPron"),
  studyMeaning: document.getElementById("studyMeaning"),
  studyExample: document.getElementById("studyExample"),
  speakBtn: document.getElementById("speakBtn"),
  flipBtn: document.getElementById("flipBtn"),
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

init();

async function init() {
  try {
    const res = await fetch(DATA_FILE);
    state.data = await res.json();
    if (!CURRICULUM.length) throw new Error("curriculum data missing");
    bindEvents();
    renderStageInfo();
    renderSavedStats();
    updateHud();
    activateScreen("home");
  } catch (error) {
    el.progressLabel.textContent = "JSON 로딩 실패";
  }
}

function bindEvents() {
  el.startStudyBtn.addEventListener("click", () => startMode("study"));
  el.startQuizBtn.addEventListener("click", () => startMode("quiz"));
  el.prevStageBtn.addEventListener("click", () => moveStage(-1));
  el.nextStageBtn.addEventListener("click", () => moveStage(1));

  el.flipBtn.addEventListener("click", toggleCardMeaning);
  el.flashCard.addEventListener("click", toggleCardMeaning);

  el.speakBtn.addEventListener("click", speakCurrent);
  el.knownBtn.addEventListener("click", () => nextStudyCard(true));
  el.againBtn.addEventListener("click", () => nextStudyCard(false));
  el.quizSpeakBtn.addEventListener("click", () => speakItem(state.queue[state.index]));
  el.nextQuizBtn.addEventListener("click", nextQuiz);

  el.retryBtn.addEventListener("click", () => startMode(state.mode));
  el.homeBtn.addEventListener("click", goHome);
  el.studyHomeBtn.addEventListener("click", goHome);
  el.quizHomeBtn.addEventListener("click", goHome);
}

function moveStage(delta) {
  const currentIndex = Math.max(0, CURRICULUM.findIndex((c) => c.slug === state.stageSlug));
  const nextIndex = Math.min(CURRICULUM.length - 1, Math.max(0, currentIndex + delta));
  state.stageSlug = CURRICULUM[nextIndex].slug;
  localStorage.setItem("vi-stage-slug", state.stageSlug);
  renderStageInfo();
}

function renderStageInfo() {
  const stage = getCurrentStage();
  const currentIndex = CURRICULUM.findIndex((c) => c.slug === stage.slug);
  el.stageChip.textContent = `STEP ${currentIndex + 1} · ${stage.id}`;
  el.stageTitle.textContent = `${stage.title}`;
  el.stageGoal.textContent = `${stage.subtitle} · 목표: ${stage.goal}`;
  el.stageTasks.textContent = `오늘 미션: ${stage.tasks.join(" / ")}`;
  el.prevStageBtn.disabled = currentIndex <= 0;
  el.nextStageBtn.disabled = currentIndex >= CURRICULUM.length - 1;
  renderStageCards(stage.slug);
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
  const stageDeck = STAGE_DECKS[state.stageSlug] ?? [];

  if (stageDeck.length > 0) {
    return shuffle(stageDeck).slice(0, Math.min(size, stageDeck.length));
  }

  const jsonPool = (state.data.lessons || []).flatMap((lesson) => [
    ...(lesson.vocabCards || []).map((x) => ({ term: x.term, meaningKo: x.meaningKo, example: x.example, exampleMeaningKo: x.exampleMeaningKo, audioSrc: x.audioSrc })),
    ...(lesson.sentenceCards || []).map((x) => ({ term: x.textVi, meaningKo: x.textKo, audioSrc: x.audioSrc })),
  ]).filter((x) => x.term && x.meaningKo);

  return shuffle(jsonPool).slice(0, Math.min(size, jsonPool.length));
}

function buildQuizQueue(items) {
  return items.map((item) => {
    const answer = item.meaningKo || "";
    const pool = items.map((x) => x.meaningKo).filter((x) => x && x !== answer);
    return { ...item, answer, options: shuffle([answer, ...shuffle(pool).slice(0, 3)]) };
  });
}

function toggleCardMeaning() {
  el.studyMeaning.classList.toggle("hidden");
  el.flashCard.classList.toggle("flipped", !el.studyMeaning.classList.contains("hidden"));
}

function renderStudy() {
  const item = state.queue[state.index];
  if (!item) return finishMode();

  const stage = getCurrentStage();
  const stageOrder = CURRICULUM.findIndex((c) => c.slug === stage.slug) + 1;
  el.studyTitle.textContent = `STEP ${stageOrder} 학습 (${state.index + 1}/${state.queue.length})`;
  el.studyTerm.textContent = item.term;
  el.studyPron.textContent = item.pronGuide ? `발음 팁: ${item.pronGuide}` : "";
  el.studyMeaning.textContent = item.meaningKo;
  el.studyExample.textContent = item.example ? `예시: ${item.example} (${item.exampleMeaningKo || ""})` : "";
  el.studyMeaning.classList.add("hidden");
  el.flashCard.classList.remove("flipped");

  el.progressLabel.textContent = `STEP ${stageOrder} - ${stage.title}`;
  el.timerLabel.textContent = "⏱️ 자유";
}

function nextStudyCard(known) {
  const current = state.queue[state.index];
  if (!current) return;
  if (known) {
    state.xp += 8;
    state.streak += 1;
  } else {
    state.streak = 0;
  }
  state.index += 1;
  state.index >= state.queue.length ? finishMode() : renderStudy();
  updateProgress();
  updateHud();
}

function renderQuiz() {
  const quiz = state.queue[state.index];
  if (!quiz) return finishMode();

  const stage = getCurrentStage();
  const stageOrder = CURRICULUM.findIndex((c) => c.slug === stage.slug) + 1;
  el.quizTitle.textContent = `STEP ${stageOrder} 퀴즈 (${state.index + 1}/${state.queue.length})`;
  el.quizQuestion.textContent = `"${quiz.term}" 뜻은?`;
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
    button.classList.add("wrong");
    el.quizFeedback.textContent = `오답! 정답: ${quiz.answer}`;
  }

  el.nextQuizBtn.disabled = false;
  updateHud();
}

function nextQuiz() {
  state.index += 1;
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
  const status = state.hearts > 0 ? "성공" : "실패";
  state.record.totalXp += state.xp;
  state.record.sessions += 1;
  state.record.bestStreak = Math.max(state.record.bestStreak, state.streak);
  persistRecord();
  renderSavedStats();
  const stage = getCurrentStage();
  const stageOrder = CURRICULUM.findIndex((c) => c.slug === stage.slug) + 1;
  el.resultText.textContent = `STEP ${stageOrder}(${stage.slug}) ${status} | 이번 XP ${state.xp} | 누적 XP ${state.record.totalXp} | 오답 ${state.lastWrong.length} ${reason}`;
}

function goHome() {
  stopTimer();
  state.audio.pause();
  speechSynthesis.cancel();
  activateScreen("home");
  renderStageInfo();
  el.progressLabel.textContent = "시작 준비";
  el.timerLabel.textContent = "⏱️ --";
  el.progressBar.style.width = "0%";
}

function speakCurrent() {
  const item = state.queue[state.index];
  if (item) speakItem(item);
}

function speakItem(item) {
  if (!item) return;
  if (item.audioSrc) {
    playAudio(item.audioSrc).catch(() => speakFallback(item));
  } else {
    speakFallback(item);
  }
}

function speakFallback(item) {
  if (!("speechSynthesis" in window)) return;
  const voices = speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith("vi-vn")) || voices.find((v) => v.lang.toLowerCase().startsWith("vi"));

  if (!viVoice) {
    el.quizFeedback.textContent = "베트남어 음성(vi-VN)이 없어 발음을 재생할 수 없어요.";
    el.studyPron.textContent = `발음 팁: ${getPronounceHint(item.term, item.pronGuide)}`;
    return;
  }

  const utter = new SpeechSynthesisUtterance(item.pronounceVi || item.term);
  utter.voice = viVoice;
  utter.lang = "vi-VN";
  utter.rate = 0.82;
  utter.pitch = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}


function getPronounceHint(term, guide) {
  if (guide) return guide;
  const key = (term || "").trim().toLowerCase();
  const map = { tr: "쯔", ph: "프", th: "트", nh: "니", ng: "응", ch: "ㅉ", gi: "지", kh: "ㅋㅎ" };
  if (map[key]) return map[key];
  return romanizeViToKo(key);
}

function romanizeViToKo(text) {
  return text
    .toLowerCase()
    .replaceAll("tr", "쯔")
    .replaceAll("ph", "프")
    .replaceAll("th", "트")
    .replaceAll("nh", "니")
    .replaceAll("ng", "응")
    .replaceAll("ch", "ㅉ")
    .replaceAll("đ", "ㄷ")
    .replaceAll("x", "ㅆ")
    .replaceAll("j", "ㅈ")
    .replaceAll("q", "꾸")
    .replaceAll("á", "아")
    .replaceAll("à", "아")
    .replaceAll("ạ", "아")
    .replaceAll("ả", "아")
    .replaceAll("ã", "아");
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



function renderStageCards(activeSlug) {
  if (!el.stageList) return;
  el.stageList.innerHTML = CURRICULUM.map((stage, idx) => {
    const active = stage.slug === activeSlug ? "active" : "";
    return `<button class="stage-pill ${active}" data-slug="${stage.slug}">STEP ${idx + 1} ${stage.title}</button>`;
  }).join("");

  [...el.stageList.querySelectorAll(".stage-pill")].forEach((btn) => {
    btn.addEventListener("click", () => {
      state.stageSlug = btn.dataset.slug;
      localStorage.setItem("vi-stage-slug", state.stageSlug);
      renderStageInfo();
    });
  });
}

function persistRecord() {
  localStorage.setItem("vi-total-xp", String(state.record.totalXp));
  localStorage.setItem("vi-sessions", String(state.record.sessions));
  localStorage.setItem("vi-best-streak", String(state.record.bestStreak));
}

function renderSavedStats() {
  if (!el.savedStats) return;
  el.savedStats.textContent = `기록: 누적 XP ${state.record.totalXp} · 완료 ${state.record.sessions}회 · 최고 스트릭 ${state.record.bestStreak}`;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
