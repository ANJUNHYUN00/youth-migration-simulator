// 미션 리스트 화면 — PRD: 말해보카 회화 UI 스타일 카드형 리스트
// 8개 일반 미션 + 최종 미션(모든 일반 미션 완료 시 활성화) 노출.
// 카드 탭 시 부모(App)가 MissionExecuteScreen으로 전환한다.

import { motion } from "framer-motion";
import MissionCard from "../components/MissionCard";
import { baseMissions, finalMission, type Mission } from "../data/missions";

type Props = {
  region: string;
  completedIds: Set<string>;
  totalScore: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
  onSelectFinal?: () => void;
};

export default function MissionListScreen({
  region,
  completedIds,
  totalScore,
  onBack,
  onSelectMission,
  onSelectFinal,
}: Props) {
  const total = baseMissions.length;
  const doneCount = baseMissions.filter((m) => completedIds.has(m.id)).length;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="도착 화면으로"
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
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold tracking-widest uppercase">
            {region} 잠시섬 미션
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            오늘 하루, 어떤 걸 해볼까요?
          </h1>
        </div>
      </header>

      {/* 진행률 + 축적 점수 */}
      <section className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-3.5 shadow-soft border border-cream-200">
          <div className="flex items-baseline justify-between">
            <p className="text-ink text-[12px] font-bold">미션 진행률</p>
            <p className="text-[12px] text-ink-mute">
              <span className="text-primary font-extrabold">{doneCount}</span>{" "}
              / {total} 완료
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nature-300 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-ink-mute">축적 점수</span>
            <span className="text-primary font-extrabold tabular-nums">
              {totalScore} 점
            </span>
          </div>
        </div>
      </section>

      {/* 미션 카드 리스트 */}
      <section className="flex-1 px-5 mt-4 pb-6">
        <ul className="space-y-2">
          {baseMissions.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <MissionCard
                mission={m}
                done={completedIds.has(m.id)}
                onClick={() => onSelectMission(m)}
              />
            </motion.li>
          ))}

          {/* 최종 미션 — 모든 일반 미션 완료 시 활성화 */}
          <motion.li
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <button
              type="button"
              disabled={!allDone}
              onClick={onSelectFinal}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl
                          border text-left shadow-soft transition
                          ${
                            allDone
                              ? "bg-gradient-to-br from-primary-50 to-nature-50 border-primary active:scale-[0.99]"
                              : "bg-cream-100 border-cream-200 opacity-60 cursor-not-allowed"
                          }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0
                  ${allDone ? "bg-white" : "bg-cream-200"}`}
                aria-hidden
              >
                {finalMission.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink text-[14px] font-extrabold leading-tight">
                  {finalMission.title}
                </p>
                <p className="mt-0.5 text-ink-mute text-[11px]">
                  {allDone
                    ? "모든 체험이 끝났어요. 리포트를 만들어보세요"
                    : "모든 미션 완료 후 활성화"}
                </p>
              </div>
              <span
                className={`shrink-0 text-[12px] font-extrabold
                  ${allDone ? "text-primary" : "text-ink-mute"}`}
              >
                +{finalMission.reward}점
              </span>
            </button>
          </motion.li>
        </ul>
      </section>
    </div>
  );
}
