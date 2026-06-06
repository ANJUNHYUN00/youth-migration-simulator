// 탭1 홈 화면 — "나의 마음 자리" 정체성
//
// 멘토 피드백: 기존 홈은 "떠나기 버튼" 한 개라 정체성이 약했음.
// 청풍 비전("관계 쌓기 + 미래 그리기")에 맞춰 홈을 사용자의 "마음 자리"로 재구성.
//
// 섹션 순서:
//   1) 헤더 — 닉네임 + 본 지역 + 다녀온 지역 수 한 줄
//   2) 내 마음의 자리 — HouseStage 4단계(다녀온 지역 수 기반) + 자리 라벨
//   3) 오늘의 편지 — 다녀온 지역(없으면 첫 추천)의 Story 한 통 미리보기
//   4) 다녀온 흔적 — 방문한 지역 이모지 칩들
//   5) 새 지역 떠나기 — 작은 그라데이션 카드 (큰 CTA 아님)
//
// "떠나기"가 홈의 메인이 아니라 사용자 흔적 위의 보조 액션이 됨.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import HouseStage from "../components/HouseStage";
import MailboxModal from "../components/MailboxModal";
import { SPACE_STAGE_NAMES } from "../data/dayPlan";
import { residences, recommendedResidences } from "../data/residences";
import { storiesByResidenceId, type Story } from "../data/stories";
import type { RegionRecord } from "../data/journey";

type Props = {
  nickname: string;
  homeRegion: string;
  regionProgress: Record<string, RegionRecord>;
  onDepart: () => void;
};

// 다녀온 지역 수 → 내 마음의 자리 stage (0~3)
function innerStageForVisited(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

export default function HomeScreen({
  nickname,
  homeRegion,
  regionProgress,
  onDepart,
}: Props) {
  // 다녀온 적 있는 지역들
  const visitedResidences = useMemo(
    () =>
      residences.filter(
        (r) => (regionProgress[r.id]?.visitCount ?? 0) > 0
      ),
    [regionProgress]
  );

  const innerStage = innerStageForVisited(visitedResidences.length);

  // 오늘의 편지 — 가장 최근 다녀온 지역(첫 visited)의 Story.
  // 다녀온 곳 없으면 첫 추천 지역 Story로 폴백 → 빈 홈에서도 "맛보기" 가능.
  const letterResidence = visitedResidences[0] ?? recommendedResidences[0];
  const todayLetter: Story | null =
    storiesByResidenceId[letterResidence?.id] ?? null;

  const [mailboxOpen, setMailboxOpen] = useState(false);

  return (
    <div
      className="relative min-h-[calc(100dvh-6rem)]
                 bg-gradient-to-b from-cream via-cream to-nature-50"
    >
      {/* === 헤더 === */}
      <header className="px-5 pt-7 pb-3">
        <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Home
        </p>
        <h1 className="mt-1 text-[24px] font-extrabold text-ink leading-tight">
          {nickname}님의 마음 자리
        </h1>
        <p className="mt-1 text-[12px] text-ink-soft">
          {homeRegion}에서 시작해, 지금까지{" "}
          <span className="text-ink font-bold">{visitedResidences.length}곳</span>
          다녀왔어요
        </p>
      </header>

      <div className="px-4 space-y-3 pb-8">
        {/* === 내 마음의 자리 — HouseStage + 라벨 === */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white border border-cream-200 shadow-soft p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0">
              <HouseStage stage={innerStage} className="w-full h-auto" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-ink-mute uppercase tracking-widest">
                내 마음의 자리
              </p>
              <p className="mt-0.5 text-ink text-[16px] font-extrabold">
                {SPACE_STAGE_NAMES[innerStage]}
              </p>
              <p className="mt-1 text-ink-soft text-[12px] leading-relaxed">
                {innerStage === 0
                  ? "아직 빈 자리예요. 떠나면서 한 자리씩 채워질 거예요."
                  : `다녀온 지역 ${visitedResidences.length}곳의 흔적이 자리잡고 있어요.`}
              </p>
            </div>
          </div>
        </motion.section>

        {/* === 오늘의 편지 — 우편함 미리보기 === */}
        {todayLetter && (
          <motion.button
            type="button"
            onClick={() => setMailboxOpen(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left rounded-3xl bg-white border border-cream-200
                       shadow-soft p-4 flex items-center gap-3 transition"
          >
            <span
              aria-hidden
              className="w-12 h-12 rounded-2xl bg-primary-50
                         flex items-center justify-center text-2xl shrink-0"
            >
              📮
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                오늘의 편지
              </p>
              <p className="mt-0.5 text-ink text-[14px] font-extrabold truncate">
                {todayLetter.title}
              </p>
              <p className="mt-0.5 text-ink-mute text-[11px]">
                — {todayLetter.author} ({letterResidence.region})
              </p>
            </div>
            <span aria-hidden className="text-ink-mute text-[16px] shrink-0">
              ›
            </span>
          </motion.button>
        )}

        {/* === 다녀온 흔적 — 칩 리스트 === */}
        {visitedResidences.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="rounded-3xl bg-white/60 border border-cream-200 p-3.5"
          >
            <p className="text-[10.5px] font-bold text-ink-mute uppercase tracking-widest mb-2 px-0.5">
              다녀온 흔적
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visitedResidences.map((r) => (
                <span
                  key={r.id}
                  className="px-2.5 py-1.5 rounded-full bg-nature-50 border border-nature-200
                             text-nature-600 text-[12px] font-bold"
                >
                  <span aria-hidden className="mr-0.5">
                    {r.themeEmoji}
                  </span>
                  {r.region}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* === 새 지역 떠나기 — 작은 카드 (큰 CTA 아님) === */}
        <motion.button
          type="button"
          onClick={onDepart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-3xl bg-gradient-to-r from-[#FFB089] to-[#FF7043]
                     text-white p-4 shadow-soft transition flex items-center gap-3"
        >
          <span aria-hidden className="text-2xl">
            🎒
          </span>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[12px] font-bold opacity-90">새로운 지역</p>
            <p className="mt-0.5 text-[15px] font-extrabold">떠나기 →</p>
          </div>
        </motion.button>
      </div>

      {/* 우편함 모달 — absolute inset-0 라 홈 wrapper 안에서 띄움 */}
      <MailboxModal
        open={mailboxOpen}
        story={todayLetter}
        onClose={() => setMailboxOpen(false)}
      />
    </div>
  );
}
