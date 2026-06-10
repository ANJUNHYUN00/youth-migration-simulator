// 하단 고정 네비게이션 — 5탭 (4 일반 + 1 중앙 floating)
//
// 슬롯 (왼쪽 → 오른쪽):
//   |  예약  |  커뮤니티  | (notch) |  여정  | 내정보 |   ← <nav>
//                       ◉ 시뮬                       ← 분리된 floating
//
// 편지는 BottomNav 미노출 — ResidenceHomeScreen 의 편지 floating 버튼에서 진입.

export type TabKey =
  | "booking"      // 레지던스 예약 — 잠시 머물 마을 카탈로그
  | "community"    // 커뮤니티 — 이주민 이야기
  | "simulation"   // 시뮬레이션 (중앙 floating) — 본가/마을/미션/편지
  | "journey"      // 여정 — 다녀온 지역 기록·적합도·이주 리포트
  | "profile";     // 내 정보 — 프로필·설정

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  // (예전 letter 탭 unread 배지) — 편지 BottomNav 미노출 후 미사용. 옵션으로만 유지.
  letterUnread?: number;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    // Fragment — nav 와 floating 버튼은 형제 관계. 트리·레이아웃·z-index 모두 독립.
    <>
      {/* ===== 하단 탭바 ===== */}
      <nav
        // · viewport 기준 fixed (좌우 max-w-[420px] 중앙 정렬)
        // · z-40: 콘텐츠 위, 모달/시뮬 버튼(z-50) 아래
        // · 고정 높이 = --nav-h + safe-area
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40
                   bg-white/95 backdrop-blur border-t border-cream-200
                   pb-[var(--safe-b)]"
        aria-label="하단 탭"
      >
        {/* 안쪽: 고정 높이 --nav-h.
            children 모두 flex-1 → 5칸 균등(420/5 = 84px). 4개 탭 + 1 notch. */}
        <div className="h-[var(--nav-h)] flex items-stretch">
          <TabButton
            label="예약"
            isActive={active === "booking"}
            onClick={() => onChange("booking")}
            icon={<BookingIcon active={active === "booking"} />}
          />
          <TabButton
            label="커뮤니티"
            isActive={active === "community"}
            onClick={() => onChange("community")}
            icon={<CommunityIcon active={active === "community"} />}
          />

          {/* notch — 시뮬레이션 버튼이 시각적으로 차지할 자리.
              flex-1 로 84px 슬롯 예약. 실제 버튼은 이 nav 바깥의 sibling. */}
          <div className="flex-1" aria-hidden />

          <TabButton
            label="여정"
            isActive={active === "journey"}
            onClick={() => onChange("journey")}
            icon={<MapIcon active={active === "journey"} />}
          />
          <TabButton
            label="내 정보"
            isActive={active === "profile"}
            onClick={() => onChange("profile")}
            icon={<ProfileIcon active={active === "profile"} />}
          />
        </div>
      </nav>

      {/* ===== 분리된 floating 시뮬레이션 버튼 ===== */}
      {/* 래퍼: 420px 프레임을 viewport 하단에 복제. pointer-events-none 이라 콘텐츠 클릭 방해 X.
          버튼은 이 래퍼 기준 absolute → 데스크톱 미리보기에서도 앱 프레임 중앙 정렬 보장. */}
      <div
        aria-hidden
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 pointer-events-none"
      >
        <CenterSimulationButton
          active={active === "simulation"}
          onClick={() => onChange("simulation")}
        />
      </div>
    </>
  );
}

// 일반 탭 버튼 — flex-1 로 균등 너비. 컨테이너 안에서 수직 중앙 정렬.
function TabButton({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 transition
        ${isActive ? "text-primary" : "text-ink-mute"}`}
      aria-pressed={isActive}
    >
      {icon}
      <span
        className={`text-[11px] font-semibold leading-none ${
          isActive ? "text-primary" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// 중앙 시뮬레이션 — 부모(420px 래퍼) 기준 absolute. pointer-events-auto 로 클릭 복원.
// 위치/크기 모두 CSS var 단일 출처: nav 높이·돌출·safe-area·버튼 크기 변경 시 자동 재계산.
function CenterSimulationButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label="시뮬레이션"
      // · absolute — 부모(viewport bottom 의 420px 래퍼) 기준 위치 계산
      // · left-1/2 -translate-x-1/2 — 앱 프레임 가로 중앙
      // · bottom = --center-btn-bottom — viewport bottom 으로부터 정확한 높이
      // · pointer-events-auto — 래퍼는 none, 버튼만 활성화
      style={{
        bottom: "var(--center-btn-bottom)",
        width: "var(--center-btn-size)",
        height: "var(--center-btn-size)",
      }}
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-auto
                  rounded-full flex items-center justify-center
                  text-white text-[11.5px] font-extrabold leading-tight tracking-tight
                  text-center transition active:scale-95
                  border-[3px] border-white
                  shadow-[0_10px_22px_-6px_rgba(255,112,67,0.65),0_2px_4px_rgba(0,0,0,0.08)]
                  ${
                    active
                      ? "bg-primary ring-4 ring-primary/15"
                      : "bg-primary"
                  }`}
    >
      시뮬
      <br />
      레이션
    </button>
  );
}

// =====================================================================
// 아이콘들
// =====================================================================

// 레지던스 예약(집) 아이콘
function BookingIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  const bg = active ? "#FFE0D3" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      {/* 지붕 */}
      <path
        d="M4 12 L13 5 L22 12 L22 21 L4 21 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={bg}
      />
      {/* 문 */}
      <rect
        x="10.5"
        y="14"
        width="5"
        height="7"
        rx="0.5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}

// 커뮤니티(말풍선) 아이콘
function CommunityIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  const bg = active ? "#FFE0D3" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      {/* 말풍선 본체 */}
      <path
        d="M4 8 a3 3 0 0 1 3 -3 h12 a3 3 0 0 1 3 3 v7 a3 3 0 0 1 -3 3 h-7 l-4 3 v-3 h-1 a3 3 0 0 1 -3 -3 z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={bg}
      />
      {/* 점 3개 */}
      <circle cx="9.5" cy="11.5" r="1.1" fill={color} />
      <circle cx="13" cy="11.5" r="1.1" fill={color} />
      <circle cx="16.5" cy="11.5" r="1.1" fill={color} />
    </svg>
  );
}

// 여정(아트맵) 아이콘
function MapIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="m3 6 6-2 8 2 6-2v16l-6 2-8-2-6 2V6Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFE0D3" : "none"}
      />
      <path d="M9 4v16M17 6v16" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

// 내 정보(사람) 아이콘
function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle
        cx="13"
        cy="9"
        r="4"
        stroke={color}
        strokeWidth="1.8"
        fill={active ? "#FFE0D3" : "none"}
      />
      <path
        d="M5 22c0-4 3.5-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill={active ? "#FFE0D3" : "none"}
      />
    </svg>
  );
}
