// 우편함에서 열람하는 귀촌 사례 / 주민 이야기 — 지역당 1장
// residences.ts의 id 키를 사용

export type Story = {
  author: string;
  title: string;
  body: string;
};

export const storiesByResidenceId: Record<string, Story> = {
  ganghwa: {
    author: "민지",
    title: "강화의 아침은 풀냄새로 시작해요",
    body:
      "서울에서 일하다가 잠시 강화로 왔어요. 첫날 아침에 창문을 열었을 때 풀냄새가 코끝에 스미더라고요. 그날부터 알람 없이 자연스럽게 눈이 떠져요.",
  },
  gwangyang: {
    author: "지호",
    title: "매화 향기 속에서 일하기",
    body:
      "광양에서 일하는 두 번째 봄이에요. 작업실 창밖으로 매화가 흩날리는 풍경을 보면서 글을 쓰는 게 익숙해졌어요. 도시에선 못 느낀 호흡이 여기에 있어요.",
  },
  geoje: {
    author: "수아",
    title: "거제 바닷가 산책 30일",
    body:
      "이주를 결심하고 거제에서 한 달을 보냈어요. 매일 저녁 바닷가를 걸으며 머리가 정리되더라고요. 액티비티도 많아서 주말이 오히려 짧게 느껴져요.",
  },
};
