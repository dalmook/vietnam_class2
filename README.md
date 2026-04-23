# vietnam_class2

## 폴더 구조

```text
src/
  main.js
  core/
    state.js
    storage.js
    curriculum.js
    stage-builder.js
    quiz-builder.js
  audio/
    speech.js
    pronunciation.js
  content/
    loaders.js
    legacy-loader.js
  ui/
    home.js
    study.js
    quiz.js
    result.js
    opic.js
    review.js
    components.js
data/
  vietnamese_im1_curriculum_seed.json
  curriculum.js
```

- `main.js`: 앱 초기화/이벤트 바인딩/모드 전환 오케스트레이션.
- `core/*`: 상태, 저장소, 커리큘럼/큐/퀴즈 생성 규칙.
- `content/*`: seed 로더 + legacy fallback 로더.
- `audio/*`: Web Audio/TTS 관련 로직.
- `ui/*`: 화면별 렌더러.

## 데이터 구조

### Seed (`data/vietnamese_im1_curriculum_seed.json`)
- `stages`: 단계 메타(제목/목표/slug)
- `stageDecks`: 단계별 카드 ID 매핑
- `cards`: 카드 원본(pronunciation/vocab/sentence/opic)
- `opicTopics`: OPIc 주제 목록

### LocalStorage 학습 메타
- `vi-card-meta`: 카드별 복습 메타 (`seen`, `known`, `wrongCount`, `starred`, `easeScore`, `lastSeenAt`, `lastWrongAt`, `nextReviewAt`)
- `vi-wrong-cards`: 오답 카드 ID 목록
- `vi-stage-stats`: 단계별 진행 메타
- `vi-*`: XP/세션/스트릭 등 대시보드 메타
- `vi-onboarding-done`: 온보딩 안내 표시 여부

### LocalStorage 키 목록 (정리)
- `vi-total-xp`
- `vi-sessions`
- `vi-best-streak`
- `vi-today-study`
- `vi-today-review`
- `vi-streak-days`
- `vi-last-study-date`
- `vi-wrong-cards`
- `vi-stage-stats`
- `vi-card-meta`
- `vi-stage-slug`
- `vi-onboarding-done`

## 실행 방법

정적 파일 앱이므로 별도 빌드가 필요 없습니다.

```bash
python3 -m http.server 8080
# 또는
npx serve .
```

브라우저에서 `http://localhost:8080` 접속.

## GitHub Pages 주의점

- `index.htm`에서 ES Module 경로는 상대 경로(`./src/main.js` 또는 `src/main.js`)를 유지해야 합니다.
- `file://` 직접 실행 대신 반드시 HTTP 서버 환경에서 테스트하세요(모듈/JSON fetch 제한).
- fallback legacy 파일은 `./data/...` 경로를 우선 시도하고, 기존 루트 경로도 보조로 시도하도록 구현되어 있습니다.
- Pages 리포지토리 하위 경로에서도 동작하도록 `index.htm`의 엔트리 스크립트는 상대 경로(`./src/main.js`)를 사용합니다.

## QA 체크 포인트
- 모바일(<=720px)에서 버튼 터치영역(44px+)과 화면 스크롤 동작 확인
- seed 로딩 실패 시 legacy fallback 전환 확인
- 음성 미지원 브라우저에서 텍스트 안내 메시지 확인
- 첫 실행 온보딩(앱 목적/발음 모드/복습 큐) 표시 확인

## 남은 TODO
- E2E 테스트(Playwright) 추가
- 스크린 리더 문구를 화면별로 더 세분화
- 퀴즈/복습 empty state에 일러스트 및 가이드 CTA 추가
- 다크모드 테마 지원
