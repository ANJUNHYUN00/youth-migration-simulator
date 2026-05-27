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
            북부는 넓게, 서울 부근(허리)에서 잘록, 남부에서 다시 넓어지며
            남서·남동 끝이 살짝 돌출 → 한반도 실루엣 */}
        <path
          d="M 80 40
             C 104 22, 152 20, 180 34
             C 200 44, 206 66, 198 90
             C 192 116, 180 134, 178 156
             C 176 168, 172 170, 172 178
             C 173 200, 188 226, 188 258
             C 188 290, 184 326, 172 352
             C 164 370, 154 382, 142 386
             C 130 390, 120 384, 110 388
             C 98 392, 86 390, 78 380
             C 66 368, 62 350, 68 332
             C 74 308, 70 286, 72 262
             C 74 234, 66 210, 72 188
             C 76 178, 78 174, 78 166
             C 78 150, 70 138, 74 116
             C 77 92, 72 60, 80 40 Z"
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

        {/* 산맥/지형 디테일 — 동쪽 능선(태백산맥 느낌)을 따라가는 점선 (장식) */}
        <path
          d="M 130 70 Q 160 130 165 195 Q 168 260 156 320 Q 148 360 152 384"
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
