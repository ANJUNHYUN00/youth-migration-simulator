// 잠시섬 미션 — PRD 2.미션 화면의 8종 일반 미션 + 최종 미션
// 각 미션은 말해보카 스타일 다회 turn 대화로 진행되고, 마지막 turn 종료 시 축적 점수가 누적된다.
// 백엔드 연결 시 done/score 등 진행 상태는 서버로 이전 예정.

export type MissionCategory = "생활체험" | "관계형성" | "현실체크";

// 말해보카 스타일 대화 1 turn — NPC 말풍선 + 사용자 선택지
export type DialogueOption = {
  label: string;       // 사용자가 누를 버튼 텍스트
  next?: number;       // 다음 turn 인덱스 (undefined = 미션 종료)
};

export type DialogueTurn = {
  npc: string;
  options: DialogueOption[];
};

// 장소별 배경 일러스트 키 — MissionExecuteScreen에서 분기
export type BackgroundVariant =
  | "market"
  | "hospital"
  | "cafe"
  | "home"
  | "office"
  | "transit"
  | "library"
  | "neighbor";

export type Mission = {
  id: string;
  title: string;
  icon: string;
  category: MissionCategory;
  duration: string;       // 예상 소요 시간
  difficulty: 1 | 2 | 3;  // ★
  reward: number;         // 축적 점수
  background: BackgroundVariant;
  npc: { name: string; emoji: string };
  dialogues: DialogueTurn[];
};

