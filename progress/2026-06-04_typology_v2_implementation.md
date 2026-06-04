# 2026-06-04 — 새 유형 시스템 구현 (자세 메인 + 환경 부제 + 청년마을 8곳)

이전 노트 `2026-06-04_youth_village_typology.md`에서 결정한 구조를 코드로 옮기고, 옛 LifeStyleType 잔재까지 정리한 작업.

## 핵심 변경

### 1. 새 유형 시스템 (`lifestyle.ts`)
의미 ID 기반으로 자세(Stance)와 환경(Env) 분리.

```ts
type EnvType = "mountain" | "sea" | "field" | "village";
type Stance = "alone_rest" | "alone_make" | "together_rest" | "together_make";
type LifestyleProfile = { env: EnvType; stance: Stance };
```

`envMeta`/`stanceMeta`에 이모지·이름·태그라인·설명 보관.
가제 이름: 산책자형 / 작업실형 / 사랑방형 / 마을기획자형.

### 2. 추천 점수 함수
```
환경 일치 +60, 자세 일치 +30, 보조 자세(stanceAlt) +15
같은 sociality / 같은 mode 부분 일치 +5
matchLabel(score) → strong / good / alt / weak
```

### 3. 청년마을 8곳 (`residences.ts`)
| id | 지역 | 청년마을 | env | stance |
|---|---|---|---|---|
| ganghwa | 강화도 | 청풍 | sea | together_rest |
| yeongdeok | 영덕 | 뚜벅이마을 | sea | alone_rest |
| yeongwol | 영월 | 밭멍 | mountain | alone_rest |
| muju | 무주 | 산타지 | mountain | alone_make |
| sejong | 세종 연서 | 농땡이월드 | field | together_rest |
| uiseong | 의성 | 나만의성 | field | together_make |
| hongseong | 홍성 | 집단지성 | village | together_make |
| daejeon | 대전 중구 | weave on | village | alone_make |

분포 균형 2/2/2/2. Residence type에 `envType`, `stance`, `stanceAlt`, `isYouthVillage` 필드 추가.

### 4. 온보딩 퀴즈 풀 재설계 (`quiz.ts` + `OnboardingShell`)
- **balanceA 제거**: 산 vs 바다 → EnvChoiceScreen이 직접 묻기로 대체
- **balanceB 재구성**: "한가한 주말 오후, 어떻게 보내고 싶어요?" — 혼자 사부작 vs 친구들과 어울리기
- **balanceC 재구성**: "낯선 동네에서 끌리는 시간은?" — 멍 때리기 vs 손으로 만들기
- **values 14개**: 4축(alone_rest/make · together_rest/make)에 명확 매핑 — 고요함/몰입/친밀감/공동체/기여 등
- **dayScenes 5개**: 각 자세 강하게 자극 — "조용한 작업실에서 손에 흙·실 묻히기", "동네 사람들과 모여 함께 일하기" 등
- **healings 5개**: 4축 매핑 — "작업실에서 무언가 손으로 만들기", "함께 모여 새로운 걸 시도하는 워크숍" 등

**총 질문: 12 → 11개** (balanceA 빠짐, EnvChoice 추가는 이미 있었음)

`scoreOnboarding(data)` 반환: `{ env: EnvType, stance: Stance }`.

### 5. 환경 선택 화면 (`EnvChoiceScreen.tsx`)
4지선다 카드 (산·숲/바다·해안/들·평야/도시·골목) — 단일 선택 후 자동 진행.

### 6. 결과 화면 (`ResultScreen.tsx`)
- 자세 이모지 + 이름 (메인)
- 자세 라벨 (`혼자 + 쉼` 등)
- 환경 부제 칩 (사용자가 선택한 풍경)
- 자세 description 한 줄
- 추천 청년마을 카드 — 점수 라벨 (⭐강력추천 / 이 분위기도 어울려요 / 다른 풍경도 한번)
- 약한 매칭(<25점)은 필터 (최소 2개는 보장)

### 7. 미션 적합도 마이그레이션
미션 옵션의 `traits` 배열은 옛 `LifeStyleType` 그대로 두고, `oldToStance` 매핑으로 stance 비교.

