export function renderQuiz(state, el, onPick) {
  const quiz = state.queue[state.index];
  if (!quiz) return false;
  const stage = state.curriculum.find((c) => c.slug === state.stageSlug) || state.curriculum[0];
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug) + 1;
  el.quizTitle.textContent = `STEP ${idx} 퀴즈 (${state.index + 1}/${state.queue.length})`;
  el.quizQuestion.textContent = `[${quiz.type}] ${quiz.prompt}`;
  el.quizFeedback.textContent = '';
  el.quizOptions.innerHTML = '';
  el.nextQuizBtn.disabled = true;

  quiz.options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;
    btn.addEventListener('click', () => onPick(btn, option, quiz));
    el.quizOptions.appendChild(btn);
  });
  return true;
}
