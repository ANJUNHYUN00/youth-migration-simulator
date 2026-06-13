// 코버플로우 캐러셀
// - 가로 스냅 스크롤(scroll-snap) + 각 카드의 컨테이너 중심 거리로 transform 보간
// - 모바일은 native touch swipe, PC는 마우스 드래그로 scrollLeft 직접 조작

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  items: ReactNode[];
  /** 카드 폭 (px). 기본 220. 보너스 등 작게 표시하고 싶을 때 override. */
  cardWidth?: number;
};

// 기본 카드 폭 — 디자인 기준 220px
const DEFAULT_CARD_WIDTH = 220;

export default function MissionCarousel({ items, cardWidth = DEFAULT_CARD_WIDTH }: Props) {
  const CARD_WIDTH = cardWidth;
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 스크롤 / 리사이즈에 따라 각 카드 transform 갱신
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;

    const update = () => {
      const cRect = container.getBoundingClientRect();
      const center = cRect.left + cRect.width / 2;
      const halfWidth = cRect.width / 2;

      for (const item of itemRefs.current) {
        if (!item) continue;
        const r = item.getBoundingClientRect();
        const iCenter = r.left + r.width / 2;
        // -1(왼쪽 끝) ~ 0(중앙) ~ 1(오른쪽 끝)
        const dist = Math.max(-1.4, Math.min(1.4, (iCenter - center) / halfWidth));
        const abs = Math.min(1, Math.abs(dist));
        const scale = 1 - abs * 0.18; // 1.0 → 0.82
        const rotateY = dist * -18; // ±18deg
        const translateZ = -abs * 40;
        const opacity = 1 - abs * 0.3;
        item.style.transform =
          `perspective(900px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
        item.style.opacity = String(opacity);
        item.style.zIndex = String(Math.round(100 - abs * 100));
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  // PC 마우스 드래그 — 터치는 native에 맡김
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = container.scrollLeft;
      container.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      container.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      container.style.cursor = "grab";
      // 드래그 직후 자식 버튼의 click 이벤트 한 번 차단
      if (moved) {
        const blockClick = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
          container.removeEventListener("click", blockClick, true);
        };
        container.addEventListener("click", blockClick, true);
      }
    };

    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // 가운데 정렬 패딩 — 좌우 끝에서도 카드가 중앙에 올 수 있게
  const sidePadding = `calc(50% - ${CARD_WIDTH / 2}px)`;

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory
                 flex items-center gap-3 py-8 cursor-grab
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                 touch-pan-x"
      style={{
        paddingLeft: sidePadding,
        paddingRight: sidePadding,
        perspective: "1000px",
      }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="snap-center shrink-0"
          style={{
            width: `${CARD_WIDTH}px`,
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
