# 2026-06-05 — 대화 UI 전면 개편 + 네비/시트 다듬기

이날의 작업은 크게 셋. **(1) BottomNav 정리**, **(2) ResidenceSheet 마커 차단 버그 수정**,
그리고 메인 작업인 **(3) 미션 수행 화면(말해보카) UI 전면 개편 — 풀스크린 NPC + 타이핑 말풍선 + 선택지 카드**.

---

## 1. BottomNav — 작은 서브 라벨 제거 + 재정렬

**파일**: `frontend/src/components/BottomNav.tsx`

기존 탭에 메인 라벨(`홈`, `나의 여정`, ...) 밑에 작은 서브 라벨(`떠나기`, `아트맵`, `이야기`, `예약`)이
9px로 깔려있어 가독성이 떨어졌음. 서브 제거 후 메인 라벨을 11px → 12px 로 키우고 아이콘-라벨
간격(`gap-1` → `gap-1.5`), 버튼 패딩(`py-1` → `py-1.5`)을 살짝 늘려 빈 공간을 채움.

```diff
- <span className="text-[11px]">{label}</span>
- <span className="text-[9px]">{sub}</span>
+ <span className="text-[12px]">{label}</span>
```

---

## 2. ResidenceSheet — 마커 클릭이 시트 뒤로 통과되던 버그 수정

**파일**: `frontend/src/components/ResidenceSheet.tsx`

증상: 떠나기 지도에서 강화도 마커를 누르면 바텀시트가 뜨고 "여기로 떠나기" CTA가 보이는데,
시트가 열린 상태에서 다른 마커(영월/무수 등)를 누르면 그 마커가 그대로 클릭돼서 새 시트가
스택됨. 빈 백드롭 영역만 누르면 닫혀야 정상.

원인: `ResidenceMarker`가 `zIndex: 10/20/30`을 가지는데, 시트의 백드롭은 z-index 미지정 →
마커가 백드롭 위에 떠 있어 클릭이 통과.

수정: 백드롭에 `z-40`, 시트 본체에 `z-50` 부여.

```diff
- className="absolute inset-0 bg-black/20"
+ className="absolute inset-0 bg-black/20 z-40"
...
- className="absolute left-0 right-0 bottom-0 bg-white ..."
+ className="absolute left-0 right-0 bottom-0 z-50 bg-white ..."
```

> **UX 용어 메모**: 시트 내부의 "여기로 떠나기" 같은 주요 CTA를 디자이너들은 보통
> **Bottom Sheet Primary Action** / **Sheet Footer CTA** / **Sticky CTA Bar** 라고 부름.
> 시트가 길어져도 항상 보이는 푸터 액션이면 **Persistent Footer Action**.

---

## 3. 미션 수행 화면(MissionExecuteScreen) — 풀스크린 NPC 대화 UI

**파일**: `frontend/src/screens/MissionExecuteScreen.tsx`

### 의도

기존 말해보카 UI(NPC 머리 옆 이모지 + 흰 카드 안 대사)는 정보 카드 같은 톤이었음.
카카오 당근이/단추 앱처럼 **풀스크린 캐릭터 + 하단 큰 말풍선 + 선택지 카드 2-3개**의
서사적 대화 톤으로 전환.

데이터(`mission.dialogues: DialogueTurn[]`, `option.next`, `numeric`, `fitDelta`, `{amount}/{compare}`
치환, RewardOverlay)는 **건드리지 않고 시각만** 갈아끼움 → 미션 28개 + 공통 9개가 그대로
새 UI에서 재생됨.

### 레이아웃

| 영역 | 요소 |
|---|---|
| 좌상단 | 🔊 / 🔇 사운드 토글 (시각 토글만, 사운드 연동은 후속) |
| 우상단 | `+N점` 보상 뱃지 + `SKIP` (= 미션 종료) |
| 중앙 상단 | 화자 이름 pill (NPC는 주황 `#FF7043`, 플레이어는 파랑 `#5B9BD5`) + 풀바디 클레이 캐릭터 |
| 하단 | 진행 점 인디케이터 → 말풍선 → 선택지 카드 / 수치 입력 |

