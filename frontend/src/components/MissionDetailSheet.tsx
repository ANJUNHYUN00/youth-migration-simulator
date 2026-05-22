// 문화 미션 상세 — 카드 탭 시 전체화면으로 펼쳐지는 상세
// 레퍼런스(카드확장.jpg): 큰 이미지 + 제목 + 상세 정보 + 하단 CTA 버튼
// 텍스트는 village_archive 실제 값만 사용. 큰 이미지는 태그 기반 플레이스홀더.

import { motion, AnimatePresence } from "framer-motion";
import type { VillageMission } from "../data/villageMissions";
import PrimaryButton from "./PrimaryButton";

type Props = {
  mission: VillageMission | null;
  started: boolean;
  onClose: () => void;
  onStart: (mission: VillageMission) => void;
};

export default function MissionDetailSheet({
  mission,
  started,
  onClose,
  onStart,
}: Props) {
  return (
    <AnimatePresence>
      {mission && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute inset-0 z-30 bg-cream flex flex-col"
          role="dialog"
          aria-label={`${mission.name} 미션 상세`}
        >
          {/* 헤더 — 뒤로가기 */}
          <header className="pt-12 px-5 pb-2 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="뒤로가기"
              className="w-9 h-9 rounded-full bg-white shadow-soft
                         flex items-center justify-center text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 6 9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h2 className="text-ink text-[15px] font-bold">레지던스 문화 미션</h2>
          </header>

          {/* 스크롤 본문 */}
          <div className="flex-1 overflow-y-auto px-5 pb-28">
            {/* 큰 이미지 (태그 기반 플레이스홀더) */}
            <div
              className="mt-1 w-full h-44 rounded-3xl flex items-center justify-center
                         shadow-soft relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${mission.colorFrom}, ${mission.colorTo})`,
              }}
              aria-hidden
            >
              <span className="text-[88px] drop-shadow-sm">{mission.emoji}</span>
              <span
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                           bg-white/80 text-ink text-[11px] font-bold"
              >
                {mission.category}
              </span>
            </div>

            {/* 지역 */}
            <p className="mt-4 text-ink-soft text-[13px] font-semibold">
              📍 {mission.regionLabel || "지역 미정"}
            </p>

            {/* 제목 */}
            <h1 className="mt-1 text-ink text-[22px] font-extrabold leading-tight">
              {mission.name}
            </h1>

            {/* 태그라인 */}
            {mission.tagline && (
              <p className="mt-1.5 text-primary-600 text-[14px] font-semibold leading-snug">
                {mission.tagline}
              </p>
            )}

            {/* 태그칩 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mission.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-nature-50 text-nature-600
                             text-[11px] font-bold"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* 상세 설명 */}
            <div className="mt-5">
              <h3 className="text-ink text-[14px] font-bold mb-1.5">미션 소개</h3>
              <p className="text-ink-soft text-[14px] leading-relaxed whitespace-pre-line">
                {mission.description}
              </p>
            </div>
          </div>

          {/* 하단 고정 CTA */}
          <div className="absolute left-0 right-0 bottom-0 px-5 pb-6 pt-3
                          bg-gradient-to-t from-cream via-cream to-transparent">
            {started ? (
              <div
                className="w-full py-4 rounded-2xl bg-nature-50 text-nature-600
                           text-[15px] font-bold text-center"
                role="status"
              >
                ✅ 미션을 시작했어요!
              </div>
            ) : (
              <PrimaryButton onClick={() => onStart(mission)}>
                미션 시작하기 🚩
              </PrimaryButton>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
