// 문화 미션 카드 — 바텀시트 리스트 아이템
// 레퍼런스(레지던스 카드.jpg): 파스텔 배경 카드 + 좌측 텍스트(소제목/큰 제목) + 우측 썸네일 + 하단 태그칩
// 텍스트는 village_archive 실제 값(이름/태그라인/지역/태그)만 사용.

import { motion } from "framer-motion";
import type { VillageMission } from "../data/villageMissions";

type Props = {
  mission: VillageMission;
  isActive: boolean;
  onClick: () => void;
  // 부모(떠나기 화면)가 마커 선택 시 해당 카드로 스크롤하기 위한 ref 전달
  cardRef?: (el: HTMLButtonElement | null) => void;
};

export default function VillageMissionCard({
  mission,
  isActive,
  onClick,
  cardRef,
}: Props) {
  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
      className={`w-full text-left rounded-3xl p-4 flex gap-3 items-stretch
        bg-white transition shadow-soft
        ${isActive ? "ring-2 ring-primary" : "ring-1 ring-cream-200"}`}
    >
      {/* 좌측 텍스트 영역 */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 지역명 (소제목) */}
        <p className="text-ink-mute text-[11px] font-semibold mb-0.5">
          📍 {mission.regionLabel || "지역 미정"}
        </p>

        {/* 미션 제목 = 마을 이름 */}
        <h3 className="text-ink text-[16px] font-extrabold leading-tight line-clamp-1">
          {mission.name}
        </h3>

        {/* 한 줄 설명 = 태그라인 */}
        <p className="mt-1 text-ink-soft text-[12px] leading-snug line-clamp-2">
          {mission.tagline}
        </p>

        {/* 하단 태그칩 (최대 2개) */}
        <div className="mt-auto pt-2 flex flex-wrap gap-1">
          {mission.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-nature-50 text-nature-600
                         text-[10px] font-bold"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 우측 썸네일 (태그 기반 파스텔 + 이모지 플레이스홀더) */}
      <div
        className="shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${mission.colorFrom}, ${mission.colorTo})`,
        }}
        aria-hidden
      >
        <span className="text-[34px]">{mission.emoji}</span>
      </div>
    </motion.button>
  );
}
