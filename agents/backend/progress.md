# 백엔드 역할 가이드 — 청풍 프로젝트

## 핵심 역할
- 데이터베이스 설계
- API 개발
- 레지던스/미션 데이터 관리

## 주요 데이터 모델 (초안)
- **User** — 사용자 정보, 취향 분석 결과
- **Residence** — 레지던스 정보 (위치, 프로그램, 이미지)
- **Mission** — 잠시섬 미션 목록 및 조건
- **MissionRecord** — 사용자별 미션 수행 기록
- **ArtMap** — 기록/전시 데이터

## API 구성 방향
- `GET /residences` — 레지던스 목록 (필터: 지역, 취향)
- `GET /residences/:id` — 레지던스 상세
- `GET /missions` — 미션 목록
- `POST /missions/:id/complete` — 미션 완료 기록
- `GET /artmap` — 아트맵 기록 조회
- `POST /onboarding` — 취향 분석 결과 저장

## 작업 시작 전 체크리스트
- [ ] CLAUDE.md 읽기
- [ ] 연관 API 스펙 프론트엔드와 협의
- [ ] 데이터 모델 변경 시 마이그레이션 확인

## 진행 현황
- [ ] DB 스키마 설계
- [ ] 레지던스 API 개발
- [ ] 미션 API 개발
- [ ] 온보딩 API 개발
- [ ] 아트맵 API 개발

## 메모
