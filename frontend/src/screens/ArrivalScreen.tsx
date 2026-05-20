// 지역 도착 화면 — PRD 2.지역 도착 화면 (단순 랜딩)
// "📍 ○○ 도착!" + 캐릭터 + 우편함 카드 + "미션 시작하기" CTA
// 미션 리스트는 별도 화면(MissionListScreen)에서 다루므로 여기는 단순 랜딩에 집중한다.

import { useState } from "react";
import { motion } from "framer-motion";
import Character from "../components/Character";
import MailboxModal from "../components/MailboxModal";
import { storiesByResidenceId } from "../data/stories";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  onBack: () => void;
  onStartMissions: () => void;
};

export default function ArrivalScreen({
  residence,
  onBack,
  onStartMissions,
}: Props) {
  const [showMail, setShowMail] = useState(false);
  const story = storiesByResidenceId[residence.id] ?? null;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col">
      {/* 따뜻한 톤 배경 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-nature-50 via-cream to-cream"
        aria-hidden
      />

      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="홈으로"
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
        <p className="text-ink-soft text-[12px] font-medium">잠시섬 도착</p>
      </header>

      {/* 도착 타이틀 + 캐릭터 */}
      <section className="px-6 mt-2 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-ink text-[26px] font-extrabold"
        >
          📍 {residence.region} 도착!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-1 text-ink-soft text-[13px]"
        >
          {residence.name} · {residence.duration}
        </motion.p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-44 mt-3"
        >
          <Character className="w-full h-auto" />
        </motion.div>

        {/* 발 밑 그림자 라인 */}
        <div className="mx-auto w-32 h-1.5 rounded-full bg-nature-200/60 -mt-2" />
      </section>

      {/* 우편함 카드 */}
      <section className="px-5 mt-5">
        <button
          type="button"
          onClick={() => setShowMail(true)}
          className="w-full bg-white border border-cream-200 rounded-2xl
                     p-3.5 flex items-center gap-3 shadow-soft active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-xl shrink-0">
            📮
          </div>
          <div className="flex-1 text-left">
            <p className="text-ink text-[14px] font-bold leading-tight">
              우편함이 도착했어요
            </p>
            <p className="mt-0.5 text-ink-soft text-[12px]">
              {story?.author ?? "주민"}님의 이야기 한 통
            </p>
          </div>
          <span className="text-primary text-[12px] font-bold">열기 ›</span>
        </button>
      </section>

      {/* 안내 카피 */}
      <section className="flex-1 px-6 mt-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-[280px]"
        >
          <p className="text-ink text-[15px] font-bold leading-snug">
            오늘 하루, 거제에서 잠시 살아볼까요?
          </p>
          <p className="mt-1.5 text-ink-soft text-[13px] leading-relaxed">
            8가지 미션을 하나씩 체험해보면 이 동네의 결이 보여요.
          </p>
        </motion.div>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-4">
        <motion.button
          type="button"
          onClick={onStartMissions}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="w-full py-4 rounded-2xl bg-primary text-white text-[17px] font-extrabold
                     shadow-soft active:scale-[0.99] transition"
        >
          미션 시작하기 🎒
        </motion.button>
      </footer>

      {/* 우편함 모달 */}
      <MailboxModal
        open={showMail}
        story={story}
        onClose={() => setShowMail(false)}
      />
    </div>
  );
}
