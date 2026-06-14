# 2026-06-14 — 커뮤니티 재설계 + 예약/미션 흐름 다듬기

오늘은 **커뮤니티 탭 전면 정리 + 예약 취소 플로우 재구성 + 이주 리포트 트리거 버그 수정**을
한 번에 끌어올렸다. 화면 단위로 큰 그림 → 작은 톤·여백 보정 순서로 작업.

---

## 1. 커뮤니티 탭 — 지도 기반 재설계

### 1-1. 마을 아이콘 (귀여운 SVG 일러스트)
- 기존: 사진 한 장(`community-people.png`)을 모든 지역에 동일 적용 → 식별이 안 됨.
- 변경: `VillageIcon` SVG 컴포넌트 추가. variant 별로 모티프 + 두 명의 동그란 캐릭터.
  - `mountain (산촌)` — 산 두 봉우리 + 눈 덮인 꼭대기
  - `field (들)` — 둥근 들녘 + 양옆 새싹
  - `sea (바닷)` — 잔잔한 물결 두 줄
- 강화도만 예외 — 실제 클레이 커플 사진(`ganghwa-couple.png`)으로 차별화.
- 적용 위치: 전국 지도 핀(RegionPin) + 강화 메인 카드 + 다른 동네 카드.

### 1-2. 지역 화면 헤더
- "강화" eyebrow 텍스트 제거. 강화일 때만 H1 단독.
- 서브카피 두 번 반복 조정 끝에 **"머문 사람들의 기록이 모여, 우리가 되는 곳"** 으로 안착.
- 헤더 ↔ 카테고리 탭 사이 여백 절반으로 축소 (`pb-6 → pb-5`, `pb-4 → pb-2`).

### 1-3. "지금 전국에서 가장 뜨거운 대화" 캐러샐 (Top 5)
- 기존 단일 풀폭 카드 1편 → **가로 캐러샐 5장**으로 변경. `snap-x snap-mandatory` + 카드 폭 82%.
- 카피: "결이 깊은 한 편" → "이번 주 가장 많이 읽힌 한 편" → "지금 동네에서 가장 뜨거운 대화"
  → **"지금 전국에서 가장 뜨거운 대화"** (좋아요 기반 + 전국 단위 의미 정확화).
- 한 지역당 1편씩 골라 다양성 확보, 부족하면 좋아요 순으로 채워 항상 5장.
- 카드 디자인은 흰 카드 + 좌상단 작은 흰 핀 톤으로 유지 (한 차례 컬러 띠 디자인 시도 후 원복).

### 1-4. 다른 지역 mock 게시글 15개 추가
- 카드가 전국 캐러샐인데 데이터는 강화뿐이라 의미가 부족 → `communityMap.ts`에 추가.
  - 산촌(영월) 5개: 적막·새벽안개·원격근무·병원거리 톤 — 능선아래/골짜기일기/도시탈출러 등
  - 들(충청) 5개: 농사·청년농부·5일장 톤 — 들에서살아요/콩알맺힘/주말농부 등
  - 바닷(거제) 5개: 새벽기상·서핑·멸치축제·교통 톤 — 갯바람따라/포구산책/서핑입문 등
- 좋아요 수 100+ 인 글 섞어서 캐러샐 Top 5에 강화 + 다른 지역이 골고루 노출.

### 1-5. 한 줄 기록 남기기 (Composer)
- **이름 입력 필드 제거** — 프로필 닉네임이 자동으로 들어감. `App.tsx`에서 `nickname` prop 통과.
- 댓글 모달 작성 input도 하단 탭바를 고려해 `pb` 보정.

### 1-6. 내가 올린 글 삭제 기능
- `handleDeletePost` 추가 — id 가 `user-` 접두사인 글만 삭제 가능 (mock 보호).
- FeedCard 우측 ⋯ 버튼 → 본인 글에서만 활성화 → 드롭다운 "글 삭제하기"
  → `confirm("이 글을 삭제할까요?")` → 글 + 댓글 + 좋아요 상태 동시 정리.
- `RegionalMapAndFeed`, `PlaceDetailSheet` 양쪽 다 prop 통과.

---

## 2. 예약 취소 흐름 재구성

### 2-1. D-day 카드 → 상세 모달 진입
- 기존: "다가오는 예약" 카드 옆 인라인 "취소" 버튼. UI 혼잡 + 실수 클릭 위험.
- 변경: 카드 전체가 탭 가능한 버튼 → **`BookingDetailModal`** 바텀시트 등장.
  - ✓ "예약이 확정됐어요" 안내 박스 (운영팀 안내 톤)
  - 레지던스 카드 (이미지 + 지역 + 이름 + D-day 배지)
  - 입주일 / 기간 / 정부 지원금 행
  - 빨간 외곽선 **"예약 취소하기"** 버튼
- 취소 클릭 → `confirm("정말로 이 예약을 취소하시겠습니까?\n취소하면 되돌릴 수 없어요.")`
  → `onCancelBooking` 호출 + 모달 닫힘.

