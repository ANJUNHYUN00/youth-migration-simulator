// 미션1: 병원 가보기 — 톱다운 2D 마을 생활 시뮬레이션
// 사용자가 가상의 거제 마을 위에서 캐릭터를 직접 조종(WASD/방향키 or 모바일 D-pad)하며 이동.
// 카메라가 캐릭터를 따라가고, 미션 포인트에 근접하면 이벤트 카드가 자동으로 뜬다.
// 외부 지도 API 없이 모든 데이터는 mock data로 작성. 단일 파일 프리뷰.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =====================================================================
// 상수
// =====================================================================

const MAP_W = 900; // 가상 마을 맵 크기
const MAP_H = 700;
const PROXIMITY = 70; // 이벤트 발생 거리 (px)
const PLAYER_SPEED = 0.18; // px/ms (≈ 180px/s)
const PLAYER_HALF = 18; // 캐릭터 클램핑 마진

const REGION = "거제";
const SCREEN_TITLE = "오늘 하루 살아보기";
const MISSION_TEXT = "몸이 조금 안 좋은 날, 근처 병원까지 걸어가보세요.";

// =====================================================================
// 타입
// =====================================================================

type Vec = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type PointType = "place" | "question" | "npc" | "choice" | "complete";

type MissionPoint = {
  id: string;
  name: string;
  type: PointType;
  position: Vec;
  title: string;
  description?: string;
  info?: string[];
  question?: string;
  options?: string[];
  result?: string[];
  dialogue?: string;
  replies?: Record<string, string>;
  progress: number;
  icon: string;
};

// =====================================================================
// 미션 데이터 (PRD 명세 mock data)
// =====================================================================

const missionPoints: MissionPoint[] = [
  {
    id: "residence",
    name: "레지던스",
    type: "place",
    position: { x: 120, y: 520 },
    title: "레지던스에서 출발",
    description:
      "오늘은 몸이 조금 무거운 날이에요. 가장 가까운 병원까지 직접 걸어가봅니다.",
    info: ["예상 도보 시간 12분", "실제 거리 850m"],
    progress: 0,
    icon: "🏡",
  },
  {
    id: "alley",
    name: "조용한 골목",
    type: "question",
    position: { x: 260, y: 430 },
    title: "조용한 골목",
    description:
      "차 소리가 거의 들리지 않는 골목입니다. 낮에는 평화롭지만 밤에는 조금 어둡게 느껴질 수 있어요.",
    question: "혼자 걷기에 괜찮다고 느껴지나요?",
    options: ["괜찮다", "조금 불안하다"],
    progress: 20,
    icon: "🌿",
  },
  {
    id: "hill",
    name: "언덕길",
    type: "place",
    position: { x: 420, y: 350 },
    title: "언덕길",
    description:
      "병원으로 가는 길에 짧은 언덕이 있습니다. 몸이 좋지 않은 날에는 조금 부담될 수 있어요.",
    info: ["경사도 높음", "도보 난이도 중상"],
    progress: 35,
    icon: "⛰️",
  },
  {
    id: "resident",
    name: "동네 주민",
    type: "npc",
    position: { x: 500, y: 300 },
    title: "동네 주민을 만났어요",
    dialogue:
      "처음 오셨어요? 이 길로 쭉 가면 병원이 나와요. 약국도 바로 옆에 있고요.",
    options: ["감사합니다", "병원이 자주 붐비나요?", "버스도 있나요?"],
    replies: {
      감사합니다: "천천히 가세요. 언덕길만 지나면 금방이에요.",
      "병원이 자주 붐비나요?":
        "오전에는 어르신들이 많고, 오후에는 조금 한산한 편이에요.",
      "버스도 있나요?":
        "있긴 한데 배차 간격이 길어서 급할 땐 걸어가는 게 나을 때도 있어요.",
    },
    progress: 50,
    icon: "👵",
  },
  {
    id: "bus-stop",
    name: "버스 정류장",
    type: "choice",
    position: { x: 560, y: 410 },
    title: "버스 정류장",
    description:
      "걷기 힘들 때 이용할 수 있는 버스 정류장이 있습니다. 다만 배차 간격은 긴 편이에요.",
    info: ["평균 배차 간격 35분"],
    question: "몸이 좋지 않은 날, 어떻게 이동하고 싶나요?",
    options: ["걸어서 계속 가기", "버스를 기다린다고 상상하기"],
    progress: 65,
    icon: "🚏",
  },
  {
    id: "pharmacy",
    name: "약국",
    type: "place",
    position: { x: 680, y: 280 },
    title: "약국 앞",
    description:
      "병원 근처 약국에 도착했습니다. 진료 후 바로 약을 받을 수 있어 생활 편의성이 좋습니다.",
    info: ["병원까지 2분 남음"],
    progress: 80,
    icon: "💊",
  },
  {
    id: "hospital",
    name: "병원",
    type: "complete",
    position: { x: 760, y: 180 },
    title: "병원 도착",
    description: "레지던스에서 병원까지 직접 걸어와봤습니다.",
    result: [
      "총 이동 시간 12분",
      "실제 거리 850m",
      "도보 난이도 중간",
      "주변 인프라: 약국, 버스 정류장 있음",
    ],
    question: "몸이 안 좋은 날에도 이 정도 거리라면 병원에 갈 수 있을 것 같나요?",
    options: ["충분히 가능하다", "조금 부담된다", "어렵다"],
    progress: 100,
    icon: "🏥",
  },
];

// 도로 곡선 — 모든 포인트를 순서대로 잇는 부드러운 경로
const ROAD_PATH =
  "M 120 520 Q 180 480 260 430 Q 340 390 420 350 Q 460 320 500 300 Q 535 350 560 410 Q 620 350 680 280 Q 720 230 760 180";

