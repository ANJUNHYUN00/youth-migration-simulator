// 청풍 온보딩 — 답안 누적 → 새 유형 시스템 결과 산출
// 메인 = 자세 (Stance: alone/together × rest/make) — 답안에서 산출
// 부제 = 환경 (EnvType: mountain/sea/field/village) — 사용자가 직접 선택

import type { EnvType, Stance } from "./lifestyle";

// =====================================================================
// OnboardingData
// =====================================================================

// balanceA(산 vs 바다)는 v2에서 제거 — EnvChoiceScreen이 환경 직접 선택
export type BalanceB = "alone" | "together";  // 혼자/같이
export type BalanceC = "rest" | "make";       // 쉼/만들기

export type OnboardingData = {
  email: string;
  birth: { year: string };
  homeRegion: string;
  interests: string[];
  balanceB?: BalanceB;
  balanceC?: BalanceC;
  values: string[];
  dayScene?: string;
  healing?: string;
  regionDesc: string;
  // v2: 환경 직접 선택
  envChoice?: EnvType;
  // 마지막 단계 — 청풍에서 사용자를 부르는 이름
  nickname: string;
};

export const initialOnboardingData: OnboardingData = {
  email: "",
  birth: { year: "" },
  homeRegion: "",
  interests: [],
  values: [],
  regionDesc: "",
  nickname: "",
};

// =====================================================================
// 옵션 목록 — 자세(Stance) 가중치 기반
// =====================================================================

export const interestOptions: string[] = [
  "영화", "독서", "공연", "전시", "음악", "여행",
  "맛집투어", "캠핑", "반려동물", "뜨개질", "공예",
  "러닝", "바이크", "테니스", "등산", "요가/명상",
];

type StanceWeight = Partial<Record<Stance, number>>;

// 가치 칩 (multi, max 5) — 4축 매핑이 명확하게 재구성
export const valueOptions: { label: string; weight: StanceWeight }[] = [
  // alone_rest 톤
  { label: "고요함", weight: { alone_rest: 2 } },
  { label: "안정감", weight: { alone_rest: 2 } },
  { label: "회복", weight: { alone_rest: 2, together_rest: 1 } },
  { label: "자기관리", weight: { alone_rest: 1, alone_make: 1 } },
  // alone_make 톤
  { label: "몰입", weight: { alone_make: 2 } },
  { label: "자기 표현", weight: { alone_make: 2 } },
  { label: "탐험", weight: { alone_make: 2 } },
  { label: "성장", weight: { alone_make: 1, together_make: 1 } },
  // together_rest 톤
  { label: "사랑", weight: { together_rest: 2 } },
  { label: "친밀감", weight: { together_rest: 2 } },
  { label: "함께함", weight: { together_rest: 1, together_make: 1 } },
  // together_make 톤
  { label: "공동체", weight: { together_make: 2 } },
  { label: "기여", weight: { together_make: 2 } },
  { label: "도전", weight: { together_make: 1, alone_make: 1 } },
];

// 풍경의 하루 (single) — 자세 4축을 골고루 자극
export type DaySceneOption = { label: string; weight: StanceWeight };
export const dayScenes: DaySceneOption[] = [
  {
    label: "혼자 카페에서 책 읽으며 흘려보내기",
    weight: { alone_rest: 3 },
  },
  {
    label: "조용한 작업실에서 일하기",
    weight: { alone_make: 3 },
  },
  {
    label: "친구들과 동네 시장 구경하고 수다",
    weight: { together_rest: 3 },
  },
  {
    label: "동네 사람들과 모여 함께 일하기",
    weight: { together_make: 3 },
  },
];

// 힐링 (single) — 자세 4축 명확
export type HealingOption = { label: string; weight: StanceWeight };
export const healings: HealingOption[] = [
  { label: "완전한 고요 속에서 푹 자기", weight: { alone_rest: 3 } },
  {
    label: "작업실에서 뭔가 만들기",
    weight: { alone_make: 3 },
  },
  {
    label: "친한 사람과 따뜻한 차 한 잔",
    weight: { together_rest: 3 },
  },
  {
    label: "함께 모여 새로운 걸 시도하는 워크숍",
    weight: { together_make: 3 },
  },
  {
    label: "산책하며 마음 비우기",
    weight: { alone_rest: 2, together_rest: 1 },
  },
];

