import { shuffle } from './stage-builder.js';

export function buildQuizQueue(state, items) {
  const stage = state.curriculum.find((s) => s.slug === state.stageSlug) || state.curriculum[0];
  const plan = getQuizPlanForStage(stage.slug);
  const count = Math.min(items.length, 10);
  const quizzes = [];
  for (let i = 0; i < count; i += 1) {
    const item = items[i % items.length];
    const preferred = mapSkillTypeToQuizType(item.skillType);
    const type = preferred && Math.random() < 0.4 ? preferred : weightedPick(plan);
    const quiz = createQuizByType(type, item, items);
    if (quiz) quizzes.push(quiz);
  }
  return quizzes;
}

function getQuizPlanForStage(slug) {
  if (['letters-tones', 'pronunciation-rules'].includes(slug)) {
    return [['listen-spelling', 4], ['tone-discrimination', 3], ['vi-meaning', 2], ['meaning-choice', 1]];
  }
  if (['reasons-frequency-emotions', 'comparison-experience-time', 'opic-im1-speaking', 'survival-repair-review'].includes(slug)) {
    return [['pattern-continue', 3], ['situation-choice', 3], ['sentence-arrange', 2], ['fill-blank', 2]];
  }
  return [['meaning-choice', 2], ['vi-meaning', 2], ['fill-blank', 2], ['situation-choice', 2], ['sentence-arrange', 2]];
}

function weightedPick(entries) {
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

function mapSkillTypeToQuizType(skillType) {
  const map = { pronunciation: 'listen-spelling', tone: 'tone-discrimination', vocab: 'meaning-choice', sentence: 'fill-blank', pattern: 'pattern-continue', situation: 'situation-choice' };
  return map[(skillType || '').toLowerCase()] || null;
}

function categorizeCard(item) {
  if (item.isOpicCore || item.type === 'opic') return 'opic';
  if (item.isPronunciationCore || item.type === 'pronunciation') return 'pronunciation';
  if (item.type === 'sentence' || item.skillType === 'sentence') return 'sentence';
  return 'vocab';
}

function createQuizByType(type, item, all) {
  const term = item.text || item.term || '';
  const meaning = item.meaningKo || '';
  const randomMeanings = shuffle(all.map((c) => c.meaningKo).filter(Boolean)).slice(0, 3);
  const randomTerms = shuffle(all.map((c) => c.text || c.term).filter(Boolean)).slice(0, 3);

  if (type === 'meaning-choice') return { type, prompt: `뜻 고르기: "${meaning}"에 맞는 표현은?`, options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4), answer: term, speakText: term, category: categorizeCard(item), cardId: item.id };
  if (type === 'vi-meaning') return { type, prompt: `베트남어 보고 뜻 고르기: "${term}"`, options: shuffle([meaning, ...randomMeanings.filter((x) => x !== meaning)]).slice(0, 4), answer: meaning, speakText: term, category: categorizeCard(item), cardId: item.id };
  if (type === 'listen-spelling') return { type, prompt: '발음 듣고 철자 고르기', options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4), answer: term, speakText: item.pronounceVi || term, category: 'pronunciation', cardId: item.id };
  if (type === 'tone-discrimination') return { type, prompt: `비슷한 성조/철자 구별하기 (${item.minimalPairGroup || term})`, options: shuffle([term, ...randomTerms]).slice(0, 4), answer: term, speakText: item.pronounceVi || term, category: 'pronunciation', cardId: item.id };

  if (type === 'fill-blank') {
    const sentence = term.includes(' ') ? term : `${term} ${meaning}`;
    const tokens = sentence.split(' ');
    const blankIdx = Math.min(1, tokens.length - 1);
    const answer = tokens[blankIdx] || term;
    tokens[blankIdx] = '____';
    return { type, prompt: `빈칸 채우기: ${tokens.join(' ')}`, options: shuffle([answer, ...randomTerms.filter((x) => x !== answer)]).slice(0, 4), answer, speakText: sentence, category: categorizeCard(item), cardId: item.id };
  }

  if (type === 'sentence-arrange') {
    const sentence = term.includes(' ') ? term : `${term} ${meaning}`;
    return { type, prompt: `문장 배열: ${shuffle(sentence.split(' ')).join(' ')}`, options: shuffle([sentence, ...randomTerms]).slice(0, 4), answer: sentence, speakText: sentence, category: 'sentence', cardId: item.id };
  }

  if (type === 'pattern-continue') {
    const stem = term.split(' ').slice(0, 2).join(' ') || 'Tôi';
    const answer = `${stem} ...`;
    return { type, prompt: `패턴 이어말하기: "${stem}" 다음으로 가장 자연스러운 것은?`, options: shuffle([answer, 'Vì vậy...', 'Nhưng mà...', 'Tôi nghĩ...']), answer, speakText: term, category: 'opic', cardId: item.id };
  }

  return { type: 'situation-choice', prompt: `상황별 적절한 표현 고르기 (${item.topicTag || '일상'})`, options: shuffle([term, ...randomTerms.filter((x) => x !== term)]).slice(0, 4), answer: term, speakText: term, category: categorizeCard(item), cardId: item.id };
}
