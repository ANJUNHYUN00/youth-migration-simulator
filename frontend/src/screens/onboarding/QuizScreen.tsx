// 라이프스타일 진단 — PRD 1.온보딩 4지선다
// 한 화면에 한 문항. 답을 선택하면 약간의 딜레이 후 다음 문항으로 자동 진행.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions } from "../../data/quiz";
import type { LifeStyleType } from "../../data/residences";

type Answer = { questionId: string; type: LifeStyleType };

type Props = {
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
};

export default function QuizScreen({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const total = quizQuestions.length;
  const current = quizQuestions[step];

  // 답 선택 → 짧은 시각 피드백 후 다음 문항/완료
  const handlePick = (optionIdx: number) => {
    if (pickedIdx !== null) return; // 중복 클릭 방지

    setPickedIdx(optionIdx);
    const picked = current.options[optionIdx];
    const nextAnswers = [
      ...answers,
      { questionId: current.id, type: picked.type },
    ];

    setTimeout(() => {
      if (step + 1 >= total) {
        onComplete(nextAnswers);
      } else {
        setAnswers(nextAnswers);
        setStep(step + 1);
        setPickedIdx(null);
      }
    }, 420);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-cream">
      {/* 헤더 — 뒤로가기 + 진행 인디케이터 */}
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (step === 0) onBack();
            else {
              setStep(step - 1);
              setAnswers(answers.slice(0, -1));
              setPickedIdx(null);
            }
          }}
          aria-label="이전"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 진행 바 */}
        <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / total) * 100}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <span className="text-ink-mute text-[12px] font-bold tabular-nums">
          {step + 1} / {total}
        </span>
      </header>

      {/* 문항 + 옵션 */}
      <section className="flex-1 px-6 mt-8 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <p className="text-ink-soft text-[12px] font-medium">
              Q{step + 1}.
            </p>
            <h2 className="mt-1 text-ink text-[20px] font-extrabold leading-snug">
              {current.prompt}
            </h2>

            <ul className="mt-6 space-y-2.5">
              {current.options.map((opt, i) => {
                const isPicked = pickedIdx === i;
                const isFaded = pickedIdx !== null && !isPicked;
                return (
                  <li key={opt.label}>
                    <motion.button
                      type="button"
                      onClick={() => handlePick(i)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl
                        border flex items-center gap-3 transition
                        ${
                          isPicked
                            ? "bg-primary text-white border-primary shadow-soft"
                            : "bg-white border-cream-200 text-ink"
                        }
                        ${isFaded ? "opacity-40" : ""}`}
                    >
                      <span className="text-xl shrink-0" aria-hidden>
                        {opt.emoji}
                      </span>
                      <span className="text-[14px] font-semibold leading-snug">
                        {opt.label}
                      </span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="px-6 pb-8 pt-2 text-center text-ink-mute text-[11px]">
        직관적으로 끌리는 쪽을 골라주세요
      </div>
    </div>
  );
}