### 턴 내 phase 머신

각 `DialogueTurn` 안에서 3단계를 거침:

```
npc-typing  →  npc-done  →  player-turn
   (타이핑)     (탭 대기)     (선택지 노출)
```

| Phase | 화면 |
|---|---|
| **npc-typing** | NPC 캐릭터 + 주황 이름 뱃지. 말풍선에 글자 타이핑 (65ms/글자). 말풍선 탭 시 타이핑 즉시 완료 → `npc-done` |
| **npc-done** | 타이핑 완료. 말풍선 밑에 *탭하여 답하기 →* 깜빡이는 힌트. 말풍선 한 번 더 탭 → `player-turn` |
| **player-turn** | 캐릭터가 플레이어("나", 파란 뱃지, `clay-baram-solo.png`)로 크로스페이드. NPC가 한 말은 `opacity-70`으로 약하게 남겨 맥락 보존. 선택지 카드(또는 수치 입력) staggered fade-in (100ms 간격). 픽 시 200ms ring 강조 → 다음 turn → 다시 `npc-typing` |

### 애니메이션 스펙

| 요소 | 동작 | 시간 |
|---|---|---|
| 타이핑 | `setInterval` + slice | 65ms/글자 |
| 말풍선 등장 | 아래서 위로 슬라이드 + fade | 250ms |
| 선택지 등장 | staggered fade-in | 100ms 간격 |
| 선택 시 강조 | ring + scale 1.02 → 진행 | 200ms |
| 화자 전환 (NPC↔플레이어) | 제자리 opacity 크로스페이드 | 250ms |

> 초기에는 화자 전환에 `scale` + 떠다니는 `y` 모션이 있었는데, "밑으로 내려가면서 사라진다"는
> 위화감이 있어 **순수 opacity 크로스페이드**로 단순화함.

### 미션별 NPC 아바타·사이즈 override

병원 미션처럼 실제 일러스트가 있는 NPC는 클레이 fallback 대신 전용 이미지를 쓰고 크기도 키움.
파일 상단에 두 개의 맵을 둠.

```ts
// 미션별 NPC 아바타 override — 이름 기반 fallback 보다 우선
const MISSION_ID_NPC_AVATAR: Record<string, string> = {
  hospital: "/character1/resident_talk/town_hal_1.png",
};

// 미션별 NPC 아바타 크기 override — 풀바디 일러스트는 크게 노출
const MISSION_ID_NPC_SIZE: Record<string, string> = {
  hospital: "w-[78vw] max-w-[420px] h-auto",
};
const DEFAULT_NPC_SIZE = "w-40 h-40";
```

해당 미션에선:
- 사이즈가 NPC·플레이어 양쪽에 동일 적용 → 두 캐릭터 모두 같은 비율로 크게
- 위치 `top-[14%]` → `top-[6%]`로 살짝 올려 큰 일러스트와 말풍선이 안 겹치도록
- 발밑 그림자 `w-28` → `w-60`으로 키워 균형
- 이모지 배지(👵) 숨김 — 이미지 자체에 표정이 있으니 중복 + 가독성 우선

다른 NPC도 일러스트가 준비되면 이 두 맵에 한 줄씩 추가하면 됨.
예: `market: "/character1/resident_talk/town_market_owner.png"` ...

### 데이터 모델은 그대로

```ts
type Mission = {
  id: string;
  // ...
  npc: { name: string; emoji: string };
  dialogues: DialogueTurn[];   // 그대로
};

type DialogueTurn = {
  npc: string;              // NPC 대사 (타이핑되는 텍스트)
  options?: DialogueOption[];
  numeric?: NumericInputSpec;
};
```

기존 미션 데이터는 손대지 않음. 새 UI는 데이터 형식과 100% 호환.

---

## 4. 부수 변경

### 자산 추가
- `frontend/public/character1/resident_talk/town_hal_1.png` (병원 NPC, 누끼 처리 풀바디)
- 원본 `character1/resident_talk/town_hal_1.png`(루트)와 동일. Vite가 `public/`만 서빙하므로 둘 다 둠.

