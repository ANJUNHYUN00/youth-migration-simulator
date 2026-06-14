// 커뮤니티 — 지도 기반 3단계 줌인 (전국 → 강화 동네 → 핀 상세)
//
// 인스타식 글 피드 제거. "관계가 특정 장소에 누적된다" 를 시각화.
//   · 화면 1: 전국 일러스트 지도 + 지역 핀 + 리스트 카드
//   · 화면 2: 강화 일러스트 지도(상단) + 카테고리 탭 + 피드(하단)
//   · 화면 3: 핀(장소) 상세 — 바텀시트로 누적 기록 모아보기
// 핀 크기/농도는 posts 누적 수로 계산 (sizeForCount / opacityForCount).

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import {
  CATEGORY_LABEL,
  type PostCategory,
} from "../data/communityPosts";
import {
  commentsForPost,
  communityMapPosts,
  communityPlaces,
  communityRegions,
  countForPlace,
  countForRegion,
  GANGHWA_COLOR,
  loadComments,
  loadUserMapPosts,
  opacityForCount,
  REGION_COLOR,
  saveComments,
  saveUserMapPosts,
  sizeForCount,
  type CommunityPlace,
  type CommunityRegion,
  type MapComment,
  type MapPost,
} from "../data/communityMap";

type Phase =
  | { kind: "national" }
  | { kind: "regional"; regionId: string }
  | { kind: "placeDetail"; regionId: string; placeId: string };

// 본문/장소/카테고리 키워드 → 커뮤니티 실사 이미지 매칭. 기존 인스타식 피드 톤 유지.
const IMAGE_RULES: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["갯벌", "해변", "바다", "동막", "노을"], image: "/community/community_01.jpg" },
  { keywords: ["시장", "장", "매대", "순무", "밴댕이", "젓갈"], image: "/community/community_02.jpg" },
  { keywords: ["한옥", "차밭", "공방", "소창", "손수건"], image: "/community/community_03.jpg" },
  { keywords: ["카페", "펍", "가게", "사장", "사랑방"], image: "/community/community_04.jpg" },
  { keywords: ["책방", "책", "시집", "함민복"], image: "/community/community_03.jpg" },
];

function pickImageForPost(body: string, placeName?: string): string {
  const haystack = `${body} ${placeName ?? ""}`;
  for (const rule of IMAGE_RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) return rule.image;
  }
  return "/community/community_05.jpg";
}