// 장식용 나무 좌표
const TREES: Vec[] = [
  { x: 60, y: 200 }, { x: 90, y: 260 }, { x: 200, y: 200 }, { x: 320, y: 240 },
  { x: 280, y: 540 }, { x: 360, y: 470 }, { x: 50, y: 440 }, { x: 80, y: 580 },
  { x: 150, y: 620 }, { x: 530, y: 200 }, { x: 600, y: 480 }, { x: 470, y: 480 },
  { x: 720, y: 470 }, { x: 820, y: 350 }, { x: 850, y: 240 }, { x: 660, y: 130 },
  { x: 550, y: 130 }, { x: 380, y: 120 }, { x: 220, y: 350 }, { x: 380, y: 600 },
  { x: 480, y: 580 }, { x: 660, y: 540 }, { x: 760, y: 80 }, { x: 850, y: 130 },
];

// 장식용 작은 집 (포인트가 아닌 곳)
const HOUSES: { pos: Vec; tone: string }[] = [
  { pos: { x: 200, y: 150 }, tone: "#E2CCAA" },
  { pos: { x: 380, y: 180 }, tone: "#D8C0A0" },
  { pos: { x: 600, y: 160 }, tone: "#E8D5B7" },
  { pos: { x: 120, y: 380 }, tone: "#D8C0A0" },
  { pos: { x: 320, y: 540 }, tone: "#E2CCAA" },
  { pos: { x: 440, y: 530 }, tone: "#E8D5B7" },
  { pos: { x: 660, y: 470 }, tone: "#D8C0A0" },
  { pos: { x: 820, y: 480 }, tone: "#E2CCAA" },
];

// =====================================================================
// 헬퍼
// =====================================================================

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// =====================================================================
// MapBackground — 마을 한 장면 (정적 SVG, 카메라 transform 안에서 렌더)
// =====================================================================

