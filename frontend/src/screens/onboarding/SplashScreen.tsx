// 온보딩 스플래시 — 풀스크린 스타트 이미지
// character1/splash1.png 한 장으로 대체. 2.2초 후 자동 진행은 유지.

import { useEffect } from "react";

type Props = {
  onDone: () => void;
};

const HOLD_MS = 2200; // 사용자가 이미지를 충분히 볼 시간

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-cream">
      <img
        src="/character1/splash1.png"
        alt="청풍 시작 화면"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