### 짧게 만들었다 정리한 것
- `src/screens/DialogueScreen.tsx` (X — 초기 잘못된 방향)
- `src/screens/JamsiDialoguePreview.tsx` (X — 초기 잘못된 방향)
- `src/data/dialogueScripts.ts` (X — 초기 잘못된 방향)
- `App.tsx`의 `#jamsi-dialogue` 해시 라우트 (X)

초기엔 "마을 도착 → NPC 대화로 미션 선택하는 hub" 모델로 만들었는데, 그러면 미션 리스트가
묻혀버리는 문제가 있어서 방향 수정. 결국 **기존 MissionExecuteScreen의 UI를 갈아끼우는 방식**으로
정리.

---

## 다음 단계 후보

- 다른 NPC들 풀바디 일러스트 제작 + `MISSION_ID_NPC_AVATAR` 추가
- 사운드 토글 → 실제 BGM/SFX 연동
- `clay-baram-solo`(플레이어)도 누끼 풀바디 일러스트로 교체 검토 — 현재 라이프스타일 v2에서
  플레이어 캐릭터가 바람이/지음이로 갈리는데, 프로필별로 다르게 노출할지 정해야 함
- 말풍선 탭 인터랙션 사용성 테스트 — "탭하여 답하기" 힌트가 충분히 발견되는지

---

# 후속 작업 (같은 날, 같은 PR)

초기 개편 후 사용성·일관성 다듬기와 별개 화면들 정비. 6개 영역.

## 5. 미션 화면 — 캐릭터 사이즈/위치 글로벌 통일

**파일**: `frontend/src/screens/MissionExecuteScreen.tsx`

초기엔 병원 미션만 풀바디 사이즈로 override 했는데, 사용자 피드백이 "그 크기를 다른 미션에도
적용해" 였음. 결과적으로 **풀바디 톤이 기본값**이 되고, NPC vs 플레이어 사이즈만 다르게 둠.

### 최종 사이즈 정책

```ts
// 모든 NPC 공통 (이전엔 hospital 전용 override 였음)
const DEFAULT_NPC_SIZE = "w-[78vw] max-w-[420px] h-auto";

// 미션별 미세 조정용 — 현재는 비어있음, 필요 시 한 줄 추가
const MISSION_ID_NPC_SIZE: Record<string, string> = {};

// 플레이어("나") 는 NPC보다 작게.
// clay-baram-solo PNG가 작은 소스라 너무 키우면 픽셀 깨짐 → 중간 크기로 타협
const PLAYER_AVATAR_SIZE = "w-[48vw] max-w-[240px] h-auto";
```

NPC 위치/그림자/이모지도 글로벌 통일:
- 컨테이너: `top-[6%]` (이전 분기 로직 `isLargeAvatar ? top-[6%] : top-[14%]` 제거)
- 발밑 그림자: `w-60`
- 이모지 배지: 항상 숨김 (풀바디 일러스트라 표정·캐릭터성 이미 있음)

`isLargeAvatar` 분기 자체를 없애서 코드 단순화.

### 떠다니는 모션 복귀 (2겹 모션 구조)

초기엔 화자 전환 시 NPC가 "밑으로 내려가며 사라진다"는 위화감 때문에 floating을 뺐었는데,
floating 자체는 캐릭터의 생명력이라 다시 살림. 대신 exit 시점에 y가 끼어들지 않도록
**외곽 motion(opacity 크로스페이드) + 내부 motion(y 떠다님)** 으로 레이어 분리.

```tsx
<AnimatePresence mode="wait">
  <motion.div  // 외곽 — 화자 전환 페이드
    key={speakerImg}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    <motion.img  // 내부 — 떠다님
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className={`${imgSize} ...`}
    />
  </motion.div>
</AnimatePresence>
```

---

## 6. JourneyScreen — 헤더 톤 통일 + 이주 리포트 카드 잠금/스택

**파일**: `frontend/src/screens/JourneyScreen.tsx`

### 헤더 — Community/Booking과 동일 톤

