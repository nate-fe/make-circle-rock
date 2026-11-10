import type { ReactNode } from "react";
import type { Slot } from "./types";

/** 아이템이 그려질 때 받는 돌 정보 (SVG 좌표) */
export type Geo = {
  cx: number;
  cy: number;
  box: { minX: number; minY: number; maxX: number; maxY: number };
  name: string;
};

export type Item = {
  id: string;
  name: string;
  price: number;
  slot: Slot;
  rank: number; // 해금 직급 인덱스
  desc: string;
  line: string;
  layer?: "back" | "front";
  draw: (g: Geo) => ReactNode;
};

export const SLOT_LABEL: Record<Slot, string> = {
  head: "머리",
  face: "얼굴",
  body: "몸",
  left: "왼쪽",
  right: "오른쪽",
  floor: "바닥",
};

const INK = "#3a342e";
const sw = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// 슬롯 기준점
const headY = (g: Geo) => g.box.minY + 8;
const faceY = (g: Geo) => g.cy - 12;
const bodyY = (g: Geo) => g.cy + 30;
const sideY = (g: Geo) => g.cy + 26;
const leftX = (g: Geo) => g.box.minX + 2;
const rightX = (g: Geo) => g.box.maxX - 2;

export const ITEMS: Item[] = [
  // ───────── 인턴 ─────────
  {
    id: "badge",
    name: "사원증",
    price: 30,
    slot: "right",
    rank: 0,
    desc: "이게 있어야 출입이 돼요",
    line: "삑. 출입 승인.",
    draw: (g) => {
      const x = rightX(g);
      const y = sideY(g);
      return (
        <g transform={`translate(${x} ${y}) rotate(8)`}>
          <path d="M-6 -44 Q0 -34 6 -44" fill="none" stroke="#3a7d6b" strokeWidth={3} />
          <rect x={-20} y={-30} width={40} height={54} rx={5} fill="#fffdf8" {...sw} />
          <rect x={-20} y={-30} width={40} height={13} rx={5} fill="#3a7d6b" {...sw} />
          <rect x={-5} y={-36} width={10} height={9} rx={2} fill="#d8d2c6" {...sw} />
          <rect x={-11} y={-11} width={22} height={18} rx={3} fill="#e6dccb" {...sw} strokeWidth={1.5} />
          <circle cx={0} cy={-4} r={4} fill="#b9ad98" />
          <path d="M-7 5 Q0 -2 7 5" fill="#b9ad98" />
          <path d="M-12 13 H12 M-8 18 H8" {...sw} strokeWidth={1.6} />
        </g>
      );
    },
  },
  {
    id: "iced",
    name: "아아 한 잔",
    price: 40,
    slot: "left",
    rank: 0,
    desc: "직장인의 수혈",
    line: "얼음 다 녹기 전에 퇴근하고 싶다.",
    draw: (g) => {
      const x = leftX(g);
      const y = sideY(g);
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M6 -40 L12 -58" stroke="#e0643a" strokeWidth={4} strokeLinecap="round" />
          <path d="M-20 -36 L20 -36 L15 28 Q0 33 -15 28 Z" fill="#f4efe6" fillOpacity={0.85} {...sw} />
          <path d="M-18.2 -14 L18.2 -14 L15 26 Q0 31 -15 26 Z" fill="#6b4630" />
          <rect x={-12} y={-24} width={11} height={11} rx={2} fill="#eaf3f2" stroke="#9cc0bb" strokeWidth={1.4} transform="rotate(-12 -6 -18)" />
          <rect x={2} y={-20} width={10} height={10} rx={2} fill="#eaf3f2" stroke="#9cc0bb" strokeWidth={1.4} transform="rotate(14 7 -15)" />
          <rect x={-23} y={-41} width={46} height={7} rx={3} fill="#fffdf8" {...sw} />
          <path d="M-9 0 V18" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "tie",
    name: "넥타이",
    price: 60,
    slot: "body",
    rank: 0,
    desc: "매는 순간 목이 조여와요",
    line: "넥타이 풀면 퇴근인 거죠?",
    draw: (g) => {
      const y = bodyY(g) - 14;
      return (
        <g transform={`translate(${g.cx} ${y}) scale(0.82)`}>
          <path d="M-7 0 L7 0 L5 8 L-5 8 Z" fill="#2f4b7a" {...sw} />
          <path d="M-5 8 L5 8 L9 24 L0 32 L-9 24 Z" fill="#3c5d94" {...sw} />
          <path d="M-6 15 L7 12 M-7.5 21 L8 18" stroke="#c9d6ec" strokeWidth={2} />
        </g>
      );
    },
  },
  {
    id: "shades",
    name: "선글라스",
    price: 100,
    slot: "face",
    rank: 0,
    desc: "모니터 블루라이트 차단(아님)",
    line: "아무도 제 눈빛을 읽을 수 없어요.",
    draw: (g) => {
      const y = faceY(g);
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-46 -6 L-40 -8 M46 -6 L40 -8" {...sw} />
          <path d="M-40 -9 H-8 Q-6 10 -24 11 Q-40 10 -40 -9 Z" fill="#2b2824" {...sw} />
          <path d="M40 -9 H8 Q6 10 24 11 Q40 10 40 -9 Z" fill="#2b2824" {...sw} />
          <path d="M-8 -6 Q0 -10 8 -6" fill="none" {...sw} />
          <path d="M-34 -5 L-26 -5 M14 -5 L22 -5" stroke="#fff" strokeOpacity={0.55} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "hardhat",
    name: "안전모",
    price: 150,
    slot: "head",
    rank: 0,
    desc: "업무 폭탄 대비용",
    line: "오늘도 무사고 기원.",
    draw: (g) => {
      const y = headY(g);
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-42 -4 Q-42 -46 0 -48 Q42 -46 42 -4 Z" fill="#f2c230" {...sw} />
          <path d="M-8 -47 Q-10 -26 -10 -4 M8 -47 Q10 -26 10 -4" fill="none" stroke="#c99a12" strokeWidth={2} />
          <rect x={-56} y={-8} width={112} height={10} rx={5} fill="#f2c230" {...sw} />
          <path d="M-30 -30 Q-26 -38 -18 -40" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "crown",
    name: "왕관",
    price: 400,
    slot: "head",
    rank: 0,
    desc: "인턴이지만 마음만은 왕",
    line: "짐은 퇴근하겠노라.",
    draw: (g) => {
      const y = headY(g);
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-40 0 L-46 -40 L-22 -20 L0 -50 L22 -20 L46 -40 L40 0 Z" fill="#e2b43a" {...sw} />
          <rect x={-42} y={-6} width={84} height={10} rx={3} fill="#c99a22" {...sw} />
          <circle cx={0} cy={-1} r={4} fill="#e0643a" {...sw} strokeWidth={1.5} />
          <circle cx={-24} cy={-1} r={3} fill="#3a7d6b" {...sw} strokeWidth={1.5} />
          <circle cx={24} cy={-1} r={3} fill="#3a7d6b" {...sw} strokeWidth={1.5} />
          <circle cx={0} cy={-52} r={4} fill="#fff4cf" {...sw} strokeWidth={1.5} />
          <circle cx={-46} cy={-42} r={3.5} fill="#fff4cf" {...sw} strokeWidth={1.5} />
          <circle cx={46} cy={-42} r={3.5} fill="#fff4cf" {...sw} strokeWidth={1.5} />
        </g>
      );
    },
  },

  // ───────── 대리 ─────────
  {
    id: "headphones",
    name: "노캔 헤드폰",
    price: 200,
    slot: "face",
    rank: 2,
    desc: "부르는 소리 차단",
    line: "네? 뭐라고요? 안 들려요~",
    draw: (g) => {
      const y = faceY(g);
      const l = g.box.minX + 2;
      const r = g.box.maxX - 2;
      const top = g.box.minY - 6;
      return (
        <g>
          <path d={`M${l} ${y - 2} Q${l - 4} ${top} ${g.cx} ${top} Q${r + 4} ${top} ${r} ${y - 2}`} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d={`M${l} ${y - 2} Q${l - 4} ${top} ${g.cx} ${top} Q${r + 4} ${top} ${r} ${y - 2}`} fill="none" stroke="#4d5a66" strokeWidth={5} strokeLinecap="round" />
          <rect x={l - 14} y={y - 20} width={22} height={38} rx={10} fill="#4d5a66" {...sw} />
          <rect x={r - 8} y={y - 20} width={22} height={38} rx={10} fill="#4d5a66" {...sw} />
          <rect x={l - 9} y={y - 12} width={8} height={22} rx={4} fill="#e0643a" />
          <rect x={r + 1} y={y - 12} width={8} height={22} rx={4} fill="#e0643a" />
        </g>
      );
    },
  },
  {
    id: "postits",
    name: "포스트잇 덕지덕지",
    price: 150,
    slot: "body",
    rank: 2,
    desc: "할 일이 몸에 붙었어요",
    line: "이거 다 오늘까지래요…",
    draw: (g) => {
      const y = bodyY(g);
      const note = (x: number, yy: number, rot: number, fill: string) => (
        <g transform={`translate(${x} ${yy}) rotate(${rot})`}>
          <path d="M-10 -10 H10 V6 L6 10 H-10 Z" fill={fill} {...sw} strokeWidth={1.5} />
          <path d="M-6 -4 H6 M-6 1 H3" stroke={INK} strokeOpacity={0.5} strokeWidth={1.2} />
        </g>
      );
      return (
        <g>
          {note(g.cx - 42, y - 8, -14, "#ffe27a")}
          {note(g.cx + 36, y - 12, 12, "#ffb4a2")}
          {note(g.cx - 4, y - 6, 4, "#bfe3c0")}
          {note(g.cx + 60, y + 6, -8, "#ffe27a")}
        </g>
      );
    },
  },
  {
    id: "laptop",
    name: "노트북",
    price: 250,
    slot: "right",
    rank: 2,
    desc: "퇴근해도 따라오는 그것",
    line: "덮으면 퇴근, 열면 야근.",
    draw: (g) => {
      const x = rightX(g);
      const y = sideY(g) + 14;
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M-22 0 L-26 -38 L26 -42 L24 -2 Z" fill="#9aa3ab" {...sw} />
          <path d="M-20 -5 L-23 -34 L22 -37 L20 -6 Z" fill="#3e5566" />
          <path d="M-15 -26 H5 M-15 -19 H12 M-15 -12 H0" stroke="#9fd0c3" strokeWidth={2} strokeLinecap="round" />
          <path d="M-32 0 H30 L26 8 H-28 Z" fill="#c4cbd1" {...sw} />
        </g>
      );
    },
  },

  // ───────── 과장 ─────────
  {
    id: "readers",
    name: "돋보기 안경",
    price: 350,
    slot: "face",
    rank: 3,
    desc: "보고서 오타 찾기 전문",
    line: "여기 띄어쓰기 틀렸네요.",
    draw: (g) => {
      const y = faceY(g);
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <circle cx={-24} cy={0} r={16} fill="#eaf3f2" fillOpacity={0.35} stroke="#9a7428" strokeWidth={2.6} />
          <circle cx={24} cy={0} r={16} fill="#eaf3f2" fillOpacity={0.35} stroke="#9a7428" strokeWidth={2.6} />
          <path d="M-8 -2 Q0 -8 8 -2 M-40 -2 L-50 -6 M40 -2 L50 -6" fill="none" stroke="#9a7428" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M-32 -8 Q-28 -12 -22 -12 M16 -8 Q20 -12 26 -12" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "clipboard",
    name: "결재판",
    price: 400,
    slot: "right",
    rank: 3,
    desc: "올리고 또 올리고",
    line: "결재 올렸어요. 반려됐어요.",
    draw: (g) => {
      const x = rightX(g);
      const y = sideY(g);
      return (
        <g transform={`translate(${x} ${y}) rotate(6)`}>
          <rect x={-22} y={-30} width={44} height={58} rx={4} fill="#3f5b4f" {...sw} />
          <rect x={-17} y={-22} width={34} height={46} rx={1} fill="#fffdf8" {...sw} strokeWidth={1.5} />
          <rect x={-9} y={-35} width={18} height={9} rx={3} fill="#bfc4c8" {...sw} />
          <path d="M-12 -12 H12 M-12 -6 H8 M-12 0 H10" stroke={INK} strokeOpacity={0.45} strokeWidth={1.4} />
          <rect x={-1} y={6} width={13} height={13} fill="none" stroke="#e0643a" strokeWidth={1.5} />
          <circle cx={5.5} cy={12.5} r={4} fill="none" stroke="#e0643a" strokeWidth={1.8} />
        </g>
      );
    },
  },
  {
    id: "tonic",
    name: "피로회복제",
    price: 300,
    slot: "left",
    rank: 3,
    desc: "오후 3시의 친구",
    line: "한 병 더 마시면 야근 각.",
    draw: (g) => {
      const x = leftX(g);
      const y = sideY(g) + 6;
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x={-8} y={-44} width={16} height={8} rx={2} fill="#f0c43a" {...sw} />
          <path d="M-6 -36 H6 V-30 Q15 -26 15 -16 V20 Q15 24 11 24 H-11 Q-15 24 -15 20 V-16 Q-15 -26 -6 -30 Z" fill="#7a4a1f" {...sw} />
          <rect x={-13} y={-10} width={26} height={20} fill="#fff4cf" stroke={INK} strokeWidth={1.4} />
          <path d="M-7 -2 L0 -6 L7 -2 L0 4 Z" fill="#e0643a" />
          <path d="M-10 -22 V-14" stroke="#fff" strokeOpacity={0.4} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    },
  },

  // ───────── 차장 ─────────
  {
    id: "cushion",
    name: "등받이 쿠션",
    price: 600,
    slot: "floor",
    rank: 4,
    desc: "허리는 소중하니까",
    line: "허리 펴고 문질러요.",
    layer: "back",
    draw: (g) => {
      const y = g.box.maxY;
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-74 -8 Q-80 -20 -64 -22 Q0 -30 64 -22 Q80 -20 74 -8 Q80 6 64 10 Q0 18 -64 10 Q-80 6 -74 -8 Z" fill="#8fb3a6" {...sw} />
          <path d="M-60 -6 Q0 2 60 -6" fill="none" stroke="#6e9688" strokeWidth={2} strokeDasharray="4 5" />
          <circle cx={-40} cy={-4} r={2.4} fill="#6e9688" />
          <circle cx={40} cy={-4} r={2.4} fill="#6e9688" />
        </g>
      );
    },
  },
  {
    id: "thermos",
    name: "보온병",
    price: 500,
    slot: "left",
    rank: 4,
    desc: "녹차 우리는 중",
    line: "차 한잔하면서 천천히 퇴근해요.",
    draw: (g) => {
      const x = leftX(g);
      const y = sideY(g);
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M-6 -60 Q-2 -70 4 -64" fill="none" stroke="#b9b3a8" strokeWidth={2} strokeLinecap="round" />
          <path d="M6 -62 Q10 -72 14 -64" fill="none" stroke="#b9b3a8" strokeWidth={2} strokeLinecap="round" />
          <rect x={-14} y={-54} width={28} height={14} rx={3} fill="#2f6b5c" {...sw} />
          <rect x={-15} y={-40} width={30} height={70} rx={8} fill="#c7cdd1" {...sw} />
          <rect x={-15} y={-8} width={30} height={14} fill="#2f6b5c" {...sw} />
          <path d="M-9 -32 V-14" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "phones",
    name: "업무폰 두 대",
    price: 700,
    slot: "right",
    rank: 4,
    desc: "하나는 업무, 하나도 업무",
    line: "둘 다 울려요. 둘 다 못 들은 척.",
    draw: (g) => {
      const x = rightX(g);
      const y = sideY(g);
      const phone = (dx: number, rot: number, color: string) => (
        <g transform={`translate(${dx} 0) rotate(${rot})`}>
          <rect x={-12} y={-24} width={24} height={46} rx={5} fill={color} {...sw} />
          <rect x={-9} y={-19} width={18} height={34} rx={2} fill="#dff0ec" />
          <circle cx={0} cy={18} r={1.6} fill="#fffdf8" />
        </g>
      );
      return (
        <g transform={`translate(${x} ${y})`}>
          {phone(-8, -14, "#4a4f57")}
          {phone(10, 10, "#2b2824")}
          <path d="M26 -30 Q32 -24 26 -18 M32 -34 Q42 -24 32 -14" fill="none" stroke="#e0643a" strokeWidth={2} strokeLinecap="round" />
          <path d="M-26 -32 Q-32 -26 -26 -20" fill="none" stroke="#e0643a" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    },
  },

  // ───────── 부장 ─────────
  {
    id: "golfcap",
    name: "골프 모자",
    price: 900,
    slot: "head",
    rank: 5,
    desc: "주말 일정 있음",
    line: "이번 주말 라운딩 어때요?",
    draw: (g) => {
      const y = headY(g);
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-40 0 Q-42 -42 0 -44 Q38 -42 40 0 Z" fill="#fffdf8" {...sw} />
          <path d="M20 -2 Q50 -10 72 0 Q50 8 20 6 Z" fill="#3a7d6b" {...sw} />
          <rect x={-42} y={-6} width={64} height={8} rx={3} fill="#3a7d6b" {...sw} />
          <circle cx={0} cy={-44} r={4} fill="#3a7d6b" {...sw} strokeWidth={1.5} />
          <circle cx={-10} cy={-22} r={6} fill="none" stroke="#e0643a" strokeWidth={2} />
          <path d="M-13 -22 L-7 -22 M-10 -25 L-10 -19" stroke="#e0643a" strokeWidth={1.4} />
        </g>
      );
    },
  },
  {
    id: "golfclub",
    name: "골프채",
    price: 1100,
    slot: "left",
    rank: 5,
    desc: "사무실 스윙 연습용",
    line: "퇴근도 한 방에. 나이스 샷.",
    draw: (g) => {
      const x = leftX(g) - 6;
      const y = sideY(g);
      return (
        <g transform={`translate(${x} ${y}) rotate(-14)`}>
          <rect x={-5} y={-74} width={10} height={26} rx={4} fill="#2b2824" />
          <path d="M0 -50 V54" stroke="#b9bec4" strokeWidth={4} strokeLinecap="round" />
          <path d="M0 -50 V54" stroke={INK} strokeWidth={1} strokeOpacity={0.4} />
          <path d="M-2 50 Q-20 50 -22 60 Q-20 66 -2 64 Q4 60 2 52 Z" fill="#d7dadd" {...sw} />
          <circle cx={-26} cy={70} r={6} fill="#fffdf8" {...sw} strokeWidth={1.5} />
        </g>
      );
    },
  },
  {
    id: "plant",
    name: "사무실 화분",
    price: 800,
    slot: "floor",
    rank: 5,
    desc: "창가 자리의 상징",
    line: "창가 자리 뷰가 좋네요.",
    layer: "back",
    draw: (g) => {
      const x = g.box.maxX + 6;
      const y = g.box.maxY;
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M0 -40 Q-20 -110 -10 -150 Q8 -110 0 -40" fill="#4f8a6a" {...sw} />
          <path d="M0 -40 Q30 -100 54 -118 Q40 -70 0 -40" fill="#5f9a76" {...sw} />
          <path d="M0 -40 Q-36 -80 -50 -96 Q-30 -50 0 -40" fill="#3f7a5c" {...sw} />
          <path d="M0 -40 Q22 -60 40 -64 Q24 -40 0 -40" fill="#6aa680" {...sw} />
          <path d="M-26 -42 H26 L20 6 H-20 Z" fill="#c76f45" {...sw} />
          <rect x={-29} y={-48} width={58} height={10} rx={3} fill="#d9825a" {...sw} />
        </g>
      );
    },
  },

  // ───────── 임원 ─────────
  {
    id: "goldpin",
    name: "금배지",
    price: 1500,
    slot: "body",
    rank: 6,
    desc: "반짝반짝 임원 배지",
    line: "이제 퇴근 시간은 제가 정합니다.",
    draw: (g) => {
      const x = g.cx + 34;
      const y = bodyY(g) - 4;
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle r={11} fill="#e2b43a" {...sw} />
          <circle r={7} fill="none" stroke="#a87e1a" strokeWidth={1.4} />
          <path d="M0 -5 L1.6 -1.6 L5 -1.4 L2.4 1 L3.2 4.6 L0 2.8 L-3.2 4.6 L-2.4 1 L-5 -1.4 L-1.6 -1.6 Z" fill="#fff4cf" />
          <path d="M14 -12 L16 -16 M17 -8 L21 -9" stroke="#d6a224" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      );
    },
  },
  {
    id: "nameplate",
    name: "명패",
    price: 2000,
    slot: "floor",
    rank: 6,
    desc: "\"상무 {이름}\"이 새겨진 명패",
    line: "상무 {이름}입니다. 다들 퇴근하세요.",
    draw: (g) => {
      const y = g.box.maxY - 4;
      const label = `상무 ${g.name}`;
      const fs = Array.from(label).length > 7 ? 16 : 18;
      return (
        <g transform={`translate(${g.cx} ${y})`}>
          <path d="M-66 18 L-58 -8 H58 L66 18 Z" fill="#6b4630" {...sw} />
          <rect x={-56} y={-10} width={112} height={22} rx={2} fill="#d6a224" {...sw} />
          <text x={0} y={6} textAnchor="middle" fontSize={fs} fill="#5a4210" fontFamily="Gaegu, sans-serif" fontWeight={700} className="font-display">
            {label}
          </text>
        </g>
      );
    },
  },
  {
    id: "chair",
    name: "가죽 의자",
    price: 2500,
    slot: "floor",
    rank: 6,
    desc: "돌을 위한 전용 의자",
    line: "이 의자에 앉으려고 1년을 문질렀어요.",
    layer: "back",
    draw: (g) => {
      const top = g.box.minY - 30;
      const bottom = g.box.maxY;
      const cx = g.cx;
      const w = 118;
      return (
        <g>
          <path d={`M${cx - 30} ${bottom + 10} L${cx - 44} ${bottom + 34} M${cx + 30} ${bottom + 10} L${cx + 44} ${bottom + 34} M${cx} ${bottom + 10} V${bottom + 36}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <rect x={cx - w * 0.82} y={top} width={w * 1.64} height={bottom - top - 10} rx={34} fill="#5a2f22" {...sw} />
          <path d={`M${cx - w * 0.5} ${top + 24} V${bottom - 40} M${cx} ${top + 18} V${bottom - 40} M${cx + w * 0.5} ${top + 24} V${bottom - 40}`} stroke="#43221a" strokeWidth={2} />
          <rect x={cx - w - 6} y={g.cy + 10} width={36} height={18} rx={9} fill="#6e3a2a" {...sw} />
          <rect x={cx + w - 30} y={g.cy + 10} width={36} height={18} rx={9} fill="#6e3a2a" {...sw} />
          <rect x={cx - w * 0.9} y={bottom - 16} width={w * 1.8} height={26} rx={12} fill="#6e3a2a" {...sw} />
        </g>
      );
    },
  },
];

const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export function itemById(id: string): Item | undefined {
  return BY_ID.get(id);
}

export function fillName(text: string, name: string): string {
  return text.replace(/\{이름\}/g, name);
}
