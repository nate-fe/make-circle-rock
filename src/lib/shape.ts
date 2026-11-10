import { seeded } from "./rng";
import { colorById } from "./colors";

// 돌 좌표계 (SVG viewBox 기준)
export const VB_W = 300;
export const VB_H = 320;
export const CX = 150;
export const CY = 170;
export const R = 100;

const N = 48;
const HALF = R * 0.9; // 네모 반변. 원과 바운딩 박스가 크게 다르지 않게
const ROUGH = 12;

type Pt = { x: number; y: number };

export type Texture = {
  cracks: Pt[][];
  dots: { x: number; y: number; r: number }[];
  stains: { x: number; y: number; rx: number; ry: number; rot: number }[];
};

export type RockShape = {
  path: string;
  e: number; // easeInOut(t)
  tilt: number; // 도 단위, 현재 기울기
  box: { minX: number; minY: number; maxX: number; maxY: number };
  texture: Texture;
};

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Seeded = {
  noise: number[];
  tilt: number;
  chips: Map<number, number>;
  texture: Texture;
};

const cache = new Map<string, Seeded>();

function seedData(seed: string): Seeded {
  const hit = cache.get(seed);
  if (hit) return hit;
  const rnd = seeded("rock:" + seed);

  // 저주파 울퉁불퉁 + 점마다 잔떨림. 같은 변이 톱니처럼 보이지 않게.
  const anchors = Array.from({ length: 8 }, () => rnd() * 2 - 1);
  const noise: number[] = [];
  for (let i = 0; i < N; i++) {
    const f = (i / N) * 8;
    const a = Math.floor(f);
    const k = f - a;
    const s = k * k * (3 - 2 * k);
    const low = anchors[a % 8] * (1 - s) + anchors[(a + 1) % 8] * s;
    noise.push(Math.max(-1, Math.min(1, low * 0.75 + (rnd() * 2 - 1) * 0.35)));
  }

  // 이 빠진 모서리 2~3곳
  const chips = new Map<number, number>();
  const corners = [6, 18, 30, 42].sort(() => rnd() - 0.5);
  const chipCount = 2 + Math.floor(rnd() * 2);
  for (let c = 0; c < chipCount; c++) {
    const idx = corners[c];
    const depth = 14 + rnd() * 12;
    const lean = rnd() < 0.5 ? -1 : 1;
    chips.set(idx, depth);
    chips.set((idx + lean + N) % N, depth * 0.55);
  }

  const tilt = (rnd() * 2 - 1) * 5;

  // 질감: 금(짧은 꺾은선), 거친 점, 얼룩
  const cracks: Pt[][] = [];
  const crackCount = 2 + Math.floor(rnd() * 2);
  for (let c = 0; c < crackCount; c++) {
    let x = CX + (rnd() * 2 - 1) * HALF * 0.7;
    let y = CY + (rnd() * 2 - 1) * HALF * 0.7;
    // 얼굴(눈·입) 영역은 피한다
    if (Math.abs(x - CX) < 45 && y > CY - 30 && y < CY + 20) y += y < CY ? -40 : 40;
    let ang = rnd() * Math.PI * 2;
    const line: Pt[] = [{ x, y }];
    const segs = 3 + Math.floor(rnd() * 2);
    for (let s = 0; s < segs; s++) {
      ang += (rnd() * 2 - 1) * 0.9;
      const len = 7 + rnd() * 9;
      x += Math.cos(ang) * len;
      y += Math.sin(ang) * len;
      line.push({ x, y });
    }
    cracks.push(line);
  }
  const dots = Array.from({ length: 10 + Math.floor(rnd() * 6) }, () => ({
    x: CX + (rnd() * 2 - 1) * HALF * 0.85,
    y: CY + (rnd() * 2 - 1) * HALF * 0.85,
    r: 0.9 + rnd() * 1.6,
  }));
  // 얼룩은 가장자리 쪽에만. 얼굴·이름 위에 생기면 지저분해 보인다.
  const stains = Array.from({ length: 2 + Math.floor(rnd() * 2) }, () => {
    const a = rnd() * Math.PI * 2;
    const d = HALF * (0.55 + rnd() * 0.25);
    return {
      x: CX + Math.cos(a) * d,
      y: CY + Math.sin(a) * d * 0.9,
      rx: 9 + rnd() * 12,
      ry: 6 + rnd() * 8,
      rot: rnd() * 180,
    };
  });

  const data = { noise, tilt, chips, texture: { cracks, dots, stains } };
  cache.set(seed, data);
  return data;
}

function points(seed: string, t: number): { pts: Pt[]; e: number; tilt: number } {
  const { noise, tilt, chips } = seedData(seed);
  const e = easeInOut(Math.max(0, Math.min(1, t)));
  const rough = 1 - e;
  const rot = (tilt * rough * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const pts: Pt[] = [];
  for (let i = 0; i < N; i++) {
    const th = (2 * Math.PI * i) / N - Math.PI / 2;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const m = Math.max(Math.abs(c), Math.abs(s));
    const sx = (c / m) * HALF;
    const sy = (s / m) * HALF;
    // 네모의 법선 (변에 수직)
    const nx = Math.abs(c) >= Math.abs(s) ? Math.sign(c) : 0;
    const ny = Math.abs(c) >= Math.abs(s) ? 0 : Math.sign(s);
    const chip = chips.get(i) ?? 0;
    const off = (noise[i] * ROUGH - chip) * rough;
    let x = sx + (c * R - sx) * e + nx * off;
    let y = sy + (s * R - sy) * e + ny * off;
    // 모서리 이 빠짐은 대각선 안쪽으로
    if (chip) {
      x -= c * chip * 0.4 * rough;
      y -= s * chip * 0.4 * rough;
    }
    pts.push({ x: CX + x * cos - y * sin, y: CY + x * sin + y * cos });
  }
  return { pts, e, tilt: tilt * rough };
}

const f = (n: number) => Math.round(n * 10) / 10;

/** Catmull-Rom 장력을 e로 조절: 0이면 직선(각짐), 1이면 매끈한 곡선. */
export function pathFrom(pts: Pt[], e: number): string {
  const k = e / 6;
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    const p3 = pts[(i + 2) % pts.length];
    if (k < 0.001) {
      d += `L${f(p2.x)} ${f(p2.y)}`;
    } else {
      const c1x = p1.x + (p2.x - p0.x) * k;
      const c1y = p1.y + (p2.y - p0.y) * k;
      const c2x = p2.x - (p3.x - p1.x) * k;
      const c2y = p2.y - (p3.y - p1.y) * k;
      d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
    }
  }
  return d + "Z";
}

/** 순수 함수: (날짜 시드, 둥글기) → 외곽선과 메타. 메인·진열장·사진 모두 이걸 쓴다. */
export function rockShape(seed: string, t: number): RockShape {
  const { pts, e, tilt } = points(seed, t);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    path: pathFrom(pts, e),
    e,
    tilt,
    box: { minX, minY, maxX, maxY },
    texture: seedData(seed).texture,
  };
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** colorId: 기본 색 id 또는 직접 고른 "#rrggbb" */
export function rockColors(t: number, colorId?: string) {
  const c = colorById(colorId);
  const light = mix(c.rough[0], c.round[0], t);
  const dark = mix(c.rough[1], c.round[1], t);
  return { light, dark, engrave: mix(mix(light, dark, 0.5), "#000000", 0.32), mid: mix(light, dark, 0.5) };
}
