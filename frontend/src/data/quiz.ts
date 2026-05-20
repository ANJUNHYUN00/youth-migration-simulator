// 라이프스타일 진단 — PRD 1.온보딩 (4지선다 3문항)
// 각 선택지마다 1개 유형에 +1점, 모든 문항 합산 후 최고점 유형이 결과.

import type { LifeStyleType } from "./residences";

export type QuizOption = {
  label: string;
  emoji: string;
  type: LifeStyleType;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "주말에 비어 있는 하루, 어떻게 보내고 싶어요?",
    options: [
      { label: "바다나 산에서 액티비티 즐기기", emoji: "🌊", type: "레저형" },
      { label: "숲길 따라 산책하며 새소리 듣기", emoji: "🌿", type: "자연탐험형" },
      { label: "조용한 작업실에서 커피와 함께", emoji: "💻", type: "디지털노마드형" },
      { label: "집에서 영화 보거나 책 읽기", emoji: "🏠", type: "집돌이형" },
    ],
  },
  {
    id: "q2",
    prompt: "여행지에서 가장 끌리는 풍경은요?",
    options: [
      { label: "파도가 일렁이는 해변", emoji: "🏖️", type: "레저형" },
      { label: "안개 낀 산속의 새벽 숲", emoji: "🌫️", type: "자연탐험형" },
      { label: "한적한 카페에서 노트북 펴기", emoji: "☕️", type: "디지털노마드형" },
      { label: "햇살 잘 드는 따뜻한 방", emoji: "🛋️", type: "집돌이형" },
    ],
  },
  {
    id: "q3",
    prompt: "이주를 결심한다면 가장 기대되는 건요?",
    options: [
      { label: "야외 활동을 매일 즐길 수 있는 일상", emoji: "🚴", type: "레저형" },
      { label: "사계절 자연 변화를 체험하는 시간", emoji: "🍁", type: "자연탐험형" },
      { label: "일과 쉼의 균형을 다시 잡는 것", emoji: "⚖️", type: "디지털노마드형" },
      { label: "나만의 시간이 충분한 차분한 하루", emoji: "🕯️", type: "집돌이형" },
    ],
  },
];

// 라이프스타일 유형 메타 — 결과 화면에서 보여줄 라벨/설명
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

// 답안 배열에서 최종 유형을 산출. 동점 시 첫 번째 우선.
export function scoreQuiz(
  answers: { questionId: string; type: LifeStyleType }[]
): LifeStyleType {
  const tally: Record<LifeStyleType, number> = {
    레저형: 0,
    자연탐험형: 0,
    디지털노마드형: 0,
    집돌이형: 0,
  };
  for (const a of answers) tally[a.type] += 1;

  let best: LifeStyleType = "자연탐험형";
  let max = -1;
  for (const type of Object.keys(tally) as LifeStyleType[]) {
    if (tally[type] > max) {
      max = tally[type];
      best = type;
    }
  }
  return best;
}
