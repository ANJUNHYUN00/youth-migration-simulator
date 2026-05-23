# 🎬 로드뷰 사진 수집 가이드 — 팀원용

> **목적**: 미션 이동 화면(MissionTravelingScreen)에서 사용자가 일러스트와 비교해서 볼 수 있는 **실제 카카오 로드뷰 사진**을 수집해야 합니다.

## 한 줄 요약

- 진행 모드가 **`map-info`** 또는 **`map-dialogue`** 인 미션만 사진이 필요해요
- 각 미션마다 **4지점** 사진이 필요해요 — 출발(레지던스) → 골목 → 다가옴 → 도착
- 총 **필요 미션 25개 × 4장 = 100장**

---

## 필요/불필요 분기 기준

이동 화면(`MissionTravelingScreen`)을 거치는 미션만 사진이 필요합니다.

| 모드 | 이동 화면? | 사진 필요? |
|------|------|------|
| `map-info` | O | ✅ **필요** |
| `map-dialogue` | O | ✅ **필요** |
| `dialogue` | X (바로 대화) | ❌ 불필요 |
| `numeric` | X (바로 입력) | ❌ 불필요 |
| `mailbox` | X (모달) | ❌ 불필요 |
| `final` | X (자동 생성) | ❌ 불필요 |

---

## ✅ 사진 필요한 미션 (총 25개 × 4장)

### 공통 미션 (모든 지역에서 동일하게 풀림 — 4개)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `hospital` | 병원 접근성 확인 | 🗣️ map-dialogue | 동네 병원 가는 길 (도보 12분) |
| `market` | 전통시장 물가 체험 | 🗣️ map-dialogue | 동네 전통시장 입구·내부 |
| `transit` | 교통 접근성 확인 | 🗺️ map-info | 버스 정류장 / 시내 진출 동선 |
| `shop` | 동네 가게 들르기 | 🗣️ map-dialogue | 동네 분식집·작은 가게 골목 |

> 공통 미션 사진은 **지역마다 다르게** 찍어야 함 (강화 병원 / 광양 병원 / 거제 병원 …). 즉 공통 4개 × 8개 지역 = **32 미션 × 4장 = 128장 필요**

**※ 데모 단계에서는 우선순위 낮음.** 8개 지역 중 추천 3곳(강화/광양/거제) 또는 사용자가 접근하는 지역부터 시작 가능.

---