export const baseMissions: Mission[] = [
  {
    id: "market",
    title: "전통시장 물가 체험",
    icon: "🛒",
    category: "생활체험",
    duration: "30분",
    difficulty: 2,
    reward: 30,
    background: "market",
    npc: { name: "반찬가게 사장님", emoji: "🧓" },
    dialogues: [
      {
        npc: "어서오세요! 오늘 채소가 정말 좋아요. 뭐 보러 오셨어요?",
        options: [
          { label: "가격 좀 볼게요", next: 1 },
          { label: "추천 좀 해주세요", next: 2 },
        ],
      },
      {
        npc: "오이 한 박스에 6,000원, 시금치 한 단에 1,500원이에요. 도시보다 훨씬 싸죠.",
        options: [{ label: "많이 싸네요!" }],
      },
      {
        npc: "오늘은 시금치가 잘 들었어요. 부추도 좋고. 한 단씩만 사도 며칠은 가요.",
        options: [{ label: "잘 보고 갈게요" }],
      },
    ],
  },
  {
    id: "cost",
    title: "생활비 시뮬레이션",
    icon: "💰",
    category: "현실체크",
    duration: "15분",
    difficulty: 1,
    reward: 20,
    background: "office",
    npc: { name: "이주 선배", emoji: "🧑" },
    dialogues: [
      {
        npc: "이 동네 한 달 생활비, 얼마쯤 잡으세요?",
        options: [
          { label: "80만원 이하", next: 1 },
          { label: "80~120만원", next: 1 },
          { label: "120만원 이상", next: 1 },
        ],
      },
      {
        npc: "도시 절반쯤 들어요. 통신비랑 보험은 비슷하고, 식비가 크게 줄어요. 외식이 줄거든요.",
        options: [{ label: "감 잡혔어요" }],
      },
    ],
  },
  {
    id: "transit",
    title: "교통 접근성 확인",
    icon: "🚌",
    category: "현실체크",
    duration: "10분",
    difficulty: 1,
    reward: 15,
    background: "transit",
    npc: { name: "버스 기사님", emoji: "👨‍✈️" },
    dialogues: [
      {
        npc: "어디서 오셨어요?",
        options: [
          { label: "서울에서요", next: 1 },
          { label: "부산에서요", next: 2 },
        ],
      },
      {
        npc: "차로는 4시간, KTX 타고 부산 거쳐서 오면 4시간 반 정도예요. 자주 오시기는 좀 멀죠.",
        options: [{ label: "참고할게요" }],
      },
      {
        npc: "부산이면 차로 한 시간 반이에요. 거가대교 타면 진짜 가까워요.",
        options: [{ label: "생각보다 가깝네요" }],
      },
    ],
  },
  {
    id: "stats",
    title: "지역 통계 탐색",
    icon: "📊",
    category: "현실체크",
    duration: "20분",
    difficulty: 2,
    reward: 25,
    background: "library",
    npc: { name: "마을 안내원", emoji: "🧑‍💼" },
    dialogues: [
      {
        npc: "거제 인구는 24만 명 정도예요. 30대 이주 비율이 빠르게 늘어요.",
        options: [{ label: "계속 들어볼게요", next: 1 }],
      },
      {
        npc: "병원·마트·학교 모두 시내에 모여 있어요. 차 한 대는 있으면 편해요.",
        options: [{ label: "잘 알겠어요" }],
      },
    ],
  },
  {
    id: "neighbor",
    title: "이주자 만나기",
    icon: "🤝",
    category: "관계형성",
    duration: "1시간",
    difficulty: 3,
    reward: 40,
    background: "neighbor",
    npc: { name: "먼저 온 이주자", emoji: "👩" },
    dialogues: [
      {
        npc: "저도 작년에 서울에서 왔어요. 처음 6개월은 좀 어색했죠.",
        options: [
          { label: "힘들었나요?", next: 1 },
          { label: "지금은 어때요?", next: 2 },
        ],
      },
      {
        npc: "겨울이 특히. 근데 봄이 되니까 마음이 풀리더라고요. 동네 분들이 챙겨주시고.",
        options: [{ label: "그렇군요" }],
      },
      {
        npc: "이제는 동네가 다 내 사람이에요. 한 번 와보세요, 다 같이 차 한 잔 해요.",
        options: [{ label: "꼭 그렇게요" }],
      },
    ],
  },
  {
    id: "hospital",
    title: "병원 접근성 확인",
    icon: "🏥",
    category: "현실체크",
    duration: "20분",
    difficulty: 2,
    reward: 30,
    background: "hospital",
    npc: { name: "동네 어르신", emoji: "👵" },
    dialogues: [
      {
        npc: "처음 오셨어요? 이 길로 쭉 가면 종합병원이 나와요. 응급실도 24시간이에요.",
        options: [
          { label: "거리는 어떨까요?", next: 1 },
          { label: "치과는요?", next: 2 },
        ],
      },
      {
        npc: "레지던스에서 도보로 12분, 850m 정도예요. 약국도 바로 옆이에요.",
        options: [{ label: "가까운 편이네요" }],
      },
      {
        npc: "치과는 시내에 세 군데 있어요. 예약은 미리 하는 게 좋아요.",
        options: [{ label: "알겠습니다" }],
      },
    ],
  },
  {
    id: "routine",
    title: "하루 루틴 체험",
    icon: "📝",
    category: "생활체험",
    duration: "1일",
    difficulty: 2,
    reward: 35,
    background: "home",
    npc: { name: "레지던스 호스트", emoji: "🧑" },
    dialogues: [
      {
        npc: "여기서 하루를 보낸다면, 어떤 하루를 보내고 싶으세요?",
        options: [
          { label: "천천히 산책하고 작업", next: 1 },
          { label: "사람들과 자주 교류", next: 1 },
          { label: "혼자만의 시간", next: 1 },
        ],
      },
      {
        npc: "거제에서 잘 어울리는 하루예요. 적응 빠르실 거예요.",
        options: [{ label: "좋네요" }],
      },
    ],
  },
  {
    id: "story",
    title: "귀촌 사례 읽기",
    icon: "📖",
    category: "생활체험",
    duration: "15분",
    difficulty: 1,
    reward: 15,
    background: "cafe",
    npc: { name: "카페 사장님", emoji: "☕" },
    dialogues: [
      {
        npc: "올해 이주한 분이 쓴 글이에요. 첫 한 달 적응기예요.",
        options: [{ label: "읽어볼게요", next: 1 }],
      },
      {
        npc: '"바닷가 산책로가 매일의 일상이 되었어요. 도시였으면 특별한 풍경이었을 텐데, 여기선 그냥 출근길이에요."',
        options: [{ label: "좋은 글이네요" }],
      },
    ],
  },
];

// 최종 미션 — 모든 일반 미션 완료 후 활성화 (PRD: 이주 결정 리포트 생성)
export const finalMission = {
  id: "final-report",
  title: "이주 결정 리포트 생성",
  icon: "📋",
  reward: 100,
  description:
    "지금까지 쌓은 8가지 체험을 바탕으로 거제 이주에 대한 나만의 리포트를 만들어요.",
};
