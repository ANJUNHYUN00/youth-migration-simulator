# 2026-06-05 — 온보딩 점수 로직 (스코어링 명세)

청풍 온보딩 11단계 중 사용자 답안이 **결과 유형(EnvType + Stance)** 으로 어떻게 환산되는지
정확한 가중치와 산출 공식을 정리. 코드 참고: `frontend/src/data/quiz.ts`,
`frontend/src/data/lifestyle.ts`.

---

## 결과 모델 — 두 축

청풍의 라이프스타일 결과는 두 가지 카테고리의 곱.

| 축 | 타입 | 값 |
|---|---|---|
| **환경 (Env)** | `EnvType` | `mountain` / `sea` / `field` / `village` |
| **자세 (Stance)** | `Stance` | `alone_rest` / `alone_make` / `together_rest` / `together_make` |

- **Env** 는 **사용자가 직접 선택**해서 정해짐 (점수 누적 X) — EnvChoiceScreen.
- **Stance** 는 **여러 질문의 가중치 합산** → 최고점 자세 1개 채택.

즉 "취미/관심사/가치/하루풍경/힐링/balance 2개" 중에서 점수가 **누적되는 건 Stance 한 축뿐**.
Env는 명시 선택이라 점수 개념 없음.

---

## 어떤 질문이 점수에 들어가나

11단계 중 **점수가 매겨지는 질문은 5개**.

| Step | 질문 | 입력 | 점수 영향 | 비고 |
|---|---|---|---|---|
| 1 | 이메일 | text | — | 저장만 |
| 2 | 출생연도 | text | — | 저장만 |
| 3 | 본 지역 | 시/도 + 시/군/구 | — | 저장만 (이동 출발지 좌표) |
| 4 | 취미와 관심사 | multi chips | **❌ 점수 없음** | 저장만 (UI 개인화용 여지) |
| 5 | balanceB — 한가한 주말 | `alone` / `together` | ✅ Stance | sociality 축 |
| 6 | balanceC — 낯선 동네 시간 | `rest` / `make` | ✅ Stance | activity mode 축 |
| 7 | 가치 (소중히 여기는 것) | multi (최대 5) | ✅ Stance | 각 옵션마다 가중치 |
| 8 | 어떤 풍경의 하루 | single | ✅ Stance | |
| 9 | 나에게 힐링이란 | single | ✅ Stance | |
| 10 | 환경 (산/바다/들/골목) | single | **✅ Env (직접 채택)** | 점수 누적 아님 |
| 11 | 본 지역 한 줄 묘사 | text | — | 저장만 |

> **주의 (직관과 어긋날 수 있는 부분)**: "취미와 관심사" 와 "본 지역 한 줄 묘사" 는 결과 산출에
> 영향을 주지 않음. 현재는 저장만 됨. 영향 주고 싶다면 `quiz.ts`의 `interestOptions` 에
> `StanceWeight` 매핑을 추가하고 `scoreOnboarding` 에서 합산하면 됨 (향후 작업 후보).

---

## Stance 산출 공식

```ts
// quiz.ts — scoreOnboarding 의 핵심 흐름
const stanceTally: Record<Stance, number> = {
  alone_rest: 0,
  alone_make: 0,
  together_rest: 0,
  together_make: 0,
};

// 1) balanceB
// 2) balanceC
// 3) values (multi)
// 4) dayScene (single)
// 5) healing (single)

// 최고점 자세 채택 (동점이면 alone_rest 기본)
```

각 가중치를 누적한 뒤, 4개 자세 중 **가장 점수 높은 것 1개**가 최종 Stance.

### Stance 4축 의미

| Stance | 라벨 | 한 줄 |
|---|---|---|
| `alone_rest` | 산책자형 | 혼자 + 쉼 — 조용히 자기 호흡 |
| `alone_make` | 작업실형 | 혼자 + 만들기 — 손으로 짓고 빚기 |
| `together_rest` | 사랑방형 | 같이 + 쉼 — 차 한 잔의 시간 |
| `together_make` | 마을기획자형 | 같이 + 만들기 — 동네에 무언가 보태기 |

---

## 가중치 표

### Step 5 — balanceB (혼자 vs 같이)

| 선택 | alone_rest | alone_make | together_rest | together_make |
|---|---|---|---|---|
| `alone` (혼자 사부작) | **+2** | **+2** | 0 | 0 |
| `together` (친구들과 어울리기) | 0 | 0 | **+2** | **+2** |

→ sociality 축(alone↔together) 양분.

### Step 6 — balanceC (쉼 vs 만들기)

| 선택 | alone_rest | alone_make | together_rest | together_make |
|---|---|---|---|---|
| `rest` (멍 때리기) | **+2** | 0 | **+2** | 0 |
| `make` (손으로 만들기) | 0 | **+2** | 0 | **+2** |

→ activity mode 축(rest↔make) 양분.

> balanceB + balanceC가 합쳐지면 한 자세에 **최대 +4** 점이 쏠림 (예: alone+rest → alone_rest +4).

### Step 7 — values (multi, 최대 5개)

| 라벨 | alone_rest | alone_make | together_rest | together_make |
|---|---|---|---|---|
| 고요함 | +2 | | | |
| 안정감 | +2 | | | |
| 회복 | +2 | | +1 | |
| 자기관리 | +1 | +1 | | |
| 몰입 | | +2 | | |
| 자기 표현 | | +2 | | |
| 탐험 | | +2 | | |
| 성장 | | +1 | | +1 |
| 사랑 | | | +2 | |
| 친밀감 | | | +2 | |
| 함께함 | | | +1 | +1 |
| 공동체 | | | | +2 |
| 기여 | | | | +2 |
| 도전 | | +1 | | +1 |