// 닉네임 해시 → 파스텔 아바타 색
const AVATAR_PALETTE = [
  "#FFD0BB", "#C9E1EF", "#B1DCB5", "#FFE9A8",
  "#FFC4DC", "#E8C8A4", "#A8CFB5", "#FFB6A8",
];
function avatarColor(nickname: string): string {
  const hash = Array.from(nickname).reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

type Props = {
  onBack?: () => void;
  // 현재 로그인한 사용자 닉네임 — 글/댓글 작성 시 자동 입력 + 본인 글 삭제 권한 판정.
  nickname?: string;
};

export default function CommunityScreen({ onBack, nickname }: Props = {}) {
  const myNickname = (nickname ?? "").trim() || "여행자";
  const [phase, setPhase] = useState<Phase>({ kind: "national" });
  // 사용자가 작성한 글 — localStorage 영속, mock 글과 같이 피드/지도 카운트에 반영
  const [userPosts, setUserPosts] = useState<MapPost[]>(() => loadUserMapPosts());
  const [composerOpenForRegion, setComposerOpenForRegion] = useState<string | null>(null);
  // 댓글 — 영속
  const [comments, setComments] = useState<MapComment[]>(() => loadComments());
  // 댓글 모달이 열려있는 글 id
  const [commentsOpenForPost, setCommentsOpenForPost] = useState<string | null>(null);

  // 영속
  useEffect(() => {
    saveUserMapPosts(userPosts);
  }, [userPosts]);
  useEffect(() => {
    saveComments(comments);
  }, [comments]);

  const handleSubmitComment = (postId: string, nickname: string, body: string) => {
    const c: MapComment = {
      id: `c-${Date.now()}`,
      postId,
      nickname,
      body,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, c]);
  };

  const allPosts = useMemo(
    () => [...userPosts, ...communityMapPosts],
    [userPosts]
  );

  // 임시 좋아요 토글 — 화면 상태로만 (영속 X)
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const toggleLike = (id: string) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 내가 올린 글만 삭제 가능 — id 가 "user-" 로 시작하는 글에 한정.
  const handleDeletePost = (postId: string) => {
    if (!postId.startsWith("user-")) return;
    setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    // 같이 그 글의 댓글도 정리
    setComments((prev) => prev.filter((c) => c.postId !== postId));
    // 좋아요 상태도 정리 (메모리 only 이지만 정합성)
    setLiked((prev) => {
      if (!prev.has(postId)) return prev;
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  };

  const handleSubmitPost = (draft: {
    regionId: string;
    placeId?: string;
    category: MapPost["category"];
    nickname: string;
    body: string;
    imageDataUrl?: string;
  }) => {
    const newPost: MapPost = {
      id: `user-${Date.now()}`,
      regionId: draft.regionId,
      placeId: draft.placeId,
      category: draft.category,
      authorType: "visitor",
      nickname: draft.nickname,
      body: draft.body,
      likes: 0,
      imageDataUrl: draft.imageDataUrl,
    };
    setUserPosts((prev) => [newPost, ...prev]);
    setComposerOpenForRegion(null);
  };

  return (
    <div className="h-screen overflow-y-auto bg-cream">
      <AnimatePresence mode="wait">
        {phase.kind === "national" && (
          <motion.div
            key="national"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <NationalMap
              onBack={onBack}
              onSelectRegion={(regionId) =>
                setPhase({ kind: "regional", regionId })
              }
            />
          </motion.div>
        )}

        {phase.kind === "regional" && (
          <motion.div
            key={`regional-${phase.regionId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RegionalMapAndFeed
              regionId={phase.regionId}
              allPosts={allPosts}
              comments={comments}
              onBack={() => setPhase({ kind: "national" })}
              onSelectPlace={(placeId) =>
                setPhase({
                  kind: "placeDetail",
                  regionId: phase.regionId,
                  placeId,
                })
              }
              liked={liked}
              onToggleLike={toggleLike}
              onOpenComposer={() => setComposerOpenForRegion(phase.regionId)}
              onOpenComments={(postId) => setCommentsOpenForPost(postId)}
              onDeletePost={handleDeletePost}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {phase.kind === "placeDetail" && (
        <PlaceDetailSheet
          regionId={phase.regionId}
          placeId={phase.placeId}
          allPosts={allPosts}
          comments={comments}
          onClose={() =>
            setPhase({ kind: "regional", regionId: phase.regionId })
          }
          liked={liked}
          onToggleLike={toggleLike}
          onOpenComments={(postId) => setCommentsOpenForPost(postId)}
          onDeletePost={handleDeletePost}
        />
      )}

      {/* === 글쓰기 모달 === */}
      <AnimatePresence>
        {composerOpenForRegion && (
          <ComposerSheet
            regionId={composerOpenForRegion}
            nickname={myNickname}
            onClose={() => setComposerOpenForRegion(null)}
            onSubmit={handleSubmitPost}
          />
        )}
      </AnimatePresence>

      {/* === 댓글 모달 === */}
      <AnimatePresence>
        {commentsOpenForPost && (
          <CommentsSheet
            postId={commentsOpenForPost}
            post={allPosts.find((p) => p.id === commentsOpenForPost)}
            comments={commentsForPost(commentsOpenForPost, comments)}
            onClose={() => setCommentsOpenForPost(null)}
            onSubmit={(nick, body) =>
              handleSubmitComment(commentsOpenForPost, nick, body)
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 화면 1 — 전국 둘러보기 지도
// =====================================================================
function NationalMap({
  onBack,
  onSelectRegion,
}: {
  onBack?: () => void;
  onSelectRegion: (regionId: string) => void;
}) {
  // 지역 별 누적 수
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of communityRegions) {
      m[r.id] = countForRegion(r.id, communityMapPosts);
    }
    return m;
  }, []);

  const ganghwa = communityRegions.find((r) => r.id === "ganghwa")!;
  const others = communityRegions.filter((r) => r.id !== "ganghwa");

  // "지금 전국에서 가장 뜨거운 대화" — 좋아요 많은 순 Top 5 (캐러샐).
  // 같은 지역에 쏠리지 않도록 한 지역당 1편씩만 골라 다양성 확보.
  const featuredPosts = useMemo(() => {
    const sorted = [...communityMapPosts].sort((a, b) => b.likes - a.likes);
    const picked: MapPost[] = [];
    const seenRegions = new Set<string>();
    for (const p of sorted) {
      if (seenRegions.has(p.regionId)) continue;
      picked.push(p);
      seenRegions.add(p.regionId);
      if (picked.length >= 5) break;
    }
    // 부족하면(지역 수가 적으면) 좋아요 순으로 채워서 무조건 5장 확보
    if (picked.length < 5) {
      for (const p of sorted) {
        if (picked.includes(p)) continue;
        picked.push(p);
        if (picked.length >= 5) break;
      }
    }
    return picked;
  }, []);

  // 지역별 최근 머문 사람들 (닉네임 unique 5명)
  const recentPeople = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const r of communityRegions) {
      const seen = new Set<string>();
      for (const p of communityMapPosts) {
        if (p.regionId !== r.id) continue;
        if (seen.has(p.nickname)) continue;
        seen.add(p.nickname);
        if (seen.size >= 5) break;
      }
      m[r.id] = Array.from(seen);
    }
    return m;
  }, []);

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur px-5 pt-6 pb-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="absolute top-6 left-5 w-9 h-9 rounded-full bg-white shadow-soft
                       flex items-center justify-center text-ink z-10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className={onBack ? "pl-12" : ""}>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-ink-mute">
            Community
          </p>
          <h1 className="mt-1 text-[22px] font-extrabold text-ink leading-tight">
            여기 머문 사람들
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            지금 전국에서 천천히 쌓이는 한 줄 기록
          </p>
        </div>
      </header>

      {/* === 한반도 지도 (여정 탭과 같은 KoreaMap) === */}
      <div className="px-4 mt-3 flex justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {communityRegions.map((r) => (
              <RegionPin
                key={r.id}
                region={r}
                count={counts[r.id]}
                onSelect={() => onSelectRegion(r.id)}
              />
            ))}
          </KoreaMap>
        </div>
      </div>

      {/* === 지금 전국에서 가장 뜨거운 대화 — Top 5 카드 가로 캐러샐 === */}
      {featuredPosts.length > 0 && (
        <FeaturedPostsCarousel
          posts={featuredPosts}
          onTap={(post) => onSelectRegion(post.regionId)}
        />
      )}

      {/* === 강화 메인 카드 (체험 가능) === */}
      <div className="px-4 mt-3">
        <button
          type="button"
          onClick={() => onSelectRegion(ganghwa.id)}
          className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-white
                     border-2 shadow-soft active:scale-[0.99] transition text-left"
          style={{ borderColor: GANGHWA_COLOR.primary }}
        >
          <div
            className="w-11 h-11 rounded-full overflow-hidden shrink-0"
            style={{ background: GANGHWA_COLOR.soft }}
            aria-hidden
          >
            <img
              src="/character1/ganghwa-couple.png"
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink text-[14.5px] font-extrabold leading-tight">
              {ganghwa.name}
              <span
                className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold align-middle"
                style={{ background: GANGHWA_COLOR.soft, color: GANGHWA_COLOR.ink }}
              >
                체험 가능
              </span>
            </p>
            <p className="mt-0.5 text-ink-soft text-[11.5px] leading-snug">
              {ganghwa.blurb}
            </p>
            {/* 최근 머문 사람들 — 아바타 겹침 + 카운트 */}
            <PeopleRow
              nicknames={recentPeople[ganghwa.id] ?? []}
              totalCount={counts[ganghwa.id]}
            />
          </div>
          <span className="text-primary text-[18px] font-bold mt-1" aria-hidden>
            ›
          </span>
        </button>
      </div>

      {/* === 다른 동네 둘러보기 리스트 === */}
      <section className="px-4 mt-4">
        <p className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.16em] uppercase px-1 mb-2">
          다른 동네 둘러보기
        </p>
        <ul className="space-y-2">
          {others.map((r) => {
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelectRegion(r.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 rounded-2xl bg-white
                             border border-cream-200 shadow-soft active:scale-[0.99] transition text-left"
                >
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                    aria-hidden
                  >
                    <VillageIcon variant={r.variant} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-[13.5px] font-extrabold leading-tight">
                      {r.name}
                    </p>
                    <p className="mt-0.5 text-ink-soft text-[11.5px] leading-snug">
                      {r.blurb}
                    </p>
                    {/* 다른 동네는 기록 X — 빈 상태 안내 */}
                    {(recentPeople[r.id]?.length ?? 0) > 0 ? (
                      <PeopleRow
                        nicknames={recentPeople[r.id] ?? []}
                        totalCount={counts[r.id]}
                      />
                    ) : (
                      <p className="mt-1.5 text-[10.5px] font-bold text-ink-mute">
                        먼저 머문 사람을 기다리는 중
                      </p>
                    )}
                  </div>
                  <span className="text-ink-mute text-[16px] mt-1" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

// =====================================================================
// 지금 전국에서 가장 뜨거운 대화 — Top 5 가로 캐러샐
// 카드 폭: 컨테이너의 82% (다음 카드가 살짝 보이는 peek). snap-x 로 한 장씩 정렬.
// =====================================================================
function FeaturedPostsCarousel({
  posts,
  onTap,
}: {
  posts: MapPost[];
  onTap: (post: MapPost) => void;
}) {
  return (
    <section className="mt-4">
      <p className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.16em] uppercase px-5 mb-2">
        ✨ 지금 전국에서 가장 뜨거운 대화
      </p>
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory
                   px-4 pb-2"
        style={{ scrollPadding: "0 16px" }}
      >
        {posts.map((post) => (
          <FeaturedPostCard
            key={post.id}
            post={post}
            onTap={() => onTap(post)}
          />
        ))}
        {/* 끝 여백 — 마지막 카드 우측 패딩 보정 */}
        <div className="shrink-0 w-1" aria-hidden />
      </div>
    </section>
  );
}

function FeaturedPostCard({
  post,
  onTap,
}: {
  post: MapPost;
  onTap: () => void;
}) {
  const place = post.placeId
    ? communityPlaces.find((p) => p.id === post.placeId)
    : null;
  const image = pickImageForPost(post.body, place?.name);
  const region = communityRegions.find((r) => r.id === post.regionId);

  return (
    <button
      type="button"
      onClick={onTap}
      className="shrink-0 snap-start w-[82%] block text-left rounded-3xl overflow-hidden
                 bg-white border border-cream-200 shadow-soft active:scale-[0.99] transition"
    >
      <div className="relative aspect-[16/9] bg-cream-200">
        <img
          src={image}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]
                     bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        {region && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                           bg-white/95 backdrop-blur text-ink text-[10.5px] font-extrabold
                           shadow-soft border border-white/70">
            📍 {region.name.split(" · ")[0]}
          </span>
        )}
        <p className="absolute left-4 right-4 bottom-3 text-white
                      text-[14.5px] font-extrabold leading-snug drop-shadow line-clamp-2">
          {firstLine(post.body, 50)}
        </p>
      </div>
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-ink text-[12.5px] font-extrabold truncate">
          {post.nickname}
        </span>
        <span className="text-ink-mute text-[11px]">·</span>
        <span className="text-ink-soft text-[11px] font-bold whitespace-nowrap">
          {post.likes}명이 함께 읽었어요
        </span>
      </div>
    </button>
  );
}

function firstLine(body: string, max = 38): string {
  const line = body.split("\n")[0] ?? body;
  return line.length > max ? line.slice(0, max - 1) + "…" : line;
}

// =====================================================================
// PeopleRow — 동네 카드 안 "최근 머문 사람들" 작은 아바타 행
// =====================================================================
const ROW_AVATAR_PALETTE = [
  "#FFD0BB", "#C9E1EF", "#B1DCB5", "#FFE9A8",
  "#FFC4DC", "#E8C8A4", "#A8CFB5", "#FFB6A8",
];
function rowAvatarColor(nick: string): string {
  const hash = Array.from(nick).reduce((s, c) => s + c.charCodeAt(0), 0);
  return ROW_AVATAR_PALETTE[hash % ROW_AVATAR_PALETTE.length];
}

function PeopleRow({
  nicknames,
  totalCount,
}: {
  nicknames: string[];
  totalCount: number;
}) {
  if (nicknames.length === 0) return null;
  const shown = nicknames.slice(0, 5);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex">
        {shown.map((nick, i) => (
          <div
            key={nick}
            className="w-6 h-6 rounded-full flex items-center justify-center
                       text-ink text-[10px] font-extrabold ring-2 ring-white"
            style={{
              background: rowAvatarColor(nick),
              marginLeft: i === 0 ? 0 : -8,
              zIndex: shown.length - i,
            }}
            aria-hidden
          >
            {nick.charAt(0)}
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold text-ink-soft">
        여기 머문 사람 {totalCount}명
      </p>
    </div>
  );
}

// =====================================================================
// VillageIcon — 마을 유형별 귀여운 SVG 아이콘
// 두 명이 마주보는 동그란 캐릭터 + 유형 모티프(파도/산/들). 사진보다 가벼움.
// 원형 컨테이너 안에 들어가는 전제 — 배경색은 부모가 결정.
// =====================================================================
function VillageIcon({
  variant,
  size = 44,
}: {
  variant: CommunityRegion["variant"];
  size?: number;
}) {
  const color = REGION_COLOR[variant];
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      style={{ display: "block" }}
    >
      {/* 부드러운 배경 — soft 톤 채움 */}
      <circle cx="32" cy="32" r="32" fill={color.soft} />

      {/* 유형별 환경 모티프 (뒤쪽 레이어) */}
      {variant === "mountain" && (
        <g>
          {/* 산 두 봉우리 */}
          <path
            d="M2 50 L18 28 L30 44 L42 22 L62 50 Z"
            fill={color.primary}
            opacity="0.45"
          />
          <path
            d="M18 28 L24 35 L20 38 Z"
            fill="#fff"
            opacity="0.7"
          />
          <path
            d="M42 22 L48 30 L44 33 Z"
            fill="#fff"
            opacity="0.7"
          />
        </g>
      )}
      {variant === "field" && (
        <g>
          {/* 들녘 — 둥근 구릉 */}
          <ellipse cx="32" cy="58" rx="40" ry="14" fill={color.primary} opacity="0.45" />
          {/* 작은 새싹 두 잎 */}
          <path d="M14 50 q2 -6 6 -8 q-1 5 -2 9 Z" fill={color.primary} opacity="0.7" />
          <path d="M50 50 q-2 -6 -6 -8 q1 5 2 9 Z" fill={color.primary} opacity="0.7" />
        </g>
      )}
      {(variant === "sea" || variant === "mixed") && (
        <g>
          {/* 바다 — 잔잔한 물결 */}
          <path
            d="M-4 48 Q8 44 20 48 T44 48 T68 48 L68 64 L-4 64 Z"
            fill={color.primary}
            opacity="0.45"
          />
          <path
            d="M-4 52 Q8 49 20 52 T44 52 T68 52"
            stroke="#fff"
            strokeWidth="1.2"
            fill="none"
            opacity="0.7"
          />
        </g>
      )}

      {/* 두 명의 동그란 캐릭터 — 마주보는 듯 살짝 기울임 */}
      {/* 왼쪽 사람 */}
      <g transform="translate(20 28)">
        {/* 머리 */}
        <circle cx="0" cy="0" r="8" fill="#FCEBD8" stroke={color.ink} strokeWidth="1.2" />
        {/* 머리카락 — 살짝 덮는 모자 느낌 */}
        <path
          d="M-8 -1 Q-6 -10 0 -10 Q6 -10 8 -1 Q4 -6 0 -6 Q-4 -6 -8 -1 Z"
          fill={color.ink}
          opacity="0.85"
        />
        {/* 눈 */}
        <circle cx="-2.6" cy="0.5" r="1.1" fill={color.ink} />
        <circle cx="2.6" cy="0.5" r="1.1" fill={color.ink} />
        {/* 볼터치 */}
        <circle cx="-4.5" cy="3" r="1.2" fill="#F5A18A" opacity="0.7" />
        <circle cx="4.5" cy="3" r="1.2" fill="#F5A18A" opacity="0.7" />
        {/* 미소 */}
        <path d="M-2 4 Q0 6 2 4" stroke={color.ink} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        {/* 몸통(어깨) */}
        <path
          d="M-9 8 Q-9 15 0 16 Q9 15 9 8 Z"
          fill="#fff"
          stroke={color.ink}
          strokeWidth="1.1"
        />
      </g>

      {/* 오른쪽 사람 */}
      <g transform="translate(44 30)">
        <circle cx="0" cy="0" r="7" fill="#FCEBD8" stroke={color.ink} strokeWidth="1.2" />
        {/* 머리카락 — 묶음 */}
        <path
          d="M-7 -1 Q-5 -9 0 -9 Q5 -9 7 -1 Q3 -5 0 -5 Q-3 -5 -7 -1 Z"
          fill={color.ink}
          opacity="0.85"
        />
        <circle cx="6" cy="-3" r="2.3" fill={color.ink} opacity="0.85" />
        {/* 눈 */}
        <circle cx="-2.3" cy="0.5" r="1" fill={color.ink} />
        <circle cx="2.3" cy="0.5" r="1" fill={color.ink} />
        {/* 볼터치 */}
        <circle cx="-4" cy="2.6" r="1" fill="#F5A18A" opacity="0.7" />
        <circle cx="4" cy="2.6" r="1" fill="#F5A18A" opacity="0.7" />
        {/* 미소 */}
        <path d="M-1.8 3.5 Q0 5 1.8 3.5" stroke={color.ink} strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* 몸통(원피스 느낌) */}
        <path
          d="M-8 7 Q-9 14 0 15 Q9 14 8 7 Z"
          fill={color.primary}
          opacity="0.75"
          stroke={color.ink}
          strokeWidth="1.1"
        />
      </g>
    </svg>
  );
}

// 전국 지도 위 한 지역 핀
function RegionPin({
  region,
  count,
  onSelect,
}: {
  region: CommunityRegion;
  count: number;
  onSelect: () => void;
}) {
  const isMain = region.id === "ganghwa";
  const color = isMain ? GANGHWA_COLOR : REGION_COLOR[region.variant];
  // KoreaMap (max 320px width, aspect 447/559) 안에 잘 보이는 사이즈로 축소
  const size = isMain ? 42 : 34;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${region.name} 둘러보기`}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-[3] flex flex-col items-center
                 active:scale-95 transition"
      style={{ left: `${region.mapX}%`, top: `${region.mapY}%` }}
    >
      <div
        className="rounded-full overflow-hidden flex items-center justify-center shadow-soft"
        style={{
          width: size,
          height: size,
          background: "#fff",
          border: "3px solid #fff",
          boxShadow: isMain
            ? `0 0 0 5px ${color.primary}40`
            : "0 4px 10px rgba(0,0,0,0.15)",
        }}
        aria-hidden
      >
        {isMain ? (
          <img
            src="/character1/ganghwa-couple.png"
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <VillageIcon variant={region.variant} size={size} />
        )}
      </div>
      <p
        className="mt-1 px-2 py-0.5 rounded-md bg-white text-[10.5px] font-extrabold whitespace-nowrap"
        style={{ color: color.ink }}
      >
        {region.name.split(" · ")[0]}
        {isMain && count > 0 && (
          <span className="ml-1 text-[10px] opacity-80">· {count}</span>
        )}
      </p>
    </button>
  );
}

// =====================================================================
// 화면 2 — 지역 동네 지도 + 피드 (강화 메인, 다른 지역도 같은 구조)
// =====================================================================
const FILTERS: Array<{ key: PostCategory | null; label: string }> = [
  { key: null, label: "전체" },
  { key: "mission", label: "미션후기" },
  { key: "experience", label: "체험후기" },
  { key: "migration", label: "이주스토리" },
  { key: "place", label: "지역이야기" },
];

function RegionalMapAndFeed({
  regionId,
  allPosts,
  comments,
  onBack,
  onSelectPlace,
  liked,
  onToggleLike,
  onOpenComposer,
  onOpenComments,
  onDeletePost,
}: {
  regionId: string;
  allPosts: MapPost[];
  comments: MapComment[];
  onBack: () => void;
  onSelectPlace: (placeId: string) => void;
  liked: Set<string>;
  onToggleLike: (id: string) => void;
  onOpenComposer: () => void;
  onOpenComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}) {
  const region = communityRegions.find((r) => r.id === regionId);
  const [filter, setFilter] = useState<PostCategory | null>(null);
  // 지도 접기/펼치기 — 기본 펼침. 사용자가 접으면 카드 피드에 집중.
  const [mapExpanded, setMapExpanded] = useState(true);

  const places = useMemo(
    () => communityPlaces.filter((p) => p.regionId === regionId),
    [regionId]
  );
  const placeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of places) m[p.id] = countForPlace(p.id, allPosts);
    return m;
  }, [places, allPosts]);

  const regionPosts = useMemo(
    () => allPosts.filter((p) => p.regionId === regionId),
    [regionId, allPosts]
  );
  const visiblePosts = useMemo(
    () => (filter ? regionPosts.filter((p) => p.category === filter) : regionPosts),
    [regionPosts, filter]
  );

  if (!region) return null;

  return (
    <div className="pb-32">
      {/* 헤더 + 카테고리 탭 한 wrapper sticky — 빈 공간 없이 같이 붙어있게. */}
      <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur pb-1 shadow-[0_8px_12px_-12px_rgba(0,0,0,0.15)]">
        <header className="relative px-5 pt-8 pb-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="전국 지도로"
            className="absolute top-6 left-5 w-9 h-9 rounded-full bg-white shadow-soft
                       flex items-center justify-center text-ink z-10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 6 9 12l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="pl-12">
            {region.id !== "ganghwa" && (
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-ink-mute">
                {region.name.split(" · ")[0]}
              </p>
            )}
            <h1 className={`text-[20px] font-extrabold text-ink leading-tight ${
              region.id === "ganghwa" ? "" : "mt-1"
            }`}>
              {region.id === "ganghwa"
                ? "강화 이야기"
                : `${region.name} 둘러보기`}
            </h1>
            {region.id === "ganghwa" ? (
              <p className="mt-1 text-[12.5px] text-ink-soft">
                머문 사람들의 기록이 모여, 우리가 되는 곳.
              </p>
            ) : (
              places.length === 0 && (
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  이 동네는 곧 체험이 열려요. 먼저 분위기만 만나봐요.
                </p>
              )
            )}
          </div>
        </header>

        {/* 카테고리 탭 — 지도 넣기 전 원래 디자인 (d96d896). 미니멀: 선택 칩만 강조. */}
        <div className="overflow-x-auto no-scrollbar px-5 pb-2">
          <div className="flex gap-1.5 w-max">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={isActive}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] transition active:scale-[0.97]
                    ${
                      isActive
                        ? "bg-primary text-white font-extrabold shadow-soft"
                        : "bg-transparent text-ink-mute font-semibold"
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* === 지역 일러스트 지도 + 장소 핀 — 토글로 접고 펼치기 === */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[11px] font-extrabold text-ink-mute tracking-[0.16em] uppercase">
            {places.length}곳의 장소
          </p>
          <button
            type="button"
            onClick={() => setMapExpanded((v) => !v)}
            className="px-2.5 py-1 rounded-full bg-white border border-cream-200 shadow-soft
                       text-ink-soft text-[11px] font-extrabold active:scale-[0.96]"
          >
            {mapExpanded ? "지도 접기 ▴" : "지도 펼치기 ▾"}
          </button>
        </div>
        {!mapExpanded && null}
        <div
          className="relative rounded-3xl overflow-hidden border border-cream-200 shadow-soft transition-all duration-300"
          style={{
            aspectRatio: "360 / 190",
            background: "#EAF3DE",
            maxHeight: mapExpanded ? 600 : 0,
            opacity: mapExpanded ? 1 : 0,
            marginBottom: mapExpanded ? 0 : -12,
            visibility: mapExpanded ? "visible" : "hidden",
          }}
        >
          {/* 바다 + 갯벌 — 강화 톤 */}
          <div
            className="absolute top-0 left-0 right-0 h-[39%]"
            style={{ background: "#B5D4F4", opacity: 0.5 }}
          />
          <svg
            viewBox="0 0 360 190"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            <path
              d="M0 72 Q90 64 180 74 T360 70 L360 80 Q270 88 180 82 T0 80 Z"
              fill="#85B7EB"
              opacity="0.45"
            />
            <path
              d="M150 120 Q200 112 240 122"
              stroke="#888780"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          </svg>

          {/* 장소 핀 — 크기/농도가 누적 수에 비례 */}
          {places.map((place) => (
            <PlacePin
              key={place.id}
              place={place}
              count={placeCounts[place.id] ?? 0}
              onSelect={() => onSelectPlace(place.id)}
            />
          ))}

          {places.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <p className="text-[12.5px] font-bold text-ink-soft leading-relaxed">
                아직 장소 핀이 없어요.
                <br />
                먼저 다녀온 이야기를 기다리는 중.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* (카테고리 탭은 위 헤더 wrapper 안으로 이동됨) */}

      {/* === 피드 — 큰 카드 + 이미지 형식 === */}
      <section className="px-4 mt-3 space-y-4">
        {visiblePosts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            commentCount={commentsForPost(post.id, comments).length}
            liked={liked.has(post.id)}
            onToggleLike={() => onToggleLike(post.id)}
            onTapPlace={(placeId) => onSelectPlace(placeId)}
            onOpenComments={() => onOpenComments(post.id)}
            onDelete={() => onDeletePost(post.id)}
          />
        ))}

        {visiblePosts.length === 0 && (
          <div className="mt-4 bg-white rounded-2xl px-5 py-8 shadow-soft border border-cream-200 text-center">
            <p className="text-[28px]" aria-hidden>
              📭
            </p>
            <p className="mt-2 text-[12.5px] font-bold text-ink-soft">
              {filter
                ? "이 카테고리의 이야기가 아직 없어요"
                : "이 동네 이야기를 기다리는 중"}
            </p>
          </div>
        )}
      </section>

      {/* === 글쓰기 FAB === */}
      <button
        type="button"
        onClick={onOpenComposer}
        aria-label="새 이야기 쓰기"
        className="fixed bottom-24 right-5 z-30 h-12 px-4 rounded-full bg-primary text-white
                   text-[13px] font-extrabold shadow-[0_10px_24px_-4px_rgba(255,112,67,0.55)]
                   flex items-center gap-1.5 active:scale-95 transition"
      >
        <span aria-hidden className="text-[16px]">✎</span>
        한 줄 쓰기
      </button>
    </div>
  );
}

