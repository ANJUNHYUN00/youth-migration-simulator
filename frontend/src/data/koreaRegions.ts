// 전국 시/도 + 시/군/구 데이터 (2024년 행정구역 기준)
// 본 지역 선택 2단계 픽커(시/도 → 시/군/구) + 이동 애니메이션 출발지 좌표.
//
// 좌표는 public/korea-map.png(남한+제주 일러스트) 기준 상대 %.
// 시/도 17곳은 모두 대표 좌표를 가짐. 시/군/구 단위 정확 좌표는 주요 도시만 별도 등록,
// 그 외는 시/도 좌표로 폴백 (resolveRegionPos).

import type { RegionPos } from "./regions";

export type SidoInfo = {
  short: string;    // "경북" — 저장 포맷에 사용
  full: string;     // "경상북도" — 디스플레이
  emoji: string;
  pos: RegionPos;   // 시/도 대표 좌표
  sigungu: string[]; // 소속 시/군/구
};

// ── 17개 광역시·도 ─────────────────────────────────
export const KOREA_SIDOS: SidoInfo[] = [
  {
    short: "서울",
    full: "서울특별시",
    emoji: "🌆",
    pos: { xPct: 33, yPct: 22 },
    sigungu: [
      "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구",
      "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구",
      "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구",
      "은평구", "종로구", "중구", "중랑구",
    ],
  },
  {
    short: "인천",
    full: "인천광역시",
    emoji: "⚓️",
    pos: { xPct: 27, yPct: 22 },
    sigungu: [
      "강화군", "계양구", "남동구", "동구", "미추홀구",
      "부평구", "서구", "연수구", "옹진군", "중구",
    ],
  },
  {
    short: "경기",
    full: "경기도",
    emoji: "🏞",
    pos: { xPct: 33, yPct: 26 },
    sigungu: [
      "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시",
      "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시",
      "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군",
      "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시",
      "포천시", "하남시", "화성시",
    ],
  },
  {
    short: "강원",
    full: "강원특별자치도",
    emoji: "🏔",
    pos: { xPct: 50, yPct: 25 },
    sigungu: [
      "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군",
      "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시",
      "평창군", "홍천군", "화천군", "횡성군",
    ],
  },
  {
    short: "충북",
    full: "충청북도",
    emoji: "🌳",
    pos: { xPct: 45, yPct: 38 },
    sigungu: [
      "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군",
      "제천시", "증평군", "진천군", "청주시", "충주시",
    ],
  },
  {
    short: "충남",
    full: "충청남도",
    emoji: "🌾",
    pos: { xPct: 33, yPct: 40 },
    sigungu: [
      "계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군",
      "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군",
      "홍성군",
    ],
  },
  {
    short: "대전",
    full: "대전광역시",
    emoji: "🌲",
    pos: { xPct: 40, yPct: 42 },
    sigungu: ["대덕구", "동구", "서구", "유성구", "중구"],
  },
  {
    short: "세종",
    full: "세종특별자치시",
    emoji: "🏛",
    pos: { xPct: 38, yPct: 38 },
    sigungu: [], // 단일 시 — 시/군/구 단계 생략
  },
  {
    short: "전북",
    full: "전북특별자치도",
    emoji: "🍚",
    pos: { xPct: 38, yPct: 58 },
    sigungu: [
      "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군",
      "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군",
    ],
  },
  {
    short: "전남",
    full: "전라남도",
    emoji: "🏝",
    pos: { xPct: 38, yPct: 75 },
    sigungu: [
      "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군",
      "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군",
      "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군",
      "화순군",
    ],
  },
  {
    short: "광주",
    full: "광주광역시",
    emoji: "🍃",
    pos: { xPct: 35, yPct: 70 },
    sigungu: ["광산구", "남구", "동구", "북구", "서구"],
  },
  {
    short: "경북",
    full: "경상북도",
    emoji: "🍎",
    pos: { xPct: 55, yPct: 45 },
    sigungu: [
      "경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군",
      "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시",
      "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군",
      "포항시",
    ],
  },
  {
    short: "대구",
    full: "대구광역시",
    emoji: "🌶",
    pos: { xPct: 52, yPct: 58 },
    sigungu: [
      "군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구",
    ],
  },
  {
    short: "경남",
    full: "경상남도",
    emoji: "⛰",
    pos: { xPct: 53, yPct: 70 },
    sigungu: [
      "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시",
      "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시",
      "하동군", "함안군", "함양군", "합천군",
    ],
  },
  {
    short: "부산",
    full: "부산광역시",
    emoji: "🌊",
    pos: { xPct: 60, yPct: 75 },
    sigungu: [
      "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구",
      "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구",
      "중구", "해운대구",
    ],
  },
  {
    short: "울산",
    full: "울산광역시",
    emoji: "🐋",
    pos: { xPct: 65, yPct: 67 },
    sigungu: ["남구", "동구", "북구", "울주군", "중구"],
  },
  {
    short: "제주",
    full: "제주특별자치도",
    emoji: "🌴",
    pos: { xPct: 30, yPct: 93 },
    sigungu: ["서귀포시", "제주시"],
  },
];

