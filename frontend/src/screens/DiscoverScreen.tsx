// 발견 탭 — 이야기(커뮤니티) + 청년마을(예약) 통합 화면
//
// 상단에 둥근 토글 pill로 두 서브 모드를 전환. 본문은 기존 Community/Booking 화면을
// 그대로 활용해 빠른 머지. 청년마을에서 카드를 누르면 부모가 booking-detail 라우트로
// 이동시키고, BottomNav는 발견을 계속 하이라이트(visibleActive).
//
// 토글은 fixed-top 으로 화면 위에 떠있어 inner 화면의 자체 sticky header 위에 겹쳐
// 보이지만, 두 화면 다 본문에 충분한 pt-7 가 있어 가독성 침해는 최소화.

import { motion } from "framer-motion";
import CommunityScreen from "./CommunityScreen";
import BookingScreen from "./BookingScreen";
import { recommendedResidences, type Residence } from "../data/residences";

export type DiscoverSubTab = "stories" | "residences";

type Props = {
  subTab: DiscoverSubTab;
  onSubTabChange: (sub: DiscoverSubTab) => void;
  onSelectResidence: (r: Residence) => void;
  // 청년마을 좋아요 — 내 정보 탭과 통합 관리 (App.tsx)
  liked: Set<string>;
  onToggleLike: (residenceId: string) => void;
};

export default function DiscoverScreen({
  subTab,
  onSubTabChange,
  onSelectResidence,
  liked,
  onToggleLike,
}: Props) {
  return (
    <>
      {/* 상단 떠있는 토글 — z-50 으로 모든 sticky header 위에 */}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex bg-white border border-cream-200 rounded-full p-0.5 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.18)]">
          <ToggleBtn
            label="이야기"
            active={subTab === "stories"}
            onClick={() => onSubTabChange("stories")}
          />
          <ToggleBtn
            label="청년마을"
            active={subTab === "residences"}
            onClick={() => onSubTabChange("residences")}
          />
        </div>
      </div>

      {/* 본문 — 기존 화면을 그대로 활용 */}
      {subTab === "stories" ? (
        <CommunityScreen />
      ) : (
        <BookingScreen
          residences={recommendedResidences}
          onSelectResidence={onSelectResidence}
          liked={liked}
          onToggleLike={onToggleLike}
        />
      )}
    </>
  );
}

function ToggleBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      aria-pressed={active}
      className={`px-4 py-1.5 rounded-full text-[12px] font-extrabold transition
        ${active ? "bg-primary text-white shadow-soft" : "text-ink-soft"}`}
    >
      {label}
    </motion.button>
  );
}