```ts
fitDeltaForOptionV2(option, residence.stance, residence.stanceAlt)
```

- option.traits를 stance로 매핑
- 첫 번째 stance 일치: +2
- 다른 위치에 stance 포함: +1
- stanceAlt 일치: +1
- 어긋남: 0

`MissionExecuteScreen` prop `residenceMatchType` → `residenceStance` + `residenceStanceAlt`.

### 8. 옛 LifeStyleType 표시 제거
사용자에게 "레저형 / 자연탐험형 / 디지털노마드형 / 집돌이형"이 안 보이도록 표시 갱신.

| 화면 | 변경 |
|---|---|
| `ProfileCard` (나의 여정) | "{lifestyle}" → `stanceMeta[stance].name` + `envMeta[env].emoji + blurb` |
| `ResidenceSheet` (떠나기 마커 클릭) | matchType 뱃지 → stance 이름 + env 이모지·blurb |
| `BookingDetailScreen` | "추천 라이프스타일 · 레저형" → "추천 유형 · 사랑방형 🌊 바다·해안" |
| `ResidenceListScreen` | "{lifestyle}에 가까운" 문구 단순화, 매칭 % 라벨에서 옛 유형명 제거 |
| `ResidenceDetailScreen` | 매칭 사유 — stance 이름 + env 표시 |
| `SettingsScreen` | "나의 라이프스타일 유형" → 자세 + 환경 카드 |
| `DepartureScreen` | "{lifestyle}에 어울리는" → "당신에게 어울리는 청년마을" |

### 9. 떠나기 추천 — env 우선 필터 + "가장 추천" 표시
- 사용자 환경(예: 바다)과 일치하는 청년마을 위주로 **최대 3곳**만 노출
- 환경 일치가 부족하면 자세 강하게 맞는 곳 보조 추가
- 최고 점수(≥30) 청년마을은 **골드 톤 마커 + ⭐"가장 추천" 뱃지**
- 분포 균형(2 per env) 덕분에 보통 환경 일치 2곳 + 보조 1곳

### 10. App.tsx 흐름
- `SavedProfile`에 `profileV2?: LifestyleProfile` 필드 추가
- `OnboardingResult` 타입에 `profile` 포함, 결과화면이 새 profile 직접 사용
- DepartureScreen / JourneyScreen / SettingsScreen에 `profile.profileV2` 전달

## 결정 메모

### 자세 메인 + 환경 부제
사용자가 자기 환경 선호는 이미 알고 있어서 진단 임팩트가 적음. 자세가 메인이어야 "오, 나 이런 사람이었구나" 발견이 옴. 환경은 부제로, 그러나 추천 가중치는 큼.

### "잠시섬" 단어 노출 시점
balanceC 제목에 "잠시섬에서 끌리는 시간은?"이라고 썼다가 → 온보딩 시점에 청풍 내부 용어가 노출되는 게 어색해서 **"낯선 동네에서 끌리는 시간은?"**으로 변경.

### 가제는 가제로 유지
산책자형/작업실형/사랑방형/마을기획자형 — 이름은 가제. `stanceMeta` 4줄만 수정하면 변경 가능. 코드 ID(`alone_rest` 등)는 그대로.

### 미션 traits는 옛 LifeStyleType 그대로
미션 옵션의 traits를 일일이 새 stance로 바꾸지 않고 `oldToStance` 매핑으로 변환. 데이터 마이그레이션 부담 ↓ + fitDelta 정확도는 충분히 유지.

## 신규 파일
- `frontend/src/data/lifestyle.ts`
- `frontend/src/screens/onboarding/EnvChoiceScreen.tsx`

## 다음 작업 (보류)
- [ ] 청년마을 7곳(영덕·영월·무주·세종·의성·홍성·대전) 지역 미션 4개씩 작성 (총 28개)
- [ ] 청년마을 7곳의 `villageConfig` (마을 홈 헤더/도착 메시지 등) 작성
- [ ] 결과 후속: ValuesScreen/SceneScreen/HealingScreen UI 카피도 새 톤에 맞게 더 다듬을지 검토
- [ ] 옛 잔재(불필요한 `lifestyle` prop) 정리 — 동작에는 영향 없지만 깔끔 정리
