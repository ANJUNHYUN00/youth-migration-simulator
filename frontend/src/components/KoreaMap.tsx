// 한반도 파스텔 SVG 지도 — 떠나기 화면 배경
// 정밀한 지도가 아닌 디자인 톤(파스텔/아트지도)에 맞춘 스타일라이즈드 일러스트
// 마커는 자식으로 받아 상대 좌표(%)로 절대 배치된다.

import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
};

export default function KoreaMap({ children, className }: Props) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* 한반도 일러스트 */}
      <svg
        viewBox="0 0 240 440"
        className="w-full h-auto"
        aria-label="한반도 지도"
        role="img"
      >
        <defs>
          {/* 본토 그라데이션 — 위쪽 옅은 초록, 아래쪽 더 진한 초록 */}
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8EEDA" />
            <stop offset="100%" stopColor="#A8D5A8" />
          </linearGradient>
          {/* 부드러운 외곽 그림자 */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="off" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.18" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 바다 배경(투명) — 실제 색은 화면쪽에서 깔린다 */}

        {/* 본토 — 스타일라이즈드 한반도 형태 */}
        <path
          d="M 125 18
             C 152 14, 178 26, 188 50
             C 196 72, 175 90, 178 112
             C 182 132, 168 142, 168 158
             C 168 175, 152 182, 154 200
             C 156 218, 170 224, 165 245
             C 158 265, 178 278, 174 300
             C 168 322, 188 332, 184 358
             C 178 388, 152 402, 124 400
             C 100 398, 80 384, 74 360
             C 68 336, 88 320, 86 298
             C 84 274, 100 262, 94 240
             C 88 220, 106 208, 102 188
             C 98 168, 82 162, 88 138
             C 94 116, 78 108, 82 86
             C 86 64, 100 50, 108 32
             C 112 22, 117 18, 125 18 Z"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
          filter="url(#softShadow)"
        />

        {/* 제주도 */}
        <ellipse
          cx="118"
          cy="420"
          rx="16"
          ry="9"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
        />

        {/* 산맥/지형 디테일 — 점선 라인 (장식) */}
        <path
          d="M 130 70 Q 150 110 145 170 Q 130 230 140 290 Q 145 340 135 380"
          stroke="#7BB57F"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.6"
          fill="none"
        />

        {/* 작은 구름/장식 도트 — 바다 느낌의 점 */}
        <g opacity="0.5">
          <circle cx="40" cy="80" r="2" fill="#B1DCB5" />
          <circle cx="210" cy="140" r="2" fill="#B1DCB5" />
          <circle cx="30" cy="280" r="2" fill="#B1DCB5" />
          <circle cx="215" cy="330" r="2" fill="#B1DCB5" />
          <circle cx="200" cy="400" r="2" fill="#B1DCB5" />
        </g>
      </svg>

      {/* 마커 레이어 — 부모 div를 기준으로 절대 배치 */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
