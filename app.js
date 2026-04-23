const DATA_FILE = "./vietnamese_a1_lessons_1_6_starter.json";

const CURRICULUM = [
  { title: "발음 기초", goal: "알파벳·모음/자음·6성조·끝소리", tasks: "알파벳/자음군(ph, tr, ng, nh) + 성조 듣기" },
  { title: "인사/생존회화", goal: "바로 쓰는 표현 먼저", tasks: "안녕하세요, 감사합니다, 얼마예요?" },
  { title: "숫자·요일·시간", goal: "실생활 핵심 표현", tasks: "1~100, 날짜, 시간, 가격" },
  { title: "기본문장 구조", goal: "S + V + O 틀 익히기", tasks: "저는 ~ 먹어요/좋아해요/가요" },
  { title: "필수 문법", goal: "부정·의문·시제 최소한", tasks: "không, có ... không?, đã/đang/sẽ" },
  { title: "주제 단어", goal: "자기소개~교통", tasks: "주제별 묶음 단어 학습" },
  { title: "문장 만들기", goal: "매일 10문장 만들기", tasks: "배운 단어로 직접 문장 생성" },
  { title: "듣기/쉐도잉", goal: "짧게 듣고 따라 말하기", tasks: "문장 단위 반복/성조 모사" },
  { title: "패턴회화", goal: "핵심 패턴 자동화", tasks: "Tôi muốn..., Tôi đang..., Tôi thích..." },
  { title: "실전 말하기", goal: "1분 말하기", tasks: "자기소개/가족/일과/주문" },
  { title: "짧은 읽기", goal: "메뉴/광고/대화문", tasks: "읽고 해석 + 발음" },
  { title: "목표 분기", goal: "여행/시험/실무", tasks: "목적별 맞춤 학습" },
];

const STAGE_DECKS = {
  1: [
    { term: "tr", meaningKo: "한국어 ㅉ에 가까운 소리", pronGuide: "쯔/ㅉ", pronounceVi: "trờ" },
    { term: "phở", meaningKo: "쌀국수", pronGuide: "퍼", pronounceVi: "phở" },
    { term: "ng", meaningKo: "응/ㅇ 계열 끝소리", pronGuide: "응", pronounceVi: "ng" },
    { term: "nhà", meaningKo: "집", pronGuide: "냐", pronounceVi: "nhà" },
    { term: "má", meaningKo: "어머니(성조 주의)", pronGuide: "마↗", pronounceVi: "má" },
    { term: "mà", meaningKo: "그러나(성조 주의)", pronGuide: "마↘", pronounceVi: "mà" },
  ],
  2: [
    { term: "Xin chào", meaningKo: "안녕하세요", pronGuide: "씬 짜오" },
    { term: "Cảm ơn", meaningKo: "감사합니다", pronGuide: "깜 언" },
    { term: "Bao nhiêu tiền?", meaningKo: "얼마예요?", pronGuide: "바오 니우 띠엔?" },
    { term: "Tôi là người Hàn Quốc", meaningKo: "저는 한국 사람이에요", pronGuide: "또이 라 느어이 한 꾸억" },
    { term: "Nói chậm thôi", meaningKo: "천천히 말해 주세요", pronGuide: "노이 짬 토이" },
    { term: "Tôi không hiểu", meaningKo: "잘 모르겠어요", pronGuide: "또이 콩 히우" },
  ],
  3: [
    { term: "một, hai, ba", meaningKo: "1,2,3", pronGuide: "못, 하이, 바" },
    { term: "Hôm nay", meaningKo: "오늘", pronGuide: "홈 나이" },
    { term: "Mấy giờ?", meaningKo: "몇 시예요?", pronGuide: "머이 저?" },
    { term: "Số điện thoại", meaningKo: "전화번호", pronGuide: "소 띠엔 토아이" },
  ],
  4: [
    { term: "Tôi ăn cơm", meaningKo: "저는 밥을 먹어요", pronGuide: "또이 안 껌" },
    { term: "Tôi thích cà phê", meaningKo: "저는 커피를 좋아해요", pronGuide: "또이 틱 까페" },
    { term: "Tôi đi làm hôm nay", meaningKo: "저는 오늘 출근해요", pronGuide: "또이 디 람 홈 나이" },
  ],
  5: [
    { term: "Tôi không đi", meaningKo: "저는 안 가요", pronGuide: "또이 콩 디" },
    { term: "Bạn có khỏe không?", meaningKo: "잘 지내요?", pronGuide: "반 꺼 훼 콩" },
    { term: "Tôi đang học", meaningKo: "저는 공부 중이에요", pronGuide: "또이 당 혹" },
    { term: "Tôi sẽ đi", meaningKo: "저는 갈 거예요", pronGuide: "또이 세 디" },
  ],
};

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
  stageIndex: Number(localStorage.getItem("vi-stage") || 1),
  audio: new Audio(),
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
    bindEvents();
    renderStageInfo();
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
  state.stageIndex = Math.min(12, Math.max(1, state.stageIndex + delta));
  localStorage.setItem("vi-stage", String(state.stageIndex));
  renderStageInfo();
}