// short(예: "경북") → SidoInfo 빠른 조회
export const SIDO_BY_SHORT: Record<string, SidoInfo> = Object.fromEntries(
  KOREA_SIDOS.map((s) => [s.short, s])
);

// ── 주요 시/군/구 좌표 override ──────────────────
// 키 포맷: "{sidoShort} {sigungu}" — 예: "경북 경산시"
// 등록 안 된 시/군/구는 시/도 대표 좌표로 폴백.
export const SIGUNGU_POS: Record<string, RegionPos> = {
  // 경기 주요
  "경기 수원시": { xPct: 34, yPct: 27 },
  "경기 성남시": { xPct: 36, yPct: 26 },
  "경기 고양시": { xPct: 32, yPct: 22 },
  "경기 용인시": { xPct: 36, yPct: 28 },
  "경기 부천시": { xPct: 30, yPct: 24 },
  "경기 안산시": { xPct: 30, yPct: 28 },
  "경기 평택시": { xPct: 34, yPct: 32 },
  "경기 화성시": { xPct: 32, yPct: 29 },
  "경기 파주시": { xPct: 32, yPct: 18 },
  // 강원 주요
  "강원 춘천시": { xPct: 47, yPct: 22 },
  "강원 강릉시": { xPct: 56, yPct: 28 },
  "강원 원주시": { xPct: 46, yPct: 30 },
  "강원 속초시": { xPct: 55, yPct: 22 },
  "강원 영월군": { xPct: 50, yPct: 32 },
  // 충북 주요
  "충북 청주시": { xPct: 42, yPct: 38 },
  "충북 충주시": { xPct: 44, yPct: 33 },
  // 충남 주요
  "충남 천안시": { xPct: 38, yPct: 33 },
  "충남 아산시": { xPct: 36, yPct: 34 },
  "충남 공주시": { xPct: 38, yPct: 42 },
  // 전북 주요
  "전북 전주시": { xPct: 39, yPct: 60 },
  "전북 군산시": { xPct: 34, yPct: 58 },
  "전북 익산시": { xPct: 36, yPct: 58 },
  // 전남 주요
  "전남 목포시": { xPct: 30, yPct: 78 },
  "전남 여수시": { xPct: 42, yPct: 80 },
  "전남 순천시": { xPct: 40, yPct: 77 },
  "전남 광양시": { xPct: 42, yPct: 77 },
  "전남 나주시": { xPct: 34, yPct: 73 },
  // 경북 주요
  "경북 포항시": { xPct: 65, yPct: 53 },
  "경북 경주시": { xPct: 62, yPct: 60 },
  "경북 안동시": { xPct: 58, yPct: 45 },
  "경북 구미시": { xPct: 53, yPct: 53 },
  "경북 경산시": { xPct: 54, yPct: 60 },
  "경북 김천시": { xPct: 50, yPct: 53 },
  // 경남 주요
  "경남 창원시": { xPct: 55, yPct: 73 },
  "경남 진주시": { xPct: 48, yPct: 73 },
  "경남 김해시": { xPct: 58, yPct: 73 },
  "경남 양산시": { xPct: 59, yPct: 72 },
  "경남 거제시": { xPct: 56, yPct: 78 },
  "경남 통영시": { xPct: 54, yPct: 77 },
  // 제주
  "제주 제주시": { xPct: 30, yPct: 92 },
  "제주 서귀포시": { xPct: 32, yPct: 96 },
};

// ── 저장 포맷 ──────────────────────────────────
// "{sidoShort}" (예: "세종") 또는 "{sidoShort} {sigungu}" (예: "경북 경산시").
// 표시도 같은 포맷을 그대로 사용.
export function formatRegionName(
  sidoShort: string,
  sigungu?: string | null
): string {
  if (!sigungu) return sidoShort;
  return `${sidoShort} ${sigungu}`;
}

// regionName(저장 포맷) → 좌표 해석
// 1) 주요 시/군/구 정확 매칭
// 2) 시/도 short prefix 매칭 → 시/도 대표 좌표
// 3) 기존 단순 시도명 ("서울" 등) — SIDO_BY_SHORT 매칭
export function resolveRegionPos(name: string): RegionPos | undefined {
  if (!name) return undefined;
  if (SIGUNGU_POS[name]) return SIGUNGU_POS[name];
  // "경북 경산시" 같은 형식 → 앞 토큰으로 시도 찾기
  const head = name.split(" ")[0];
  const sido = SIDO_BY_SHORT[head];
  return sido?.pos;
}
