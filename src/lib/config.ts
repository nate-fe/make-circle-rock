// 수치 표 (기획서 6.3, 6.8, 6.9)

export const RUB_PER_LEVEL = 300;
export const RUB_DISTANCE = 32; // px 이동마다 1회
export const MAX_RUB_PER_MOVE = 4;
/** 아무리 빨리 문질러도 1초에 이만큼만 센다 (Lv.9 = 2,700번 → 최소 3분 45초) */
export const MAX_RUB_PER_SEC = 12;

/** 광고 치트키: 광고 15초 보면 10초간 문지름 2배 */
export const CHEAT = {
  adSeconds: 15,
  boostMs: 10_000,
  multiplier: 2,
  offersPerDay: 5, // 제안 카드가 하루에 뜨는 최대 횟수
  minLevel: 1, // 이 레벨을 넘긴 뒤부터 제안
  checkEveryMs: 25_000, // 이 간격마다
  chance: 0.6, // 이 확률로 등장
  offerRubs: 100, // 안 누르면 나타난 뒤 이만큼 문지르는 동안 떠 있다가 사라짐
} as const;
export const MAX_LEVEL_CAP = 16;
export const NAME_MAX = 6;
export const DEFAULT_NAME = "돌쇠";
export const STORAGE_KEY = "toegeun-dol-v3";
/** 만든 사람. 메인 화면 아래, 사진 맨 아래 줄에 들어간다 */
export const CREDIT = "@yoonzeen";

export const REWARD = {
  start: 20,
  levelUp: 1,
  done: 5,
  stamp: 20,
  promote: 30,
} as const;

export const RANKS = [
  { name: "인턴", need: 0 },
  { name: "사원", need: 5 },
  { name: "대리", need: 20 },
  { name: "과장", need: 50 },
  { name: "차장", need: 100 },
  { name: "부장", need: 200 },
  { name: "임원", need: 365 },
] as const;

export function rankIndexFor(doneCount: number): number {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (doneCount >= r.need) idx = i;
  });
  return idx;
}

export const STAGES = [
  { at: 0, name: "네모돌" },
  { at: 0.2, name: "모난돌" },
  { at: 0.4, name: "각진돌" },
  { at: 0.6, name: "조약돌" },
  { at: 0.8, name: "몽돌" },
  { at: 1, name: "퇴근돌" },
] as const;

export function stageName(t: number): string {
  let name: string = STAGES[0].name;
  for (const s of STAGES) if (t >= s.at - 1e-9) name = s.name;
  return name;
}

export const COLORS = {
  paper: "#f2ede3",
  card: "#fffdf8",
  ink: "#2b2824",
  orange: "#e0643a",
  green: "#3a7d6b",
  gold: "#d6a224",
  rockLine: "#5f584f",
};
