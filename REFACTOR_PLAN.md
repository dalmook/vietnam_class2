# vietnam_class2 리팩토링 계획서

## 0) 범위와 원칙
- **현재 단계에서는 코드 변경 최소화**: `index.htm`, `app.js`, `styles.css`, JSON 파일은 기능 수정 없이 유지.
- 본 문서는 **분석 + 설계 + TODO 순서**를 정의해, 이후 작업을 작은 커밋으로 분할 가능하게 만드는 것이 목적.

---

## 1) 현재 구조 진단

### 현재 파일 구성
- `index.htm`: 화면(홈/학습/퀴즈/결과) 마크업과 ID 중심 DOM 구조.
- `app.js`: 커리큘럼 데이터, 학습/퀴즈 로직, 오디오/TTS, 저장소(localStorage), UI 렌더링이 단일 파일에 결합.
- `styles.css`: 단일 스타일 파일(레이아웃 + 컴포넌트 + 반응형).
- `vietnamese_a1_lessons_1_6_starter.json`: 레슨 원천 데이터.

### 문제점 요약
1. **Hardcoded `CURRICULUM` / `STAGE_DECKS` 결합도 과다**
   - 데이터(콘텐츠)와 로직이 동일 파일(`app.js`)에 묶여 수정 파급이 큼.
   - 단계 순서 변경, 카드 추가/삭제 시 코드 배포가 필요.
   - 다국어/다중 트랙(여행/시험/실무) 확장 어려움.

2. **JSON lesson 기반 데이터와 단계 커리큘럼이 분리되어 있지 않음**
   - 현재는 `STAGE_DECKS`와 JSON pool을 런타임에 혼합하거나 fallback하는 방식.
   - “학습 경로(커리큘럼)”와 “원천 콘텐츠(lesson data)” 경계가 흐림.
   - 어떤 단계가 어떤 데이터셋을 참조하는지 추적/테스트 어려움.

3. **발음 구조 정확도 한계**
   - TTS fallback이 환경 의존적이며, 일부 경우 단순 치환/가이드 문구에 의존.
   - `tr` 같은 핵심 자음군은 학습 정확도를 위해 **명시적 발음 리소스/규칙/검증**이 필요.
   - 현재 구조는 음성 엔진 가용성에 따라 경험 편차가 큼.

4. **모바일 UX 개선 여지**
   - 단일 화면 전환 방식은 좋으나, 작은 화면에서 정보 밀도/버튼 배치가 과밀해질 수 있음.
   - 상단 HUD/진행바/카드/선택지 간 우선순위(정보 위계) 정리가 필요.
   - 터치 타겟, safe-area, 스크롤 구역 분리, 피드백 애니메이션 일관화 필요.

5. **상태 저장 구조 단순화 필요**
   - `localStorage` 키가 점차 증가하는데 스키마 버전/마이그레이션 체계가 없음.
   - 세션 상태와 영속 상태(누적 통계/진도)가 명확히 분리되지 않음.

---

## 2) 커리큘럼 개편 설계안

### 목표 학습 흐름 (신규)
**기초 발음 → 생존회화 → 문장 핵심어 → 생활 주제 → OPIc IM1**

### 제안 트랙 구조

#### Track A. 기초 발음
- 자음/복합자음/모음/이중모음/성조 패턴 중심.
- 출력 단위: `phoneme_card`, `tone_pair_card`, `minimal_pair_quiz`.

#### Track B. 생존회화
- 인사/감사/가격/길찾기/요청/이해불가 표현.
- 출력 단위: `survival_phrase_card`, `situation_quiz`.

#### Track C. 문장 핵심어
- 주어·동사·목적어·시간·장소 핵심어 블록.
- 출력 단위: `pattern_build_card`, `word_order_quiz`.

#### Track D. 생활 주제
- 자기소개/가족/식당/쇼핑/교통/회사.
- 출력 단위: `topic_vocab_set`, `topic_dialogue_drill`.

#### Track E. OPIc IM1
- 자기소개, 루틴, 선호, 비교, 이유 제시 패턴.
- 출력 단위: `opic_prompt_card`, `response_template_drill`.

### 레벨링 모델
- Track 내부를 `L1~L3` 또는 `Unit 1~N`으로 세분화.
- 완료 조건: 정확도 + 반복 횟수 + 발화 시도(선택) 기준 혼합.

---

## 3) 아키텍처 분리 제안

## 3-1) 데이터 구조 분리
- **원천 데이터**: lesson JSON(`vietnamese_a1_lessons_1_6_starter.json`)은 `/data/raw`로 유지.
- **정규화 데이터**: 앱에서 쓰는 카드 포맷으로 `/data/normalized/*.json` 생성.
- **커리큘럼 맵**: 단계-콘텐츠 매핑을 `/data/curriculum/*.json`에 선언.

예시 스키마:
```json
{
  "id": "trackA-unit1",
  "type": "phoneme_card",
  "term": "tr",
  "pron": {
    "ipa": "ʈ͡ʂ",
    "hint_ko": "쯔/ㅉ 계열",
    "audio": "audio/phoneme/tr.mp3"
  },
  "meaning_ko": "복합자음 tr"
}
```

