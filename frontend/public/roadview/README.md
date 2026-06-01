# roadview 사진 폴더

**커버리지 X 미션(카카오 로드뷰 미지원)** 의 미니 로드뷰 사진이 들어가는 곳입니다.

> 커버리지 O 미션은 카카오 로드뷰를 임베드해서 사진 캡쳐 불필요.
> 분류 기준은 `agents/frontend/arrival-roadview-links.md`의 `roadview_coverage` 컬럼.

## 현재 캡쳐 대상 (예상 분류 기준)

| mission_id | 예상 step | 메모 |
|---|---|---|
| `yeongwol-stars` | 6장 (4~7 사이 조절 가능) | ⚠️ 미션 컨셉 재설계 결정 대기 중 — 출발지 미정이라 캡쳐 보류 권장 |

검사 후 X로 분류되는 미션이 더 생기면 여기에 추가.

## 파일명 규칙

```
{mission_id}-{step}.jpg
```

예시:
```
yeongwol-stars-1.jpg   ← step 1 (출발)
yeongwol-stars-2.jpg   ← step 2
...
yeongwol-stars-6.jpg   ← step 6 (도착)
```

확장자는 `.jpg` / `.webp` / `.png` 모두 OK.

## 사양

- 가로 **1200px 이상** (모바일 풀스크린)
- 비율 4:3 또는 16:9
- 네이버/카카오 워터마크·하단 UI는 크롭

## 작업 흐름

1. `agents/frontend/roadview-photo-metadata.md` 확인
2. 네이버지도 거리뷰에서 동선 따라 캡처
3. 이 폴더에 `{mission_id}-{step}.jpg` 로 저장
4. 메타시트에 caption / forward_direction / story 채우기
5. `frontend/src/data/regionMissions.ts` 의 해당 미션에 `roadviewSteps` 박기

자세한 캡처 가이드: `agents/frontend/team-roadview-guide.md`
