import { getCardMeta } from '../core/stage-builder.js';
import { getCurrentStage } from '../core/curriculum.js';

export function renderStudy(state, el) {
  const item = state.queue[state.index];
  if (!item) return false;
  const stage = getCurrentStage(state);
  const idx = state.curriculum.findIndex((c) => c.slug === stage.slug) + 1;
  const remain = Math.max(0, state.queue.length - (state.index + 1));

  el.studyTitle.textContent = state.sessionLabel ? `학습 카드 · ${state.sessionLabel}` : '학습 카드';
  el.studyStageName.textContent = `현재 단계: STEP ${idx} · ${stage.title}`;
  el.studySubtopic.textContent = `서브주제: ${stage.subtitle || '기초 학습'}`;
  el.studyProgressMeta.textContent = `진행률: ${Math.floor(((state.index + 1) / state.queue.length) * 100)}%`;
  el.studyRemaining.textContent = `남은 카드 수: ${remain}`;
  el.studyReason.textContent = getCardReason(item, stage);

  const type = item.type || 'vocab';
  el.studyBody.innerHTML = renderCardByType(item, type, state.ui.showMeaning);
  const tips = getTipsHtml(item, type);
  el.studyTipsWrap.innerHTML = tips;
  el.studyTipsWrap.classList.toggle('hidden', !state.ui.showTips || !tips);

  const meta = getCardMeta(state, item.id);
  el.starBtn.classList.toggle('starred', Boolean(meta.starred));
  el.starBtn.textContent = meta.starred ? '⭐ Starred' : '☆ Starred';
  return true;
}

function renderCardByType(item, type, showMeaning) {
  const text = item.text || item.term || '';
  const meaning = showMeaning ? `<p class="meaning-block">뜻: ${item.meaningKo || '-'}</p>` : '<p class="tiny">뜻은 아래 버튼으로 확인하세요.</p>';
  const pronMeta = `
    <div class="info-grid">
      <p>발음 가이드: ${item.pronGuideKo || item.pronGuide || '-'}</p>
      <p>IPA: ${item.ipa || '-'}</p>
      <p>성조: ${(item.toneName || '-')} ${(item.toneMarks ? `(${item.toneMarks})` : '')}</p>
      <p>음절: ${item.syllables || '-'}</p>
    </div>
  `;
  if (type === 'pronunciation') {
    return `<p class="term big">${text}</p>${pronMeta}${meaning}<details><summary>발음 상세</summary><p>최소대립쌍: ${item.minimalPairGroup || '-'}</p><p>발음 팁: ${item.pronTips || '-'}</p></details>`;
  }
  if (type === 'sentence') return `<p class="term">${text}</p>${pronMeta}${meaning}<details><summary>패턴 힌트</summary><p>${item.corePattern || item.pattern || 'S + V + O'}</p></details>`;
  if (type === 'opic') return `<p class="term">${text}</p>${pronMeta}${meaning}<details><summary>답변 확장 힌트</summary><p>${item.extendHint || '이유 + 예시 + 감정 한 문장 추가'}</p><p>관련 topic: ${item.topicTag || item.topic || '-'}</p></details>`;
  return `<p class="term">${text}</p>${pronMeta}${meaning}<details><summary>예문 / 설명</summary><p>예문: ${item.example || '-'}</p><p>예문 번역: ${item.exampleKo || item.exampleMeaningKo || '-'}</p></details>`;
}

function getTipsHtml(item, type) {
  if (type === 'pronunciation') return `<p>발음 팁: ${item.pronTips || '성조와 길이를 먼저 듣고 따라해 보세요.'}</p><p class="assist-note">※ 한국어 참고 발음은 보조용입니다.</p>`;
  if (type === 'opic') return '<p>OPIc 팁: 키워드 3개 + 이유 1개 + 예시 1개로 확장하세요.</p>';
  return '<p>학습 팁: 소리 → 뜻 → 예문 순서로 2회 반복해 보세요.</p>';
}

function getCardReason(item, stage) {
  if (item.type === 'opic') return '이 카드는 OPIc 답변 확장에 유용해요.';
  if (stage.slug === 'numbers-time-date') return '이 카드는 시간 말하기의 기초예요.';
  if (stage.slug === 'self-intro-basics') return '이 표현은 자기소개에서 자주 써요.';
  if (item.type === 'pronunciation') return item.toneMarks ? '성조 차이를 먼저 들어보세요.' : '이 카드는 발음 구분이 중요해요.';
  return '소리→뜻→예문 순서로 익히면 기억이 오래갑니다.';
}
