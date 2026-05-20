// 온보딩 스플래시 — 디자인 1.1
// "바람을 짓다." 메인 + "조용히 영글어가는 당신의 세계" 서브
// 동심원 그래픽 + 파스텔 오브제 + 2초 후 자동 진행

import { useEffect } from "react";
import { motion } from "framer-motion";

type Props = {
  onDone: () => void;
};

const HOLD_MS = 2200; // 사용자가 카피를 충분히 읽을 시간

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden
                    flex flex-col items-center justify-center
                    bg-gradient-to-b from-cream via-[#F5E8D4] to-nature-50">
      {/* 동심원 — 우주/궤도 느낌. 천천히 회전 */}
      <motion.div
        className="absolute"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <svg width="360" height="360" viewBox="0 0 360 360">
          <defs>
            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#FF7043" stopOpacity="0" />
              <stop offset="100%" stopColor="#FF7043" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          {/* 가장 안쪽 원 */}
          <circle cx="180" cy="180" r="48" fill="#FFE0D3" />
          {/* 중간 점선 궤도들 */}
          <circle cx="180" cy="180" r="78" fill="none" stroke="#E8B89A" strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="180" cy="180" r="112" fill="none" stroke="#C5A98F" strokeWidth="1" strokeDasharray="1 5" opacity="0.7" />
          <circle cx="180" cy="180" r="148" fill="none" stroke="#9FB89E" strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />
          {/* 외곽 글로우 */}
          <circle cx="180" cy="180" r="170" fill="url(#ringGlow)" />
          {/* 궤도 위 작은 오브제 */}
          <circle cx="258" cy="180" r="4" fill="#FF7043" />
          <circle cx="180" cy="68" r="3" fill="#66BB6A" />
          <circle cx="60" cy="200" r="2.5" fill="#FFB089" />
        </svg>
      </motion.div>

      {/* 카피 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative text-center px-6"
      >
        <h1 className="text-ink text-[36px] font-extrabold tracking-tight">
          바람을 짓다<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-ink-soft text-[14px] leading-relaxed">
          조용히 영글어가는<br />당신의 세계
        </p>
      </motion.div>

      {/* 하단 로딩 점 3개 */}
      <div className="absolute bottom-16 flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
