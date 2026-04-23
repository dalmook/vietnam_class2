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
};

const el = {
  lessonSelect: document.getElementById("lessonSelect"),
  sizeSelect: document.getElementById("sizeSelect"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  startQuizBtn: document.getElementById("startQuizBtn"),
  modeSelect: document.getElementById("modeSelect"),

  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  timerLabel: document.getElementById("timerLabel"),

  streak: document.getElementById("streak"),
  xp: document.getElementById("xp"),
  hearts: document.getElementById("hearts"),

  studyView: document.getElementById("studyView"),
  studyTitle: document.getElementById("studyTitle"),
  flashCard: document.getElementById("flashCard"),
  studyTerm: document.getElementById("studyTerm"),
  studyMeaning: document.getElementById("studyMeaning"),
  studyExample: document.getElementById("studyExample"),
  speakBtn: document.getElementById("speakBtn"),
  flipBtn: document.getElementById("flipBtn"),
  knownBtn: document.getElementById("knownBtn"),
  againBtn: document.getElementById("againBtn"),

  quizView: document.getElementById("quizView"),
  quizTitle: document.getElementById("quizTitle"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  quizSpeakBtn: document.getElementById("quizSpeakBtn"),
  nextQuizBtn: document.getElementById("nextQuizBtn"),

  resultView: document.getElementById("resultView"),
  resultText: document.getElementById("resultText"),
  retryBtn: document.getElementById("retryBtn"),
  homeBtn: document.getElementById("homeBtn"),
};

init();

async function init() {
  try {
    const res = await fetch(DATA_FILE);
    state.data = await res.json();
    initLessonSelector();
    bindEvents();
    updateHud();
  } catch (error) {
    el.progressLabel.textContent = "JSON 로딩 실패. 경로를 확인해 주세요.";
    console.error(error);
  }
}

function bindEvents() {
  el.startStudyBtn.addEventListener("click", () => startMode("study"));
  el.startQuizBtn.addEventListener("click", () => startMode("quiz"));

  el.flipBtn.addEventListener("click", () => {
    el.studyMeaning.classList.toggle("hidden");
    el.flashCard.classList.toggle("flipped", !el.studyMeaning.classList.contains("hidden"));
  });

  el.knownBtn.addEventListener("click", () => nextStudyCard(true));
  el.againBtn.addEventListener("click", () => nextStudyCard(false));
  el.speakBtn.addEventListener("click", () => speakCurrent());

  el.quizSpeakBtn.addEventListener("click", () => {
    const item = state.queue[state.index];
    if (item) speakText(item.term || item.textVi);
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

function initLessonSelector() {
  const lessons = state.data.lessons ?? [];
  el.lessonSelect.innerHTML = lessons
    .map((lesson, idx) => `<option value="${idx}">${lesson.unitLabel} · ${lesson.titleKo}</option>`)
    .join("");

  el.lessonSelect.disabled = false;
  el.startStudyBtn.disabled = false;
  el.startQuizBtn.disabled = false;
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

  showOnly(mode === "study" ? "study" : "quiz");
  if (mode === "study") {
    renderStudy();
  } else {
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
  const mixed = shuffle([...vocab, ...sentence]);
  return mixed.slice(0, Math.min(size, mixed.length));
}

function buildQuizQueue(items) {
  return items.map((item) => {
    const answer = item.meaningKo || item.textKo || "";
    const pool = items
      .map((x) => x.meaningKo || x.textKo)
      .filter((x) => x && x !== answer);
    const options = shuffle([answer, ...shuffle(pool).slice(0, 3)]);
    return { ...item, answer, options };
  });
}

function renderStudy() {
  const item = state.queue[state.index];
  if (!item) return finishMode();

  el.studyTitle.textContent = `단어 학습 (${state.index + 1}/${state.queue.length})`;
  el.studyTerm.textContent = item.term || item.textVi || "(없음)";
  el.studyMeaning.textContent = item.meaningKo || item.textKo || "";
  el.studyMeaning.classList.add("hidden");
  el.flashCard.classList.remove("flipped");
  el.studyExample.textContent = item.example
    ? `예시: ${item.example} · ${item.exampleMeaningKo || ""}`
    : "";
  el.progressLabel.textContent = "학습 모드: 카드 넘기며 익히기";
  el.timerLabel.textContent = "⏱️ 자유 학습";
}

function nextStudyCard(isKnown) {
  const item = state.queue[state.index];
  if (!item) return;

  if (isKnown) {
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
  el.quizQuestion.textContent = `"${quiz.term || quiz.textVi}"의 뜻은?`;
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

  el.progressLabel.textContent = "퀴즈 모드: 제한 시간 내 선택";
  speakText(quiz.term || quiz.textVi);
}

function gradeAnswer(button, picked, quiz) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  const allButtons = [...el.quizOptions.children];
  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === quiz.answer) btn.classList.add("correct");
  });

  if (picked === quiz.answer) {
    state.xp += 12;
    state.streak += 1;
    button.classList.add("correct");
    el.quizFeedback.textContent = "정답! +12 XP";
  } else {
    state.hearts -= 1;
    state.streak = 0;
    state.lastWrong.push(quiz);
    button.classList.add("wrong");
    el.quizFeedback.textContent = `오답! 정답은 "${quiz.answer}"`;
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
  showOnly("result");

  const modeText = state.mode === "study" ? "단어 학습" : "퀴즈";
  const wrongCount = state.lastWrong.length;
  const status = state.hearts > 0 ? "성공" : "하트 소진";
  el.resultText.textContent = `${modeText} 모드 ${status}! XP ${state.xp}, 최고 연속 ${state.streak}, 오답 ${wrongCount}개 ${reason}`;
  el.progressLabel.textContent = "완료! 다른 모드도 도전해보세요.";
  el.timerLabel.textContent = "⏱️ 종료";
  el.progressBar.style.width = "100%";
}

function goHome() {
  stopTimer();
  showOnly("home");
  el.progressLabel.textContent = "모드를 선택해 주세요.";
  el.timerLabel.textContent = "⏱️ --";
  el.progressBar.style.width = "0%";
}

function updateProgress() {
  const total = state.queue.length || 1;
  const done = Math.min(state.index, total);
  const percent = Math.floor((done / total) * 100);
  el.progressBar.style.width = `${percent}%`;
}

function updateHud() {
  el.xp.textContent = state.xp;
  el.streak.textContent = state.streak;
  el.hearts.textContent = state.hearts;
}

function speakCurrent() {
  const item = state.queue[state.index];
  if (!item) return;
  speakText(item.term || item.textVi);
}

function speakText(text) {
  if (!text || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "vi-VN";
  utter.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function showOnly(view) {
  el.modeSelect.classList.toggle("hidden", view !== "home");
  el.studyView.classList.toggle("hidden", view !== "study");
  el.quizView.classList.toggle("hidden", view !== "quiz");
  el.resultView.classList.toggle("hidden", view !== "result");
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
