# 프론트엔드 역할 가이드 — 청풍 프로젝트

## 핵심 역할
- 모바일 웹 구현 (375px 기준 반응형)
- 지도 컴포넌트 개발
- 화면 흐름 구현 (온보딩 → 홈 → 추천 → 미션 → 기록)

## 개발 규칙
- 기준 해상도: 375px (모바일 first)
- 컴포넌트마다 한국어 주석 필수
- 커밋 전 모바일 화면 확인
- 파스텔톤/주황+초록 컬러 시스템 준수 (design/progress.md 참고)

## 컴포넌트 구성 (초안)
- `OnboardingCard` — 취향 분석 질문 카드
- `HomeMap` — 지도 기반 레지던스 탐색
- `ResidenceCard` — 레지던스 추천 카드
- `MissionItem` — 잠시섬 미션 아이템
- `ArtMapGallery` — 기록/아트맵 갤러리
- `BottomNav` — 하단 네비게이션

## 지도 컴포넌트 고려사항
- Kakao Map 또는 Naver Map API 활용 검토
- 레지던스 위치 마커 커스텀 (초록 포인트)
- 모바일 터치 인터랙션 최적화

## 작업 시작 전 체크리스트
- [ ] CLAUDE.md 읽기
- [ ] design/progress.md에서 최신 컬러/톤 확인
- [ ] backend/progress.md에서 API 스펙 확인

## 진행 현황
- [x] 프로젝트 초기 세팅 (Vite + React + TS + Tailwind v3 + Framer Motion)
- [x] 탭1 홈 화면(기본) 구현 — 봇짐 캐릭터, 말풍선, 본 지역 배지, 떠나기 CTA
- [x] 하단 BottomNav (탭2 구조: 홈 / 나의 여정) 구현
- [x] 떠나기 화면 (파스텔 한반도 SVG + 레지던스 마커 3개 + 바텀시트)
- [x] 이동 애니메이션 (점선 화살표 + 봇짐 캐릭터 이동 + 페이드 아웃)
- [x] 지역 도착 화면 (도착 타이틀 + 캐릭터 + 우편함 + 미션 리스트 8개)
- [x] 온보딩 (스플래시 → 본 지역 선택 → 라이프스타일 4지선다 3문항 → 결과)
- [ ] 미션 상세 / 미션 인증 / AI 리포트
- [ ] 탭2 나의 여정 (아트지도, 마커 바텀시트, 이주 리포트)
- [ ] 탭2 나의 여정 (아트지도, 마커 바텀시트, 이주 리포트)

## 메모
- 모바일 프레임 폭 `max-w-[420px]` 적용 — 데스크톱에서도 가운데 정렬되어 미리보기 가능
- 컬러 토큰: `primary`(주황) / `nature`(초록) / `cream`(배경) / `ink`(텍스트)
- **지도 방식**: Kakao Map 대신 파스텔 한반도 SVG 사용 (디자인 톤 일치, API 키 불필요). 추후 Kakao Map 교체 시 `KoreaMap` 컴포넌트만 swap.
- 추천 레지던스 목 데이터: `src/data/residences.ts` (강화도/광양/거제도 3곳)
- 본 지역 좌표: `src/data/regions.ts` (서울 좌표 등록, 추후 온보딩 결과로 확장)
- 우편함 이야기: `src/data/stories.ts` (지역당 1장)
- 잠시섬 미션: `src/data/missions.ts` (PRD 8종, 모든 지역 공통)
- 탭1 라우트: `home` → `departure` → `traveling` → `arrival` (App.tsx에서 관리)
- 미션 카드 클릭은 콘솔 로그 placeholder — 다음 작업에서 미션 상세 화면 연결 필요
- **온보딩 게이트**: `localStorage.cheongpung.onboarding.v1`에 본 지역 + 라이프스타일 저장. 데모 중 다시 보려면 DevTools 콘솔에서 `cheongpung.reset()` 실행.
- 온보딩은 PRD의 간단 버전(4지선다 3문항). 디자인 명세의 풀 3단계(기본정보/가치관/미래그리기)는 추후 확장 가능.
- 본 지역 선택 옵션: 서울/인천/대전/대구/광주/부산 6개 (모두 한반도 SVG에 좌표 매핑됨)
