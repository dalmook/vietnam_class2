export function applyLegacyData(state, legacy, legacyCurriculum) {
  state.data = legacy;
  state.curriculum = legacyCurriculum;
  state.stageDecks = {};
  state.opicTopics = [];

  state.cards = (legacy.lessons || []).flatMap((lesson, idx) => {
    const stage = state.curriculum[Math.min(idx, state.curriculum.length - 1)]?.slug || 'letters-tones';
    return [
      ...(lesson.vocabCards || []).map((x) => ({
        id: x.id,
        type: idx < 2 ? 'pronunciation' : 'vocab',
        stageSlug: stage,
        text: x.term,
        meaningKo: x.meaningKo,
        audioSrc: x.audioSrc,
      })),
      ...(lesson.sentenceCards || []).map((x) => ({
        id: x.id,
        type: 'sentence',
        stageSlug: stage,
        text: x.textVi,
        meaningKo: x.textKo,
        audioSrc: x.audioSrc,
      })),
    ];
  });
}
