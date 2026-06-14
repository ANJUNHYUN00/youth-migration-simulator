// 미션 카드/정보 화면 공용 — 설명 + 호기심 카피.
// 카드: curiosityFor() — 박스 안 부제 한 줄용 (짧게, MISSION_INFO 의 curiosity 우선).
// 정보 화면: infoCopyFor() — 설명(2-3줄) + 호기심 둘다 반환.
//
// MISSION_INFO 에 없는 미션은 mission.description / 자동 생성 폴백.
// 현재 채워둔 항목 = 강화도 Phase A 플랜에 들어가는 14개 미션.

import type { Mission } from "./missions";

type InfoCopy = {
  description: string; // 정보 화면 "설명" 영역 — 2-3줄
  curiosity: string;   // 정보 화면 "호기심" + 카드 부제 공용
};

// 카피 톤: 짧게(1-2문장) + 호기심 자극 + 스포 없음. "정말 그럴까?" 질문 톤 우선.
const MISSION_INFO: Record<string, InfoCopy> = {
  // ===== 공통 미션 =====
  hospital: {
    description: "도보로 병원까지, 응급실까지 가는 길.",
    curiosity: "여기서 응급실까지, 몇 분이면 갈까?",
  },
  market: {
    description: "동네 식당 백반 한 상.",
    curiosity: "한 끼 7천원, 매일 사 먹어도 괜찮을까?",
  },
  cost: {
    description: "한 달 살림을 직접 계산해보기.",
    curiosity: "이 동네에서 한 달, 얼마면 충분할까?",
  },
  transit: {
    description: "차 없이 다니는 동네 풍경.",
    curiosity: "버스 한 대 놓치면 얼마나 기다려야 할까?",
  },
  routine: {
    description: "이 동네에서의 하루를 그려보기.",
    curiosity: "여기서의 하루, 나한텐 어떤 모습일까?",
  },
  food: {
    description: "이 동네 하루 세 끼, 얼마쯤 들까.",
    curiosity: "도시 절반 가격이라는 동네, 실제로 얼마일까?",
  },
  shop: {
    description: "30년 자리를 지킨 동네 분식집.",
    curiosity: "단골이 된다는 건 어떤 느낌일까?",
  },
  neighbor: {
    description: "이주민들이 모이는 동네 사랑방 펍.",
    curiosity: "여기 살아본 사람들, 처음 무엇이 힘들었을까?",
  },
  mailbox: {
    description: "오늘 도착한 편지 한 통.",
    curiosity: "익명으로 적힌 한 줄, 무슨 말이 적혀있을까?",
  },

  // ===== 강화 메인 미션 =====
  "ganghwa-mudflat": {
    description: "썰물 시간, 동막 갯벌 한 번 걸어보기.",
    curiosity: "발 밑이 푹 꺼지는 갯벌, 정말 걸을 수 있을까?",
  },
  "ganghwa-market": {
    description: "강화 사람들이 가장 자주 찾는 시장 한 바퀴.",
    curiosity: "오늘 시장에서 만나는 강화 한 상은 어떤 모습일까?",
  },
  "ganghwa-farm": {
    description: "동네 사람들과 같이 짓는 작은 텃밭.",
    curiosity: "한 평이면 한 가족 채소가 된다는 게 정말일까?",
  },
  "ganghwa-sunset": {
    description: "강화의 가장 흔하지만 가장 특별한 의식.",
    curiosity: "여기 사람들은 매일 노을을 보러 간다는데, 정말일까?",
  },

  // ===== 청풍 (강화) 메인 미션 =====
  "cheongpung-bookstore": {
    description: "강화 작가들 책이 모인 동네 책방.",
    curiosity: "함민복 시인이 갯벌을 시로 적었다고?",
  },
  "cheongpung-socheang": {
    description: "강화 100년 면직물, 소창 한 장 짜보기.",
    curiosity: "손으로 한 장 직접 짜는 기분은 어떨까?",
  },
  "cheongpung-yoga": {
    description: "마당뷰에서 한 시간, 섬요가.",
    curiosity: "바닷바람과 같이 호흡하는 요가, 도시랑 어떻게 다를까?",
  },
  "cheongpung-record": {
    description: "잠시섬 방명록에 한 줄 남기기.",
    curiosity: "다녀간 사람들이 적어둔 한 줄, 어떤 문장일까?",
  },
  "cheongpung-onsen": {
    description: "강화 지하 천 미터에서 끌어 올린 미네랄 온천.",
    curiosity: "갯벌 묻은 몸을 담그면 얼마나 풀릴까?",
  },

  // ===== 강화 보너스 =====
  "ganghwa-dolmen": {
    description: "유네스코 세계유산, 강화 부근리 고인돌.",
    curiosity: "4천 년 전 돌 앞에 서면, 어떤 생각이 들까?",
  },
  "cheongpung-fortress": {
    description: "강화 성곽 한 바퀴, 30분.",
    curiosity: "혼자 걷기 좋은 시간대는 언제일까?",
  },
  "cheongpung-jeotguk": {
    description: "고려 임금이 천도하며 먹던 강화 향토 음식.",
    curiosity: "새우젓으로 간을 맞춘다는 갈비, 어떤 맛일까?",
  },
  "cheongpung-eel": {
    description: "세계 3대 갯벌에서 자란 강화 장어.",
    curiosity: "갯벌에서 자란 장어, 일반 장어랑 뭐가 다를까?",
  },
  "cheongpung-snack": {
    description: "강화 속노란 고구마말랭이, 한 봉지.",
    curiosity: "갯벌에서 노을 보며 먹으면 정말 다를까?",
  },
};

// 정보 화면 — 설명 + 호기심 둘다 반환. MISSION_INFO 우선, 없으면 mission 필드 / 자동 생성.
export function infoCopyFor(m: Mission): InfoCopy {
  if (MISSION_INFO[m.id]) return MISSION_INFO[m.id];
  return {
    description: m.description ?? "",
    curiosity: curiosityFallback(m),
  };
}

// 카드 부제 — MISSION_INFO 있으면 그쪽 curiosity, 없으면 description / 자동 생성.
export function curiosityFor(m: Mission): string {
  if (MISSION_INFO[m.id]) return MISSION_INFO[m.id].curiosity;
  return curiosityFallback(m);
}

function curiosityFallback(m: Mission): string {
  if (m.description) return m.description;
  switch (m.category) {
    case "생활현실형":
      return `${m.title} — 서울이랑 어떻게 다를까?`;
    case "관계형성형":
      return `${m.title} — 어떤 사람을 만나게 될까?`;
    default:
      return `${m.title} — 어떤 분위기일까?`;
  }
}
