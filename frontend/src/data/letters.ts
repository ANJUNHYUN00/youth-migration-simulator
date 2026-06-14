// 편지함 — 마을 주민 NPC / 시스템 알림 / 커뮤니티 소식 통합 인박스
//
// 사용자 친화 설계 원칙:
//   - 모든 종류를 한 인박스에 모음(편지·알림·소식 다 같은 timeline)
//   - 시각으로만 구별: NPC 편지=warm 톤, 시스템=cool 톤, 커뮤니티=pink 톤
//   - 필터 칩으로 카테고리 빠른 전환 (전체 / 편지 / 알림 / 소식)
//   - unread 빨간 점 + BottomNav 배지로 새 소식 인지
//   - 본문은 청풍 톤(쌓이다·머무르다·자리잡다) 일관

import type { Residence } from "./residences";

// =====================================================================
// 타입
// =====================================================================

export type LetterCategory = "npc" | "system" | "community";

export type LetterTrigger =
  | "welcome"             // 첫 진입 환영
  | "arrival"             // 레지던스 도착
  | "day_complete"        // 일차 미션 모두 완료
  | "next_day"            // 다음 일차 시작
  | "report"              // 이주 리포트 생성 후
  | "booking_confirmed"   // 청년마을 예약 완료
  | "community";          // 커뮤니티 좋아요·댓글 (mock)

export type Letter = {
  id: string;
  category: LetterCategory;
  trigger: LetterTrigger;
  sender: {
    name: string;
    role?: string;
    emoji?: string;  // 아바타 폴백
  };
  title: string;
  preview: string;     // 카드 미리보기 한 줄 (~32자)
  body: string;        // 모달 본문
  createdAt: string;   // ISO timestamp
  read: boolean;
  residenceId?: string;
};

// =====================================================================
// localStorage 영속화
// =====================================================================

const STORAGE_KEY = "cheongpung.letters.v1";

export function loadLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Letter[];
  } catch {
    return [];
  }
}

export function saveLetters(letters: Letter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  } catch {
    /* ignore */
  }
}

// =====================================================================
// 헬퍼 — id, sender
// =====================================================================

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// NPC 편지 발신자 풀 — 사용자가 미션 동안 실제로 만난 NPC 들이 편지를 보냄.
//   · "옆자리 손님", "누군가" 같은 익명 톤 제거 (사용자 피드백).
//   · 강화 4일 미션 NPC들 (한설/풍물시장 사장님/책방 주인/소창 장인 등) 기반.
//   · 트리거 + 일차 로 deterministic 선택.
type SenderPersona = { name: string; role: string; emoji: string };

const SENDERS: Record<string, SenderPersona> = {
  hanseol:          { name: "한설",            role: "먼저 입주한 선배",        emoji: "🌿" },
  market_owner:     { name: "풍물시장 사장님",  role: "1층 좌판에서 만난 분",    emoji: "🛒" },
  mudflat_guide:    { name: "갯벌 가이드",      role: "동막 갯벌에서 만난 분",   emoji: "🐚" },
  food_owner:       { name: "동네 식당 사장님", role: "백반 한 상에서 만난 분",  emoji: "🍚" },
  bookstore_owner:  { name: "책방 주인",        role: "동네 책방에서 만난 분",   emoji: "📚" },
  farm_senior:      { name: "농사 선배",        role: "텃밭 클럽에서 만난 분",   emoji: "🌱" },
  pub_host:         { name: "사랑방 펍 호스트", role: "이주민 모임에서 만난 분", emoji: "🍻" },
  socheang_master:  { name: "소창 장인",        role: "강화 100년 면직물",       emoji: "🪡" },
  yoga_teacher:     { name: "섬요가 강사",      role: "마당뷰 요가에서 만난 분", emoji: "🧘" },
  record_host:      { name: "잠시섬 호스트",    role: "방명록 책장 관리자",      emoji: "📓" },
  onsen_host:       { name: "온천 사장님",      role: "강화 미네랄 온천",        emoji: "♨️" },
  sunset_walker:    { name: "동네 산책자",      role: "노을 보러 가는 분",       emoji: "🌅" },
};

// 트리거별 풀 — 일차 인덱스로 deterministic rotation. 사용자가 그 일차에 만난 NPC 가 편지를 보냄.
const ARRIVAL_POOL = ["hanseol"] as const;
const DAY_COMPLETE_POOL = [
  "market_owner",    // Day 1 (풍물시장)
  "bookstore_owner", // Day 2 (책방)
  "socheang_master", // Day 3 (소창)
  "sunset_walker",   // Day 4 (일몰)
] as const;
const NEXT_DAY_POOL = [
  "mudflat_guide",   // Day 1 → 2 안내
  "farm_senior",     // Day 2 → 3
  "yoga_teacher",    // Day 3 → 4
  "onsen_host",      // Day 4 (사용 안 됨 — fallback)
] as const;