| | 이전 | 지금 |
|---|---|---|
| 컨테이너 | `pt-10 px-5` | `px-6 pt-7 pb-4 relative` |
| Pre-label | `text-[12px] font-medium` "나의 여정" | `text-[10px] font-bold tracking-[0.18em] uppercase` **"Travel"** |
| h1 | `text-[20px]` "다녀온 지역, 쌓인 시간" | `text-[28px]` **"쌓인 시간"** |
| Subtitle | (없음) | `text-[12px] text-ink-soft` "다녀온 지역의 흔적이 쌓여요" |

세 탭(Community/Booking/Travel) 모두 영문 pre-label + 굵은 한글 h1 + 짧은 서브카피 구조로 정렬.

### 가장 많이 탐색한 지역 → "이주 리포트" 카드 (잠금 + 스택)

이전엔 `findTopRegion()`으로 단일 "최다 탐색" 카드가 항상 떴는데, 이건 이주 리포트와 의미가
어긋남. 새 정책:

- **미방문**: 기존 🌱 EmptyState
- **다녀왔지만 리포트 미생성**: 🔒 `LockedReportCard` (점선 테두리, 안내 카피)
- **리포트 1+개**: 해당 지역마다 `TopRegionCard` 1장씩, `space-y-2`로 세로 스택

```tsx
{!hasAnyVisit ? (
  <EmptyState />
) : reportResidences.length === 0 ? (
  <LockedReportCard />
) : (
  reportResidences.map((r) => <TopRegionCard ... />)
)}

// 리포트 생성된 지역 = regionProgress[id].migrationReport 가 있는 곳
const reportResidences = residences.filter(
  (r) => regionProgress[r.id]?.migrationReport
);
```

카드 pre-label "가장 많이 탐색한 지역" → "이주 리포트". `findTopRegion` 임포트 제거.

---

## 7. TravelingScreen — 떠나기 탭과 위치 통일

**파일**: `frontend/src/screens/TravelingScreen.tsx`

이동 화면이 떠나기 지도에서 자연스럽게 흘러가야 하는데 헤더/지도 위치가 어긋나 점프 느낌이
있었음. Departure 기준으로 맞춤.

| | 이전 | 지금 |
|---|---|---|
| 헤더 | `pt-12 px-6 text-center` | `pt-12 px-5 text-center` |
| 지도 컨테이너 | `flex-1 px-3 mt-4` + 내부 `max-w-[320px]` | `flex-1 px-3 mb-4` + 내부 `max-w-[320px] **mt-24**` |

Departure가 지도를 `mt-24`로 살짝 내려두기 때문에 Traveling도 동일하게 맞춤 → 화면 전환 시
지도 위치 일관.

---

## 8. ArrivalScreen — 알아보기 CTA 약 1.5배 아래로

**파일**: `frontend/src/screens/ArrivalScreen.tsx`

마을 도착 화면의 `{region} 알아보기 →` CTA가 너무 위에 떠 있어 손가락 닿기 애매. 아래
"돌아가기" 보조 액션 영역의 위쪽 padding을 줄이면서 flex-1이 더 확장 → CTA가 자연히 내려옴.

```diff
- <div className="relative px-5 pt-8 pb-6 flex justify-center">
+ <div className="relative px-5 pt-2 pb-6 flex justify-center">
```

순효과: CTA가 24~32px 정도 아래로 (= ≈1.5배 깊이).

---

## 9. SplashScreen — 동심원 애니메이션 → 풀스크린 이미지

**파일**: `frontend/src/screens/onboarding/SplashScreen.tsx`

기존 회전 SVG + 카피 + 로딩 점 구조를 전부 제거하고, `character1/splash/start_image.png`
한 장으로 대체. 2.2초 자동 진행은 유지.

### 자산
- 원본: `character1/splash/start_image.png` (루트)
- 서빙용 사본: `frontend/public/character1/splash/start_image.png`

### 코드
```tsx
return (
  <div className="relative min-h-[100dvh] overflow-hidden bg-cream">
    <img
      src="/character1/splash/start_image.png"
      alt="청풍 시작 화면"
      className="absolute inset-0 w-full h-full object-cover ..."
    />
  </div>
);
```