### 2-2. 하단 탭바 가림 해결
- 바텀시트 `pb` 가 고정값(`pb-7`/`pb-8`)이라 BottomNav (~96px)에 가림.
- `pb-[calc(var(--content-bottom)+1rem)]` 로 변경 → 한 줄 기록 남기기, 예약 상세, 핀 상세, 댓글 모달 입력창 4곳 일괄 적용.

---

## 3. 이주 리포트 트리거 버그 수정 (`App.tsx:1231`)

**증상:** 4일차 끝나야 이주 리포트가 나와야 하는데 3일차 끝나고 나옴.

**원인:**
1. Day 3 마지막 미션 완료 → 의식 화면 (currentDay=3, 비-마지막 옵션 노출)
2. "내 자리 가서 마당 꾸미기" 클릭 → `finishDayAnd` → `currentDay = 4`
3. residence-home 자동 진입 + 마당 편집 모드 자동 시작
4. 첫 편집 저장(`onEditDone`) 시 `isFinalDay = currentDay (4) >= dayCount (4) = true`
   + `placedCount > 0` → 한설 outro 카드 노출 → 이주 리포트 시네마틱.
5. 결과: Day 4 미션을 하나도 안 했는데 시네마틱이 떠버림.

**수정:** `onEditDone` 조건에 `finalDayMissionsDone` 추가.
```ts
const finalDayMissionsDone = isDayComplete(
  currentDayPlan?.missionsByDay ?? [],
  currentDay,
  currentCompletedIds
);
if (isFinalDay && finalDayMissionsDone && placedCount > 0 && !hanseolOutroShown) {
  setShowHanseolOutro(true);
}
```

---

## 4. 미션 화면 다듬기

### 4-1. 병원 미션 배경 문법 통일
- hospital 미션만 `SCENE_BG` 에 매핑 없어 베이지 그라데이션만 떴음.
- `hospital: "/character1/mission_cover/hospital.png"` 추가 → 다른 클레이 씬 미션과 같은 풀씬 톤.

### 4-2. "솔직히 나랑은 안 맞는 것 같아요" 답변 카드
- 흰 배경 + 회색 텍스트로 다른 답변과 달랐음.
- 일반 옵션과 같은 카드 톤(`glassOption`, `PLAYER_AVATAR`, `text-ink`) + 점선 외곽선으로 통일.

### 4-3. 일몰 미션 로드뷰 제거
- 일몰은 시간대 분위기 미션이라 로드뷰는 어울리지 않음.
- `mode: "map-info" → "dialogue"`, `kakaoPosition` 삭제.

### 4-4. 로드뷰 시작점 90m 이내
- 도착지 기준 자동 offset `100m → 80m`.
- 명시 startPosition 실패 시 fallback `50m → 40m`.
- 출발점에서 도착지가 보일 정도로 가까워짐.

### 4-5. NPC만 말할 때 대화 상자 위치
- player-turn 일 때만 `pb-40px`, NPC 말풍선만 떠 있는 npc-typing/npc-done/opener 단계는 `pb-72px` 로 위로 올림.

---

## 5. 작은 톤·여백

- 강화 H1 위 "강화" eyebrow 제거 (강화일 때만)
- BookingFormScreen — `시뮬레이션 호스트` 톤 다듬기 + 기간 단위 박/일 (3박4일/5박6일/6박7일)
- BookingDoneScreen — `onBackToList` 가 내 정보 탭으로 (예약 목록이 아닌 프로필)
- 커뮤니티 ↔ 시뮬레이션 emoji 스왑 (🏔→⛰)
- 카테고리 탭 — 외곽선 제거, 선택 칩만 강조 (d96d896 톤 복원)
- 댓글 기능 + 글쓰기 (이미지 첨부) 흐름 정착

---

## 다음 결정해야 할 것

- 캐러샐 카드에 카테고리 라벨(미션후기/체험후기/이주스토리/지역이야기) 표시 여부.
- 다른 지역(산촌·들·바닷)의 실제 일러스트/사진 자산 — 지금은 SVG `VillageIcon` 으로 통일.
- BookingDetailModal 에 "운영팀 연락" CTA 추가할지.
- Day 4 미션 완료 후 한설 outro 외에 다른 진입점 정리 (의식 화면 CTA 와 흐름 일치 확인).

---

## 코드 핵심 변경 파일

- `src/screens/CommunityScreen.tsx` — VillageIcon, 캐러샐, 삭제 기능, 헤더/서브카피, 모달 pb 보정
- `src/screens/ProfileScreen.tsx` — BookingDetailModal 신규 + UpcomingBookings 카드 단순화
- `src/screens/MissionExecuteScreen.tsx` — 부정 답변 톤, NPC-only pb, hospital SCENE_BG
- `src/components/KakaoRoadview.tsx` — 시작점 offset 축소
- `src/data/communityMap.ts` — 산촌/들/바닷 mock 게시글 15개 추가 (untracked → 신규 추적)
- `src/data/regionMissions.ts` — 일몰 미션 로드뷰 제거
- `src/App.tsx` — 이주 리포트 트리거 보강, CommunityScreen 에 nickname 전달
- `public/character1/ganghwa-couple.png` — 강화 커뮤니티 아이콘 (신규)
