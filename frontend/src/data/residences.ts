// 추천 레지던스 목 데이터 — PRD: "추천 레지던스 마커 2-3개"
// xPct / yPct는 KoreaMap viewBox(240x440) 내부 상대 좌표(%)
// 추후 백엔드 API 연결 시 매칭 알고리즘 결과로 교체

export type LifeStyleType =
  | "레저형"
  | "자연탐험형"
  | "디지털노마드형"
  | "집돌이형";

export type Residence = {
  id: string;
  region: string;        // 지역명 (마커에 노출)
  name: string;          // 레지던스 이름
  duration: string;      // 프로그램 기간
  matchType: LifeStyleType;
  matchReason: string;   // 매칭 이유 한 줄 설명
  xPct: number;          // 마커 X 좌표 (0~100)
  yPct: number;          // 마커 Y 좌표 (0~100)
  themeEmoji: string;    // 카드 상단 작은 아이콘
};

export const residences: Residence[] = [
  {
    id: "ganghwa",
    region: "강화도",
    name: "강화 잠시섬 하우스",
    duration: "4박 5일",
    matchType: "자연탐험형",
    matchReason: "조용한 분위기와 산책 코스를 선호하는 당신에게 잘 맞아요",
    xPct: 36,
    yPct: 38,
    themeEmoji: "🌿",
  },
  {
    id: "gwangyang",
    region: "광양",
    name: "광양 매화마을 레지던스",
    duration: "5박 6일",
    matchType: "디지털노마드형",
    matchReason: "느린 호흡 속에서 일과 쉼이 함께 흐르는 곳이에요",
    xPct: 42,
    yPct: 80,
    themeEmoji: "🌸",
  },
  {
    id: "geoje",
    region: "거제도",
    name: "거제 바람마루 하우스",
    duration: "4박 5일",
    matchType: "레저형",
    matchReason: "바닷가 산책과 액티비티를 즐기는 당신을 위해",
    xPct: 60,
    yPct: 86,
    themeEmoji: "🌊",
  },
];