→ 14개 라벨, 4축 톤 골고루. 사용자는 **최대 5개**까지 선택 → 한 자세에 누적될 수 있는
최대 가산은 ~10 (전부 한 톤으로 골랐을 때).

### Step 8 — dayScene (single, "어떤 풍경의 하루")

| 라벨 | alone_rest | alone_make | together_rest | together_make |
|---|---|---|---|---|
| 혼자 카페에서 책 읽으며 흘려보내기 | **+3** | | | |
| 조용한 작업실에서 손에 흙·실 묻히기 | | **+3** | | |
| 친구들과 동네 시장 구경하고 수다 | | | **+3** | |
| 동네 사람들과 모여 함께 일하기 | | | | **+3** |
| 산책하다 카페 들르고, 잠깐 끄적이기 | +1 | +1 | +1 | |

→ 단일 선택, 한 자세에 **최대 +3**. 마지막 옵션은 "혼합형" 사용자 위한 분산.

### Step 9 — healing ("나에게 힐링이란")

| 라벨 | alone_rest | alone_make | together_rest | together_make |
|---|---|---|---|---|
| 완전한 고요 속에서 푹 자기 | **+3** | | | |
| 작업실에서 무언가 손으로 만들기 | | **+3** | | |
| 친한 사람과 따뜻한 차 한 잔 | | | **+3** | |
| 함께 모여 새로운 걸 시도하는 워크숍 | | | | **+3** |
| 산책하며 마음 비우기 | +2 | | +1 | |

→ dayScene 과 같은 +3 톤. 마지막 "산책" 은 alone_rest 우세하지만 together_rest도 끌어줌.

### Step 10 — envChoice (Env 직접 채택)

```ts
const env: EnvType = data.envChoice ?? "mountain";
```

| 선택 | 결과 Env |
|---|---|
| `mountain` (🏔 산·숲) | `mountain` |
| `sea` (🌊 바다·해안) | `sea` |
| `field` (🌾 들·평야) | `field` |
| `village` (🏘 도시·골목) | `village` |
| 미선택 | `mountain` (기본값) |

→ **점수 누적 아님**. 사용자 선택 그대로가 결과 Env.

---

## 한 자세에 누적될 수 있는 이론적 최대치

| Step | 한 자세 최대 가산 |
|---|---|
| balanceB | +2 |
| balanceC | +2 |
| values (5개 선택 가정) | ~+10 (전부 한 톤만 골랐을 때) |
| dayScene | +3 |
| healing | +3 |
| **합계** | **~+20** |

실전에선 값/씬/힐링이 같은 톤으로 일관될 때 한 자세에 압도적 점수가 몰리고, 분산되면
서로 비슷한 점수가 나옴. 동점 시 `alone_rest` 가 기본.

```ts
// 동점 처리 — 첫 번째로 max에 도달한 키 채택, iteration 순서대로 alone_rest 우선
let bestStance: Stance = "alone_rest";
let max = -1;
for (const k of Object.keys(stanceTally) as Stance[]) {
  if (stanceTally[k] > max) {
    max = stanceTally[k];
    bestStance = k;
  }
}
```

---

## 결과 후속 사용 — 매칭과 호환

### 1) 청년마을 추천 점수 (`matchResidenceScore`)

산출된 `{ env, stance }` 가 각 청년마을의 `{ envType, stance, stanceAlt? }` 와 매칭됨
(`lifestyle.ts`).

```ts
let score = 0;
if (residence.envType === profile.env)   score += 60;  // 환경 일치
if (residence.stance === profile.stance) score += 30;  // 자세 정확 일치
else if (residence.stanceAlt?.includes(profile.stance)) score += 15;  // 보조 일치
// 같은 sociality OR 같은 activity 축 일치 시 +5씩
```

- **환경 가중**(60) > **자세 가중**(30): 환경 일치가 1순위.
- 매칭 강도 라벨 — `matchLabel(score)`:
  - 80+ → strong / 50+ → good / 25+ → alt / 그 미만 → weak

### 2) 옛 유형(`LifeStyleType`) 호환 (`stanceToOld`)

기존 미션 데이터 옵션에 박혀있는 옛 4유형(레저/자연탐험/디지털노마드/집돌이) 호환용.

| Stance | → 옛 LifeStyleType |
|---|---|
| `alone_rest` | 자연탐험형 |
| `alone_make` | 디지털노마드형 |
| `together_rest` | 집돌이형 |
| `together_make` | 레저형 |

`App.tsx`가 `lifestyle` 값을 그대로 받기 때문에, 옛 매칭 코드(`fitDeltaForOptionV2` 등)와도
호환됨.

---

## 한 줄 요약

> 11단계 중 **점수에 진짜 영향 주는 건 5개** (balanceB, balanceC, values, dayScene, healing).
> 이 5개의 가중치가 4개 자세(`Stance`)에 누적되고, 최고점 자세가 결과 자세로 채택됨.
> 환경(`Env`)은 사용자가 한 번 콕 찍는 거 그대로 사용. 취미/관심사·본 지역 한 줄 묘사는
> 현재 점수 영향 없음(저장만).
