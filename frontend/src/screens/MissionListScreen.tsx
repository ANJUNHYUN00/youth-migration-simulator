// 미션 리스트 — 카테고리 4섹션 + 코버플로우 캐러셀
// 헤더/진행률 그대로, 그 아래 sticky 카테고리 탭 + 세로 스크롤 섹션들

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import CategoryTabs from "../components/CategoryTabs";
import MissionCarousel from "../components/MissionCarousel";
import MissionImageCard from "../components/MissionImageCard";
import { finalMission, type Mission } from "../data/missions";
import { missionsForResidence } from "../data/regionMissions";
import {
  MISSION_GROUP_ORDER,
  groupMissions,
  missionGroupMeta,
  type MissionGroup,
} from "../data/missionCategories";

type Props = {
  region: string;
  residenceId: string;
  completedIds: Set<string>;
  totalScore: number;
  fitScore?: number;
  onBack: () => void;
  onSelectMission: (mission: Mission) => void;
  onSelectFinal?: () => void;
};

export default function MissionListScreen({
  region,
  residenceId,
  completedIds,
  totalScore,
  fitScore = 0,
  onBack,
  onSelectMission,
  onSelectFinal,
}: Props) {
  const allMissions = useMemo(
    () => missionsForResidence(residenceId),
    [residenceId]
  );
  const grouped = useMemo(() => groupMissions(allMissions), [allMissions]);

  const counts: Record<MissionGroup, number> = {
    roadview: grouped.roadview.length,
    real: grouped.real.length,
    people: grouped.people.length,
    rest: grouped.rest.length,
  };

  const total = allMissions.length;
  const doneCount = allMissions.filter((m) => completedIds.has(m.id)).length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = total > 0 && doneCount === total;

  // 세로 스크롤 컨테이너 + 섹션 ref — sticky 탭 활성 추적용
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<MissionGroup, HTMLElement | null>>({
    roadview: null,
    real: null,
    people: null,
    rest: null,
  });
  const [activeGroup, setActiveGroup] = useState<MissionGroup>("roadview");

  // IntersectionObserver — 가장 화면 중앙에 가까운 섹션을 active로
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { g: MissionGroup; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const g = (e.target as HTMLElement).dataset.group as MissionGroup;
          if (!g) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { g, ratio: e.intersectionRatio };
          }
        }
        if (best) setActiveGroup(best.g);
      },
      {
        root,
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0, 0.15, 0.4, 0.7, 1],
      }
    );
    for (const g of MISSION_GROUP_ORDER) {
      const el = sectionRefs.current[g];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleTabSelect = (g: MissionGroup) => {
    const el = sectionRefs.current[g];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      ref={scrollRef}
      className="relative h-[calc(100dvh-6rem)] bg-cream overflow-y-auto"
    >
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

      {/* 진행률 + 축적 점수 + 적합도 변화 */}
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
          {fitScore !== 0 && (
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-ink-mute">적합도 누적</span>
              <span
                className={`font-extrabold tabular-nums ${
                  fitScore > 0 ? "text-nature-600" : "text-[#E55A30]"
                }`}
              >
                {fitScore > 0 ? "+" : ""}
                {fitScore}
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="h-4" />

      {/* sticky 카테고리 탭 */}
      <CategoryTabs
        active={activeGroup}
        counts={counts}
        onSelect={handleTabSelect}
      />

      {/* 카테고리 섹션 4개 */}
      {MISSION_GROUP_ORDER.map((g, gi) => {
        const meta = missionGroupMeta[g];
        const items = grouped[g];
        if (items.length === 0) return null;
        return (
          <section
            key={g}
            data-group={g}
            ref={(el) => {
              sectionRefs.current[g] = el;
            }}
            style={{ scrollMarginTop: 56 }}
            className="pt-6 pb-2"
          >
            <div className="px-5 flex items-baseline justify-between">
              <div>
                <h2 className="text-ink text-[16px] font-extrabold">
                  {meta.title}
                </h2>
                <p className="text-ink-soft text-[12px] mt-0.5">
                  {meta.subtitle}
                </p>
              </div>
              <span className="text-ink-mute text-[12px] font-bold tabular-nums">
                {items.length}개
              </span>
            </div>
            <MissionCarousel
              items={items.map((m, i) => (
                <MissionImageCard
                  key={m.id}
                  mission={m}
                  bgImage={meta.bg}
                  done={completedIds.has(m.id)}
                  eager={gi < 2 && i === 0}
                  onClick={() => onSelectMission(m)}
                />
              ))}
            />
          </section>
        );
      })}

      {/* 최종 미션 */}
      <section className="px-5 pt-4 pb-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-ink text-[16px] font-extrabold">
            🏁 오늘의 마무리
          </h2>
        </div>
        <p className="text-ink-soft text-[12px] mt-0.5 mb-3">
          모든 체험이 끝나면 리포트가 열려요
        </p>
        <button
          type="button"
          disabled={!allDone}
          onClick={onSelectFinal}
          className={`relative w-full flex flex-col p-5 rounded-3xl
                      border text-left shadow-soft transition
                      ${
                        allDone
                          ? "bg-gradient-to-br from-primary-50 to-nature-50 border-primary active:scale-[0.99]"
                          : "bg-cream-100 border-cream-200 opacity-70 cursor-not-allowed"
                      }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-primary">
              FINAL
            </span>
            <span className="text-[12px] font-extrabold text-primary tabular-nums">
              +{finalMission.reward}점
            </span>
          </div>

          <div className="mt-4 text-[56px] leading-none" aria-hidden>
            {finalMission.icon}
          </div>

          <p className="mt-3 text-ink-mute text-[11px] font-bold tracking-wide">
            {finalMission.title}
          </p>
          <h3 className="mt-1 text-ink text-[19px] font-extrabold leading-snug">
            {allDone
              ? "오늘의 체험을 한 장의 리포트로"
              : "모든 체험 완료 후 열려요"}
          </h3>

          <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
            {finalMission.description}
          </p>

          <div
            className={`mt-5 text-[12px] font-extrabold ${
              allDone ? "text-primary" : "text-ink-mute"
            }`}
          >
            {allDone ? "리포트 만들기 →" : "🔒 잠금"}
          </div>
        </button>
      </section>
    </div>
  );
}
