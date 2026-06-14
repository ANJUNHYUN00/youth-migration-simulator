// 커뮤니티 — 지도 기반 데이터 모델
//
// 3단계 줌인 구조: 전국 → 지역 동네 → 장소(핀) 상세
// "관계가 특정 장소에 누적된다" 를 시각화하는 게 목표 — 핀 크기/색농도는 reservation 이 아니라
// posts 의 누적 수로 계산해서 표현 (countForPlace / sizeForCount / opacityForCount).

import type { PostCategory } from "./communityPosts";

// =====================================================================
// 지역 (전국 지도)
// =====================================================================
export type RegionVariant = "sea" | "mountain" | "field" | "mixed";
export type RegionStatus = "active" | "browse";

export type CommunityRegion = {
  id: string;
  name: string;
  variant: RegionVariant;
  blurb: string;           // 한 줄 소개
  status: RegionStatus;    // active=체험 가능 / browse=둘러보기만
  // 전국 일러스트 지도 위 핀 좌표 (% 기준 — 사용자가 보낸 HTML 좌표를 360x330 → % 로 환산)
  mapX: number;            // 0~100
  mapY: number;            // 0~100
};

// 좌표는 public/korea-map.png 기준 (% — 좌상단 0,0 / 우하단 100,100).
// 여정 탭의 KoreaMap 컴포넌트와 동일 좌표계.
export const communityRegions: CommunityRegion[] = [
  {
    id: "ganghwa",
    name: "강화 · 청풍",
    variant: "sea",
    blurb: "바다 곁에서 손 움직이고, 펍에 둘러앉는 동네",
    status: "active",
    mapX: 23,   // 강화도 위치 (residences.ts 와 동일)
    mapY: 18,
  },
  {
    id: "sanchon",
    name: "산촌마을",
    variant: "mountain",
    blurb: "능선 사이로 천천히 걷고 모이는 동네",
    status: "browse",
    mapX: 64,   // 강원 영월 근방
    mapY: 32,
  },
  {
    id: "deulmaeul",
    name: "들마을",
    variant: "field",
    blurb: "들녘에서 함께 키우고 거두는 동네",
    status: "browse",
    mapX: 48,   // 충청 들녘
    mapY: 50,
  },
  {
    id: "badatmaeul",
    name: "바닷마을",
    variant: "sea",
    blurb: "갯바람과 함께 천천히 흐르는 동네",
    status: "browse",
    mapX: 78,   // 남해안 거제 근방
    mapY: 78,
  },
];

// 핀/카드 색 = 유형. 온보딩 envType 과 시각적 일관성.
export const REGION_COLOR: Record<RegionVariant, { primary: string; soft: string; ink: string }> = {
  sea:      { primary: "#85B7EB", soft: "#E0EEFA", ink: "#1F4A7A" },
  mountain: { primary: "#F0997B", soft: "#FBE5DC", ink: "#7A2F18" },
  field:    { primary: "#97C459", soft: "#E5F2D2", ink: "#3F6A17" },
  mixed:    { primary: "#D85A30", soft: "#FAECE7", ink: "#4A1B0C" },
};

// 강화·청풍 메인 색 (전국 지도에서 강조)
export const GANGHWA_COLOR = { primary: "#D85A30", soft: "#FAECE7", ink: "#4A1B0C" };

// =====================================================================
// 장소 (지역 안의 핀) — 현재는 강화만 채움
// =====================================================================
export type CommunityPlace = {
  id: string;
  regionId: string;
  name: string;
  // 아이콘 — 이모지로 단순화 (이후 SVG 자산 들어오면 키만 갈아끼움)
  icon: string;
  // 지역 일러스트 지도 위 핀 좌표 (% 기준)
  mapX: number;
  mapY: number;
};

