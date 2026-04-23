const DATA_FILE = "./vietnamese_a1_lessons_1_6_starter.json";

const state = {
  data: null,
  lesson: null,
  phase: "idle",
  studyIndex: 0,
  quizIndex: 0,
  score: 0,
  studyItems: [],
  quizItems: [],
};

const el = {
  lessonSelect: document.getElementById("lessonSelect"),
  startBtn: document.getElementById("startBtn"),
  progressLabel: document.getElementById("progressLabel"),
  scoreLabel: document.getElementById("scoreLabel"),
  progressBar: document.getElementById("progressBar"),

  studyCard: document.getElementById("studyCard"),
  cardTitle: document.getElementById("cardTitle"),
  cardTerm: document.getElementById("cardTerm"),
  cardMeaning: document.getElementById("cardMeaning"),
  cardExample: document.getElementById("cardExample"),
  speakBtn: document.getElementById("speakBtn"),
  nextBtn: document.getElementById("nextBtn"),

  quizCard: document.getElementById("quizCard"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizFeedback: document.getElementById("quizFeedback"),
  quizNextBtn: document.getElementById("quizNextBtn"),

  doneCard: document.getElementById("doneCard"),
  doneText: document.getElementById("doneText"),
  restartBtn: document.getElementById("restartBtn"),
};

init();

async function init() {
  try {
    const res = await fetch(DATA_FILE);
    state.data = await res.json();
    setupLessonSelect();
    el.progressLabel.textContent = "레슨을 선택해 주세요.";
  } catch (error) {
    el.progressLabel.textContent = "데이터 로드 실패: JSON 파일 경로를 확인하세요.";
    console.error(error);
  }
}

function setupLessonSelect() {
  const lessons = state.data.lessons ?? [];
  el.lessonSelect.innerHTML = lessons
    .map(
      (lesson, idx) =>
        `<option value="${idx}">${lesson.unitLabel} · ${lesson.titleKo ?? "제목 없음"}</option>`
    )
    .join("");
  el.lessonSelect.disabled = false;
  el.startBtn.disabled = false;
}

el.startBtn.addEventListener("click", () => {
  const idx = Number(el.lessonSelect.value || 0);
  const lessons = state.data.lessons ?? [];
  state.lesson = lessons[idx];
  startLesson();
});

el.nextBtn.addEventListener("click", () => {
  state.studyIndex += 1;
  if (state.studyIndex >= state.studyItems.length) {
    state.phase = "quiz";
    showQuiz();
  } else {
    renderStudyCard();
  }
  updateProgress();
});

el.speakBtn.addEventListener("click", () => {
  const item = state.studyItems[state.studyIndex];
  const text = item.term || item.textVi || "";
  speakVietnamese(text);
});

el.quizNextBtn.addEventListener("click", () => {
  state.quizIndex += 1;
  if (state.quizIndex >= state.quizItems.length) {
    finishLesson();
    return;
  }
  showQuiz();
  updateProgress();
});

el.restartBtn.addEventListener("click", () => {
  startLesson();
});

function startLesson() {
  if (!state.lesson) return;

  state.phase = "study";
  state.studyIndex = 0;
  state.quizIndex = 0;
  state.score = 0;

  const vocab = state.lesson.vocabCards ?? [];
  const tones = state.lesson.sentenceCards ?? [];
  state.studyItems = [...vocab.slice(0, 8), ...tones.slice(0, 4)];
  state.quizItems = buildQuizFromStudyItems(state.studyItems, state.lesson.quizSeeds ?? []);

  showStudy();
  renderStudyCard();
  updateProgress();
}

function showStudy() {
  el.studyCard.classList.remove("hidden");
  el.quizCard.classList.add("hidden");
  el.doneCard.classList.add("hidden");
}

function renderStudyCard() {
  const item = state.studyItems[state.studyIndex];
  if (!item) return;

  el.cardTitle.textContent = `학습 ${state.studyIndex + 1} / ${state.studyItems.length}`;
  el.cardTerm.textContent = item.term || item.textVi || "(단어 없음)";
  el.cardMeaning.textContent = item.meaningKo || item.textKo || "";

  if (item.example) {
    el.cardExample.textContent = `예시: ${item.example} (${item.exampleMeaningKo ?? ""})`;
  } else {
    el.cardExample.textContent = "";
  }

  const speakText = item.term || item.textVi;
  el.speakBtn.disabled = !speakText;
}

function buildQuizFromStudyItems(studyItems, quizSeeds) {
  const pools = studyItems.filter((i) => i.term || i.textVi);
  const shuffled = [...pools].sort(() => Math.random() - 0.5).slice(0, 5);

  return shuffled.map((item, idx) => {
    const term = item.term || item.textVi;
    const correct = item.meaningKo || item.textKo || "정답";
    const distractors = pools
      .filter((p) => (p.meaningKo || p.textKo) && (p.meaningKo || p.textKo) !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((p) => p.meaningKo || p.textKo);

    const options = shuffle([correct, ...distractors]);
    return {
      id: quizSeeds[idx]?.id ?? `custom-${idx}`,
      question: `"${term}"의 뜻은?`,
      answer: correct,
      options,
      speakText: term,
    };
  });
}

function showQuiz() {
  state.phase = "quiz";
  el.studyCard.classList.add("hidden");
  el.quizCard.classList.remove("hidden");
  el.doneCard.classList.add("hidden");

  const quiz = state.quizItems[state.quizIndex];
  el.quizQuestion.textContent = `Q${state.quizIndex + 1}. ${quiz.question}`;
  el.quizOptions.innerHTML = "";
  el.quizFeedback.textContent = "";
  el.quizNextBtn.disabled = true;

  quiz.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => handleAnswer(button, option, quiz));
    el.quizOptions.appendChild(button);
  });

  speakVietnamese(quiz.speakText);
}

function handleAnswer(button, picked, quiz) {
  const isCorrect = picked === quiz.answer;
  const all = [...el.quizOptions.children];

  all.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === quiz.answer) btn.classList.add("correct");
  });

  if (isCorrect) {
    state.score += 10;
    button.classList.add("correct");
    el.quizFeedback.textContent = "정답! 👍";
  } else {
    button.classList.add("wrong");
    el.quizFeedback.textContent = `아쉬워요. 정답: ${quiz.answer}`;
  }

  el.quizNextBtn.disabled = false;
  updateProgress();
}

function finishLesson() {
  state.phase = "done";
  el.studyCard.classList.add("hidden");
  el.quizCard.classList.add("hidden");
  el.doneCard.classList.remove("hidden");
  el.doneText.textContent = `${state.lesson.unitLabel} 완료! 최종 점수: ${state.score}점`;
  el.progressLabel.textContent = "완료";
  el.progressBar.style.width = "100%";
}

function updateProgress() {
  const total = state.studyItems.length + state.quizItems.length;
  const done =
    state.phase === "study"
      ? state.studyIndex
      : state.phase === "quiz"
      ? state.studyItems.length + state.quizIndex
      : total;

  const pct = total ? Math.floor((done / total) * 100) : 0;
  el.progressBar.style.width = `${pct}%`;
  el.scoreLabel.textContent = `점수 ${state.score}`;

  if (state.phase === "study") {
    el.progressLabel.textContent = `학습 중 (${state.studyIndex + 1}/${state.studyItems.length})`;
  } else if (state.phase === "quiz") {
    el.progressLabel.textContent = `퀴즈 중 (${state.quizIndex + 1}/${state.quizItems.length})`;
  }
}

function speakVietnamese(text) {
  if (!text || !("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 0.92;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
