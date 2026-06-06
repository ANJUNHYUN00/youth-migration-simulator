// 레지던스 진입 직후 "찐 홈" — 사용자가 영월/강화도 등에 입장한 상태의 일상 홈.
// 야매 홈(서울 본가)은 그대로 두고, 이 화면은 "지금 여기 살고 있다" 톤.
//
// 톤 디자인:
//   - 풀스크린 풍경 + 시간대(아침/오후/저녁/밤) 라벨로 "지금"이 있게.
//   - 큰 떠나기 CTA·추상 카피 없음. 대신 "오늘 할 일" 카드 한 장.
//   - 작은 보조 액션: 본가로 돌아가기.

import { motion } from "framer-motion";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  nickname: string;
  homeRegion: string;
  currentDay: number;
  dayCount: number;
  // 오늘 일차의 미션 총 개수 + 완료 개수
  todayMissionCount: number;
  todayMissionDoneCount: number;
  onGoMissionList: () => void;
  onReturnHome: () => void;
};

// 지역별 풀스크린 배경 — 자산 있는 곳만 매핑, 없으면 그라데이션 폴백
const HOME_BG_IMAGE: Record<string, string> = {
  ganghwa: "/home_ganghwa.png",
  yeongwol: "/home_yeongwol.png",
};

// 시간대 — 카피·라벨용
type TimeOfDay = "아침" | "오후" | "저녁" | "밤";
function pickTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "아침";
  if (h >= 11 && h < 17) return "오후";
  if (h >= 17 && h < 21) return "저녁";
  return "밤";
}

function greeting(region: string, tod: TimeOfDay): string {
  switch (tod) {
    case "아침":
      return `${region}의 아침이에요`;
    case "오후":
      return `${region}의 오후, 한가운데에 있어요`;
    case "저녁":
      return `${region}의 저녁이 내려와요`;
    case "밤":
      return `${region}의 밤, 잠시 쉬어가요`;
  }
}

export default function ResidenceHomeScreen({
  residence,
  nickname,
  homeRegion,
  currentDay,
  dayCount,
  todayMissionCount,
  todayMissionDoneCount,
  onGoMissionList,
  onReturnHome,
}: Props) {
  const bgImage = HOME_BG_IMAGE[residence.id];
  const tod = pickTimeOfDay();
  const remaining = Math.max(0, todayMissionCount - todayMissionDoneCount);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 — 풍경 사진 또는 그라데이션 폴백 */}
      <div
        className="absolute inset-0
                   bg-[linear-gradient(to_bottom,#BDE7FF_0%,#FFF6E8_45%,#F6EAD8_100%)]"
        aria-hidden
      />
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* 하단 가독성 마스크 — 카드 영역 위에 살짝 어둡게 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]
                   bg-gradient-to-t from-[#3E2C20]/45 via-[#3E2C20]/12 to-transparent
                   pointer-events-none"
        aria-hidden
      />

      {/* 상단 작은 라벨 — Day · 시간대 · 지역 */}
      <header className="relative pt-12 px-6">
        <p className="text-white/95 text-[11px] font-extrabold tracking-[0.18em] uppercase
                      drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          {tod} · Day {currentDay} / {dayCount}
        </p>
        <h1 className="mt-1.5 text-white text-[22px] font-extrabold leading-snug
                       drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
          {nickname}님, {greeting(residence.region, tod)}
        </h1>
      </header>

      {/* 본문 — 배경이 보이도록 비움 */}
      <div className="flex-1" />

      {/* 하단 — 오늘 할 일 카드 + 본가로 돌아가기 작은 액션 */}
      <div className="relative z-10 px-4 pb-6 space-y-2.5">
        <motion.button
          type="button"
          onClick={onGoMissionList}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-3xl bg-white/95 backdrop-blur
                     border border-cream-200 shadow-soft
                     p-4 flex items-center gap-3 text-left transition"
        >
          <span
            aria-hidden
            className="w-12 h-12 rounded-2xl bg-primary-50
                       flex items-center justify-center text-2xl shrink-0"
          >
            🗺
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold text-primary uppercase tracking-widest">
              오늘 할 일
            </p>
            <p className="mt-0.5 text-ink text-[15px] font-extrabold">
              {todayMissionCount === 0
                ? "오늘 일정은 비어있어요"
                : remaining === 0
                ? `오늘 할 일 ${todayMissionCount}개 다 마쳤어요`
                : `오늘 ${remaining}개 더 둘러볼 수 있어요`}
            </p>
            <p className="mt-0.5 text-ink-mute text-[11.5px]">
              {todayMissionDoneCount}/{todayMissionCount} 완료
            </p>
          </div>
          <span aria-hidden className="text-ink-mute text-[16px] shrink-0">
            ›
          </span>
        </motion.button>

        {/* 본가로 돌아가기 — 가운데 작은 텍스트 버튼 */}
        <div className="flex justify-center pt-1">
          <motion.button
            type="button"
            onClick={onReturnHome}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                       bg-white/80 backdrop-blur border border-white/70
                       text-[#7A6254] text-[12px] font-bold shadow-soft"
          >
            <span aria-hidden>←</span>
            {homeRegion}로 돌아가기
          </motion.button>
        </div>
      </div>
    </div>
  );
}
