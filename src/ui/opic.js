export function renderOpicTopics(state, el, onSelectTopic) {
  const fallbackTopics = ['자기소개', '집/동네', '가족', '일상 루틴', '취미', '음식/카페', '쇼핑', '시간/약속', '과거 경험'].map((t, i) => ({ id: `topic-${i + 1}`, title: t, slug: t }));
  const topics = state.opicTopics?.length ? state.opicTopics : fallbackTopics;
  el.opicTopicList.innerHTML = topics.map((t) => `<button class="topic-btn" data-topic="${t.slug || t.id}">${t.title || t.slug}</button>`).join('');
  [...el.opicTopicList.querySelectorAll('.topic-btn')].forEach((btn) => btn.addEventListener('click', () => onSelectTopic(btn.dataset.topic)));
}

export function renderOpicTopicDetail(state, el, topicKey) {
  const topicTitle = (state.opicTopics || []).find((t) => (t.slug || t.id) === topicKey)?.title || topicKey;
  const related = state.cards.filter((c) => c.isOpicCore || c.topicTag === topicKey || c.type === 'opic');
  const vocab = related.filter((c) => c.type === 'vocab').slice(0, 8);
  const sentence = related.filter((c) => c.type === 'sentence' || c.type === 'opic').slice(0, 8);
  const expr = ['Tôi là ...', 'Tôi sống ở ...', 'Tôi thích ... vì ...', 'Cuối tuần tôi thường ...', 'Trước đây ... nhưng bây giờ ...'];

  el.opicDetail.classList.remove('hidden');
  el.opicTopicTitle.textContent = `${topicTitle} 말하기`;
  el.opicTopicGuide.textContent = '30초는 핵심 2문장, 60초는 이유/예시까지 확장해 보세요.';
  el.opicCoreExpr.innerHTML = expr.map((x) => `<li>${x}</li>`).join('');
  el.opicTemplates.innerHTML = ['[도입] Tôi là ... / Tôi sống ở ...', '[전개] Tôi thường ... vì ...', '[확장] Trước đây ... nhưng bây giờ ...'].map((x) => `<li>${x}</li>`).join('');
  el.opicVocabCards.innerHTML = vocab.map((c) => `<button class="chip" data-text="${escapeHtml(c.text || c.term || '')}">${c.text || c.term}</button>`).join('');
  el.opicSentenceCards.innerHTML = sentence.map((c) => `<button class="chip" data-text="${escapeHtml(c.text || c.term || '')}">${c.text || c.term}</button>`).join('');
  el.opicBuilderChips.innerHTML = [...expr, ...vocab.map((c) => c.text || c.term), ...sentence.map((c) => c.text || c.term)].slice(0, 16).map((txt) => `<button class="chip" data-text="${escapeHtml(txt || '')}">${txt}</button>`).join('');
}

export function bindOpicBuilder(el) {
  [...document.querySelectorAll('.chip')].forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.text || '';
      el.opicDraft.value = `${el.opicDraft.value} ${text}`.trim();
    });
  });
}

export function buildOpicDraft(el, selectedOpicTopic, sec) {
  const base30 = 'Tôi là ... Tôi sống ở ... Tôi thích ... vì ...';
  const base60 = 'Tôi là ... Tôi sống ở ... Vào ngày thường tôi ... Cuối tuần tôi thường ... Trước đây ... nhưng bây giờ ...';
  const text = sec === 30 ? base30 : base60;
  el.opicDraft.value = `${text}\n\n[주제: ${selectedOpicTopic || '선택 필요'}]`;
}

function escapeHtml(raw) {
  return String(raw).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
