# 2026-06-07 — 레이아웃 시스템 정비 + 화면 몰입감 리뉴얼

이날 작업은 크게 6묶음. "앱 골격 단단히 + 화면 분위기 살리기" 의 양 갈래.

1. **하단 탭바 / 시뮬레이션 버튼 완전 분리** — CSS var 단일 출처
2. **TabLayout · PageShell** — 모든 페이지가 nav clearance 자동 보장
3. **시뮬레이션 탭 상태 보존** — 탭 이동 후 복귀해도 그 화면 그대로
4. **ResidenceHomeScreen v2** — 감성 여행 몰입의 홈
5. **JourneyScreen · LetterScreen · ProfileScreen 리뉴얼**
6. **미션 화면 + 로드뷰 fallback** — 모든 로드뷰 미션이 실제 카카오 로드뷰로

부수: 아이보리 톤 두 단계 더 밝게(#FFFCF7), MissionCompleteScreen 의 "조각이 +1
모였어요" 즉각 피드백, 미사용 코드 정리.

---

## 1. CSS 변수 단일 출처 + BottomNav 트리 분리

**파일**: `frontend/src/index.css`, `frontend/src/components/BottomNav.tsx`

### 문제

- `h-[calc(100dvh-6rem)]` 매직 6rem 이 5군데 이상 흩어져 있음 — nav 높이 변경 시 동기화 안 됨.
- 시뮬레이션 버튼이 `<nav>` 안쪽에 `absolute` 로 박혀있어서 nav 트리의 layout/높이에
  논리적으로 묶여 보임. "내가 4탭만 정렬하고 싶다" 했을 때 spacer 가 보이는 게 헷갈림.

### 해결 — CSS 변수 단일 출처

```css
/* index.css */
:root {
  --nav-h: 68px;                                 /* 탭바 안쪽 높이 */
  --nav-overhang: 28px;                          /* 시뮬 버튼이 nav 위로 솟는 길이 */
  --safe-b: env(safe-area-inset-bottom, 0px);
  --nav-safe-b: calc(var(--nav-h) + var(--safe-b));
  --content-bottom: calc(var(--nav-h) + var(--nav-overhang) + var(--safe-b));

  /* 중앙 시뮬레이션 버튼 — viewport 기준 fixed 로 띄움 */
  --center-btn-size: 64px;
  --center-btn-bottom: calc(
    var(--safe-b) + var(--nav-h) + var(--nav-overhang) - var(--center-btn-size)
  );
}
```

→ nav 높이·돌출·버튼 크기 중 하나만 바꾸면 **모든 페이지 padding 과 버튼 위치가
자동 재계산**.

### BottomNav 트리 분리

```tsx
<>
  {/* 탭바 — 순수 4탭 균등 */}
  <nav className="fixed bottom-0 z-40 ...">
    <div className="h-[var(--nav-h)] flex items-stretch">
      <TabButton label="발견"   className="flex-1" />
      <TabButton label="여정"   className="flex-1" />
      <div        className="flex-1" aria-hidden /> {/* notch */}
      <TabButton label="편지"   className="flex-1" />
      <TabButton label="내정보" className="flex-1" />
    </div>
  </nav>

  {/* 분리된 floating 시뮬 — viewport 기준, 420px 프레임 안 가로 중앙 */}
  <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 pointer-events-none">
    <CenterSimulationButton className="absolute pointer-events-auto" />
  </div>
</>
```

- `<nav>` 와 floating 버튼이 **형제 관계**. 버튼은 nav 의 height/정렬에 영향 X.
- 420px 래퍼 + `pointer-events-none` — 데스크톱 미리보기에서도 앱 프레임 중앙 정렬.
  내부 클릭은 `pointer-events-auto` 로 버튼만 활성화.

---

## 2. TabLayout · PageShell — 베이스 레이아웃

**신규**: `frontend/src/components/PageShell.tsx`
**수정**: `frontend/src/components/TabLayout.tsx`

### TabLayout

탭 화면(발견/여정/편지/내정보) 공통 컨테이너.

```tsx
<div
  className="overflow-y-auto bg-cream"
  style={{ height: "calc(100dvh - var(--content-bottom))" }}
>
  <TabHeader preLabel={...} title={...} subtitle={...} rightActions={...} />
  {children}
</div>
```

### PageShell (신규)

시뮬레이션 흐름 등 TabLayout 을 안 쓰는 풀블리드 페이지의 베이스.

```tsx
type Props = {
  children: ReactNode;
  className?: string;
  noPad?: boolean;   // 풀블리드 (TravelingScreen 등)
  scroll?: boolean;  // 내부 자체 스크롤
  bg?: string;
};
```

- 기본 모드: `min-h-[100dvh]` + `paddingBottom: var(--content-bottom)` 자동 적용.
- `scroll`: TabLayout 과 동일 동작.
- `noPad`: 직접 padding 관리하는 케이스용.

### 적용

- `TabLayout` / `MissionListScreen` / `MissionTravelingScreen` / `KakaoRoadview` /
  `MiniRoadview` / `RoadviewWithFallback` / `MissionCompleteScreen` 모두
  매직 `calc(100dvh-6rem)` 제거하고 `var(--content-bottom)` 으로 통일.
- App.tsx outer wrapper: `overflow-hidden` → `overflow-x-hidden` (세로 콘텐츠 자라남
  허용 — 옛 hidden 은 잘림 위험).

---

## 3. 시뮬레이션 탭 상태 보존

**파일**: `frontend/src/App.tsx`

### 문제

`handleTabChange` 가 시뮬레이션 탭으로 돌아올 때마다 `selected` 존재 시
무조건 `arrival` 로 리셋 → 미션 수행 중에 다른 탭 다녀오면 들어가기 애니메이션부터
다시 시작.

### 해결 — 흐름별 보존 매트릭스

```ts
const IN_RESIDENCE_FLOW: Tab1Route[] = [
  "residence-home",
  "mission-list",
  "mission-traveling",
  "mission-execute",
  "mission-complete",
  "day-end-ceremony",
];

if (next === "simulation" && !inTransit) {
  if (selected) {
    if (!IN_RESIDENCE_FLOW.includes(tab1Route)) {
      setTab1Route("residence-home"); // arrival → 마을 홈 자동 진행
    }
    // 이미 residence 흐름이면 setTab1Route 호출 X → 화면 그대로
  } else {
    setTab1Route("home"); // 본가 흐름
  }
}
```

| 현재 위치 | 탭 다녀온 뒤 시뮬레이션 복귀 |
|---|---|
| residence-home / mission-* / day-end-ceremony | **그대로** 유지 |
| arrival (들어가기 애니메이션) | residence-home 으로 점프 |
| home (본가) | home 유지 |
| traveling / traveling-back | tab1Route 손대지 않음 |

유일한 리셋 경로 = **"본가로 돌아가기"** 명시적 액션.

---

## 4. ResidenceHomeScreen v2 — 감성 여행 몰입

**파일**: `frontend/src/screens/ResidenceHomeScreen.tsx` (완전 재작성)

### 디자인 방향

- 풀블리드 풍경 + 상하 그라데이션 마스크 → "지금 여기" 톤 우선
- 작은 메타("DAY 4 / 6") 텍스트 **제거** → 일차는 헤더 우측 도트로만
- 중앙 상단 큰 감성 헤드라인
- 본문 비워 풍경 호흡 공간

### 레이아웃

```
[←]                   [●━ ○ ○ ○]   ← 뒤로 + 일차 도트 인디케이터


             영월에서의               ← 22px font-bold opacity-80
        4일째 밤                       ← 54px font-extrabold

   hyeonji님, 지금
   영월의 밤을 여행 중이에요          ← 환영문구


           (flex-1 비움)


   ┌─────────────────────────────┐
   │ Today's plan                │   ← 글래스모피즘 카드
   │ 오늘의 주요 일정          → │
   │ 3개의 만남이 기다려요       │
   └─────────────────────────────┘
```

- `bg-white/[0.14] backdrop-blur-2xl border border-white/25` — 풍경이 카드 뒤로 비침.
- 일차 도트: 활성 일차만 `w-6 bg-white`, 과거 `w-1.5 bg-white/70`, 미래 `w-1.5 bg-white/25`.
- "을/를" 자동 — `objParticle()` 헬퍼로 마지막 음절 받침 유무 판정.

### 하단 nav clearance

```tsx
<div
  className="relative z-10 flex flex-col min-h-[100dvh] px-7"
  style={{ paddingBottom: "var(--content-bottom)" }}
>
```

배경은 100dvh 풀블리드(floating 버튼 뒤까지 이어짐), 콘텐츠는 padding 으로 클리어런스.

---

## 5. 탭 화면들 — JourneyScreen · LetterScreen · ProfileScreen

### JourneyScreen — 섹션 24px 리듬 + 지도 일체감

**파일**: `frontend/src/screens/JourneyScreen.tsx`

- 섹션 간 `mt-6` 일관 적용 (헤더 → 나의 공간 → 지도 → 리포트).
- **지도 카드화**: 토글 + 한반도 SVG + 범례를 단일 white card 로 묶음. 카드 상단
  `bg-cream-50` 영역에 segmented 토글, 본체 가운데, 하단 그라데이션 범례
  (`낮음 ──── 높음`, view 모드 따라 주황/초록 전환).
- **segmented control 강조**: 비활성 `bg-transparent text-ink-mute`, 활성
  `bg-white text-primary ring-1 ring-primary/25 shadow-[0_2px_8px_-2px_rgba(255,112,67,.35)]`.
- 외곽 height: 매직 `calc(100dvh-6rem)` → `calc(100dvh - var(--content-bottom))`.

### LetterScreen — 카드 위계 정리

**파일**: `frontend/src/screens/LetterScreen.tsx`

- **필터 칩 active state**: ring + shadow + scale 1.03.
- **카드 위계**: 아이콘 영역(`rounded-2xl w-12 h-12`)과 텍스트 영역(`py-4 pr-4`)을
  명확히 분리. sender → title 사이 `mt-2` (8px) 줄간격. 카테고리 칩과 상대시간을
  카드 하단 row 로 분리.
- 하단 `pb-28` — floating 시뮬 버튼 클리어런스.

### ProfileScreen — '활동 로그' → '내가 찜한 청년마을'

**파일**: `frontend/src/screens/ProfileScreen.tsx`

- 명칭 변경: 활동 로그 → **내가 찜한 청년마을** (영문 pre-label `Wishlist`).
- 위치: '나의 가치' 바로 아래 (기존 순서 유지).
- **레이아웃**: 2-col grid → **가로 스크롤 rail** (`snap-x snap-mandatory`,
  카드 너비 168px, `-mx-4 px-4` 트릭으로 양쪽 가장자리 닿게).
- **카드**: 4:5 사진 forward + 하단 그라데이션 마스크 + 좌하단 흰 글씨 지역명.
  사진 아래 정보(이름, 평점, "보기 →").
- **빨간 하트**: 우상단 `w-9 h-9 rounded-full bg-white ring-2 ring-white/80
  shadow-[red-tinted]` — 빨간 그림자로 시각 punch.
- 카운트 칩: `❤️ {n}` 으로 한눈에 확인.
- 미사용 `SectionTitle` 컴포넌트 제거 + 나의 가치 헤더도 새 패턴(영문 pre + 한글)
  으로 통일.

---

## 6. 미션 화면 + 로드뷰 fallback

### MissionListScreen — Day 흔적 제거, 대화형 카피

**파일**: `frontend/src/screens/MissionListScreen.tsx`

- 헤더에서 `Day 4 · 영월` pre-label 제거.
- **일차 진행 도트 줄 완전 제거** (미션 탭에선 며칠차 안 보임).
- 카피: "오늘 하루, 어떤 걸 해볼까요?" → **"오늘 뭐가 / 제일 궁금해요?"**
  + 부제 "끌리는 카드 한 장, 톡 골라봐요".
- 진행 게이지: 영수증 톤 박스 제거, **1.5px 가는 줄** + N/M 카운트도 빼버림.

### MissionImageCard — 호기심 질문 하나만

**파일**: `frontend/src/components/MissionImageCard.tsx`

이전: 카테고리 태그 + 보상 배지 + 미션 제목 + NPC 칩 + CTA 화살표 5요소.

이후: **호기심 질문 한 줄**만.

```tsx
<button className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden
                   shadow-soft transition active:scale-[0.98]">
  <img src={bgImage} className="absolute inset-0 object-cover" />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/60" />
  {done && <div className="absolute inset-0 bg-[#3E2C20]/50" />}
  {done && <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-nature-500 ...">✓</span>}

  <div className="absolute inset-x-5 bottom-6">
    <span className="text-white/85 text-[40px] font-serif">"</span>
    <p className="text-white text-[19px] font-extrabold leading-[1.35]
                  [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
      {curiosityFor(mission)}
    </p>
  </div>
</button>
```

`MISSION_QUESTIONS` 맵(11개 공통 미션) + `description` 폴백 + 카테고리별 자동 생성.

**모션 제거**: 한 번 wiggle/scale/pop-up 마이크로 인터랙션을 넣었다가 "이상하다" 피드백
으로 **모두 제거**. `active:scale-[0.98]` CSS 한 줄만 남김.

### MissionCompleteScreen + PieceCelebration — 즉각 피드백

**파일**: `frontend/src/screens/MissionCompleteScreen.tsx`

미션 직후 즉시 시각 reward 가 들어오도록 hero 안에 `<PieceCelebration />` 추가.

```
┌──────── HERO (카테고리 컬러) ────────┐
│ Mission · 완료                       │
│ 👵 동네 어르신                       │
│ 병원 접근성 확인                     │
│ "잘 알아두세요…"                      │
│                                      │
│ ┌─┬─┬─┬─┬─┐    ✨                   │
│ │■│ │■│ │ │   이 지역의 조각이     │
│ ├─┼─┼─┼─┼─┤                          │
│ │ │■│★│ │■│   +1 모였어요          │
│ ├─┼─┼─┼─┼─┤                          │
│ │■│ │ │■│ │                          │
│ ├─┼─┼─┼─┼─┤                          │
│ │ │■│ │ │■│                          │
│ └─┴─┴─┴─┴─┘                          │
└──────────────────────────────────────┘
```

- 5×4 = 20칸 모자이크. 이미 채워진 칸(약 35%), 빈 칸, **새로 채워진 한 칸** (★).
- 새 칸은 scale 0→1.35→1 + boxShadow glow → 0, 0.9초 sparkle pop (delay 0.75s).
- 우측 ✨ 이모지 spring rotate-in + 캡션 fade-slide.

### 로드뷰 미션 fallback — 8마을 좌표 심기

**파일**: `frontend/src/data/residences.ts`, `frontend/src/screens/MissionTravelingScreen.tsx`,
`frontend/src/App.tsx`

#### 문제

`mode: "map-dialogue" / "map-info"` 미션이 30개 가까이 되는데 `kakaoPosition` 가진
건 4개뿐. 나머지는 SVG 일러스트 4슬라이드로 fallback → "로드뷰 미션"인데 실제 로드뷰가
안 뜸.

#### 좌표 우선순위 체계

```
mission.kakaoPosition (개별)
       ↓ 없으면
residence.kakaoPosition (마을 중심 fallback)
       ↓ 없으면
mission.roadviewSteps (사진 미니 로드뷰)
       ↓ 없으면
4슬라이드 SVG 일러스트
```

#### Residence 좌표 (마을 중심부, 카카오 커버리지 안정적)

| 마을 | lat, lng | 위치 |
|---|---|---|
| 강화도 | 37.7468, 126.4845 | 강화 읍내 |
| 영덕 | 36.4146, 129.3650 | 영덕읍 |
| 영월 | 37.1836, 128.4612 | 영월읍 |
| 무주 | 36.0066, 127.6611 | 무주읍 |
| 세종 연서 | 36.5878, 127.2400 | 연서면 |
| 의성 | 36.3527, 128.6973 | 의성읍 |
| 홍성 | 36.6018, 126.6604 | 홍성읍 |
| 대전 중구 | 36.3258, 127.4216 | 중촌동 |

#### 코드 연결

```tsx
// MissionTravelingScreen.tsx
type Props = {
  ...
  fallbackPosition?: { lat: number; lng: number };
};

const position = mission.kakaoPosition ?? fallbackPosition;
if (position) {
  return <RoadviewWithFallback position={position} ... />;
}
```

```tsx
// App.tsx
<MissionTravelingScreen
  mission={activeMission}
  fallbackPosition={selected?.kakaoPosition}
  ...
/>
```

**주의** — 좌표 정확도는 마을 중심부 수준. 미션이 특정 시장/병원/카페를 가리키면
미세하게 다를 수 있음. 정확도 높이려면 개별 미션마다 `kakaoPosition` 박는 게 베스트.

---

## 부수 작업

### 아이보리 톤 — 두 단계 더 밝게

**파일**: `frontend/src/index.css`, `frontend/tailwind.config.js`

기존 `#FAF6EE` → 두 차례 밝게 → 최종 **`#FFFCF7`** (거의 흰빛, 따뜻한 톤).

| 토큰 | 값 |
|---|---|
| body bg, `cream` DEFAULT/100 | `#FFFCF7` |
| `cream-50` | `#FFFEFB` |
| `cream-200` | `#F7F1E5` |
| `cream-300` 🆕 | `#EFE7D2` (더 진한 단계 추가) |

전 화면 `bg-cream` 자동 반영.

### DiscoverScreen 8px 그리드 (앞 세션 마무리분)

**파일**: `frontend/src/screens/DiscoverScreen.tsx`

- Section / SectionDivider / SectionHeader helpers.
- HeroCard / StoryCard (h-196px) / ResidenceListItem (h-88px) 균일 높이.
- "전체 보기 →" 가 CommunityScreen 과 BookingScreen 으로 라우팅.

---

## 변경 파일 (커밋 `109facb`)

```
Modified
  src/App.tsx                              (119)
  src/components/BottomNav.tsx             (195)
  src/components/KakaoRoadview.tsx          (5)
  src/components/MiniRoadview.tsx           (5)
  src/components/MissionImageCard.tsx     (114)
  src/components/RoadviewWithFallback.tsx   (5)
  src/data/residences.ts                   (12)
  src/index.css                            (31)
  src/screens/DiscoverScreen.tsx          (222)
  src/screens/JourneyScreen.tsx           (273)
  src/screens/LetterScreen.tsx            (162)
  src/screens/MissionListScreen.tsx       (111)
  src/screens/MissionTravelingScreen.tsx   (22)
  src/screens/ProfileScreen.tsx           (550)
  src/screens/ResidenceHomeScreen.tsx     (226)
  tailwind.config.js                       (11)

New
  src/components/PageShell.tsx
  src/components/TabLayout.tsx
  src/data/missionKeyInfos.ts
  src/screens/MissionCompleteScreen.tsx
```

총 +1909 / -732.

---

## 다음 주 메모

- 로드뷰 fallback 좌표 정확도: 개별 미션마다 정확한 POI 좌표 채워 넣기.
  현재는 마을 읍내 중심부라 "동네 시장" 미션이 실제 시장 위치와 1km 정도 어긋날 수 있음.
- MissionTravelingScreen 의 4슬라이드 SVG fallback 은 좌표/사진 둘 다 없을 때
  (= 신규 마을 미션 추가 직후) 안전망. 가능하면 좌표 들어가는 게 베스트.
- arrival 화면의 환영 편지: 현재 "Start missions" 탭 시점에 발송. 사용자가 arrival
  에서 곧장 탭 전환하면 편지를 못 받을 가능성. 필요 시 `handleTravelComplete` 안으로
  옮기는 작업.
- 컴포넌트 내부 상태(미션 진행 중 선택한 답 등)는 tab1Route 와 별도로 unmount 시
  소실됨. 끊김 없는 UX 필요하면 App 레벨 상태로 끌어올려야 함.
