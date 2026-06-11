// 지역(residence.id) → 미션 목록 화면 배경 이미지 경로
// 파일은 public/regions/<id>.<ext> 에 두고 절대 경로로 참조.
// 맵에 없으면 미션 목록 화면이 기본 cream 배경으로 떨어짐.

export const regionBackgrounds: Record<string, string> = {
  ganghwa: "/regions/ganghwa.jpg",
};

export function backgroundForResidence(id: string): string | undefined {
  return regionBackgrounds[id];
}