// =====================================================================
// 환경 선택 옵션
// =====================================================================

export type EnvChoiceOption = {
  value: EnvType;
  emoji: string;
  label: string;
  hint: string;
};

export const envChoices: EnvChoiceOption[] = [
  {
    value: "mountain",
    emoji: "🏔",
    label: "산·숲",
    hint: "고요한 산 공기와 계곡",
  },
  {
    value: "sea",
    emoji: "🌊",
    label: "바다·해안",
    hint: "파도 소리와 갯벌",
  },
  {
    value: "field",
    emoji: "🌾",
    label: "들·평야",
    hint: "너른 논과 밭",
  },
  {
    value: "village",
    emoji: "🏘",
    label: "도시·골목",
    hint: "사람 사는 골목과 시장",
  },
];

// =====================================================================
// 라이프스타일 메타 — 옛 (호환용, 점진 제거 예정)
// =====================================================================

import type { LifeStyleType } from "./residences";

export const lifestyleMeta: Record<
  LifeStyleType,
  { emoji: string; tagline: string; description: string }
> = {
  레저형: {
    emoji: "🌊",
    tagline: "움직임으로 풀리는 사람",
    description:
      "몸을 움직이고 새로운 경험을 즐기는 당신. 활동적인 자연이 있는 지역이 잘 맞아요.",
  },
  자연탐험형: {
    emoji: "🌿",
    tagline: "계절의 결을 모으는 사람",
    description:
      "느린 호흡 속에서 자연을 관찰하는 당신. 산과 들이 가까운 곳에서 충전돼요.",
  },
  디지털노마드형: {
    emoji: "💻",
    tagline: "일과 쉼의 균형을 짓는 사람",
    description:
      "어디서나 일하지만 쉼은 도시 밖에서 찾는 당신. 작업과 자연이 공존하는 곳이 좋아요.",
  },
  집돌이형: {
    emoji: "🏠",
    tagline: "자기만의 리듬이 또렷한 사람",
    description:
      "익숙한 공간에서 안정감을 찾는 당신. 한적하고 자기 페이스대로 살기 좋은 곳이 어울려요.",
  },
};

// =====================================================================
// 스코어링 — 답안 → { env, stance }
// =====================================================================

export function scoreOnboarding(data: OnboardingData): {
  env: EnvType;
  stance: Stance;
} {
  const stanceTally: Record<Stance, number> = {
    alone_rest: 0,
    alone_make: 0,
    together_rest: 0,
    together_make: 0,
  };

  const apply = (w: StanceWeight) => {
    for (const [k, v] of Object.entries(w) as [Stance, number][]) {
      stanceTally[k] += v;
    }
  };

  // balanceB (혼자 vs 같이) — sociality 강한 신호
  if (data.balanceB === "alone") {
    stanceTally.alone_rest += 2;
    stanceTally.alone_make += 2;
  }
  if (data.balanceB === "together") {
    stanceTally.together_rest += 2;
    stanceTally.together_make += 2;
  }

  // balanceC (쉼 vs 만들기) — activity mode 강한 신호
  if (data.balanceC === "rest") {
    stanceTally.alone_rest += 2;
    stanceTally.together_rest += 2;
  }
  if (data.balanceC === "make") {
    stanceTally.alone_make += 2;
    stanceTally.together_make += 2;
  }

  // values (multi)
  for (const v of data.values) {
    const opt = valueOptions.find((o) => o.label === v);
    if (opt) apply(opt.weight);
  }

  // dayScene (single)
  if (data.dayScene) {
    const opt = dayScenes.find((d) => d.label === data.dayScene);
    if (opt) apply(opt.weight);
  }

  // healing (single)
  if (data.healing) {
    const opt = healings.find((h) => h.label === data.healing);
    if (opt) apply(opt.weight);
  }

  // 최고점 자세 (동점 시 alone_rest 기본)
  let bestStance: Stance = "alone_rest";
  let max = -1;
  for (const k of Object.keys(stanceTally) as Stance[]) {
    if (stanceTally[k] > max) {
      max = stanceTally[k];
      bestStance = k;
    }
  }

  // 환경: 사용자 직접 선택 (envChoice). 미선택 시 기본 mountain.
  const env: EnvType = data.envChoice ?? "mountain";

  return { env, stance: bestStance };
}