function renderStageInfo() {
  const stage = CURRICULUM[state.stageIndex - 1];
  el.stageChip.textContent = `STEP ${state.stageIndex}`;
  el.stageTitle.textContent = stage.title;
  el.stageGoal.textContent = stage.goal;
  el.stageTasks.textContent = `오늘 미션: ${stage.tasks}`;
}

function startMode(mode) {
  state.mode = mode;
  state.index = 0;
  state.streak = 0;
  state.hearts = 3;
  state.lastWrong = [];
  state.queue = buildStageItems();

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
  const stageDeck = STAGE_DECKS[state.stageIndex] ?? [];

  const jsonPool = (state.data.lessons || []).flatMap((lesson) => [
    ...(lesson.vocabCards || []).map((x) => ({ term: x.term, meaningKo: x.meaningKo, example: x.example, exampleMeaningKo: x.exampleMeaningKo, audioSrc: x.audioSrc })),
    ...(lesson.sentenceCards || []).map((x) => ({ term: x.textVi, meaningKo: x.textKo, audioSrc: x.audioSrc })),
  ]);

  const merged = [...stageDeck, ...jsonPool.filter((x) => x.term && x.meaningKo)].slice(0, 120);
  return shuffle(merged).slice(0, Math.min(size, merged.length));
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

  el.studyTitle.textContent = `STEP ${state.stageIndex} 학습 (${state.index + 1}/${state.queue.length})`;
  el.studyTerm.textContent = item.term;
  el.studyPron.textContent = item.pronGuide ? `발음 팁: ${item.pronGuide}` : "";
  el.studyMeaning.textContent = item.meaningKo;
  el.studyExample.textContent = item.example ? `예시: ${item.example} (${item.exampleMeaningKo || ""})` : "";
  el.studyMeaning.classList.add("hidden");
  el.flashCard.classList.remove("flipped");

  el.progressLabel.textContent = `STEP ${state.stageIndex} - ${CURRICULUM[state.stageIndex - 1].title}`;
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
    state.queue.push(current);
  }
  state.index += 1;
  state.index >= state.queue.length ? finishMode() : renderStudy();
  updateProgress();
  updateHud();
}

function renderQuiz() {
  const quiz = state.queue[state.index];
  if (!quiz) return finishMode();

  el.quizTitle.textContent = `STEP ${state.stageIndex} 퀴즈 (${state.index + 1}/${state.queue.length})`;
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
  el.resultText.textContent = `STEP ${state.stageIndex} ${status} | XP ${state.xp} | 오답 ${state.lastWrong.length} ${reason}`;
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
  const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith("vi"));

  const utter = new SpeechSynthesisUtterance();
  if (viVoice) {
    utter.text = item.pronounceVi || item.term;
    utter.voice = viVoice;
    utter.lang = "vi-VN";
  } else {
    utter.text = item.pronGuide || romanizeViToKo(item.term);
    const koVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ko"));
    if (koVoice) utter.voice = koVoice;
    utter.lang = "ko-KR";
  }
  utter.rate = 0.85;
  utter.pitch = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
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

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
