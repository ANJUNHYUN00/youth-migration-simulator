# 청풍 미션 도착지 — 좌표 / 카카오 로드뷰 커버리지 / 외부 공유링크 통합 시트

> **Phase A·B·D 산출물**. 미션 도착 화면에서 사용하는 모든 도착지 데이터를 한 곳에 모음.
>
> **하이브리드 방식 전제**: 좌표(`lat`/`lng`)로 카카오 `RoadviewClient.getNearestPanoId()` 호출 → 커버리지 있으면(`O`) 카카오 로드뷰 임베드, 없으면(`X`) 사진 캡쳐(`roadviewSteps`) fallback.

## ⚠️ 현재 상태 — 예상 분류

5개 미션의 `roadview_coverage` 값은 **검증되지 않은 예상**입니다. `frontend/public/coverage-check.html`로 실제 검사 후 갱신 필요. 예상이 빗나가면:
- `O → X` 로 바뀐 미션: 사진 캡쳐 대상으로 추가 (`roadview-photo-metadata.md`)
- `X → O` 로 바뀐 미션: `regionMissions.ts`에 `kakaoPosition` 추가, 사진 캡쳐 제외

## 컬럼 설명

| 컬럼 | 설명 |
|---|---|
| `mission_id` | 미션 식별자 (Mission 타입의 `id`) |
| `destination_name` | 도착지 이름 (UI 라벨로도 사용) |
| `lat` / `lng` | 카카오 SDK `getNearestPanoId(new kakao.maps.LatLng(lat, lng), 50)` 에 넘길 좌표. 10진수 6자리. |
| `coords_source` | 좌표 출처 URL — 추측 금지 원칙 |
| `arrivalRoadviewUrl` | 도착 화면의 "🗺️ 실제 로드뷰로 확인해보기" 외부링크 |
| `arrival_url_source` | 위 링크 출처 |
| `roadview_coverage` | `O` = 카카오 임베드 / `X` = 사진 캡쳐. 현재는 모두 **예상값** (검사 후 확정) |
| `notes` | 메모 |

## 마스터 표

| mission_id | destination_name | lat | lng | coords_source | arrivalRoadviewUrl | arrival_url_source | roadview_coverage | notes |
|---|---|---|---|---|---|---|---|---|
| ganghwa-market | 강화풍물시장 | 37.741370 | 126.492831 | [visitkorea 열린관광 길안내 링크](https://access.visitkorea.or.kr/ms/detail.do?cotId=3b7f6ed1-8b09-4cb0-9158-5f9f7db1bd57) | https://kko.to/R4HFdMJL2_ | 카카오맵 | **O** (예상) | 강화읍 시내라 잡힐 가능성 매우 높음 |
| ganghwa-mudflat | 동막해수욕장 | 37.593115 | 126.457175 | [강화군청 관광 페이지 지도보기 링크](https://www.ganghwa.go.kr/open_content/tour/tour/tourInfoDetail.do?tour_seq=111) | | | **O** (예상) | 해안남로 본도로는 잡힐 가능성 ↑. 갯벌 안쪽은 X 가능 |
| yeongwol-stars | 별마로천문대 | 37.198366 | 128.486777 | [visitkorea 열린관광 길안내 링크](https://access.visitkorea.or.kr/ms/detail.do?cotId=74c9e763-fcd3-4548-a370-ced98495ea6b) | | | **X** (예상) | **봉래산 정상 800m 차도 미진입.** X 강력 추정. 사진 캡쳐 대상. 미션 컨셉 재설계 결정 대기 중. |
| taean-sunset | 만리포해수욕장 | 36.786417 | 126.142333 | [위키백과 한국어판 임베드 지도](https://ko.wikipedia.org/wiki/%EB%A7%8C%EB%A6%AC%ED%8F%AC%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5) | | | **O** (예상) | 만리포 해변 앞 도로 잡힐 가능성 높음 |
| jindo-art | 운림산방 | 34.466110 | 126.308060 | [위키백과 한국어판](https://ko.wikipedia.org/wiki/%EC%A7%84%EB%8F%84_%EC%9A%B4%EB%A6%BC%EC%82%B0%EB%B0%A9) | | | **O** (예상) | 운림산방로 도로 상이라 잡힐 가능성 높음. 부분 커버리지일 수 있음 |

## 예상 분류 요약

| 분류 | 미션 수 | 미션 |
|---|---|---|
| O (카카오 임베드) | 4 | ganghwa-market, ganghwa-mudflat, taean-sunset, jindo-art |
| X (사진 캡쳐) | 1 | yeongwol-stars |

## 코드 반영 현황 (Phase D 완료분)

- **O 미션 (4개)**: `frontend/src/data/regionMissions.ts` 에 `kakaoPosition` 추가. placeholder `realRoadview` / `roadviewSteps` 제거. → 카카오 임베드 우선 동작.
- **X 미션 (1개)**: 사진 파이프라인 유지. `roadview-photo-metadata.md` 의 캡쳐 대상은 yeongwol-stars만 남음.

## 검사 후 갱신 흐름

1. `frontend/public/coverage-check.html` 실행 → 실제 O/X 결과 받기
2. 이 시트의 `roadview_coverage` 컬럼 갱신 (`O (예상)` → `O` / `X`)
3. 예상과 다른 미션:
   - **O → X**: 해당 미션을 `roadview-photo-metadata.md`에 행 추가, `regionMissions.ts`에서 `kakaoPosition` 제거(or 유지하되 어차피 panoId null이라 자동 폴백)
   - **X → O**: `regionMissions.ts`에 `kakaoPosition` 추가, `roadview-photo-metadata.md`에서 해당 행 제거

> 💡 `kakaoPosition`은 박아두고 panoId가 null이면 자동 폴백되므로, **혼동 시 그냥 박아두는 게 안전** (RoadviewWithFallback이 알아서 사진 폴백으로 분기).

## 좌표 출처 메모

추측 금지 원칙 준수 — 모든 좌표에 출처 URL 첨부. 5개 미션 모두 좌표 확보 완료.

- **강화풍물시장 / 별마로천문대**: visitkorea 열린관광 페이지의 길안내 링크에 박혀있는 `lat`/`lng` 파라미터
- **동막해수욕장**: 강화군청 관광페이지의 지도보기 링크 파라미터
- **만리포해수욕장**: 한국어 위키백과 임베드 지도의 `36.786417,126.142333`
- **운림산방**: 한국어 위키백과의 정보상자에 적힌 도분초 좌표를 10진수로 변환
