export function createElements() {
  return {
    sizeSelect: document.getElementById('sizeSelect'),
    startStudyBtn: document.getElementById('startStudyBtn'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    quickToday: document.getElementById('quickToday'),
    quickPron: document.getElementById('quickPron'),
    quickWrong: document.getElementById('quickWrong'),
    quickOpic: document.getElementById('quickOpic'),
    quickReview1d: document.getElementById('quickReview1d'),
    quickReview3d: document.getElementById('quickReview3d'),
    quickReview7d: document.getElementById('quickReview7d'),
    quickPronConfusion: document.getElementById('quickPronConfusion'),
    openWrongNote: document.getElementById('openWrongNote'),
    openStarred: document.getElementById('openStarred'),
    openDifficult: document.getElementById('openDifficult'),
    stageChip: document.getElementById('stageChip'), stageTitle: document.getElementById('stageTitle'), stageGoal: document.getElementById('stageGoal'), stageTasks: document.getElementById('stageTasks'), savedStats: document.getElementById('savedStats'), stageList: document.getElementById('stageList'),
    sumTotal: document.getElementById('sumTotal'), sumToday: document.getElementById('sumToday'), sumReview: document.getElementById('sumReview'), sumStreakDays: document.getElementById('sumStreakDays'),
    sumDueToday: document.getElementById('sumDueToday'), sumRecentWrong: document.getElementById('sumRecentWrong'), sumPronConfusion: document.getElementById('sumPronConfusion'),
    progressLabel: document.getElementById('progressLabel'), progressBar: document.getElementById('progressBar'), timerLabel: document.getElementById('timerLabel'),
    streak: document.getElementById('streak'), xp: document.getElementById('xp'), hearts: document.getElementById('hearts'),
    screens: { home: document.getElementById('homeScreen'), study: document.getElementById('studyScreen'), quiz: document.getElementById('quizScreen'), result: document.getElementById('resultScreen'), opic: document.getElementById('opicScreen'), review: document.getElementById('reviewScreen') },
    studyTitle: document.getElementById('studyTitle'), flashCard: document.getElementById('flashCard'), studyStageName: document.getElementById('studyStageName'), studySubtopic: document.getElementById('studySubtopic'), studyProgressMeta: document.getElementById('studyProgressMeta'), studyRemaining: document.getElementById('studyRemaining'), studyReason: document.getElementById('studyReason'), studyBody: document.getElementById('studyBody'), studyTipsWrap: document.getElementById('studyTipsWrap'),
    speakBtn: document.getElementById('speakBtn'), slowSpeakBtn: document.getElementById('slowSpeakBtn'), flipBtn: document.getElementById('flipBtn'), toggleTipsBtn: document.getElementById('toggleTipsBtn'), starBtn: document.getElementById('starBtn'), studyHomeBtn: document.getElementById('studyHomeBtn'), knownBtn: document.getElementById('knownBtn'), againBtn: document.getElementById('againBtn'),
    quizTitle: document.getElementById('quizTitle'), quizQuestion: document.getElementById('quizQuestion'), quizOptions: document.getElementById('quizOptions'), quizFeedback: document.getElementById('quizFeedback'), quizSpeakBtn: document.getElementById('quizSpeakBtn'), nextQuizBtn: document.getElementById('nextQuizBtn'), quizHomeBtn: document.getElementById('quizHomeBtn'),
    resultText: document.getElementById('resultText'), retryBtn: document.getElementById('retryBtn'), homeBtn: document.getElementById('homeBtn'), resultReviewBtn: document.getElementById('resultReviewBtn'), resultDueBtn: document.getElementById('resultDueBtn'),
    opicHomeBtn: document.getElementById('opicHomeBtn'), opicTopicList: document.getElementById('opicTopicList'), opicDetail: document.getElementById('opicDetail'), opicTopicTitle: document.getElementById('opicTopicTitle'), opicTopicGuide: document.getElementById('opicTopicGuide'), opicCoreExpr: document.getElementById('opicCoreExpr'), opicVocabCards: document.getElementById('opicVocabCards'), opicSentenceCards: document.getElementById('opicSentenceCards'), opicTemplates: document.getElementById('opicTemplates'), opicBuilderChips: document.getElementById('opicBuilderChips'), opicDraft: document.getElementById('opicDraft'), opicBuild30: document.getElementById('opicBuild30'), opicBuild60: document.getElementById('opicBuild60'),
    reviewTitle: document.getElementById('reviewTitle'), reviewDesc: document.getElementById('reviewDesc'), reviewList: document.getElementById('reviewList'), reviewHomeBtn: document.getElementById('reviewHomeBtn'), reviewStartBtn: document.getElementById('reviewStartBtn'), reviewClearBtn: document.getElementById('reviewClearBtn'),
    appNotice: document.getElementById('appNotice'),
    onboardingDialog: document.getElementById('onboardingDialog'),
    onboardingStartBtn: document.getElementById('onboardingStartBtn'),
    onboardingSkipBtn: document.getElementById('onboardingSkipBtn'),
  };
}

export function activateScreen(el, name) {
  Object.entries(el.screens).forEach(([key, node]) => node.classList.toggle('active', key === name));
}
