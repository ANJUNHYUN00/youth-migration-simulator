// 본 지역 선택 — PRD 1.온보딩 / 디자인 1.2 응용
// 사용자가 "현재 사는 지역"을 카드 그리드에서 선택

import { useState } from "react";
import { motion } from "framer-motion";
import { HOME_REGIONS, type HomeRegion } from "../../data/regions";
import PrimaryButton from "../../components/PrimaryButton";

type Props = {
  onNext: (region: HomeRegion) => void;
};

export default function RegionSelectScreen({ onNext }: Props) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = HOME_REGIONS.find((r) => r.name === selectedName) ?? null;

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-cream">
      {/* 헤더 */}
      <header className="pt-12 px-6">
        <p className="text-ink-soft text-[12px] font-medium">청풍 시작하기</p>
        <h1 className="mt-1 text-ink text-[22px] font-extrabold leading-snug">
          지금 살고 있는 지역을<br />알려주세요
        </h1>
        <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
          이주 시뮬레이션은 이 지역을 기준으로 비교돼요.
        </p>
      </header>

      {/* 카드 그리드 */}
      <section className="px-6 mt-6 flex-1">
        <ul className="grid grid-cols-2 gap-3">
          {HOME_REGIONS.map((r) => {
            const isActive = selectedName === r.name;
            return (
              <li key={r.name}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedName(r.name)}
                  aria-pressed={isActive}
                  className={`w-full aspect-[5/4] rounded-2xl border p-3
                    flex flex-col items-start justify-between text-left transition
                    ${
                      isActive
                        ? "bg-nature-50 border-nature-400 shadow-soft"
                        : "bg-white border-cream-200"
                    }`}
                >
                  <span className="text-3xl" aria-hidden>
                    {r.emoji}
                  </span>
                  <div>
                    <p
                      className={`text-[16px] font-extrabold leading-tight
                        ${isActive ? "text-nature-600" : "text-ink"}`}
                    >
                      {r.name}
                    </p>
                    <p className="text-ink-mute text-[11px] mt-0.5">{r.blurb}</p>
                  </div>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-4">
        <PrimaryButton
          onClick={() => selected && onNext(selected)}
          className={selected ? "" : "opacity-40 pointer-events-none"}
        >
          다음
        </PrimaryButton>
      </footer>
    </div>
  );
}
