# 2026-06-05 — 이주 리포트 시네마틱 엔딩 시퀀스

## 한 줄
마지막 일차 의식 직후 잠금 해제되는 4슬라이드 풀스크린 시네마틱 엔딩 — Claude API + 정적 폴백 AI 요약 포함.

## 4슬라이드 구성

### Slide 1 — 정보 / 축적 / 관계도
- 🎯 정보: 완료 미션 수
- 💰 축적: totalScore (미션 reward 합산)
- 🤝 관계도: 적합도 % (`calculateMatch` 결과)
- 0 → 최종값 카운트업 (1.2s easeOut cubic)
- 카드별 그라데이션 (오렌지 · 앰버 · 그린)

### Slide 2 — AI 요약 (타이핑)
- `VITE_ANTHROPIC_API_KEY` 있으면 Claude Haiku 4.5 호출
- 없거나 실패 시 정적 템플릿 폴백 (적합도 구간별 메시지)
- 15ms/글자 타이핑 애니메이션
- 캐싱 — 최초 1회만 생성 → RegionRecord에 저장

### Slide 3 — 미션 타임라인
- 완료 순서 기준 + 일차별 그룹 (dayPlan 기반)
- staggered fade-in (120ms 간격)
- Day N 라벨 + 각 미션 카드 (아이콘·제목·카테고리·+점수)
- 스크롤 가능 (미션 많을 때)

### Slide 4 — 컨페티 + 보상 카드
- 24개 SVG 파티클 (5색, 다양한 각도·딜레이로 낙하)
- 보상 카드 spring 등장 (scale 0.8 → 1.0)
- 카드 내용: 🏆 + "이주 준비 완료!" + 미션·점수·관계도 미니 통계
- CTA: "여기로 입주하기 →" (MoveInScreen 연결) / "닫기"

## 데이터 모델

```ts
type MigrationReport = {
  generatedAt: string;
  infoScore: number;
  accumulationScore: number;
  relationshipScore: number;
  aiSummary: string;
  aiSummarySource: "claude" | "template";
  timeline: { missionId: string; day: number }[];
  hasBeenViewed: boolean;
};

// RegionRecord에 추가
migrationReport?: MigrationReport;
```

## 시청 모드 (isFirstView)

- **최초**: 자동 진행 (4.2s/슬라이드), 닫을 때 hasBeenViewed = true
- **재시청**: 자동 진행 X, 좌우 탭/도트 자유 탐색

## 트리거

마지막 일차 의식 화면(`DayEndCeremonyScreen`)의 추천 카드 중 첫 번째를 교체:
- 옛 "📋 이주 결정 리포트 보기" → MigrationReportScreen 의사결정 페이지
- 신 **"🎬 이주 리포트 열기"** → 시네마틱 + Claude 호출 + 캐싱

생성 중에는 카드 아이콘 ⏳ + 로딩 라벨로 변경.

## 재시청 진입점

나의 여정 탭 → 지역 마커 클릭 → 바텀시트:
- 시네마틱 캐시 있으면 **🎬 이주 리포트 다시 보기** (골드→오렌지 그라데이션 버튼)
- 없으면 기존 "📋 이주 리포트 보기" (의사결정 리포트)로 폴백

## Claude API 직접 호출 (브라우저)

데모용으로 `fetch("https://api.anthropic.com/v1/messages")` 직접 호출.
- 헤더에 `anthropic-dangerous-direct-browser-access: true` 추가
- 실제 운영에서는 백엔드 프록시 권장 (키 노출 + CORS + 비용 통제)
- 모델: `claude-haiku-4-5-20251001` (저렴·빠름)

## 프롬프트 요약

```
사용자가 [지역명]에서 가상 이주 시뮬레이션을 마쳤습니다.
완료한 미션 (N개): [목록]
적합도: X/100점

따뜻하고 격려하는 2~3문장 요약. "쌓이다·만나다·상상하다·머무르다" 어휘.
점수·등수 평가가 아니라 회상하는 톤. 1인칭 사용자 시점.
```

## 신규 파일
- `frontend/src/data/migrationReport.ts` — 생성·캐싱·Claude 호출
- `frontend/src/screens/MigrationReportCinematic.tsx` — 4슬라이드 컴포넌트

## 수정 파일
- `frontend/src/data/journey.ts` — RegionRecord에 migrationReport 필드
- `frontend/src/App.tsx` — 라우트·상태·트리거·JourneyScreen 연결
- `frontend/src/screens/JourneyScreen.tsx` — 바텀시트 시네마틱 버튼

## 알아둘 점
- 사진/스크린샷 수집 기능 X → 미션 아이콘 타임라인으로 대체 (spec 예외 조항대로)
- 오프라인 시 캐싱된 요약 사용, 없으면 폴백 텍스트
- 시청 중 닫기 — 첫 시청 완료로 처리 (재시청 시 자유 탐색 모드)
- 옛 의사결정 리포트 페이지(`MigrationReportScreen.tsx`)는 보존 — 추후 통합 검토