export const communityPlaces: CommunityPlace[] = [
  { id: "mudflat",   regionId: "ganghwa", name: "갯벌",       icon: "🏖", mapX: 12, mapY: 28 },
  { id: "pub",       regionId: "ganghwa", name: "스트롱파이어 펍", icon: "🍻", mapX: 49, mapY: 56 },
  { id: "market",    regionId: "ganghwa", name: "풍물시장",   icon: "🛒", mapX: 80, mapY: 40 },
  { id: "bookstore", regionId: "ganghwa", name: "동네 책방",   icon: "📚", mapX: 26, mapY: 78 },
  { id: "socheang",  regionId: "ganghwa", name: "소창 공방",   icon: "🪡", mapX: 79, mapY: 80 },
];

// =====================================================================
// 게시글 (장소 태그 가능) — 발표 시연용 자연스러운 한국어 placeholder
// =====================================================================
export type AuthorType = "local" | "visitor"; // 맞이하는 사람 / 찾아온 사람

export type MapPost = {
  id: string;
  regionId: string;
  placeId?: string;          // nullable — 장소 없는 동네 전체 글(이주스토리·지역이야기)
  category: PostCategory;
  authorType: AuthorType;
  nickname: string;
  body: string;
  likes: number;
  // 사용자 작성 글의 첨부 이미지 (선택). data URL 또는 객체 URL. mock 글은 keyword 매칭으로 자동 매핑.
  imageDataUrl?: string;
};

// =====================================================================
// 댓글 — 한 글에 여러 댓글. 영속 (localStorage)
// =====================================================================
export type MapComment = {
  id: string;
  postId: string;
  nickname: string;
  body: string;
  createdAt: string;        // ISO
};

const COMMENTS_KEY = "cheongpung.mapComments.v1";

