# 온보딩 인트로 컷 일러스트

`IntroScreen.tsx`(서비스 소개 4컷)에 들어가는 컷별 전용 일러스트를 두는 폴더입니다.
일러스트를 넣지 않으면 바람이·지음이 캐릭터 피규어로 자동 폴백됩니다.

## 컷 구성 (key 기준)

| key | 컷 | 카피 |
|-----|----|------|
| `hello` | 인사 | 바람이·지음이 등장 자기소개 |
| `purpose` | 취지 | 나에게 맞는 지역 살아보기 체험 + 실질 정보 |
| `content` | 콘텐츠 | 미션 / 편지 / 커뮤니티 / 레지던스 예약 |
| `result` | 결과물 | 집 짓기 등 유저가 얻는 것 |

## 권장 규격
- 형식: 배경 투명 PNG 또는 WebP
- 비율: 세로형 (대략 3:4), 권장 720×900px 내외
- 화면 하단 영역에 약 `width: 230px`로 표시됨 (max-height 300px)
- 톤: 파스텔 + 주황/초록 메인컬러

## 연결 방법
1. 이 폴더에 파일을 넣습니다. (예: `purpose.webp`)
2. `IntroScreen.tsx` 상단에서 import 후 `SLIDE_ART`에 매핑:

```ts
import artPurpose from "../../assets/intro/purpose.webp";

const SLIDE_ART: Partial<Record<string, string>> = {
  purpose: artPurpose,
};
```

파일명과 어떤 컷인지만 알려주면 import 연결은 대신 해드릴 수 있어요.
