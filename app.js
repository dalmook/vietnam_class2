const DATA_FILE = "./vietnamese_a1_lessons_1_6_starter.json";

const state = {
  data: null,
  lesson: null,
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
  audio: new Audio(),
};

state.audio.preload = "none";

const el = {
  lessonSelect: document.getElementById("lessonSelect"),
  sizeSelect: document.getElementById("sizeSelect"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startQuizBtn: document.getElementById("startQuizBtn"),

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
  studyMeaning: document.getElementById("studyMeaning"),
  studyExample: document.getElementById("studyExample"),
  speakBtn: document.getElementById("speakBtn"),
  flipBtn: document.getElementById("flipBtn"),
  knownBtn: document.getElementById("knownBtn"),
  againBtn: document.getElementById("againBtn"),

  quizTitle: document.getElementById("quizTitle"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  quizSpeakBtn: document.getElementById("quizSpeakBtn"),
  nextQuizBtn: document.getElementById("nextQuizBtn"),

  resultText: document.getElementById("resultText"),
  retryBtn: document.getElementById("retryBtn"),
  homeBtn: document.getElementById("homeBtn"),
};

init();

async function init() {
  try {
    const res = await fetch(DATA_FILE);
    state.data = await res.json();
    setupLessons();
    bindEvents();
    updateHud();
    activateScreen("home");
  } catch (error) {
    el.progressLabel.textContent = "JSON 로딩 실패";
    console.error(error);
  }
}

function setupLessons() {
  const lessons = state.data.lessons ?? [];
  el.lessonSelect.innerHTML = lessons
    .map((lesson, idx) => `<option value="${idx}">${lesson.unitLabel} · ${lesson.titleKo}</option>`)
    .join("");

  el.lessonSelect.disabled = false;
  el.startStudyBtn.disabled = false;
  el.startQuizBtn.disabled = false;
}

function bindEvents() {
  el.startStudyBtn.addEventListener("click", () => startMode("study"));
  el.startQuizBtn.addEventListener("click", () => startMode("quiz"));

  el.flipBtn.addEventListener("click", () => {
    el.studyMeaning.classList.toggle("hidden");
    el.flashCard.classList.toggle("flipped", !el.studyMeaning.classList.contains("hidden"));
  });

  el.speakBtn.addEventListener("click", () => speakCurrent());
  el.knownBtn.addEventListener("click", () => nextStudyCard(true));
  el.againBtn.addEventListener("click", () => nextStudyCard(false));

  el.quizSpeakBtn.addEventListener("click", () => {
    const item = state.queue[state.index];
    if (item) speakItem(item);
  });

  el.nextQuizBtn.addEventListener("click", () => {
    state.index += 1;
    state.quizAnswered = false;
    if (state.index >= state.queue.length || state.hearts <= 0) {
      finishMode();
    } else {
      renderQuiz();
    }
    updateProgress();
  });

  el.retryBtn.addEventListener("click", () => startMode(state.mode));
  el.homeBtn.addEventListener("click", () => goHome());
}

function startMode(mode) {
  state.mode = mode;
  state.lesson = (state.data.lessons ?? [])[Number(el.lessonSelect.value || 0)];
  state.index = 0;
  state.streak = 0;
  state.hearts = 3;
  state.lastWrong = [];

  const items = collectItems();
  state.queue = mode === "study" ? items : buildQuizQueue(items);

  if (mode === "study") {
    activateScreen("study");
    renderStudy();
  } else {
    activateScreen("quiz");
    startTimer();
    renderQuiz();
  }

  updateProgress();
  updateHud();
}

function collectItems() {
  const size = Number(el.sizeSelect.value || 16);
  const vocab = state.lesson.vocabCards ?? [];
  const sentence = state.lesson.sentenceCards ?? [];
  return shuffle([...vocab, ...sentence]).slice(0, Math.min(size, vocab.length + sentence.length));
}

function buildQuizQueue(items) {
  return items.map((item) => {
    const answer = item.meaningKo || item.textKo || "";
    const pool = items.map((x) => x.meaningKo || x.textKo).filter((x) => x && x !== answer);
    return { ...item, answer, options: shuffle([answer, ...shuffle(pool).slice(0, 3)]) };
  });
}

function renderStudy() {
  const item = state.queue[state.index];
  if (!item) return finishMode();

  el.studyTitle.textContent = `단어 학습 (${state.index + 1}/${state.queue.length})`;
  el.studyTerm.textContent = item.term || item.textVi || "(없음)";
  el.studyMeaning.textContent = item.meaningKo || item.textKo || "";
  el.studyExample.textContent = item.example ? `예시: ${item.example} · ${item.exampleMeaningKo || ""}` : "";
  el.studyMeaning.classList.add("hidden");
  el.flashCard.classList.remove("flipped");

  el.progressLabel.textContent = "단어 학습 모드";
  el.timerLabel.textContent = "⏱️ 자유";
}

function nextStudyCard(known) {
  const item = state.queue[state.index];
  if (!item) return;

  if (known) {
    state.xp += 8;
    state.streak += 1;
  } else {
    state.streak = 0;
    state.queue.push(item);
  }

  state.index += 1;
  if (state.index >= state.queue.length) {
    finishMode();
  } else {
    renderStudy();
  }

  updateProgress();
  updateHud();
}

function renderQuiz() {
  const quiz = state.queue[state.index];
  if (!quiz) return finishMode();

  el.quizTitle.textContent = `퀴즈 모드 (${state.index + 1}/${state.queue.length})`;
  el.quizQuestion.textContent = `"${quiz.term || quiz.textVi}" 뜻은?`;
  el.quizOptions.innerHTML = "";
  el.quizFeedback.textContent = "";
  el.nextQuizBtn.disabled = true;

  quiz.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;
    btn.addEventListener("click", () => gradeAnswer(btn, option, quiz));
    el.quizOptions.appendChild(btn);
  });

  el.progressLabel.textContent = "퀴즈 모드";
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
    el.quizFeedback.textContent = "정답! +12XP";
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

function startTimer() {
  stopTimer();
  state.timeLeft = Math.max(30, state.queue.length * 7);
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
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function finishMode(reason = "") {
  stopTimer();
  activateScreen("result");
  el.progressBar.style.width = "100%";
  el.progressLabel.textContent = "완료";
  el.timerLabel.textContent = "⏱️ 종료";

  const modeName = state.mode === "study" ? "단어 학습" : "퀴즈";
  const status = state.hearts > 0 ? "성공" : "실패";
  el.resultText.textContent = `${modeName} ${status} | XP ${state.xp} | 오답 ${state.lastWrong.length} ${reason}`;
}

function goHome() {
  stopTimer();
  activateScreen("home");
  el.progressLabel.textContent = "모드 선택";
  el.timerLabel.textContent = "⏱️ --";
  el.progressBar.style.width = "0%";
}

function activateScreen(name) {
  Object.entries(el.screens).forEach(([key, node]) => {
    node.classList.toggle("active", key === name);
  });
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

function speakCurrent() {
  const item = state.queue[state.index];
  if (!item) return;
  speakItem(item);
}

function speakItem(item) {
  const src = item.audioSrc;
  if (src) {
    playAudio(src).catch(() => {
      speakWithSpeechSynthesis(item.term || item.textVi || "");
    });
    return;
  }
  speakWithSpeechSynthesis(item.term || item.textVi || "");
}

async function playAudio(src) {
  state.audio.pause();
  state.audio.currentTime = 0;
  state.audio.src = normalizeAudioPath(src);
  await state.audio.play();
}

function normalizeAudioPath(src) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `.${src}`;
  return src;
}

function speakWithSpeechSynthesis(text) {
  if (!text || !("speechSynthesis" in window)) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "vi-VN";
  utter.rate = 0.82;
  utter.pitch = 1.0;

  const voices = speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.toLowerCase().startsWith("vi-vn") && /natural|neural|premium/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("vi"));

  if (preferred) utter.voice = preferred;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
