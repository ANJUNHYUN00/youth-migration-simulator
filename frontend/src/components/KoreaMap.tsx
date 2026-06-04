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

        {/* 본토 — 스타일라이즈드 한반도 형태
            서울 부근(허리)에서 잘록, 들쭉날쭉한 서해안 + 매끈한 동해안,
            남서(진도)·남동(부산) 끝이 돌출 → 한반도 실루엣 */}
        <path
          d="M 74 62 C 82.5 53.3, 97.7 45.0, 115 40 C 132.3 35.0, 163.8 27.7, 178 32
             C 192.2 36.3, 198.0 52.0, 200 66 C 202.0 80.0, 194.3 102.0, 190 116
             C 185.7 130.0, 176.0 136.3, 174 150 C 172.0 163.7, 178.5 181.3, 178 198
             C 177.5 214.7, 173.2 232.2, 171 250 C 168.8 267.8, 166.8 288.7, 165 305
             C 163.2 321.3, 161.2 337.7, 160 348 C 158.8 358.3, 160.3 361.5, 158 367
             C 155.7 372.5, 151.7 376.8, 146 381 C 140.3 385.2, 131.2 392.2, 124 392
             C 116.8 391.8, 110.2 381.3, 103 380 C 95.8 378.7, 88.0 382.3, 81 384
             C 74.0 385.7, 63.5 396.0, 61 390 C 58.5 384.0, 66.0 360.0, 66 348
             C 66.0 336.0, 60.7 326.3, 61 318 C 61.3 309.7, 68.8 309.7, 68 298
             C 67.2 286.3, 53.7 263.3, 56 248 C 58.3 232.7, 80.3 217.3, 82 206
             C 83.7 194.7, 64.7 188.0, 66 180 C 67.3 172.0, 92.0 167.0, 90 158
             C 88.0 149.0, 58.3 137.0, 54 126 C 49.7 115.0, 60.7 102.7, 64 92
             C 67.3 81.3, 65.5 70.7, 74 62 Z"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
          filter="url(#softShadow)"
        />

        {/* 제주도 */}
        <ellipse
          cx="108"
          cy="422"
          rx="15"
          ry="8.5"
          fill="url(#land)"
          stroke="#7BB57F"
          strokeWidth="1.2"
        />

        {/* 산맥/지형 디테일 — 동쪽 능선(태백산맥 느낌)을 따라가는 점선 (장식) */}
        <path
          d="M 150 92 Q 162 160 158 240 Q 154 312 150 360"
          stroke="#7BB57F"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.6"
          fill="none"
        />

        {/* 작은 구름/장식 도트 — 바다 느낌의 점 */}
        <g opacity="0.5">
          <circle cx="38" cy="96" r="2" fill="#B1DCB5" />
          <circle cx="212" cy="150" r="2" fill="#B1DCB5" />
          <circle cx="32" cy="300" r="2" fill="#B1DCB5" />
          <circle cx="210" cy="350" r="2" fill="#B1DCB5" />
          <circle cx="138" cy="420" r="2" fill="#B1DCB5" />
        </g>
      </svg>

      {/* 마커 레이어 — 부모 div를 기준으로 절대 배치 */}
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