## 3-2) UI 구조 분리
- 현재 단일 파일 DOM 접근을 모듈화:
  - `screen manager` (화면 전환)
  - `study view renderer`
  - `quiz view renderer`
  - `home/progress component`
- 이벤트 바인딩을 `ui/events.ts(js)`로 분리해 테스트 가능성 향상.

## 3-3) 발음 구조 분리
- `audio service`를 별도 모듈로 분리:
  1. 우선순위: **정식 녹음 mp3 > vi-VN TTS > 명시적 오류 안내**
  2. 단순 한글 치환은 학습 보조 텍스트로만 사용(재생 엔진으로 사용하지 않음)
- 발음 정확도 강화를 위해 카드별 `ipa`, `hint`, `audio` 메타 도입.

## 3-4) 상태 저장 구조 분리
- `session state`(현재 문제 인덱스/하트/타이머)와
  `persistent state`(누적 XP, 단계 진척, 복습 큐) 분리.
- 저장 스키마 버전 도입:
```json
{
  "version": 1,
  "profile": {"totalXp": 1200, "bestStreak": 19},
  "progress": {"trackA": "unit3", "trackB": "unit2"},
  "reviewQueue": ["card-123", "card-456"]
}
```

---

## 4) 제안 폴더 구조

```text
/data
  /raw
    vietnamese_a1_lessons_1_6_starter.json
  /normalized
    cards.pronunciation.json
    cards.survival.json
    cards.topics.json
  /curriculum
    tracks.json
    trackA.pronunciation.json
    trackB.survival.json

/src
  /core
    state.js
    storage.js
    scheduler.js
    router.js
  /ui
    screens.js
    study-view.js
    quiz-view.js
    components.js
  /audio
    player.js
    tts.js
    pronunciation-service.js
  /content
    curriculum-loader.js
    card-repository.js
    normalizer.js
```

---

## 5) 모바일 UX 개선 포인트

1. **정보 위계 재배치**
   - HUD 축소 + 핵심 카드 영역 확대.
   - 진행률/타이머는 보조 영역으로 통합.

2. **터치 UX 최적화**
   - 주요 버튼 높이 최소 44px 이상.
   - 카드 flip/next 동작 제스처 충돌 방지.

3. **화면 밀도 제어**
   - 작은 기기에서 버튼 2열→1열 자동 전환.
   - 선택지 길이 긴 경우 줄바꿈/간격 표준화.

4. **피드백 일관화**
   - 정답/오답/시간초과 애니메이션 규칙 통일.
   - 오디오 재생 실패 시 안내 메시지 위치 고정.

5. **안전영역 대응 강화**
   - `safe-area-inset` 일관 적용.
   - 하단 버튼 가림 방지(특히 Android/iOS 브라우저 UI).

---

## 6) 커밋 단위 TODO 순서(작게 나누기)

### Phase 1: 기반 분리
1. `feat: add /src skeleton and move state/storage modules`
2. `feat: introduce schema versioned storage wrapper`
3. `refactor: extract screen router and ui renderers`

### Phase 2: 데이터 정규화
4. `feat: add /data/raw and /data/normalized structure`
5. `feat: implement content normalizer from lesson json`
6. `feat: add curriculum mapping files for 5-track flow`

### Phase 3: 발음 구조 개선
7. `feat: add audio pronunciation service (mp3 > vi-TTS > error)`
8. `feat: add ipa/hint/audio metadata to pronunciation cards`
9. `fix: remove pronunciation logic from view layer`

### Phase 4: 학습/퀴즈 로직 정리
10. `refactor: split study engine and quiz engine`
11. `feat: add review queue and spaced repetition hooks`
12. `fix: progress counting consistency and stage completion rules`

### Phase 5: 모바일 UX
13. `feat: responsive layout pass for small devices`
14. `feat: unify feedback/toast/animation patterns`
15. `chore: accessibility labels and touch target audit`

### Phase 6: OPIc IM1 확장
16. `feat: add opic prompt deck + template drills`
17. `feat: add opic-specific progress dashboard`
18. `docs: update README with new architecture and content pipeline`

---

## 7) 리스크 및 대응
- **리스크**: 기존 로직과 신규 모듈 병행 시 중복 코드 발생 가능.
  - 대응: migration branch에서 단계별 feature flag 사용.
- **리스크**: 음성 환경(브라우저/OS) 편차.
  - 대응: mp3 우선 + TTS 가용성 체크 + 명확한 fallback 정책 문서화.
- **리스크**: 데이터 정규화 과정에서 의미 손실.
  - 대응: raw->normalized 매핑 테스트 케이스 추가.

---

## 8) 완료 기준 (Definition of Done)
- 커리큘럼이 5-track 흐름으로 분리되고 JSON 매핑이 파일 기반으로 관리됨.
- `app.js` 단일 거대 파일 해소(도메인별 모듈 분리).
- 발음 로직이 audio service로 통합되고 정확도 저하 fallback 제거.
- 모바일에서 핵심 학습 동선(시작→학습→퀴즈→결과)이 끊김 없이 동작.
- 저장 스키마 버전 및 마이그레이션 정책 확보.
