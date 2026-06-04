// 미션 카테고리 그룹핑 — UI 표시용
// 대분류: 로드뷰 미션(map-*) / 대화 미션
// 대화 미션 소분류: 생활현실형 / 사람·관계형 / 감성·휴식형

import type { Mission } from "./missions";

export type MissionGroup = "roadview" | "real" | "people" | "rest";

export const MISSION_GROUP_ORDER: MissionGroup[] = [
  "roadview",
  "real",
  "people",
  "rest",
];

export type MissionGroupMeta = {
  title: string;
  subtitle: string;
  bg: string;
};

export const missionGroupMeta: Record<MissionGroup, MissionGroupMeta> = {
  roadview: {
    title: "로드뷰 미션",
    subtitle: "걸어서 그 자리에 서보기",
    bg: "/character1/clay-village-map.png",
  },
  real: {
    title: "생활현실형",
    subtitle: "돈·시간·인프라, 실제 감각",
    bg: "/character1/clay-market.png",
  },
  people: {
    title: "사람·관계형",
    subtitle: "동네 사람과 가까워지기",
    bg: "/character1/clay-barbershop.png",
  },
  rest: {
    title: "감성·휴식형",
    subtitle: "차 한 잔, 멍 때리기",
    bg: "/character1/clay-hanok-nap.png",
  },
};

export function getMissionGroup(m: Mission): MissionGroup {
  if (m.mode === "map-dialogue" || m.mode === "map-info") return "roadview";
  if (m.mode === "mailbox") return "rest";
  if (m.category === "생활현실형") return "real";
  if (m.category === "관계형성형") return "people";
  // 감정/분위기형 + 그 외
  return "rest";
}

export function groupMissions(
  missions: Mission[]
): Record<MissionGroup, Mission[]> {
  const out: Record<MissionGroup, Mission[]> = {
    roadview: [],
    real: [],
    people: [],
    rest: [],
  };
  for (const m of missions) out[getMissionGroup(m)].push(m);
  return out;
}
