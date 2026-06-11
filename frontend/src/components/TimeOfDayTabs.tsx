// 시간대 메인 탭 — 아침 / 점심(낮) / 저녁 3개 균등 분할
// 내부 키는 "낮"이지만 라벨은 "점심" 으로 표시 (시스템 표기 미변경)

import type { TimeOfDay } from "../data/missions";

const TIME_ORDER: TimeOfDay[] = ["아침", "낮", "저녁"];
const TIME_LABEL: Record<TimeOfDay, string> = {
  아침: "아침",
  낮: "점심",
  저녁: "저녁",
};

type Props = {
  active: TimeOfDay;
  counts: Record<TimeOfDay, number>;
  onSelect: (t: TimeOfDay) => void;
};

export default function TimeOfDayTabs({ active, counts, onSelect }: Props) {
  return (
    <div className="px-5 pt-2 pb-1.5 flex items-stretch gap-2">
      {TIME_ORDER.map((t) => {
        const isActive = t === active;
        const count = counts[t];
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            aria-pressed={isActive}
            className={`flex-1 rounded-full py-2 text-[13px] font-extrabold transition
                        ${
                          isActive
                            ? "bg-primary text-white shadow-soft"
                            : "bg-white text-ink-soft border border-cream-200"
                        }`}
          >
            {TIME_LABEL[t]}
            <span
              className={`ml-1.5 text-[11px] tabular-nums ${
                isActive ? "text-white/80" : "text-ink-mute"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