function MapBackground() {
  return (
    <svg
      width={MAP_W}
      height={MAP_H}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="block"
      aria-hidden
    >
      <defs>
        <linearGradient id="seaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#B8D4E8" />
          <stop offset="1" stopColor="#88B6D2" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#DDEBC8" />
          <stop offset="1" stopColor="#C8DDA8" />
        </linearGradient>
        <pattern
          id="grassDots"
          patternUnits="userSpaceOnUse"
          width="40"
          height="40"
        >
          <circle cx="6" cy="8" r="0.8" fill="#9CBA86" opacity="0.4" />
          <circle cx="24" cy="20" r="0.6" fill="#9CBA86" opacity="0.4" />
          <circle cx="14" cy="32" r="0.7" fill="#9CBA86" opacity="0.4" />
        </pattern>
        <radialGradient id="hillGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#B8D5A0" />
          <stop offset="1" stopColor="#B8D5A0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 잔디 베이스 + 점 패턴 */}
      <rect width={MAP_W} height={MAP_H} fill="url(#grassGrad)" />
      <rect width={MAP_W} height={MAP_H} fill="url(#grassDots)" />

      {/* 바다 (남쪽 가장자리, 거제스러운 바닷가 느낌) */}
      <path
        d={`M 0 600 Q 220 580 400 615 Q 580 645 ${MAP_W} 625 L ${MAP_W} ${MAP_H} L 0 ${MAP_H} Z`}
        fill="url(#seaGrad)"
      />
      {/* 모래사장 */}
      <path
        d={`M 0 590 Q 220 570 400 605 Q 580 635 ${MAP_W} 615 L ${MAP_W} 625 Q 580 645 400 615 Q 220 580 0 600 Z`}
        fill="#F4E5C0"
        opacity="0.7"
      />
      {/* 파도 디테일 */}
      <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.55" fill="none">
        <path d="M 80 650 Q 130 645 180 650" />
        <path d="M 280 670 Q 330 665 380 670" />
        <path d="M 480 660 Q 530 655 580 660" />
        <path d="M 680 680 Q 730 675 780 680" />
      </g>

      {/* 언덕 영역 — hill point 부근 살짝 더 진한 초록 */}
      <ellipse cx="430" cy="320" rx="200" ry="80" fill="url(#hillGrad)" />

      {/* 도로 (베이지 굵은 선) */}
      <path
        d={ROAD_PATH}
        stroke="#D6C49E"
        strokeWidth="46"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d={ROAD_PATH}
        stroke="#EBD9B5"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={ROAD_PATH}
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="12 16"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* 장식용 작은 집들 */}
      {HOUSES.map((h, i) => (
        <g key={`h-${i}`} transform={`translate(${h.pos.x} ${h.pos.y})`}>
          <ellipse cx="0" cy="22" rx="22" ry="3" fill="#000" opacity="0.12" />
          <rect x="-18" y="-2" width="36" height="22" fill={h.tone} />
          <path d="M -22 -2 L 0 -18 L 22 -2 Z" fill="#7B5640" />
          <rect x="-10" y="6" width="6" height="8" fill="#5A4630" />
          <rect x="4" y="6" width="6" height="8" fill="#5A4630" />
          <rect x="-12" y="-4" width="24" height="2" fill="#5A3D2A" opacity="0.6" />
        </g>
      ))}

      {/* 레지던스 (큰 한옥) */}
      <g transform="translate(120 520)">
        <ellipse cx="0" cy="38" rx="44" ry="5" fill="#000" opacity="0.15" />
        <rect x="-38" y="-10" width="76" height="48" fill="#EEDDC0" />
        <path d="M -44 -10 L 0 -42 L 44 -10 Z" fill="#7B5640" />
        <path d="M -44 -12 L 44 -12 L 44 -8 L -44 -8 Z" fill="#5A3D2A" />
        <rect x="-26" y="2" width="14" height="14" fill="#5A4630" />
        <rect x="-25" y="3" width="12" height="12" fill="#8B7456" />
        <rect x="12" y="2" width="14" height="14" fill="#5A4630" />
        <rect x="13" y="3" width="12" height="12" fill="#8B7456" />
        <rect x="-7" y="14" width="14" height="24" fill="#5A4630" />
        <rect x="-6" y="15" width="12" height="22" fill="#7B5640" />
        <circle cx="3" cy="27" r="1" fill="#FFC53D" />
        {/* 명패 */}
        <rect x="-12" y="-6" width="24" height="4" fill="#FFFFFF" />
        <text
          x="0"
          y="-3"
          fontSize="3"
          fill="#3E2C20"
          textAnchor="middle"
          fontWeight="bold"
        >
          바람을 짓다 레지던스
        </text>
      </g>

      {/* 골목 입구 표시 (alley) */}
      <g transform="translate(260 430)">
        {/* 양쪽 담장 작게 */}
        <rect x="-32" y="-18" width="14" height="26" fill="#D8C0A0" />
        <rect x="18" y="-18" width="14" height="26" fill="#D8C0A0" />
        <path d="M -32 -18 L -18 -18 L -18 -16 L -32 -16 Z" fill="#7B5640" />
        <path d="M 18 -18 L 32 -18 L 32 -16 L 18 -16 Z" fill="#7B5640" />
        {/* 가로등 */}
        <rect x="0" y="-22" width="1.5" height="14" fill="#5A4630" />
        <circle cx="0.75" cy="-22" r="3" fill="#FFE5C8" />
      </g>

      {/* 언덕 표시 (hill) */}
      <g transform="translate(420 350)">
        {/* 봉우리 */}
        <path d="M -50 14 L -20 -22 L 10 -8 L 40 -28 L 60 14 Z" fill="#9CBC85" />
        <path d="M -20 -22 L 10 -8 L -2 -10 Z" fill="#7BA86F" />
        <path d="M 40 -28 L 60 14 L 28 -6 Z" fill="#7BA86F" />
        {/* 경사 표지판 */}
        <rect x="22" y="-2" width="2" height="22" fill="#5A4630" />
        <path d="M 12 -10 L 36 -10 L 32 0 L 16 0 Z" fill="#FFC53D" />
        <text
          x="24"
          y="-3"
          fontSize="3.5"
          fill="#5A4630"
          textAnchor="middle"
          fontWeight="bold"
        >
          경사
        </text>
      </g>

      {/* 버스 정류장 (bus-stop) */}
      <g transform="translate(560 410)">
        <ellipse cx="0" cy="22" rx="26" ry="3" fill="#000" opacity="0.15" />
        {/* 지붕 */}
        <rect x="-22" y="-22" width="44" height="4" fill="#5A4630" />
        <path d="M -22 -22 L -18 -26 L 18 -26 L 22 -22 Z" fill="#7B5640" />
        {/* 기둥 */}
        <rect x="-21" y="-18" width="2" height="40" fill="#5A5D60" />
        <rect x="19" y="-18" width="2" height="40" fill="#5A5D60" />
        {/* 시간표 */}
        <rect x="-17" y="-15" width="30" height="20" fill="#FFFFFF" />
        <rect x="-16" y="-14" width="28" height="3" fill="#5A4630" />
        <text
          x="-2"
          y="-11.5"
          fontSize="2"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          시간표
        </text>
        <path
          d="M -15 -9 L 11 -9 M -15 -6 L 11 -6 M -15 -3 L 11 -3 M -15 0 L 11 0"
          stroke="#9A8778"
          strokeWidth="0.3"
        />
        {/* 벤치 */}
        <rect x="-19" y="8" width="38" height="3" fill="#7B5640" />
        {/* B 사인 */}
        <circle cx="0" cy="-32" r="7" fill="#7BB57F" />
        <text
          x="0"
          y="-29.5"
          fontSize="6"
          fill="#FFFFFF"
          textAnchor="middle"
          fontWeight="bold"
        >
          B
        </text>
      </g>

      {/* 약국 (pharmacy) */}
      <g transform="translate(680 280)">
        <ellipse cx="0" cy="32" rx="46" ry="4" fill="#000" opacity="0.15" />
        <rect x="-38" y="-26" width="76" height="58" fill="#F8F2E4" />
        {/* 천막 */}
        <path d="M -40 -2 L 40 -2 L 36 8 L -36 8 Z" fill="#7BB57F" />
        <path
          d="M -40 -2 L 40 -2 L 40 0 L -40 0 Z"
          fill="#5A8E5E"
        />
        <path
          d="M -32 4 L -28 8 M -20 4 L -16 8 M -8 4 L -4 8 M 4 4 L 8 8 M 16 4 L 20 8 M 28 4 L 32 8"
          stroke="#5A8E5E"
          strokeWidth="0.4"
        />
        {/* 간판 (녹색 십자) */}
        <rect x="-12" y="-22" width="24" height="20" fill="#FFFFFF" />
        <rect x="-3" y="-20" width="6" height="16" fill="#5A8E5E" />
        <rect x="-9" y="-14" width="18" height="6" fill="#5A8E5E" />
        {/* 글자 */}
        <text
          x="0"
          y="14"
          fontSize="4"
          fill="#5A4630"
          textAnchor="middle"
          fontWeight="bold"
        >
          약국
        </text>
        {/* 유리문 */}
        <rect x="-22" y="14" width="18" height="18" fill="#A4C8DE" opacity="0.7" />
        <rect x="4" y="14" width="18" height="18" fill="#A4C8DE" opacity="0.7" />
        <path
          d="M -13 14 L -13 32 M 13 14 L 13 32"
          stroke="#7B5640"
          strokeWidth="0.4"
        />
      </g>

      {/* 병원 (hospital) — 가장 크게 */}
      <g transform="translate(760 180)">
        <ellipse cx="0" cy="44" rx="62" ry="5" fill="#000" opacity="0.15" />
        <rect x="-54" y="-44" width="108" height="88" fill="#F4F4F4" />
        <rect x="-56" y="-46" width="112" height="4" fill="#E0E0E0" />
        {/* 빨간 십자 */}
        <rect x="-14" y="-36" width="28" height="22" fill="#FFFFFF" />
        <rect x="-4" y="-34" width="8" height="18" fill="#E55A30" />
        <rect x="-12" y="-29" width="24" height="8" fill="#E55A30" />
        {/* 글자 */}
        <text
          x="0"
          y="-8"
          fontSize="5"
          fill="#3E2C20"
          textAnchor="middle"
          fontWeight="bold"
        >
          병원
        </text>
        {/* 창문 */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`hw-${row}-${col}`}
              x={-44 + col * 24}
              y={-2 + row * 12}
              width="16"
              height="7"
              fill="#A4C8DE"
              opacity="0.7"
            />
          ))
        )}
        {/* 입구 */}
        <rect x="-10" y="28" width="20" height="16" fill="#7B5640" />
        <path d="M 0 28 L 0 44" stroke="#5A4630" strokeWidth="0.5" />
        <rect x="-14" y="25" width="28" height="3" fill="#A8D5A8" />
      </g>

      {/* 나무들 */}
      {TREES.map((t, i) => (
        <g key={`t-${i}`} transform={`translate(${t.x} ${t.y})`}>
          <ellipse cx="2" cy="9" rx="11" ry="2.5" fill="#000" opacity="0.18" />
          <rect x="-1" y="-2" width="3" height="10" fill="#7B5640" />
          <circle r="14" fill="#7BA86F" />
          <circle cx="-5" cy="-3" r="9" fill="#A0C690" />
          <circle cx="5" cy="2" r="7" fill="#8DBA7A" />
        </g>
      ))}
    </svg>
  );
}

