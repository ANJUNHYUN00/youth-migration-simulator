// 온보딩 — 환경 직접 선택 (4지선다, 메인 진단 결과의 부제)
// 사용자가 끌리는 풍경 1개 선택 → 자동 다음 단계

import { motion } from "framer-motion";
import StepLayout from "./StepLayout";
import { envChoices, type EnvChoiceOption } from "../../data/quiz";
import type { EnvType } from "../../data/lifestyle";

type Props = {
  step: number;
  total: number;
  initial?: EnvType;
  onBack: () => void;
  onNext: (env: EnvType) => void;
};

export default function EnvChoiceScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaDisabled={!initial}
      ctaLabel="다음"
      onCta={() => initial && onNext(initial)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        어떤 풍경에서<br />살아보고 싶어요?
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        지금 마음에 끌리는 한 곳을 골라주세요.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 flex-1">
        {envChoices.map((opt) => (
          <Card
            key={opt.value}
            option={opt}
            active={initial === opt.value}
            onClick={() => onNext(opt.value)}
          />
        ))}
      </div>
    </StepLayout>
  );
}

function Card({
  option,
  active,
  onClick,
}: {
  option: EnvChoiceOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-3xl border p-5 flex flex-col items-center justify-center
        text-center transition min-h-[140px]
        ${
          active
            ? "bg-nature-50 border-nature-400 shadow-soft"
            : "bg-white border-cream-200"
        }`}
    >
      <span className="text-4xl" aria-hidden>
        {option.emoji}
      </span>
      <p
        className={`mt-3 text-[16px] font-extrabold ${
          active ? "text-nature-600" : "text-ink"
        }`}
      >
        {option.label}
      </p>
      <p className="mt-1 text-ink-mute text-[11px] leading-tight">
        {option.hint}
      </p>
    </motion.button>
  );
}
