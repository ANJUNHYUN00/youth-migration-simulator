// 카테고리 sticky 탭
// - 클릭 → 해당 섹션으로 부드럽게 스크롤
// - 활성 탭은 자동으로 가로 가운데 정렬

import { useEffect, useRef } from "react";
import {
  MISSION_GROUP_ORDER,
  missionGroupMeta,
  type MissionGroup,
} from "../data/missionCategories";

type Props = {
  active: MissionGroup;
  counts: Record<MissionGroup, number>;
  onSelect: (group: MissionGroup) => void;
};

export default function CategoryTabs({ active, counts, onSelect }: Props) {
  const tabRefs = useRef<Record<MissionGroup, HTMLButtonElement | null>>({
    roadview: null,
    real: null,
    people: null,
    rest: null,
  });

  // 활성 탭이 화면 안에 들어오도록 가로 스크롤 자동 정렬
  useEffect(() => {
    const tab = tabRefs.current[active];
    if (!tab) return;
    tab.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  return (
    <div
      className="sticky top-0 z-20 bg-cream/95 backdrop-blur
                 px-5 py-2.5 border-b border-cream-200
                 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex gap-2 w-max">
        {MISSION_GROUP_ORDER.map((g) => {
          const meta = missionGroupMeta[g];
          const isActive = g === active;
          return (
            <button
              key={g}
              ref={(el) => {
                tabRefs.current[g] = el;
              }}
              type="button"
              onClick={() => onSelect(g)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full
                          text-[12px] font-extrabold transition
                          ${
                            isActive
                              ? "bg-ink text-white shadow-soft"
                              : "bg-white text-ink-soft border border-cream-200"
                          }`}
            >
              {meta.title}
              <span
                className={`ml-1.5 text-[11px] tabular-nums ${
                  isActive ? "text-white/80" : "text-ink-mute"
                }`}
              >
                {counts[g]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
