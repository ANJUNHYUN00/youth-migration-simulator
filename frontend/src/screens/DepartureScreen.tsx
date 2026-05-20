// 탭1 떠나기 화면 — PRD 2.떠나기
// 상단 텍스트 + 한반도 지도 위 추천 마커 + 마커 선택 시 바텀시트
// "여기로 떠나기"는 다음 단계(이동 애니메이션 → 지역 도착)로 연결 예정

import { useState } from "react";
import KoreaMap from "../components/KoreaMap";
import ResidenceMarker from "../components/ResidenceMarker";
import ResidenceSheet from "../components/ResidenceSheet";
import { residences, type Residence } from "../data/residences";

type Props = {
  homeRegion: string;
  onBack: () => void;
  onDepart: (residence: Residence) => void;
};

export default function DepartureScreen({ homeRegion, onBack, onDepart }: Props) {
  // 현재 선택된 레지던스 — null이면 바텀시트 닫힘
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = residences.find((r) => r.id === selectedId) ?? null;

  return (
    // BottomNav(고정 ~80px)에 가려지지 않도록 화면 높이를 nav만큼 줄임
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col">
      {/* 상단 그라데이션 배경 (바다 느낌) */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-[#EAF4FB] via-cream to-cream"
        aria-hidden
      />

      {/* 헤더 — 뒤로가기 + 타이틀 */}
      <header className="pt-12 px-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
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
        <div className="flex-1">
          <p className="text-ink-soft text-[12px] font-medium">📍 본 지역 {homeRegion}</p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            어디로 가볼까?
          </h1>
        </div>
      </header>

      {/* 안내 */}
      <p className="mt-2 px-5 text-ink-soft text-[13px] leading-relaxed">
        취향에 맞춰 추천된 레지던스예요. 마커를 눌러 자세히 살펴보세요.
      </p>

      {/* 지도 영역 */}
      <section className="flex-1 px-3 mt-3 mb-4 flex items-start justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {residences.map((r) => (
              <ResidenceMarker
                key={r.id}
                xPct={r.xPct}
                yPct={r.yPct}
                region={r.region}
                isActive={selectedId === r.id}
                onClick={() => setSelectedId(r.id)}
              />
            ))}
          </KoreaMap>
        </div>
      </section>

      {/* 바텀시트 — 마커 선택 시 표시 */}
      <ResidenceSheet
        residence={selected}
        onClose={() => setSelectedId(null)}
        onDepart={(r) => {
          setSelectedId(null);
          onDepart(r);
        }}
      />
    </div>
  );
}
