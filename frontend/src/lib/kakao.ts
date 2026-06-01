// 카카오 Maps SDK 동적 로더 + 로드뷰 헬퍼
// - SDK는 한 번만 로드 (싱글톤 Promise)
// - 앱키는 .env.local의 VITE_KAKAO_KEY
// - autoload=false 로 받고 kakao.maps.load(cb) 안에서 모듈이 준비된 시점 보장

const SDK_URL_BASE = "//dapi.kakao.com/v2/maps/sdk.js";

// SDK 타입은 외부 라이브러리(@types/kakao 등)가 없으므로 ambient any 선언
// 필요한 멤버만 좁혀 사용 (LatLng / Roadview / RoadviewClient)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | null = null;

// 카카오 SDK 로드 — 이미 로드돼 있으면 즉시 resolve
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadKakaoMaps(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window 미존재 — SSR 환경에서는 사용 불가"));
  }
  if (window.kakao?.maps?.Roadview) {
    return Promise.resolve(window.kakao);
  }
  if (loadPromise) return loadPromise;

  const appkey = import.meta.env.VITE_KAKAO_KEY as string | undefined;
  if (!appkey) {
    return Promise.reject(
      new Error(
        "VITE_KAKAO_KEY 미설정 — frontend/.env.local에 키를 넣어주세요"
      )
    );
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${SDK_URL_BASE}?appkey=${encodeURIComponent(appkey)}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () =>
      reject(
        new Error(
          "카카오 SDK 로드 실패 — 키·도메인 등록 또는 네트워크 확인"
        )
      );
    document.head.appendChild(script);
  });
  return loadPromise;
}

// 좌표에서 가장 가까운 카카오 로드뷰 panoId 조회.
// 반경 50m → 못 잡으면 200m로 한 번 더 시도 (좌표 약간의 오차 대비).
// 둘 다 안 잡히면 null — 호출자가 사진 폴백으로 분기.
export async function getNearestPanoId(
  lat: number,
  lng: number
): Promise<{ panoId: number; radius: 50 | 200 } | null> {
  const kakao = await loadKakaoMaps();
  const client = new kakao.maps.RoadviewClient();

  const tryRadius = (r: 50 | 200): Promise<number | null> =>
    new Promise((resolve) => {
      client.getNearestPanoId(
        new kakao.maps.LatLng(lat, lng),
        r,
        (panoId: number | null) => resolve(panoId ?? null)
      );
    });

  const p50 = await tryRadius(50);
  if (p50) return { panoId: p50, radius: 50 };
  const p200 = await tryRadius(200);
  if (p200) return { panoId: p200, radius: 200 };
  return null;
}
