# vietnam_class2

## Data source priority
앱은 아래 순서로 학습 데이터를 로딩합니다.

1. `data/vietnamese_im1_curriculum_seed.json` (기준 데이터)
2. `vietnamese_a1_lessons_1_6_starter.json` (legacy fallback)

로딩 실패 시 화면에 한국어 안내 문구를 표시한 뒤 fallback 데이터로 전환합니다.
