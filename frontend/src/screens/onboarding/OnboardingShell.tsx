// 온보딩 셸 — 스플래시 → 본 지역 선택 → 진단 → 결과 의 4단계 흐름을 관리한다
// 완료 시 부모(App)에 결과(본 지역 + 라이프스타일 유형) 전달.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "./SplashScreen";
import RegionSelectScreen from "./RegionSelectScreen";
import QuizScreen from "./QuizScreen";
import ResultScreen from "./ResultScreen";
import { scoreQuiz } from "../../data/quiz";
import type { HomeRegion } from "../../data/regions";
import type { LifeStyleType } from "../../data/residences";

type Step = "splash" | "region" | "quiz" | "result";

export type OnboardingResult = {
  homeRegion: HomeRegion;
  lifestyle: LifeStyleType;
};

type Props = {
  onComplete: (result: OnboardingResult) => void;
};

export default function OnboardingShell({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("splash");
  const [homeRegion, setHomeRegion] = useState<HomeRegion | null>(null);
  const [lifestyle, setLifestyle] = useState<LifeStyleType | null>(null);

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      {/* 단계별 화면 — 좌우 슬라이드 전환 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28 }}
        >
          {step === "splash" && (
            <SplashScreen onDone={() => setStep("region")} />
          )}

          {step === "region" && (
            <RegionSelectScreen
              onNext={(r) => {
                setHomeRegion(r);
                setStep("quiz");
              }}
            />
          )}

          {step === "quiz" && (
            <QuizScreen
              onBack={() => setStep("region")}
              onComplete={(answers) => {
                const type = scoreQuiz(answers);
                setLifestyle(type);
                setStep("result");
              }}
            />
          )}

          {step === "result" && lifestyle && homeRegion && (
            <ResultScreen
              type={lifestyle}
              onStart={() => onComplete({ homeRegion, lifestyle })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
