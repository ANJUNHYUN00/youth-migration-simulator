// 청풍 유형 시스템 (v2)
// 메인 = 환경 (산/바다/들/골목 — 사용자에게 4유형으로 표시)
// 부제 = 자세 (혼자·같이 × 쉼·만들기 — 결과 카드 보조 정보 + 매칭 점수)
//
// 의미 ID 기반이라 표시명은 가제로 두고 자유롭게 변경 가능 — meta만 수정.

// =====================================================================
// 타입
// =====================================================================

export type EnvType = "mountain" | "sea" | "field" | "village";

export type Sociality = "alone" | "together";
export type ActivityMode = "rest" | "make";
export type Stance = "alone_rest" | "alone_make" | "together_rest" | "together_make";

export type LifestyleProfile = {
  env: EnvType;
  stance: Stance;
};

// =====================================================================
// 환경 메타 — 사용자에게 메인 유형으로 표시되는 4개
// =====================================================================

export const envMeta: Record<
  EnvType,
  {
    emoji: string;
    name: string;        // 가제
    blurb: string;       // 짧은 설명 (한 단어급)
    description: string; // 풀 설명
  }
> = {
  mountain: {
    emoji: "🏔",
    name: "산사람형",
    blurb: "산·숲·계곡",
    description: "산과 숲의 공기를 따라 살고 싶은 사람",
  },
  sea: {
    emoji: "🌊",
    name: "바다사람형",
    blurb: "바다·해안",
    description: "바닷가의 리듬에 자기 호흡을 맞추는 사람",
  },
  field: {
    emoji: "🌾",
    name: "들사람형",
    blurb: "들·평야",
    description: "들과 논밭의 너른 풍경에서 안정을 찾는 사람",
  },
  village: {
    emoji: "🏘",
    name: "골목사람형",
    blurb: "골목·동네",
    description: "사람 사는 골목과 시장 분위기가 좋은 사람",
  },
};

// =====================================================================
// 자세 메타 — 부제로 사용
// =====================================================================

export const stanceMeta: Record<
  Stance,
  {
    name: string;     // 가제 — 자세 메인 유형 이름 (메인 표시)
    emoji: string;    // 캐릭터 이모지
    label: string;    // "혼자 + 쉼" 같은 짧은 라벨 (부제 한 줄)
    tagline: string;  // 한 줄 부제
    description: string; // 풀 설명
  }
> = {
  alone_rest: {
    name: "산책자형",
    emoji: "🌿",
    label: "혼자 + 쉼",
    tagline: "조용히 자기 호흡으로 비우는 시간",
    description: "혼자만의 시간 속에서 자연의 결을 느끼며 회복하는 사람.",
  },
  alone_make: {
    name: "작업실형",
    emoji: "🪵",
    label: "혼자 + 만들기",
    tagline: "작업실에서 손으로 무언가 만드는 시간",
    description: "조용한 공간에서 손과 머리로 무언가 짓고 빚는 사람.",
  },
  together_rest: {
    name: "사랑방형",
    emoji: "🍵",
    label: "같이 + 쉼",
    tagline: "사람들과 어울리며 천천히",
    description: "동네 사람들과 마주 앉아 차 한 잔의 시간을 채우는 사람.",
  },
  together_make: {
    name: "마을기획자형",
    emoji: "🌾",
    label: "같이 + 만들기",
    tagline: "동네에 무언가 보태는 시간",
    description: "사람들과 손을 모아 마을에 무언가 새로 짓는 사람.",
  },
};

// =====================================================================
// 옛 LifeStyleType → 새 Stance 마이그레이션
// 기존 미션 옵션의 traits 배열이 새 체계로 동작하도록 매핑
// =====================================================================

import type { LifeStyleType } from "./residences";

export const oldToStance: Record<LifeStyleType, Stance> = {
  자연탐험형: "alone_rest",     // 조용한 자연 탐색
  집돌이형: "alone_rest",        // 혼자 조용히
  디지털노마드형: "alone_make",  // 혼자 작업
  레저형: "together_make",      // 활동·어울림
};

// 새 Stance → 옛 LifeStyleType (호환용 — App.tsx의 fitDelta 등 옛 코드)
// 매핑은 다소 헐거움 — 정확한 매칭은 새 시스템 사용
export function stanceToOld(stance: Stance): LifeStyleType {
  switch (stance) {
    case "alone_rest":
      return "자연탐험형";
    case "alone_make":
      return "디지털노마드형";
    case "together_rest":
      return "집돌이형";
    case "together_make":
      return "레저형";
  }
}

// 옛 → 새 Env 추정 매핑 (옵션이 환경적 선호를 표현하는 경우)
// 1차로는 stance만 사용하고 env는 사용자 직접 선택으로 처리.
// 미션 옵션에서 env hint가 명확한 경우만 보조적으로 가산.
export const oldToEnvHint: Partial<Record<LifeStyleType, EnvType>> = {
  자연탐험형: "mountain",  // 산·자연 끌림
  레저형: "sea",            // 활동·바다 끌림
};

// =====================================================================
// 추천 점수 — 청년마을 vs 사용자 프로필
// 환경 일치 +60, 자세 일치 +30, 부분 일치 +10
// =====================================================================

export type RecommendableResidence = {
  envType: EnvType;
  // 청년마을이 어울리는 자세 — 하나가 메인, 추가 어울림은 secondary
  stance: Stance;
  stanceAlt?: Stance[]; // 보조로 어울리는 자세
};

export function matchResidenceScore(
  profile: LifestyleProfile,
  residence: RecommendableResidence
): number {
  let score = 0;
  if (residence.envType === profile.env) score += 60;
  if (residence.stance === profile.stance) score += 30;
  else if (residence.stanceAlt?.includes(profile.stance)) score += 15;

  // 같은 sociality 축이라도 다른 mode면 부분 점수
  const sameSocial = sameSociality(residence.stance, profile.stance);
  const sameMode = sameActivity(residence.stance, profile.stance);
  if (residence.stance !== profile.stance) {
    if (sameSocial) score += 5;
    if (sameMode) score += 5;
  }
  return score;
}

function sameSociality(a: Stance, b: Stance): boolean {
  return a.split("_")[0] === b.split("_")[0];
}
function sameActivity(a: Stance, b: Stance): boolean {
  return a.split("_")[1] === b.split("_")[1];
}

// 매칭 강도 라벨 (UI 표시용)
export function matchLabel(score: number): "strong" | "good" | "alt" | "weak" {
  if (score >= 80) return "strong";
  if (score >= 50) return "good";
  if (score >= 25) return "alt";
  return "weak";
}
