// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import RouteSummaryScreen from "./screens/RouteSummaryScreen";
import JourneyScreen from "./screens/JourneyScreen";
import HospitalMissionScreen from "./screens/mission/HospitalMissionScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import type { Residence, LifeStyleType } from "./data/residences";
import { HOME_POSITIONS, type HomeRegion } from "./data/regions";
import { baseMissions, type Mission } from "./data/missions";

// 단일 화면 프리뷰용 hash 라우팅 — 데모 중 특정 화면만 빠르게 확인하기 위함
// 사용 예: http://localhost:5173/#hospital → 병원 미션 화면 단독 노출
function useHashRoute() {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

// 탭1 내부 화면 흐름:
//  홈 → 떠나기 → 이동 → 도착 → 미션 리스트 → 미션 수행 → (모두 완료 시) 동선 요약
type Tab1Route =
  | "home"
  | "departure"
  | "traveling"
  | "arrival"
  | "mission-list"
  | "mission-execute"
  | "route-summary";

// localStorage 키 — 온보딩 완료 상태 + 결과 저장
const STORAGE_KEY = "cheongpung.onboarding.v1";

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
};

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
  // 모든 훅을 조건부 리턴보다 먼저 호출해야 React 규칙(rules-of-hooks)에 위배되지 않는다
  const hash = useHashRoute();
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());
  const [tab, setTab] = useState<TabKey>("home");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [selected, setSelected] = useState<Residence | null>(null);

  // 미션 진행 상태
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(
    new Set()
  );
  const [totalScore, setTotalScore] = useState(0);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);

  // 데모 편의: 콘솔에서 `cheongpung.reset()` 으로 온보딩 다시 보기
  useEffect(() => {
    (window as unknown as { cheongpung?: { reset: () => void } }).cheongpung = {
      reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab("home");
        setCompletedMissionIds(new Set());
        setTotalScore(0);
        setActiveMission(null);
      },
    };
  }, []);

  // 프리뷰 라우팅 — 정상 플로우보다 우선
  if (hash === "#hospital") return <HospitalMissionScreen />;

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

  if (!profile) {
    return <OnboardingShell onComplete={handleOnboardingComplete} />;
  }

  const homeRegion = profile.homeRegionName;
  const homePos: HomeRegion["pos"] =
    HOME_POSITIONS[homeRegion] ?? HOME_POSITIONS["서울"];

  const handleTabChange = (next: TabKey) => {
    if (next === "home" && tab1Route !== "traveling") setTab1Route("home");
    setTab(next);
  };

  // 미션 완료 처리 — 점수 누적, 모두 완료 시 동선 요약으로 전환
  const handleMissionComplete = () => {
    if (!activeMission) return;
    const id = activeMission.id;
    const newCompleted = new Set(completedMissionIds).add(id);
    const newScore = totalScore + activeMission.reward;
    setCompletedMissionIds(newCompleted);
    setTotalScore(newScore);
    setActiveMission(null);

    const allDone =
      baseMissions.every((m) => newCompleted.has(m.id));
    if (allDone) {
      setTab1Route("route-summary");
    } else {
      setTab1Route("mission-list");
    }
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
            onStartMissions={() => setTab1Route("mission-list")}
          />
        )}

        {tab === "home" && tab1Route === "mission-list" && selected && (
          <MissionListScreen
            region={selected.region}
            completedIds={completedMissionIds}
            totalScore={totalScore}
            onBack={() => setTab1Route("arrival")}
            onSelectMission={(m) => {
              setActiveMission(m);
              setTab1Route("mission-execute");
            }}
            onSelectFinal={() => setTab1Route("route-summary")}
          />
        )}

        {tab === "home" &&
          tab1Route === "mission-execute" &&
          activeMission && (
            <MissionExecuteScreen
              mission={activeMission}
              onClose={() => {
                setActiveMission(null);
                setTab1Route("mission-list");
              }}
              onComplete={handleMissionComplete}
            />
          )}

        {tab === "home" && tab1Route === "route-summary" && selected && (
          <RouteSummaryScreen
            region={selected.region}
            completedIds={completedMissionIds}
            totalScore={totalScore}
            onClose={() => setTab1Route("mission-list")}
          />
        )}

        {tab === "journey" && <JourneyScreen />}
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  );
}
