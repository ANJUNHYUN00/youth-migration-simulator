// 잠시섬 미션 카드 — PRD 미션 수행 UX
// 카드 구성: 아이콘 / 제목 / 카테고리·소요시간·난이도 / 완료 여부

import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  onClick?: () => void;
};

export default function MissionCard({ mission, onClick }: Props) {
  const stars =
    "★".repeat(mission.difficulty) + "☆".repeat(3 - mission.difficulty);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl
                  border text-left transition shadow-soft
                  ${
                    mission.done
                      ? "bg-nature-50 border-nature-200"
                      : "bg-white border-cream-200 active:scale-[0.99]"
                  }`}
    >
      {/* 좌측 아이콘 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0
          ${mission.done ? "bg-white" : "bg-cream-100"}`}
        aria-hidden
      >
        {mission.icon}
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[14px] font-bold leading-tight truncate">
          {mission.title}
        </p>
        <p className="mt-0.5 text-ink-mute text-[11px]">
          {mission.category} · {mission.duration} · 난이도{" "}
          <span className="text-primary">{stars}</span>
        </p>
      </div>

      {/* 우측 상태 */}
      {mission.done ? (
        <span className="text-nature-600 text-[12px] font-bold shrink-0">
          ✓ 완료
        </span>
      ) : (
        <span className="text-primary text-[12px] font-bold shrink-0">
          시작 ›
        </span>
      )}
    </button>
  );
}
