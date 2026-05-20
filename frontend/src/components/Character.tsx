// 봇짐 멘 캐릭터 — 홈 화면 중앙에 배치되는 마스코트
// PRD: "중앙: 봇짐 멘 캐릭터 (SVG)"
// 단순한 파스텔톤 일러스트(머리/몸/봇짐)로 구성. 추후 일러스트 자산으로 교체 가능.

type Props = {
  className?: string;
};

export default function Character({ className }: Props) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      aria-label="봇짐을 멘 캐릭터"
      role="img"
    >
      {/* 그림자 */}
      <ellipse cx="100" cy="205" rx="56" ry="8" fill="#3E2C20" opacity="0.08" />

      {/* 봇짐 (어깨 뒤에 매달린 보따리) — 캐릭터보다 먼저 그려서 뒤로 보내기 */}
      <g>
        {/* 봇짐 끈 */}
        <path
          d="M70 95 C50 110 38 130 50 158"
          stroke="#8E5A3E"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* 보따리 본체 */}
        <ellipse cx="50" cy="158" rx="26" ry="22" fill="#F4A261" />
        <ellipse cx="50" cy="158" rx="26" ry="22" fill="url(#bagShade)" />
        {/* 묶음 매듭 */}
        <path
          d="M40 140 Q50 132 60 140 Q55 144 50 144 Q45 144 40 140Z"
          fill="#E76F51"
        />
        {/* 봇짐 패턴(체크) */}
        <path
          d="M30 150 L70 150 M30 162 L70 162 M44 138 L44 178 M56 138 L56 178"
          stroke="#E76F51"
          strokeWidth="1.2"
          opacity="0.5"
        />
      </g>

      {/* 몸통 (둥근 카프탄 느낌) */}
      <path
        d="M70 110 Q70 95 100 95 Q130 95 130 110 L138 180 Q120 188 100 188 Q80 188 62 180 Z"
        fill="#A8D5A8"
      />
      {/* 몸통 하이라이트 */}
      <path
        d="M75 110 Q90 102 100 110 L100 175 Q88 175 80 170 Z"
        fill="#C3E2C3"
        opacity="0.6"
      />

      {/* 팔(왼쪽) */}
      <path
        d="M70 115 Q60 130 64 150"
        stroke="#F2C9A1"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      {/* 팔(오른쪽 — 봇짐 끈 잡은 손) */}
      <path
        d="M130 115 Q138 128 130 142"
        stroke="#F2C9A1"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* 다리 */}
      <rect x="86" y="180" width="10" height="22" rx="5" fill="#5A4630" />
      <rect x="104" y="180" width="10" height="22" rx="5" fill="#5A4630" />

      {/* 머리 */}
      <circle cx="100" cy="70" r="32" fill="#F8D9B8" />
      {/* 머리카락 */}
      <path
        d="M70 64 Q74 38 100 36 Q128 36 132 64 Q120 56 100 58 Q82 58 70 64Z"
        fill="#3E2C20"
      />
      {/* 볼터치 */}
      <circle cx="82" cy="78" r="4" fill="#F4A29C" opacity="0.7" />
      <circle cx="118" cy="78" r="4" fill="#F4A29C" opacity="0.7" />
      {/* 눈 */}
      <circle cx="89" cy="72" r="2.4" fill="#3E2C20" />
      <circle cx="111" cy="72" r="2.4" fill="#3E2C20" />
      {/* 입 */}
      <path
        d="M94 84 Q100 90 106 84"
        stroke="#3E2C20"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient id="bagShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#3E2C20" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}
