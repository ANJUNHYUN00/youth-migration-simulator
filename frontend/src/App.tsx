// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import JourneyScreen from "./screens/JourneyScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import type { Residence, LifeStyleType } from "./data/residences";
import { HOME_POSITIONS, type HomeRegion } from "./data/regions";

// 탭1 내부 화면 흐름: 홈 → 떠나기 → 이동 애니메이션 → 지역 도착 → (추후: 미션 상세)
type Tab1Route = "home" | "departure" | "traveling" | "arrival";

// localStorage 키 — 온보딩 완료 상태 + 결과 저장
const STORAGE_KEY = "cheongpung.onboarding.v1";

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
};

// 초기 진입 시 저장된 프로필 복구 (없으면 null → 온보딩 노출)
function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

export default function App() {
  // 사용자 프로필 — null이면 온보딩 노출
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());

  const [tab, setTab] = useState<TabKey>("home");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [selected, setSelected] = useState<Residence | null>(null);

  // 데모 편의: 콘솔에서 `cheongpung.reset()` 으로 온보딩 다시 보기
  useEffect(() => {
    (window as unknown as { cheongpung?: { reset: () => void } }).cheongpung = {
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab("home");
      },
    };
  }, []);

  const handleOnboardingComplete = (r: OnboardingResult) => {
    const next: SavedProfile = {
      homeRegionName: r.homeRegion.name,
      lifestyle: r.lifestyle,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* 저장 실패해도 메모리 상태로는 진행 */
    }
    setProfile(next);
  };

  // 온보딩 미완료 → 온보딩 노출
  if (!profile) {
    return <OnboardingShell onComplete={handleOnboardingComplete} />;
  }

  // 온보딩 완료 후 — 본 지역 좌표 결정 (없으면 서울 기본)
  const homeRegion = profile.homeRegionName;
  const homePos: HomeRegion["pos"] =
    HOME_POSITIONS[homeRegion] ?? HOME_POSITIONS["서울"];

  const handleTabChange = (next: TabKey) => {
    if (next === "home" && tab1Route !== "traveling") setTab1Route("home");
    setTab(next);
  };

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <main className="min-h-screen pb-24">
        {tab === "home" && tab1Route === "home" && (
          <HomeScreen
            homeRegion={homeRegion}
            onDepart={() => setTab1Route("departure")}
          />
        )}

        {tab === "home" && tab1Route === "departure" && (
          <DepartureScreen
            homeRegion={homeRegion}
            onBack={() => setTab1Route("home")}
            onDepart={(r: Residence) => {
              setSelected(r);
              setTab1Route("traveling");
            }}
          />
        )}

        {tab === "home" && tab1Route === "traveling" && selected && (
          <TravelingScreen
            origin={{ ...homePos, region: homeRegion }}
            destination={selected}
            onComplete={() => setTab1Route("arrival")}
          />
        )}

        {tab === "home" && tab1Route === "arrival" && selected && (
          <ArrivalScreen
            residence={selected}
            onBack={() => {
              setSelected(null);
              setTab1Route("home");
            }}
          />
        )}

        {tab === "journey" && <JourneyScreen />}
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
