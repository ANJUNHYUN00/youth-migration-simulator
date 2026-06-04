// 온보딩 3단계 — 현재 거주 지역 선택 (2단계 픽커)
// Step A: 17개 광역시·도 그리드
// Step B: 선택된 시/도 안의 시/군/구 리스트 (스크롤). "{시도} 전체" 옵션 포함.
// 본 지역은 떠나기 이동 애니메이션의 출발지로 사용된다.

import { useMemo, useState } from "react";
import StepLayout from "./StepLayout";
import {
  KOREA_SIDOS,
  SIDO_BY_SHORT,
  formatRegionName,
  type SidoInfo,
} from "../../data/koreaRegions";

type Props = {
  step: number;
  total: number;
  initial: string;
  onBack: () => void;
  onNext: (regionName: string) => void;
};

// initial 저장값을 sido/sigungu 로 파싱
// - "경북 경산시" → ("경북", "경산시")
// - "서울" (레거시 짧은 포맷) → ("서울", "")  ← "{시도} 전체" 로 사전 선택해 재선택 부담 줄임
// - 빈 문자열 → 미선택
function parseInitial(initial: string): { sido: SidoInfo | null; sigungu: string | null } {
  if (!initial) return { sido: null, sigungu: null };
  const parts = initial.split(" ");
  const sido = SIDO_BY_SHORT[parts[0]] ?? null;
  if (!sido) return { sido: null, sigungu: null };
  if (parts.length > 1) return { sido, sigungu: parts.slice(1).join(" ") };
  // 시/군/구 정보 없는 레거시 저장값 — 단일시(세종)는 null, 그 외 시도는 "전체" 사전 선택
  return { sido, sigungu: sido.sigungu.length > 0 ? "" : null };
}

export default function HomeRegionScreen({
  step,
  total,
  initial,
  onBack,
  onNext,
}: Props) {
  const initialParsed = useMemo(() => parseInitial(initial), [initial]);
  const [sido, setSido] = useState<SidoInfo | null>(initialParsed.sido);
  const [sigungu, setSigungu] = useState<string | null>(initialParsed.sigungu);

  // 다음 단계 진행 가능 여부 — 시도가 선택돼야 하고,
  // 시/군/구가 있는 시도면 시/군/구 선택 OR "{시도} 전체" 명시적 선택 필요
  const ready = !!sido && (sido.sigungu.length === 0 || sigungu !== null);

  const handleCta = () => {
    if (!sido) return;
    onNext(formatRegionName(sido.short, sigungu));
  };

  // 시도 다시 고르기 — 하위 선택도 리셋
  const handlePickSido = (next: SidoInfo) => {
    setSido(next);
    setSigungu(null);
  };

  return (
    <StepLayout
      step={step}
      total={total}
      onBack={() => {
        // 시/군/구 단계에서 뒤로 → 시/도 단계로. 그 외엔 외부 onBack.
        if (sido && sido.sigungu.length > 0) {
          setSido(null);
          setSigungu(null);
          return;
        }
        onBack();
      }}
      ctaDisabled={!ready}
      onCta={handleCta}
    >
      <h1 className="text-ink text-[22px] font-extrabold leading-snug">
        지금 살고 있는 지역을<br />알려주세요
      </h1>
      <p className="mt-2 text-ink-soft text-[13px] leading-relaxed">
        {sido
          ? `${sido.full} 안에서 시/군/구를 골라주세요`
          : "이주 시뮬레이션은 이 지역을 기준으로 비교돼요."}
      </p>

      {/* Step A — 시/도 텍스트 리스트 (스크롤). 이모지·아이콘 없이 글자만 */}
      {!sido && (
        <ul className="mt-5 max-h-[60vh] overflow-y-auto rounded-2xl border border-cream-200 bg-white divide-y divide-cream-100">
          {KOREA_SIDOS.map((s) => (
            <li key={s.short}>
              <button
                type="button"
                onClick={() => handlePickSido(s)}
                className="w-full text-left px-4 py-3.5 text-ink text-[14.5px] font-semibold
                           flex items-center justify-between active:bg-cream-50 transition"
              >
                <span>{s.full}</span>
                <span className="text-ink-mute text-[13px]" aria-hidden>›</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Step B — 시/군/구 리스트 */}
      {sido && (
        <div className="mt-4">
          {/* 선택된 시/도 칩 + 바꾸기 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-nature-50 border border-nature-200 text-nature-600
                             text-[12.5px] font-extrabold">
              <span aria-hidden>{sido.emoji}</span>
              {sido.full}
            </span>
            <button
              type="button"
              onClick={() => {
                setSido(null);
                setSigungu(null);
              }}
              className="ml-auto text-ink-soft text-[11.5px] font-bold underline-offset-2 underline"
            >
              시/도 다시 고르기
            </button>
          </div>

          {/* 단일시(세종) — 시군구 단계 자동 통과: "확인" CTA 만 보임 */}
          {sido.sigungu.length === 0 ? (
            <div className="rounded-2xl border border-cream-200 bg-cream-50 px-4 py-5 text-center">
              <p className="text-ink text-[14px] font-extrabold">
                {sido.full}로 진행해요
              </p>
              <p className="mt-1 text-ink-soft text-[12px]">
                이 지역은 시/군/구를 따로 고를 필요가 없어요.
              </p>
            </div>
          ) : (
            <ul className="max-h-[44vh] overflow-y-auto rounded-2xl border border-cream-200 bg-white divide-y divide-cream-100">
              {/* 시/도 전체 옵션 */}
              <li>
                <button
                  type="button"
                  onClick={() => setSigungu("")}
                  className={`w-full text-left px-4 py-3 text-[13.5px] font-bold flex items-center justify-between
                    ${
                      sigungu === ""
                        ? "bg-nature-50 text-nature-600"
                        : "text-ink-soft"
                    }`}
                >
                  <span>{sido.full} 전체</span>
                  {sigungu === "" && <span aria-hidden>✓</span>}
                </button>
              </li>
              {sido.sigungu.map((sg) => {
                const isPicked = sigungu === sg;
                return (
                  <li key={sg}>
                    <button
                      type="button"
                      onClick={() => setSigungu(sg)}
                      className={`w-full text-left px-4 py-3 text-[14px] flex items-center justify-between
                        ${
                          isPicked
                            ? "bg-nature-50 text-nature-600 font-extrabold"
                            : "text-ink font-semibold"
                        }`}
                    >
                      <span>{sg}</span>
                      {isPicked && <span aria-hidden>✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </StepLayout>
  );
}
