// 이동 애니메이션 화면 — 떠나기 → 도착 사이 짧은 트랜지션 (~4.8초)
// 본 지역 → 목적지로 버스 이미지 두 장 크로스페이드 + "도착!" 라벨 → 페이드아웃 → 부모가 ArrivalScreen.
//
// 구성:
//   · 0 ~ TRAVEL_MS: bus_riding.jpg (이동 중) — 살짝 확대로 진행감
//   · TRAVEL_MS 시점에 bus_arriving.jpg 로 크로스페이드
//   · TRAVEL_MS 직후 "도착!" 라벨 등장
//   · TRAVEL_MS + ARRIVAL_MS 후 검은 페이드아웃 → onComplete
//
// 이미지는 화면 전체를 꽉 채우고 헤더는 이미지 위에 어둠 그라데이션 + 흰 글씨로 떠 있음.

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { RegionPos } from "../data/regions";

type Endpoint = RegionPos & { region: string };

type Props = {
  origin: Endpoint;
  destination: Endpoint;
  // 헤더 안내문(상단 작은 글씨). 역방향 시 "집으로 돌아가는 중" 등으로 사용
  caption?: string;
  onComplete: () => void;
};

// 애니메이션 타이밍 (ms) — 한 곳에서 관리
const TRAVEL_MS = 3000;    // 버스 달리는 구간 (이전 1700)
const ARRIVAL_MS = 1100;   // "도착!" 라벨 등장 + 유지 (이전 600)
const FADE_MS = 700;       // 페이드아웃 (이전 500)
const TOTAL_MS = TRAVEL_MS + ARRIVAL_MS + FADE_MS; // 4800

const CROSSFADE_MS = 600;  // bus_riding → bus_arriving 전환 시간

export default function TravelingScreen({
  origin,
  destination,
  caption = "바람을 따라 이동 중",
  onComplete,
}: Props) {
  // 애니메이션 종료 후 부모에게 알림 → 도착 화면으로 전환
  useEffect(() => {
    const t = setTimeout(onComplete, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="relative w-full overflow-hidden bg-ink"
      style={{ height: "calc(100dvh - 6rem)" }}
    >
      {/* 1단계: 이동 중 — 전체 화면 꽉 채움. 살짝 확대로 진행감 */}
      <motion.img
        src="/roadview/bus_riding.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{
          duration: TRAVEL_MS / 1000,
          ease: "easeOut",
        }}
      />

      {/* 2단계: 도착 직전 — TRAVEL_MS 시점에 위로 페이드 인 */}
      <motion.img
        src="/roadview/bus_arriving.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: TRAVEL_MS / 1000,
          duration: CROSSFADE_MS / 1000,
          ease: "easeInOut",
        }}
      />

      {/* 상단 어둠 그라데이션 — 흰 글씨 가독성 확보 */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-32
                   bg-gradient-to-b from-black/55 via-black/25 to-transparent z-10"
      />

      {/* 헤더 — 이미지 위에 떠 있음 */}
      <header className="absolute top-0 left-0 right-0 pt-12 px-5 text-center z-20">
        <p className="text-white/90 text-[12px] font-medium drop-shadow">
          {caption}
        </p>
        <h1 className="mt-1 text-white text-[20px] font-extrabold drop-shadow">
          {origin.region} <span className="text-primary-200">→</span>{" "}
          {destination.region}
        </h1>
      </header>

      <ArrivalLabel />

      {/* 페이드 아웃 오버레이 — TRAVEL_MS + ARRIVAL_MS 직후 화면 어두워짐 */}
      <motion.div
        className="absolute inset-0 bg-ink pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: (TRAVEL_MS + ARRIVAL_MS) / 1000,
          duration: FADE_MS / 1000,
          ease: "easeIn",
        }}
        aria-hidden
      />
    </div>
  );
}

// =====================================================================
// ArrivalLabel — TRAVEL_MS 후 "도착!" 살짝 등장
// =====================================================================

function ArrivalLabel() {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      style={{ top: "18%" }}
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: [0, 1, 1], scale: [0.6, 1.12, 1], y: [12, 0, 0] }}
      transition={{
        duration: (ARRIVAL_MS + 200) / 1000,
        delay: TRAVEL_MS / 1000,
        times: [0, 0.55, 1],
        ease: "easeOut",
      }}
    >
      <div className="px-4 py-1.5 rounded-2xl bg-white shadow-soft border border-cream-200">
        <span className="text-primary text-[22px] font-extrabold leading-none">
          도착!
        </span>
      </div>
    </motion.div>
  );
}
