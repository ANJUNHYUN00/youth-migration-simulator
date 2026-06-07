// 온보딩 마지막 단계 — 닉네임 입력
// 결과 화면 직전에 위치해, 청풍에서 사용자를 부를 이름을 직접 정하게 한다.
// (기존: 이메일 @ 앞부분을 기본 닉네임으로 사용 → 어색함 개선)

import { useState } from "react";
import StepLayout from "./StepLayout";

type Props = {
  step: number;
  total: number;
  initial: string;
  onBack: () => void;
  onNext: (nickname: string) => void;
};

export default function NicknameScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const [name, setName] = useState(initial);
  const trimmed = name.trim();
  const valid = trimmed.length > 0;

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={onBack}
      ctaLabel="내 귀촌 유형보기 🍃"
      ctaDisabled={!valid}
      onCta={() => onNext(trimmed)}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        어떤 이름으로
        <br />
        바람을 지어볼까요?
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        닉네임을 자유롭게 적어주세요.
        <br />
        청풍에서 당신을 부르는 이름이 돼요.
      </p>

      <div className="mt-8">
        <label className="text-ink-soft text-[12px] font-bold" htmlFor="nickname">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          autoComplete="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) 느린바람"
          maxLength={20}
          className="mt-2 w-full px-4 py-3.5 rounded-2xl border border-cream-200
                     bg-white text-ink text-[15px] focus:outline-none
                     focus:border-primary placeholder:text-ink-mute"
        />
        <p className="mt-2 text-[11px] text-ink-mute text-right">
          {trimmed.length} / 20
        </p>
      </div>
    </StepLayout>
  );
}