// 장소 핀 — 크기/색 농도가 누적 수에 비례 (핵심 시각화)
function PlacePin({
  place,
  count,
  onSelect,
}: {
  place: CommunityPlace;
  count: number;
  onSelect: () => void;
}) {
  const size = sizeForCount(count);
  const opacity = opacityForCount(count);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${place.name} (기록 ${count}개)`}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-[3] flex flex-col items-center
                 active:scale-95 transition"
      style={{ left: `${place.mapX}%`, top: `${place.mapY}%` }}
    >
      <div
        className="rounded-full flex items-center justify-center text-white shadow-soft"
        style={{
          width: size,
          height: size,
          background: `rgba(216, 90, 48, ${opacity})`,
          border: "2px solid #fff",
          boxShadow: `0 0 0 ${Math.max(2, count * 0.08)}px rgba(216,90,48,${opacity * 0.3})`,
          fontSize: size * 0.42,
        }}
        aria-hidden
      >
        {place.icon}
      </div>
      <p className="mt-1 px-1.5 py-0.5 rounded-md bg-white text-[9.5px] font-extrabold tabular-nums whitespace-nowrap text-ink">
        {place.name} · {count}
      </p>
    </button>
  );
}

// =====================================================================
// 피드 카드 — 기존 인스타식 큰 카드 + 히어로 이미지 형식 (사용자 피드백)
// =====================================================================
function FeedCard({
  post,
  commentCount,
  liked,
  onToggleLike,
  onTapPlace,
  onOpenComments,
  onDelete,
}: {
  post: MapPost;
  commentCount: number;
  liked: boolean;
  onToggleLike: () => void;
  onTapPlace: (placeId: string) => void;
  onOpenComments: () => void;
  onDelete: () => void;
}) {
  const place = post.placeId
    ? communityPlaces.find((p) => p.id === post.placeId)
    : null;
  const displayLikes = post.likes + (liked ? 1 : 0);
  const isLocal = post.authorType === "local";
  // 사용자 첨부 이미지 우선, 없으면 키워드 매칭. 첨부도 없고 매칭도 없으면 폴백 community_05.
  const heroImage = useMemo(
    () => post.imageDataUrl ?? pickImageForPost(post.body, place?.name),
    [post.imageDataUrl, post.body, place?.name]
  );
  const avatarBg = avatarColor(post.nickname);
  // 내가 올린 글인지 — id 가 "user-" 로 시작하면 true.
  const isMine = post.id.startsWith("user-");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="bg-white rounded-[24px] shadow-soft border border-cream-200/80 overflow-hidden">
      {/* 프로필 줄 */}
      <header className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center
                     text-ink text-[13px] font-extrabold shrink-0
                     ring-2 ring-white shadow-soft"
          style={{ backgroundColor: avatarBg }}
          aria-hidden
        >
          {post.nickname.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ink text-[14px] font-extrabold leading-tight truncate">
            {post.nickname}
          </p>
          <p className="text-[10.5px] text-ink-mute mt-0.5 tracking-wider uppercase">
            {CATEGORY_LABEL[post.category]} ·{" "}
            {isLocal ? "맞이하는 사람" : "찾아온 사람"}
          </p>
        </div>
        {/* 내가 올린 글에만 ⋯ → 삭제 메뉴 노출. 아니면 점만 표시. */}
        <div className="relative">
          <button
            type="button"
            aria-label={isMine ? "내 글 메뉴" : "더보기"}
            onClick={() => isMine && setMenuOpen((v) => !v)}
            className="text-ink-mute text-[20px] leading-none px-2 py-1 active:scale-[0.94]"
          >
            ⋯
          </button>
          {isMine && menuOpen && (
            <>
              {/* 바깥 탭으로 닫기 */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <div
                className="absolute right-0 top-full mt-1 z-40 min-w-[120px]
                           bg-white rounded-xl shadow-soft border border-cream-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm("이 글을 삭제할까요?\n삭제하면 되돌릴 수 없어요.")) {
                      onDelete();
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-[13px] font-extrabold text-[#E25C46] active:bg-cream-50"
                >
                  글 삭제하기
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 히어로 이미지 + 우상단 장소/지역 핀 */}
      <div className="mx-3 relative">
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-cream-200">
          <img
            src={heroImage}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {place && (
          <button
            type="button"
            onClick={() => onTapPlace(place.id)}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full
                       bg-white/95 backdrop-blur text-ink text-[10.5px] font-extrabold
                       shadow-soft border border-white/70 active:scale-[0.97]"
          >
            📍 {place.name}
          </button>
        )}
      </div>

      {/* 카테고리 칩 + 본문 */}
      <div className="px-4 pt-3.5 pb-1">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide"
          style={{
            background: CATEGORY_BG[post.category],
            color: CATEGORY_TEXT[post.category],
          }}
        >
          <CategoryDot category={post.category} />
          {CATEGORY_LABEL[post.category]}
        </span>
        <p className="mt-2.5 text-ink text-[14.5px] leading-[1.65] whitespace-pre-line">
          {post.body}
        </p>
      </div>

      {/* 액션 바 — ♡ N */}
      <div className="px-3 pt-3 pb-4 mt-1 border-t border-cream-200/70 flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className="px-2 py-1.5 flex items-center gap-1.5 active:scale-[0.92] transition"
        >
          <span aria-hidden className="text-[18px] leading-none">
            {liked ? "❤️" : "🤍"}
          </span>
          <span className="text-[12.5px] font-extrabold text-ink-soft tabular-nums">
            {displayLikes}
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenComments}
          className="px-2 py-1.5 flex items-center gap-1.5 active:scale-[0.92] transition"
          aria-label="댓글 보기/쓰기"
        >
          <span className="text-ink-mute text-[16px]">💬</span>
          <span className="text-ink-mute text-[12.5px] font-extrabold tabular-nums">
            {commentCount + Math.max(2, Math.floor(post.likes / 8))}
          </span>
        </button>
        <button
          type="button"
          aria-label="저장"
          className="ml-auto p-2 active:scale-[0.94] text-ink-mute text-[16px]"
        >
          🔖
        </button>
      </div>
    </article>
  );
}

const CATEGORY_BG: Record<PostCategory, string> = {
  mission:    "#FFEFE8",
  experience: "#E6F5DE",
  migration:  "#FFF1D9",
  place:      "#E6EFF5",
};
const CATEGORY_TEXT: Record<PostCategory, string> = {
  mission:    "#B5390F",
  experience: "#3E7126",
  migration:  "#8C6213",
  place:      "#3C627D",
};

function CategoryDot({ category }: { category: PostCategory }) {
  const color: Record<PostCategory, string> = {
    mission: "#FF7043",
    experience: "#7FB069",
    migration: "#D9A93B",
    place: "#5E8FA8",
  };
  return (
    <span
      aria-hidden
      className="inline-block w-1.5 h-1.5 rounded-full mr-1"
      style={{ background: color[category] }}
    />
  );
}

// =====================================================================
// 화면 3 — 핀(장소) 상세 바텀시트
// =====================================================================
function PlaceDetailSheet({
  regionId,
  placeId,
  allPosts,
  comments,
  onClose,
  liked,
  onToggleLike,
  onOpenComments,
  onDeletePost,
}: {
  regionId: string;
  placeId: string;
  allPosts: MapPost[];
  comments: MapComment[];
  onClose: () => void;
  liked: Set<string>;
  onToggleLike: (id: string) => void;
  onOpenComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}) {
  const place = communityPlaces.find((p) => p.id === placeId);
  const posts = useMemo(
    () =>
      allPosts.filter(
        (p) => p.regionId === regionId && p.placeId === placeId
      ),
    [regionId, placeId, allPosts]
  );
  if (!place) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/45"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-cream rounded-t-3xl px-5 pt-5
                   pb-[calc(var(--content-bottom)+1rem)]
                   max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-[22px] shrink-0
                       text-white shadow-soft"
            style={{ background: "rgba(216,90,48,0.9)", border: "2px solid #fff" }}
            aria-hidden
          >
            {place.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ink text-[16px] font-extrabold leading-tight">
              {place.name}
            </p>
            <p className="text-ink-soft text-[11.5px] font-bold">
              여기 쌓인 기록 {posts.length}개
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full bg-white text-ink-soft text-[14px] font-bold shadow-soft"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              commentCount={commentsForPost(post.id, comments).length}
              liked={liked.has(post.id)}
              onToggleLike={() => onToggleLike(post.id)}
              onTapPlace={() => {
                /* 이미 핀 상세니 무시 */
              }}
              onOpenComments={() => onOpenComments(post.id)}
              onDelete={() => onDeletePost(post.id)}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-center text-ink-soft text-[12.5px] py-6">
              이 장소에 쌓인 기록이 아직 없어요.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// 글쓰기 모달 — 한 줄 기록 작성
// =====================================================================
function ComposerSheet({
  regionId,
  nickname,
  onClose,
  onSubmit,
}: {
  regionId: string;
  nickname: string;
  onClose: () => void;
  onSubmit: (draft: {
    regionId: string;
    placeId?: string;
    category: MapPost["category"];
    nickname: string;
    body: string;
    imageDataUrl?: string;
  }) => void;
}) {
  const region = communityRegions.find((r) => r.id === regionId);
  const places = communityPlaces.filter((p) => p.regionId === regionId);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<MapPost["category"]>("mission");
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  // 이미지 첨부 (선택). FileReader → data URL.
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 너무 큰 이미지는 거부 (5MB 이상)
    if (file.size > 5 * 1024 * 1024) {
      window.alert("이미지가 너무 커요. 5MB 이하로 골라주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit = body.trim().length >= 5;
  const CATEGORIES: MapPost["category"][] = ["mission", "experience", "migration", "place"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-t-3xl px-5 pt-5
                   pb-[calc(var(--content-bottom)+1rem)]
                   max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10.5px] font-extrabold text-primary tracking-[0.18em] uppercase">
              {region?.name.split(" · ")[0] ?? ""}
            </p>
            <h2 className="text-ink text-[18px] font-extrabold leading-tight mt-0.5">
              한 줄 기록 남기기
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full bg-cream-100 text-ink-soft text-[14px] font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* 닉네임은 프로필에서 자동으로 들어감 — 이름 입력 칸 제거 (사용자 피드백). */}
          <div>
            <label className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase block mb-1">
              종류
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCategory(k)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition
                    ${
                      category === k
                        ? "bg-primary text-white shadow-soft"
                        : "bg-cream-100 text-ink-soft"
                    }`}
                >
                  {CATEGORY_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          {places.length > 0 && (
            <div>
              <label className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase block mb-1">
                장소 (선택)
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPlaceId(undefined)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition
                    ${
                      placeId === undefined
                        ? "bg-ink text-white"
                        : "bg-cream-100 text-ink-soft"
                    }`}
                >
                  동네 전체
                </button>
                {places.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlaceId(p.id)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-extrabold transition
                      ${
                        placeId === p.id
                          ? "bg-primary text-white shadow-soft"
                          : "bg-cream-100 text-ink-soft"
                      }`}
                  >
                    📍 {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase block mb-1">
              이야기
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="머문 자리에서 본 풍경, 만난 사람, 한 줄 기록…"
              className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-[13.5px] leading-relaxed focus:outline-none focus:border-primary resize-none"
            />
            <p className="mt-1 text-right text-[10.5px] text-ink-mute">
              {body.trim().length} / 5+ 글자
            </p>
          </div>

          {/* 이미지 첨부 (선택) */}
          <div>
            <label className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase block mb-1">
              사진 (선택)
            </label>
            {imageDataUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-cream-200 bg-cream-50">
                <img
                  src={imageDataUrl}
                  alt="첨부 사진"
                  className="w-full max-h-[200px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageDataUrl(undefined)}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-full
                             bg-white/95 border border-cream-200 text-ink-soft text-[11px] font-extrabold shadow-soft"
                >
                  사진 빼기
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 py-3 rounded-xl
                                border border-dashed border-cream-300 bg-cream-50
                                text-ink-soft text-[12.5px] font-bold cursor-pointer active:bg-cream-100">
                <span aria-hidden>📷</span>
                사진 한 장 골라 올리기
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            canSubmit &&
            onSubmit({
              regionId,
              placeId,
              category,
              nickname,
              body: body.trim(),
              imageDataUrl,
            })
          }
          className={`mt-4 w-full h-12 rounded-full text-[14px] font-extrabold transition
            ${
              canSubmit
                ? "bg-primary text-white shadow-[0_8px_20px_-4px_rgba(255,112,67,0.55)] active:scale-[0.98]"
                : "bg-cream-200 text-ink-mute cursor-not-allowed"
            }`}
        >
          이야기 올리기
        </button>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// 댓글 모달 — 한 글의 댓글 보기 + 작성
// =====================================================================
function CommentsSheet({
  postId,
  post,
  comments,
  onClose,
  onSubmit,
}: {
  postId: string;
  post: MapPost | undefined;
  comments: MapComment[];
  onClose: () => void;
  onSubmit: (nickname: string, body: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const canSubmit = nickname.trim() && body.trim().length >= 1;
  void postId; // 인자 표시 — onSubmit 안에서 부모가 알아서 처리

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-t-3xl px-5 pt-5
                   max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-ink text-[16px] font-extrabold">
            댓글 {comments.length}개
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full bg-cream-100 text-ink-soft text-[14px] font-bold"
          >
            ✕
          </button>
        </div>

        {/* 원글 미리보기 */}
        {post && (
          <div className="bg-cream-50 rounded-xl border border-cream-200 px-3 py-2.5 mb-3">
            <p className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase">
              {post.nickname}
            </p>
            <p className="mt-1 text-ink text-[12.5px] leading-snug line-clamp-2">
              {post.body}
            </p>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pb-3">
          {comments.length === 0 ? (
            <p className="text-center text-ink-soft text-[12.5px] py-6">
              첫 댓글을 남겨봐요
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             text-ink text-[11px] font-extrabold shrink-0
                             ring-2 ring-white shadow-soft"
                  style={{ background: avatarColor(c.nickname) }}
                  aria-hidden
                >
                  {c.nickname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[12.5px] font-extrabold leading-tight">
                    {c.nickname}
                  </p>
                  <p className="mt-0.5 text-ink text-[13px] leading-relaxed whitespace-pre-line">
                    {c.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 작성 input — 하단 고정. 하단 탭바에 가리지 않게 nav 높이만큼 띄움. */}
        <div className="border-t border-cream-200 pt-3 pb-[calc(var(--content-bottom)+1rem)] space-y-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="이름 (예: 느린바람)"
            maxLength={20}
            className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-[13px] focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="댓글 한 줄 남기기"
              className="flex-1 px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-[13px] focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                onSubmit(nickname.trim(), body.trim());
                setBody("");
              }}
              className={`px-4 rounded-xl text-[13px] font-extrabold transition active:scale-[0.97]
                ${
                  canSubmit
                    ? "bg-primary text-white shadow-soft"
                    : "bg-cream-200 text-ink-mute cursor-not-allowed"
                }`}
            >
              올리기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
