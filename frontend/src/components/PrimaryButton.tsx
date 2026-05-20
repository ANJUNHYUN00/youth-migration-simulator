// 메인 CTA 버튼 — 주황 솔리드, 둥근 모서리, 누를 때 살짝 눌림
// PRD: "하단 CTA 버튼: '떠나기 🎒'"

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function PrimaryButton({ children, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-primary hover:bg-primary-600 active:scale-[0.98]
                  transition-transform duration-100
                  text-white text-[17px] font-bold
                  py-4 rounded-2xl shadow-soft
                  ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