> 이미지 비율이 화면과 안 맞을 땐 `object-cover` ↔ `object-contain` 토글.

---

## 10. 본 지역 선택 — 전국 시/도 + 시/군/구 2단계 픽커

**파일**:
- 새: `frontend/src/data/koreaRegions.ts`
- 수정: `frontend/src/screens/onboarding/HomeRegionScreen.tsx`
- 수정: `frontend/src/App.tsx`, `frontend/src/screens/DepartureScreen.tsx`

이전엔 본 지역이 6개 광역(서울/인천/대전/대구/광주/부산) 카드 그리드로 한정됐는데, 사용자가
"경북 경산시" 같은 시/군/구까지 다 고를 수 있어야 한다고 요청.

### 데이터 — `koreaRegions.ts`

```ts
export type SidoInfo = {
  short: string;     // "경북"
  full: string;      // "경상북도"
  emoji: string;
  pos: RegionPos;    // 시/도 대표 좌표
  sigungu: string[]; // 소속 시/군/구
};

export const KOREA_SIDOS: SidoInfo[] = [/* 17개 광역 */];

// 주요 시/군/구만 정확 좌표 (~35곳). 그 외는 시/도 대표로 폴백.
export const SIGUNGU_POS: Record<string, RegionPos> = {
  "경기 수원시": { xPct: 34, yPct: 27 },
  "강원 춘천시": { xPct: 47, yPct: 22 },
  "경북 포항시": { xPct: 65, yPct: 53 },
  // ...
};

// 저장 포맷: "{시도}" 또는 "{시도} {시군구}"
export function formatRegionName(sidoShort, sigungu): string;

// 저장값 → 좌표 해석. SIGUNGU_POS 정확매칭 → 시도 prefix 폴백.
export function resolveRegionPos(name: string): RegionPos | undefined;
```

17 광역 모두 등록(`강원특별자치도`, `전북특별자치도` 포함, 2024년 행정구역 반영). 시/군/구는
시/도별 전체 리스트(서울 25구, 경기 31시군, 경남 18시군, ...) 약 250곳.

### UI — `HomeRegionScreen.tsx` 2단계

| 단계 | 내용 |
|---|---|
| **Step A** | 17 시/도 **세로 스크롤 텍스트 리스트** (`max-h-[60vh]`), 정식명("서울특별시" 등) + 우측 `›`. 처음엔 3열 이모지 그리드였는데 사용자 피드백으로 텍스트 리스트로 변경 — 톤 일관 + 빠른 탐색 |
| **Step B** | 선택된 시/도의 시/군/구 리스트. 맨 위에 `"{시도} 전체"` 옵션 + 시군구 항목들. 단일시(세종)는 시군구 단계 자동 통과 (안내 카드만) |

상단에 선택된 시/도 칩(nature 톤) + "시/도 다시 고르기" 텍스트 버튼. ← 뒤로가기는 Step B에선
Step A로 되돌리고, Step A에선 외부 onBack.

### 좌표 라우팅

`App.tsx` / `DepartureScreen.tsx`의 `HOME_POSITIONS[name]` 직접 접근을 `resolveRegionPos` 우선
순위로 변경:

```ts
const homePos =
  resolveRegionPos(homeRegion) ??  // koreaRegions 새 매핑
  HOME_POSITIONS[homeRegion] ??    // 레거시 6개 광역
  (matchedResidence ? {...} : HOME_POSITIONS["서울"]);
```

### 레거시 호환

기존 저장값 `"서울"`(시군구 없음) 같은 단순 시도명은 `parseInitial`에서 시군구 `""`("전체")로
사전 선택해 재선택 없이 진행 가능.

---

## 자산 목록 (이번 PR 추가분)

- `frontend/public/character1/resident_talk/town_hal_1.png` — 병원 NPC 할머니 풀바디
- `frontend/public/character1/splash/start_image.png` — 스플래시 이미지
- (루트) `character1/resident_talk/town_hal_1.png`, `character1/splash/start_image.png` — 원본

