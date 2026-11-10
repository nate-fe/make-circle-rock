/** 돌 색깔. rough = 막 받은 네모돌, round = 다 문지른 퇴근돌. [밝은 쪽, 어두운 쪽] */
export type RockColor = {
  id: string;
  name: string;
  rough: [string, string];
  round: [string, string];
};

export const ROCK_COLORS: RockColor[] = [
  { id: "gray", name: "회색돌", rough: ["#8a8378", "#6f6960"], round: ["#c9c0b0", "#9c9384"] },
  { id: "marble", name: "대리석", rough: ["#a7a29a", "#8a857e"], round: ["#f1ece4", "#cfc8bd"] },
  { id: "sand", name: "사암", rough: ["#a58660", "#86684a"], round: ["#e3c9a0", "#c19e74"] },
  { id: "rose", name: "장미석", rough: ["#9a7b78", "#7c5f5d"], round: ["#e2bdb6", "#c0948d"] },
  { id: "jade", name: "옥돌", rough: ["#6f8a73", "#55705b"], round: ["#a9d1b0", "#7aa786"] },
  { id: "blue", name: "청석", rough: ["#6e7b88", "#56616d"], round: ["#b3c2cf", "#8596a6"] },
  { id: "lavender", name: "자수정", rough: ["#857d93", "#6a6278"], round: ["#c8bedb", "#a093b6"] },
  { id: "basalt", name: "현무암", rough: ["#5d5a58", "#46423f"], round: ["#8d8985", "#5f5b57"] },
];

export const DEFAULT_COLOR = "gray";

/** 직접 고른 색은 "#rrggbb" 그대로 저장한다 */
export function isCustomColor(id: string | undefined): id is string {
  return !!id && /^#[0-9a-f]{6}$/i.test(id);
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/**
 * 고른 색 하나로 돌 팔레트를 만든다.
 * 다 문지른 돌 = 고른 색 그대로. 처음 네모돌 = 돌빛(회갈색)이 섞여 칙칙하고 어둡게.
 */
export function customColor(hex: string): RockColor {
  const h = hex.toLowerCase();
  const roundDark = mix(h, "#2b2824", 0.24);
  const roughLight = mix(mix(h, "#7d776e", 0.6), "#000000", 0.12);
  const roughDark = mix(roughLight, "#000000", 0.2);
  return { id: h, name: "내 색", rough: [roughLight, roughDark], round: [h, roundDark] };
}

export function colorById(id: string | undefined): RockColor {
  if (isCustomColor(id)) return customColor(id);
  return ROCK_COLORS.find((c) => c.id === id) ?? ROCK_COLORS[0];
}
