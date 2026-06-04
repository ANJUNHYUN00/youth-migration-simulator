// 레지던스 마커 — 집 모양 아이콘 + 지역명 칩
// isTop: 가장 추천(최고점)일 때 골드 톤 + ⭐ 뱃지
// isActive: 사용자가 선택한 마커

type Props = {
  xPct: number;
  yPct: number;
  region: string;
  isActive: boolean;
  isTop?: boolean;
  onClick: () => void;
};

export default function ResidenceMarker({
  xPct,
  yPct,
  region,
  isActive,
  isTop = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`${region} 레지던스 마커${isTop ? " (가장 추천)" : ""}`}
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-full
                 focus:outline-none"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        zIndex: isTop ? 30 : isActive ? 20 : 10,
      }}
    >
      {/* 최상단 — 가장 추천 뱃지 */}
      {isTop && (
        <span
          className="mb-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold
                     leading-none bg-[#F0B400] text-white shadow-soft
                     whitespace-nowrap flex items-center gap-1"
        >
          <span aria-hidden>⭐</span>가장 추천
        </span>
      )}

      {/* 지역명 칩 */}
      <span
        className={`mb-1.5 px-2.5 py-1 rounded-full text-[13px] font-extrabold leading-none
          transition shadow-soft
          ${
            isActive
              ? "bg-primary text-white"
              : isTop
              ? "bg-[#FFF6D9] text-[#8B6A00] border border-[#F0B400]"
              : "bg-white text-ink border border-cream-200"
          }`}
      >
        {region}
      </span>

      {/* 집 모양 마커 + 핀 */}
      <span
        className={`relative inline-flex items-center justify-center
          w-12 h-12 rounded-full shadow-soft transition
          ${
            isActive
              ? "bg-primary scale-110"
              : isTop
              ? "bg-[#FFE074] ring-2 ring-[#F0B400] scale-110"
              : "bg-white"
          }`}
      >
        <HouseIcon active={isActive} top={isTop} />
        {/* 핀 끝 (작은 삼각형) */}
        <span
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2
            w-3 h-3 rotate-45
            ${
              isActive
                ? "bg-primary"
                : isTop
                ? "bg-[#FFE074]"
                : "bg-white"
            }`}
          aria-hidden
        />
      </span>
    </button>
  );
}

// 집 아이콘 — 마커 상태에 따라 컬러 분기
function HouseIcon({ active, top }: { active: boolean; top: boolean }) {
  const stroke = active ? "#FFFFFF" : top ? "#8B6A00" : "#FF7043";
  const fill = active ? "#FF7043" : top ? "#FFFFFF" : "#FFE0D3";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={fill}
      />
    </svg>
  );
}
