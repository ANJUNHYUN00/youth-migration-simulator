// 미션 카드 — 배경 이미지 + 옅은 그라데이션 + 미니멀 텍스트
// 캐러셀 한 칸. 클릭 시 onClick 호출.

import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  bgImage: string;
  done: boolean;
  onClick?: () => void;
  eager?: boolean; // 섹션 첫 카드는 즉시 로드, 나머지는 lazy
};

export default function MissionImageCard({
  mission,
  bgImage,
  done,
  onClick,
  eager,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden
                 shadow-soft text-left ring-1 ring-black/5
                 transition active:scale-[0.99]"
    >
      {/* 배경 이미지 */}
      <img
        src={bgImage}
        alt=""
        aria-hidden
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      {/* 옅은 그라데이션 — 미니멀 톤이라 살짝만 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t
                   from-[#3E2C20]/65 via-[#3E2C20]/10 to-transparent
                   pointer-events-none"
      />

      {/* 완료시 추가 톤다운 */}
      {done && (
        <div
          aria-hidden
          className="absolute inset-0 bg-[#3E2C20]/30 pointer-events-none"
        />
      )}

      {/* 우상단 — 보상 / 완료 배지 */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {done && (
          <span
            className="px-2 py-0.5 rounded-full bg-white/95
                       text-[10px] font-extrabold text-nature-600"
          >
            ✓ 완료
          </span>
        )}
        <span
          className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm
                     text-[10px] font-extrabold text-white tabular-nums"
        >
          +{mission.reward}점
        </span>
      </div>

      {/* 좌상단 — 큰 아이콘 */}
      <div
        className="absolute top-3 left-3 text-[44px] leading-none drop-shadow-md"
        aria-hidden
      >
        {mission.icon}
      </div>

      {/* 하단 — 제목 + CTA */}
      <div className="absolute left-4 right-4 bottom-4">
        <h3
          className="text-white text-[19px] font-extrabold leading-tight
                     [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
        >
          {mission.title}
        </h3>
        <div className="mt-2 flex items-center justify-between text-white/95">
          <span className="text-[12px] font-extrabold">
            {done ? "다시 보기" : "체험 시작"}
          </span>
          <span className="text-[14px]" aria-hidden>
            →
          </span>
        </div>
      </div>
    </button>
  );
}
