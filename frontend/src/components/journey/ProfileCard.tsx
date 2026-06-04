// 옵션 A — '나의 여정' 상단 프로필 카드
// 닉네임 / 자세·환경 / 현재 본 지역 / ⚙️ 설정 진입

import { motion } from "framer-motion";
import type { LifeStyleType } from "../../data/residences";
import {
  envMeta,
  stanceMeta,
  type LifestyleProfile,
} from "../../data/lifestyle";

type Props = {
  nickname: string;
  lifestyle: LifeStyleType | null; // 호환용 (사용 안 함)
  profile?: LifestyleProfile;
  homeRegion: string;
  onOpenSettings: () => void;
};

export default function ProfileCard({
  nickname,
  profile,
  homeRegion,
  onOpenSettings,
}: Props) {
  const stanceM = profile ? stanceMeta[profile.stance] : null;
  const envM = profile ? envMeta[profile.env] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-cream-200 rounded-2xl p-3.5 shadow-soft
                 flex items-center gap-3"
    >
      {/* 좌측 — 유형 이모지 아바타 */}
      <div
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nature-50 to-primary-50
                   border border-nature-200 flex items-center justify-center text-2xl shrink-0"
        aria-hidden
      >
        {stanceM?.emoji ?? "🌱"}
      </div>

      {/* 중간 — 이름 / 자세 / 본지역+환경 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-ink text-[14px] font-extrabold truncate">
            {nickname}
          </p>
          {stanceM && (
            <span
              className="px-1.5 py-0.5 rounded-full bg-nature-50 text-nature-600
                         text-[10px] font-extrabold whitespace-nowrap"
            >
              {stanceM.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-ink-soft text-[11px] truncate">
          📍 본 지역{" "}
          <span className="text-ink font-bold">{homeRegion}</span>
          {envM && (
            <span className="text-ink-mute">
              {" "}· {envM.emoji} {envM.blurb}
            </span>
          )}
        </p>
      </div>

      {/* 우측 — 톱니바퀴 */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="설정"
        className="w-9 h-9 rounded-full bg-cream-100 text-ink-soft text-base
                   flex items-center justify-center active:scale-95 transition shrink-0"
      >
        ⚙️
      </button>
    </motion.div>
  );
}
