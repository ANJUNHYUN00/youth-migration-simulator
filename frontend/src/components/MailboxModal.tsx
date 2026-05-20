// 우편함 모달 — 도착 화면의 우편함 클릭 시 노출
// PRD: "우편함 아이콘: 클릭 시 귀촌 사례 / 주민 이야기 카드 1장 열람 가능"

import { motion, AnimatePresence } from "framer-motion";
import type { Story } from "../data/stories";

type Props = {
  open: boolean;
  story: Story | null;
  onClose: () => void;
};

export default function MailboxModal({ open, story, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && story && (
        <>
          {/* 백드롭 */}
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-20"
          />

          {/* 편지 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            role="dialog"
            aria-label="우편함 편지"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[88%] max-w-[340px] z-30
                       bg-white rounded-3xl shadow-soft p-5"
          >
            {/* 우편 헤더 */}
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-2xl">📮</span>
              <p className="text-ink-soft text-[12px] font-medium">
                {story.author}님의 이야기
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="ml-auto w-7 h-7 rounded-full hover:bg-cream-100
                           text-ink-soft text-[14px]"
              >
                ✕
              </button>
            </div>

            {/* 편지 본문 */}
            <h3 className="mt-3 text-ink text-[17px] font-extrabold leading-snug">
              {story.title}
            </h3>
            <p className="mt-2 text-ink-soft text-[14px] leading-relaxed">
              {story.body}
            </p>

            {/* 우표 디테일 */}
            <div className="mt-4 pt-3 border-t border-dashed border-cream-200
                            flex items-center justify-between text-[11px] text-ink-mute">
              <span>· 청풍 우편함 ·</span>
              <span>이주 후 1년차</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
