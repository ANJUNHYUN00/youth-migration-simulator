// 동선 요약 화면 — PRD: 러닝 앱 스타일 경로 UI
// 모든 미션 완료 후 노출. 오늘 다녀온 곳을 시간 흐름대로 나열한다.

import { motion } from "framer-motion";
import { baseMissions, type Mission } from "../data/missions";

type Props = {
  region: string;
  completedIds: Set<string>;
  totalScore: number;
  onClose: () => void;
};

// 미션 사이 도보 시간 (mock) — 미션 8개 사이 7개 간격이라 임의로 채움
const WALK_TIMES_MIN = [4, 6, 5, 3, 7, 4, 6];
const DISTANCE_KM = 2.3;
const TOTAL_MIN = 35;

export default function RouteSummaryScreen({
  region,
  completedIds,
  totalScore,
  onClose,
}: Props) {
  // 사용자가 완료한 미션을 baseMissions 순서대로 정렬
  const visited: Mission[] = baseMissions.filter((m) => completedIds.has(m.id));

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold uppercase tracking-widest">
            오늘의 기록
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            오늘 {region}에서의 동선
          </h1>
        </div>
      </header>

      {/* 요약 통계 카드 */}
      <section className="px-5 mt-4">
        <div className="bg-gradient-to-br from-nature-50 to-primary-50
                        border border-nature-200 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-ink-soft font-bold">총 축적 점수</p>
              <p className="text-primary text-[24px] font-extrabold tabular-nums">
                {totalScore} 점
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink-soft font-bold">
                이동거리 · 시간
              </p>
              <p className="text-ink text-[16px] font-extrabold">
                {DISTANCE_KM}km · {TOTAL_MIN}분
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 타임라인 */}
      <section className="flex-1 px-5 mt-5 overflow-y-auto pb-6">
        <ol className="relative">
          {/* 출발지 */}
          <RouteItem
            icon="🏠"
            label="레지던스 출발"
            tone="start"
            delay={0}
          />
          <WalkGap minutes={WALK_TIMES_MIN[0]} delay={0.05} />

          {/* 방문한 미션들 */}
          {visited.map((m, i) => (
            <div key={m.id}>
              <RouteItem
                icon={m.icon}
                label={`${m.title} 완료`}
                sub={`+${m.reward} 점`}
                tone="done"
                delay={0.1 + i * 0.08}
              />
              {i < visited.length - 1 && (
                <WalkGap
                  minutes={WALK_TIMES_MIN[(i + 1) % WALK_TIMES_MIN.length]}
                  delay={0.12 + i * 0.08}
                />
              )}
            </div>
          ))}

          {/* 도착지 */}
          {visited.length > 0 && (
            <>
              <WalkGap minutes={4} delay={0.6} />
              <RouteItem
                icon="🌙"
                label="레지던스 복귀"
                tone="end"
                delay={0.65}
              />
            </>
          )}
        </ol>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-extrabold
                     active:scale-[0.99] shadow-soft transition"
        >
          잘 했어요 🍃
        </button>
      </footer>
    </div>
  );
}

// 타임라인 한 줄 — 아이콘 + 라벨
function RouteItem({
  icon,
  label,
  sub,
  tone,
  delay,
}: {
  icon: string;
  label: string;
  sub?: string;
  tone: "start" | "done" | "end";
  delay: number;
}) {
  const ringColor =
    tone === "done"
      ? "ring-nature-400 bg-white"
      : tone === "end"
      ? "ring-ink-mute bg-white"
      : "ring-primary bg-white";
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 mb-1"
    >
      <span
        className={`w-11 h-11 rounded-full ring-2 ${ringColor}
                    flex items-center justify-center text-xl shadow-soft`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[14px] font-extrabold leading-tight">
          {label}
        </p>
        {sub && (
          <p className="text-primary text-[11px] font-bold mt-0.5">{sub}</p>
        )}
      </div>
    </motion.li>
  );
}

// 미션 사이 도보 표시 — 점선 + 도보 N분
function WalkGap({
  minutes,
  delay,
}: {
  minutes: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 pl-5 mb-1"
    >
      {/* 점선 세로 */}
      <span
        className="w-px h-6 border-l-2 border-dashed border-cream-200 ml-[14px]"
        aria-hidden
      />
      <p className="text-ink-mute text-[11px] font-medium">
        도보 {minutes}분
      </p>
    </motion.div>
  );
}
