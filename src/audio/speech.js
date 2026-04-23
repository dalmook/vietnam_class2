import { getPronounceHint } from './pronunciation.js';

export async function playAudio(state, src) {
  state.audio.pause();
  state.audio.currentTime = 0;
  state.audio.src = src.startsWith('/') ? `.${src}` : src;
  await state.audio.play();
}

export function speakFallback(item, el, slow = false) {
  if (!('speechSynthesis' in window)) {
    el.quizFeedback.textContent = '이 브라우저는 TTS를 지원하지 않습니다. 텍스트 발음 가이드를 참고해 주세요.';
    return;
  }
  const voices = speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith('vi-vn')) || voices.find((v) => v.lang.toLowerCase().startsWith('vi'));
  if (!viVoice) {
    el.quizFeedback.textContent = '베트남어 음성(vi-VN)이 없어 발음을 재생할 수 없어요.';
    el.studyTipsWrap.classList.remove('hidden');
    el.studyTipsWrap.innerHTML = `<p>발음 팁: ${getPronounceHint(item.text || item.term, item.pronGuideKo || item.pronGuide)}</p>`;
    return;
  }
  const utter = new SpeechSynthesisUtterance(item.pronounceVi || item.text || item.term);
  utter.voice = viVoice;
  utter.lang = 'vi-VN';
  utter.rate = slow ? 0.62 : 0.82;
  utter.pitch = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

export function speakItem(state, el, item, slow = false) {
  if (!item) return;
  if (item.audioSrc) {
    playAudio(state, item.audioSrc).catch(() => speakFallback(item, el, slow));
  } else {
    speakFallback(item, el, slow);
  }
}
