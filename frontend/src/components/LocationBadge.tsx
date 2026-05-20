// 현재 본 지역 배지 — PRD: "하단: 현재 본 지역 표시 (ex. 📍 서울)"

type Props = {
  region: string;
};

export default function LocationBadge({ region }: Props) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                 bg-white/80 backdrop-blur border border-cream-200
                 text-ink-soft text-[13px] font-medium shadow-soft"
    >
      <span aria-hidden>📍</span>
      <span>
        본 지역 <span className="text-ink font-bold">{region}</span>
      </span>
    </div>
  );
}