export function loadComments(): MapComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMMENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveComments(comments: MapComment[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch {
    /* ignore */
  }
}

export function commentsForPost(postId: string, all: MapComment[]): MapComment[] {
  return all.filter((c) => c.postId === postId);
}

// 강화 mock — 카테고리 톤 가이드:
//   · 미션후기·체험후기: 장소 핀과 어느 정도 연결 (지도 시각화 살아있게)
//   · 이주스토리·지역이야기: 핀 없이 자유 톤이 더 자연스러움 (사용자 피드백)
//   · 글 내용도 미션 내용 1:1 매칭은 풀어주고, 사용자의 감정·풍경 위주로
export const communityMapPosts: MapPost[] = [
  // ── 갯벌 ──
  {
    id: "m1", regionId: "ganghwa", placeId: "mudflat",
    category: "mission", authorType: "visitor",
    nickname: "섬바람",
    body: "갯벌 걷다가 진짜 그 자리 가보고 싶어졌어요. 발이 푹 빠지는데 묘하게 좋아요. 도시 머리가 비워지는 느낌.",
    likes: 42,
  },
  {
    id: "m2", regionId: "ganghwa", placeId: "mudflat",
    category: "experience", authorType: "visitor",
    nickname: "노을수집가",
    body: "물 빠진 갯벌 한 시간 멍 때리고 왔어요. 도시에선 못 가지는 시간이 여기 있더라구요.",
    likes: 67,
  },
  {
    id: "m3", regionId: "ganghwa", placeId: "mudflat",
    category: "place", authorType: "local",
    nickname: "갯바람",
    body: "이번 주말 물때 새벽 5시 50분. 일찍 와서 한 바퀴 돌고 가세요. 모기 없습니다.",
    likes: 23,
  },
  // ── 펍 (가장 많이 쌓인 곳) ──
  {
    id: "p1", regionId: "ganghwa", placeId: "pub",
    category: "experience", authorType: "visitor",
    nickname: "맥주이주",
    body: "강화 펍에서 모르는 사람들이랑 이야기 한 시간. 처음엔 어색했는데 한 잔 후엔 다 친구 같아요.",
    likes: 88,
  },
  {
    id: "p2", regionId: "ganghwa", placeId: "pub",
    category: "migration", authorType: "local",
    nickname: "이도이주",
    body: "관계가 먼저였고 이사는 나중이었어요. 펍 단골이 되고 1년 뒤 자연스럽게 강화 사람이 됐네요.",
    likes: 152,
  },
  {
    id: "p3", regionId: "ganghwa", placeId: "pub",
    category: "place", authorType: "local",
    nickname: "펍지기",
    body: "이번 주 금요일 저녁 만남의 자리 있습니다. 처음 오신 분 환영해요.",
    likes: 41,
  },
  {
    id: "p4", regionId: "ganghwa", placeId: "pub",
    category: "mission", authorType: "visitor",
    nickname: "느린바람",
    body: "강화 처음이라니까 사장님이 안주 하나 더 내주셨어요. 다음에 또 가야지.",
    likes: 34,
  },
  // ── 풍물시장 ──
  {
    id: "mk1", regionId: "ganghwa", placeId: "market",
    category: "mission", authorType: "visitor",
    nickname: "첫달살이",
    body: "풍물시장 들렀다가 순무김치 한 입. 양념 사이에 갯바람이 같이 묻어나요.",
    likes: 56,
  },
  {
    id: "mk2", regionId: "ganghwa", placeId: "market",
    category: "place", authorType: "local",
    nickname: "청풍지기",
    body: "이번 주 풍물시장에 봄 밴댕이 들어왔어요. 5월엔 순무김치에도 밴댕이를 넣는답니다.",
    likes: 47,
  },
  {
    id: "mk3", regionId: "ganghwa", placeId: "market",
    category: "experience", authorType: "visitor",
    nickname: "시장러버",
    body: "시장 2층 식당, 사장님 손맛이 진짜예요. 강화 와서 제일 기억에 남는 한 끼.",
    likes: 31,
  },
  // ── 책방 ──
  {
    id: "bk1", regionId: "ganghwa", placeId: "bookstore",
    category: "experience", authorType: "visitor",
    nickname: "책읽는노마드",
    body: "강화 책방에서 시집 한 권. 갯벌 보러 가는 길에 한 편 읽으니 풍경이 달라져요.",
    likes: 29,
  },
  {
    id: "bk2", regionId: "ganghwa", placeId: "bookstore",
    category: "place", authorType: "local",
    nickname: "책방지기",
    body: "오늘 신간 들어왔어요. 강화 토박이 작가들 시집 모음. 들러주세요.",
    likes: 18,
  },
  // ── 소창 공방 ──
  {
    id: "so1", regionId: "ganghwa", placeId: "socheang",
    category: "mission", authorType: "visitor",
    nickname: "손으로짓다",
    body: "한 시간 만에 손수건 한 장 짰어요. 직접 만든 거 가져가는 기분 묘함.",
    likes: 38,
  },
  {
    id: "so2", regionId: "ganghwa", placeId: "socheang",
    category: "experience", authorType: "visitor",
    nickname: "느린손",
    body: "30분 손 움직이고 나니 머리도 정리됨. 도시 잊고 가는 시간.",
    likes: 22,
  },

  // ── 이주스토리 (핀 없이 자유 톤) ──
  {
    id: "mig1", regionId: "ganghwa", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "강화3년차",
    body: "처음 3개월은 답답했어요. 도시 친구도 안 보이고, 동네 사람들도 어색하고. 근데 4개월쯤 되니까 어느 순간 옆집 어르신이 이름을 부르더라구요. 그때부턴 다 달라졌어요.",
    likes: 184,
  },
  {
    id: "mig2", regionId: "ganghwa", placeId: undefined,
    category: "migration", authorType: "visitor",
    nickname: "서울탈출희망",
    body: "이번 달 두 번째 방문이에요. 이주 결정하기 전에 짧게 살아보는 중인데, 한 번 올 때마다 마음이 좀 더 강화 쪽으로 기울어요.",
    likes: 91,
  },
  {
    id: "mig3", regionId: "ganghwa", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "강화반년차",
    body: "강화 와서 가장 변한 건 시간 감각이에요. 도시에선 분 단위로 살았는데 여긴 계절 단위. 처음엔 답답하다가, 지금은 그게 좋아요.",
    likes: 127,
  },
  {
    id: "mig4", regionId: "ganghwa", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "이도이주_시즌2",
    body: "남편이랑 같이 강화 1년. 둘 다 재택근무라 가능했어요. 도시 월세 절반, 마당 있는 집. 후회 없음.",
    likes: 78,
  },

  // ── 지역이야기 (핀 없이 자유 톤 — 동네 소식·계절·정보) ──
  {
    id: "pl1", regionId: "ganghwa", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "강화토박이",
    body: "강화 봄은 4월 말부터 5월. 매화 지고 순무 올라올 때가 제일 좋습니다. 사진 찍으러 오시는 분들 이 시기 추천.",
    likes: 73,
  },
  {
    id: "pl2", regionId: "ganghwa", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "동막주민",
    body: "오늘 동막에서 본 노을. 사진으론 다 안 담겨요. 직접 와보세요.",
    likes: 64,
  },
  {
    id: "pl3", regionId: "ganghwa", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "강화소식통",
    body: "다음 주말 강화 봄 축제 합니다. 갯벌 체험, 풍물놀이, 먹거리 부스. 외지분들 환영해요.",
    likes: 39,
  },

  // =====================================================================
  // 산촌마을 (강원 영월 근방) — 능선·골짜기·느린 톤
  // =====================================================================
  {
    id: "sc-mig1", regionId: "sanchon", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "능선아래",
    body: "산촌 6개월 차. 처음엔 적막이 무서웠는데 지금은 도시 가면 머리가 아파요. 새벽 안개 보러 한 번씩 마당 나옵니다.",
    likes: 124,
  },
  {
    id: "sc-mig2", regionId: "sanchon", placeId: undefined,
    category: "migration", authorType: "visitor",
    nickname: "골짜기일기",
    body: "주말마다 영월 내려오던 게 1년. 결국 평일에도 살아요. 회사는 원격, 점심은 텃밭. 통근 시간이 사라지니까 인생이 길어졌어요.",
    likes: 98,
  },
  {
    id: "sc-exp1", regionId: "sanchon", placeId: undefined,
    category: "experience", authorType: "visitor",
    nickname: "도시탈출러",
    body: "한 달 살이 와봤어요. 첫 주는 심심해서 미칠 뻔. 둘째 주부터 풀벌레 소리 구분이 되네요. 사람마다 적응 속도가 진짜 달라요.",
    likes: 76,
  },
  {
    id: "sc-pl1", regionId: "sanchon", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "영월토박이",
    body: "여기 가을은 9월 말부터. 단풍 들면 사진 찍는 분들 많이 와요. 평일이 한산해서 추천.",
    likes: 52,
  },
  {
    id: "sc-mis1", regionId: "sanchon", placeId: undefined,
    category: "mission", authorType: "visitor",
    nickname: "산길걷는중",
    body: "병원 가는 길 미션 했는데 차로 25분이래요. 솔직히 그게 걸려요. 예쁜 건 알겠는데 응급 상황은 자신 없어졌어요.",
    likes: 87,
  },

  // =====================================================================
  // 들마을 (충청 들녘) — 손에 흙 묻히고 모이는 톤
  // =====================================================================
  {
    id: "dl-mig1", regionId: "deulmaeul", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "들에서살아요",
    body: "들마을 3년 차. 농사 절반, 노트북 절반. 옆집 어르신이 모종 주시고 저는 와이파이 봐드려요. 이런 거래가 매일 있어요.",
    likes: 142,
  },
  {
    id: "dl-mig2", regionId: "deulmaeul", placeId: undefined,
    category: "migration", authorType: "visitor",
    nickname: "콩알맺힘",
    body: "텃밭 하고 싶어서 내려왔는데 막상 시작하니까 무릎이 먼저 못 버텨요 ㅋㅋ 청년 농부 모임 가입하니까 다 같이 배우는 분위기라 다행.",
    likes: 91,
  },
  {
    id: "dl-exp1", regionId: "deulmaeul", placeId: undefined,
    category: "experience", authorType: "visitor",
    nickname: "주말농부",
    body: "추수철 체험 다녀왔어요. 허리는 끊어질 듯한데 저녁에 마을 회관에서 막걸리 한 잔이 그렇게 달아요. 처음 보는 분들이랑 가족 같았어요.",
    likes: 68,
  },
  {
    id: "dl-pl1", regionId: "deulmaeul", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "들마을이장",
    body: "이번 달 청년 입주 환영회 합니다. 들녘 둘러보고 집밥 같이 먹는 자리. 외지 분들 편하게 오세요.",
    likes: 47,
  },
  {
    id: "dl-mis1", regionId: "deulmaeul", placeId: undefined,
    category: "mission", authorType: "visitor",
    nickname: "흙손가락",
    body: "장보기 미션 했는데 마트가 차로 15분, 5일장이 일주일에 두 번. 도시처럼 24시간은 아니지만 사면 사니까 적응되긴 해요.",
    likes: 54,
  },

  // =====================================================================
  // 바닷마을 (남해안 거제 근방) — 갯바람·뱃고동·천천히 톤
  // =====================================================================
  {
    id: "bd-mig1", regionId: "badatmaeul", placeId: undefined,
    category: "migration", authorType: "visitor",
    nickname: "갯바람따라",
    body: "거제 1년 살이 끝나고 그냥 눌러앉았어요. 출근길에 바다가 보이는 게 이렇게 큰 일일 줄 몰랐어요. 도시 친구들이 자꾸 놀러 와요.",
    likes: 156,
  },
  {
    id: "bd-mig2", regionId: "badatmaeul", placeId: undefined,
    category: "migration", authorType: "local",
    nickname: "포구산책",
    body: "여기 사람들은 새벽 5시부터 활동해요. 처음엔 너무 일찍이라 힘들었는데 지금은 같이 깨요. 저녁 8시면 동네가 잠들어요.",
    likes: 103,
  },
  {
    id: "bd-exp1", regionId: "badatmaeul", placeId: undefined,
    category: "experience", authorType: "visitor",
    nickname: "서핑입문",
    body: "처음엔 서핑 배우러 왔다가 어부 일도 한 번 해봤어요. 그물 정리하는 게 진짜 노동이긴 한데, 끝나고 회 한 점이 천국.",
    likes: 81,
  },
  {
    id: "bd-pl1", regionId: "badatmaeul", placeId: undefined,
    category: "place", authorType: "local",
    nickname: "남해소식",
    body: "다음 달 멸치 축제 합니다. 외지 청년들 환영해요. 일손 도와주시면 점심 멸치쌈밥 무한 제공 ㅋㅋ",
    likes: 58,
  },
  {
    id: "bd-mis1", regionId: "badatmaeul", placeId: undefined,
    category: "mission", authorType: "visitor",
    nickname: "바다넘김",
    body: "교통 미션 해봤는데 시내 나가는 버스가 1시간에 한 대. 차 없으면 진짜 힘들겠더라구요. 대신 자전거로 동네는 다 닿아요.",
    likes: 72,
  },
];

// =====================================================================
// 사용자가 작성한 글 영속 (localStorage). 피드에 mock 글과 같이 노출됨.
// =====================================================================
const USER_MAP_POSTS_KEY = "cheongpung.communityMapPosts.v1";

export function loadUserMapPosts(): MapPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USER_MAP_POSTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveUserMapPosts(posts: MapPost[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_MAP_POSTS_KEY, JSON.stringify(posts));
  } catch {
    /* ignore */
  }
}

// =====================================================================
// 헬퍼 — 핀 크기/농도 계산 + 카운트
// =====================================================================

// 한 장소(place) 의 누적 기록 수
export function countForPlace(placeId: string, posts: MapPost[]): number {
  return posts.filter((p) => p.placeId === placeId).length;
}

// 한 지역(region) 의 누적 기록 수 (모든 카테고리, 장소 무관)
export function countForRegion(regionId: string, posts: MapPost[]): number {
  return posts.filter((p) => p.regionId === regionId).length;
}

// 누적 수 → 핀 크기(px). 32 → 52 사이 보간.
export function sizeForCount(count: number): number {
  const min = 32;
  const max = 52;
  const cap = 50; // 50 이상부터는 max
  if (count <= 0) return min;
  return Math.min(max, min + (count / cap) * (max - min));
}

// 누적 수 → 색 농도 / 외곽 글로우 강도 (0.4~1.0)
export function opacityForCount(count: number): number {
  if (count <= 0) return 0.4;
  return Math.min(1, 0.5 + count / 80);
}
