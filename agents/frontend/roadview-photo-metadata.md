# 청풍 로드뷰 사진 메타데이터 시트 — X 미션 캡쳐 대상

> **Phase D 산출물**. 카카오 로드뷰 커버리지가 없는(`X`) 미션만 사람이 직접 캡쳐. O 미션은 카카오 임베드로 자동 처리되므로 사진 불필요.
>
> 캡쳐 분류 기준: `agents/frontend/arrival-roadview-links.md`의 `roadview_coverage` 컬럼.

## 현재 캡쳐 대상 — 1개 미션 (예상 분류 기준)

| mission_id | 도착지 | 예상 step 수 | 우선순위 메모 |
|---|---|---|---|
| **yeongwol-stars** | 별마로천문대 (봉래산 800m 정상) | 6장 (4~7장 사이 조절 가능) | **⚠️ 미션 컨셉 재설계 결정 대기 중** — 출발지(레지던스)가 미정이라 캡쳐 작업 보류 권장. `residence-poi-master.md` 참고 |

> 검사 후 X로 새로 분류되는 미션이 생기면 이 시트에 행 추가.

## 사용 규칙

- **사진 파일은 `frontend/public/roadview/` 폴더에 저장**. 파일명은 `{mission_id}-{step}.jpg` (예: `yeongwol-stars-3.jpg`).
- 미션당 step은 **6개 자리**로 잡아뒀습니다. 동선에 따라 **4~7장 사이에서 줄이거나 늘려도 OK**.
- `forward_direction`은 `straight` / `right` / `left` 중 하나. **마지막 step(도착)은 비워둡니다.**
- `caption`은 10자 안팎의 짧은 위치 라벨.
- `story`는 출발지 + 인상적인 한두 지점에만.

## 작성 가이드 참조

- 캡처 가이드: `agents/frontend/team-roadview-guide.md`
- 사진 사양: `agents/frontend/roadview-photo-needs.md`

## 마스터 표

| mission_id | step | photo_file | caption | forward_direction | story |
|---|---|---|---|---|---|
| yeongwol-stars | 1 | yeongwol-stars-1.jpg | | | |
| yeongwol-stars | 2 | yeongwol-stars-2.jpg | | | |
| yeongwol-stars | 3 | yeongwol-stars-3.jpg | | | |
| yeongwol-stars | 4 | yeongwol-stars-4.jpg | | | |
| yeongwol-stars | 5 | yeongwol-stars-5.jpg | | | |
| yeongwol-stars | 6 | yeongwol-stars-6.jpg | | | |

## 캡쳐 후 코드 반영 위치

`frontend/src/data/regionMissions.ts` 의 yeongwol-stars 미션 객체에 `roadviewSteps` 배열 추가:

```ts
{
  id: "yeongwol-stars",
  // ...
  roadviewSteps: [
    { photo: "/roadview/yeongwol-stars-1.jpg", caption: "...", forwardDirection: "straight", story: "..." },
    // ...
  ],
},
```

## 작업 흐름

1. **출발지·도착지 결정** (yeongwol-stars는 미션 재설계 결정 후)
2. 네이버지도(PC 권장)에서 도착지 검색 → 거리뷰 진입 → 동선 따라 캡처
3. `frontend/public/roadview/` 폴더에 `{mission_id}-{step}.jpg` 저장
4. 이 시트에 `caption` / `forward_direction` / `story` 채우기
5. `regionMissions.ts`에 `roadviewSteps` 박기
