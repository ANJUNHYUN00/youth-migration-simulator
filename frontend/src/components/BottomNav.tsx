// 하단 고정 네비게이션 — PRD 명시: 탭 2개 구조
// 탭1: 홈/떠나기 (행동 시작) / 탭2: 나의 여정 (축적·성장)

export type TabKey = "home" | "journey";

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px]
                 bg-white/90 backdrop-blur border-t border-cream-200
                 px-6 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]
                 flex justify-around items-center"
      aria-label="하단 탭"
    >
      <TabButton
        label="홈"
        sub="떠나기"
        isActive={active === "home"}
        onClick={() => onChange("home")}
        icon={<HomeIcon active={active === "home"} />}
      />
      <TabButton
        label="나의 여정"
        sub="아트맵"
        isActive={active === "journey"}
        onClick={() => onChange("journey")}
        icon={<MapIcon active={active === "journey"} />}
      />
    </nav>
  );
}

// 개별 탭 버튼
function TabButton({
  label,
  sub,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  sub: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition
        ${isActive ? "text-primary" : "text-ink-mute"}`}
      aria-pressed={isActive}
    >
      {icon}
      <span className={`text-[11px] font-semibold leading-none ${isActive ? "text-primary" : "text-ink-soft"}`}>
        {label}
      </span>
      <span className="text-[9px] leading-none text-ink-mute">{sub}</span>
    </button>
  );
}

// 홈(봇짐) 아이콘
function HomeIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M4 12.5 13 5l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5h-4V16h-7v6.5h-4A1.5 1.5 0 0 1 4 21v-8.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFE0D3" : "none"}
      />
    </svg>
  );
}

// 아트맵(여정) 아이콘
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
