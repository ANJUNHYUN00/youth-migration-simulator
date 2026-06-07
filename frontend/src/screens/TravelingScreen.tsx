// 이동 애니메이션 화면 — 두 캐릭터가 기차로 슉슉 → 도착
// 본 지역 → 목적지로 짧고 경쾌하게 (~2.3초) 기차씬을 보여주고
// "도착!" 라벨이 짧게 등장한 뒤 페이드 아웃 → 부모가 ArrivalScreen으로 전환.
//
// 비주얼 구성:
//   · 배경 산 3겹 + 풀밭 + 철로 — 멀수록 천천히 좌측으로 흘러 패럴랙스 이동감
//   · 기차 한 칸은 화면 중앙 고정 (배경이 움직여서 진행감)
//   · 두 캐릭터는 창문 안에서 통통 (clipPath로 창문 모양으로 잘림)
//   · 1.7초 시점에 "도착!" 라벨 등장 → 0.5초 페이드 → onComplete

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
const TRAVEL_MS = 1700;   // 기차 달리는 구간
const ARRIVAL_MS = 600;   // "도착!" 라벨 등장 + 유지
const FADE_MS = 500;      // 페이드아웃
const TOTAL_MS = TRAVEL_MS + ARRIVAL_MS + FADE_MS; // 2800

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
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 그라데이션 (하늘) */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-[#D8EFFF] via-[#FFE9D6] to-[#FBE6C2]"
        aria-hidden
      />

      {/* 상단 안내 — 떠나기(Departure) 헤더와 동일한 위치(pt-12 px-5) */}
      <header className="pt-12 px-5 text-center relative z-20">
        <p className="text-ink-soft text-[12px] font-medium">{caption}</p>
        <h1 className="mt-1 text-ink text-[20px] font-extrabold">
          {origin.region} <span className="text-primary">→</span> {destination.region}
        </h1>
      </header>

      {/* 본문 — 기차 씬 (배경 패럴랙스 + 기차 + 캐릭터) */}
      <section className="flex-1 relative overflow-hidden">
        <TrainScene />
      </section>

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
// TrainScene — 배경 패럴랙스 + 철로 + 기차 + 도착 라벨
// =====================================================================

function TrainScene() {
  return (
    <div className="absolute inset-0">
      <ScrollingHills />

      {/* 기차 — 화면 중앙 고정, 미세 진동 */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          animate={{ y: [0, -1.5, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
        >
          <Train />
        </motion.div>
      </div>

      <ArrivalLabel />
    </div>
  );
}

// =====================================================================
// 산·풀밭·철로 패럴랙스 — 멀수록 천천히, 가까울수록 빠르게 좌측으로 흐름
// 같은 SVG를 가로로 2개 잇고 -50%까지 이동 → 무한 루프
// =====================================================================

function ScrollingHills() {
  return (
    <>
      <ParallaxRow durationSec={9} topPct={32} heightClass="h-20">
        <FarHills />
      </ParallaxRow>
      <ParallaxRow durationSec={5.5} topPct={44} heightClass="h-20">
        <MidHills />
      </ParallaxRow>
      <ParallaxRow durationSec={3.2} topPct={58} heightClass="h-16">
        <NearHills />
      </ParallaxRow>

      {/* 화면 하단 풀밭 */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[28%]"
        style={{
          background: "linear-gradient(to bottom, #DCEDD0 0%, #C2DDB7 100%)",
        }}
        aria-hidden
      />

      <Track />
    </>
  );
}

function ParallaxRow({
  durationSec,
  topPct,
  heightClass,
  children,
}: {
  durationSec: number;
  topPct: number;
  heightClass: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute left-0 flex w-[200%] ${heightClass}`}
      style={{ top: `${topPct}%` }}
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: durationSec, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      <div className="w-1/2 shrink-0">{children}</div>
      <div className="w-1/2 shrink-0">{children}</div>
    </motion.div>
  );
}

function FarHills() {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full block">
      <path
        d="M0 80 L0 50 Q 60 30 120 40 T 240 35 T 360 45 L400 40 L400 80 Z"
        fill="#D5E1E8"
      />
    </svg>
  );
}

function MidHills() {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full block">
      <path
        d="M0 80 L0 55 Q 80 22 160 38 T 320 32 T 400 45 L400 80 Z"
        fill="#BDD5CB"
      />
    </svg>
  );
}

function NearHills() {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full block">
      <path
        d="M0 60 L0 38 Q 100 18 200 28 T 400 22 L400 60 Z"
        fill="#A8CFB5"
      />
    </svg>
  );
}

function Track() {
  return (
    <div
      className="absolute left-0 right-0 h-[5px] overflow-hidden"
      style={{ bottom: "20%" }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-y-0 w-[200%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #8B5E42 0 14px, transparent 14px 26px)",
        }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// =====================================================================
// Train — 기차 한 칸 (살구·크림 톤) + 창문 안 캐릭터(clipPath로 잘림)
// =====================================================================

function Train() {
  return (
    <svg
      viewBox="0 0 240 151"
      width="280"
      height="176"
      className="block drop-shadow-[0_8px_16px_rgba(62,44,32,0.18)]"
    >
      <defs>
        {/* 창문 클립 — 캐릭터가 창문 밖으로 삐져나오지 않도록 */}
        <clipPath id="train-window-left">
          <rect x="50" y="56" width="58" height="34" rx="6" />
        </clipPath>
        <clipPath id="train-window-right">
          <rect x="132" y="56" width="58" height="34" rx="6" />
        </clipPath>
      </defs>

      {/* 굴뚝 연기 — 3개 통통한 구름이 위로 사라짐 (시차로 연속) */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.circle
          key={i}
          cx={42}
          r={4}
          fill="#FFFFFF"
          animate={{ cy: [6, -14], opacity: [0, 0.85, 0], r: [3.5, 5, 6.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeOut" }}
        />
      ))}

      {/* 굴뚝 */}
      <rect x="34" y="10" width="14" height="22" rx="2" fill="#6B5446" />
      <rect x="32" y="10" width="18" height="4" rx="1" fill="#4A3326" />

      {/* 지붕 */}
      <path
        d="M 10 38 Q 12 26 22 26 L 218 26 Q 228 26 230 38 L 230 44 L 10 44 Z"
        fill="#C97D5C"
      />
      <rect x="10" y="44" width="220" height="6" fill="#A35F45" />

      {/* 본체 */}
      <rect x="14" y="50" width="212" height="48" rx="3" fill="#F4DEC2" />
      <rect x="14" y="92" width="212" height="6" fill="#E8C8A4" />

      {/* 창문 배경 (살구하늘색) — 캐릭터가 위에 덮기 전 */}
      <rect x="50" y="56" width="58" height="34" rx="6" fill="#C9E1EF" />
      <rect x="132" y="56" width="58" height="34" rx="6" fill="#C9E1EF" />

      {/* 창문 안 캐릭터 — 클립 + 통통 (transform 으로 움직임) */}
      <g clipPath="url(#train-window-left)">
        <motion.g
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <image
            href="/character1/clay-jieum-solo.png"
            x={46}
            y={26}
            width={66}
            height={84}
            preserveAspectRatio="xMidYMid meet"
          />
        </motion.g>
      </g>
      <g clipPath="url(#train-window-right)">
        <motion.g
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 0.78, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        >
          <image
            href="/character1/clay-baram-solo.png"
            x={134}
            y={30}
            width={56}
            height={70}
            preserveAspectRatio="xMidYMid meet"
          />
        </motion.g>
      </g>

      {/* 창문 테두리 (캐릭터 위) */}
      <rect
        x="50"
        y="56"
        width="58"
        height="34"
        rx="6"
        fill="none"
        stroke="#8B5E42"
        strokeWidth="1.6"
      />
      <rect
        x="132"
        y="56"
        width="58"
        height="34"
        rx="6"
        fill="none"
        stroke="#8B5E42"
        strokeWidth="1.6"
      />

      {/* 헤드라이트 (오른쪽 — 진행 방향) */}
      <circle cx="222" cy="74" r="6" fill="#FFE9A8" opacity="0.35" />
      <circle cx="222" cy="74" r="3.5" fill="#FFE9A8" />

      {/* 차체 하부 */}
      <rect x="20" y="98" width="200" height="10" rx="2" fill="#8B5E42" />

      {/* 바퀴 4개 */}
      <Wheel cx={48} />
      <Wheel cx={100} />
      <Wheel cx={150} />
      <Wheel cx={200} />
    </svg>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={117} r={11} fill="#6B5446" />
      <circle cx={cx} cy={117} r={5} fill="#A35F45" />
      <circle cx={cx} cy={117} r={1.6} fill="#FFE9D6" />
    </g>
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
