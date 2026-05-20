// 탭2 나의 여정 — 추후 한반도 아트지도 / 축적 점수 표시 예정
// 현재는 자리만 잡아둔 플레이스홀더 화면

export default function JourneyScreen() {
  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4" aria-hidden>
        🗺️
      </div>
      <h2 className="text-ink text-[20px] font-extrabold">나의 여정</h2>
      <p className="mt-2 text-ink-soft text-[14px] leading-relaxed">
        다녀온 지역의 기록이 아트지도로 모여요.
        <br />
        곧 만나요!
      </p>
    </div>
  );
}