### 지역 미션 — 강화도 (4 중 3개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `ganghwa-mudflat` | 갯벌 걸어가보기 | 🗺️ map-info | 강화 갯벌 가는 길 + 갯벌 풍경 |
| `ganghwa-dolmen` | 강화 고인돌 탐방 | 🗺️ map-info | 고인돌 군락 가는 길 |
| `ganghwa-sunset` | 일몰 보러 가기 | 🗺️ map-info | 동막해변·석모도 가는 길 |
| ~~`ganghwa-farm`~~ | 농사 체험 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 광양 (4 중 2개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `gwangyang-walk` | 매화마을 산책 | 🗺️ map-info | 매화마을 산책로 |
| `gwangyang-coworking` | 코워킹 스페이스 찾기 | 🗣️ map-dialogue | 광양 코워킹 가는 길 |
| ~~`gwangyang-cafework`~~ | 카페에서 일해보기 | 🔢 numeric | ❌ 불필요 |
| ~~`gwangyang-creator`~~ | 로컬 크리에이터 만나기 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 거제도 (4 중 3개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `geoje-walk-sea` | 바다까지 걸어가기 | 🗺️ map-info | 거제 레지던스 → 해변 도보길 |
| `geoje-beach` | 해수욕장 환경 체험 | 🗺️ map-info | 해수욕장 입구·풍경 |
| `geoje-fishing` | 낚시 포인트 찾기 | 🗣️ map-dialogue | 갯바위 낚시 포인트 |
| ~~`geoje-leisure`~~ | 레저 커뮤니티 만나기 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 태안 (4 중 3개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `taean-sunset` | 만리포 노을 산책 | 🗺️ map-info | 만리포 해변 노을 |
| `taean-bike` | 안면도 자전거 일주 | 🗺️ map-info | 안면도 자전거 코스 |
| `taean-surf` | 만리포 서핑 강습 | 🗣️ map-dialogue | 서핑 스쿨 가는 길 |
| ~~`taean-community`~~ | 해변 라이프 커뮤니티 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 영월 (4 중 3개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `yeongwol-stars` | 별마로 천문대 야간 관측 | 🗺️ map-info | 별마로 천문대 가는 산길 |
| `yeongwol-river` | 동강 따라 걷기 | 🗺️ map-info | 동강 산책로 |
| `yeongwol-trek` | 한반도 지형 트레킹 | 🗺️ map-info | 선암마을 전망대 코스 |
| ~~`yeongwol-elder`~~ | 산골 어르신 만나기 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 양양 (4 중 2개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `yangyang-coworking` | 인구해변 코워킹 입주 | 🗣️ map-dialogue | 인구해변 코워킹 가는 길 |
| `yangyang-surf-dawn` | 새벽 서핑 한 시간 | 🗺️ map-info | 새벽 서핑 포인트 |
| ~~`yangyang-cafe-work`~~ | 해변 카페 작업 | 🔢 numeric | ❌ 불필요 |
| ~~`yangyang-nomad`~~ | 양양 노마드 모임 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 진도 (4 중 3개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `jindo-art` | 운림산방 한국화 감상 | 🗺️ map-info | 운림산방 가는 길·마당 |
| `jindo-market` | 진도 5일장 둘러보기 | 🗣️ map-dialogue | 진도 5일장 입구·내부 |
| `jindo-dog` | 진돗개 보러 가기 | 🗺️ map-info | 진돗개 시험연구소 |
| ~~`jindo-tea`~~ | 진도 다도 한 잔 | 💬 dialogue | ❌ 불필요 |

### 지역 미션 — 정선 (4 중 2개 필요)

| ID | 미션명 | 모드 | 사진 컨셉 |
|------|------|------|------|
| `jeongseon-market` | 정선 5일장 체험 | 🗣️ map-dialogue | 정선 5일장 입구·내부 |
| `jeongseon-cave` | 화암동굴 탐방 | 🗺️ map-info | 화암동굴 진입로 |
| ~~`jeongseon-quiet`~~ | 산속 한 시간 명상 | 💬 dialogue | ❌ 불필요 |
| ~~`jeongseon-hanok-tea`~~ | 한옥 다도 체험 | 💬 dialogue | ❌ 불필요 |

---

## ❌ 사진 불필요한 미션 (총 16개)

이동 화면을 거치지 않으므로 사진 수집 X.

| 미션 | 사유 |
|------|------|
| 생활비 시뮬레이션 | 💬 바로 대화 |
| 하루 루틴 체험 | 💬 바로 대화 |
| 이주민 만나기 | 💬 바로 대화 |
| 하루 식비 기록 | 🔢 수치 입력 |
| 우편함 — 주민 이야기 | 📮 모달 |
| 이주 결정 리포트 | 자동 생성 |
| `ganghwa-farm` 농사 체험 | 💬 |
| `gwangyang-cafework` 카페에서 일해보기 | 🔢 |
| `gwangyang-creator` 로컬 크리에이터 만나기 | 💬 |
| `geoje-leisure` 레저 커뮤니티 만나기 | 💬 |
| `taean-community` 해변 라이프 커뮤니티 | 💬 |
| `yeongwol-elder` 산골 어르신 만나기 | 💬 |
| `yangyang-cafe-work` 해변 카페 작업 | 🔢 |
| `yangyang-nomad` 양양 노마드 모임 | 💬 |
| `jindo-tea` 진도 다도 한 잔 | 💬 |
| `jeongseon-quiet` 산속 한 시간 명상 | 💬 |
| `jeongseon-hanok-tea` 한옥 다도 체험 | 💬 |

---

## 📸 사진 수집 가이드

### 각 미션당 4장 — 출발 → 도착 흐름대로

| 순서 | 사진 의미 | 예: 갯벌 미션 |
|------|------|------|
| **1번 (출발)** | 레지던스/숙소 앞 골목 입구 | 강화 잠시섬 하우스 앞 길 |
| **2번 (골목)** | 가는 길 중간 골목·도로 | 갯벌 가는 마을 길목 |
| **3번 (다가옴)** | 도착지가 멀리 보이는 시점 | 갯벌이 시야에 들어오는 길 |
| **4번 (도착)** | 도착지 정면 | 갯벌 입구·풍경 정면 |

### 사진 사양

- **포맷**: `.jpg` / `.jpeg` / `.png` / `.webp` 모두 OK (권장: `.webp` 또는 `.jpg`)
- **해상도**: 가로 800px 이상 (1200~1600px 권장)
- **비율**: 4:3 또는 16:9 (앱 내 모달에서 4:3으로 크롭됨)
- **카카오 로드뷰**: 캡처 → 워터마크/UI 자르기 → 가공
- **저작권**: 카카오 로드뷰 출처 표기 필요 시 모달에 caption 추가 (개발팀과 상의)

### 파일명 컨벤션

```
public/roadview/{mission-id}-{1|2|3|4}.{jpg|webp|png}
```

예시:
- `public/roadview/ganghwa-mudflat-1.jpg` (출발)
- `public/roadview/ganghwa-mudflat-2.jpg` (골목)
- `public/roadview/ganghwa-mudflat-3.jpg` (다가옴)
- `public/roadview/ganghwa-mudflat-4.jpg` (도착)

### 저장 위치

- 자산 폴더: **`frontend/public/roadview/`**
- 폴더 없으면 직접 만들어주시면 됩니다
- 코드에서는 `/roadview/파일명.jpg` 로 참조됨

---

## 🚀 우선순위 (작업 추천 순서)

### Phase 1 — 데모 시연용 (5개 미션 × 4장 = 20장)
지금 placeholder URL이 들어가 있어서 **가장 먼저 교체하기 좋은 미션들**:

1. `ganghwa-mudflat` (강화 갯벌)
2. `yeongwol-stars` (영월 별마로 천문대)
3. `taean-sunset` (태안 만리포 노을)
4. `jindo-art` (진도 운림산방)
5. `jeongseon-cave` (정선 화암동굴)

### Phase 2 — 8개 추천 레지던스 풀 커버 (16개 미션 × 4장 = 64장)
Phase 1 + 나머지 11개 지역 미션. 추천 8곳을 사용자가 다 둘러볼 수 있게.

### Phase 3 — 공통 미션 지역별 (32개 × 4장 = 128장)
지역마다 다른 공통 미션 사진. 후속 단계.

---

## 📦 작업 후 개발팀 전달

1. 파일을 `frontend/public/roadview/` 폴더에 업로드 (또는 zip으로 공유)
2. 파일명 규칙(`{mission-id}-{1|2|3|4}`)을 지켰는지 확인
3. 개발팀이 `frontend/src/data/regionMissions.ts` (또는 `missions.ts`)에서 각 미션의 `realRoadview` 배열을 URL → 로컬 경로로 교체

```ts
// Before (placeholder)
realRoadview: [
  "https://picsum.photos/seed/ganghwa-mudflat-depart/800/600",
  ...
]

// After (실제 자산)
realRoadview: [
  "/roadview/ganghwa-mudflat-1.jpg",
  "/roadview/ganghwa-mudflat-2.jpg",
  "/roadview/ganghwa-mudflat-3.jpg",
  "/roadview/ganghwa-mudflat-4.jpg",
]
```

---

## 📊 사진 수요 요약

| 단계 | 필요 사진 수 | 미션 수 |
|------|------|------|
| Phase 1 (데모) | 20장 | 5개 |
| Phase 2 (지역 미션 풀 커버) | 64장 (+44 추가) | 16개 |
| Phase 3 (공통 미션 8지역) | 128장 (+64 추가) | 32개 |
| **최대 합계** | **약 192장** | 53개 |

> **현실적 권장**: Phase 1만 우선 시연 → 반응 보고 확장. 일러스트화 작업이 동반된다면 그것도 같이 고려.