// =====================================================================
// PointMarker — 미션 포인트 위치 아이콘 (클릭 시 카드 재오픈)
// =====================================================================

function PointMarker({
  point,
  visited,
  isActive,
  onClick,
}: {
  point: MissionPoint;
  visited: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center
                 pointer-events-auto focus:outline-none"
      style={{ left: point.position.x, top: point.position.y - 28 }}
      aria-label={`${point.name} 이벤트`}
    >
      <span
        className={`relative inline-flex items-center justify-center
          w-8 h-8 rounded-full shadow-md transition
          ${
            isActive
              ? "bg-[#FF7043] ring-2 ring-white scale-110"
              : visited
              ? "bg-white"
              : "bg-white"
          }`}
      >
        <span className="text-base" aria-hidden>
          {point.icon}
        </span>
        {!visited && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#FF7043]/35"
            animate={{ scale: [1, 1.7, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            aria-hidden
          />
        )}
        {visited && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#7BB57F] border border-white flex items-center justify-center text-[7px] text-white font-extrabold">
            ✓
          </span>
        )}
      </span>
      <span
        className={`mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold leading-none whitespace-nowrap
          ${
            isActive
              ? "bg-[#FF7043] text-white"
              : "bg-white/95 text-[#5A4630] shadow-sm"
          }`}
      >
        {point.name}
      </span>
    </button>
  );
}

// =====================================================================
// NPCFigure — 동네 주민 캐릭터 (톱다운, NPC 좌표 위에 서 있음)
// =====================================================================

function NPCFigure({
  point,
  visited,
  isActive,
  onClick,
}: {
  point: MissionPoint;
  visited: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto focus:outline-none"
      style={{ left: point.position.x, top: point.position.y }}
      aria-label="동네 주민과 대화"
    >
      <svg width="40" height="48" viewBox="0 0 40 48" aria-hidden>
        <ellipse cx="20" cy="44" rx="12" ry="2.5" fill="#000" opacity="0.22" />
        {/* 다리 */}
        <rect x="16" y="34" width="3" height="9" fill="#5A4630" rx="0.5" />
        <rect x="21" y="34" width="3" height="9" fill="#5A4630" rx="0.5" />
        {/* 한복 */}
        <ellipse cx="20" cy="28" rx="11" ry="8" fill="#E2D8C2" />
        <rect x="13" y="20" width="14" height="14" fill="#E2D8C2" rx="2" />
        {/* 머리 */}
        <circle cx="20" cy="14" r="7" fill="#F2D6B6" />
        {/* 흰머리 */}
        <path
          d="M 13 13 Q 13 6 20 6 Q 27 6 27 13 Q 23 10 20 10 Q 17 10 13 13 Z"
          fill="#F0F0F0"
        />
        {/* 눈 */}
        <circle cx="17.5" cy="14" r="0.8" fill="#3E2C20" />
        <circle cx="22.5" cy="14" r="0.8" fill="#3E2C20" />
        {/* 입 */}
        <path
          d="M 18 17 Q 20 18 22 17"
          stroke="#3E2C20"
          strokeWidth="0.6"
          fill="none"
        />
        {/* 지팡이 */}
        <line x1="29" y1="20" x2="33" y2="44" stroke="#7B5640" strokeWidth="1.2" />
      </svg>

      {/* 말풍선 아이콘 (방문 전) */}
      {!visited && (
        <motion.span
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full
                     bg-white text-[10px] font-extrabold text-[#FF7043] shadow-md"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          💬
        </motion.span>
      )}
      {/* 활성 강조 링 */}
      {isActive && (
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14
                     rounded-full ring-2 ring-[#FF7043] ring-offset-2 ring-offset-transparent"
          aria-hidden
        />
      )}
      {/* 이름 칩 */}
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 px-1.5 py-0.5 rounded-md
                       bg-white/95 text-[#5A4630] text-[10px] font-extrabold whitespace-nowrap shadow-sm">
        {point.name}
      </span>
    </button>
  );
}

// =====================================================================
// PlayerSprite — 톱다운 봇짐 캐릭터 (방향에 따라 회전, 걷는 중 까닥임)
// =====================================================================

function PlayerSprite({
  direction,
  moving,
}: {
  direction: Direction;
  moving: boolean;
}) {
  // 기본 스프라이트는 "down" (아래쪽) 방향을 본다. 회전으로 다른 방향 표현.
  const rotation = {
    down: 0,
    left: 90,
    up: 180,
    right: 270,
  }[direction];

  return (
    <motion.div
      animate={{ rotate: rotation }}
      transition={{ type: "spring", damping: 18, stiffness: 250 }}
      className="pointer-events-none"
      style={{ transformOrigin: "50% 50%" }}
    >
      <motion.div
        animate={moving ? { y: [-1.5, 0.5, -1.5] } : { y: 0 }}
        transition={
          moving
            ? { duration: 0.36, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        <svg width="40" height="40" viewBox="-20 -20 40 40" aria-hidden>
          {/* 그림자 */}
          <ellipse cx="0" cy="14" rx="12" ry="3" fill="#000" opacity="0.22" />
          {/* 몸통 (초록 카프탄, 톱다운에서 약간 타원) */}
          <ellipse cx="0" cy="2" rx="11" ry="10" fill="#A8D5A8" />
          {/* 봇짐 (오렌지, 등에 매달림 - 위쪽에 더 진하게) */}
          <ellipse cx="0" cy="-2" rx="9" ry="7" fill="#F4A261" />
          <path
            d="M -6 -4 Q 0 -8 6 -4 L 4 -2 Q 0 -3 -4 -2 Z"
            fill="#E76F51"
          />
          <path
            d="M -7 -2 L 7 -2 M -6 1 L 6 1"
            stroke="#E76F51"
            strokeWidth="0.4"
            opacity="0.5"
          />
          {/* 머리 (위에서 본 정수리) */}
          <circle cx="0" cy="-7" r="5" fill="#F8D9B8" />
          <circle cx="0" cy="-8" r="4.5" fill="#3E2C20" />
          {/* 방향 표시 — 캐릭터가 보고 있는 쪽에 작은 점 */}
          <circle cx="0" cy="-11" r="1.5" fill="#FF7043" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// =====================================================================
// MiniMap — 우상단 작은 카드 (전체 경로/포인트/플레이어)
// =====================================================================

const MINI_W = 110;
const MINI_H = 86;

function MiniMap({
  playerPos,
  visited,
}: {
  playerPos: Vec;
  visited: Set<string>;
}) {
  const sx = MINI_W / MAP_W;
  const sy = MINI_H / MAP_H;
  return (
    <div className="bg-white/85 backdrop-blur rounded-xl p-1.5 shadow-soft border border-white/60">
      <p className="text-[8px] font-bold text-[#9A8778] mb-0.5 tracking-wide px-0.5">
        오늘의 경로
      </p>
      <svg
        width={MINI_W}
        height={MINI_H}
        viewBox={`0 0 ${MINI_W} ${MINI_H}`}
        className="block rounded-lg bg-[#F4F0E1]"
      >
        {/* 경로 */}
        <path
          d={ROAD_PATH}
          stroke="#D6C49E"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          transform={`scale(${sx} ${sy})`}
        />
        {/* 포인트 */}
        {missionPoints.map((p) => {
          const cx = p.position.x * sx;
          const cy = p.position.y * sy;
          const v = visited.has(p.id);
          const isHospital = p.id === "hospital";
          return (
            <circle
              key={p.id}
              cx={cx}
              cy={cy}
              r={isHospital ? 3.5 : 2.5}
              fill={
                isHospital ? "#E55A30" : v ? "#7BB57F" : "#FFFFFF"
              }
              stroke="#5A4630"
              strokeWidth="0.4"
            />
          );
        })}
        {/* 플레이어 */}
        <circle
          cx={playerPos.x * sx}
          cy={playerPos.y * sy}
          r="2.5"
          fill="#FF7043"
          stroke="white"
          strokeWidth="0.8"
        />
        <circle
          cx={playerPos.x * sx}
          cy={playerPos.y * sy}
          r="5"
          fill="#FF7043"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}

// =====================================================================
// ControlPad — 모바일 D-pad (4방향). 키보드와 동일하게 입력 활성화.
// =====================================================================

function ControlPad({
  onPress,
  onRelease,
}: {
  onPress: (dir: Direction) => void;
  onRelease: (dir: Direction) => void;
}) {
  const btnBase =
    "w-11 h-11 rounded-2xl bg-white/85 backdrop-blur shadow-soft border border-white/70 " +
    "text-[#3E2C20] text-lg font-bold flex items-center justify-center active:bg-[#FF7043] active:text-white " +
    "select-none touch-none";

  // pointer 이벤트로 키 누름/뗌 시뮬레이션
  const bind = (dir: Direction) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      onPress(dir);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      onRelease(dir);
    },
    onPointerCancel: () => onRelease(dir),
    onPointerLeave: () => onRelease(dir),
  });

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[148px] h-[148px]">
      <div />
      <button type="button" className={btnBase} aria-label="위로" {...bind("up")}>
        ▲
      </button>
      <div />
      <button
        type="button"
        className={btnBase}
        aria-label="왼쪽"
        {...bind("left")}
      >
        ◀
      </button>
      <div className="w-11 h-11 rounded-2xl bg-white/40 border border-white/40" />
      <button
        type="button"
        className={btnBase}
        aria-label="오른쪽"
        {...bind("right")}
      >
        ▶
      </button>
      <div />
      <button
        type="button"
        className={btnBase}
        aria-label="아래로"
        {...bind("down")}
      >
        ▼
      </button>
      <div />
    </div>
  );
}

// =====================================================================
// EventCard — 포인트별 정보/질문/대화 카드 (하단 슬라이드업)
// =====================================================================

function EventCard({
  point,
  selectedAnswer,
  npcReply,
  onAnswer,
  onPickNpc,
  onClose,
  onComplete,
}: {
  point: MissionPoint;
  selectedAnswer?: string;
  npcReply: string | null;
  onAnswer: (option: string) => void;
  onPickNpc: (option: string) => void;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="absolute left-0 right-0 bottom-0 z-30
                 bg-white rounded-t-3xl shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.3)]
                 pt-1 pb-[max(env(safe-area-inset-bottom),16px)]"
    >
      <div className="mx-auto mt-2 mb-2 h-1.5 w-10 rounded-full bg-[#E6DCC4]" />

      <div className="px-5 max-h-[48vh] overflow-y-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF3EE] text-[#FF7043] text-[10px] font-extrabold">
            <span aria-hidden>{point.icon}</span>
            {point.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="ml-auto w-7 h-7 rounded-full hover:bg-[#FAF6EB]
                       text-[#9A8778] text-base"
          >
            ✕
          </button>
        </div>

        <h3 className="mt-2 text-[18px] font-extrabold text-[#3E2C20] leading-tight">
          {point.title}
        </h3>

        {point.description && (
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#6B5446]">
            {point.description}
          </p>
        )}

        {/* 생활 정보 */}
        {point.info && point.info.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {point.info.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 text-[13px] text-[#3E2C20]"
              >
                <span className="text-[#7BB57F] mt-0.5">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}

        {/* 최종 결과 (병원) */}
        {point.result && (
          <div className="mt-3 bg-gradient-to-br from-[#EFF6E8] to-[#E8F0F4] rounded-xl p-3">
            <p className="text-[10px] font-bold text-[#6B7E5F] mb-1.5">
              오늘 걸은 길의 기록
            </p>
            <ul className="space-y-1 text-[12px] text-[#3E2C20]">
              {point.result.map((line) => (
                <li key={line} className="flex items-start gap-1.5">
                  <span className="text-[#7BB57F] mt-0.5">·</span>
                  <span className="font-semibold">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* NPC 대화창 */}
        {point.type === "npc" && point.dialogue && point.options && (
          <div className="mt-3 bg-[#FFF8E9] border border-[#F3E6B5] rounded-2xl p-3.5">
            <p className="text-[10px] font-bold text-[#B8973F]">
              👵 {point.name}
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#3E2C20]">
              "{npcReply ?? point.dialogue}"
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {point.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onPickNpc(opt)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold
                             bg-white text-[#5A4630] border border-[#F3E6B5]
                             active:scale-[0.98]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 일반 질문 (place 외) */}
        {point.type !== "npc" && point.question && point.options && (
          <div className="mt-3">
            <p className="text-[13px] font-bold text-[#3E2C20]">
              {point.question}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {point.options.map((opt) => {
                const isPicked = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onAnswer(opt)}
                    className={`px-3 py-2 rounded-full text-[12px] font-bold transition
                      border ${
                        isPicked
                          ? "bg-[#7BB57F] text-white border-[#7BB57F]"
                          : "bg-white text-[#6B5446] border-[#E6DCC4]"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 — 종류에 따라 다르게 */}
      <div className="px-5 pt-3">
        {point.type === "complete" ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={!selectedAnswer}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7043] to-[#FF8A5C]
                       text-white text-[15px] font-extrabold shadow-soft
                       active:scale-[0.99] transition
                       disabled:opacity-50 disabled:active:scale-100"
          >
            🎉 미션 완료하기
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7BB57F] to-[#66A56A]
                       text-white text-[15px] font-extrabold shadow-soft
                       active:scale-[0.99] transition"
          >
            계속 걷기 →
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =====================================================================
// CompletionCard — 미션 완료 오버레이
// =====================================================================

function CompletionCard({
  finalAnswer,
  onRestart,
  onExit,
}: {
  finalAnswer?: string;
  onRestart: () => void;
  onExit?: () => void;
}) {
  const hospital = missionPoints.find((p) => p.id === "hospital")!;
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/55 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* 중앙 정렬 wrapper — framer-motion transform이 -translate를 덮어쓰는 충돌 회피 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[88%] max-w-[360px]">
      <motion.div
        role="dialog"
        aria-label="미션 완료"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        className="bg-white rounded-3xl p-6
                   shadow-[0_24px_48px_-12px_rgba(80,70,40,0.4)] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 12 }}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#A8D5A8] to-[#7BB57F]
                     flex items-center justify-center text-3xl text-white shadow-soft"
          aria-hidden
        >
          ✓
        </motion.div>

        <h2 className="mt-4 text-[19px] font-extrabold text-[#3E2C20] leading-snug">
          병원 가보기 미션을 완료했어요.
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B5446]">
          {REGION}에서의 생활 현실성을 하나 더 확인했습니다.
          <br />
          나의 여정에 기록되었습니다.
        </p>

        <div className="mt-4 bg-[#F4F0E1] rounded-xl p-3 text-left">
          <p className="text-[10px] font-bold text-[#9A8778] mb-1.5">결과 정보</p>
          <ul className="space-y-1 text-[12px] text-[#3E2C20]">
            {hospital.result?.map((line) => (
              <li key={line}>· {line}</li>
            ))}
            {finalAnswer && (
              <li className="text-[#FF7043] font-extrabold">
                나의 체감: {finalAnswer}
              </li>
            )}
          </ul>
        </div>

        <button
          type="button"
          onClick={onExit ?? onRestart}
          className="mt-5 w-full py-3 rounded-2xl bg-[#FF7043] text-white text-[15px] font-extrabold
                     active:scale-[0.99] shadow-soft transition"
        >
          {onExit ? "미션 리스트로 돌아가기" : "나의 여정에 기록하기"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="mt-2 w-full py-2.5 rounded-2xl bg-white text-[#6B5446] text-[13px] font-bold
                     border border-[#E6DCC4]"
        >
          다시 걸어보기
        </button>
      </motion.div>
      </div>
    </>
  );
}

// =====================================================================
// 메인 — 게임 루프, 입력, 카메라, 이벤트 트리거
// =====================================================================

type HospitalMissionScreenProps = {
  // 미션을 나가서 도착 화면(또는 호출처)으로 돌아갈 때
  onExit?: () => void;
};

export default function HospitalMissionScreen({
  onExit,
}: HospitalMissionScreenProps = {}) {
  // ----- 상태 -----
  const [player, setPlayer] = useState<{
    x: number;
    y: number;
    direction: Direction;
    isMoving: boolean;
  }>(() => ({
    x: missionPoints[0].position.x + 10,
    y: missionPoints[0].position.y + 40, // 레지던스 살짝 앞에서 시작
    direction: "up",
    isMoving: false,
  }));

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [npcReply, setNpcReply] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // ----- refs -----
  // 방향키 활성 상태 (RAF 안에서 읽음 — ref로 두어 effect 재실행 방지)
  const activeKeys = useRef<Record<Direction, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  // 카메라 viewport 사이즈 측정
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: 375, h: 600 });

  // ----- 입력: 키보드 -----
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };
    const onDown = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        activeKeys.current[dir] = true;
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) activeKeys.current[dir] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // ----- viewport 사이즈 측정 -----
  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setViewport({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ----- 게임 루프: requestAnimationFrame 으로 캐릭터 이동 -----
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 32);
      last = now;
      const a = activeKeys.current;
      let dx = 0;
      let dy = 0;
      if (a.up) dy -= 1;
      if (a.down) dy += 1;
      if (a.left) dx -= 1;
      if (a.right) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const norm = Math.hypot(dx, dy);
        const nx = (dx / norm) * PLAYER_SPEED * dt;
        const ny = (dy / norm) * PLAYER_SPEED * dt;
        const newDir: Direction =
          Math.abs(dx) > Math.abs(dy)
            ? dx < 0
              ? "left"
              : "right"
            : dy < 0
            ? "up"
            : "down";
        setPlayer((p) => ({
          x: clamp(p.x + nx, PLAYER_HALF, MAP_W - PLAYER_HALF),
          y: clamp(p.y + ny, PLAYER_HALF, MAP_H - PLAYER_HALF),
          direction: newDir,
          isMoving: true,
        }));
      } else {
        setPlayer((p) => (p.isMoving ? { ...p, isMoving: false } : p));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ----- 근접 이벤트 자동 트리거 -----
  // 캐릭터가 미방문 포인트에 PROXIMITY 이내로 들어오면 카드 자동 오픈
  useEffect(() => {
    if (activeId || completed) return;
    for (const p of missionPoints) {
      if (visited.has(p.id)) continue;
      const dx = p.position.x - player.x;
      const dy = p.position.y - player.y;
      if (dx * dx + dy * dy < PROXIMITY * PROXIMITY) {
        setActiveId(p.id);
        setVisited((prev) => new Set(prev).add(p.id));
        setNpcReply(null);
        break;
      }
    }
  }, [player.x, player.y, activeId, visited, completed]);

  // ----- 카메라 위치 (플레이어 중심, 맵 경계 클램프) -----
  const cameraX = clamp(player.x, viewport.w / 2, MAP_W - viewport.w / 2);
  const cameraY = clamp(player.y, viewport.h / 2, MAP_H - viewport.h / 2);
  // 맵이 viewport보다 작으면 단순 가운데 정렬
  const tx =
    MAP_W <= viewport.w
      ? (viewport.w - MAP_W) / 2
      : -cameraX + viewport.w / 2;
  const ty =
    MAP_H <= viewport.h
      ? (viewport.h - MAP_H) / 2
      : -cameraY + viewport.h / 2;

  // ----- 진행률 / 현재 위치명 -----
  const progress = useMemo(() => {
    let max = 0;
    for (const id of visited) {
      const p = missionPoints.find((q) => q.id === id);
      if (p && p.progress > max) max = p.progress;
    }
    return max;
  }, [visited]);

  const closestName = useMemo(() => {
    let best = missionPoints[0];
    let bestD = Infinity;
    for (const p of missionPoints) {
      const d2 =
        (p.position.x - player.x) ** 2 + (p.position.y - player.y) ** 2;
      if (d2 < bestD) {
        bestD = d2;
        best = p;
      }
    }
    return best.name;
  }, [player.x, player.y]);

  // ----- 액션 핸들러 -----
  const activePoint = activeId
    ? missionPoints.find((p) => p.id === activeId) ?? null
    : null;

  const handleAnswer = (option: string) => {
    if (!activePoint) return;
    setAnswers((prev) => ({ ...prev, [activePoint.id]: option }));
  };
  const handlePickNpc = (option: string) => {
    if (!activePoint || !activePoint.replies) return;
    setNpcReply(activePoint.replies[option]);
  };
  const handleClose = () => {
    setActiveId(null);
    setNpcReply(null);
  };
  const handleComplete = () => {
    setCompleted(true);
    setActiveId(null);
  };
  const handleRestart = () => {
    setPlayer({
      x: missionPoints[0].position.x + 10,
      y: missionPoints[0].position.y + 40,
      direction: "up",
      isMoving: false,
    });
    setVisited(new Set());
    setActiveId(null);
    setAnswers({});
    setNpcReply(null);
    setCompleted(false);
  };

  // 포인트 마커 수동 클릭 — 이미 방문한 카드 다시 보기
  const handleMarkerClick = (id: string) => {
    setActiveId(id);
    setNpcReply(null);
  };

  return (
    <div className="relative min-h-screen bg-[#88B6D2] flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen overflow-hidden">
        {/* ===== 게임 viewport (배경) ===== */}
        <div
          ref={viewportRef}
          className="absolute inset-0 overflow-hidden"
          style={{ background: "#88B6D2" }}
        >
          <div
            className="absolute will-change-transform"
            style={{
              width: MAP_W,
              height: MAP_H,
              transform: `translate(${tx}px, ${ty}px)`,
              transition: "transform 60ms linear",
            }}
          >
            <MapBackground />

            {/* 포인트 마커 (NPC 제외) */}
            {missionPoints
              .filter((p) => p.type !== "npc")
              .map((p) => (
                <PointMarker
                  key={p.id}
                  point={p}
                  visited={visited.has(p.id)}
                  isActive={activeId === p.id}
                  onClick={() => handleMarkerClick(p.id)}
                />
              ))}

            {/* NPC */}
            {missionPoints
              .filter((p) => p.type === "npc")
              .map((p) => (
                <NPCFigure
                  key={p.id}
                  point={p}
                  visited={visited.has(p.id)}
                  isActive={activeId === p.id}
                  onClick={() => handleMarkerClick(p.id)}
                />
              ))}

            {/* 플레이어 */}
            <div
              className="absolute"
              style={{
                left: player.x,
                top: player.y,
                transform: "translate(-50%, -50%)",
                willChange: "left, top",
              }}
            >
              <PlayerSprite
                direction={player.direction}
                moving={player.isMoving}
              />
            </div>
          </div>
        </div>

        {/* ===== 상단 헤더 ===== */}
        <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-3 bg-gradient-to-b from-black/40 via-black/15 to-transparent text-white pointer-events-none">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                {SCREEN_TITLE}
              </p>
              <h1 className="mt-0.5 text-[14px] font-extrabold leading-tight">
                {MISSION_TEXT}
              </h1>
            </div>
            <span className="px-2 py-1 rounded-full bg-white/90 text-[#3E2C20] text-[10px] font-extrabold shadow-soft">
              📍 {REGION}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#A8D5A8] to-[#FFFFFF]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1 text-[10px] opacity-90">
                진행률 {progress}% · 현재 위치: {closestName}
              </p>
            </div>
          </div>
        </header>

        {/* ===== 미니맵 (우상단) ===== */}
        <div className="absolute right-3 top-[88px] z-20">
          <MiniMap playerPos={player} visited={visited} />
        </div>

        {/* ===== 좌상단 버튼 — onExit 있으면 나가기, 없으면 처음으로 ===== */}
        <div className="absolute left-3 top-[88px] z-20 flex gap-1.5">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur
                         text-[#3E2C20] text-[10px] font-extrabold
                         shadow-soft border border-white/60"
            >
              ← 나가기
            </button>
          )}
          <button
            type="button"
            onClick={handleRestart}
            className="px-2.5 py-1.5 rounded-full bg-white/85 backdrop-blur
                       text-[#6B5446] text-[10px] font-bold
                       shadow-soft border border-white/60"
          >
            ↺ 처음으로
          </button>
        </div>

        {/* ===== 컨트롤러 안내 (조작 힌트, 처음에만) ===== */}
        {visited.size === 0 && !activeId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-44 z-20 pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-soft text-[11px] font-bold text-[#5A4630]">
              방향키 / WASD · 모바일은 오른쪽 패드로 이동해요
            </div>
          </motion.div>
        )}

        {/* ===== 컨트롤 패드 (모바일/터치) ===== */}
        {!activeId && !completed && (
          <div className="absolute right-3 bottom-4 z-20">
            <ControlPad
              onPress={(d) => (activeKeys.current[d] = true)}
              onRelease={(d) => (activeKeys.current[d] = false)}
            />
          </div>
        )}

        {/* ===== 이벤트 카드 ===== */}
        <AnimatePresence>
          {activePoint && !completed && (
            <EventCard
              point={activePoint}
              selectedAnswer={answers[activePoint.id]}
              npcReply={npcReply}
              onAnswer={handleAnswer}
              onPickNpc={handlePickNpc}
              onClose={handleClose}
              onComplete={handleComplete}
            />
          )}
        </AnimatePresence>

        {/* ===== 완료 오버레이 ===== */}
        <AnimatePresence>
          {completed && (
            <CompletionCard
              finalAnswer={answers["hospital"]}
              onRestart={handleRestart}
              onExit={onExit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
