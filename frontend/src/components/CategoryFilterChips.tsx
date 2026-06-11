// 시간대 탭 아래 보조 카테고리 필터 — "전체" + 4개 카테고리.
// 선택된 시간대 안에서의 카운트를 표시. 카운트 0인 칩은 disabled.

import {
  MISSION_GROUP_ORDER,
  missionGroupMeta,
  type MissionGroup,
} from "../data/missionCategories";

export type CategoryFilter = "all" | MissionGroup;

type Props = {
  active: CategoryFilter;
  counts: Record<MissionGroup, number>;
  total: number;
  onSelect: (c: CategoryFilter) => void;
};

export default function CategoryFilterChips({
  active,
  counts,
  total,
  onSelect,
}: Props) {
  return (
    <div className="px-5 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-1.5 w-max">
        <Chip
          label="전체"
          count={total}
          isActive={active === "all"}
          disabled={false}
          onClick={() => onSelect("all")}
        />
        {MISSION_GROUP_ORDER.map((g) => {
          const count = counts[g];
          const disabled = count === 0;
          return (
            <Chip
              key={g}
              label={missionGroupMeta[g].title}
              count={count}
              isActive={active === g}
              disabled={disabled}
              onClick={() => onSelect(g)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  label,
  count,
  isActive,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={`shrink-0 px-2.5 py-1 rounded-full text-[11.5px] font-bold transition
                  ${
                    disabled
                      ? "bg-cream-200/60 text-ink-mute/60 cursor-not-allowed"
                      : isActive
                      ? "bg-ink text-white"
                      : "bg-white text-ink-soft border border-cream-200"
                  }`}
    >
      {label}
      <span
        className={`ml-1 text-[10.5px] tabular-nums ${
          disabled
            ? ""
            : isActive
            ? "text-white/80"
            : "text-ink-mute"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
