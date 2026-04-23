export function renderReviewList(state, el, getCardMeta) {
  if (!state.reviewPool.length) {
    el.reviewList.innerHTML = "<p class='muted'>표시할 카드가 없습니다.</p>";
    return;
  }
  el.reviewList.innerHTML = state.reviewPool.map((card) => {
    const meta = getCardMeta(state, card.id);
    const next = meta.nextReviewAt ? new Date(meta.nextReviewAt).toLocaleDateString() : '-';
    return `<article class="review-item"><p><strong>${card.text || card.term || '-'}</strong></p><p class="tiny">${card.meaningKo || '-'}</p><div class="meta-chips"><span class="meta-chip">seen ${meta.seen}</span><span class="meta-chip">wrong ${meta.wrongCount}</span><span class="meta-chip">ease ${meta.easeScore.toFixed(2)}</span><span class="meta-chip">next ${next}</span></div></article>`;
  }).join('');
}
