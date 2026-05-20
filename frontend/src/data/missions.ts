// 잠시섬 미션 — PRD 2.미션 화면의 일반 미션 8종
// 현재는 모든 지역 공통 정적 데이터. 추후 지역별 메타데이터/완료 상태는 별도 store로 분리 예정.

export type MissionCategory = "생활체험" | "관계형성" | "현실체크";

export type Mission = {
  id: string;
  title: string;
  category: MissionCategory;
  duration: string;        // 예상 소요 시간
  difficulty: 1 | 2 | 3;   // ★ 1~3
  icon: string;            // 카드 좌측 아이콘
  done: boolean;           // 완료 여부 (목 데이터에선 임의)
};

export const baseMissions: Mission[] = [
  {
    id: "market",
    title: "전통시장 물가 체험",
    category: "생활체험",
    duration: "30분",
    difficulty: 2,
    icon: "🛒",
    done: false,
  },
  {
    id: "cost",
    title: "생활비 시뮬레이션",
    category: "현실체크",
    duration: "15분",
    difficulty: 1,
    icon: "💰",
    done: false,
  },
  {
    id: "transit",
    title: "교통 접근성 확인",
    category: "현실체크",
    duration: "10분",
    difficulty: 1,
    icon: "🚌",
    done: true,
  },
  {
    id: "stats",
    title: "지역 통계 탐색",
    category: "현실체크",
    duration: "20분",
    difficulty: 2,
    icon: "📊",
    done: false,
  },
  {
    id: "neighbor",
    title: "이주자 만나기",
    category: "관계형성",
    duration: "1시간",
    difficulty: 3,
    icon: "🤝",
    done: false,
  },
  {
    id: "hospital",
    title: "병원 접근성 확인",
    category: "현실체크",
    duration: "20분",
    difficulty: 2,
    icon: "🏥",
    done: false,
  },
  {
    id: "routine",
    title: "하루 루틴 체험 기록",
    category: "생활체험",
    duration: "1일",
    difficulty: 2,
    icon: "📝",
    done: false,
  },
  {
    id: "story",
    title: "귀촌 사례 읽기",
    category: "생활체험",
    duration: "15분",
    difficulty: 1,
    icon: "📖",
    done: true,
  },
];
