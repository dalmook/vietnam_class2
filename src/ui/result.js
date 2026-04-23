export function renderResult(state, el, text) {
  el.resultText.textContent = text;
  el.resultReviewBtn.disabled = !state.record.wrongCardIds.length;
}
