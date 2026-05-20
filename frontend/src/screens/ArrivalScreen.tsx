// 지역 도착 화면 — PRD 2.지역 도착 화면
// 상단: "📍 ○○ 도착!" + 캐릭터, 우편함 카드, 잠시섬 미션 리스트

import { useState } from "react";
import { motion } from "framer-motion";
import Character from "../components/Character";
import MissionCard from "../components/MissionCard";
import MailboxModal from "../components/MailboxModal";
import { baseMissions } from "../data/missions";
import { storiesByResidenceId } from "../data/stories";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  onBack: () => void;
};

export default function ArrivalScreen({ residence, onBack }: Props) {
  // 우편함 모달 열림 여부
  const [showMail, setShowMail] = useState(false);
  const story = storiesByResidenceId[residence.id] ?? null;

  // 미션 진행률 — 데모용 카운트
  const total = baseMissions.length;
  const done = baseMissions.filter((m) => m.done).length;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col">
      {/* 배경 — 파스텔 따뜻한 톤 */}
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

        {/* 캐릭터 발 밑 그림자 라인 — 땅 위 느낌 */}
        <div className="mx-auto w-32 h-1.5 rounded-full bg-nature-200/60 -mt-2" />
      </section>

      {/* 우편함 */}
      <section className="px-5 mt-4">
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

      {/* 미션 리스트 */}
      <section className="flex-1 px-5 mt-5 pb-6">
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-ink text-[17px] font-extrabold">잠시섬 미션</h2>
          <span className="text-ink-mute text-[12px]">
            <span className="text-primary font-bold">{done}</span> / {total} 완료
          </span>
        </div>

        <ul className="space-y-2">
          {baseMissions.map((m) => (
            <li key={m.id}>
              <MissionCard
                mission={m}
                onClick={() => {
                  // TODO: 미션 상세 화면 연결 (다음 단계)
                  console.log("[미션 선택]", m.id);
                }}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* 우편함 모달 */}
      <MailboxModal
        open={showMail}
        story={story}
        onClose={() => setShowMail(false)}
      />
    </div>
  );
}