function pickSender(
  pool: readonly (keyof typeof SENDERS)[],
  seed: number
): SenderPersona {
  const idx = ((seed % pool.length) + pool.length) % pool.length;
  return SENDERS[pool[idx]];
}

const SYSTEM_SENDER = {
  name: "청풍 운영팀",
  role: "운영팀",
  emoji: "🌬",
} as const;

// =====================================================================
// 팩토리 — 트리거별 편지 생성
// =====================================================================

// 첫 진입 환영 편지 — 사용자가 처음 앱 열었을 때 시드로 들어감
export function makeWelcomeLetter(): Letter {
  return {
    id: uid(),
    category: "system",
    trigger: "welcome",
    sender: { ...SYSTEM_SENDER },
    title: "청풍에 오신 걸 환영해요",
    preview:
      "잠시 다른 지역에 머물며 당신의 결을 발견하는 시간이에요. 천천히 둘러봐요.",
    body: `안녕하세요, ${SYSTEM_SENDER.name}이에요.

청풍은 "이주 결정"을 위한 도구가 아니에요. 잠시 다른 지역의 바람을 짓고, 그곳의 사람들과 시간을 쌓아가며 당신의 결을 발견하는 시뮬레이션이에요.

여러 청년마을을 둘러보고, 마음에 자리잡는 곳을 만나보세요. 마을 운영자들이 종종 편지를 보낼 거예요. 이 편지함에서 함께 모이게 돼요.

서두르지 않아도 괜찮아요. 천천히 머물러요.`,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function makeArrivalLetter(residence: Residence): Letter {
  // arrival = 첫날. 같이 시작한 길동무 톤이 가장 자연스러움.
  const sender = pickSender(ARRIVAL_POOL, 0);
  return {
    id: uid(),
    category: "npc",
    trigger: "arrival",
    sender,
    title: `${residence.region}에 잘 오셨어요`,
    preview: `반가워요. 며칠 동안 이곳의 바람을 같이 마셔요.`,
    body: `${residence.region}에 잘 오셨어요.

저는 ${sender.role}이에요. 며칠 동안 이곳의 바람을 함께 마시게 됐네요. 처음엔 다 낯설겠지만, 너무 빠르지 않게 하나씩 만나가요.

먼저 가까운 정류장과 시장 위치부터 손에 익히면 마음이 한결 편해져요. 동네 사람들이 종종 말 걸어올 거예요. 부담 갖지 말고 인사만 해도 충분해요.

자리잡는 데 시간이 걸려도 괜찮아요. 천천히 머물러요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeDayCompleteLetter(
  residence: Residence,
  day: number,
  doneCount: number
): Letter {
  // 일차별로 다른 인물이 말 걸어옴 — Day 1: 어르신, Day 2: 시장, Day 3: 펍, Day 4: 먼저 온 사람
  const sender = pickSender(DAY_COMPLETE_POOL, day - 1);
  return {
    id: uid(),
    category: "npc",
    trigger: "day_complete",
    sender,
    title: `오늘 하루, 잘 보내셨어요`,
    preview: `${day}일차에 ${doneCount}개를 마치셨네요. 하루씩 자리잡는 거예요.`,
    body: `오늘 동네를 도시는 걸 봤어요. ${residence.region}의 ${day}일차였죠.

${doneCount}개를 차곡차곡 채우신 게 마음에 남아요. 이렇게 하루씩 결이 쌓이는 거예요.

푹 쉬세요. 내일은 또 다른 결의 시간이 기다리고 있어요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeNextDayLetter(
  residence: Residence,
  nextDay: number
): Letter {
  // 다음 일차의 아침 — 길동무 → 익명 → 옆자리 손님 → 책방 주인 순으로 다양화
  const sender = pickSender(NEXT_DAY_POOL, nextDay - 1);
  return {
    id: uid(),
    category: "npc",
    trigger: "next_day",
    sender,
    title: `${residence.region}의 아침이에요`,
    preview: `${nextDay}일차 아침. 창문을 한 번 열어보세요.`,
    body: `어제 푹 주무셨나요?

${residence.region}의 아침은 도시와 달라요. 새벽 시장이 열리고, 동네는 이미 분주해요.

오늘의 ${nextDay}일차, 너무 많은 걸 계획하지 말고 마음 가는 한 가지부터 둘러봐요. 산책이든 시장이든.

천천히 시작해도 늦지 않아요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeReportLetter(residence: Residence): Letter {
  return {
    id: uid(),
    category: "npc",
    trigger: "report",
    sender: {
      name: "먼저 온 이주자",
      role: "1년 차 이주민",
      emoji: "👩",
    },
    title: `그 시간이 어땠나요`,
    preview: `${residence.region}에서의 시간이 어땠어요? 저도 그랬어요.`,
    body: `당신의 ${residence.region} 이주 리포트를 봤어요.

저도 이주 결정 전에 짧게 살아본 적이 있어요. 그때 마음에 남았던 작은 것들 — 시장 아주머니가 덤으로 주신 마늘, 산책길에 만난 강아지, 옆집 어르신의 인사 — 그것들이 지금도 결을 만들고 있어요.

리포트에 적힌 게 전부가 아니에요. 글로 옮길 수 없는 시간들이 더 깊이 자리잡아요. 당신의 시간도 그렇기를.

언제든 다시 와요. 그땐 더 깊은 곳까지 보일 거예요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeBookingConfirmedLetter(
  residence: Residence,
  startDate: string,
  nights: number
): Letter {
  const stayLabel = `${nights}박 ${nights + 1}일`;
  return {
    id: uid(),
    category: "system",
    trigger: "booking_confirmed",
    sender: { ...SYSTEM_SENDER },
    title: `${residence.region} ${residence.name} 예약이 확정됐어요`,
    preview: `${startDate} 시작 · ${stayLabel}. 잘 다녀오세요.`,
    body: `${residence.region}의 ${residence.name} 예약이 확정됐어요.

· 시작: ${startDate}
· 기간: ${stayLabel}

자세한 도착 안내는 시작 1주일 전 별도 메일로 전달드릴게요. 짐 가볍게 챙기시고, 마음만 든든히 가져오세요.

청풍 시뮬레이션과는 또 다른 결의 시간이 기다리고 있어요. 잘 다녀오세요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

// 커뮤니티 mock — 데모용. 발신자도 미션에서 만난 NPC 톤으로 통일.
export function makeCommunityMockLetter(): Letter {
  const messages = [
    {
      sender: { name: "풍물시장 사장님", role: "1층 좌판에서 만난 분", emoji: "🛒" },
      title: "지난번 시식 잘 드셨어요?",
      preview: "순무김치 들고 다음에 또 들러요.",
      body:
        "지난번 시식, 어땠어요?\n\n순무가 강화 갯벌 미네랄 머금어서 다른 데랑 맛이 진짜 다르거든요. 다음에 또 들러요. 단골이라고 알아볼게요.\n\n잘 지내요.",
    },
    {
      sender: { name: "책방 주인", role: "동네 책방에서 만난 분", emoji: "📚" },
      title: "함민복 시인 책 한 권 더 들어왔어요",
      preview: "갯벌 시집 신간이에요.",
      body:
        "지난번 다녀가셨을 때 함민복 시인 책 보셨던 거 기억나요.\n\n신간 한 권 더 들어왔어요. 갯벌 시집인데, 다녀가셨던 동막 갯벌 풍경이 생각날 거예요. 들러주세요.\n\n천천히 와도 괜찮아요.",
    },
    {
      sender: { name: "농사 선배", role: "텃밭 클럽에서 만난 분", emoji: "🌱" },
      title: "텃밭 한 평, 잘 자라고 있어요",
      preview: "당신이 심은 줄에 새싹이 올라왔어요.",
      body:
        "지난번 같이 심었던 자리에 새싹이 올라왔어요.\n\n동네 사람들이 같이 키운다는 게 이런 거예요. 또 와요. 와서 한 번 봐주면 더 잘 자랄 거예요.\n\n천천히 머물러요.",
    },
  ];
  const pick = messages[Math.floor(Math.random() * messages.length)];
  return {
    id: uid(),
    category: "community",
    trigger: "community",
    sender: pick.sender,
    title: pick.title,
    preview: pick.preview,
    body: pick.body,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

// =====================================================================
// 시드 — 첫 진입 시 빈 인박스 대신 환영 편지 + 샘플 커뮤니티 1통
// =====================================================================

export function getInitialLetters(): Letter[] {
  const welcome = makeWelcomeLetter();
  return [welcome];
}

// =====================================================================
// 헬퍼 — unread 개수, 시간 표시
// =====================================================================

export function unreadCount(letters: Letter[]): number {
  return letters.reduce((n, l) => n + (l.read ? 0 : 1), 0);
}

// "방금 전" / "10분 전" / "2시간 전" / "어제" / "3일 전" / "2026-06-04"
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toISOString().slice(0, 10);
}
